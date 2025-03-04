# Sprint 2

## Details of Work Completed in Sprint 2 (Backend)

- Created an API to send OTP for email verification.
- Updated database with expiration time each time an OTP is sent.
-  Used **SendGrid** to send OTP emails to users for verification. 
- Created an API to validate the OTP entered by the user and check if it has expired.
- Integrated Forntend and Backend by using CORS (Cross-Origin Resource Sharing).

## User Stories (Frontend)

13. **US-013**: As a seller, I want to create product listings with images to showcase my items
14. **US-014**: As a seller, I want to edit/delete my listings to keep product information updated
15. **US-015**: As a buyer, I want to view product details with image carousels to see multiple photos
16. **US-016**: As a buyer, I want to contact sellers via email to inquire about products
17. **US-017**: As a user, I want to see loading states during image uploads to know the system is working
18. **US-018**: As a mobile user, I want responsive modals to easily view product details
19. **US-019**: As a user, I want clear image upload feedback to avoid submission errors
20. **US-020**: As a user, I want consistent styling across modals for better visual coherence

### Enhanced Interactions

21. **US-021**: As a user, I want smooth image carousel navigation to browse product photos
22. **US-022**: As a user, I want scrollable modal content to view long descriptions comfortably

---

## Completed Frontend Issues

| Issue | Description                             | Evidence                                                         |
| ----- | --------------------------------------- | ---------------------------------------------------------------- |
| #201  | Product creation form with image upload | `Sell.tsx` component with FormData handling                      |
| #202  | Image carousel implementation           | `react-slick` integration in ProductCard component               |
| #203  | Contact seller section in modal         | `Dashboard.tsx` modal with userEmail and userName display        |
| #204  | Responsive modal styling                | CSS media queries in `Dashboard.css` and `Sell.css`              |
| #205  | Form validation for price/fields        | `handleSubmit` validation in Sell component                      |
| #206  | Image preview functionality             | `URL.createObjectURL` usage in Sell component                    |
| #207  | Component-scoped modal styling          | `.sell-modal-content` and `.dashboard-modal-content` CSS classes |
| #208  | Scrollable modal content                | `scrollable-content` class with max-height in CSS                |
| #209  | Animated form transitions               | `@react-spring/web` usage in Authentication component            |
| #210  | Unified error handling                  | `handleError` function in AuthService.ts                         |

---

## Key Technical Additions

- Implemented `react-slick` for image carousels
- Created scoped CSS classes to prevent style conflicts
- Added FormData handling for multipart image uploads
- Developed responsive breakpoints for mobile views
- Built reusable modal component structure

---

## Next Frontend Priorities

1. Add search/filter functionality for products
2. Create user profile management interface

---

## User Stories (Backend)

**US-024**: As a user, I would want only students in the university to view and sell items in the UFMarket place, so email verification through a One-Time Password (OTP) is required.
**US-025**: As a user, if I have not verified my email through OTP, I should not be allowed to log in to the portal.

# **UFMarketPlace API Documentation**

This API handles user authentication and email verification.\
**All error responses include a plain text message unless stated otherwise.**

---

## **Signup**

Registers a new user.

### **Endpoint**

`POST /signup`

### **Request Body (JSON)**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

### **Success Response (JSON)**

```json
{
  "message": "User registered successfully",
  "userId": "123"
}
```

### **Response Errors**

| Status Code | Error Type            | Example Response Body                     |
| ----------- | --------------------- | ----------------------------------------- |
| 405         | Method Not Allowed    | "Method Not Allowed"                      |
| 400         | Invalid Request       | "Email, Name, and Password required"      |
| 400         | Duplicate Email       | "Email already registered"                |
| 500         | Internal Server Error | "Could not register user: database error" |

---

## **Login**

Authenticates a user.

### **Endpoint**

`POST /login`

### **Request Body (JSON)**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### **Success Response (JSON)**

```json
{
  "sessionId": "abc123",
  "name": "John Doe",
  "email": "user@example.com",
  "userId": "123"
}
```

---

## **Send Verification Code**

Sends a verification code to the user's email.

### **Endpoint**

`POST /sendEmailVerificationCode`

### **Request Body (JSON)**

```json
{
  "email": "user@example.com"
}
```

### **Success Response (JSON)**

```json
{
  "message": "Verification code sent successfully. Code will be active for 3 minutes."
}
```

### **Response Errors**

