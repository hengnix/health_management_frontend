<template>
  <div class="chat-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon">
              <ChatDotRound />
            </el-icon>
            AI 智能聊天
          </h1>
          <p class="subtitle">与 AI 助手交流，获取健康管理建议</p>
        </div>
        <div class="header-actions">
          <el-button
            type="danger"
            size="default"
            @click="clearMemory"
            :loading="isLoading"
            class="clear-memory-btn"
          >
            <el-icon>
              <Delete />
            </el-icon>
            清除记忆
          </el-button>
          <el-button
            type="warning"
            size="default"
            @click="clearChatHistory"
            class="clear-btn"
          >
            <el-icon>
              <Delete />
            </el-icon>
            清除历史
          </el-button>
        </div>
      </div>
    </div>

    <!-- 聊天主体区域 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-chat">
          <div class="empty-icon">
            <el-icon>
              <ChatDotRound />
            </el-icon>
          </div>
          <h3>开始与 AI 助手对话</h3>
          <p>你可以询问关于健康管理、饮食建议、运动计划等问题</p>
        </div>

        <div v-else class="messages-list">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'message-item',
              message.type,
              { streaming: message.isStreaming },
            ]"
          >
            <div class="message-avatar">
              <el-icon v-if="message.type === 'user'">
                <User />
              </el-icon>
              <el-icon v-else>
                <ChatDotRound />
              </el-icon>
            </div>
            <div class="message-content">
              <div
                class="message-bubble"
                :class="{ streaming: message.isStreaming }"
              >
                <!-- 如果是流式传输且内容为空，显示思考动画 -->
                <div
                  v-if="
                    message.isStreaming &&
                    (!message.content || message.content.trim() === '')
                  "
                  class="typing-indicator"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <!-- 否则显示内容 -->
                <div
                  v-else-if="message.content"
                  v-html="sanitizeHtml(message.content)"
                ></div>
                <!-- 空内容占位 -->
                <div v-else>&nbsp;</div>
              </div>
              <div class="message-time">
                {{ formatTime(message.timestamp) }}
                <span v-if="message.isStreaming" class="streaming-indicator">
                  正在输入...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="input-wrapper">
          <el-input
            v-model="currentMessage"
            type="textarea"
            :rows="3"
            placeholder="给 AI 助手发送消息"
            :disabled="isLoading"
            @keydown.enter.prevent="handleEnter"
            @input="handleInput"
            resize="none"
            class="chat-input"
          />
          <el-button
            type="primary"
            :loading="isLoading"
            :disabled="!currentMessage.trim() || isWarmingUp"
            @click="sendMessage"
            class="send-btn-embedded"
          >
            <el-icon v-if="!isLoading">
              <Position />
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { chatApi } from '@/api'
import { ElMessage } from 'element-plus'
import { ChatDotRound, User, Position, Delete } from '@element-plus/icons-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface Message {
  type: 'user' | 'assistant'
  content: string
  timestamp: string // 改为 string 类型，便于 JSON 序列化
  isStreaming?: boolean // 标识是否正在流式传输
}

const currentMessage = ref('')
const isLoading = ref(false)
const isWarmingUp = ref(false) // 新增：连接预热状态
const messagesContainer = ref<HTMLElement>()
const messages = reactive<Message[]>([])

// localStorage 存储的 key
const CHAT_HISTORY_KEY = 'health_chat_history'

// 防抖保存函数
let saveTimeout: number | null = null
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    saveChatHistory()
  }, 500) // 500ms 防抖
}

