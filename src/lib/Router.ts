import { createObserver } from './createObserver';
import type { Component } from './types';

interface RouteDef {
  regex: RegExp;
  paramNames: string[];
  handler: Component<any>;
}

export interface MatchedRoute extends RouteDef {
  path: string;
  params: Record<string, string>;
}

/**
 * History API 기반 SPA 라우터.
 * GitHub Pages처럼 하위 경로(/jeongcheogi-quiz/)에 올릴 때를 위해 baseUrl을 받는다.
 * <a data-link href="/lesson/c-1">는 새로고침 없이 이동한다.
 */
export class Router {
  #routes = new Map<string, RouteDef>();
  #route: MatchedRoute | null = null;
  #observer = createObserver();
  #baseUrl: string;

  constructor(baseUrl = '') {
    this.#baseUrl = baseUrl.replace(/\/$/, '');

    window.addEventListener('popstate', () => {
      this.#route = this.#findRoute();
      this.#observer.notify();
    });

    document.addEventListener('click', (event) => {
      const link = (event.target as Element | null)?.closest?.('a[data-link]');
      if (!link) return;
      event.preventDefault();
      const href = link.getAttribute('href');
      if (href) this.push(href);
    });
  }

  get params() {
    return this.#route?.params ?? {};
  }

  get route() {
    return this.#route;
  }

  get target() {
    return this.#route?.handler;
  }

  subscribe(fn: () => void) {
    return this.#observer.subscribe(fn);
  }

  addRoute(path: string, handler: Component<any>) {
    const paramNames: string[] = [];
    const pattern = path === '*'
      ? '.*'
      : path.replace(/:\w+/g, (match) => {
          paramNames.push(match.slice(1));
          return '([^/]+)';
        }).replace(/\//g, '\\/');
    this.#routes.set(path, { regex: new RegExp(`^${this.#baseUrl}${pattern}\\/?$`), paramNames, handler });
  }

  /** 앱 안에서 쓰는 경로('/lesson/1')를 실제 주소('/jeongcheogi-quiz/lesson/1')로 바꾼다 */
  href(path: string) {
    return this.#baseUrl + (path.startsWith('/') ? path : `/${path}`);
  }

  push(path: string, { replace = false } = {}) {
    const full = path.startsWith(this.#baseUrl + '/') || path === this.#baseUrl ? path : this.href(path);
    if (`${location.pathname}${location.search}` !== full) {
      if (replace) history.replaceState(null, '', full);
      else history.pushState(null, '', full);
    }
    this.#route = this.#findRoute(full);
    this.#observer.notify();
  }

  start() {
    this.#route = this.#findRoute();
    this.#observer.notify();
  }

  #findRoute(url = location.pathname): MatchedRoute | null {
    const { pathname } = new URL(url, location.origin);
    for (const [path, route] of this.#routes) {
      const match = pathname.match(route.regex);
      if (!match) continue;
      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      return { ...route, path, params };
    }
    return null;
  }
}
