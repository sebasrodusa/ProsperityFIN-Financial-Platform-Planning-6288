import { test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { inlineStylesRecursively } from '../ClientFinancialReport.jsx';

test('hero heading and FIN amount use expected font sizes', () => {
  const dom = new JSDOM(`
    <div id="hero">
      <h2 class="text-3xl">Your Financial Independence</h2>
      <p>Financial Independence Number</p>
      <p class="text-7xl">$1,234,567</p>
    </div>
  `);
  const hero = dom.window.document.getElementById('hero');
  inlineStylesRecursively(hero, 'header');
  const heading = hero.querySelector('h2');
  const label = hero.querySelectorAll('p')[0];
  const finAmount = hero.querySelectorAll('p')[1];
  expect(heading.style.fontSize).toBe('30px');
  expect(label.style.fontSize).toBe('24px');
  expect(finAmount.style.fontSize).toBe('72px');
});

test('body heading and paragraph use new defaults', () => {
  const dom = new JSDOM(`
    <div id="content">
      <h2>Section Heading</h2>
      <p>Some paragraph</p>
    </div>
  `);
  const content = dom.window.document.getElementById('content');
  inlineStylesRecursively(content);
  const heading = content.querySelector('h2');
  const paragraph = content.querySelector('p');
  expect(heading.style.fontSize).toBe('24px');
  expect(paragraph.style.fontSize).toBe('12px');
});

test('client-info heading respects body defaults', () => {
  const dom = new JSDOM(`
    <style>.text-base { font-size: 16px; }</style>
    <div id="client-info">
      <h4 class="text-base">Client Information</h4>
    </div>
  `);
  const clientInfo = dom.window.document.getElementById('client-info');
  inlineStylesRecursively(clientInfo);
  const heading = clientInfo.querySelector('h4');
  expect(heading.style.fontSize).toBe('16px');
});
