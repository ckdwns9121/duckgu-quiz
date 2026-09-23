import { defineConfig } from 'vitest/config';

// GitHub Pages 주소가 https://ckdwns9121.github.io/jeongcheogi-quiz/ 라서 배포 빌드만 하위 경로를 쓴다
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/jeongcheogi-quiz/' : '/',
  esbuild: {
    jsxFactory: 'createVNode',
    jsxFragment: 'Fragment',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
}));
