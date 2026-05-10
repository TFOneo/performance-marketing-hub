import { UserMenu } from "@/components/layout/user-menu";

interface HeaderProps {
  email: string;
}

export function Header({ email }: HeaderProps) {
  return (
    <header className="bg-bg border-border sticky top-0 z-20 flex h-16 items-center justify-between border-b px-6">
      <div className="text-muted-foreground text-xs uppercase tracking-wide">
        Performance marketing dashboard
      </div>
      <UserMenu email={email} />
    </header>
  );
}
