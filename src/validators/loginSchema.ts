import { z } from 'zod';

/**
 * Validação do formulário de login. Mantida simples de propósito: a
 * validação de negócio real (credencial existe? promotor está ativo?)
 * acontece no backend/Repository — aqui só evitamos submissões óbvias
 * (campo vazio, e-mail malformado) para dar feedback imediato ao usuário.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Informe seu e-mail.' })
    .min(1, 'Informe seu e-mail.')
    .email('E-mail inválido.'),
  password: z.string({ required_error: 'Informe sua senha.' }).min(1, 'Informe sua senha.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
