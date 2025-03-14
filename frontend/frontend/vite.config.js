import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace 'your-repo-name' with the actual repository name
export default defineConfig({
  plugins: [react()],
  base: '/sql-vi/', // Ensure this matches your GitHub repo name
});
