import { Button } from "@/components/ui/button";
import { History, Receipt, Settings, Upload, Users } from "lucide-react";
import Link from "next/link";

export function DashboardNav() {
  return (
    <div className="hidden border-r bg-gray-50/40 md:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2 p-4">
        <div className="flex-1 py-2">
          <nav className="grid items-start gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Receipt className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/scan-bill">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Upload className="h-4 w-4" />
                Scan Bill
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Friends
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
