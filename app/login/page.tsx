import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in · TFO Performance Marketing",
};

export default function LoginPage() {
  return (
    <main className="bg-bg flex min-h-screen items-center justify-center px-6 py-12">
      <div className="border-border w-full max-w-sm rounded-md border bg-white p-8">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl">TFO Performance Marketing</h1>
          <p className="text-muted-foreground text-sm">
            Sign in with your authorised email to receive a magic link.
          </p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
