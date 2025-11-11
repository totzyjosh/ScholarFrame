import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // For GitHub project pages use the repo name as the base.
  // Replace '/ScholarFrame/' with '/<your-repo-name>/' for other repos.
  base: '/ScholarFrame/',
  plugins: [react()]
})
