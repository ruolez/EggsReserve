import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { Button } from "./ui/button";
import { X } from "lucide-react";
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

  const nameInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedContact = {
      name: Cookies.get("customer_name") || "",
      email: Cookies.get("customer_email") || "",
      phone: Cookies.get("customer_phone") || "",
    };

    if (savedContact.name || savedContact.email || savedContact.phone) {
      form.reset(savedContact);
    }
  }, []);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Save contact info in cookies for 30 days
    Cookies.set("customer_name", data.name, { expires: 30 });
    Cookies.set("customer_email", data.email, { expires: 30 });
    Cookies.set("customer_phone", data.phone, { expires: 30 });

    onSubmit(data);
    form.reset();
    nameInputRef.current?.focus();
  };

  const clearForm = () => {
    // Remove cookies
    Cookies.remove("customer_name");
    Cookies.remove("customer_email");
    Cookies.remove("customer_phone");

    // Reset form with all fields empty
    form.reset({
      name: "",
      email: "",
      phone: "",
      quantity: "1",
    });

    // Focus on name input
    nameInputRef.current?.focus();
  };

  return (
    <Card className="w-full max-w-[600px] p-6 bg-white dark:bg-gray-800 transition-colors duration-300 shadow-lg rounded-xl mx-auto relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={clearForm}
        type="button"
      >
        <X className="h-4 w-4" />
      </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Name"
                    className="border-gray-300 dark:border-white/20 h-12 text-base"
                    ref={nameInputRef}
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
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email"
                    className="border-gray-300 dark:border-white/20 h-12"
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
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    className="border-gray-300 dark:border-white/20 h-12"
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-300 dark:border-white/20 h-12">
                      <SelectValue placeholder="Select number of cartons" />
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
