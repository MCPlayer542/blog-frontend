<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'

const router = useRouter()
const blogStore = useBlogStore()

const searchQuery = ref('')
const showTagsPanel = ref(false)
const currentPage = ref(1)
const postsPerPage = 6

onMounted(() => {
  blogStore.fetchPosts()
})

// 搜索和筛选逻辑
const filteredAndSearchedPosts = computed(() => {
  let posts = blogStore.filteredPosts
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  return posts
})

// 分页逻辑
const totalPages = computed(() => 
  Math.ceil(filteredAndSearchedPosts.value.length / postsPerPage)
)

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return filteredAndSearchedPosts.value.slice(start, end)
})

// 方法
const readPost = (id) => {
  router.push(`/blog/${id}`)
}

const toggleTag = (tag) => {
  blogStore.toggleTag(tag)
  currentPage.value = 1 // 重置到第一页
}

const clearAllTags = () => {
  blogStore.clearTags()
  currentPage.value = 1
}

const changePage = (page) => {
  currentPage.value = page
  // 平滑滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取随机颜色（用于标签）
const getTagColor = (tag) => {
  const colors = [
    'linear-gradient(45deg, #667eea, #764ba2)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #43e97b, #38f9d7)',
    'linear-gradient(45deg, #ffecd2, #fcb69f)',
    'linear-gradient(45deg, #a8edea, #fed6e3)',
  ]
  
  // 基于标签名称生成一致的颜色
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="blog-page">
    <!-- 页面头部 -->

    <!-- 搜索和筛选栏 -->
    <div class="filter-section">
      <div class="container">
        <div class="filter-bar">
          <!-- 搜索框 -->
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章标题、内容或标签..."
              class="search-input"
            >
            <span class="search-icon">🔍</span>
          </div>

          <!-- 标签筛选按钮 -->
          <button 
            @click="showTagsPanel = !showTagsPanel"
            class="tags-toggle-btn"
            :class="{ active: showTagsPanel }"
          >
            <span>标签筛选</span>
            <span class="toggle-icon">{{ showTagsPanel ? '▲' : '▼' }}</span>
          </button>
        </div>

        <!-- 已选标签显示 -->
        <div v-if="blogStore.selectedTags.length > 0" class="selected-tags">
          <span class="selected-tags-label">已选标签:</span>
          <div class="selected-tags-list">
            <span
              v-for="tag in blogStore.selectedTags"
              :key="tag"
              class="selected-tag"
              @click="toggleTag(tag)"
            >
              {{ tag }} ✕
            </span>
            <button @click="clearAllTags" class="clear-tags-btn">
              清除所有
            </button>
          </div>
        </div>

        <!-- 标签面板 -->
        <div v-if="showTagsPanel" class="tags-panel">
          <div class="tags-grid">
            <button
              v-for="tag in blogStore.uniqueTags"
              :key="tag"
              @click="toggleTag(tag)"
              class="tag-btn"
              :class="{ active: blogStore.selectedTags.includes(tag) }"
              :style="{ background: getTagColor(tag) }"
            >
              {{ tag }}
              <span v-if="blogStore.selectedTags.includes(tag)" class="tag-check">✓</span>
            </button>
          </div>
        </div>

        <!-- 结果统计 -->
        <div class="results-info">
          <span>共找到 {{ filteredAndSearchedPosts.length }} 篇文章</span>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="posts-section">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="blogStore.loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="blogStore.error" class="error">
          <p>加载失败: {{ blogStore.error }}</p>
          <button @click="blogStore.fetchPosts()" class="retry-btn">重试</button>
        </div>

        <!-- 无结果 -->
        <div v-else-if="filteredAndSearchedPosts.length === 0" class="no-results">
          <div class="no-results-icon">📝</div>
          <h3>暂无匹配的文章</h3>
          <p>尝试调整搜索条件或标签筛选</p>
        </div>

        <!-- 文章网格 -->
        <div v-else class="posts-grid">
          <article
            v-for="post in paginatedPosts"
            :key="post.id"
            class="post-card"
            @click="readPost(post.id)"
          >
            <div class="post-header">
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.date) }}</span>
                <span class="post-author">{{ post.author }}</span>
              </div>
              <div class="post-tags">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  class="post-tag"
                  :style="{ background: getTagColor(tag) }"
                >
                  {{ tag }}
                </span>
                <span v-if="post.tags.length > 4" class="more-tags">
                  +{{ post.tags.length - 4 }}
                </span>
              </div>
            </div>
            
            <h2 class="post-title">{{ post.title }}</h2>
            <p class="post-excerpt">{{ post.excerpt }}</p>
            
            <div class="post-footer">
              <span class="read-more">阅读全文 →</span>
            </div>
          </article>
        </div>

        <!-- 分页控件 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ← 上一页
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              class="page-number"
              :class="{ active: page === currentPage }"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            下一页 →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
}

