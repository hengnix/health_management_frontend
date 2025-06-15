<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">
        {{ isRegister ? '注册' : '登录' }}健康生活管理系统
      </h2>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleSubmit"
        class="login-form"
      >
        <template v-if="isRegister">
          <el-form-item prop="nickname" class="form-item">
            <el-input
              v-model="form.nickname"
              placeholder="请输入昵称"
              :prefix-icon="User"
              size="large"
              @keydown.enter="handleSubmit"
              class="form-input"
            />
          </el-form-item>
        </template>

        <el-form-item prop="email" class="form-item">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            type="email"
            :prefix-icon="Message"
            size="large"
            @keydown.enter="handleSubmit"
            class="form-input"
          />
        </el-form-item>

        <el-form-item prop="password" class="form-item">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            size="large"
            @keydown.enter="handleSubmit"
            class="form-input"
          />
        </el-form-item>

        <template v-if="isRegister">
          <el-form-item prop="confirmPassword" class="form-item">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
              :prefix-icon="Lock"
              size="large"
              @keydown.enter="handleSubmit"
              class="form-input"
            />
          </el-form-item>

          <el-form-item prop="gender" class="form-item radio-group-item">
            <el-radio-group
              v-model="form.gender"
              size="large"
              class="form-radio-group"
            >
              <el-radio label="男" size="large">男</el-radio>
              <el-radio label="女" size="large">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item prop="dateOfBirth" class="form-item date-picker-item">
            <el-date-picker
              v-model="form.dateOfBirth"
              type="date"
              placeholder="请选择出生日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              size="large"
              class="form-input"
            />
          </el-form-item>
        </template>

        <el-form-item class="form-item submit-item">
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
            class="submit-btn"
            size="large"
          >
            <el-icon v-if="!loading" class="submit-btn-icon"><Check /></el-icon>
            {{ isRegister ? '注册账户' : '立即登录' }}
          </el-button>
        </el-form-item>

        <el-form-item class="form-item toggle-item">
          <el-button
            type="text"
            @click="toggleMode"
            class="toggle-btn"
            size="large"
          >
            {{ isRegister ? '已有账户？点击登录' : '没有账户？点击注册' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'
import { User, Message, Lock, Check } from '@element-plus/icons-vue'
import MD5 from 'crypto-js/md5'

const router = useRouter()
const userStore = useUserStore()

const isRegister = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  nickname: '',
  password: '',
  confirmPassword: '',
  email: '',
  gender: '' as '男' | '女' | '',
  dateOfBirth: '' as string,
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (
        _: unknown,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  dateOfBirth: [
    { required: true, message: '请选择出生日期', trigger: 'change' },
  ],
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    nickname: '',
    password: '',
    confirmPassword: '',
    email: '',
    gender: '' as '男' | '女' | '',
    dateOfBirth: '' as string,
  })
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true

  try {
    if (isRegister.value) {
      // 注册时需要将密码进行 MD5 哈希
      const success = await userStore.register({
        email: form.email,
        passwordHash: MD5(form.password).toString(), // 使用 MD5 哈希密码
        nickname: form.nickname,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
      })

      if (success) {
        isRegister.value = false
        resetForm()
      }
    } else {
      // 登录时需要将密码进行 MD5 哈希
      const success = await userStore.login({
        email: form.email,
        passwordHash: MD5(form.password).toString(), // 使用 MD5 哈希密码
      })

      if (success) {
        router.push('/dashboard')
      }
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 设计系统变量 */
:root {
  --primary-900: hsl(256, 43%, 7%);
  --primary-800: hsl(240, 24%, 13%);
  --primary-700: hsl(243, 26%, 15%);
  --primary-600: hsl(252, 9%, 22%);
  --primary-500: hsl(259, 13%, 28%);
  --primary-400: hsl(254, 22%, 32%);
  --primary-300: hsl(251, 13%, 68%);
  --primary-200: hsl(240, 15%, 76%);
  --primary-100: hsl(240, 21%, 88%);
  --neutral-100: hsl(0, 0%, 100%);
  --accent-400: hsl(93, 60%, 69%);

  --text-1: var(--neutral-100);
  --text-2: var(--primary-100);
  --text-3: var(--primary-200);

  --surface-1: var(--primary-900);
  --surface-2: var(--primary-800);
  --surface-3: var(--primary-700);

  --border-1: var(--primary-500);
  --border-2: var(--primary-600);
}

/* 容器样式 */
.login-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    hsl(195, 85%, 45%) 0%,
    hsl(210, 80%, 55%) 25%,
    hsl(225, 75%, 65%) 50%,
    hsl(275, 70%, 70%) 75%,
    hsl(285, 75%, 65%) 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  color: var(--text-3);
}

/* 毛玻璃卡片 */
.login-card {
  --border-width: 1px;
  width: 100%;
  max-width: 500px;
  padding: 2rem 2.5rem;
  border-radius: 1.5rem;
  position: relative;
  display: grid;
  gap: 1.5rem;

  /* 清透的亚克力毛玻璃背景 */
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(40px) saturate(1.5);
  -webkit-backdrop-filter: blur(40px) saturate(1.5);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
}

/* 毛玻璃边框效果 */
.login-card::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  border: var(--border-width) solid transparent;
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    )
    border-box;
  mask:
    linear-gradient(#fff, #fff) border-box,
    linear-gradient(#fff, #fff) padding-box;
  mask-composite: subtract;
  -webkit-mask-composite: subtract;
}

/* 增加额外的毛玻璃层次效果 */
.login-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  border-radius: 1.5rem 1.5rem 0 0;
}

/* 标题样式 */
.login-title {
  text-align: center;
  font-size: 1.875rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  line-height: 1.2;
}

/* 表单容器 */
.login-form {
  display: grid;
  gap: 1.5rem;
}

/* 表单布局调整 */
:deep(.el-form-item) {
  display: block;
  margin-bottom: 0;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
}

/* 表单项样式 */
.form-item {
  margin-bottom: 0;
  width: 75%;
  margin-left: auto;
  margin-right: auto;
}

/* 提交按钮和切换按钮不缩减宽度 */
.submit-item,
.toggle-item {
  width: 50% !important;
}

/* 表单错误信息样式 */
:deep(.el-form-item__error) {
  margin-top: 2.5px;
  padding-left: 10px;
  color: rgba(255, 20, 20, 1);
  font-size: 0.75rem;
  line-height: 1.4;
  text-shadow: 0 0 8px rgba(255, 20, 20, 0.3);
}

/* 日期选择器表单项的错误信息需要更大间距 */
:deep(.date-picker-item .el-form-item__error) {
  margin-top: 10px;
}

/* 输入框样式 */
:deep(.form-input .el-input__wrapper) {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  min-height: 48px;
}

:deep(.form-input .el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 0 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

:deep(.form-input .el-input__wrapper.is-focus) {
  border-color: var(--accent-400);
  box-shadow: 0 0 0 3px hsl(from var(--accent-400) h s l / 0.2);
}

:deep(.form-input .el-input__inner) {
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.form-input .el-input__prefix) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.form-input .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

/* 日期选择器样式 */
:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-date-picker .el-input__wrapper) {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  min-height: 48px;
}

:deep(.el-date-picker .el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 0 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

:deep(.el-date-picker .el-input__wrapper.is-focus) {
  border-color: var(--accent-400);
  box-shadow: 0 0 0 3px hsl(from var(--accent-400) h s l / 0.2);
}

:deep(.el-date-picker .el-input__inner) {
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.el-date-picker .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

/* 单选框样式 */
.form-radio-group {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 单选框组容器居中 */
:deep(.el-radio-group) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 为包含单选框的表单项设置居中 */
:deep(.radio-group-item .el-form-item__content) {
  display: flex;
  justify-content: center;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: hsl(28, 100%, 65%);
  border-color: hsl(28, 100%, 65%);
}

:deep(.el-radio__label) {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  transition: color 0.3s ease;
}

/* 被选中时文字变为橙色 */
:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: hsl(28, 100%, 65%);
  font-weight: 600;
}

:deep(.el-radio__inner:hover) {
  border-color: hsl(28, 100%, 65%);
}

:deep(.el-radio__inner) {
  border-color: var(--border-1);
}

/* 提交按钮样式 */
.submit-item {
  margin-top: 0.5rem;
}

/* 按钮项跨越整个宽度 */
:deep(.submit-item) {
  display: block !important;
}

:deep(.submit-item .el-form-item__content) {
  margin-left: 0 !important;
}

:deep(.toggle-item) {
  display: block !important;
}

:deep(.toggle-item .el-form-item__content) {
  margin-left: 0 !important;
}

.submit-btn {
  width: 100%;
  height: 3.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(25px) saturate(1.3);
  -webkit-backdrop-filter: blur(25px) saturate(1.3);
  color: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 15px rgba(255, 255, 255, 0.05);
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    hsl(from var(--accent-400) h s l / 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.35);
}

/* 提交按钮图标间距 */
.submit-btn-icon {
  margin-right: 0.5rem;
}

.submit-btn:active {
  transform: translateY(0);
}

/* 切换按钮样式 */
.toggle-item {
  margin-bottom: 0;
}

.toggle-btn {
  width: 100%;
  height: 3rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: transparent;
  border: none;
  border-radius: 0.75rem;
}

.toggle-btn:hover {
  color: var(--accent-400);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
}

/* 背景动画 */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 1.5rem;
  }

  .login-card {
    max-width: 320px;
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .login-form {
    gap: 1.25rem;
  }

  .form-radio-group {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 1.5rem 1rem;
  }

  .login-title {
    font-size: 1.25rem;
  }
}
</style>
