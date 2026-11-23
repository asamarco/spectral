// @ts-ignore bun test runner module
import { expect, test } from 'bun:test';
import { buildAngleList } from './angleSweep';
test('range 0-75 step 15 gives six angles', () => {
  expect(buildAngleList(0, 75, 15)).toEqual([0, 15, 30, 45, 60, 75]);
});
test('invalid step gives no angles', () => {
  expect(buildAngleList(0, 60, 0)).toEqual([]);
});
