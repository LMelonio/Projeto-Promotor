/**
 * `aes-js` não publica tipos oficiais nem tem pacote @types confiável.
 * Declaração mínima cobrindo apenas a API que de fato usamos em
 * `secureStorageAdapter.ts` (modo CTR + utilitários hex/utf8).
 */
declare module 'aes-js' {
  namespace ModeOfOperation {
    class ctr {
      constructor(key: Uint8Array, counter: Counter);
      encrypt(bytes: Uint8Array): Uint8Array;
      decrypt(bytes: Uint8Array): Uint8Array;
    }
  }

  class Counter {
    constructor(initialValue: number);
  }

  const utils: {
    hex: {
      fromBytes(bytes: Uint8Array | number[]): string;
      toBytes(hex: string): number[];
    };
    utf8: {
      fromBytes(bytes: Uint8Array): string;
      toBytes(text: string): Uint8Array;
    };
  };

  export { ModeOfOperation, Counter, utils };
}
