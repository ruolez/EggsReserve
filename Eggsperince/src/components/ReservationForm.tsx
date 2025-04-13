import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { Button } from "./ui/button";
import { X, User, Mail, Phone, ShoppingCart } from "lucide-react";
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
    <Card className="w-full max-w-[450px] p-6 bg-card/80 backdrop-blur-sm border border-border/40 transition-all duration-300 shadow-md hover:shadow-lg rounded-xl mx-auto relative">

      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
        onClick={clearForm}
        type="button"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <User className="h-3 w-3" />
                    </div>
                    <Input
                      placeholder="Your full name"
                      className="pl-8 border-input/60 focus:border-primary h-11 rounded-md transition-all text-sm"
                      ref={nameInputRef}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                    </div>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-8 border-input/60 focus:border-primary h-11 rounded-md transition-all text-sm"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">Phone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                    </div>
                    <Input
                      type="tel"
                      placeholder="(123) 456-7890"
                      className="pl-8 border-input/60 focus:border-primary h-11 rounded-md transition-all text-sm"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">Quantity</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <ShoppingCart className="h-3 w-3" />
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="pl-8 border-input/60 focus:border-primary h-11 rounded-md transition-all text-sm">
                        <SelectValue placeholder="Select number of cartons" />
                      </SelectTrigger>
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
                  </div>
                </FormControl>
                <FormMessage className="text-xs font-medium text-destructive" />
              </FormItem>
            )}
          />

<Button
            type="submit"
            className="w-full h-10 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 rounded-md mt-4 shadow-md hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Reserve Now"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default ReservationForm;
