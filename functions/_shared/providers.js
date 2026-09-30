export const providers = {
  google: {
    auth: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token',
    clientId: 'GOOGLE_CLIENT_ID', clientSecret: 'GOOGLE_CLIENT_SECRET'
  },
  github: {
    auth: 'https://github.com/login/oauth/authorize', token: 'https://github.com/login/oauth/access_token',
    clientId: 'GITHUB_CLIENT_ID', clientSecret: 'GITHUB_CLIENT_SECRET'
  }
};
