import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-6 py-16">
      <h1 className="font-heading text-5xl leading-none tracking-tight uppercase">
        Join unbuy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create an account to start shopping and saving.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </main>
  );
}