.container {
  max-width: 1400px; /* 增加最大宽度 */
  margin: 0 auto;
  padding: 0 2rem;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  padding: 4rem 0 2rem;
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #5a6c7d;
  margin-bottom: 0;
}

/* 筛选区域 */
.filter-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  padding: 2rem 0;
  position: sticky;
  top: 70px;
  z-index: 100;
}

.filter-bar {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  margin-right: 5rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  
  top: 50%;
  transform: translateY(-50%);
  color: #8892b0;
  font-size: 1.2rem;
}

.tags-toggle-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.tags-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.tags-toggle-btn.active {
  background: linear-gradient(45deg, #764ba2, #667eea);
}

/* 已选标签 */
.selected-tags {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.selected-tags-label {
  font-weight: 600;
  color: #2c3e50;
}

.selected-tags-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.selected-tag {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selected-tag:hover {
  transform: scale(0.95);
  opacity: 0.8;
}

.clear-tags-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-tags-btn:hover {
  background: #c82333;
}

/* 标签面板 */
.tags-panel {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.tag-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tag-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.tag-btn.active {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.tag-check {
  font-size: 0.8rem;
}

.results-info {
  color: #5a6c7d;
  font-size: 0.9rem;
}

/* 文章区域 */
.posts-section {
  padding: 3rem 0;
}

/* 搜索和筛选区域 */
.search-section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.search-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input-group {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #8892b0;
  font-size: 1.2rem;
}

.filter-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filter-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
}

/* 文章网格 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); /* 调整最小宽度 */
  gap: 2rem;
  margin-bottom: 3rem;
}

/* 大屏幕优化 */
@media (min-width: 1400px) {
  .container {
    max-width: 1600px;
    padding: 0 3rem;
  }
  
  .posts-grid {
    grid-template-columns: repeat(3, 1fr); /* 大屏幕3列 */
    gap: 2.5rem;
  }
  
  .search-controls {
    flex-direction: row;
    align-items: center;
  }
  
  .search-input-group {
    max-width: 400px; /* 搜索框不要太宽 */
  }
}

/* 中大屏幕优化 */
@media (min-width: 1200px) and (max-width: 1399px) {
  .container {
    max-width: 1400px;
    padding: 0 2.5rem;
  }
  
  .posts-grid {
    grid-template-columns: repeat(2, 1fr); /* 中大屏幕2列 */
    gap: 2rem;
  }
  
  .search-controls {
    flex-direction: row;
    align-items: center;
  }
}

/* 中等屏幕优化 */
@media (min-width: 768px) and (max-width: 1199px) {
  .container {
    max-width: 1200px;
    padding: 0 2rem;
  }
  
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .search-controls {
    flex-direction: row;
    align-items: center;
  }
}

.post-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
  height: fit-content;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 35px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.post-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.post-date {
  color: #8b8b8b;
  font-size: 0.9rem;
}

.post-author {
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 500;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.post-tag {
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.more-tags {
  background: #e9ecef;
  color: #6c757d;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.post-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  color: #5a6c7d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  color: #667eea;
  font-weight: 500;
  transition: color 0.3s ease;
}

.post-card:hover .read-more {
  color: #764ba2;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.page-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #667eea;
  background: transparent;
  color: #667eea;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.page-number:hover,
.page-number.active {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

/* 状态样式 */
.loading {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem 0;
  color: #dc3545;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
}

.no-results {
  text-align: center;
  padding: 4rem 0;
  color: #5a6c7d;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-results h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2.5rem;
  }
  
  /* 手机端筛选区域适配 */
  .filter-section {
    top: 50px; /* 适配手机端较小的导航栏高度 */
    padding: 1.5rem 0; /* 减少筛选区域的内边距 */
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
    margin-bottom: 1.5rem;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }
  
  /* 超小屏幕筛选区域进一步优化 */
  .filter-section {
    top: 45px; /* 适配超小屏幕更小的导航栏高度 */
    padding: 1rem 0; /* 进一步减少内边距 */
  }
}

/* 极小屏幕进一步优化 */
@media (max-width: 320px) {
  .filter-section {
    top: 40px; /* 适配极小屏幕的导航栏高度 */
    padding: 0.8rem 0;
  }
  
  .post-card {
    padding: 1.5rem;
  }
  
  .tags-grid {
    gap: 0.5rem;
  }
  
  .tag-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style> 