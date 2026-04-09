declare const google: {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: { access_token?: string; error?: string }) => void
      }) => { requestAccessToken: () => void }
    }
  }
}

declare const AppleID: {
  auth: {
    init: (config: {
      clientId: string
      scope: string
      redirectURI: string
      usePopup: boolean
    }) => void
    signIn: () => Promise<{ authorization: { id_token: string; code: string } }>
  }
}
