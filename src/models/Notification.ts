/**
 * Model de domínio de Notificação — wireframe "Notificações", descoberto nos
 * itens de exemplo "Endereço aprovado"/"Endereço recusado" (ver
 * `docs/DECISIONS.md`, item 27).
 */
export type NotificationKind =
  'address_approved' | 'address_rejected' | 'visit_reminder' | 'generic';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
