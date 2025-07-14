import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 引入KaTeX样式
import 'katex/dist/katex.min.css'
// 引入代码高亮样式
import 'highlight.js/styles/github-dark.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
