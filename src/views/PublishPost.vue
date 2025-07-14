<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'

const router = useRouter()
const blogStore = useBlogStore()

// 表单数据
const form = ref({
  title: '',
  content: '',
  author: '',
  tags: '',
  password: ''
})

// 界面状态
const isPublishing = ref(false)
const showPassword = ref(false)
const message = ref('')
const messageType = ref('') // 'success' | 'error'

// 计算属性
const tagsArray = computed(() => {
  return form.value.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
})

const isFormValid = computed(() => {
  return form.value.title.trim() &&
         form.value.content.trim() &&
         form.value.author.trim() &&
         form.value.password.trim()
})

// 方法
const validatePassword = async () => {
  if (!form.value.password.trim()) {
    showMessage('请输入启动密码', 'error')
    return false
  }

  try {
    const result = await blogStore.checkAuthPassword(form.value.password)
    
    if (result.valid) {
      return true
    } else {
      showMessage(result.message || '密码验证失败', 'error')
      return false
    }
  } catch (error) {
    showMessage('密码验证失败，请检查网络连接', 'error')
    return false
  }
}

const publishPost = async () => {
  if (!isFormValid.value) {
    showMessage('请填写所有必填项', 'error')
    return
  }

  // 先验证密码
  const passwordValid = await validatePassword()
  if (!passwordValid) {
    return
  }

  isPublishing.value = true
  
  try {
    const postData = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      author: form.value.author.trim(),
      tags: tagsArray.value,
      password: form.value.password
    }

    const result = await blogStore.publishPost(postData)
    
    if (result.success) {
      showMessage(result.message, 'success')
      // 清空表单
      form.value = {
        title: '',
        content: '',
        author: '',
        tags: '',
        password: ''
      }
      // 3秒后跳转到博文列表
      setTimeout(() => {
        router.push('/blog')
      }, 3000)
    } else {
      showMessage(result.message || '发布失败', 'error')
    }
  } catch (error) {
    showMessage('发布失败，请检查网络连接', 'error')
  } finally {
    isPublishing.value = false
  }
}

const showMessage = (text, type) => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 5000)
}

const previewPost = () => {
  // 简单的预览功能 - 在新窗口中显示markdown渲染
  const previewWindow = window.open('', '_blank')
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>博文预览 - ${form.value.title}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px; 
          margin: 40px auto; 
          padding: 20px;
          line-height: 1.6;
        }
        h1, h2, h3 { color: #333; }
        code { 
          background: #f4f4f4; 
          padding: 2px 4px; 
          border-radius: 3px; 
        }
        pre { 
          background: #f4f4f4; 
          padding: 15px; 
          border-radius: 5px; 
          overflow-x: auto; 
        }
        .meta {
          color: #666;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .tag {
          background: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          margin-right: 5px;
        }
      </style>
    </head>
    <body>
      <div class="meta">
        <h1>${form.value.title}</h1>
        <p>作者: ${form.value.author} | 日期: ${new Date().toLocaleDateString('zh-CN')}</p>
        <div>
          ${tagsArray.value.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      <div>
        ${form.value.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
      </div>
    </body>
    </html>
  `)
}
</script>

<template>
  <div class="publish-page">
    <div class="container">
      <div class="publish-header">
        <h1>📝 发布新博文</h1>
        <p>在这里创作并发布你的博客文章</p>
      </div>

      <!-- 消息提示 -->
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>

      <div class="publish-form">
        <div class="form-section">
          <label class="form-label">文章标题 *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="请输入文章标题"
            class="form-input"
            :disabled="isPublishing"
          />
        </div>

        <div class="form-row">
          <div class="form-section">
            <label class="form-label">作者 *</label>
            <input
              v-model="form.author"
              type="text"
              placeholder="请输入作者名称"
              class="form-input"
              :disabled="isPublishing"
            />
          </div>

          <div class="form-section">
            <label class="form-label">标签</label>
            <input
              v-model="form.tags"
              type="text"
              placeholder="多个标签用逗号分隔，如：技术,Vue,前端"
              class="form-input"
              :disabled="isPublishing"
            />
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">文章内容 * (支持Markdown格式)</label>
          <textarea
            v-model="form.content"
            placeholder="请输入文章内容，支持Markdown语法..."
            class="form-textarea"
            :disabled="isPublishing"
          ></textarea>
          <div class="textarea-help">
            <span>支持Markdown语法：**粗体** *斜体* `代码` ## 标题</span>
            <button type="button" @click="previewPost" class="preview-btn">预览</button>
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">发布密码 *</label>
          <div class="password-input">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入发布密码"
              class="form-input"
              :disabled="isPublishing"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="password-toggle"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="router.push('/blog')"
            class="btn btn-secondary"
            :disabled="isPublishing"
          >
            取消
          </button>
          
          <button
            type="button"
            @click="publishPost"
            class="btn btn-primary"
            :disabled="!isFormValid || isPublishing"
          >
            <span v-if="isPublishing">发布中...</span>
            <span v-else>发布文章</span>
          </button>
        </div>
      </div>

      <!-- 标签预览 -->
      <div v-if="tagsArray.length > 0" class="tags-preview">
        <h3>标签预览:</h3>
        <div class="tags-list">
          <span
            v-for="tag in tagsArray"
            :key="tag"
            class="tag-preview"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

/* 确保所有表单元素使用一致的盒模型 */
.publish-page *,
.publish-page *::before,
.publish-page *::after {
  box-sizing: border-box;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}

.publish-header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.publish-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.publish-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background: rgba(72, 187, 120, 0.9);
  color: white;
}

.message.error {
  background: rgba(245, 87, 108, 0.9);
  color: white;
}

.publish-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  box-sizing: border-box; /* 确保内边距计算一致 */
}

.form-section {
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  box-sizing: border-box; /* 确保网格容器尺寸一致 */
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box; /* 确保边框包含在宽度内 */
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.form-textarea {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box; /* 确保边框包含在宽度内 */
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.textarea-help {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.preview-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.preview-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.password-input {
  position: relative;
  box-sizing: border-box; /* 确保容器尺寸计算一致 */
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 3rem;
  padding: 0; /* 移除额外的内边距，与表单内容对齐 */
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a5568;
  transform: translateY(-2px);
}

.tags-preview {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  box-sizing: border-box; /* 确保与表单容器一致 */
}

.tags-preview h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-preview {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .publish-form {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .publish-header h1 {
    font-size: 2rem;
  }
}
</style> 