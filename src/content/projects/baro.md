---
title: "주차바로"
pageTitle: "주차바로: 카메라가 본 차량을 '이동 요청할 사건'으로 바꾸다"
essay: true
summary: "아파트 주차 위반을 감지하고, 연락처를 주고받지 않고 이동 요청부터 이동 재확인까지 잇는 서비스다. 천장 카메라 영상에서 위반 사건을 만드는 AI 판정 파이프라인을 정리했다."
period: "2026.07.06 ~ 2026.08.14 (SSAFY 공통 프로젝트)"
role: "AI 파트(차량 추적·주차 판정 파이프라인), 스크럼 마스터"
stack:
  - Jetson Orin Nano
  - YOLOv8
  - ByteTrack
  - TensorRT
  - OpenCV
  - FastAPI
  - Spring Boot
  - MySQL
  - React Native
  - Vue 3
featured: true
order: 2
relatedPosts:
  - seven-person-team-retrospective
  - claude-code-retrospective
cover: "/images/projects/baro/cover.png"
logo: "/images/projects/baro/logo.png"
headline: "카메라가 본 차량을 '이동 요청할 사건'으로 바꾸다"
projectType: "7인 팀 · SSAFY 공통 프로젝트 · AIoT"
cardRole: "차량 추적·주차 판정 / 스크럼 마스터"
validation: "파일럿 영상 리플레이로 판정 기준 실측(진입 1초 · 이탈 5초)"
contributions:
  - "판정 엔진 설계·구현: 구역 방문 상태 머신 → 주차 확정 → 위반 규칙 → 사건 축약 → 출차 판정"
  - "광각 카메라 캘리브레이션과 화면 밖 오탐을 줄이는 입력 여백 처리"
  - "녹화 영상 리플레이·판정 회귀 테스트와 단계별 성능 계측 도구 구현"
  - "시연용 실시간 판정 오버레이 스트리밍과 시연 시나리오 설계"
  - "검출 모델 학습 파이프라인(버전 태깅·메타데이터 기록·번호판 키포인트 형식 전환)"
  - "스크럼 마스터로 일일 스크럼과 Jira 관리"
collaboration: "번호판 인식·장치·서버·앱을 연결한 전체 서비스는 팀 결과입니다. 저는 판정·계측·시연 스트리밍을 맡았으며, 입력 포맷·해상도 조정, GPU 보정, TensorRT 최적화, 출차 경로 방해 관계 모듈은 팀원이 구현했습니다."
outcome: "파일럿 모형에서 감지 → 사건 → 앱 알림 → 응답 → 카메라 재확인 흐름을 연결했다. 위반 판정의 종단 정확도는 측정하지 않았다."
---
