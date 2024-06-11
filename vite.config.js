// vite.config.js
export default {
    esbuild: {
        supported: {
            'top-level-await': true, // Enable top-level await support
        },
    },
}