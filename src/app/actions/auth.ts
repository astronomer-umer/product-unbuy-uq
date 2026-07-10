"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  email: z.string().trim().toLowerCase().email("Valid email required"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .max(200, "Max 200 characters"),
});

export type FormState = { error?: string } | undefined;

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const ip = getClientIp();
  const rl = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return { error: "Too many attempts. Try again later." };
  }

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

  const hashed = await bcrypt.hash(password, 12);
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
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const ip = getClientIp();
  // IP bucket: 10 attempts / hour / IP, broad rate limit
  const rlIp = rateLimit(`login:${ip}`, 10, 60 * 60 * 1000);
  if (!rlIp.ok) {
    return { error: "Too many attempts from this network. Try again later." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email and password required" };
  }

  // Email bucket: 5 attempts / 15 min / email. Catches brute force
  // rotating across IPs (e.g., botnet targeting one account).
  const rlEmail = rateLimit(
    `login-email:${parsed.data.email}`,
    5,
    15 * 60 * 1000,
  );
  if (!rlEmail.ok) {
    return {
      error: "Too many attempts on this account. Try again in 15 minutes.",
    };
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