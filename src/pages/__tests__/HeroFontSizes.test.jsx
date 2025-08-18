import { test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { render } from '@testing-library/react';
import FinancialIndependenceSummary from '../../components/financial/FinancialIndependenceSummary.jsx';
import { inlineStylesRecursively } from '../ClientFinancialReport.jsx';

test('hero heading and FIN amount use expected font sizes', () => {
  const dom = new JSDOM(`
    <div id="hero">
      <h2 class="text-xl">Your Financial Independence</h2>
      <p class="text-sm">Financial Independence Number</p>
      <p class="text-xl">$1,234,567</p>
    </div>
  `);
  const hero = dom.window.document.getElementById('hero');
  inlineStylesRecursively(hero, 'header');
  const heading = hero.querySelector('h2');
  const label = hero.querySelectorAll('p')[0];
  const finAmount = hero.querySelectorAll('p')[1];
  expect(heading.style.fontSize).toBe('18px');
  expect(label.style.fontSize).toBe('14px');
  expect(finAmount.style.fontSize).toBe('18px');
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
  expect(heading.style.fontSize).toBe('18px');
  expect(paragraph.style.fontSize).toBe('14px');
});

test('client-info elements use Tailwind font sizes', () => {
  const dom = new JSDOM(`
    <style>
      .text-xl { font-size: 20px; }
      .text-sm { font-size: 14px; }
    </style>
    <div id="client-info">
      <h4 class="text-xl">Client Information</h4>
      <p class="text-sm">Some detail</p>
    </div>
  `);
  const clientInfo = dom.window.document.getElementById('client-info');
  inlineStylesRecursively(clientInfo);
  const heading = clientInfo.querySelector('h4');
  const detail = clientInfo.querySelector('p');
  expect(heading.style.fontSize).toBe('18px');
  expect(detail.style.fontSize).toBe('14px');
});

test('FIN summary key elements share font size', () => {
  const style = document.createElement('style');
  style.textContent = '.text-xl{font-size:18px}.text-base{font-size:18px}';
  document.head.appendChild(style);
  const { container } = render(
    <FinancialIndependenceSummary fin={1234567} clientName="John Doe" />
  );
  const title = container.querySelector('h2');
  const clientHeading = container.querySelectorAll('p')[0];
  const finAmount = container.querySelectorAll('p')[2];
  const expected = getComputedStyle(title).fontSize;
  expect(expected).toBe('18px');
  expect(getComputedStyle(clientHeading).fontSize).toBe(expected);
  expect(getComputedStyle(finAmount).fontSize).toBe(expected);
});

