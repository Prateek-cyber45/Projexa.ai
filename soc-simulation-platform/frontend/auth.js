export const saveToken = (token) => localStorage.setItem('token', token)
export const getToken = () => localStorage.getItem('token')
export const removeToken = () => localStorage.removeItem('token')
export const saveUser = (user) => localStorage.setItem('user', JSON.stringify(user))
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}
