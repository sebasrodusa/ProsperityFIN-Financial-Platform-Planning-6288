import { test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { inlineStylesRecursively } from '../ClientFinancialReport.jsx';

test('hero heading and FIN amount use expected font sizes', () => {
  const dom = new JSDOM(`
    <div id="hero">
      <h2 class="text-3xl">Your Financial Independence</h2>
      <p>Financial Independence Number</p>
      <p class="text-5xl">$1,234,567</p>
    </div>
  `);
  const hero = dom.window.document.getElementById('hero');
  inlineStylesRecursively(hero, 'header');
  const heading = hero.querySelector('h2');
  const finAmount = hero.querySelectorAll('p')[1];
  expect(heading.style.fontSize).toBe('30px');
  expect(finAmount.style.fontSize).toBe('48px');
});
