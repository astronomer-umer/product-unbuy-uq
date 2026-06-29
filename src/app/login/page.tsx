import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-6 py-16">
      <h1 className="font-heading text-5xl leading-none tracking-tight uppercase">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome back to unbuy.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}