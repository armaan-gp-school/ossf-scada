import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { GmailAccountForm, SmsRecipientsForm } from "@/components/function/SmsConfigForm"
import { getSmsConfig } from "@/app/actions/settings"

export default async function SettingsPage() {
  const smsConfig = await getSmsConfig()

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <span className="text-sm font-medium flex items-center">
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </span>
      </div>

      <h1 className="text-3xl font-bold text-[#500000] mb-1">Settings</h1>
      <p className="text-gray-500 mb-6">Configure SMS alerts and system options</p>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Gmail account</CardTitle>
          <CardDescription>
            Sender email and App Password used to send SMS alerts. Update these separately from recipients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GmailAccountForm initialConfig={smsConfig} />
        </CardContent>
      </Card>

      <Card className="max-w-2xl mt-6">
        <CardHeader>
          <CardTitle>SMS recipients</CardTitle>
          <CardDescription>
            Phone numbers and carriers that will receive alert SMS messages. Add multiple recipients if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmsRecipientsForm initialRecipients={smsConfig?.recipients ?? []} />
        </CardContent>
      </Card>

      <Card className="max-w-2xl mt-6">
        <CardHeader>
          <CardTitle>Alert thresholds</CardTitle>
          <CardDescription>
            Default placeholder ranges: FLOAT 3.0–3.5, INT 1–2. You can set per-property min/max in the database
            (property_alert_thresholds table) or add a UI here later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Values outside the configured range for INT or FLOAT properties trigger a red alert icon and, if SMS is
            configured, a one-time SMS per alert episode.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
