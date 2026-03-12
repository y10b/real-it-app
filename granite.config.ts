import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'real-it-map',
  brand: {
    displayName: '리얼있맵', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://real-it-app.vercel.app/favicon-32.png',
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'next dev',
      build: 'node scripts/toss-build.mjs',
    },
  },
  permissions: [],
  outdir: 'dist',
});