// 配置 marked
marked.setOptions({
  gfm: true, // 启用 GitHub Flavored Markdown
  breaks: true, // 将换行符转换为 <br>
})

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 安全地处理 HTML 内容，支持 Markdown 转换
const sanitizeHtml = (content: string) => {
  // 如果内容为空，返回空字符串
  if (!content || content.trim() === '') {
    return ''
  }

  try {
    // 使用 marked 将 markdown 转换为 HTML
    const htmlContent = marked(content) as string

    // 使用 DOMPurify 清理和安全化 HTML
    const cleanHtml = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        'span',
        'div',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
        'a',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'hr',
        'del',
        'ins',
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'class', 'rel'],
    })

    // 为链接添加安全属性
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = cleanHtml
    const links = tempDiv.querySelectorAll('a')
    links.forEach((link) => {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    })

    return tempDiv.innerHTML
  } catch (error) {
    console.error('Markdown 解析失败:', error)
    // 如果 marked 解析失败，fallback 到原始的 DOMPurify 处理
    const cleanHtml = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        'span',
        'div',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
        'a',
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'class', 'rel'],
    })

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = cleanHtml
    const links = tempDiv.querySelectorAll('a')
    links.forEach((link) => {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    })

    return tempDiv.innerHTML
  }
}

// 预热连接函数
const warmupConnection = async () => {
  isWarmingUp.value = true
  try {
    console.log('开始预热 API 连接...')
    await chatApi.warmup()
    console.log('API 连接预热成功')
  } catch (error) {
    console.log('API 连接预热失败，首次请求可能会有延迟:', error)
  } finally {
    isWarmingUp.value = false
  }
}
const loadChatHistory = () => {
  try {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY)
    if (savedHistory) {
      const historyData = JSON.parse(savedHistory)
      // 现在 timestamp 已经是 string 类型，直接使用
      const parsedMessages = historyData.map((msg: Message) => ({
        ...msg,
        // 确保 isStreaming 为 false（历史消息不应该处于流式状态）
        isStreaming: false,
      }))
      messages.splice(0, messages.length, ...parsedMessages)
      console.log('已加载聊天历史，共', messages.length, '条消息')
      // 调试：显示加载的消息内容
      parsedMessages.forEach((msg: Message, index: number) => {
        console.log(`加载的消息 ${index}:`, {
          type: msg.type,
          content: msg.content.substring(0, 50) + '...',
          contentLength: msg.content.length,
        })
      })
    }
  } catch (error) {
    console.error('加载聊天历史失败:', error)
    // 如果加载失败，清除损坏的数据
    localStorage.removeItem(CHAT_HISTORY_KEY)
  }
}

// 保存聊天历史到 localStorage
const saveChatHistory = () => {
  try {
    // 只保存最近的 100 条消息以避免 localStorage 过大
    const messagesToSave = messages.slice(-100)
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave))
    console.log('已保存聊天历史，共', messagesToSave.length, '条消息')
    // 调试：显示保存的消息内容
    messagesToSave.forEach((msg: Message, index: number) => {
      console.log(`消息 ${index}:`, {
        type: msg.type,
        content: msg.content.substring(0, 50) + '...',
        contentLength: msg.content.length,
        isStreaming: msg.isStreaming,
      })
    })
  } catch (error) {
    console.error('保存聊天历史失败:', error)
    // 如果保存失败，可能是因为 localStorage 空间不足
    ElMessage.warning('聊天历史保存失败，可能是存储空间不足')
  }
}

// 清除聊天历史
const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY)
    messages.splice(0, messages.length)
    ElMessage.success('聊天历史已清除')
  } catch (error) {
    console.error('清除聊天历史失败:', error)
  }
}

// 清除记忆功能
const clearMemory = async () => {
  try {
    isLoading.value = true
    await chatApi.clearMemory()
    ElMessage.success('AI 记忆已清除')
  } catch (error) {
    console.error('清除 AI 记忆失败:', error)
    ElMessage.error('清除 AI 记忆失败')
  } finally {
    isLoading.value = false
  }
}

// 监听 messages 数组的变化，自动保存
watch(
  () => messages.length,
  () => {
    if (messages.length > 0) {
      saveChatHistory()
    }
  },
  { flush: 'post' },
)

