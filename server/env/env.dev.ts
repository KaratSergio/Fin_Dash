export const env = {
  production: false,

  clientUrl: 'http://localhost:4200',

  serverUrl: 'http://localhost:4000', // express server

  apiBase: 'https://localhost:8443/fineract-provider/api/v1', // fineract local

  authPath: '/authentication?tenantIdentifier=default',

  checkAuth: '/self/authentication?tenantIdentifier=default',
};
