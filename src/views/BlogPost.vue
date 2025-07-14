<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const post = ref(null)
const loading = ref(true)
const error = ref(null)
const relatedPosts = ref([])

// 新增：交互功能相关状态
const userIdInput = ref('')
const isLiking = ref(false)
const isDisliking = ref(false)
const comments = ref([])
const commentsLoading = ref(false)
const newComment = ref('')
const isSubmittingComment = ref(false)
const replyTo = ref(null)
const replyContent = ref('')
const showCommentForm = ref(false)

const postId = computed(() => parseInt(route.params.id))

// 存储用户ID到localStorage
const getUserId = () => {
  return localStorage.getItem('blogUserId') || ''
}

const setUserId = (id) => {
  localStorage.setItem('blogUserId', id)
  userIdInput.value = id
}

// 获取文章数据
const fetchPost = async () => {
  loading.value = true
  error.value = null
  
  try {
    const userId = getUserId()
    userIdInput.value = userId
    
    // 使用新的API获取文章详情
    const fetchedPost = await blogStore.getPostById(postId.value, userId)
    
    if (fetchedPost) {
      post.value = fetchedPost
      
      // 获取评论
      await fetchComments()
      
      // 获取相关文章
      await blogStore.fetchPosts()
      relatedPosts.value = blogStore.posts
        .filter(p => 
          p.id !== fetchedPost.id && 
          p.tags.some(tag => fetchedPost.tags.includes(tag))
        )
        .slice(0, 3)
    } else {
      error.value = '文章不存在'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 获取评论
const fetchComments = async () => {
  if (!postId.value) return
  
  commentsLoading.value = true
  try {
    comments.value = await blogStore.fetchComments(postId.value)
  } catch (err) {
    console.error('Failed to fetch comments:', err)
  } finally {
    commentsLoading.value = false
  }
}

// 点赞功能（匿名）
const toggleLike = async () => {
  if (isLiking.value) return
  
  isLiking.value = true
  try {
    const result = await blogStore.toggleLike(postId.value)
    // 状态已在store中更新
  } catch (err) {
    alert('点赞失败: ' + err.message)
  } finally {
    isLiking.value = false
  }
}

// 点踩功能（匿名）
const toggleDislike = async () => {
  if (isDisliking.value) return
  
  isDisliking.value = true
  try {
    const result = await blogStore.toggleDislike(postId.value)
    // 状态已在store中更新
  } catch (err) {
    alert('点踩失败: ' + err.message)
  } finally {
    isDisliking.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!userIdInput.value.trim()) {
    alert('请先输入用户ID')
    return
  }
  
  if (!newComment.value.trim()) {
    alert('请输入评论内容')
    return
  }
  
  isSubmittingComment.value = true
  try {
    setUserId(userIdInput.value.trim())
    await blogStore.addComment(
      postId.value, 
      userIdInput.value.trim(), 
      newComment.value.trim()
    )
    newComment.value = ''
    await fetchComments() // 重新获取评论列表
  } catch (err) {
    alert('评论失败: ' + err.message)
  } finally {
    isSubmittingComment.value = false
  }
}

// 回复评论
const submitReply = async () => {
  if (!userIdInput.value.trim()) {
    alert('请先输入用户ID')
    return
  }
  
  if (!replyContent.value.trim()) {
    alert('请输入回复内容')
    return
  }
  
  try {
    setUserId(userIdInput.value.trim())
    await blogStore.addComment(
      postId.value, 
      userIdInput.value.trim(), 
      replyContent.value.trim(),
      replyTo.value
    )
    replyContent.value = ''
    replyTo.value = null
    await fetchComments() // 重新获取评论列表
  } catch (err) {
    alert('回复失败: ' + err.message)
  }
}

// 删除评论
const deleteComment = async (commentId) => {
  if (!userIdInput.value.trim()) {
    alert('请先输入用户ID')
    return
  }
  
  if (!confirm('确定要删除这条评论吗？')) {
    return
  }
  
  try {
    await blogStore.deleteComment(commentId, userIdInput.value.trim())
    await fetchComments() // 重新获取评论列表
  } catch (err) {
    alert('删除失败: ' + err.message)
  }
}

// 监听路由变化
watch(() => route.params.id, fetchPost, { immediate: true })

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化评论时间
const formatCommentTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(dateString)
}

// 阅读其他文章
const readPost = (id) => {
  router.push(`/blog/${id}`)
}

// 返回博客列表
const goBack = () => {
  router.push('/blog')
}

// 分享功能
const sharePost = () => {
  if (navigator.share && post.value) {
    navigator.share({
      title: post.value.title,
      text: post.value.excerpt,
      url: window.location.href
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板!')
  }
}

// 打印文章
const printPost = () => {
  window.print()
}

// 获取标签颜色
const getTagColor = (tag) => {
  const colors = [
    'linear-gradient(45deg, #667eea, #764ba2)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #43e97b, #38f9d7)',
    'linear-gradient(45deg, #ffecd2, #fcb69f)',
    'linear-gradient(45deg, #a8edea, #fed6e3)',
  ]
  
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="blog-post-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="fetchPost" class="retry-btn">重试</button>
        <button @click="goBack" class="back-btn">返回博客列表</button>
      </div>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="post" class="post-container">
      <!-- 文章头部 -->
      <div class="post-header">
        <div class="container">
          <!-- 导航 -->
          <div class="post-nav">
            <button @click="goBack" class="back-button">
              ← 返回博客列表
            </button>
            <div class="post-actions">
              <button @click="sharePost" class="action-btn" title="分享文章">
                🔗
              </button>
              <button @click="printPost" class="action-btn" title="打印文章">
                🖨️
              </button>
            </div>
          </div>

          <!-- 文章元信息 -->
          <div class="post-meta">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-info">
              <div class="post-details">
                <span class="post-date">📅 {{ formatDate(post.date) }}</span>
                <span class="post-author">👤 {{ post.author }}</span>
                <span class="post-likes">❤️ {{ post.likes_count || 0 }} 点赞</span>
                <span class="post-dislikes">👎 {{ post.dislikes_count || 0 }} 点踩</span>
                <span class="post-comments">💬 {{ post.comments_count || 0 }} 评论</span>
              </div>
              <div class="post-tags">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="post-tag"
                  :style="{ background: getTagColor(tag) }"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章正文 -->
      <div class="post-content">
        <div class="container">
          <article class="content-article">
            <MarkdownRenderer :content="post.content" />
          </article>
        </div>
      </div>

      <!-- 互动区域 -->
      <div class="interaction-section">
        <div class="container">
          <!-- 用户ID输入 -->
          <div class="user-id-section">
            <label for="userId">用户ID (用于点赞和评论):</label>
            <input 
              id="userId"
              v-model="userIdInput" 
              type="text" 
              placeholder="请输入您的用户ID" 
              class="user-id-input"
            />
          </div>

          <!-- 点赞点踩按钮 -->
          <div class="rating-section">
            <button 
              @click="toggleLike" 
              :disabled="isLiking"
              :class="['like-btn', { 'liked': post.user_liked }]"
            >
              <span class="like-icon">{{ post.user_liked ? '❤️' : '🤍' }}</span>
              <span>{{ post.user_liked ? '已点赞' : '点赞' }}</span>
              <span class="like-count">({{ post.likes_count || 0 }})</span>
            </button>
            
            <button 
              @click="toggleDislike" 
              :disabled="isDisliking"
              :class="['dislike-btn', { 'disliked': post.user_disliked }]"
            >
              <span class="dislike-icon">{{ post.user_disliked ? '👎' : '👍' }}</span>
              <span>{{ post.user_disliked ? '已点踩' : '点踩' }}</span>
              <span class="dislike-count">({{ post.dislikes_count || 0 }})</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section">
        <div class="container">
          <h3 class="section-title">评论区</h3>
          
          <!-- 评论表单 -->
          <div class="comment-form">
            <textarea 
              v-model="newComment"
              placeholder="写下您的评论..."
              class="comment-textarea"
              rows="4"
            ></textarea>
            <button 
              @click="submitComment"
              :disabled="isSubmittingComment || !userIdInput.trim() || !newComment.trim()"
              class="submit-comment-btn"
            >
              {{ isSubmittingComment ? '提交中...' : '发表评论' }}
            </button>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div v-if="commentsLoading" class="comments-loading">
              <div class="loading-spinner small"></div>
              <span>加载评论中...</span>
            </div>
            
            <div v-else-if="comments.length === 0" class="no-comments">
              暂无评论，快来发表第一条评论吧！
            </div>
            
            <div v-else>
              <div 
                v-for="comment in comments" 
                :key="comment.id" 
                class="comment-item"
              >
                <div class="comment-header">
                  <span class="comment-author">{{ comment.user_id }}</span>
                  <span class="comment-time">{{ formatCommentTime(comment.created_at) }}</span>
                  <button 
                    v-if="userIdInput === comment.user_id"
                    @click="deleteComment(comment.id)"
                    class="delete-comment-btn"
                    title="删除评论"
                  >
                    🗑️
                  </button>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                <div class="comment-actions">
                  <button 
                    @click="replyTo = comment.id"
                    class="reply-btn"
                  >
                    回复
                  </button>
                </div>
                
                <!-- 回复表单 -->
                <div v-if="replyTo === comment.id" class="reply-form">
                  <textarea 
                    v-model="replyContent"
                    placeholder="写下您的回复..."
                    class="reply-textarea"
                    rows="3"
                  ></textarea>
                  <div class="reply-actions">
                    <button 
                      @click="submitReply"
                      :disabled="!userIdInput.trim() || !replyContent.trim()"
                      class="submit-reply-btn"
                    >
                      发表回复
                    </button>
                    <button 
                      @click="replyTo = null; replyContent = ''"
                      class="cancel-reply-btn"
                    >
                      取消
                    </button>
                  </div>
                </div>
                
                <!-- 子回复 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                  <div 
                    v-for="reply in comment.replies" 
                    :key="reply.id"
                    class="reply-item"
                  >
                    <div class="comment-header">
                      <span class="comment-author">{{ reply.user_id }}</span>
                      <span class="comment-time">{{ formatCommentTime(reply.created_at) }}</span>
                      <button 
                        v-if="userIdInput === reply.user_id"
                        @click="deleteComment(reply.id)"
                        class="delete-comment-btn"
                        title="删除回复"
                      >
                        🗑️
                      </button>
                    </div>
                    <div class="comment-content">{{ reply.content }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章底部 -->
      <div class="post-footer">
        <div class="container">
          <!-- 标签区域 -->
          <div class="post-tags-section">
            <h3>文章标签</h3>
            <div class="tags-list">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="tag-item"
                :style="{ background: getTagColor(tag) }"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 分享区域 -->
          <div class="share-section">
            <h3>分享文章</h3>
            <div class="share-buttons">
              <button @click="sharePost" class="share-btn">
                🔗 分享链接
              </button>
              <button @click="printPost" class="share-btn">
                🖨️ 打印文章
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 相关文章 -->
      <div v-if="relatedPosts.length > 0" class="related-posts">
        <div class="container">
          <h3 class="related-title">相关文章</h3>
          <div class="related-grid">
            <article
              v-for="relatedPost in relatedPosts"
              :key="relatedPost.id"
              class="related-card"
              @click="readPost(relatedPost.id)"
            >
              <div class="related-header">
                <span class="related-date">{{ formatDate(relatedPost.date) }}</span>
                <div class="related-tags">
                  <span
                    v-for="tag in relatedPost.tags.slice(0, 2)"
                    :key="tag"
                    class="related-tag"
                    :style="{ background: getTagColor(tag) }"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <h4 class="related-title-text">{{ relatedPost.title }}</h4>
              <p class="related-excerpt">{{ relatedPost.excerpt }}</p>
              <span class="related-read-more">阅读更多 →</span>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-post-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
}

.container {
  max-width: 1200px; /* 阅读页面保持适中宽度 */
  margin: 0 auto;
  padding: 0 2rem;
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .container {
    max-width: 1400px;
    padding: 0 3rem;
  }
  
  .article-container {
    display: grid;
    grid-template-columns: 1fr 300px; /* 主内容 + 侧边栏 */
    gap: 3rem;
    align-items: start;
  }
  
  .article-main {
    max-width: none; /* 移除主内容区域的宽度限制 */
  }
  
  .article-sidebar {
    position: sticky;
    top: 2rem;
  }
  
  .post-title {
    font-size: 3rem; /* 大屏幕下标题更大 */
  }
}

/* 中等屏幕优化 */
@media (min-width: 768px) and (max-width: 1199px) {
  .container {
    max-width: 1000px;
    padding: 0 2.5rem;
  }
  
  .article-container {
    display: block; /* 中等屏幕下单列布局 */
  }
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.retry-btn,
.back-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.back-btn {
  background: #6c757d;
  color: white;
}

.retry-btn:hover,
.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 文章头部 */
.post-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  padding: 2rem 0 3rem;
}

.post-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #667eea;
  border-radius: 20px;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #667eea;
  color: white;
  transform: translateX(-3px);
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.post-meta {
  text-align: center;
}

.post-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.post-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.post-details {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.post-date,
.post-author {
  color: #5a6c7d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.post-tag {
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 文章正文 */
.post-content {
  background: white;
  padding: 3rem 0;
}

.content-article {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

/* 互动区域 */
.interaction-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  padding: 2rem 0;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.interaction-section .container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.user-id-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
}

.user-id-section label {
  font-size: 1rem;
  color: #5a6c7d;
  font-weight: 500;
}

.user-id-input {
  flex-grow: 1;
  padding: 0.8rem 1.2rem;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  color: #333;
  transition: all 0.3s ease;
}

.user-id-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  justify-content: center;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.like-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.like-btn.liked {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.dislike-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #6c757d, #495057);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.dislike-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.dislike-btn.disliked {
  background: linear-gradient(45deg, #dc3545, #c82333);
}

.like-icon, .dislike-icon {
  font-size: 1.1rem;
}

.like-count, .dislike-count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

/* 评论区域 */
.comments-section {
  padding: 3rem 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
}

.comments-section .container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.comment-form {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.comment-textarea {
  flex-grow: 1;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  color: #333;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.submit-comment-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.submit-comment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comments-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #5a6c7d;
  font-size: 1rem;
}

.no-comments {
  text-align: center;
  color: #8b8b8b;
  font-size: 1.1rem;
  padding: 2rem 0;
}

.comment-item {
  background: #f9f9f9;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.comment-time {
  color: #8b8b8b;
  font-size: 0.8rem;
}

.delete-comment-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.delete-comment-btn:hover {
  color: #c82333;
}

.comment-content {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
}

.reply-btn {
  padding: 0.4rem 0.8rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reply-btn:hover {
  background: #d0d0d0;
  transform: translateY(-1px);
}

.reply-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e0e0e0;
}

.reply-textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #333;
  resize: vertical;
  min-height: 60px;
  transition: all 0.3s ease;
}

.reply-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 0.8rem;
}

.submit-reply-btn {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.submit-reply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.cancel-reply-btn {
  padding: 0.6rem 1.2rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.cancel-reply-btn:hover {
  background: #d0d0d0;
  transform: translateY(-1px);
}

.replies {
  margin-left: 2rem; /* 缩进子回复 */
  padding-left: 1rem;
  border-left: 1px dashed #e0e0e0;
}

.reply-item {
  background: #f9f9f9;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  margin-top: 1rem;
}

.reply-item .comment-header {
  margin-bottom: 0.5rem;
}

.reply-item .comment-author {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.reply-item .comment-time {
  color: #8b8b8b;
  font-size: 0.7rem;
}

.reply-item .delete-comment-btn {
  font-size: 0.9rem;
}

.reply-item .comment-content {
  font-size: 0.9rem;
  color: #5a6c7d;
  line-height: 1.5;
}

/* 文章底部 */
.post-footer {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  padding: 2rem 0;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.post-footer .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.post-tags-section h3,
.share-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.share-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.share-btn {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 相关文章 */
.related-posts {
  padding: 3rem 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.related-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.related-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.related-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 35px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.related-date {
  color: #8b8b8b;
  font-size: 0.8rem;
}

.related-tags {
  display: flex;
  gap: 0.3rem;
}

.related-tag {
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
}

.related-title-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.8rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-excerpt {
  color: #5a6c7d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-read-more {
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.related-card:hover .related-read-more {
  color: #764ba2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .post-title {
    font-size: 2rem;
  }
  
  .post-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .post-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .content-article {
    padding: 2rem 1.5rem;
  }
  
  .post-footer .container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
  
  .post-nav {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .interaction-section .container {
    flex-direction: column;
    align-items: stretch;
  }

  .user-id-section {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .user-id-section label {
    width: 100%;
    text-align: left;
  }

  .user-id-input {
    width: 100%;
  }

  .rating-section {
    width: 100%;
    flex-direction: column;
    gap: 0.8rem;
  }

  .comment-form {
    flex-direction: column;
    align-items: stretch;
  }

  .comment-textarea,
  .submit-comment-btn {
    width: 100%;
  }

  .comment-item {
    padding: 1rem;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .comment-author {
    width: 100%;
    text-align: left;
  }

  .comment-time {
    width: 100%;
    text-align: left;
  }

  .comment-actions {
    justify-content: flex-end;
    gap: 0.8rem;
  }

  .reply-btn {
    width: 100%;
    text-align: center;
  }

  .reply-form {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px dashed #e0e0e0;
  }

  .reply-textarea,
  .submit-reply-btn,
  .cancel-reply-btn {
    width: 100%;
  }

  .replies {
    margin-left: 1rem;
    padding-left: 0.5rem;
    border-left: 1px dashed #e0e0e0;
  }

  .reply-item {
    padding: 1rem;
  }

  .reply-item .comment-header {
    margin-bottom: 0.3rem;
  }

  .reply-item .comment-author {
    font-size: 0.8rem;
  }

  .reply-item .comment-time {
    font-size: 0.6rem;
  }

  .reply-item .delete-comment-btn {
    font-size: 0.8rem;
  }

  .reply-item .comment-content {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .post-title {
    font-size: 1.5rem;
  }
  
  .content-article {
    padding: 1.5rem 1rem;
  }
  
  .related-title {
    font-size: 1.5rem;
  }
  
  .share-buttons {
    flex-direction: column;
  }
}

/* 打印样式 */
@media print {
  .post-nav,
  .post-actions,
  .post-footer,
  .related-posts {
    display: none !important;
  }
  
  .post-header {
    background: none !important;
  }
  
  .content-article {
    box-shadow: none !important;
    border: none !important;
  }
}
</style> 