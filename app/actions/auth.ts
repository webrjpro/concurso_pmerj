"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Preencha todos os campos." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Usuário não encontrado." };
  }

  // Se o usuário não tiver senha (legado/demo), permitir login sem validar bcrypt
  // ou você pode forçar a criar uma senha. Para o demo antigo funcionar:
  if (user.passwordHash) {
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: "Senha incorreta." };
    }
  } else if (password !== "123456") {
    // Fallback para contas antigas sem hash (demo).
    return { error: "Senha incorreta para conta legada. Tente 123456." };
  }

  await createSession(user.id, user.email, user.role);
  redirect("/aluno");
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Este e-mail já está em uso." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Criar o usuário e inicializar seus progressos básicos
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
      profile: {
        create: {
          dailyMinutes: 120,
          beginnerMode: true,
          targetScore: 80,
        },
      },
      generalProgress: {
        create: {
          editalPercent: 0,
          overallAccuracy: 0,
          questionsDone: 0,
          simulationsDone: 0,
          studyMinutes: 0,
          pendingReviews: 0,
        },
      },
    },
  });

  await createSession(user.id, user.email, user.role);
  redirect("/aluno");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
