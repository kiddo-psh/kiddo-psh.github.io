---
title: "세마포어와 워커 — 전체 LLM 호출 수를 제한하려면"
description: "asyncio.Semaphore가 제한하는 범위를 확인하고, 워커가 여러 개일 때 로컬 동시성 제한과 서비스 전체 제한이 어떻게 달라지는지 살펴봅니다."
pubDate: "2026-11-09T09:03:00+09:00"
category: dev
cover: "/images/covers/semaphore-per-worker.png"
draft: false
---

[앞 글](/posts/async-def-blocking-io)에서는 비동기 I/O가 대기 중인 태스크를 겹쳐 진행하도록 해준다는 점을 봤습니다. 그렇다면 LLM 제공자가 한 번에 처리할 수 있는 호출이 제한돼 있을 때는 어떻게 할까요? 가장 먼저 떠오르는 도구는 세마포어입니다.

```python
limit = asyncio.Semaphore(3)

async with limit:
    await call_llm()  # 설명용 호출
```

이 코드는 `limit` 객체를 공유하는 태스크 중 최대 세 개만 블록 안에 들어오게 합니다. 문제는 **누가 같은 세마포어 객체를 공유하는가**입니다.

## 세마포어는 무엇을 세는가

세마포어는 빈자리가 남았을 때 진입을 허용하고, 꽉 차면 빈자리가 날 때까지 기다리게 합니다. [Python 공식 문서](https://docs.python.org/3/library/asyncio-sync.html#semaphore)도 내부 카운터가 0이면 `acquire()`가 기다린다고 설명해요.

이것은 **동시에 진행 중인 작업 수**의 제한입니다. “초당 3건”이라는 요청률 제한과 다릅니다. 각 호출이 0.1초 만에 끝나면 한 초에 여러 묶음이 들어갈 수 있어요. 호출이 10초 걸리면 그동안 새 작업은 기다립니다.

또 한 가지 조건이 있습니다. 요청마다 `asyncio.Semaphore(3)`을 새로 만들면 요청끼리 제한을 공유하지 않습니다. 앱 시작 시 하나를 만들고 같은 프로세스의 해당 경로에서 사용해야 로컬 제한이 됩니다.

## 워커가 네 개면 왜 최대 열두 개가 될까

서버에서 “워커 4개”가 별도 프로세스 네 개를 뜻한다면, 각 워커는 기본적으로 자기 메모리를 갖습니다. 각 워커가 `Semaphore(3)`을 하나씩 만들면 다음과 같아요.

```text
워커 A: 동시 호출 최대 3개
워커 B: 동시 호출 최대 3개
워커 C: 동시 호출 최대 3개
워커 D: 동시 호출 최대 3개
-----------------------------
이 경로의 서비스 전체: 최대 12개 가능
```

여기서 12는 **네 워커가 모두 바쁘고 각자 같은 제한을 적용한다는 가정의 상한**입니다. 실제로 언제나 12개가 발생한다는 뜻은 아니에요. 프로세스의 메모리는 기본적으로 나뉘므로 워커 A의 세마포어는 워커 B가 몇 자리를 사용 중인지 알지 못합니다.

작은 실험으로 객체의 범위를 확인해볼 수 있습니다. 아래 코드는 실제 멀티프로세스 서버가 아니라, 한 프로세스 안에 **독립적인 워커 네 개를 흉내 낸 예시**입니다.

```python
import asyncio

async def main() -> None:
    limits = [asyncio.Semaphore(3) for _ in range(4)]
    active = 0
    peak = 0

    async def job(worker: int) -> None:
        nonlocal active, peak
        async with limits[worker]:
            active += 1
            peak = max(peak, active)
            await asyncio.sleep(0.05)
            active -= 1

    await asyncio.gather(*(job(w) for w in range(4) for _ in range(10)))
    print("peak:", peak)  # 이 예시에서는 12

asyncio.run(main())
```

각 워커를 흉내 낸 태스크는 자기 세마포어를 공유하지만, 네 그룹은 서로 제한을 공유하지 않습니다. 실제 멀티프로세스 환경에서는 `active` 변수마저 프로세스별로 나뉘므로, 전체 활성 호출 수를 관측하려면 별도의 집계가 필요해요.

## 전체 제한이 필요하다면

외부 LLM 계정에 서비스 전체 동시 호출 상한이 있다면, 모든 워커가 함께 보는 조정 수단을 고려해야 합니다. 공유 대기열, 중앙 게이트웨이, Redis 기반 점유 관리 등이 후보입니다. 로컬 세마포어도 버리지 않을 수 있어요. **워커 내부의 과도한 작업을 먼저 막는 제한**과 **서비스 전체 제한**은 범위가 다르기 때문입니다.

설계 전에 다음을 정해야 합니다.

- 제한 대상은 LLM 요청 시작 수인가, 아직 응답이 오지 않은 호출 수인가?
- 대기 중인 요청은 언제 포기할 것인가?
- 워커가 종료되면 점유한 자리를 어떻게 회수할 것인가?
- 제공자의 초당 요청 수와 동시 호출 수를 각각 어떻게 다룰 것인가?

이 글은 제한이 공유되는 **범위**를 확인한 학습 예시입니다. 냠냠코치나 다른 프로젝트에 Redis 분산 세마포어를 구현했다는 기록은 아닙니다. 다음 글에서는 Redis를 쓰더라도 `INCR` 하나만으로 전체 진입 제한이 완성되지 않는 이유를 살펴봅니다.

→ [다음 글: INCR는 원자적인데 왜 경쟁 상태가 생길까?](/posts/redis-incr-race)

### 참고 자료

- [Python: asyncio synchronization primitives](https://docs.python.org/3/library/asyncio-sync.html)
- [Uvicorn: workers](https://www.uvicorn.org/deployment/#built-in)
