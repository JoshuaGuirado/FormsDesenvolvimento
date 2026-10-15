"use server";

import { redirect } from "next/navigation";
import {
  checkPassword,
  clearFailures,
  createSession,
  destroySession,
  isLockedOut,
  isPasswordConfigured,
  LOCK_MESSAGE,
  recordFailure,
  requireAdmin,
} from "@/lib/auth";
import { deleteBriefing } from "@/lib/briefings";
import { toFormId } from "@/lib/forms";

export type LoginState = { error: string } | undefined;

export async function login(_state: LoginState, form: FormData): Promise<LoginState> {
  if (!isPasswordConfigured()) return { error: "A senha do painel ainda não foi configurada (ADMIN_PASSWORD)." };
  if (await isLockedOut()) return { error: LOCK_MESSAGE };

  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) {
    await recordFailure();
    // Pequena espera para atrasar quem tenta adivinhar a senha.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "Senha incorreta." };
  }

  await clearFailures();
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function removeBriefing(form: FormData) {
  await requireAdmin();
  await deleteBriefing(String(form.get("id") ?? ""));
  redirect(`/admin?form=${toFormId(form.get("form"))}`);
}
