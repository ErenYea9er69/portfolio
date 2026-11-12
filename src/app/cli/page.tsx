'use client';

import * as React from "react";
import { CliInterface } from "@/components/cli-interface";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { isMobilePhone } from "@/lib/device";
import { OctagonXIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CliPage() {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (isMobilePhone()) {
      setIsBlocked(true);
      toast.create({
        type: "error",
        title: "Desktop Only",
        description: "The terminal interface is only available on PC / desktop devices.",
      });
    } else {
      setIsBlocked(false);
    }
  }, []);

  if (isBlocked === true) {
    return (
      <div className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col items-center justify-center bg-[#0a0c10] p-6 text-center text-zinc-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30 mb-5">
          <OctagonXIcon className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white mb-2">Desktop Only</h1>
        <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
          The CLI terminal requires a physical keyboard and desktop display. Please access this page from a PC or laptop.
        </p>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="gap-2 rounded-xl bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Portfolio
        </Button>
      </div>
    );
  }

  if (isBlocked === null) {
    return <div className="fixed inset-0 z-50 bg-[#0a0c10]" />;
  }

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden bg-[#0a0c10] overscroll-none touch-manipulation">
      <CliInterface 
        onGuiCommand={() => router.push('/')} 
      />
    </div>
  );
}
