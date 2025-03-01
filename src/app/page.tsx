import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode, Receipt, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-red-300">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Receipt className="h-5 w-5" />
            <span>SplitSnap</span>
          </Link>
          <nav className="flex gap-4 ml-auto justify-end">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12">
          <div className="container px-4">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter">
                  Split Bills Instantly from Photos
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Take a photo of your receipt, let our app identify the items,
                  and share a QR code with friends to split the bill.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard">
                  <Button className="px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" className="px-8">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-12 bg-gray-50 dark:bg-gray-900"
        >
          <div className="container px-4">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">
                  How It Works
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400">
                  Split bills with friends in three simple steps.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Receipt className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">1. Snap a Photo</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Take a photo of your receipt or upload an existing one.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">2. Assign Items</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Our app identifies items and lets you assign them to
                    different people.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">3. Share & Split</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Generate a QR code for friends to join and pay their share.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-5 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 SplitSnap. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
