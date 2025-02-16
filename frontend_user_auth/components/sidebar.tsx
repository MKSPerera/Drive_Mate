"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside
      className={`${
        open ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-[#8C61FF]">DriveMate</h1>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Job Management", href: "/job-management" },
            { name: "Drivers", href: "/drivers" },
            { name: "Notifications", href: "/notifications" },
          ].map((item) => (
            <li key={item.name}>
              <Link href={item.href} passHref>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:bg-[#F5F3FF] hover:text-[#8C61FF]"
                >
                  {item.name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

