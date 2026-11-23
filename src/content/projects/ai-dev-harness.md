---
title: "ai-dev-harness"
pageTitle: "ai-dev-harness: AI 코딩 도구를 쓰는 팀에 규칙과 검증을 설치하다"
essay: true
summary: "팀의 AI 작업 절차를 새 저장소에 설치하는 개발 가드레일 키트를 만들었다. 규칙 문서와 hooks, MR·CI 검사로 표준을 벗어난 변경을 막고, Claude Code와 Codex의 사용량과 검증 기록을 같은 기준으로 모아 본다."
period: "2026.09 ~ 진행 중"
role: "AgentOps 설계·구현, 개발 규칙 자동화와 적용 검증"
stack:
  - Python
  - Claude Code hooks
  - GitLab CI
  - GitHub Actions
  - Spring Boot
  - React
  - Android
  - OpenTelemetry
  - Prometheus
  - Loki
  - Grafana
repo: "https://github.com/kiddo-psh/ai-dev-harness"
featured: true
order: 3
relatedPosts:
  - ai-rule-docs-cleanup
  - ai-pipeline-risk-gates
cover: "/images/projects/ai-dev-harness/cover.png"
logo: "/images/projects/ai-dev-harness/logo.png"
headline: "AI 코딩 도구를 쓰는 팀에 규칙과 검증을 설치하다"
projectType: "개인 프로젝트 · AI 실행의 가시성과 신뢰성"
cardRole: "사용량 정규화·작업 귀속·수집 복구·실행 근거 구현"
cardHighlights:
  - "Claude Code·Codex 사용량 정규화, 세션과 작업·PR 연결"
  - "중복 수집 방지·실패 재전송, 테스트 실행과 코드 상태 연결"
  - "OpenTelemetry·Prometheus·Loki·Grafana 관측, 꾸기 적용 이력"
validation: "꾸기 리뷰 확정 결함 230건(리뷰 261개) · 설치 리허설 64분 · MR 단계 CVE 8건 차단"
contributions:
  - "공통 규칙 설치·드리프트 검사와 위험 단계별 hooks·CI 검사 설계·구현"
  - "Claude Code·Codex의 사용량을 같은 사건·단가·날짜 기준으로 정규화하는 v2 구현"
  - "세션을 작업·PR에 연결하고 검증·개입·대기·리뷰 근거를 수집하는 모듈 구현"
  - "이벤트 기반 수집, 실패 재시도와 중복 제거, 로컬·팀 대시보드 구성"
collaboration: "개인 프로젝트다. 꾸기 팀 프로젝트의 저장소에 키트를 적용했다."
outcome: "꾸기 개발에서 키트 절차 안의 리뷰 261개가 실제 결함 230건을 찾아 고쳤다(꾸기 팀 리뷰 기록 감사 2026-11-09, 비교군 없음). 빈 저장소 리허설에서는 첫 엄격 MR 병합까지 64분, 의존성 감사가 CVE 8건을 MR 단계에서 막았다."
---
