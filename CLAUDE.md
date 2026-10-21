@AGENTS.md

# souplog 항상 지킬 것

- **RLS가 유일한 신뢰 경계다.** 권한은 `supabase/schema.sql`의 정책이 강제한다. 앱의 `requireUser()`는 이중 장치일 뿐이다. `service_role` 키는 어디에도 쓰지 않는다.
- **댓글 `password_hash`는 앱에서 select 하지 않는다.** 해시·검증은 `create_comment`/`delete_comment` 함수 안에서만 하고, 목록은 `comments_public` 뷰로 읽는다.
- **raw HTML을 실행하지 않는다.** 마크다운에 `rehype-raw`를 넣지 않고, `dangerouslySetInnerHTML`을 쓰지 않는다. 댓글은 텍스트로만 렌더링한다.
- **색·간격·타이포 값은 `src/styles/tokens.css` 토큰으로만 쓴다.** 컴포넌트에 값을 직접 박지 않는다.
- UI 문구와 에러 메시지는 한국어로 쓴다.
- 스키마를 바꾸면 커밋 본문에 "schema.sql을 SQL Editor에서 다시 실행해야 한다"와 실행 순서(코드 배포 전/후)를 적는다.

작업별 세부 규칙은 프로젝트 스킬에 있다.

- `supabase-schema` — schema.sql, RLS, GRANT, 뷰, 버킷
- `data-and-actions` — `lib/<도메인>.ts` 조회 함수, Server Action, 폼 제출, 업로드
- `ui-conventions` — 토큰, 공용 컴포넌트, 버튼 문구, 로딩 스켈레톤, 이미지, CSP
