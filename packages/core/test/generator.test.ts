import { describe, expect, it } from 'vitest';
import { generatePassword, generatorEntropy, randomBelow, scorePassword } from '@passhold/core';

describe('the generator', () => {
  it('makes passwords of the asked length from the asked kinds, one of each at least', () => {
    for (let run = 0; run < 200; run++) {
      const password = generatePassword({ length: 8, lower: true, upper: true, digits: true, symbols: true });
      expect(password).toHaveLength(8);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[^a-zA-Z0-9]/);
    }
    expect(generatePassword({ length: 30, upper: false, digits: false, symbols: false })).toMatch(/^[a-z]{30}$/);
  });

  it('leaves out look-alike characters when asked', () => {
    const many = Array.from({ length: 50 }, () => generatePassword({ length: 64, avoidAmbiguous: true })).join('');
    expect(many).not.toMatch(/[Il1O0o]/);
  });

  it('clamps what it is given rather than making a weak password', () => {
    expect(generatePassword({ length: 1 })).toHaveLength(8);
    expect(generatePassword({ length: 10_000 })).toHaveLength(128);
    expect(generatePassword({ length: Number.NaN })).toHaveLength(20);
    expect(generatePassword({ lower: false, upper: false, digits: false, symbols: false })).toMatch(/^[a-z]+$/);
  });

  // Modulo bias would favour the low values of a bound that does not divide
  // 2^32. Three buckets over 60,000 draws each land within a few percent.
  it('draws without bias', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 60_000; i++) counts[randomBelow(3)]!++;
    for (const count of counts) expect(Math.abs(count - 20_000)).toBeLessThan(800);
    expect(() => randomBelow(0)).toThrow();
  });

  it('never repeats itself', () => {
    const seen = new Set(Array.from({ length: 1000 }, () => generatePassword()));
    expect(seen.size).toBe(1000);
  });

  it('says what the default is worth, and scores it strong', () => {
    expect(generatorEntropy()).toBeGreaterThan(110);
    expect(scorePassword(generatePassword()).score).toBe(4);
    expect(scorePassword('123456').warnings).toEqual(['short', 'digitsOnly']);
  });
});
