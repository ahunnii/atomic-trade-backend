"use client";

import { useState } from "react";
import { formatCurrency } from "~/utils/format-currency";
import { CreditCard, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import type { Payment } from "~/types/order";
import { PaymentStatus } from "~/types/order";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { CurrencyFormField } from "~/components/input/currency-form-field";
import { RadioGroupFormField } from "~/components/input/radio-group-form-field";
import { TextareaFormField } from "~/components/input/textarea-form-field";

const refundSchema = z.object({
  paymentId: z.string(),
  type: z.enum(["FULL", "PARTIAL"]),
  amountInCents: z.number().optional().nullable(),
  reason: z.string().optional(),
});

type RefundFormData = z.infer<typeof refundSchema>;

export const RefundSection = ({ payments }: { payments: Payment[] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const form = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      type: "FULL",
      amountInCents: null,
      reason: "",
    },
  });

  const refundType = form.watch("type");

  const handleRefundClick = (payment: Payment) => {
    setSelectedPayment(payment);
    form.reset({
      paymentId: payment.id,
      type: "FULL",
      amountInCents: null,
      reason: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: RefundFormData) => {
    // Calculate the actual refund amount
    const refundAmount =
      data.type === "FULL"
        ? selectedPayment?.amountInCents
        : data.amountInCents;

    console.log("Processing refund:", {
      ...data,
      amountInCents: refundAmount,
    });

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-6 px-6 py-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Payments & Refunds</h2>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-700">
            No payments found for this order
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Payment {payment.method} - {payment.status}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xl font-semibold">
                    {formatCurrency(payment.amountInCents)}
                  </div>
                </div>

                {payment.status === PaymentStatus.PAID && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => handleRefundClick(payment)}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Issue Refund
                    </Button>
                  </div>
                )}

                {payment.refunds && payment.refunds.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Refund History:</h4>
                    {payment.refunds.map((refund) => (
                      <div
                        key={refund.id}
                        className="rounded border border-gray-100 bg-gray-50 p-2 text-sm"
                      >
                        <div className="flex justify-between">
                          <span>
                            {new Date(refund.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-red-600">
                            -{formatCurrency(refund.amountInCents / 100)}
                          </span>
                        </div>
                        {refund.reason && (
                          <p className="mt-1 text-gray-600">{refund.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Create a refund for payment of{" "}
              {formatCurrency(selectedPayment?.amountInCents ?? 0)}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <RadioGroupFormField
                form={form}
                name="type"
                label="Refund Type"
                values={[
                  {
                    label: `Full Refund of ${selectedPayment?.amountInCents}`,
                    value: "FULL",
                  },
                  { label: "Partial Refund", value: "PARTIAL" },
                ]}
              />

              {refundType === "PARTIAL" && (
                <CurrencyFormField
                  form={form}
                  name="amountInCents"
                  label="Amount (in cents)"
                  placeholder="Amount in cents"
                  description="Enter amount in cents (e.g. 1000 = $10.00)"
                />

                // <FormField
                //   control={form.control}
                //   name="amountInCents"
                //   rules={{
                //     validate: (value) =>
                //       value !== null &&
                //       value > 0 &&
                //       value <= (selectedPayment?.amountInCents || 0),
                //   }}
                //   render={({ field }) => (
                //     <FormItem>
                //       <FormLabel>Amount (in cents)</FormLabel>
                //       <FormControl>
                //         <Input
                //           type="number"
                //           placeholder="Amount in cents"
                //           {...field}
                //           onChange={(e) => field.onChange(Number(e.target.value))}
                //         />
                //       </FormControl>
                //       <FormDescription>
                //         Enter amount in cents (e.g. 1000 = $10.00)
                //       </FormDescription>
                //       <FormMessage />
                //     </FormItem>
                //   )}
                // />
              )}

              <TextareaFormField
                form={form}
                name="reason"
                label="Reason for refund (optional)"
                placeholder="Reason for refund"
              />

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Process Refund</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
