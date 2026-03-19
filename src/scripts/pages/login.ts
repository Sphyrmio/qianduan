/**
 * 登录页 Alpine 组件
 */

import { login } from '@/core/auth/auth.service'
import { router } from '@/core/router/router'

export function loginPageComponent() {
  return {
    username: '',
    password: '',
    errors: {} as Record<string, string>,
    submitting: false,

    /**
     * 清空错误信息
     */
    clearErrors() {
      this.errors = {}
    },

    /**
     * 表单验证
     */
    validate(): boolean {
      this.clearErrors()
      let valid = true

      if (!this.username?.trim()) {
        this.errors.username = '请输入用户名'
        valid = false
      }

      if (!this.password?.trim()) {
        this.errors.password = '请输入密码'
        valid = false
      }

      return valid
    },

    /**
     * 处理提交
     */
    async handleSubmit() {
      if (!this.validate()) return

      this.submitting = true

      try {
        const res = await login({
          username: this.username.trim(),
          password: this.password.trim(),
        })

        if (!res.ok) {
          // 处理验证错误
          if (res.error.kind === 'validation' && res.error.fields) {
            if (res.error.fields['username']) {
              this.errors.username = res.error.fields['username']
            }
            if (res.error.fields['password']) {
              this.errors.password = res.error.fields['password']
            }
          } else {
            this.errors.login = res.error.message
          }
          return
        }

        // 登录成功，回跳
        const params = new URLSearchParams(location.search || location.hash.split('?')[1])
        const returnUrl = params.get('returnUrl')
        router.navigate(returnUrl ? decodeURIComponent(returnUrl) : '/')
      } finally {
        this.submitting = false
      }
    },
  }
}

/**
 * 挂载登录页（兼容原有接口）
 */
export function mount(container: HTMLElement): void {
  container.innerHTML = `
    <div x-data="loginPageComponent()" class="login-container">
      <div class="login-header">
        <h1 class="login-title">工单管理系统</h1>
        <p class="login-sub">请登录您的账号</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="username">用户名</label>
          <sl-input 
            id="username" 
            name="username" 
            placeholder="请输入用户名" 
            autocomplete="username" 
            clearable
            x-model="username"
          ></sl-input>
          <p class="form-error" x-show="errors.username" x-text="errors.username"></p>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">密码</label>
          <sl-input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="请输入密码" 
            autocomplete="current-password" 
            password-toggle
            x-model="password"
          ></sl-input>
          <p class="form-error" x-show="errors.password" x-text="errors.password"></p>
        </div>

        <p class="form-error" x-show="errors.login" x-text="errors.login"></p>

        <sl-button 
          type="submit" 
          variant="primary" 
          style="width:100%;margin-top:8px"
          :loading="submitting"
        >登录</sl-button>
      </form>
    </div>
  `
}