// 深度监听 messages 数组内容的变化，用于保存流式更新的内容
watch(
  () => messages,
  () => {
    if (messages.length > 0) {
      debouncedSave()
    }
  },
  { deep: true, flush: 'post' },
)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    // 使用平滑滚动，增强用户体验
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage = currentMessage.value.trim()

  // 添加用户消息
  messages.push({
    type: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  })

  currentMessage.value = ''
  isLoading.value = true

  await scrollToBottom()

  // 创建一个空的 AI 回复消息，用于流式更新
  const aiMessageIndex = messages.length
  messages.push({
    type: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    isStreaming: true,
  })

  await scrollToBottom()

  try {
    // 添加流式传输开始的标记
    let streamStarted = false
    let streamTimeout: number | null = null

    // 设置超时检测，如果 3 秒内没有开始流式传输，则提示用户
    streamTimeout = setTimeout(() => {
      if (!streamStarted && messages[aiMessageIndex]) {
        console.log('流式传输启动较慢，可能是首次连接...')
      }
    }, 3000)

    // 使用流式聊天 API
    await chatApi.streamChat(userMessage, (chunk: string) => {
      // 标记流式传输已开始
      if (!streamStarted) {
        streamStarted = true
        if (streamTimeout) {
          clearTimeout(streamTimeout)
          streamTimeout = null
        }
        console.log('流式传输已开始')
      }

      // 实时更新 AI 回复内容
      if (messages[aiMessageIndex]) {
        messages[aiMessageIndex].content += chunk
        console.log(
          '流式更新 - 当前内容长度:',
          messages[aiMessageIndex].content.length,
          '新增内容:',
          chunk.substring(0, 20) + '...',
        )
        // 滚动到底部以跟随新内容
        scrollToBottom()
      }
    })

    // 清理超时定时器
    if (streamTimeout) {
      clearTimeout(streamTimeout)
    }

    // 流式传输完成，更新状态
    if (messages[aiMessageIndex]) {
      messages[aiMessageIndex].isStreaming = false
      console.log(
        '流式传输完成，最终内容长度:',
        messages[aiMessageIndex].content.length,
      )
      // 手动触发保存，确保完整的 AI 回答被保存
      saveChatHistory()
    }
  } catch (error) {
    console.error('流式聊天失败:', error)

    // 如果流式传输失败，尝试使用传统 API
    try {
      const response = await chatApi.testChat(userMessage)

      if (response.success) {
        const aiResponse = (response.data as string) || '收到你的消息了！'

        // 更新消息内容
        if (messages[aiMessageIndex]) {
          messages[aiMessageIndex].content = aiResponse
          messages[aiMessageIndex].isStreaming = false
          // 手动触发保存
          saveChatHistory()
        }
      } else {
        ElMessage.error(response.message || '发送消息失败')
        // 删除空的 AI 消息
        messages.splice(aiMessageIndex, 1)
      }
    } catch (fallbackError) {
      console.error('传统聊天也失败:', fallbackError)
      ElMessage.error('发送消息失败，请稍后重试')

      // 添加错误提示消息
      if (messages[aiMessageIndex]) {
        messages[aiMessageIndex].content = '抱歉，我暂时无法回复，请稍后重试。'
        messages[aiMessageIndex].isStreaming = false
        // 手动触发保存
        saveChatHistory()
      }
    }
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const handleEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    sendMessage()
  }
}

const handleInput = () => {
  // 可以在这里添加输入验证逻辑
}

onMounted(() => {
  // 页面加载时从 localStorage 加载聊天历史
  loadChatHistory()
  // 如果有历史消息，滚动到底部
  if (messages.length > 0) {
    nextTick(() => {
      scrollToBottom()
    })
  }

  // 预热 API 连接，减少首次请求延迟
  warmupConnection()
})

onUnmounted(() => {
  // 组件卸载时清理防抖定时器
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
})
</script>

<style scoped>
.chat-container {
  padding: 30px;
  background: transparent;
  height: calc(100vh - 70px); /* 固定高度，不使用 min-height */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止整个容器滚动 */
}

