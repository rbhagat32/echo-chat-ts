import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="mr-0.5 -ml-1 size-9" />

      <Separator orientation="vertical" className="mr-2" />

      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="size-6" />
        <div className="mb-0.5 text-2xl font-semibold">Echo.</div>
      </div>
    </header>
  );
}
