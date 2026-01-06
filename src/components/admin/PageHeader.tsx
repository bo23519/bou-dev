import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DrawOutlineButton } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  cancelHref: string;
  actions?: ReactNode;
}

export function PageHeader({ title, cancelHref, actions }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-4xl font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        {actions}
        <DrawOutlineButton onClick={() => router.push(cancelHref)}>
          Cancel
        </DrawOutlineButton>
      </div>
    </div>
  );
}
