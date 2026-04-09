import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'

export function useRegister() {
  return useMutation({
    mutationFn: (data: { username: string; password: string; ageConfirmed: boolean }) =>
      apiClient.post('/accounts/', data),
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      apiClient.post(
        '/uaa/oauth/token',
        new URLSearchParams({
          grant_type: 'password',
          username: data.username,
          password: data.password,
          scope: 'ui',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          auth: { username: 'browser', password: '' },
        },
      ),
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.data.access_token)
    },
  })
}

export function useSocialLogin() {
  return useMutation({
    mutationFn: (data: { provider: 'google'; idToken: string } | { provider: 'apple'; identityToken: string; authorizationCode: string }) => {
      if (data.provider === 'google') {
        return apiClient.post<{ access_token: string; email: string }>('/uaa/social/google', { idToken: data.idToken })
      }
      return apiClient.post<{ access_token: string; email: string }>('/uaa/social/apple', {
        identityToken: data.identityToken,
        authorizationCode: data.authorizationCode,
      })
    },
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.data.access_token)
    },
  })
}
