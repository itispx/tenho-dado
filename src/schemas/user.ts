import { z } from "zod";

export const userFormSchema = z.object({
  username: z
    .string()
    .min(3, "username deve ter no mínimo 3 caracteres")
    .max(20, "username deve ter no máximo 20 caracteres"),
  password: z
    .string()
    .min(8, "senha deve ter no mínimo 8 caracteres")
    .max(100, "senha deve ter no máximo 100 caracteres"),
});
