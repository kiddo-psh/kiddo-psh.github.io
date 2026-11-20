---
title: "꾸기"
pageTitle: "꾸기: 사진 한 장으로 음식을 알아보고, 근거를 대며 영양을 답하다"
essay: true
summary: "음식 사진에서 음식 영역을 찾아 영역마다 1,020가지 음식 중 후보 3개를 고르는 비전 모델과, 공개 영양 문서를 근거로 답하는 RAG 채팅을 만들었다."
period: "2026-09 ~ 2026-11-17"
role: "음식 사진 인식 모델, 영양 RAG 채팅"
stack:
  - ConvNeXt-Base(CLIP 사전학습, timm)
  - OWL-ViT B/32
  - OWLv2(학습 데이터 준비)
  - AI Hub 74번, 71564번, 242번 공개 데이터
  - H200 GPU
  - AdamW
  - 혼합 정밀도(bf16)
  - intfloat/multilingual-e5-small
  - BM25(실험)
  - OpenAI API
  - FastAPI
  - ONNX Runtime(CPU)
  - MLflow 모델 레지스트리
  - SSE
  - nginx
  - Android
  - Spring
featured: true
order: 1
cover: "/images/projects/kkugi/cover.png"
logo: "/images/projects/kkugi/logo.png"
headline: "사진 한 장으로 음식을 알아보고, 근거를 대며 영양을 답하다"
projectType: "음식 사진 인식 · 영양 RAG 채팅"
cardRole: "음식 사진 인식 모델 · 영양 RAG 채팅"
validation: "검증 세트 top-5 96.6%(정답 박스 크롭) · 운영 요청 p95 6.74초 · 품질 45/48"
contributions:
  - "음식 사진 인식: 음식 이름만 맞히는 전용 비전 모델을 만들었다. 양과 영양값은 다른 경로에서 다룬다."
  - "영양 채팅: 영양 질문에 공개 문서를 근거로 답하고, 답변의 수치와 인용을 코드로 검증한다."
collaboration: "Android 앱은 Spring 백엔드만 호출하고, 백엔드가 FastAPI 추론 서버를 호출한다."
outcome: "음식 사진에서 음식 영역을 찾아 영역마다 1,020가지 음식 중 후보 3개를 고르는 비전 모델과, 공개 영양 문서를 근거로 답하는 RAG 채팅을 만들었다."
---
