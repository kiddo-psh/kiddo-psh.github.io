import type { ChatTurn } from './chat';
import { enhanceCollab } from './collab';
import type { termDefs } from './terms';

function reveal(root: ParentNode): void {
  const targets = root.querySelectorAll('.rv, .chart-card, .budget, .vtl, .stepper, .pipe, .callouts, .stack-list');
  root.querySelectorAll('.vtl').forEach((timeline) => {
    timeline.querySelectorAll<HTMLElement>('.ev').forEach((event, index) => {
      event.style.setProperty('--i', String(index));
    });
  });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const final = document.documentElement.classList.contains('final');
  if (final || reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );
  targets.forEach((el) => io.observe(el));
}

function timelines(root: ParentNode): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll<HTMLElement>('.tl-frame').forEach((frame) => {
    const box = frame.querySelector('.tl-scroll');
    if (!(box instanceof HTMLElement)) return;
    const update = () => {
      const max = box.scrollHeight - box.clientHeight;
      frame.classList.toggle('more-top', box.scrollTop > 2);
      frame.classList.toggle('more-bottom', box.scrollTop < max - 2);
    };
    box.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if (document.fonts) document.fonts.ready.then(update);
    update();
    box.addEventListener('keydown', (event) => {
      if (event.target instanceof Element && event.target.closest('button, a, input, textarea')) return;
      const line = 48;
      const page = box.clientHeight * 0.85;
      let top: number | null = null;
      let by: number | null = null;
      switch (event.key) {
        case 'ArrowDown':
          by = line;
          break;
        case 'ArrowUp':
          by = -line;
          break;
        case 'PageDown':
          by = page;
          break;
        case 'PageUp':
          by = -page;
          break;
        case ' ':
          by = event.shiftKey ? -page : page;
          break;
        case 'Home':
          top = 0;
          break;
        case 'End':
          top = box.scrollHeight;
          break;
        default:
          return;
      }
      event.preventDefault();
      const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
      if (top !== null) box.scrollTo({ top, behavior });
      else if (by !== null) box.scrollBy({ top: by, behavior });
    });
  });
}

function placePill(track: HTMLElement, animate: boolean): void {
  const thumb = track.querySelector('.pill-thumb');
  const selected = track.querySelector<HTMLElement>('[aria-pressed="true"], [aria-selected="true"]');
  if (!(thumb instanceof HTMLElement) || !selected) return;
  const trackBox = track.getBoundingClientRect();
  const box = selected.getBoundingClientRect();
  if (!animate) thumb.style.transition = 'none';
  thumb.style.width = `${box.width}px`;
  thumb.style.transform = `translateX(${box.left - trackBox.left}px)`;
  if (!animate) {
    thumb.getBoundingClientRect();
    thumb.style.transition = '';
  }
  track.classList.add('pill-ready');
}

function tray(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.tray').forEach((fig) => {
    const stage = fig.querySelector('.tray-stage');
    const buttons = fig.querySelectorAll<HTMLButtonElement>('.seg-btn');
    const track = fig.querySelector('.tray-toggle');
    if (!(stage instanceof HTMLElement) || !(track instanceof HTMLElement)) return;
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        stage.setAttribute('data-state', button.dataset.show ?? 'detected');
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        placePill(track, true);
      });
    });
  });
}

