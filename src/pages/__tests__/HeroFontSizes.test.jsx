import { test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { inlineStylesRecursively } from '../ClientFinancialReport.jsx';

test('hero heading and FIN amount use expected font sizes', () => {
  const dom = new JSDOM(`
    <div id="hero">
      <h1 class="text-6xl">Your Financial Independence</h1>
      <p>Financial Independence Number</p>
      <p class="text-7xl">$1,234,567</p>
    </div>
  `);
  const hero = dom.window.document.getElementById('hero');
  inlineStylesRecursively(hero, 'header');
  const heading = hero.querySelector('h1');
  const finAmount = hero.querySelectorAll('p')[1];
  expect(heading.style.fontSize).toBe('64px');
  expect(finAmount.style.fontSize).toBe('72px');
});
