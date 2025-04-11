import React from "react";
import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

interface AddNewItemProps {
  addNewItem: (name: string) => void;
}

export function AddNewItem({ addNewItem }: AddNewItemProps) {
  const [itemName, setItemName] = React.useState("");

  const handleSubmit = () => {
    if (itemName.trim() === "") {
      return;
    }
    addNewItem(itemName.trim());
    setItemName("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4" />
          Add Attribute
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-start">
          <DialogTitle>Add new attribute</DialogTitle>
          <DialogDescription>
            Enter the name of your new variant attribute (e.g., Color, Size,
            Material)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 pt-2">
          <Input
            id="name"
            value={itemName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setItemName(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full" type="button">
            Add Attribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
