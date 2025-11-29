import { describe, test, expect } from 'bun:test';
import { getContrastColor } from './utils';

describe('getContrastColor', () => {
  test('明るい色（白背景）に対して黒を返す', () => {
    expect(getContrastColor('#FFFFFF')).toBe('#000000');
    expect(getContrastColor('#F0F0F0')).toBe('#000000');
    expect(getContrastColor('#CCCCCC')).toBe('#000000');
    expect(getContrastColor('#808080')).toBe('#000000');
  });

  test('暗い色（黒背景）に対して白を返す', () => {
    expect(getContrastColor('#000000')).toBe('#FFFFFF');
    expect(getContrastColor('#333333')).toBe('#FFFFFF');
    expect(getContrastColor('#666666')).toBe('#FFFFFF');
    expect(getContrastColor('#7F7F7F')).toBe('#FFFFFF');
  });

  test('#プレフィックスありの色コードを処理する', () => {
    expect(getContrastColor('#FFFFFF')).toBe('#000000');
    expect(getContrastColor('#000000')).toBe('#FFFFFF');
    // 赤色（#FF0000）の輝度は約76で、128未満なので白を返す
    expect(getContrastColor('#FF0000')).toBe('#FFFFFF');
  });

  test('#プレフィックスなしの色コードを処理する', () => {
    expect(getContrastColor('FFFFFF')).toBe('#000000');
    expect(getContrastColor('000000')).toBe('#FFFFFF');
    // 赤色（FF0000）の輝度は約76で、128未満なので白を返す
    expect(getContrastColor('FF0000')).toBe('#FFFFFF');
  });

  test('空文字列の場合、デフォルトの黒を返す', () => {
    expect(getContrastColor('')).toBe('#000000');
  });

  test('赤色（暗い）に対して白を返す', () => {
    // 純粋な赤（#FF0000）の輝度は約76で、128未満なので白を返す
    expect(getContrastColor('#FF0000')).toBe('#FFFFFF');
    // 明るい赤（#FF6666）の輝度は約180で、128以上なので黒を返す
    expect(getContrastColor('#FF6666')).toBe('#000000');
  });

  test('青色（暗い）に対して白を返す', () => {
    expect(getContrastColor('#0000FF')).toBe('#FFFFFF');
    expect(getContrastColor('#000080')).toBe('#FFFFFF');
  });

  test('緑色（中程度）の判定', () => {
    // 緑色の輝度は中程度
    expect(getContrastColor('#00FF00')).toBe('#000000'); // 明るい緑
    expect(getContrastColor('#008000')).toBe('#FFFFFF'); // 暗い緑
  });

  test('境界値（閾値128）付近の色', () => {
    // 輝度が約128の色（#808080）
    expect(getContrastColor('#808080')).toBe('#000000');
    // 少し明るい色
    expect(getContrastColor('#808081')).toBe('#000000');
    // 少し暗い色
    expect(getContrastColor('#80807F')).toBe('#FFFFFF');
  });
});
