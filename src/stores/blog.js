import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE_URL = 'https://38.12.36.246:24377/api'
// const API_BASE_URL = 'http://localhost:12377/api'

export const useBlogStore = defineStore('blog', () => {
  // 状态
  const posts = ref([])
  const allTags = ref([])
  const selectedTags = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentPost = ref(null)

  // 计算属性
  const filteredPosts = computed(() => {
    if (selectedTags.value.length === 0) {
      return posts.value
    }
    // 改为或逻辑：包含任一选中标签即显示
    return posts.value.filter(post =>
      selectedTags.value.some(tag => post.tags.includes(tag))
    )
  })

  const uniqueTags = computed(() => {
    const tags = new Set()
    posts.value.forEach(post => {
      post.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  })

  // 动作
  const fetchPosts = async (page = 1, limit = 10, tags = null, search = null, userId = null) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', limit)
      if (tags) params.append('tags', tags)
      if (search) params.append('search', search)
      if (userId) params.append('user_id', userId)

      const response = await fetch(`${API_BASE_URL}/posts?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      posts.value = data.posts
      allTags.value = uniqueTags.value
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch posts:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tags`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      allTags.value = data.tags
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch tags:', err)
    }
  }

  const getPostById = async (id, userId = null) => {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      
      const response = await fetch(`${API_BASE_URL}/posts/${id}?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const post = await response.json()
      currentPost.value = post
      return post
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch post:', err)
      return null
    }
  }

  // 点赞功能（匿名）
  const toggleLike = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: 'anonymous' })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // 更新当前文章的点赞状态
      if (currentPost.value && currentPost.value.id === postId) {
        currentPost.value.user_liked = result.liked
        currentPost.value.likes_count = result.likes_count
      }
      
      // 更新文章列表中的文章
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].user_liked = result.liked
        posts.value[postIndex].likes_count = result.likes_count
      }
      
      return result
    } catch (err) {
      error.value = err.message
      console.error('Failed to toggle like:', err)
      throw err
    }
  }

  // 点踩功能（匿名）
  const toggleDislike = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: 'anonymous' })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // 更新当前文章的点踩状态
      if (currentPost.value && currentPost.value.id === postId) {
        currentPost.value.user_disliked = result.disliked
        currentPost.value.dislikes_count = result.dislikes_count
        // 如果点踩成功，可能需要取消点赞状态
        if (result.disliked) {
          currentPost.value.user_liked = false
          // 重新获取点赞数
          const stats = await getPostStats(postId)
          if (stats) {
            currentPost.value.likes_count = stats.likes_count
          }
        }
      }
      
      // 更新文章列表中的文章
      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].user_disliked = result.disliked
        posts.value[postIndex].dislikes_count = result.dislikes_count
        if (result.disliked) {
          posts.value[postIndex].user_liked = false
        }
      }
      
      return result
    } catch (err) {
      error.value = err.message
      console.error('Failed to toggle dislike:', err)
      throw err
    }
  }

  // 评论功能
  const addComment = async (postId, userId, content, parentId = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          content: content,
          parent_id: parentId
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const comment = await response.json()
      return comment
    } catch (err) {
      error.value = err.message
      console.error('Failed to add comment:', err)
      throw err
    }
  }

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const comments = await response.json()
      return comments
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch comments:', err)
      return []
    }
  }

  const deleteComment = async (commentId, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}?user_id=${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete comment:', err)
      throw err
    }
  }

  const getPostStats = async (postId, userId = null) => {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('user_id', userId)
      
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/stats?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const stats = await response.json()
      return stats
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch post stats:', err)
      return null
    }
  }

  const toggleTag = (tag) => {
    const index = selectedTags.value.indexOf(tag)
    if (index > -1) {
      selectedTags.value.splice(index, 1)
    } else {
      selectedTags.value.push(tag)
    }
  }

  const clearTags = () => {
    selectedTags.value = []
  }

  // 发布博文相关
  const checkAuthPassword = async (password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result
    } catch (err) {
      error.value = err.message
      console.error('Failed to check auth password:', err)
      throw err
    }
  }

  const publishPost = async (postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // 如果发布成功，刷新文章列表
      if (result.success) {
        await fetchPosts()
      }
      
      return result
    } catch (err) {
      error.value = err.message
      console.error('Failed to publish post:', err)
      throw err
    }
  }

  return {
    posts,
    allTags,
    selectedTags,
    loading,
    error,
    currentPost,
    filteredPosts,
    uniqueTags,
    fetchPosts,
    fetchTags,
    getPostById,
    toggleLike,
    toggleDislike,
    addComment,
    fetchComments,
    deleteComment,
    getPostStats,
    toggleTag,
    clearTags,
    checkAuthPassword,
    publishPost
  }
}) 