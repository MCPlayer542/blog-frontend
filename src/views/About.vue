<script setup>
import { ref } from 'vue'

// 友链数据
const friendLinks = ref([
  {
    name: "Vue.js 官方网站",
    url: "https://vuejs.org/",
    description: "渐进式 JavaScript 框架",
    avatar: "https://vuejs.org/logo.svg"
  },
  {
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
    description: "Web 开发者资源",
    avatar: "https://developer.mozilla.org/mdn-social-share.png"
  },
  {
    name: "GitHub",
    url: "https://github.com/",
    description: "代码托管平台",
    avatar: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
  },
  {
    name: "Stack Overflow",
    url: "https://stackoverflow.com/",
    description: "程序员问答社区",
    avatar: "https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png"
  }
])

// 联系方式
const contactMethods = [
  {
    icon: '📧',
    label: '邮箱',
    value: '1779894826@qq.com',
    link: 'mailto:1779894826@qq.com'
  },
  {
    icon: '🐙',
    label: 'GitHub',
    value: 'github.com/Sparky579',
    link: 'https://github.com/Sparky579'
  },
  {
    icon: '💼',
    label: '微信',
    value: 'Kevin327_579',
    link: 'https://weixin.qq.com/g/0'
  },
  {
    icon: '🇫🇷',
    label: '广告位招租',
    value: '1779894826@qq.com',
    link: 'https://ys.mihoyo.com/'
  }
]
</script>

<template>
  <div class="about-page">
    <div class="container">
      
      <!-- 个人介绍 -->
      <section class="intro-section">
        <div class="intro-content">
          <div class="intro-text">
            <h1 class="page-title">关于我</h1>
            <div class="intro-description">
              <p>
                我是 Sparky327, 一个人机交互 (HCI) 方向的准研一学生。
                我会在这里分享一些学到的知识和个人思考，以及其他一切有趣的东西。
                欢迎与我交流！
              </p> 
              <p style="
        color: #667eea;
        font-size: 18px;
        animation: fadeInOut 3s infinite;
    ">
    </p>
    <p class="fade-text">
        最后，欢迎加入我D世界末影队，群号：308507522。
    </p>
    
            </div>
          </div>
          
          <div class="intro-avatar">
            <div class="avatar-container">
              <div class="avatar-placeholder">
                <span class="avatar-text">👨‍💻</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系我 -->
      <section class="contact-section">
        <h2 class="section-title">联系我</h2>
        <div class="contact-grid">
          <a
            v-for="contact in contactMethods"
            :key="contact.label"
            :href="contact.link"
            class="contact-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="contact-icon">{{ contact.icon }}</div>
            <div class="contact-info">
              <h3>{{ contact.label }}</h3>
              <p>{{ contact.value }}</p>
            </div>
          </a>
        </div>
      </section>

      <!-- 友链 -->
      <section class="friends-section">
        <h2 class="section-title">友情链接</h2>
        <div class="friends-grid">
          <a
            v-for="friend in friendLinks"
            :key="friend.name"
            :href="friend.url"
            class="friend-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="friend-avatar">
              <img :src="friend.avatar" :alt="friend.name">
            </div>
            <div class="friend-info">
              <h3>{{ friend.name }}</h3>
              <p>{{ friend.description }}</p>
            </div>
          </a>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
  padding: 2rem 0;
}

.container {
  max-width: 1400px; /* 增加最大宽度 */
  margin: 0 auto;
  padding: 0 2rem;
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .container {
    max-width: 1600px;
    padding: 0 3rem;
  }
  
  .intro-content {
    display: grid;
    grid-template-columns: 1fr 400px; /* 文字 + 头像区域 */
    gap: 4rem;
    align-items: center;
  }
}

/* 中大屏幕优化 */
@media (min-width: 900px) and (max-width: 1199px) {
  .container {
    max-width: 1200px;
    padding: 0 2.5rem;
  }
}

/* 中等屏幕优化 */
@media (min-width: 768px) and (max-width: 899px) {
  .container {
    max-width: 900px;
    padding: 0 2rem;
  }
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

/* 个人介绍区域 */
.intro-section {
  margin-bottom: 5rem;
}

.intro-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.intro-description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #5a6c7d;
  text-align: center;
  max-width: 600px;
}

.intro-description p {
  margin-bottom: 1.5rem;
}

.intro-avatar {
  flex-shrink: 0;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

/* 联系我区域 */
.contact-section {
  margin-bottom: 5rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.contact-card {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 35px rgba(102, 126, 234, 0.15);
}

.contact-icon {
  font-size: 2.5rem;
  margin-right: 1.5rem;
}

.contact-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.contact-info p {
  color: #667eea;
  font-weight: 500;
}

/* 友链区域 */
.friends-section {
  margin-bottom: 3rem;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.fade-text {
            color: #667eea;
            font-size: 18px;
            animation: fadeInOut 2s infinite;
        }
@keyframes fadeInOut {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.friend-card {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 35px rgba(102, 126, 234, 0.15);
}

.friend-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  margin-right: 1.5rem;
  border-radius: 10px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 移除了fallback图标 */

.friend-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.friend-info p {
  color: #5a6c7d;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .intro-description {
    font-size: 1rem;
  }
  
  .avatar-placeholder {
    width: 150px;
    height: 150px;
    font-size: 3rem;
  }
  
  .contact-grid,
  .friends-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-card,
  .friend-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .contact-card,
  .friend-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .contact-icon,
  .friend-avatar {
    margin-right: 0;
  }
}
</style> 