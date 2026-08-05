import { type SyncKind, syncQueue } from './SyncQueue';
import { clientRepository } from '@/repositories/implementations/ClientRepository';
import { visitRepository } from '@/repositories/implementations/VisitRepository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (payload: any) => Promise<unknown>;

/**
 * Um handler por tipo de escrita que pode ser enfileirada offline — usado
 * tanto para a tentativa imediata (`runOrQueue`) quanto para o replay da
 * fila (`flushQueue`), então o "como chamar o Repository para este tipo de
 * ação" existe em um único lugar.
 */
const SYNC_HANDLERS: Record<SyncKind, Handler> = {
  check_in: (p) => clientRepository.checkIn(p.visitId, p.coords, p.occurredAt),
  check_out: (p) => clientRepository.checkOut(p),
  register_activity: (p) => visitRepository.registerActivity(p),
  submit_questionnaire: (p) => visitRepository.submitQuestionnaire(p.visitId, p.answers),
  register_ruptura: (p) => visitRepository.registerRuptura(p),
};

export type SyncOutcome<T> = { synced: true; result: T } | { synced: false };

/**
 * Tenta executar a ação agora; se falhar por qualquer motivo (o caso comum
 * em campo é rede instável/indisponível — ver `docs/DECISIONS.md`, item 14),
 * enfileira o mesmo payload para reenviar depois, em vez de propagar o erro
 * para a tela. O chamador decide, a partir de `synced`, se mostra o
 * resultado do servidor ou um estado local otimista de "aguardando sincronização".
 */
export async function runOrQueue<T>(kind: SyncKind, payload: unknown): Promise<SyncOutcome<T>> {
  try {
    const result = (await SYNC_HANDLERS[kind](payload)) as T;
    return { synced: true, result };
  } catch {
    await syncQueue.enqueue(kind, payload);
    return { synced: false };
  }
}

/**
 * Reenvia toda a fila pendente, em ordem de criação. Um item que falha de
 * novo permanece na fila (com `attempts`/`last_error` atualizados) e não
 * bloqueia os itens seguintes — um dado ruim isolado não deve travar o
 * restante da sincronização do dia.
 */
export async function flushQueue(): Promise<{ synced: number; remaining: number }> {
  const items = await syncQueue.listPending();
  let synced = 0;

  for (const item of items) {
    try {
      await SYNC_HANDLERS[item.kind](item.payload);
      await syncQueue.remove(item.id);
      synced += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido.';
      await syncQueue.recordFailure(item.id, message);
    }
  }

  const remaining = await syncQueue.count();
  return { synced, remaining };
}
