<script setup>
import { ref, watch, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItKatex from 'markdown-it-katex'
import markdownItHighlightjs from 'markdown-it-highlightjs'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

const renderedContent = ref('')

// 配置Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})
  .use(markdownItKatex, {
    strict: false,
    throwOnError: false
  })
  .use(markdownItHighlightjs, {
    auto: true,
    code: true
  })

// 自定义渲染规则以支持内联数学公式
md.renderer.rules.text = function (tokens, idx) {
  const content = tokens[idx].content
  // 处理单个$包裹的内联公式
  return content.replace(/\$([^$\n]+)\$/g, (match, formula) => {
    try {
      // 使用KaTeX渲染内联公式
      const katex = window.katex || require('katex')
      return katex.renderToString(formula, { displayMode: false })
    } catch (e) {
      console.warn('KaTeX render error:', e)
      return match
    }
  })
}

// 渲染Markdown内容
const renderMarkdown = () => {
  try {
    renderedContent.value = md.render(props.content)
  } catch (error) {
    console.error('Markdown render error:', error)
    renderedContent.value = `<p>渲染错误: ${error.message}</p>`
  }
}

// 监听内容变化
watch(() => props.content, renderMarkdown, { immediate: true })
</script>

<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<style scoped>
.markdown-content {
  line-height: 1.8;
  color: #2c3e50;
  font-size: 16px;
}

/* 标题样式 */
.markdown-content :deep(h1) {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.markdown-content :deep(h2) {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 1.8rem 0 1rem 0;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #e1e8ed;
}

.markdown-content :deep(h3) {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 1.5rem 0 0.8rem 0;
}

.markdown-content :deep(h4) {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 1.2rem 0 0.6rem 0;
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin: 1rem 0;
  line-height: 1.8;
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-content :deep(li) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

/* 代码样式 */
.markdown-content :deep(code) {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #e83e8c;
  border: 1px solid #e9ecef;
}

.markdown-content :deep(pre) {
  background: #282c34;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  border: none;
  color: #abb2bf;
  font-size: 0.9rem;
}

/* 引用样式 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid #667eea;
  background: rgba(102, 126, 234, 0.05);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #5a6c7d;
}

.markdown-content :deep(blockquote p) {
  margin: 0.5rem 0;
}

/* 表格样式 */
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.markdown-content :deep(th) {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
}

.markdown-content :deep(tr:hover) {
  background: #f8f9fa;
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: #667eea;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.markdown-content :deep(a:hover) {
  color: #764ba2;
  border-bottom-color: #764ba2;
}

/* 分割线样式 */
.markdown-content :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  margin: 2rem 0;
  border-radius: 2px;
}

/* 数学公式样式 */
.markdown-content :deep(.katex) {
  font-size: 1.1em;
}

.markdown-content :deep(.katex-display) {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

/* 内联数学公式 */
.markdown-content :deep(.katex-inline) {
  background: rgba(102, 126, 234, 0.1);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  margin: 0 0.1rem;
}

/* 图片样式 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
}

/* 强调样式 */
.markdown-content :deep(strong) {
  color: #1a1a1a;
  font-weight: 700;
}

.markdown-content :deep(em) {
  color: #667eea;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .markdown-content {
    font-size: 15px;
  }
  
  .markdown-content :deep(h1) {
    font-size: 1.8rem;
  }
  
  .markdown-content :deep(h2) {
    font-size: 1.5rem;
  }
  
  .markdown-content :deep(h3) {
    font-size: 1.3rem;
  }
  
  .markdown-content :deep(pre) {
    padding: 1rem;
    font-size: 0.8rem;
  }
  
  .markdown-content :deep(table) {
    font-size: 0.9rem;
  }
  
  .markdown-content :deep(th),
  .markdown-content :deep(td) {
    padding: 0.6rem 0.8rem;
  }
}
</style> 