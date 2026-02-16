"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { saveSmsConfig } from "@/app/actions/settings";
import type { SmsConfigForm as SmsConfigFormType } from "@/app/actions/settings";

export function SmsConfigForm({ initialConfig }: { initialConfig: SmsConfigFormType | null }) {
  const [senderEmail, setSenderEmail] = useState(initialConfig?.senderEmail ?? "");
  const [appPassword, setAppPassword] = useState("");
  const [recipient, setRecipient] = useState(initialConfig?.recipient ?? "");
  const [alertMessage, setAlertMessage] = useState(initialConfig?.alertMessage ?? "Alert: {deviceName} - {propertyName} is out of range (value: {value}).");
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await saveSmsConfig({
      senderEmail,
      appPassword,
      recipient,
      alertMessage,
    });
    setPending(false);
    if (result.ok) {
      toast({ title: "Saved", description: "SMS configuration saved." });
      setAppPassword(""); // clear password field
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="senderEmail">Sender email (Gmail)</Label>
        <Input
          id="senderEmail"
          type="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          placeholder="your@gmail.com"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="appPassword">Gmail App Password</Label>
        <Input
          id="appPassword"
          type="password"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          placeholder={initialConfig ? "Leave blank to keep current" : "16-character app password"}
          className="mt-1"
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Create an App Password in Google Account → Security → 2-Step Verification → App passwords.
        </p>
      </div>
      <div>
        <Label htmlFor="recipient">Recipient (SMS gateway or email)</Label>
        <Input
          id="recipient"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="5053974974@tmomail.net"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">T-Mobile: number@tmomail.net</p>
      </div>
      <div>
        <Label htmlFor="alertMessage">Alert message</Label>
        <textarea
          id="alertMessage"
          value={alertMessage}
          onChange={(e) => setAlertMessage(e.target.value)}
          placeholder="Alert: {deviceName} - {propertyName} = {value}"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Placeholders: {"{deviceName}"}, {"{propertyName}"}, {"{value}"}
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save SMS configuration"}
      </Button>
    </form>
  );
}
