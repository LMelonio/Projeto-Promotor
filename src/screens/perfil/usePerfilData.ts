import { useMutation } from '@tanstack/react-query';

import { authRepository } from '@/repositories/implementations/AuthRepository';

/** Hook de dados do Perfil — mesmo padrão de `screens/home/useHomeData.ts`. */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authRepository.updatePassword(currentPassword, newPassword),
  });
}
