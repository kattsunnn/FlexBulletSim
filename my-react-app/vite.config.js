import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages で /<repo>/ 配下に配置されることを想定
// リポジトリ名が FlexBulletSim なので base を '/FlexBulletSim/' に設定
export default defineConfig({
  base: '/FlexBulletSim/',
  plugins: [react()],
})
