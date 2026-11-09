---
title: "비동기 I/O — async def만으로 여러 요청을 처리할 수 있을까"
description: "코루틴 선언과 실제 비동기 I/O를 구분합니다. time.sleep과 asyncio.sleep의 작은 재현 실험으로 이벤트 루프가 언제 다른 요청을 처리하는지 살펴봅니다."
pubDate: "2026-11-09T09:04:00+09:00"
category: dev
cover: "/images/covers/async-def-blocking-io.png"
draft: false
---

LLM 호출 코드를 `async def`로 감싸면 여러 요청을 동시에 처리할 수 있을까요? 처음에는 함수 앞에 `async`를 붙이면 네트워크 대기 중에 다른 요청이 진행될 거라고 생각했습니다. 그런데 **함수의 선언 방식과 함수 안에서 실제로 하는 일은 별개**였어요.

이 글의 코드는 개념을 확인하기 위한 최소 예시입니다. 제 프로젝트의 서버 성능을 측정한 결과는 아닙니다.

## `async def`는 실행을 시작하는 명령이 아니다

`async def`는 코루틴 함수를 정의합니다. 호출하면 바로 본문을 실행하는 대신 코루틴 객체를 돌려줘요. `await`하거나 태스크로 등록해야 이벤트 루프에서 실행됩니다. [Python 공식 문서](https://docs.python.org/3/library/asyncio-task.html#coroutines)는 코루틴을 호출하는 것만으로 실행 일정이 잡히지 않는다고 설명합니다.

```python
import asyncio

async def answer():
    print("실행")

async def main():
    pending = answer()  # 아직 "실행"이 출력되지 않는다
    await pending        # 여기서 실행된다

asyncio.run(main())
```

`await`는 현재 코루틴이 기다리는 작업의 결과를 받는 표현입니다. 기다리는 대상이 비동기 I/O라면 이벤트 루프가 그 사이 다른 준비된 태스크를 진행할 수 있어요. 반대로 `async def` 안에서 동기 호출을 실행하면 그 호출이 끝날 때까지 이벤트 루프가 막힐 수 있습니다.

## 같은 3개 작업을 두 방식으로 기다려 보기

다음 코드는 외부 패키지 없이 실행할 수 있습니다. 실제 HTTP 요청 대신 0.2초의 대기로 네트워크 대기 상황을 흉내 냈어요.

```python
import asyncio
import time

async def blocking_call(index: int) -> None:
    time.sleep(0.2)  # 동기 대기: 이 스레드를 멈춘다
    print("blocking", index)

async def yielding_call(index: int) -> None:
    await asyncio.sleep(0.2)  # 이벤트 루프에 제어권을 돌려준다
    print("yielding", index)

async def measure(label: str, call) -> None:
    started = time.perf_counter()
    await asyncio.gather(*(call(i) for i in range(3)))
    print(label, round(time.perf_counter() - started, 2), "s")

async def main() -> None:
    await measure("blocking", blocking_call)
    await measure("yielding", yielding_call)

asyncio.run(main())
```

첫 번째는 약 0.6초, 두 번째는 약 0.2초가 예상됩니다. `gather`에 작업 세 개를 넘긴 건 같지만, 첫 번째의 `time.sleep`은 다른 작업에 실행 기회를 주지 않아요. 두 번째는 `await asyncio.sleep`에서 양보하므로 세 대기가 겹칩니다. 실제 소요 시간은 실행 환경의 스케줄링에 따라 조금 달라집니다.

여기서 속도 차이는 **대기 시간이 겹쳤기 때문**입니다. CPU 계산을 `asyncio.sleep`으로 바꾸면 계산 자체가 빨라지는 건 아니에요.

## LLM 클라이언트를 호출할 때 확인할 것

다음 두 코드는 겉모양이 비슷하지만 실행 방식이 다릅니다.

```python
# 설명용 가상 클라이언트 이름입니다.
async def with_sync_client(prompt: str):
    return sync_client.call_llm(prompt)  # 동기 네트워크 I/O라면 루프를 막는다

async def with_async_client(prompt: str):
    return await async_client.call_llm(prompt)  # 비동기 I/O 구현을 사용한다
```

메서드 이름에 `async`가 들어가는지만 볼 게 아니라, **라이브러리의 비동기 API가 실제로 제공되는지**와 호출 지점에서 `await`하는지를 확인해야 합니다. 동기 라이브러리를 바로 바꾸기 어렵다면 `asyncio.to_thread(sync_client.call_llm, prompt)`처럼 별도 스레드로 넘길 수도 있어요. 다만 그 경우에는 스레드 수, 취소, 타임아웃, 클라이언트의 스레드 안전성을 따로 살펴야 합니다. [Python의 `to_thread` 문서](https://docs.python.org/3/library/asyncio-task.html#asyncio.to_thread)는 주로 이벤트 루프를 막을 동기 I/O를 분리하는 용도를 설명합니다.

## 이 글에서 얻은 구분

| 표현 | 의미 |
| --- | --- |
| `async def` | 코루틴 함수를 선언 |
| `await` | 기다리는 동안 제어권을 넘길 수 있는 지점 |
| 비동기 클라이언트 | 네트워크 대기를 이벤트 루프와 함께 처리하도록 구현된 클라이언트 |
| `asyncio.to_thread` | 동기 함수를 별도 스레드에서 실행하는 우회 방법 |

여러 요청이 한 이벤트 루프에 들어온다면, 동기 대기 하나가 다른 요청의 진행도 늦출 수 있습니다. 다음 글에서는 `await`로 요청을 겹쳐 실행할 수 있게 만든 뒤, **동시에 몇 개까지 외부 LLM을 호출할지**를 살펴봅니다.

→ [다음 글: 워커마다 세마포어를 두면 전체 호출도 제한될까?](/posts/semaphore-per-worker)

### 참고 자료

- [Python: Coroutines and Tasks](https://docs.python.org/3/library/asyncio-task.html)
- [Python: Running in Threads](https://docs.python.org/3/library/asyncio-task.html#running-in-threads)
