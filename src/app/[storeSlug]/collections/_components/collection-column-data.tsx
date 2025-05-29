import { format } from "date-fns";

import { type ColumnDef } from "@tanstack/react-table";

import { env } from "~/env";
import { CellActions } from "~/components/shared/cell-actions";
import { PrimaryCellLink } from "~/components/shared/primary-cell-link";

export type CollectionColumnData = {
  id: string;
  storeId: string;
  storeSlug: string;
  name: string;
  imageUrl: string;
  products: number;
  updatedAt: Date;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isLoading: boolean;
};

export const collectionColumnData: ColumnDef<CollectionColumnData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <PrimaryCellLink
        id={row.original.id}
        image={`${env.NEXT_PUBLIC_STORAGE_URL}/misc/${row.original.imageUrl ?? "/placeholder-image.webp"}`}
        name={row.original.name}
        link={`/${row.original.storeSlug}/collections/${row.original.id}/edit`}
      />
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "updatedAt",
    header: "Last updated at",
    cell: ({ row }) => format(row.original.updatedAt, "MMMM do, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CellActions
        handleOnDelete={row.original.onDelete}
        handleOnDuplicate={row.original.onDuplicate}
        id={row.original.id}
        isLoading={row.original.isLoading}
      />
    ),
  },
];
