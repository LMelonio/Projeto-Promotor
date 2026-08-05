/**
 * Model de domínio do Questionário de PDV — assistente passo a passo, uma
 * pergunta de múltipla escolha por vez (wireframe "7-Questionário",
 * Documentação Funcional).
 *
 * Reescrito a partir da Documentação Funcional real: o PDF mostra "Pergunta
 * 3 de 8" com 4 alternativas de múltipla escolha (não as 4 perguntas
 * Sim/Não da Fase 3, assumidas antes de essa documentação existir — ver
 * `docs/DECISIONS.md`, item 21). Só a pergunta 3 (texto e alternativas)
 * aparece no wireframe; as demais 7 foram escritas no mesmo espírito
 * (checklist de PDV: exposição, preço, material, reposição) para fechar o
 * assistente de 8 perguntas — reconciliar textos/ordem se a especificação
 * real divergir.
 */
export interface QuestionnaireQuestion {
  id: string;
  text: string;
  options: string[];
}

export const PDV_QUESTIONNAIRE: QuestionnaireQuestion[] = [
  {
    id: 'product_presence',
    text: 'Os produtos LYNKZ estão presentes no ponto de venda?',
    options: ['Sim, todos', 'Parcialmente', 'Não, em falta', 'Não localizei'],
  },
  {
    id: 'merchandising_material',
    text: 'Há material de merchandising LYNKZ exposto?',
    options: ['Sim, em destaque', 'Sim, discreto', 'Não há material', 'Material danificado'],
  },
  {
    id: 'shelf_position',
    text: 'Os produtos LYNKZ estão bem posicionados na gôndola?',
    options: ['Sim, em destaque', 'Posição neutra', 'Posição ruim / no fundo', 'Não localizei'],
  },
  {
    id: 'price_tag',
    text: 'O preço na etiqueta está atualizado?',
    options: ['Sim', 'Desatualizado', 'Sem etiqueta', 'Não verificado'],
  },
  {
    id: 'competitor_presence',
    text: 'Há produtos concorrentes em destaque no mesmo espaço?',
    options: ['Não', 'Sim, discreto', 'Sim, em destaque', 'Domina o espaço'],
  },
  {
    id: 'stock_condition',
    text: 'Como está o estoque visível do produto?',
    options: ['Cheio', 'Adequado', 'Baixo', 'Vazio'],
  },
  {
    id: 'product_condition',
    text: 'A embalagem dos produtos expostos está em boas condições?',
    options: ['Sim', 'Poeira/suja', 'Danificada', 'Vencida'],
  },
  {
    id: 'staff_training',
    text: 'A equipe do PDV conhece os diferenciais dos produtos LYNKZ?',
    options: ['Sim, bem treinada', 'Conhece o básico', 'Pouco conhecimento', 'Não conhece'],
  },
];

/** Índice (0-3) da alternativa escolhida em cada pergunta, por `question.id`. */
export type QuestionnaireAnswers = Record<string, number>;
