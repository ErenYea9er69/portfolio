'use client';

import { CliInterface } from "@/components/cli-interface";
import { useRouter } from "next/navigation";

export default function CliPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden bg-[#0a0c10]">
      <CliInterface 
        onGuiCommand={() => router.push('/')} 
      />
    </div>
  );
}
