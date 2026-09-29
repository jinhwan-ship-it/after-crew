# app/data

| 파일 | 내용 |
|---|---|
| `map.js` | 마포구 일대 실지형 벡터 지도 + 코스 8개 좌표 (`window.AC_MAP`) |
| `content.js` | 활동·코스 이름·회차·대화 예시·프로필 아이콘 12종 (`window.AC_DATA`) |

## map.js 출처와 범위

- 출처: © OpenStreetMap contributors, ODbL. 지도가 보이는 모든 화면에 출처 표기가 있어야 한다 (MANUAL R-09)
- 추출: 2026-09-29, Overpass API 1회 (브라우저에서 요청 → 좌표 변환·단순화 → 정적 문자열). 런타임 네트워크 없음
- 범위: 위도 37.522~37.592, 경도 126.862~126.968 → 캔버스 1000×833 (등장방형, 위도 37.557° 코사인 보정)
- 레이어: `water`(한강 relation 152336 + 하천 수면, 1 dec), `parks`(leisure=park, 면적 450단위² 이상), `streams`(waterway river·stream·canal), `major`(motorway·trunk), `minor`(primary·secondary, 12단위 미만 조각 제거, DP 2.0)
- 코스(`routes`): 한강 북안 링(망원나들목→양화대교·마포나들목, 강변에서 30~150m 안쪽 오프셋), 용산선 터널 선(경의선숲길 홍대입구→가좌), 불광천·홍제천 하천 선, 노을공원·효창공원 경계, 여의도 북안. `m`은 실측 길이(미터), 왕복·두 바퀴는 app.js가 ×2

## 다시 추출할 때 (Overpass)

```
[out:json][timeout:120];
(wr["natural"="water"](37.522,126.862,37.592,126.968);wr["waterway"="riverbank"](37.522,126.862,37.592,126.968););out geom;
way["waterway"~"^(river|stream|canal)$"](37.522,126.862,37.592,126.968);out geom;
wr["leisure"="park"](37.522,126.862,37.592,126.968);out geom;
way["highway"~"^(motorway|trunk|primary|secondary)$"](37.522,126.862,37.592,126.968);out geom;
```

투영: `x = (lon - 126.862) / 0.106 × 1000`, `y = (37.592 - lat) / 0.070 × 833`. 범위를 바꾸면 `bounds`와 캔버스 높이를 같이 바꾼다.
