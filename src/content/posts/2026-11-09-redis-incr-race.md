---
title: "Redis 원자성 — INCR만으로 동시 호출을 제한할 수 있을까"
description: "명령 하나의 원자성과 GET→판단→INCR 전체의 원자성을 구분합니다. 두 요청이 한 자리를 동시에 봤을 때 생기는 문제와 Lua 스크립트의 역할을 정리합니다."
pubDate: "2026-11-09T09:02:00+09:00"
category: dev
cover: "/images/covers/redis-incr-race.png"
draft: false
---

[앞 글](/posts/semaphore-per-worker)에서 워커별 세마포어가 서비스 전체의 호출 수를 함께 세지 못한다는 점을 봤습니다. 그래서 공유 저장소인 Redis에 현재 호출 수를 놓으면 해결될 것 같았어요.

```text
현재 호출 수를 GET
3보다 작으면 INCR
작업이 끝나면 DECR
```

Redis의 [`INCR`](https://redis.io/docs/latest/commands/incr/)는 원자적인 명령입니다. 그런데 **명령 하나가 원자적이라는 사실과 세 명령으로 만든 결정 전체가 원자적이라는 사실은 다릅니다.**

## 마지막 한 자리를 두 요청이 동시에 본다면

상한이 3이고 현재 점유가 2라고 가정해볼게요.

| 순서 | 요청 A | 요청 B | Redis 값 |
| --- | --- | --- | --- |
| 1 | `GET` → 2 |  | 2 |
| 2 |  | `GET` → 2 | 2 |
| 3 | “3 미만이니 진입” |  | 2 |
| 4 |  | “3 미만이니 진입” | 2 |
| 5 | `INCR` → 3 |  | 3 |
| 6 |  | `INCR` → 4 | 4 |

각 `INCR`는 값 하나를 안전하게 증가시켰습니다. 하지만 A와 B가 **같은 이전 값으로 판단**했기 때문에 제한은 초과됐어요. 애플리케이션 코드에서 `GET`과 `INCR` 사이에 네트워크 왕복이 있으면 이런 끼어들기가 가능합니다.

## 작은 재현: 확인과 변경 사이에 끼어들기

아래 코드는 Redis를 사용하지 않습니다. 두 호출의 순서를 고정해 경쟁 조건의 핵심만 재현하는 학습용 코드예요.

```python
import asyncio

async def main() -> None:
    current = 2
    both_read = asyncio.Event()
    reads = 0

    async def enter(name: str) -> None:
        nonlocal current, reads
        seen = current
        reads += 1
        if reads == 2:
            both_read.set()
        await both_read.wait()  # 둘 다 2를 읽은 뒤 계속 진행
        if seen < 3:
            current += 1
            print(name, "entered", current)

    await asyncio.gather(enter("A"), enter("B"))
    print("final:", current)  # 4

asyncio.run(main())
```

실제 Redis에서는 `current += 1`에 해당하는 `INCR` 자체가 쪼개지지 않습니다. 이 코드가 보여주는 문제는 증가 연산이 아니라 **읽기→판단→증가 사이의 간격**이에요.

## 확인과 자리 확보를 한 작업으로 묶기

Redis [Lua 스크립트](https://redis.io/docs/latest/develop/programmability/eval-intro/)는 Redis 서버에서 스크립트 실행을 하나의 원자적 작업으로 처리합니다. 카운터 방식의 최소 예시는 다음과 같아요.

```lua
-- KEYS[1]: 현재 점유 수 키, ARGV[1]: 상한
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local limit = tonumber(ARGV[1])
if current >= limit then
  return 0
end
return redis.call('INCR', KEYS[1])
```

첫 요청이 2를 읽고 3으로 올리는 동안 다른 스크립트가 그 사이에 끼어들 수 없으므로, 다음 요청은 3을 읽고 거절됩니다. 이 방식은 **확인과 확보의 경쟁 상태**를 해결합니다.

하지만 이 코드만으로 운영용 분산 세마포어가 완성되지는 않습니다. 작업자가 `DECR` 전에 비정상 종료되면 점유가 남을 수 있어요. 반대로 전체 카운터 키에 짧은 TTL만 달면 아직 실행 중인 작업의 점유까지 한꺼번에 사라질 수 있습니다. 해제 중복이나 소유자가 아닌 작업자의 해제도 막아야 합니다.

## 설계에서 남는 질문

자리 확보를 안전하게 만든 뒤에는 **누가 그 자리를 점유하는지**, **얼마나 오래 유효한지**, **종료나 장애 뒤 어떻게 회수하는지**가 남습니다. 이 문제는 단순 카운터보다 각 점유의 식별자와 만료시각을 관리하는 설계로 이어져요.

이 글의 Lua는 원자성 설명을 위한 최소 예시이며 실제 프로젝트에 적용하거나 Redis 서버에서 성능을 측정한 결과는 아닙니다. 다음 글에서 만료되는 사용 권한인 lease가 어떤 문제를 해결하고, 무엇까지는 보장하지 못하는지 살펴봅니다.

→ [다음 글: lease가 만료되면 LLM 작업도 끝날까?](/posts/lease-expiry-llm-work)

### 참고 자료

- [Redis: INCR](https://redis.io/docs/latest/commands/incr/)
- [Redis: Scripting with Lua](https://redis.io/docs/latest/develop/programmability/eval-intro/)
