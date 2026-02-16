"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { saveSmsSenderConfig, saveSmsRecipients } from "@/app/actions/settings";
import type { SmsConfigForm as SmsConfigFormType, SmsRecipientEntry } from "@/app/actions/settings";
import { CARRIER_OPTIONS } from "@/lib/smsGateways";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export function GmailAccountForm({ initialConfig }: { initialConfig: SmsConfigFormType | null }) {
  const [senderEmail, setSenderEmail] = useState(initialConfig?.senderEmail ?? "");
  const [appPassword, setAppPassword] = useState("");
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await saveSmsSenderConfig(senderEmail, appPassword);
    setPending(false);
    if (result.ok) {
      toast({ title: "Saved", description: "Gmail account settings saved." });
      setAppPassword("");
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
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Gmail account"}
      </Button>
    </form>
  );
}

export function SmsRecipientsForm({ initialRecipients }: { initialRecipients: SmsRecipientEntry[] }) {
  const [recipients, setRecipients] = useState<SmsRecipientEntry[]>(
    initialRecipients.length > 0 ? initialRecipients : [{ phoneNumber: "", carrier: "T-Mobile" }]
  );
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  function addRecipient() {
    setRecipients((prev) => [...prev, { phoneNumber: "", carrier: "T-Mobile" }]);
  }

  function removeRecipient(index: number) {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRecipient(index: number, field: "phoneNumber" | "carrier", value: string) {
    setRecipients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = recipients.filter((r) => r.phoneNumber.trim());
    if (valid.length === 0) {
      toast({ title: "Add at least one recipient", variant: "destructive" });
      return;
    }
    setPending(true);
    const result = await saveSmsRecipients(valid);
    setPending(false);
    if (result.ok) {
      toast({ title: "Saved", description: "SMS recipients saved." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {recipients.map((r, index) => (
          <div key={index} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
            <div className="flex-1 min-w-[120px]">
              <Label className="text-xs">Phone number</Label>
              <Input
                type="tel"
                value={r.phoneNumber}
                onChange={(e) => updateRecipient(index, "phoneNumber", e.target.value)}
                placeholder="5550000000"
                className="mt-1"
              />
            </div>
            <div className="w-[180px]">
              <Label className="text-xs">Carrier</Label>
              <Select
                value={r.carrier}
                onValueChange={(v) => updateRecipient(index, "carrier", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARRIER_OPTIONS.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground shrink-0"
              onClick={() => removeRecipient(index)}
              aria-label="Remove recipient"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={addRecipient}>
          Add recipient
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save recipients"}
        </Button>
      </div>
    </form>
  );
}
