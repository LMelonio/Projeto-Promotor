import { distanceKm, formatDistance } from '@/shared/utils/geo';

describe('shared/utils/geo', () => {
  describe('distanceKm', () => {
    it('retorna 0 para o mesmo ponto', () => {
      const point = { latitude: -23.5505, longitude: -46.6333 };
      expect(distanceKm(point, point)).toBeCloseTo(0, 5);
    });

    it('calcula a distância aproximada entre dois pontos conhecidos (São Paulo -> Rio de Janeiro)', () => {
      const saoPaulo = { latitude: -23.5505, longitude: -46.6333 };
      const rioDeJaneiro = { latitude: -22.9068, longitude: -43.1729 };

      const km = distanceKm(saoPaulo, rioDeJaneiro);

      expect(km).toBeGreaterThan(350);
      expect(km).toBeLessThan(370);
    });
  });

  describe('formatDistance', () => {
    it('formata distâncias abaixo de 1km em metros', () => {
      expect(formatDistance(0.85)).toBe('850 m');
    });

    it('formata distâncias de 1km ou mais em km com uma casa decimal', () => {
      expect(formatDistance(1.234)).toBe('1.2 km');
    });
  });
});
