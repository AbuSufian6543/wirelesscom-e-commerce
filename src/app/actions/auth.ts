"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/lib/auth";
import { mergeGuestCart } from "@/lib/cart";

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: name || null,
      email,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  await signIn("credentials", { email, password, redirect: false });
  const session = await auth();
  if (session?.user?.id) {
    await mergeGuestCart(session.user.id);
  }
  redirect("/account");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/account");

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    const session = await auth();
    if (session?.user?.id) {
      await mergeGuestCart(session.user.id);
    }
    redirect(callbackUrl);
  } catch {
    return { error: "Invalid email or password." };
  }
}

export async function newsletterAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) {
    return { error: "Email is required." };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  revalidatePath("/");
  return { success: true };
}
