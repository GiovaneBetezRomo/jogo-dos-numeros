import { z } from "zod";

export const avatarUrlSchema = z
  .string()
  .trim()
  .max(500, "URL da foto muito longa.")
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith("/")) return !val.startsWith("//");
      try {
        const parsed = new URL(val);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Informe uma URL válida (http:// ou https://) ou deixe em branco." }
  )
  .optional()
  .or(z.literal(""));

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Nome de usuário deve ter pelo menos 3 caracteres.")
    .max(24, "Nome de usuário deve ter no máximo 24 caracteres.")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Use apenas letras, números, ponto, hífen ou underscore."
    ),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
  avatarUrl: avatarUrlSchema,
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail ou nome de usuário."),
  password: z.string().min(1, "Informe sua senha."),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Nome de usuário deve ter pelo menos 3 caracteres.")
    .max(24, "Nome de usuário deve ter no máximo 24 caracteres.")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Use apenas letras, números, ponto, hífen ou underscore."
    ),
  avatarUrl: avatarUrlSchema,
});

export const startGameSchema = z.object({
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  forceNew: z.boolean().optional(),
});

export const submitGuessSchema = z.object({
  value: z.coerce
    .number({ invalid_type_error: "Digite um número inteiro válido." })
    .int("O palpite deve ser um número inteiro."),
});
