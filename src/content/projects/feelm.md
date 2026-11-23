---
title: "feelm"
pageTitle: "feelm: 계정이 바뀌는 순간과 취향이 카드가 되는 순간을 맡다"
essay: true
summary: "감상 기록을 필름으로, 영화 취향을 팝콘 맛으로 보여 주는 영화 추천 서비스입니다. 계정·인증의 실패 조건을 다루고, 화면을 실제 API에 연결하고, 반기 취향 리포트의 캐릭터 카드 16종을 만들었습니다."
period: "2026.08.26 ~ 2026.10.01 (SSAFY 2학기 특화 프로젝트, 7인)"
role: "백엔드 — 계정·인증·온보딩, 프론트엔드 API 연동, 취향 리포트 캐릭터 카드"
award: "SSAFY 2학기 특화 프로젝트 1등"
stack:
  - Spring Boot
  - PostgreSQL
  - Redis
  - Spark / PySpark
  - Hadoop HDFS
  - Kafka
  - pgvector
  - React
featured: true
order: 4
relatedPosts: []
cover: "/images/projects/feelm/cover.png"
logo: "/images/projects/feelm/logo.png"
headline: "계정이 바뀌는 순간과 취향이 카드가 되는 순간을 맡다"
projectType: "7인 팀 · SSAFY 2학기 특화 프로젝트"
cardRole: "계정·인증 백엔드 / API 연동 / 캐릭터 카드"
validation: "계약·동시성 테스트와 배포 전 로컬 검증(로그인·메일 제한 경계)"
contributions: ["가입·로그인·재설정·소셜 인증·탈퇴·차단 도메인 구현","메일 발송 제한, 비밀번호 변경 시 재설정 토큰 무효화, 잠금 순서를 나눈 탈퇴 흐름","공통 HTTP 클라이언트·인증 세션과 주요 화면 API 연동","OTT 화면에서 서버가 주지 않는 일치도를 빼고 실제 응답에 맞게 연동","반기 취향 리포트 캐릭터 카드 16종의 판정·문구·그림·공유"]
collaboration: "팀은 대규모 평점 전처리와 추천 모델·서빙·화면을 함께 구성했습니다. 제 구현 범위는 계정·인증, 화면 연동, 캐릭터 카드이며 추천 파이프라인 전체와 4컷 화면·인화 연출, 리포트 이미지 저장은 팀원의 작업입니다."
outcome: "실패·만료·경쟁 요청을 다루는 인증 코드와 테스트를 남기고, 목업 화면을 실제 API에 연결하고, 캐릭터 카드 16종을 판정부터 그림까지 만들었습니다. 팀은 SSAFY 2학기 특화 프로젝트 1등을 기록했습니다. 실제 사용자 지표는 측정하지 않았습니다."
---
