---
title: "쿠폰 발급 시스템"
summary: "동시 요청 1만 건에서 중복 발급 0건"
period: "2026.03 ~ 2026.05"
role: "백엔드 3명 중 API·동시성 설계 담당"
stack: ["Spring Boot", "Redis", "MySQL"]
repo: "https://github.com/kiddo-psh/coupon"
metrics:
  - { label: "p99 응답시간", before: "1,240ms", after: "180ms" }
  - { label: "중복 발급", before: "37건", after: "0건" }
featured: true
order: 1
---

## 문제

선착순 쿠폰 발급에서 동시 요청이 몰리면 재고보다 많이 발급되었다.

## 아키텍처

Redis의 원자적 감소 연산으로 재고를 선점하고, 발급 이력을 비동기로 저장했다.

## 내 역할

발급 API와 동시성 제어를 설계하고 부하 테스트를 담당했다.

## 결과

중복 발급이 사라지고 p99 응답시간이 1,240ms에서 180ms로 줄었다. 재고 복원 로직은 아직 수동이다.
