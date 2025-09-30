export const env = {
  production: false,

  ssrUrl: 'http://localhost:4000', // express server

  proxy: 'https://localhost:8443/fineract-provider',

  apiBase: 'https://localhost:8443/fineract-provider/api/v1', // fineract local 

  authPath: '/authentication?tenantIdentifier=default',

  checkAuth: '/self/authentication?tenantIdentifier=default',
};
