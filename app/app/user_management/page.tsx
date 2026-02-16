import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Users } from "lucide-react"
import { UserTable } from "@/components/function/UserTable"
import { AddUserForm } from "@/components/function/AddUserForm"
import { getUsers } from "@/app/actions/admin"

export default async function UsersSettingsPage() {
  const users = await getUsers()

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/app/settings" className="text-sm text-gray-500 flex items-center hover:text-[#500000]">
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-sm font-medium flex items-center">
          <Users className="h-4 w-4 mr-1" />
          User Management
        </span>
      </div>

      <h1 className="text-3xl font-bold text-[#500000] mb-1">User Management</h1>
      <p className="text-gray-500 mb-6">Add, edit, or remove system users</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>System Users</CardTitle>
              <CardDescription>Manage users who have access to the TAMU OSSF Center SCADA System</CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable users={users} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Add New User</CardTitle>
              <CardDescription>Create a new user account</CardDescription>
            </CardHeader>
            <CardContent>
              <AddUserForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}






