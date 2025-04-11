import { useState } from "react";
import { X } from "lucide-react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

interface Item {
  id: string;
  name: string;
  values: string[];
}

interface SortableLinkCardProps {
  id: Item;
  onDelete: (id: string) => void;
  onAddValue: (value: string) => void;
  onRemoveValue: (value: string) => void;
}

const SortableLinks = ({
  id,
  onDelete,
  onAddValue,
  onRemoveValue,
}: SortableLinkCardProps) => {
  const uniqueId = id.id;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: uniqueId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleButtonClick = () => {
    onDelete(uniqueId);
  };

  const isCursorGrabbing = attributes["aria-pressed"];
  const [newValue, setNewValue] = useState("");

  const handleAddValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newValue.trim()) {
      e.preventDefault();
      onAddValue(newValue.trim());
      setNewValue("");
    }
  };

  return (
    <div ref={setNodeRef} style={style} key={uniqueId}>
      <Card className="group relative flex flex-col gap-3 p-4">
        <div className="flex justify-between">
          <div className="font-medium">{id.name}</div>
          <div className="flex items-center justify-center gap-4">
            <button
              className="hidden group-hover:block"
              onClick={handleButtonClick}
              title="Delete"
            >
              <svg
                className="text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <button
              {...attributes}
              {...listeners}
              className={` ${isCursorGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
              aria-describedby={`DndContext-${uniqueId}`}
            >
              <svg viewBox="0 0 20 20" width="15">
                <path
                  d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {id.values.map((value) => (
            <div
              key={value}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {value}
              <button
                onClick={() => onRemoveValue(value)}
                className="ml-1 text-gray-500 hover:text-gray-700"
                title={`Remove ${value}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <Input
          placeholder="Add value (e.g. Red, Blue, etc.)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleAddValue}
          className="mt-2"
        />
      </Card>
    </div>
  );
};

export default SortableLinks;
