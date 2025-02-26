import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getEmailSettings, updateEmailSettings } from "../../lib/api";
import { useToast } from "../ui/use-toast";
import { Mail, Server, Lock, User, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { API_CONFIG, EMAIL_CONFIG } from "../../lib/config";

interface EmailSettingsData {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  notification_email: string;
}

const EmailSettings = () => {
  const [settings, setSettings] = useState<EmailSettingsData>({
    smtp_host: EMAIL_CONFIG.DEFAULT_SMTP_HOST,
    smtp_port: EMAIL_CONFIG.DEFAULT_SMTP_PORT,
    smtp_user: "",
    smtp_password: "",
    notification_email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getEmailSettings();
      setSettings({
        smtp_host: data.smtp_host || EMAIL_CONFIG.DEFAULT_SMTP_HOST,
        smtp_port: data.smtp_port || EMAIL_CONFIG.DEFAULT_SMTP_PORT,
        smtp_user: data.smtp_user || "",
        smtp_password: data.smtp_password || "",
        notification_email: data.notification_email || "",
      });
    } catch (error) {
      console.error("Error loading email settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load email settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "smtp_port" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateEmailSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Email settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving email settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save email settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    try {
      // Create test data
      const testOrder = {
        id: 'test-123',
        order_number: 'TEST-ORDER',
        customer_name: 'Test Customer',
        email: 'test@example.com',
        phone: '123-456-7890',
        created_at: new Date().toISOString()
      };
      
      const testOrderDetails = {
        product: 'Carton of eggs',
        qty: 2,
        sale: 10.00
      };

      // Call the server API to send a test email
      const response = await fetch(`${API_CONFIG.EMAIL_SERVER_URL}${EMAIL_CONFIG.SEND_NOTIFICATION_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: testOrder, orderDetails: testOrderDetails }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Test Email Sent",
          description: `Email sent successfully to ${settings.notification_email}`,
        });
      } else {
        throw new Error(result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to send test email: ${error.message || 'Make sure the email server is running'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Email Settings</h2>
      </div>
      
      <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md mb-6">
        <p className="text-green-800 dark:text-green-200">
          <strong>Note:</strong> Email notifications are enabled for new orders. 
          Configure your Gmail SMTP settings below to receive order notifications.
          For Gmail, you'll need to use an App Password instead of your regular password.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="smtp">SMTP Configuration</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification_email">
                Notification Email Address
              </Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="notification_email"
                  name="notification_email"
                  type="email"
                  placeholder="admin@example.com"
                  value={settings.notification_email}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                New order notifications will be sent to this email address.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isSaving || isTesting}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestEmail} 
                disabled={isSaving || isTesting || !settings.notification_email || !settings.smtp_host}
                className="flex items-center gap-2"
              >
                {isTesting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Test Email</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="smtp" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Server</Label>
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="smtp_host"
                  name="smtp_host"
                  placeholder={EMAIL_CONFIG.DEFAULT_SMTP_HOST}
                  value={settings.smtp_host}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                name="smtp_port"
                type="number"
                placeholder={EMAIL_CONFIG.DEFAULT_SMTP_PORT.toString()}
                value={settings.smtp_port}
                onChange={handleInputChange}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                Common ports: 25 (SMTP), 465 (SMTPS), 587 (SMTP with STARTTLS)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_user">SMTP Username</Label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="smtp_user"
                  name="smtp_user"
                  placeholder="your-email@gmail.com"
                  value={settings.smtp_user}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_password">SMTP Password</Label>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="smtp_password"
                  name="smtp_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={settings.smtp_password}
                  onChange={handleInputChange}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Switch
                  id="show-password"
                  checked={showPassword}
                  onCheckedChange={setShowPassword}
                />
                <Label htmlFor="show-password" className="cursor-pointer">
                  Show password
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                For Gmail, you may need to use an App Password instead of your
                regular password. <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-primary underline">Learn more</a>
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isSaving || isTesting}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestEmail} 
                disabled={isSaving || isTesting || !settings.notification_email || !settings.smtp_host}
                className="flex items-center gap-2"
              >
                {isTesting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Test Email</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </Card>
  );
};

export default EmailSettings;
