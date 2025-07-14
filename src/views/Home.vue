<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'

const router = useRouter()
const blogStore = useBlogStore()

const heroText = ref('')
const fullText = '欢迎来到 Sparky327 的个人主页'
const typingSpeed = 150

// 隐藏按钮相关
const showGenshinButton = ref(true)
const genshinPassword = ref('')
const showPasswordDialog = ref(false)
const showSuccessAnimation = ref(false)
const passwordError = ref('')

// 点击特定区域5次显示隐藏按钮
const clickCount = ref(0)
const lastClickTime = ref(0)

onMounted(() => {
  blogStore.fetchPosts()
  typeWriter()
})

const typeWriter = () => {
  let i = 0
  const timer = setInterval(() => {
    heroText.value = fullText.slice(0, i + 1)
    i++
    if (i === fullText.length) {
      clearInterval(timer)
    }
  }, typingSpeed)
}

const goToBlog = () => {
  router.push('/blog')
}

const readPost = (id) => {
  router.push(`/blog/${id}`)
}

// 隐藏按钮激活逻辑
const handleSecretClick = () => {
  const now = Date.now()
  if (now - lastClickTime.value < 1000) { // 1秒内的点击才算连击
    clickCount.value++
  } else {
    clickCount.value = 1
  }
  lastClickTime.value = now

  if (clickCount.value >= 5) {
    showGenshinButton.value = true
    clickCount.value = 0
  }
}

// 启动原神按钮点击
const activateGenshin = () => {
  showPasswordDialog.value = true
  genshinPassword.value = ''
  passwordError.value = ''
}

// 验证密码
const verifyGenshinPassword = () => {
  if (genshinPassword.value === '377') {
    showPasswordDialog.value = false
    // 跳转到发布页面
    router.push('/publish')
  } else {
    passwordError.value = ''
    showSuccessAnimation.value = true
    setTimeout(() => {
      showSuccessAnimation.value = false
      showPasswordDialog.value = false
      genshinPassword.value = ''
      passwordError.value = ''
    }, 3000)
  }
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  genshinPassword.value = ''
  passwordError.value = ''
}
</script>

<template>
  <div class="home">
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          {{ heroText }}
          <span class="cursor">|</span>
        </h1>
        <p class="hero-subtitle">
          分享技术见解，记录学习心得，探索知识边界
        </p>
        <div class="hero-buttons">
          <button @click="goToBlog" class="btn btn-primary">
            浏览博文
          </button>
          <button 
            v-if="showGenshinButton" 
            @click="activateGenshin" 
            class="btn btn-genshin"
          >
            启动原神
          </button>
          <button @click="router.push('/about')" class="btn btn-secondary">
            了解更多
          </button>
        </div>
      </div>
      
      <!-- 动画装饰 -->
      <div class="hero-decoration">
        <div class="floating-elements">
          <div class="element element-1" @click="handleSecretClick"></div>
          <div class="element element-2"></div>
          <div class="element element-3"></div>
          <div class="element element-4"></div>
        </div>
      </div>
    </section>
    
    <!-- 最新博文预览 -->
    <section class="latest-posts">
      <div class="container">
        <h2 class="section-title">最新博文</h2>
        <div class="posts-grid">
          <article 
            v-for="post in blogStore.posts.slice(0, 3)" 
            :key="post.id"
            class="post-card"
            @click="readPost(post.id)"
          >
            <div class="post-header">
              <span class="post-date">{{ post.date }}</span>
              <div class="post-tags">
                <span 
                  v-for="tag in post.tags.slice(0, 2)" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.excerpt }}</p>
            <div class="post-footer">
              <span class="read-more">阅读更多 →</span>
            </div>
          </article>
        </div>
        
        <div class="view-all">
          <button @click="goToBlog" class="btn btn-outline">
            查看所有博文
          </button>
        </div>
      </div>
    </section>
    
    <!-- 特色区域 -->
    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>技术分享</h3>
            <p>深入浅出的技术文章，分享编程经验与见解</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎓</div>
            <h3>学习笔记</h3>
            <p>记录学习过程中的重要知识点和心得体会</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💡</div>
            <h3>思考感悟</h3>
            <p>对技术发展和行业趋势的个人思考与感悟</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 密码对话框 -->
    <div v-if="showPasswordDialog" class="password-overlay" @click="closePasswordDialog">
      <div class="password-dialog" @click.stop>
        <div class="dialog-header">
          <h3>启动原神</h3>
          <button @click="closePasswordDialog" class="close-btn">&times;</button>
        </div>
        <div class="dialog-content">
          <p>请输入启动密码：</p>
          <input
            v-model="genshinPassword"
            type="password"
            placeholder="请输入密码"
            class="password-input"
            @keyup.enter="verifyGenshinPassword"
          />
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="closePasswordDialog" class="btn btn-cancel">取消</button>
          <button @click="verifyGenshinPassword" class="btn btn-confirm">确认</button>
        </div>
      </div>
    </div>

    <!-- 成功动画 -->
    <div v-if="showSuccessAnimation" class="success-animation">
      <div class="success-content">
        <div class="success-icon">⚡</div>
        <h2 class="success-text">喜报：启动原神成功！</h2>
        <div class="success-particles">
          <div class="particle" v-for="i in 20" :key="i"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}

