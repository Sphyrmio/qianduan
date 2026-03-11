import '@shoelace-style/shoelace/dist/components/input/input.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import { login } from '@/core/auth/auth.service'
import { router } from '@/core/router/router'
import type SlInput from '@shoelace-style/shoelace/dist/components/input/input.js'

export function mount(container: HTMLElement): void {
  container.innerHTML = `
    <div class="login-header">
      <h1 class="login-title">工单管理系统</h1>
      <p class="login-sub">请登录您的账号</p>
    </div>

    <form id="login-form" class="login-form" novalidate>
      <div class="form-group">
        <label class="form-label" for="username">用户名</label>
        <sl-input id="username" name="username" placeholder="请输入用户名" autocomplete="username" clearable></sl-input>
        <p id="username-err" class="form-error" style="display:none"></p>
      </div>
      <div class="form-group">
        <label class="form-label" for="password">密码</label>
        <sl-input id="password" name="password" type="password" placeholder="请输入密码" autocomplete="current-password" password-toggle></sl-input>
        <p id="password-err" class="form-error" style="display:none"></p>
      </div>

      <p id="login-err" class="form-error" style="display:none;text-align:center"></p>

      <sl-button id="submit-btn" type="submit" variant="primary" style="width:100%;margin-top:8px">登录</sl-button>
    </form>
  `

  const form = container.querySelector<HTMLFormElement>('#login-form')!
  const submitBtn = container.querySelector('#submit-btn') as HTMLElement & { loading?: boolean }
  const usernameEl = container.querySelector<SlInput & { value: string }>('#username')!
  const passwordEl = container.querySelector<SlInput & { value: string }>('#password')!

  const showFieldErr = (id: string, msg: string) => {
    const el = container.querySelector<HTMLElement>(id)!
    el.textContent = msg
    el.style.display = msg ? '' : 'none'
  }

  const clearErrors = () => {
    showFieldErr('#username-err', '')
    showFieldErr('#password-err', '')
    showFieldErr('#login-err', '')
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearErrors()

    const username = usernameEl.value?.trim() ?? ''
    const password = passwordEl.value?.trim() ?? ''

    let valid = true
    if (!username) { showFieldErr('#username-err', '请输入用户名'); valid = false }
    if (!password) { showFieldErr('#password-err', '请输入密码'); valid = false }
    if (!valid) return

    submitBtn.setAttribute('loading', '')
    ;(submitBtn as unknown as { disabled: boolean }).disabled = true

    const res = await login({ username, password })

    submitBtn.removeAttribute('loading')
    ;(submitBtn as unknown as { disabled: boolean }).disabled = false

    if (!res.ok) {
      if (res.error.kind === 'validation' && res.error.fields) {
        if (res.error.fields['username']) showFieldErr('#username-err', res.error.fields['username'])
        if (res.error.fields['password']) showFieldErr('#password-err', res.error.fields['password'])
      } else {
        showFieldErr('#login-err', res.error.message)
      }
      return
    }

    // 登录成功，回跳
    const params = new URLSearchParams(location.search || location.hash.split('?')[1])
    const returnUrl = params.get('returnUrl')
    router.navigate(returnUrl ? decodeURIComponent(returnUrl) : '/')
  })
}
