<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isMenuOpen = ref(false)

const navItems = [
  { name: '首页', path: '/' },
  { name: '博文', path: '/blog' },
  { name: '关于我', path: '/about' }
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 粒子背景效果
onMounted(() => {
  createParticles()
})

const createParticles = () => {
  const canvas = document.getElementById('particles-canvas')
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const particles = []
  const particleCount = 50
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1
    })
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    particles.forEach(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
      
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(139, 69, 255, 0.3)'
      ctx.fill()
    })
    
    requestAnimationFrame(animate)
  }
  
  animate()
}
</script>

<template>
  <div id="app">
    <!-- 粒子背景 -->
    <canvas id="particles-canvas" class="particles-bg"></canvas>
    
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h2>我的个人主页</h2>
        </div>
        
        <!-- 桌面端菜单 -->
        <ul class="nav-menu">
          <li v-for="item in navItems" :key="item.path" class="nav-item">
            <router-link 
              :to="item.path" 
              class="nav-link"
              :class="{ active: route.path === item.path }"
            >
              {{ item.name }}
            </router-link>
          </li>
        </ul>
        
        <!-- 移动端菜单按钮 -->
        <div class="hamburger" @click="toggleMenu" :class="{ active: isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <!-- 移动端菜单 -->
      <div class="mobile-menu" :class="{ active: isMenuOpen }">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path" 
          class="mobile-nav-link"
          @click="isMenuOpen = false"
        >
          {{ item.name }}
        </router-link>
      </div>
    </nav>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2025 MCPlayer542. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  min-width: 320px; /* 最小宽度 */
  overflow-x: auto; /* 允许水平滚动 */
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #2c3e50;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  width: 100% !important;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 粒子背景 */
.particles-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  z-index: 1000;
  height: auto; /* 让高度自适应内容 */
  min-height: 70px; /* 设置最小高度 */
  padding: 0.8rem 0; /* 桌面端默认padding */
}

.nav-container {
  max-width: 1400px; /* 增加导航栏最大宽度 */
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand h2 {
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link:hover,
.nav-link.active {
  color: white;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 移动端菜单按钮 */
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: #667eea;
  transition: 0.3s;
  transform-origin: center;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* 移动端菜单 */
.mobile-menu {
  display: none !important; /* 默认完全隐藏 */
  flex-direction: column;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  gap: 1rem;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  width: 100%; /* 确保移动端菜单占满宽度 */
  box-sizing: border-box; /* 确保padding计算在内 */
}

.mobile-menu.active {
  transform: translateY(0);
}

.mobile-nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.mobile-nav-link:hover {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

/* 主内容区域 */
.main-content {
  width: 100%; /* 确保占满父容器 */
  padding-top: 90px; /* 为固定导航栏留出空间 */
  min-height: calc(100vh - 90px);
  flex: 1;
}

/* 页脚 */
.footer {
  background: rgba(44, 62, 80, 0.9);
  color: white;
  text-align: center;
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 手机端导航栏优化 - 减少高度 */
  .navbar {
    height: 50px !important; /* 直接设置高度 */
    padding: 0.8rem 0; /* 恢复正常padding */
  }
  
  .nav-container {
    padding: 0 1rem;
    height: 100%; /* 容器占满navbar高度 */
  }
  
  .nav-brand h2 {
    font-size: 1.2rem; /* 减小标题字体 */
  }
  
  /* 优化主内容区域 */
  .main-content {
    padding-top: 50px; /* 匹配navbar高度 */
    min-height: calc(100vh - 50px);
  }
  
  /* 优化移动端菜单 */
  .mobile-menu {
    padding: 0.5rem 1rem; /* 减少菜单内边距 */
    gap: 0.5rem; /* 减少菜单项间距 */
  }
  
  .mobile-nav-link {
    padding: 0.8rem 1rem; /* 减少菜单项内边距 */
    font-size: 0.95rem; /* 稍微减小字体 */
  }
  
  .nav-menu {
    display: none !important; /* 强制隐藏桌面端菜单 */
  }
  
  .hamburger {
    display: flex !important; /* 强制显示汉堡菜单 */
  }
  
  /* 移动端菜单在小屏幕时启用 */
  .mobile-menu:not(.active) {
    display: none !important; /* 没有active类时完全隐藏 */
  }
  
  .mobile-menu.active {
    display: flex !important; /* 有active类时显示 */
    transform: translateY(0) !important; /* 点击后显示 */
  }
}

/* 超小屏幕进一步优化 */
@media (max-width: 480px) {
  .navbar {
    height: 45px !important; /* 更小的navbar高度 */
    padding: 0.6rem 0; /* 恢复合理的padding */
  }
  
  .nav-container {
    padding: 0 0.8rem;
    height: 100%; /* 容器占满navbar高度 */
  }
  
  .nav-brand h2 {
    font-size: 1.1rem; /* 更小的标题 */
  }
  
  .main-content {
    padding-top: 45px; /* 匹配navbar高度 */
    min-height: calc(100vh - 45px);
  }
  
  .mobile-menu {
    padding: 0.4rem 0.8rem; /* 最小的菜单内边距 */
    gap: 0.3rem;
  }
  
  .mobile-nav-link {
    padding: 0.7rem 0.8rem; /* 更紧凑的菜单项 */
    font-size: 0.9rem;
  }
  
  .hamburger span {
    width: 22px; /* 稍微减小汉堡菜单图标 */
    height: 2.5px;
  }
}

/* 极小屏幕进一步优化 */
@media (max-width: 320px) {
  .navbar {
    min-height: 40px !important; /* 极小屏幕最小高度 */
    padding: 0.15rem 0 !important; /* 极小padding */
  }
  
  .nav-container {
    padding: 0 0.5rem;
    min-height: 30px !important; /* 极小容器高度 */
  }
  
  .main-content {
    padding-top: 45px !important; /* 对应调整主内容区域 */
    min-height: calc(100vh - 45px) !important;
  }
}

/* 极小屏幕进一步优化 */
@media (max-width: 320px) {
  .navbar {
    height: 40px !important; /* 极小屏幕更小高度 */
    padding: 0.4rem 0;
  }
  
  .nav-container {
    padding: 0 0.5rem;
    height: 100%;
  }
  
  .main-content {
    padding-top: 40px;
    min-height: calc(100vh - 40px);
  }
}

/* 大屏幕导航优化 */
@media (min-width: 1200px) {
  .nav-container {
    max-width: 1600px;
    padding: 0 3rem;
  }
  
  .nav-links {
    gap: 3rem; /* 增加导航链接间距 */
  }
  
  .nav-link {
    font-size: 1.1rem; /* 大屏幕下字体稍大 */
    padding: 0.75rem 1.5rem;
  }
  
  .logo {
    font-size: 1.8rem; /* 大屏幕下logo更大 */
  }
}

/* 中等屏幕导航优化 */
@media (min-width: 768px) and (max-width: 1199px) {
  .nav-container {
    max-width: 1200px;
    padding: 0 2.5rem;
  }
  
  .nav-links {
    gap: 2rem;
  }
}

/* 大屏幕主内容优化 */
@media (min-width: 1200px) {
  .main-content {
    padding-top: 100px;
    min-height: calc(100vh - 100px);
  }
}
</style>
