import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  quantity: z.string().min(1, "Please select a quantity"),
});

interface ReservationFormProps {
  availableStock?: number;
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
}

const ReservationForm = ({
  availableStock = 100,
  onSubmit = (data) => console.log("Form submitted:", data),
  isLoading = false,
}: ReservationFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      quantity: "1",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-[600px] p-6 bg-white dark:bg-gray-800 transition-colors duration-300 shadow-lg rounded-xl mx-auto mt-4 md:mt-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    className="border-gray-300 dark:border-white/20 h-10 text-base flex"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder=""
                    className="border-gray-300 dark:border-white/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder=""
                    className="border-gray-300 dark:border-white/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-300 dark:border-white/20">
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from(
                      { length: Math.min(10, availableStock) },
                      (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} {i === 0 ? "carton" : "cartons"}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Reserve"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default ReservationForm;
