import { test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { inlineStylesRecursively } from '../ClientFinancialReport.jsx';

test('first two sections scale fonts by 75%', () => {
  const dom = new JSDOM(`
    <div id="report">
      <section id="report-header"><p style="font-size:16px">Header</p></section>
      <section id="client-info"><p style="font-size:16px">Client</p></section>
      <section id="other"><p style="font-size:16px">Other</p></section>
    </div>
  `);
  const report = dom.window.document.getElementById('report');
  const sections = Array.from(report.children);
  sections.forEach((sec, index) => {
    inlineStylesRecursively(sec, 'body', index < 2 ? 0.75 : 1);
  });
  const headerFont = report.querySelector('#report-header p').style.fontSize;
  const clientFont = report.querySelector('#client-info p').style.fontSize;
  const otherFont = report.querySelector('#other p').style.fontSize;
  expect(headerFont).toBe('12px');
  expect(clientFont).toBe('12px');
  expect(otherFont).toBe('16px');
});
