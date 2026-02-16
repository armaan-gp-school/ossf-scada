import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { SmsConfigForm } from "@/components/function/SmsConfigForm"
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
          <CardTitle>SMS Alert Configuration</CardTitle>
          <CardDescription>
            When a PLC property value goes out of range, an SMS can be sent to the number below.
            Use a Gmail account with an App Password. For T-Mobile, use your number like: 5053974974@tmomail.net
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmsConfigForm initialConfig={smsConfig} />
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
