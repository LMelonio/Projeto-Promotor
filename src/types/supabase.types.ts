/**
 * ATENÇÃO — ARQUIVO TEMPORÁRIO / GERADO MANUALMENTE.
 *
 * Este arquivo existe apenas para o projeto compilar enquanto o app ainda
 * não está conectado a uma instância real do Supabase neste ambiente.
 *
 * Assim que houver acesso ao projeto Supabase (mesmo o de desenvolvimento,
 * já com as migrations em /mnt/user-data/outputs/lynkz_supabase/migrations/
 * aplicadas), este arquivo deve ser REGERADO automaticamente com:
 *
 *   npm run gen:types
 *
 * Nunca edite os nomes de coluna abaixo "de cabeça" para bater com o app —
 * o caminho correto é sempre gerar a partir do schema real, para que
 * TypeScript pegue qualquer divergência em tempo de compilação.
 *
 * Os campos abaixo cobrem apenas o necessário para as telas já implementadas
 * nesta primeira fase (Login + Home). Os nomes seguem a convenção do projeto
 * (snake_case, inglês, schema `lynkz`) e as decisões já documentadas
 * (soft delete via deleted_at, auth_user_id anulável em promoters, etc.).
 */
export interface Database {
  lynkz: {
    Tables: {
      promoters: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          supplier: string;
          status: 'active' | 'inactive';
          deleted_at: string | null;
        };
      };
      clients: {
        Row: {
          id: string;
          erp_code: string;
          legal_name: string;
          trade_name: string;
          rating: number | null;
          latitude: number;
          longitude: number;
          financial_status: 'compliant' | 'delinquent';
          deleted_at: string | null;
        };
      };
      visits: {
        Row: {
          id: string;
          promoter_id: string;
          client_id: string;
          scheduled_date: string;
          scheduled_time: string | null;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          checked_in_at: string | null;
          /**
           * Assumido para a Fase 2 (check-in georreferenciado) — ainda não
           * confirmado contra as migrations reais. Reconciliar junto da
           * regeneração de tipos (ver aviso no topo deste arquivo).
           */
          checked_in_latitude: number | null;
          checked_in_longitude: number | null;
          checked_out_at: string | null;
          /** Assumido junto do check-out georreferenciado (Fase 4) — mesmo aviso acima. */
          checked_out_latitude: number | null;
          checked_out_longitude: number | null;
        };
        Update: {
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          checked_in_at?: string | null;
          checked_in_latitude?: number | null;
          checked_in_longitude?: number | null;
          checked_out_at?: string | null;
          checked_out_latitude?: number | null;
          checked_out_longitude?: number | null;
        };
      };
      /**
       * Tabelas da Fase 3 (Atividades/Questionário/Ruptura) — assumidas a
       * partir da planilha funcional de referência encontrada ao lado do
       * projeto ("Base App Promotor.xlsx", abas Produtos/CarteiraProdutos/
       * Atividades/Questionarios/Rupturas), ainda não confirmadas contra
       * migrations reais. Nomes de coluna traduzidos para o padrão em
       * inglês já usado nas demais tabelas deste arquivo. Reconciliar ao
       * regenerar tipos (ver aviso no topo deste arquivo) — ver também
       * `docs/DECISIONS.md`, item 12.
       */
      products: {
        Row: {
          id: string;
          internal_code: string;
          ean_code: string;
          supplier: string;
          name: string;
          category: string;
          is_active: boolean;
        };
      };
      promoter_products: {
        Row: {
          promoter_id: string;
          product_id: string;
          status: 'available' | 'unavailable';
        };
      };
      activities: {
        Row: {
          id: string;
          visit_id: string;
          client_id: string;
          promoter_id: string;
          type: string;
          status: 'pending' | 'completed';
          photo_count: number;
          notes: string | null;
        };
        Insert: {
          visit_id: string;
          client_id: string;
          promoter_id: string;
          type: string;
          status: 'pending' | 'completed';
          photo_count: number;
          notes?: string | null;
        };
      };
      questionnaires: {
        Row: {
          id: string;
          visit_id: string;
          product_exposed: boolean;
          merchandising_material: boolean;
          price_updated: boolean;
          needs_restocking: boolean;
          notes: string | null;
        };
        Insert: {
          visit_id: string;
          product_exposed: boolean;
          merchandising_material: boolean;
          price_updated: boolean;
          needs_restocking: boolean;
          notes?: string | null;
        };
        Update: {
          product_exposed?: boolean;
          merchandising_material?: boolean;
          price_updated?: boolean;
          needs_restocking?: boolean;
          notes?: string | null;
        };
      };
      rupturas: {
        Row: {
          id: string;
          client_id: string;
          product_id: string;
          supplier: string;
          quantity_missing: number;
          reported_at: string;
          status: 'pending' | 'resolved';
        };
        Insert: {
          client_id: string;
          product_id: string;
          supplier: string;
          quantity_missing: number;
          reported_at: string;
          status: 'pending' | 'resolved';
        };
      };
    };
    Views: {
      /**
       * View agregada (security_invoker) por trás do resumo mostrado na Home:
       * faturamento do mês, % de positivação, contagem de visitas do dia,
       * pendências e tempo médio de visita — já filtrada por RLS ao promotor
       * autenticado.
       */
      promoter_dashboard_summary: {
        Row: {
          promoter_id: string;
          monthly_revenue: number;
          positivation_rate: number;
          visits_today_done: number;
          visits_today_total: number;
          pending_count: number;
          average_visit_minutes: number;
        };
      };
    };
  };
}
