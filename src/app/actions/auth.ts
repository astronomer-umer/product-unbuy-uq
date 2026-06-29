"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(1, "Name required").max(80),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Min 8 characters"),
});

export type FormState = { error?: string } | undefined;

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists" };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/admin",
  });

  return undefined;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email and password required" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "NEXT_REDIRECT") throw err;
    if (message.includes("CredentialsSignin")) {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong" };
  }

  redirect("/admin");
}