| Status Code | Error Type            | Example Response Body                         |
| ----------- | --------------------- | --------------------------------------------- |
| 405         | Method Not Allowed    | "Method Not Allowed"                          |
| 400         | Invalid Request       | "Email is required for verification"          |
| 400         | Already Verified      | "Account is already verified"                 |
| 404         | User Not Found        | "Error getting user info..."                  |
| 500         | Internal Server Error | "Error sending email: SMTP connection failed" |

---

## **Verify Email Verification Code**

Verifies the email using a verification code.

### **Endpoint**

`POST /verifyEmailVerificationCode`

### **Request Body (JSON)**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### **Success Response (JSON)**

```json
{
  "message": "Email user@example.com successfully verified",
  "userId": "123"
}
```

### **Already Verified Response (JSON)**

```json
{
  "message": "Email associated with account is already verified"
}
```

### **Response Errors**

| Status Code | Error Type            | Example Response Body                        |
| ----------- | --------------------- | -------------------------------------------- |
| 405         | Method Not Allowed    | "Method Not Allowed"                         |
| 400         | Invalid Request       | "Missing required fields: email and code"    |
| 400         | Expired/Invalid Code  | "No active verification code found"          |
| 410         | Code Expired          | "Verification code has expired"              |
| 401         | Invalid Code          | "Invalid verification code"                  |
| 500         | Internal Server Error | "Verification update failed: database error" |

---

This API ensures a smooth user authentication and email verification process for UFMarketPlace.

# Backend Unit Tests

This document lists the unit tests for the backend of the application. Each test is designed to validate a specific functionality of the backend.

---

## **Authentication Handlers**

### **1. `signupHandler`**

- **Test Case 1**: Successful user registration

  - **Input**: Valid `SignUpCredentials` (email, name, password)
  - **Expected Output**: HTTP 200 OK with `{"message": "User registered successfully", "userId": 123}`
  - **Mock**: `EmailExists` returns `false`, `CreateUser` returns `123`.

- **Test Case 2**: Duplicate email registration

  - **Input**: `SignUpCredentials` with an email that already exists
  - **Expected Output**: HTTP 400 Bad Request with `{"error": "Email already registered"}`
  - **Mock**: `EmailExists` returns `true`.

- **Test Case 3**: Missing required fields
  - **Input**: `SignUpCredentials` with missing email, name, or password
  - **Expected Output**: HTTP 400 Bad Request with `{"error": "Email, Name, and Password required"}`

---

### **2. `loginHandler`**

- **Test Case 1**: Successful login

  - **Input**: Valid `LogInCredentials` (email, password)
  - **Expected Output**: HTTP 200 OK with `{"sessionId": "session-123", "name": "Gator", "email": "gator@uf.edu", "userId": 123}`
  - **Mock**: `GetUserByEmail` returns valid user data, `GetUserInfo` returns verified status, `CreateSession` returns `"session-123"`.

- **Test Case 2**: Invalid credentials

  - **Input**: Incorrect email or password
  - **Expected Output**: HTTP 401 Unauthorized with `{"error": "Invalid credentials"}`
  - **Mock**: `GetUserByEmail` returns an error or `bcrypt.CompareHashAndPassword` fails.

- **Test Case 3**: Unverified email
  - **Input**: Valid `LogInCredentials` but email is not verified
  - **Expected Output**: HTTP 401 Unauthorized with `{"error": "Email is not verified"}`
  - **Mock**: `GetUserInfo` returns `verificationStatus = 0`.

---

### **3. `sendVerificationCodeHandler`**

- **Test Case 1**: Successful code generation and email sending

  - **Input**: Valid `VerificationRequest` (email)
  - **Expected Output**: HTTP 200 OK with `{"message": "Verification code sent successfully"}`
  - **Mock**: `GetUserByEmail` returns valid user, `StoreVerificationCode` succeeds, `utils.SendVerificationCode` succeeds.

- **Test Case 2**: Email already verified

  - **Input**: `VerificationRequest` for an already verified email
  - **Expected Output**: HTTP 400 Bad Request with `{"error": "Account is already verified"}`
  - **Mock**: `GetUserInfo` returns `verificationStatus = 1`.

- **Test Case 3**: Invalid email
  - **Input**: `VerificationRequest` with an unregistered email
  - **Expected Output**: HTTP 400 Bad Request with `{"error": "Email not found"}`

---

### **4. `verifyCodeHandler`**

- **Test Case 1**: Successful verification

  - **Input**: Valid `VerifyCodeRequest` (email, code)
  - **Expected Output**: HTTP 200 OK with `{"message": "Email successfully verified", "userId": 123}`
  - **Mock**: `GetVerificationCode` returns a valid code, `UpdateVerificationStatus` succeeds.

