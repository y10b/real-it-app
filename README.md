# ㄹㅇ있맵 (Real-It-Map)

다이소, 올리브영, CU, 이마트24, 메가박스, 롯데시네마, CGV — ㄹㅇ 다 있는 맵

## 주요 기능

- 현재 위치 기반 주변 매장 지도 표시
- 매장 유형별 필터링 (다이소/올리브영/CU/이마트24/영화관)
- 상품 검색 및 주변 매장 재고 확인
- 카카오맵 기반 지도 UI

## 기술 스택

- **프레임워크**: Next.js (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **지도**: Kakao Maps JavaScript SDK
- **데이터**: [daiso-mcp](https://github.com/hmmhmmhm/daiso-mcp) API

## 실행 방법

```bash
npm install
npm run dev
```

`.env.local`에 카카오 JavaScript 앱키 설정 필요:

```
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key
```

## 라이선스

MIT
