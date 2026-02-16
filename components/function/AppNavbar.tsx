'use client';

import { SidebarTrigger } from "../ui/sidebar"
import { User } from "@/db/schema";

// AppNavbar component that provides the top navigation bar
export default function AppNavbar({ user }: { user: User }) {
    return (
        <div className="flex border-b-[1px] justify-between w-full h-12 items-center px-4">
            <SidebarTrigger />
        </div>
    )
}

