# FinDash — Admin & User Dashboard for Apache Fineract



## Project Overview

**FinDash** is a frontend application built with **Angular 20** for interacting with the **Apache Fineract REST API** (v1.13.0-SNAPSHOT).  
The project is designed to fully leverage all available Fineract endpoints, providing a complete interface for managing users, roles, offices, and other platform entities.  

- [Apache Fineract Backend](https://github.com/KaratSergio/fineract)
> Demo credentials (for testing purposes):
> - **Username:** `mifos`
> - **Password:** `password`

---

## Technology Stack

- **Frontend:** Angular 20 (Standalone Components, Signals)  
- **Server-side rendering:** Angular SSR + Express  
- **State & HTTP:** RxJS + Angular HttpClient  
- **Styling:** CSS / SCSS  
- **Testing:** Jasmine + Karma  
- **Formatting:** Prettier  

---

## Useful Links

- [Official Apache Fineract Documentation (current)](https://fineract.apache.org/docs/current/)
- [Official Apache Fineract Documentation (homepage)](https://fineract.apache.org/)
- [Swagger / OpenAPI Specification](https://sandbox.mifos.community/fineract-provider/swagger-ui/index.html#/)
- [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)

---

### example of client structure
```
src/
├── app/                                 # bootstrap, main module and routes
│   ├── routes
│   │   ├── app.routes.server.ts
│   │   └── app.routes.ts
│   ├── app.ts
│   ├── main.server.ts
│   └── main.ts
│
├── core/                                # application infrastructure (regardless of domains)
│   ├── auth/
│   │   └── auth.service.ts
│   ├── config/
│   │   ├── app.config.server.ts
│   │   └── app.config.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── utils/
│       ├── date.ts
│       ├── error.ts
│       └── form.ts
│
├── shared/                              # fully reusable components/pipes/styles
│   ├── components/                      
│   ├── pipes/
│   │   └── format-date.pipe.ts
│   └── styles/
│       └── global.scss
│
├── domains/                             # the main part is domains corresponding to endpoint groups
│   ├── accounting/                      
│   │   ├── services/
│   │   │   └── glaccounts.service.ts
│   │   ├── components/
│   │   │   ├── gl-accounts-form/
│   │   │   │   ├── gl-accounts-from.ts
│   │   │   │   ├── gl-accounts-from.html
│   │   │   │   └── gl-accounts-from.scss
│   │   │   ├── gl-accounts-table/
│   │   │   │   ├── gl-accounts-table.ts
│   │   │   │   ├── gl-accounts-table.html
│   │   │   │   └── gl-accounts-table.scss
│   │   └── pages/
│   │       └── gl-accounts/
│   │           ├── gl-accounts.ts
│   │           ├── gl-accounts.html
│   │           └── gl-accounts.scss
│   │
│   ├── clients/                         # Client, Client Charges, Client Address, Identifiers...
│   │   ├── services/
│   │   │   └── clients.service.ts
│   │   ├── components/
│   │   │   ├── clients-form/
│   │   │   └── clients-table/
│   │   └── pages/
│   │       ├── clients.ts
│   │       └── clients.html
│   │       └── clients.scss
│   │
│   ├── loans/                           # Loan Products, Loans, Loan Charges, Rescheduling...
│   │   ├── services/
│   │   │   ├── loans.service.ts
│   │   │   ├── loans.charges.service.ts
│   │   │   └── loan-products.service.ts
│   │   ├── pages/
│   │   │   ├── loans/
│   │   │   ├── loan-charges/
│   │   │   └── loan-products/
│   │   └── components/
│   │       ├── loans/
│   │       ├── loan-charges/
│   │       └── loan-products/
│   │
│   ├── offices/                         # Offices...
│   │   ├── services/
│   │   │   └── offices.service.ts
│   │   ├── components/
│   │   │   ├── offices-form/
│   │   │   └── offices-table/
│   │   └── pages/
│   │       ├── offices.ts
│   │       └── offices.html
│   │       └── offices.scss
│   ├── users/                            # Users...
│   │   ├── services/
│   │   │   └── users.service.ts
│   │   ├── components/
│   │   │   ├── users-form/
│   │   │   └── users-table/
│   │   └── pages/
│   │       ├── users.ts
│   │       └── users.html
│   │       └── users.scss
│   └── roles/                            # Roles...
│       ├── services/
│       │   └── roles.service.ts
│       ├── components/
│       │   ├── roles-form/
│       │   └── roles-table/
│       └── pages/
│           ├── roles.ts
│           └── roles.html
│           └── roles.scss
│
├── pages/                                # top-level routes (dashboard, admin, auth)
│   ├── dashboard/
│   ├── admin/
│   └── auth/
│
│
└── index.html

```