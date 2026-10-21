import { describe, expect, it } from 'vitest';
import { toPlainPreview } from './markdown-preview';

describe('toPlainPreview', () => {
  it('drops heading, emphasis and quote markers but keeps their text', () => {
    expect(toPlainPreview('# 제목\n\n> 인용문\n\n**굵게**와 _기울임_, ~~취소~~')).toBe(
      '제목 인용문 굵게와 기울임, 취소',
    );
  });

  it('keeps link text and drops the url', () => {
    expect(toPlainPreview('[블로그](https://example.com) 방문')).toBe('블로그 방문');
  });

  it('drops images entirely, alt text included', () => {
    expect(toPlainPreview('![사진 설명](https://example.com/a.png)\n본문')).toBe('본문');
  });

  it('drops fenced code blocks, even one cut off before its closing fence', () => {
    expect(toPlainPreview('앞\n```ts\nconst a = 1;\n```\n뒤')).toBe('앞 뒤');
    expect(toPlainPreview('앞\n```ts\nconst a = 1;')).toBe('앞');
  });

  it('keeps inline code text without backticks', () => {
    expect(toPlainPreview('`npm test` 실행')).toBe('npm test 실행');
  });

  it('drops list bullets and numbers', () => {
    expect(toPlainPreview('- 하나\n* 둘\n1. 셋')).toBe('하나 둘 셋');
  });

  it('drops table separator rows and pipes', () => {
    expect(toPlainPreview('| 이름 | 값 |\n| --- | --- |\n| a | 1 |')).toBe('이름 값 a 1');
  });

  it('drops horizontal rules', () => {
    expect(toPlainPreview('위\n\n---\n\n아래')).toBe('위 아래');
  });

  it('drops raw html tags', () => {
    expect(toPlainPreview('<b>강조</b> 문장')).toBe('강조 문장');
  });

  it('returns an empty string for a body with no readable text', () => {
    expect(toPlainPreview('![](a.png)\n```\ncode\n```')).toBe('');
  });
});