function bindTerms(root: ParentNode): void {
  const data = root.querySelector('#kkugi-terms');
  if (!(data instanceof HTMLScriptElement)) return;
  const terms = JSON.parse(data.textContent || '[]') as typeof termDefs;
  let open: HTMLButtonElement | null = null;
  let suppressFocus = false;

  const place = (button: HTMLButtonElement) => {
    const pop = document.getElementById(button.getAttribute('aria-controls') || '');
    if (!(pop instanceof HTMLElement)) return;
    const rect = button.getBoundingClientRect();
    const margin = 12;
    const width = pop.offsetWidth;
    const height = pop.offsetHeight;
    let left = rect.left;
    let top = rect.bottom + 8;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
    if (left < margin) left = margin;
    if (top + height > window.innerHeight - margin && rect.top - height - 8 > margin) top = rect.top - height - 8;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  };
  const close = (button: HTMLButtonElement) => {
    const pop = document.getElementById(button.getAttribute('aria-controls') || '');
    button.setAttribute('aria-expanded', 'false');
    if (pop) pop.hidden = true;
    if (open === button) open = null;
  };
  const show = (button: HTMLButtonElement) => {
    if (open && open !== button) close(open);
    const pop = document.getElementById(button.getAttribute('aria-controls') || '');
    if (!(pop instanceof HTMLElement)) return;
    pop.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    open = button;
    place(button);
  };

  terms.forEach((term, index) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, button, .term-pop, .chat-log, .sr-only')) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue?.includes(term.match)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const node = walker.nextNode();
    if (!(node instanceof Text) || node.nodeValue == null) return;
    const at = node.nodeValue.indexOf(term.match);
    const before = node.nodeValue.slice(0, at);
    const after = node.nodeValue.slice(at + term.match.length);
    const popId = `kkugi-term-${index}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'term';
    button.textContent = term.match;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', popId);
    button.setAttribute('aria-describedby', popId);
    const pop = document.createElement('span');
    pop.id = popId;
    pop.className = 'term-pop';
    pop.role = 'note';
    pop.hidden = true;
    pop.textContent = term.desc;
    const parent = node.parentNode;
    if (!parent) return;
    if (before) parent.insertBefore(document.createTextNode(before), node);
    parent.insertBefore(button, node);
    parent.insertBefore(pop, node);
    node.nodeValue = after;
    let fromPointer = false;
    button.addEventListener('pointerdown', () => {
      fromPointer = true;
    });
    button.addEventListener('focus', () => {
      if (suppressFocus || fromPointer) return;
      show(button);
    });
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-expanded') === 'true') close(button);
      else show(button);
      fromPointer = false;
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    const pop = document.getElementById(open.getAttribute('aria-controls') || '');
    if (open.contains(target) || pop?.contains(target)) return;
    close(open);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !open) return;
    const button = open;
    suppressFocus = true;
    close(button);
    button.focus();
    suppressFocus = false;
  });
  window.addEventListener('resize', () => {
    if (open) place(open);
  });
  document.addEventListener('scroll', () => {
    if (open) place(open);
  }, { capture: true, passive: true });
}

function replay(root: ParentNode): void {
  const data = root.querySelector('#kkugi-chat');
  if (!(data instanceof HTMLScriptElement)) return;
  const exchanges = JSON.parse(data.textContent || '{}') as Record<string, ChatTurn[]>;
  const idle = '무엇이든 물어보세요';
  const waiting = '답변을 기다리는 중이에요';
  const instant =
    document.documentElement.classList.contains('final') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll<HTMLElement>('.replay').forEach((panelRoot) => {
    const tabs = [...panelRoot.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panel = panelRoot.querySelector('.chat-phone');
    const log = panelRoot.querySelector('.chat-log');
    const input = panelRoot.querySelector('.ci-text');
    const live = panelRoot.querySelector('.chat-live');
    const again = panelRoot.querySelector('.replay-btn');
    if (!(panel instanceof HTMLElement) || !(log instanceof HTMLElement) || !(input instanceof HTMLElement)) return;
    if (!(live instanceof HTMLElement) || !(again instanceof HTMLButtonElement) || !tabs[0]) return;

    let current = tabs[0].dataset.ex ?? 'personal';
    let run = 0;
    const timers: number[] = [];

    const clear = () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
    const wait = (ms: number, id: number) =>
      new Promise<boolean>((resolve) => {
        timers.push(window.setTimeout(() => resolve(id === run), ms));
      });
    const bubble = (cls: string, text?: string) => {
      const node = document.createElement('div');
      node.className = `msg ${cls}`;
      if (text) node.textContent = text;
      return node;
    };
    const addChip = (node: HTMLElement, text: string) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = text;
      node.append(chip);
      return chip;
    };
    const scroll = () => {
      log.scrollTop = log.scrollHeight;
    };
    const announce = (turns: ChatTurn[]) => {
      live.textContent = turns
        .map((turn) => `질문: ${turn.q} 답변: ${turn.a}${turn.chip ? ` (${turn.chip})` : ''}`)
        .join(' ');
    };
    const setIdle = () => {
      panel.classList.remove('waiting');
      input.textContent = idle;
    };
    const renderAll = (turns: ChatTurn[]) => {
      log.replaceChildren();
      turns.forEach((turn) => {
        log.append(bubble('user', turn.q));
        const answer = bubble('bot', turn.a);
        if (turn.chip) addChip(answer, turn.chip);
        log.append(answer);
      });
      setIdle();
      scroll();
      announce(turns);
    };
    const tokens = (value: string) => {
      const out: string[] = [];
      let index = 0;
      while (index < value.length) {
        const size = 1 + Math.floor(Math.random() * 3);
        out.push(value.slice(index, index + size));
        index += size;
      }
      return out;
    };
    const play = async (key: string) => {
      clear();
      const id = ++run;
      const turns = exchanges[key] ?? [];
      live.textContent = '';
      if (instant) {
        renderAll(turns);
        return;
      }
      log.replaceChildren();
      setIdle();
      for (let index = 0; index < turns.length; index += 1) {
        const turn = turns[index];
        if (!turn) return;
        if (!(await wait(index ? 650 : 250, id))) return;
        log.append(bubble('user enter', turn.q));
        scroll();
        if (!(await wait(350, id))) return;
        panel.classList.add('waiting');
        input.textContent = waiting;
        const typing = bubble('bot typing enter');
        typing.innerHTML = '<i></i><i></i><i></i>';
        log.append(typing);
        scroll();
        if (!(await wait(750, id))) return;
        const answer = bubble('bot');
        log.replaceChild(answer, typing);
        let acc = '';
        for (const token of tokens(turn.a)) {
          acc += token;
          answer.textContent = acc;
          scroll();
          if (!(await wait(38, id))) return;
        }
        if (turn.chip) {
          if (!(await wait(180, id))) return;
          const chip = addChip(answer, turn.chip);
          chip.classList.add('enter');
          scroll();
        }
        if (!(await wait(200, id))) return;
        setIdle();
      }
      announce(turns);
    };
    const select = (tab: HTMLButtonElement, focus: boolean) => {
      tabs.forEach((item) => {
        const on = item === tab;
        item.setAttribute('aria-selected', String(on));
        item.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      const track = tab.closest('.replay-tabs');
      if (track instanceof HTMLElement) placePill(track, true);
      if (focus) tab.focus();
      current = tab.dataset.ex ?? current;
      void play(current);
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (event) => {
        let next: HTMLButtonElement | undefined;
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        else if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
        else if (event.key === 'Home') next = tabs[0];
        else if (event.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        select(next, true);
      });
    });
    again.addEventListener('click', () => {
      void play(current);
    });
    renderAll(exchanges[current] ?? []);
    if (!instant && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return;
          io.disconnect();
          void play(current);
        },
        { threshold: 0.5 },
      );
      io.observe(panel);
    }
  });
}

function pills(root: ParentNode): void {
  const tracks = [...root.querySelectorAll<HTMLElement>('.tray-toggle, .replay-tabs')];
  const placeAll = () => tracks.forEach((track) => placePill(track, false));
  placeAll();
  window.addEventListener('resize', placeAll);
  if (document.fonts) void document.fonts.ready.then(placeAll);
}

export function enhanceKkugi(): void {
  const root = document.querySelector('.kkugi');
  if (!root) return;
  bindTerms(root);
  reveal(root);
  timelines(root);
  tray(root);
  replay(root);
  pills(root);
  enhanceCollab(root);
}
