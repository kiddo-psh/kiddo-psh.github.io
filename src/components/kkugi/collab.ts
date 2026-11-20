type HeroView = 'desktop' | 'mobile';

function prefersStill(): boolean {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('final')
  );
}

function isHeroView(value: string | undefined): value is HeroView {
  return value === 'desktop' || value === 'mobile';
}

function isShown(video: HTMLVideoElement): boolean {
  return video.closest('[hidden]') == null;
}

function loopMedia(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-media]').forEach((fig) => {
    const videos = [...fig.querySelectorAll<HTMLVideoElement>('video[data-autoplay]')];
    const button = fig.querySelector('.media-toggle');
    let userPaused = false;
    let inView = true;
    if (prefersStill()) {
      videos.forEach((video) => {
        video.removeAttribute('autoplay');
        video.autoplay = false;
        video.pause();
        video.preload = 'none';
        video.load();
      });
      userPaused = true;
    }
    const sync = () => {
      videos.forEach((video) => {
        if (!userPaused && inView && isShown(video)) {
          void video.play()?.catch(() => {});
        } else {
          video.pause();
        }
      });
      if (button instanceof HTMLButtonElement) {
        button.setAttribute('aria-pressed', String(userPaused));
        button.setAttribute('aria-label', userPaused ? '애니메이션 재생' : '애니메이션 일시정지');
      }
    };
    if (button instanceof HTMLButtonElement) {
      button.addEventListener('click', () => {
        userPaused = !userPaused;
        if (!userPaused) {
          videos.forEach((video) => {
            if (video.preload === 'none') video.preload = 'metadata';
          });
        }
        sync();
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          inView = entry.isIntersecting;
          sync();
        },
        { threshold: 0.1 },
      ).observe(fig);
    }
    fig.addEventListener('mediachange', sync);
    sync();
  });
}

function heroSwitch(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-component="LandingHeroWord"]').forEach((fig) => {
    const seg = fig.querySelector('.seg');
    const stage = fig.querySelector('.hero-stage');
    const desktop = fig.querySelector('.panel-desk');
    const mobile = fig.querySelector('.panel-mob');
    if (!(seg instanceof HTMLElement) || !(stage instanceof HTMLElement)) return;
    if (!(desktop instanceof HTMLElement) || !(mobile instanceof HTMLElement)) return;
    const options = [...seg.querySelectorAll<HTMLButtonElement>('.seg-opt')];
    const panels: Record<HeroView, HTMLElement> = { desktop, mobile };
    let current: HeroView = 'desktop';
    let busy = 0;
    seg.setAttribute('data-active', current);
    const select = (key: HeroView, focus: boolean) => {
      options.forEach((option) => {
        const on = option.dataset.show === key;
        option.setAttribute('aria-checked', String(on));
        option.tabIndex = on ? 0 : -1;
        if (on && focus) option.focus();
      });
      seg.setAttribute('data-active', key);
      if (key === current) return;
      const from = panels[current];
      const to = panels[key];
      current = key;
      stage.setAttribute('data-show', key);
      if (prefersStill()) {
        from.hidden = true;
        to.hidden = false;
        fig.dispatchEvent(new Event('mediachange'));
        return;
      }
      window.clearTimeout(busy);
      const startHeight = stage.offsetHeight;
      stage.style.height = `${startHeight}px`;
      stage.classList.add('switching');
      to.hidden = false;
      to.classList.add('fading');
      const nextHeight = to.offsetHeight;
      requestAnimationFrame(() => {
        stage.style.height = `${nextHeight}px`;
        from.classList.add('fading');
        to.classList.remove('fading');
      });
      fig.dispatchEvent(new Event('mediachange'));
      busy = window.setTimeout(() => {
        from.hidden = true;
        from.classList.remove('fading');
        stage.classList.remove('switching');
        stage.style.height = '';
        fig.dispatchEvent(new Event('mediachange'));
      }, 380);
    };
    options.forEach((option, index) => {
      option.addEventListener('click', () => {
        const key = option.dataset.show;
        if (isHeroView(key)) select(key, false);
      });
      option.addEventListener('keydown', (event) => {
        let next: HTMLButtonElement | undefined;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = options[(index + 1) % options.length];
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = options[(index - 1 + options.length) % options.length];
        else if (event.key === 'Home') next = options[0];
        else if (event.key === 'End') next = options[options.length - 1];
        if (!next) return;
        event.preventDefault();
        const key = next.dataset.show;
        if (isHeroView(key)) select(key, true);
      });
    });
  });
}

function landingScroll(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.lp-view').forEach((view) => {
    const scroller = view.querySelector('.lp-scroll');
    if (!(scroller instanceof HTMLElement)) return;
    const update = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      view.classList.toggle('more-top', scroller.scrollTop > 2);
      view.classList.toggle('more-bottom', scroller.scrollTop < max - 2);
    };
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    scroller.querySelectorAll('img').forEach((img) => {
      img.addEventListener('load', update);
    });
    update();
  });
}

function poseLoops(root: ParentNode): void {
  const ua = navigator.userAgent;
  const isSafari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua);
  const canHover = window.matchMedia('(hover: hover)').matches;
  root.querySelectorAll<HTMLElement>('.pose[data-loop]').forEach((fig) => {
    if (isSafari || !canHover) return;
    const stage = fig.querySelector('.stage');
    if (!(stage instanceof HTMLElement)) return;
    let video: HTMLVideoElement | null = null;
    fig.addEventListener('pointerenter', () => {
      const src = fig.dataset.loop;
      if (prefersStill() || !src) return;
      if (!video) {
        const next = document.createElement('video');
        next.muted = true;
        next.loop = true;
        next.playsInline = true;
        next.setAttribute('aria-hidden', 'true');
        next.src = src;
        next.addEventListener('playing', () => {
          fig.classList.add('playing');
        });
        stage.appendChild(next);
        video = next;
      }
      void video.play()?.catch(() => {});
    });
    fig.addEventListener('pointerleave', () => {
      const current = video;
      if (!current) return;
      fig.classList.remove('playing');
      window.setTimeout(() => {
        current.pause();
        current.currentTime = 0;
      }, 250);
    });
  });
}

export function enhanceCollab(root: ParentNode): void {
  loopMedia(root);
  heroSwitch(root);
  landingScroll(root);
  poseLoops(root);
}
