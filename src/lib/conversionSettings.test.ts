// @ts-ignore bun test runner module
import { expect, it } from 'bun:test';
import { DEFAULT_APPLY_GAMMA_CORRECTION } from './conversionSettings';

it('enables gamma correction by default', () => {
  expect(DEFAULT_APPLY_GAMMA_CORRECTION).toBe(true);
});