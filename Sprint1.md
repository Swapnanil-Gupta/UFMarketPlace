# Sprint 1 Report

## Video Links

1. **Frontend**: [Frontend](https://uflorida-my.sharepoint.com/:v:/g/personal/manikuma_honnena_ufl_edu/EToLoOhUUL5HpnVLnbYe0y4BJ3SYhAa3fVypYHyCvLzx2w?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=PoyqG6)

2. **Backend**: [Backend](https://uflorida-my.sharepoint.com/:v:/g/personal/chiplun_rushangs_ufl_edu/Ec38f4o3f8dKuX7WpW7JLq4BmIIDNlMYgD4JIU-YuaPpNw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=7z7lZP)

## User Stories

### Authentication & Routing (Frontend)

1. **US-001**: As a user, I want to log in with email/password to access protected dashboard features
2. **US-002**: As a user, I want to sign up for a new account to access the application
3. **US-003**: As an unauthenticated user, I should be redirected to login when trying to access /dashboard
4. **US-004**: As a logged-in user, I want to stay authenticated between page refreshes
5. **US-005**: As a user, I want clear error messages for invalid login/signup attempts
6. **US-006**: As a user, I want to logout user once he clicks on the button and remove the session from the browser and redirect to login page

## Authentication & Routing (Backend)

7. **US-007**: As a developer, I want to implement user authentication logic to verify user credentials
8. **US-008**: As a developer, I want to set up database connections to store and retrieve user data
9. **US-009**: As a developer, I want to create user management functions to handle user creation, deletion, and updates
10. **US-010**: As a developer, I want to implement session management to maintain user sessions securely
11. **US-011**: As a developer, I want to add password hashing to securely store user passwords
12. **US-012**: As a developer, I want to implement error handling to provide meaningful error messages for API failures

## Planned Issues

1. Implement protected route component ([#101])
2. Create authentication form with animated inputs ([#102])
3. Add session persistence using browser storage ([#103])
4. Configure API service with axios interceptors ([#104])
5. Implement loading states and error handling ([#105])
6. Added logout functionality([#106])

## Completed Issues

| Issue | Description                                   | Evidence                                                                          |
| ----- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| #101  | Protected route implementation                | `ProtectedRoute.tsx` component using sessionStorage checks                        |
| #102  | Auth forms with react-spring animations       | `Authentication.tsx` with AnimatedInput components                                |
| #103  | Add session persistance using browser storage | `AuthService.ts` with by setting the data to session coming from the API response |
| #104  | API service configuration                     | `AuthService.ts` with axios instance and interceptors                             |
| #105  | Basic error handling                          | Error state management in auth forms                                              |
| #106  | Add logout functionality                      | `Dashboard.tsx` removing the session logic                                        |
| #107  | User authentication logic                     | `auth.py` with functions for login and signup                                     |
| #108  | Database connection setup                     | `database.py` with connection pooling and ORM setup                               |
| #109  | User management functions                     | `user.py` with functions for creating, updating, and deleting users               |
| #110  | Session management implementation             | `auth.py` with session creation and validation logic                              |
| #111  | Password hashing                              | `auth.py` using bcrypt for hashing passwords                                      |
| #112  | API error handling                            | `utils.py` with custom error classes and handlers                                 |

## Incomplete Issues

1. Verify session ID for every route and API call
2. User deletion and updates are not implemented in `user.py`.

## Key Technical Decisions

1. Chose sessionStorage over localStorage for better security isolation
2. Implemented route protection using React Router v6 Outlet pattern
3. Used react-spring for form animations to enhance UX
4. Adopted axios interceptors for consistent API error handling

## Next Steps

1. Implement session expiration logic (Sprint 2)
2. Add password reset functionality (Sprint 2)
3. Improve loading states with skeleton screens (Sprint 2)