- **Test Case 2**: Expired verification code

  - **Input**: Valid `VerifyCodeRequest` but code is expired
  - **Expected Output**: HTTP 410 Gone with `{"error": "Verification code has expired"}`
  - **Mock**: `GetVerificationCode` returns an expired timestamp.

- **Test Case 3**: Invalid verification code
  - **Input**: `VerifyCodeRequest` with an incorrect code
  - **Expected Output**: HTTP 401 Unauthorized with `{"error": "Invalid verification code"}`
  - **Mock**: `GetVerificationCode` returns a mismatched code.

## **Listing Handlers**

### **1. `DeleteListingHandler`**

- **Test Case 1**: Successful Deletion
  - **Input**: HTTP DELETE request with `listingId=1` and header `userId=1`
  - **Expected Output**: HTTP 200 OK with `{"message": "Listing deleted successfully"}`
  - **Mock**: Database confirms user owns listing, deletes associated images, and removes listing successfully.

- **Test Case 2**: Unauthorized User
  - **Input**: HTTP DELETE request with `listingId=1` and header `userId=2`
  - **Expected Output**: HTTP 401 Unauthorized with `"Unauthorized\n"`
  - **Mock**: Database indicates listing belongs to a different user.

- **Test Case 3**: Listing Not Found
  - **Input**: HTTP DELETE request with `listingId=1` and header `userId=1`
  - **Expected Output**: HTTP 404 Not Found with `"Listing not found\n"`
  - **Mock**: Database returns no matching listing.

- **Test Case 4**: Invalid Listing ID
  - **Input**: HTTP DELETE request with `listingId=invalid` and header `userId=1`
  - **Expected Output**: HTTP 400 Bad Request with `"Invalid listingId\n"`
  - **Mock**: No database interaction due to invalid input.

- **Test Case 5**: Missing User ID
  - **Input**: HTTP DELETE request with `listingId=1` and no `userId` header
  - **Expected Output**: HTTP 400 Bad Request with `"Missing userId header\n"`
  - **Mock**: No database interaction due to missing header.

---

### **2. `ListingsHandler`**

- **Test Case 1**: Successful GET Listings Excluding User
  - **Input**: HTTP GET request with header `userId=1`
  - **Expected Output**: HTTP 200 OK with JSON array of listings excluding `userId=1` (e.g., `[{"id": 1, "userId": 2, ...}]`)
  - **Mock**: Database returns listings from other users with associated image data.

- **Test Case 2**: Successful POST Create Listing
  - **Input**: HTTP POST request with multipart form (`productName="Product"`, `price="20.0"`, etc.) and header `userId=1`
  - **Expected Output**: HTTP 200 OK with JSON array of all listings for `userId=1` (e.g., `[{"id": 1, "userId": 1, ...}]`)
  - **Mock**: Database inserts new listing, stores image, and returns all user listings with image data.

- **Test Case 3**: GET Missing User ID
  - **Input**: HTTP GET request with no `userId` header
  - **Expected Output**: HTTP 400 Bad Request with `"Missing userId header\n"`
  - **Mock**: No database interaction due to missing header.

---

### **3. `EditListingHandler`**

- **Test Case 1**: Successful Update
  - **Input**: HTTP PUT request with multipart form (`listingId="1"`, `productName="Updated Product"`, `productDescription="Updated Description"`) and header `userId=1`
  - **Expected Output**: HTTP 200 OK with `{"message": "Listing updated successfully"}`
  - **Mock**: Database confirms user owns listing and updates specified fields successfully.

- **Test Case 2**: Unauthorized User
  - **Input**: HTTP PUT request with multipart form (`listingId="1"`) and header `userId=2`
  - **Expected Output**: HTTP 401 Unauthorized with `"Unauthorized\n"`
  - **Mock**: Database indicates listing belongs to a different user.

---

### **4. `UserListingsHandler`**

- **Test Case 1**: Fetch User Listings
  - **Input**: HTTP GET request with header `userId=1`
  - **Expected Output**: HTTP 200 OK with JSON array of listings for `userId=1` (e.g., `[{"id": 1, "userId": 1, ...}]`)
  - **Mock**: Database returns all listings for the specified user with associated image data.

- **Test Case 2**: No Listings Found
  - **Input**: HTTP GET request with header `userId=1`
  - **Expected Output**: HTTP 200 OK with an empty JSON array (`[]`)
  - **Mock**: Database returns no listings for the user.

- **Test Case 3**: Invalid User ID
  - **Input**: HTTP GET request with header `userId=invalid`
  - **Expected Output**: HTTP 400 Bad Request with `"Invalid userId header\n"`
  - **Mock**: No database interaction due to invalid header value.
