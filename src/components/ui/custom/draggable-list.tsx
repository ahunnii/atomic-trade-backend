"use client";

import { useState } from "react";

import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createId } from "@paralleldrive/cuid2";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { AddNewItem } from "./add-new-item";
import SortableLinks from "./sortable-link";

// Define the item interface
export interface Item {
  name: string;
  id: string;
  values: string[];
}

type Props = {
  items: Item[];
  setItems: (items: Item[]) => void;
};

export const DraggableList = ({ items, setItems }: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  }

  function handleDelete(idToDelete: string) {
    setItems(items.filter((item) => item.id !== idToDelete));
  }

  const addNewItem = (newItem: string) => {
    const newId = createId();
    setItems([...items, { name: newItem, id: newId, values: [] }]);
  };

  const addValueToItem = (itemId: string, value: string) => {
    if (!value.trim()) return;

    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, values: [...item.values, value.trim()] }
          : item,
      ),
    );
  };

  const removeValueFromItem = (itemId: string, valueToRemove: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, values: item.values.filter((v) => v !== valueToRemove) }
          : item,
      ),
    );
  };

  return (
    <section>
      <AddNewItem addNewItem={addNewItem} />

      {items.length > 0 && (
        <div className="grid h-full w-full gap-4 py-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableLinks
                  key={item.id}
                  id={item}
                  onDelete={handleDelete}
                  onAddValue={(value) => addValueToItem(item.id, value)}
                  onRemoveValue={(value) => removeValueFromItem(item.id, value)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
      {items.length === 0 && (
        <div className="mt-4 flex h-40 w-full items-center justify-center rounded-md border border-dashed p-6">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              No attributes added yet. Click &quot;Add Attribute&quot; to get
              started.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
