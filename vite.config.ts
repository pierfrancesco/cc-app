import {defineConfig} from 'vite'
import path from 'path'

const repoName = 'cc-app'

export default defineConfig({
    base: `/${repoName}/`,
    build: {
        outDir: 'dist'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
})