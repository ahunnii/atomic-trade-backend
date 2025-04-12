import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CircleIcon,
  HelpCircleIcon,
  type LucideIcon,
  TimerIcon,
} from "lucide-react";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];
export type FilterOption = {
  column: string;
  title: string;
  filters: {
    value: string;
    label: string;
    icon: LucideIcon;
  }[];
};

export const statuses = [
  {
    column: "paymentStatus",
    title: "Payment Status",
    filters: [
      {
        value: "PENDING",
        label: "Pending",
        icon: HelpCircleIcon,
      },
      {
        value: "PAID",
        label: "Paid",
        icon: HelpCircleIcon,
      },
      {
        value: "REFUNDED",
        label: "Refunded",
        icon: CircleIcon,
      },
      {
        value: "PARTIAL_REFUND",
        label: "Partial Refund",
        icon: TimerIcon,
      },
      {
        value: "VOIDED",
        label: "Voided",
        icon: TimerIcon,
      },
      {
        value: "FAILED",
        label: "Failed",
        icon: HelpCircleIcon,
      },
    ],
  },
  {
    column: "fulfillmentStatus",
    title: "Fulfillment Status",
    filters: [
      {
        value: "PENDING",
        label: "Pending",
        icon: HelpCircleIcon,
      },
      {
        value: "PARTIAL",
        label: "Partial",
        icon: CircleIcon,
      },
      {
        value: "FULFILLED",
        label: "Fulfilled",
        icon: TimerIcon,
      },
      {
        value: "RESTOCK",
        label: "Restock",
        icon: TimerIcon,
      },
      {
        value: "AWAITING_SHIPMENT",
        label: "Awaiting Shipment",
        icon: TimerIcon,
      },
      {
        value: "CANCELLED",
        label: "Cancelled",
        icon: TimerIcon,
      },
    ],
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
];