.page-header {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  border-radius: 20px;
  padding: 20px 35px; /* 减少垂直内边距从 35px 改为 20px */
  margin-bottom: 25px;
  box-shadow: 0 8px 25px rgba(255, 154, 158, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%,
  100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title-section {
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.clear-btn {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  border: 1px solid rgba(243, 156, 18, 0.8);
  color: white;
  border-radius: 12px;
  padding: 10px 20px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
  font-weight: 600;
  font-size: 1rem;
  height: 42px;
}

.clear-btn:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  border-color: rgba(230, 126, 34, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.5);
}

.clear-memory-btn {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  border: 1px solid rgba(255, 71, 87, 0.8);
  color: white;
  border-radius: 12px;
  padding: 10px 20px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  font-weight: 600;
  font-size: 1rem;
  height: 42px;
}

.clear-memory-btn:hover {
  background: linear-gradient(135deg, #ff3838 0%, #ff2f2f 100%);
  border-color: rgba(255, 56, 56, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.5);
}

.page-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 18px;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.title-icon {
  font-size: 3.2rem;
  color: #fff;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.chat-main {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1; /* 占用剩余空间 */
  padding: 30px;
  overflow-y: auto; /* 只在 Y 轴滚动 */
  overflow-x: hidden; /* 隐藏 X 轴滚动 */
  scroll-behavior: smooth;
  display: flex; /* 添加 flex 布局 */
  flex-direction: column; /* 垂直方向 */
  /* 确保滚动条样式美观 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

/* WebKit 浏览器滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1; /* 使用 flex: 1 替代 height: 100%，更好地占满剩余空间 */
  color: #666;
  text-align: center;
  min-height: 400px; /* 设置最小高度，确保内容不会太小 */
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 20px;
}

.empty-chat h3 {
  font-size: 1.5rem;
  margin: 0 0 10px 0;
  color: #374151;
  font-weight: 600;
}

.empty-chat p {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px; /* 底部留出空间，避免最后一条消息贴边 */
  flex: 1; /* 确保消息列表能够占满可用空间 */
  justify-content: flex-start; /* 消息从顶部开始排列 */
}

.message-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.message-item.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-item.assistant .message-avatar {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.message-item.assistant.streaming .message-avatar {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  animation: pulse-avatar 2s ease-in-out infinite;
}

@keyframes pulse-avatar {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(78, 205, 196, 0.5);
  }
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-item.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-bubble {
  padding: 15px 20px;
  border-radius: 20px;
  word-wrap: break-word;
  line-height: 1.5;
  font-size: 1rem;
  transition: all 0.3s ease;
}

/* HTML 内容样式优化 - 支持 Markdown 渲染 */
.message-bubble :deep(p) {
  margin: 0 0 8px 0;
}

.message-bubble :deep(p:last-child) {
  margin-bottom: 0;
}

.message-bubble :deep(strong),
.message-bubble :deep(b) {
  font-weight: 600;
}

.message-bubble :deep(em),
.message-bubble :deep(i) {
  font-style: italic;
}

.message-bubble :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.message-bubble :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  line-height: 1.4;
}

.message-bubble :deep(pre code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
}

.message-bubble :deep(ul),
.message-bubble :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-bubble :deep(li) {
  margin: 4px 0;
}

.message-bubble :deep(blockquote) {
  border-left: 4px solid rgba(0, 0, 0, 0.2);
  padding-left: 12px;
  margin: 8px 0;
  font-style: italic;
  opacity: 0.9;
}

.message-bubble :deep(a) {
  color: inherit;
  text-decoration: underline;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.message-bubble :deep(a:hover) {
  opacity: 1;
}

.message-bubble :deep(h1),
.message-bubble :deep(h2),
.message-bubble :deep(h3),
.message-bubble :deep(h4),
.message-bubble :deep(h5),
.message-bubble :deep(h6) {
  margin: 12px 0 8px 0;
  font-weight: 600;
}

.message-bubble :deep(h1) {
  font-size: 1.3em;
}
.message-bubble :deep(h2) {
  font-size: 1.2em;
}
.message-bubble :deep(h3) {
  font-size: 1.1em;
}
.message-bubble :deep(h4),
.message-bubble :deep(h5),
.message-bubble :deep(h6) {
  font-size: 1em;
}

/* 表格样式 */
.message-bubble :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  overflow: hidden;
}

.message-bubble :deep(th),
.message-bubble :deep(td) {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.message-bubble :deep(th) {
  background: rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.message-bubble :deep(tr:last-child td) {
  border-bottom: none;
}

/* 分隔线样式 */
.message-bubble :deep(hr) {
  border: none;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 16px 0;
}

/* 删除线和插入线 */
.message-bubble :deep(del) {
  text-decoration: line-through;
  opacity: 0.7;
}

.message-bubble :deep(ins) {
  text-decoration: underline;
  background: rgba(255, 255, 0, 0.2);
  padding: 1px 2px;
}

.message-item.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 5px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.message-item.assistant .message-bubble {
  background: rgba(248, 250, 252, 0.8);
  color: #374151;
  border: 1px solid rgba(229, 231, 235, 0.5);
  border-bottom-left-radius: 5px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.message-time {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 5px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.streaming-indicator {
  font-size: 0.7rem;
  color: #667eea;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.streaming-indicator::after {
  content: '';
  width: 4px;
  height: 4px;
  background: #667eea;
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 0.3;
  }
  25%,
  75% {
    opacity: 1;
  }
}

.message-bubble.streaming {
  position: relative;
}

.message-bubble.streaming::after {
  content: '';
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: pulse-stream 1.5s infinite;
}

.message-item.assistant .message-bubble.streaming::after {
  background: #4ecdc4;
}

@keyframes pulse-stream {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.loading .message-bubble {
  padding: 20px;
}

.typing-indicator {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ecdc4;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-container {
  padding: 20px 30px;
  border-top: 1px solid rgba(229, 231, 235, 0.3);
  background: rgba(255, 255, 255, 0.8); /* 稍微调整透明度 */
  backdrop-filter: blur(10px);
  flex-shrink: 0; /* 防止输入区域被压缩 */
  /* 添加轻微阴影，增强固定感 */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.input-wrapper {
  position: relative;
  display: block;
  max-width: 100%;
  width: 100%;
}

.chat-input {
  width: 100%;
}

:deep(.chat-input .el-textarea__inner) {
  border-radius: 15px;
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  padding: 15px 60px 15px 20px; /* 右侧留出更多空间给发送按钮 */
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.send-btn-embedded {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid rgba(102, 126, 234, 0.8);
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 确保 Element Plus 加载图标居中 */
:deep(.send-btn-embedded.is-loading) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.send-btn-embedded .el-loading-spinner) {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

:deep(.send-btn-embedded .el-loading-spinner .circular) {
  width: 1.1rem;
  height: 1.1rem;
}

.send-btn-embedded:hover:not(:disabled) {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  border-color: rgba(118, 75, 162, 0.9);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.send-btn-embedded:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-btn-embedded .el-icon {
  font-size: 1.1rem;
}

:deep(.chat-input .el-textarea__inner:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

:deep(.chat-input .el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .chat-container {
    padding: 20px;
  }

  .page-header {
    padding: 25px;
    margin-bottom: 15px;
  }

  .page-title {
    font-size: 2.2rem;
  }

  .messages-container {
    padding: 20px;
  }

  .message-content {
    max-width: 85%;
  }

  .input-container {
    padding: 15px 20px;
  }

  :deep(.chat-input .el-textarea__inner) {
    padding: 12px 55px 12px 15px; /* 移动端稍微减少内边距 */
  }

  .send-btn-embedded {
    width: 35px;
    height: 35px;
    right: 6px;
    bottom: 6px;
  }
}
</style>