/* 英雄区域 */
.hero {
  position: relative;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.hero-content {
  text-align: center;
  z-index: 2;
  max-width: 1000px;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.cursor {
  animation: blink 1s infinite;
  color: #667eea;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #5a6c7d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.btn-genshin {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  animation: genshinGlow 2s ease-in-out infinite alternate;
}

.btn-genshin:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
}

@keyframes genshinGlow {
  0% { box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3); }
  100% { box-shadow: 0 4px 25px rgba(255, 107, 107, 0.6); }
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  margin-top: 2rem;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* 动画装饰 */
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.floating-elements {
  position: relative;
  width: 100%;
  height: 100%;
}

.element {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  animation: float 6s ease-in-out infinite;
}

.element-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.element-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.element-3 {
  width: 80px;
  height: 80px;
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.element-4 {
  width: 120px;
  height: 120px;
  top: 10%;
  right: 25%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 内容区域 */
.container {
  max-width: 1400px; /* 增加最大宽度 */
  margin: 0 auto;
  padding: 0 2rem;
}

/* 最新博文 */
.latest-posts {
  padding: 5rem 0;
  background: rgba(255, 255, 255, 0.5);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 3rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); /* 调整最小宽度 */
  gap: 2rem;
  margin-bottom: 3rem;
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .container {
    max-width: 1600px; /* 大屏幕下更宽 */
    padding: 0 3rem;
  }
  
  .posts-grid {
    grid-template-columns: repeat(3, 1fr); /* 大屏幕固定3列 */
    gap: 2.5rem;
  }
  
  .hero-content {
    max-width: 1200px; /* 英雄区域也可以更宽 */
  }
  
  .hero-title {
    font-size: 4rem; /* 大屏幕下标题更大 */
  }
  
  .features-grid {
    grid-template-columns: repeat(3, 1fr); /* 特性区域3列 */
    gap: 3rem;
  }
}

/* 中等屏幕优化 */
@media (min-width: 768px) and (max-width: 1199px) {
  .container {
    max-width: 1200px;
    padding: 0 2.5rem;
  }
  
  .posts-grid {
    grid-template-columns: repeat(2, 1fr); /* 中等屏幕2列 */
    gap: 2rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

.post-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 35px rgba(102, 126, 234, 0.2);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.post-date {
  color: #8b8b8b;
  font-size: 0.9rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.2rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.post-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.post-excerpt {
  color: #5a6c7d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
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

.view-all {
  text-align: center;
}

/* 特色区域 */
.features {
  padding: 5rem 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #5a6c7d;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

/* 隐藏按钮相关样式 */
.element-1 {
  cursor: pointer;
  transition: all 0.3s ease;
}

.element-1:hover {
  transform: scale(1.1);
  background: linear-gradient(45deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 142, 0.2));
}

/* 密码对话框样式 */
.password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.password-dialog {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
  box-sizing: border-box; /* 确保边距计算一致 */
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.dialog-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.dialog-content {
  margin-bottom: 2rem;
}

.dialog-content p {
  margin-bottom: 1rem;
  color: #5a6c7d;
}

.password-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  box-sizing: border-box; /* 确保边框包含在宽度内 */
}

.password-input:focus {
  border-color: #667eea;
}

.error-message {
  color: #e53e3e;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 0 0.5rem 0 1rem; /* 左间距1rem，右间距0.5rem，右边更紧凑 */
}

.btn-cancel {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover {
  background: #cbd5e0;
}

.btn-confirm {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 成功动画样式 */
.success-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(255, 142, 142, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: successFadeIn 0.5s ease;
}

.success-content {
  text-align: center;
  color: white;
  position: relative;
}

.success-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: successPulse 1s ease-in-out infinite;
}

.success-text {
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: successSlideUp 0.8s ease;
}

.success-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: particleFloat 2s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-50px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes successFadeIn {
  from { 
    opacity: 0;
    transform: scale(0.8);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes successSlideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--random-x, 0), var(--random-y, -100px)) scale(0);
  }
}

/* 为粒子添加随机位置 */
.particle:nth-child(1) { left: 10%; top: 20%; --random-x: 50px; --random-y: -80px; }
.particle:nth-child(2) { left: 90%; top: 30%; --random-x: -60px; --random-y: -90px; }
.particle:nth-child(3) { left: 20%; top: 80%; --random-x: 40px; --random-y: -70px; }
.particle:nth-child(4) { left: 80%; top: 70%; --random-x: -50px; --random-y: -85px; }
.particle:nth-child(5) { left: 50%; top: 10%; --random-x: 30px; --random-y: -95px; }
.particle:nth-child(6) { left: 30%; top: 90%; --random-x: -40px; --random-y: -75px; }
.particle:nth-child(7) { left: 70%; top: 40%; --random-x: 60px; --random-y: -80px; }
.particle:nth-child(8) { left: 40%; top: 60%; --random-x: -30px; --random-y: -90px; }
.particle:nth-child(9) { left: 60%; top: 20%; --random-x: 45px; --random-y: -85px; }
.particle:nth-child(10) { left: 15%; top: 50%; --random-x: -55px; --random-y: -70px; }
.particle:nth-child(11) { left: 85%; top: 80%; --random-x: 35px; --random-y: -95px; }
.particle:nth-child(12) { left: 25%; top: 30%; --random-x: -45px; --random-y: -75px; }
.particle:nth-child(13) { left: 75%; top: 60%; --random-x: 55px; --random-y: -80px; }
.particle:nth-child(14) { left: 35%; top: 10%; --random-x: -35px; --random-y: -90px; }
.particle:nth-child(15) { left: 65%; top: 90%; --random-x: 40px; --random-y: -85px; }
.particle:nth-child(16) { left: 45%; top: 40%; --random-x: -60px; --random-y: -70px; }
.particle:nth-child(17) { left: 55%; top: 70%; --random-x: 50px; --random-y: -95px; }
.particle:nth-child(18) { left: 5%; top: 60%; --random-x: -40px; --random-y: -75px; }
.particle:nth-child(19) { left: 95%; top: 50%; --random-x: 45px; --random-y: -80px; }
.particle:nth-child(20) { left: 50%; top: 50%; --random-x: -50px; --random-y: -90px; }
</style> 