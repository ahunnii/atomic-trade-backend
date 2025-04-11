import { Archive, CheckCircle, Pencil, Ticket } from "lucide-react";

export const productFilterOptions = [
  {
    column: "status",
    title: "Status",
    filters: [
      {
        value: "SOLD_OUT",
        label: "Sold Out",
        icon: Ticket,
      },
      {
        value: "ARCHIVED",
        label: "Archived",
        icon: Archive,
      },
      {
        value: "DRAFT",
        label: "Draft",
        icon: Pencil,
      },
      {
        value: "ACTIVE",
        label: "Active",
        icon: CheckCircle,
      },
    ],
  },
];
