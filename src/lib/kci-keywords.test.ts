import { describe, expect, it } from 'vitest';
import { kciKeywordTrendUrl, parsePopularKeywordsHtml } from './kci-keywords';

function keywordItem(rank: number, keyword: string): string {
  return `
    <li>
      <span class="pls-link"><span class="num">${rank}</span><em class="oneline">${keyword}</em></span>
      <div class="flex-end">
        <a href="javascript:fncKeywordSearch(2,'${keyword}')" class="colorBlue" title="이 키워드로 연구동향 분석"></a>
      </div>
    </li>`;
}

function fieldBlock(field: string, keywords: string[]): string {
  return `
    <div class="pls-con swiper-slide">
      <dl class="nopm">
        <dt class="updown-btn-area">
          ${field}<button type="button" class="toggle"><i class="far fa-plus"></i></button>
        </dt>
        <dd><ol class="nopm">${keywords.map((keyword, index) => keywordItem(index + 1, keyword)).join('')}</ol></dd>
      </dl>
    </div>`;
}

function fragment(blocks: string): string {
  return `
    <h3 class="main-tit">
      <em>대분야별 인기 키워드 순위</em><span> 학술분야의 학술지가 2025년에 발행한 논문에 등록 된 키워드의 순위입니다.</span>
    </h3>
    ${blocks}`;
}

describe('parsePopularKeywordsHtml', () => {
  it('reads the year and each field with its ranked keywords', () => {
    const html = fragment(fieldBlock('인문학', ['한국어 교육', 'ChatGPT']) + fieldBlock('사회과학', ['인공지능']));

    expect(parsePopularKeywordsHtml(html)).toEqual({
      year: '2025',
      fields: [
        { field: '인문학', keywords: ['한국어 교육', 'ChatGPT'] },
        { field: '사회과학', keywords: ['인공지능'] },
      ],
    });
  });

  it('decodes entities in keywords', () => {
    const html = fragment(fieldBlock('인문학', ['R&amp;D', '&quot;여성&quot;']));

    expect(parsePopularKeywordsHtml(html).fields[0]?.keywords).toEqual(['R&D', '"여성"']);
  });

  it('leaves the year empty when the heading changes', () => {
    const html = fieldBlock('인문학', ['정체성']);

    expect(parsePopularKeywordsHtml(html).year).toBe('');
  });

  it('throws when no field has keywords', () => {
    expect(() => parsePopularKeywordsHtml(fragment(''))).toThrow('KCI 인기 키워드가 비어 있습니다.');
  });
});

describe('kciKeywordTrendUrl', () => {
  it('opens the KCI keyword trend page already searching the keyword', () => {
    expect(kciKeywordTrendUrl('생성형 AI')).toBe(
      'https://www.kci.go.kr/kciportal/po/search/poLateRelaKwdList.kci?poLateRelaKwdBean.keyword=%EC%83%9D%EC%84%B1%ED%98%95+AI',
    );
  });
});
