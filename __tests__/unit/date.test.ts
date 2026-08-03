import {
  daysAgoLabel,
  elapsedLabel,
  formatCurrencyBRL,
  formatPercentage,
} from '@/shared/utils/date';

describe('shared/utils/date', () => {
  describe('daysAgoLabel', () => {
    it('retorna "sem registro" quando a data é nula', () => {
      expect(daysAgoLabel(null)).toBe('sem registro');
    });

    it('retorna "hoje" para o dia atual', () => {
      expect(daysAgoLabel(new Date().toISOString())).toBe('hoje');
    });

    it('retorna "há 1 dia" no singular', () => {
      const ontem = new Date(Date.now() - 1 * 86_400_000).toISOString();
      expect(daysAgoLabel(ontem)).toBe('há 1 dia');
    });

    it('retorna "há N dias" no plural', () => {
      const dezDiasAtras = new Date(Date.now() - 10 * 86_400_000).toISOString();
      expect(daysAgoLabel(dezDiasAtras)).toBe('há 10 dias');
    });
  });

  describe('formatCurrencyBRL', () => {
    it('formata valores em Real sem casas decimais', () => {
      expect(formatCurrencyBRL(128450)).toMatch(/R\$\s*128\.450/);
    });
  });

  describe('formatPercentage', () => {
    it('converte taxa 0-1 em percentual inteiro', () => {
      expect(formatPercentage(0.42)).toBe('42%');
      expect(formatPercentage(1)).toBe('100%');
      expect(formatPercentage(0)).toBe('0%');
    });
  });

  describe('elapsedLabel', () => {
    it('formata minutos quando o total é menor que 1 hora', () => {
      const inicio = new Date(Date.now() - 25 * 60_000).toISOString();
      expect(elapsedLabel(inicio)).toBe('há 25 min');
    });

    it('formata horas cheias sem minutos', () => {
      const inicio = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
      expect(elapsedLabel(inicio)).toBe('há 2h');
    });

    it('formata horas e minutos combinados', () => {
      const inicio = new Date(Date.now() - (90 * 60_000 + 5_000)).toISOString();
      expect(elapsedLabel(inicio)).toBe('há 1h 30min');
    });
  });
});
