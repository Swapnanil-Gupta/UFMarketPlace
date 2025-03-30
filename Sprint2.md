# Sprint 2

## Details of Work Completed in Sprint 2

- Created an API to send OTP for email verification.
- Updated database with expiration time each time an OTP is sent.
-  Used **SendGrid** to send OTP emails to users for verification. 
- Created an API to validate the OTP entered by the user and check if it has expired.
- Integrated Forntend and Backend by using CORS (Cross-Origin Resource Sharing).
- Implemented endpoints to retrieve listings: one endpoint returns all listings excluding those created by the current user, and another returns only the listings of the current user.
- Integrated CRUD operations for product listings, including creating, updating (with full image replacement when new images are provided), and deleting listings along with their associated images.
- Images are stored in the database as binary data and are returned as base64-encoded strings to allow direct rendering on the frontend.

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
**US-026**: As a verified user, I want to create a new product listing with images so that I can sell my items on UFMarketPlace.
- **Acceptance Criteria:**
  - The user must be authenticated (with a valid session) and have a verified email.
  - The `POST /listings` endpoint accepts multipart form data including fields:
    - `productName`, `productDescription`, `price`, `category`
    - One or more image files under the key `images`
  - The listing is saved in the database along with the images (which are stored in binary form and returned as base64 strings).
  - The API response returns all listings for the current user including the new one.

**US-027**: As a user, I want to view all product listings except my own so that I can browse items available from other sellers.
- **Acceptance Criteria:**
  - The `GET /listings` endpoint returns listings that do not belong to the current user.
  - The request requires a `userId` header indicating the current user’s ID.
  - The response includes complete listing details along with associated images (base64 encoded).

**US-028**: As a user, I want to view all my own product listings so that I can manage my items for sale.
- **Acceptance Criteria:**
  - The `GET /userListings` endpoint returns only listings created by the current user.
  - The request requires a `userId` header.
  - The response includes listing details and associated images.

**US-029**: As a user, I want to edit my existing product listing (including updating images) so that I can update or correct my listing information.
- **Acceptance Criteria:**
  - The `PUT /listing/edit` endpoint allows updating listing fields (`productName`, `productDescription`, `price`, `category`).
  - New images provided will replace all existing images for that listing.
  - The endpoint verifies that the listing belongs to the current user (using the `userId` header).
  - The API returns a success message upon successful update.

**US-030**: As a user, I want to delete my product listing so that I can remove items that are no longer available.
- **Acceptance Criteria:**
  - The `DELETE /listing/delete` endpoint allows the user to delete a listing.
  - The listing is identified via a query parameter (`listingId`), and the request includes the `userId` header.
  - All images associated with the listing are also removed from the database.
  - A success message is returned once the deletion is complete.

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


## **Create Listing**

Registers a new product listing.

### **Endpoint**

`POST /listings`

### **Request Headers**

- `userId` (required): The ID of the logged-in user.

### **Request Body (Multipart Form Data)**

| Field              | Type   | Description                    |
| ------------------ | ------ | ------------------------------ |
| `productName`      | Text   | Name of the product.           |
| `productDescription` | Text   | Description of the product.    |
| `price`            | Number | Price of the product.          |
| `category`         | Text   | Product category (e.g., "Electronics"). |
| `images`           | File   | One or more image files.       |

### **Success Response (JSON)**

Returns all listings for the current user after creation.

```json
[
  {
    "id": 3,
    "userId": 5,
    "userName": "Alice",
    "userEmail": "alice@example.com",
    "productName": "Smartphone",
    "productDescription": "Latest model smartphone",
    "price": 799.99,
    "category": "Electronics",
    "createdAt": "2025-03-03T11:00:00Z",
    "updatedAt": "2025-03-03T11:00:00Z",
    "images": [
      {
        "id": 2,
        "contentType": "image/jpeg",
        "data": "..."
      }
    ]
  }
]
```

### **Response Errors**

| Status Code | Error Type            | Example Response Body                   |
| ----------- | --------------------- | --------------------------------------- |
| 400         | Invalid Request       | "Unable to parse form data", "Invalid price" |
| 400         | Missing Header        | "Missing userId header"                 |
| 500         | Internal Server Error | "error message"                         |

---

## **Get User Listings**

Fetches all listings created by the current user.

### **Endpoint**

`GET /userListings`

### **Request Headers**

- `userId` (required): The ID of the logged-in user.

### **Success Response (JSON)**

```json
[
  {
    "id": 3,
    "userId": 5,
    "userName": "Alice",
    "userEmail": "alice@example.com",
    "productName": "Smartphone",
    "productDescription": "Latest model smartphone",
    "price": 799.99,
    "category": "Electronics",
    "createdAt": "2025-03-03T11:00:00Z",
    "updatedAt": "2025-03-03T11:00:00Z",
    "images": [
      {
        "id": 2,
        "contentType": "image/jpeg",
        "data": "..."
      }
    ]
  }
]
```

### **Response Errors**

| Status Code | Error Type            | Example Response Body                   |
| ----------- | --------------------- | --------------------------------------- |
| 400         | Missing/Invalid Header | "Missing userId header" or "Invalid userId header" |
| 500         | Internal Server Error | "error message"                         |

---

## **Edit Listing**

Updates an existing listing (only if owned by the current user). If new images are provided, all existing images for that listing are replaced.

### **Endpoint**

`PUT /listing/edit`

### **Request Headers**

- `userId` (required): The ID of the logged-in user.

### **Request Body (Multipart Form Data)**

| Field              | Type   | Description                    |
| ------------------ | ------ | ------------------------------ |
| `listingId`        | Number | ID of the listing to update.   |
| `productName`      | Text   | Optional. New product name.    |
| `productDescription` | Text   | Optional. New product description. |
| `price`            | Number | Optional. New price.           |
| `category`         | Text   | Optional. New category.        |
| `images`           | File   | Optional. New image files (replaces existing images). |

### **Success Response (JSON)**

```json
{
  "message": "Listing updated successfully"
}
```

### **Response Errors**

| Status Code | Error Type            | Example Response Body                   |
| ----------- | --------------------- | --------------------------------------- |
| 400         | Invalid Request       | "Invalid listingId", "Invalid userId header" |
| 401         | Unauthorized          | "Unauthorized"                          |
| 500         | Internal Server Error | "error message"                         |

---

## **Delete Listing**

Deletes an existing listing along with all its images (only if owned by the current user).

### **Endpoint**

`DELETE /listing/delete`

### **Request Headers**

- `userId` (required): The ID of the logged-in user.

### **Query Parameters**

- `listingId` (required): The ID of the listing to delete.

### **Success Response (JSON)**

```json
{
  "message": "Listing deleted successfully"
}
```

### **Response Errors**

| Status Code | Error Type            | Example Response Body                   |
| ----------- | --------------------- | --------------------------------------- |
| 400         | Invalid Request       | "Invalid listingId", "Missing userId header" |
| 401         | Unauthorized          | "Unauthorized"                          |
| 500         | Internal Server Error | "error message"                         |







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

---

# Cypress Test Documentation

This document outlines the Cypress tests for the authentication page of the web application. Each test is designed to validate specific user interactions and expected behaviors in the authentication process.

---

## **Authentication Page Tests**

### **1. `Login Form Visibility`**

- **Test Case**: **Displays the Login Form by Default**
  
  - **Description**: This test ensures that the login form is displayed by default when visiting the login page.
  - **Input**: Visiting the `/login` page.
  - **Expected Output**: The login tab should be active, and the form should contain two input fields (email and password).
  - **Steps**:
    - Visit the login page at `http://localhost:5173/login`.
    - Verify that the login tab is active and contains the text "Login".
    - Check that there are exactly two input fields.

---

### **2. `Tab Switching`**

- **Test Case**: **Can Switch Between Login and Sign Up Tabs**

  - **Description**: This test ensures that the user can switch between the login and sign-up tabs.
  - **Input**: Clicking the "Sign Up" tab.
  - **Expected Output**: The sign-up tab becomes active, and the form contains four input fields (name, email, password, confirm password).
  - **Steps**:
    - Visit the login page at `http://localhost:5173/login`.
    - Click on the "Sign Up" tab.
    - Verify that the active tab contains "Sign Up".
    - Check that there are exactly four input fields.

---

### **3. `Login Validation`**

- **Test Case**: **Shows Error for Invalid Email Format on Login**

  - **Description**: This test checks that the login form shows an error if the entered email is not a UF email address.
  - **Input**: Entering an invalid email format and a valid password.
  - **Expected Output**: The form should display an error message saying "Only UF email is allowed".
  - **Steps**:
    - Enter an invalid email (e.g., `test@example.com`) in the email field.
    - Enter a valid password (e.g., `dummyPassword`).
    - Click the submit button.
    - Verify that the error message "Only UF email is allowed" is displayed.

---

### **4. `Sign-Up Validation`**

- **Test Case**: **Shows Error When Passwords Do Not Match on Sign Up**

  - **Description**: This test checks that an error is displayed if the passwords entered during sign-up do not match.
  - **Input**: Entering a mismatched password and confirm password on the sign-up form.
  - **Expected Output**: The form should display an error message saying "Passwords do not match".
  - **Steps**:
    - Click on the "Sign Up" tab.
    - Enter a name, email (e.g., `test@ufl.edu`), password (e.g., `password123`), and a different confirm password (e.g., `differentPassword`).
    - Click the submit button.
    - Verify that the error message "Passwords do not match" is displayed.

---

### **5. `Login Success`**

- **Test Case**: **Redirects to Dashboard on Successful Login**

  - **Description**: This test checks that the user is redirected to the `/dashboard` URL after a successful login.
  - **Input**: Entering a valid UF email and password.
  - **Expected Output**: The user should be redirected to `/dashboard`.
  - **Steps**:
    - Enter a valid email (e.g., `dineshramdanaraj@ufl.edu`) in the email field.
    - Enter a valid password (e.g., `password123`) in the password field.
    - Click the submit button.
    - Verify that the URL includes `/dashboard`.

---

### **6. `Sign-Up Success`**

- **Test Case**: **Redirects to Verify OTP Page on Successful Sign-Up**

  - **Description**: This test ensures that after a successful sign-up, the user is redirected to the `/verify-otp` page.
  - **Input**: Entering valid name, email (e.g., randomly generated `username@ufl.edu`), and matching passwords.
  - **Expected Output**: The user should be redirected to `/verify-otp`.
  - **Steps**:
    - Click on the "Sign Up" tab.
    - Enter a valid name (e.g., `Test User`).
    - Enter a valid email (e.g., `username@ufl.edu`).
    - Enter the same password (e.g., `password123`) for both the password and confirm password fields.
    - Click the submit button.
    - Verify that the URL includes `/verify-otp`.

---

# **Authentication Component Unit Tests**

This document lists the unit tests for the `Authentication` component. Each test case verifies different functionality such as rendering, input validation, and integration with the authentication service.

---

## **Test Cases**

### **1. Render Login Tab by Default**

- **Test Case**: Renders the Login tab when the path is `/login`.
- **Description**: Verifies that the Login tab is active and that the form contains the necessary fields for email and password.
- **Expected Output**:
  - The Login tab should have the class `active`.
  - The `Email` and `Password` fields should be displayed.
  - The `Name` field should not be visible.
  - The `Login` button should be disabled initially.
- **Mock**: N/A

---

### **2. Render Sign Up Tab When Path is `/signup`**

- **Test Case**: Renders the Sign Up tab when the path is `/signup`.
- **Description**: Verifies that the Sign Up tab is active and the form contains fields for Name, Email, Password, and Confirm Password.
- **Expected Output**:
  - The Sign Up tab should have the class `active`.
  - The `Name`, `Email`, `Password`, and `Confirm Password` fields should be visible.
- **Mock**: N/A

---

### **3. Display Error for Non-UF Email**

- **Test Case**: Displays an error if the email is not a UF email (missing "ufl.edu") during login.
- **Description**: Verifies that an error message is shown if a non-UF email is provided.
- **Input**: Email `test@gmail.com` and password `SomePass123`.
- **Expected Output**:
  - Error message: `Only UF email is allowed`.
  - The login button should be enabled.
  - No navigation should happen.
- **Mock**: `authService.login` mocked to reject with an error `"Only UF email is allowed"`.

---

### **4. Display Error for Mismatched Passwords During Sign Up**

- **Test Case**: Displays an error if the passwords do not match during sign up.
- **Description**: Verifies that an error message is shown when the password and confirm password fields do not match.
- **Input**: Name `John Doe`, Email `john@ufl.edu`, Password `password1`, Confirm Password `password2`.
- **Expected Output**:
  - Error message: `Passwords do not match`.
  - No navigation should happen.
- **Mock**: N/A

---

### **5. Successful Login with authService**

- **Test Case**: Calls `authService.login` and navigates to `/dashboard` on successful login.
- **Description**: Verifies that `authService.login` is called with correct credentials and that the user is redirected to `/dashboard`.
- **Input**: Email `example@ufl.edu` and password `TestPassword`.
- **Expected Output**:
  - `authService.login` should be called with the correct arguments.
  - The email should be stored in `sessionStorage`.
  - Navigation should happen to `/dashboard`.
- **Mock**: `authService.login` mocked to resolve successfully.

---

### **6. Successful Signup with authService**

- **Test Case**: Calls `authService.signup` and navigates to `/verify-otp` on successful signup.
- **Description**: Verifies that `authService.signup` is called with the correct details and that the user is redirected to `/verify-otp`.
- **Input**: Name `Jane Doe`, Email `jane@ufl.edu`, Password `abc1234`, Confirm Password `abc1234`.
- **Expected Output**:
  - `authService.signup` should be called with the correct arguments.
  - The email should be stored in `sessionStorage`.
  - Navigation should happen to `/verify-otp`.
- **Mock**: `authService.signup` mocked to resolve successfully.

---

### **7. Show "Email Not Verified" Message on Login**

- **Test Case**: Shows an "Email not verified" message and redirects to `/verify-otp` if thrown by `authService` during login.
- **Description**: Verifies that when `authService.login` rejects with an "Email not verified" error, the user is redirected to `/verify-otp`.
- **Input**: Email `example@ufl.edu` and password `TestPassword`.
- **Expected Output**:
  - Error message: `Email not verified. Verify Email to login`.
  - Navigation should happen to `/verify-otp`.
- **Mock**: `authService.login` mocked to reject with an error `"Email not verified. Verify Email to login"`.

---

## **Dependencies**

- `@testing-library/react`: For rendering components and interacting with the DOM.
- `react-router-dom`: For routing and navigating between different routes.
- `jest`: For mocking services and functions like `authService` and `useNavigate`.

---

## **Mocked Services**

- **`authService`**: Mocked to simulate the `login` and `signup` functions.
- **`useNavigate`**: Mocked to simulate navigation when a successful login or signup occurs.

---

# OTPVerification Component Test Documentation

This file contains unit tests for the `OTPVerification` component. The component is responsible for verifying the OTP (One-Time Password) entered by the user. These tests simulate user interactions, validate the OTP functionality, and check the correct behavior of the component.

## Dependencies

- `@testing-library/react`: Provides utilities for testing React components.
- `jest`: Used for mocking functions, running tests, and handling assertions.
- `react-router-dom`: Used for routing-related functionality, like navigation and path management.
- `authService`: A mocked module that simulates API calls for sending and verifying OTPs.

## Mocked Functions

- **`jest.mock("../AuthService")`**: Mock the `authService` module's functions:
  - `sendEmailVerificationCode`: Mocked to simulate the action of sending an OTP code to the user’s email.
  - `verifyEmailVerificationCode`: Mocked to simulate the action of verifying the OTP entered by the user.

- **`jest.mock("react-router-dom")`**: Mock `useNavigate` to simulate navigation between routes.

## Test Setup

- **`beforeEach`**: Clears all mocks and sets an email (`test@ufl.edu`) in sessionStorage to simulate the stored email used in the component.
  
- **`afterEach`**: Clears sessionStorage after each test to ensure tests do not affect one another.

## Test Scenarios

### 1. **Rendering OTPVerification and Sending OTP on Mount**
   - **Purpose**: Ensures that when the `OTPVerification` component is mounted, the email address is displayed and the `sendEmailVerificationCode` function is called.
   - **Test Steps**: 
     - Render the component.
     - Verify that the email is displayed.
     - Confirm that `sendEmailVerificationCode` is called.

### 2. **Shows Resend Timer and Hides Resend Button Initially**
   - **Purpose**: Verifies that a timer appears showing the countdown (`Resend OTP in 60s`), and the resend button remains hidden until the timer finishes.
   - **Test Steps**:
     - Render the component.
     - Check if the timer text is visible.
     - Ensure the resend button does not appear initially.

### 3. **Enabling and Submitting OTP after Entering 6 Digits**
   - **Purpose**: Confirms that the "Verify OTP" button is enabled once all 6 digits are entered, and when clicked, the OTP is sent for verification.
   - **Test Steps**:
     - Render the component.
     - Enter digits into the OTP input fields.
     - Verify that the "Verify OTP" button is enabled.
     - Simulate submitting the OTP and check that `verifyEmailVerificationCode` is called with the entered code.

### 4. **Error on Invalid OTP (Not 6 Digits)**
   - **Purpose**: Verifies that an error is displayed if the user tries to submit the OTP without entering 6 digits.
   - **Test Steps**:
     - Render the component.
     - Attempt to submit without entering 6 digits.
     - Check that no API call is made.

### 5. **Displaying Error from verifyEmailVerificationCode**
   - **Purpose**: Tests that an error message is shown when the OTP verification fails.
   - **Test Steps**:
     - Render the component and enter 6 digits.
     - Simulate an API error (`Invalid code`).
     - Ensure that the error message appears on the screen and no navigation occurs.

### 6. **Resend OTP After Timer Expiration**
   - **Purpose**: Confirms that the "Resend OTP" button appears after the 60-second countdown ends, and that clicking it triggers the `sendEmailVerificationCode` function.
   - **Test Steps**:
     - Render the component and simulate the passage of 60 seconds using Jest's fake timers.
     - Ensure the "Resend OTP" button appears after the countdown ends.
     - Simulate a click on the button and verify the API call to resend the OTP.

### 7. **Navigating Back to Login**
   - **Purpose**: Verifies that the "Return to Login" button navigates the user back to the login page.
   - **Test Steps**:
     - Render the component.
     - Simulate a click on the "Return to Login" button.
     - Ensure that `mockNavigate` is called with `/login`.

## Test Utilities

- **`render`**: Renders the component into the DOM for testing.
- **`screen`**: Provides access to the rendered component and allows querying elements.
- **`fireEvent`**: Simulates user interactions like typing and clicking.
- **`waitFor`**: Waits for asynchronous operations to complete.
- **`act`**: Used to simulate actions that cause state changes.

## Mocked API Responses

- **`sendEmailVerificationCode`**: Mocked to resolve successfully when the OTP is initially sent or resent.
- **`verifyEmailVerificationCode`**: Mocked to resolve or reject based on the success or failure of OTP verification.

## Error Handling

- If the OTP is not 6 digits or verification fails, appropriate error messages are displayed, and navigation does not occur until the OTP is successfully verified.

---

# Header Component Test Documentation

This file contains unit tests for the `Header` component. The `Header` component is responsible for rendering the navigation bar, displaying user information, and providing navigation functionalities such as selling items and logging out.

## Dependencies

- `@testing-library/react`: Provides utilities for testing React components.
- `jest`: Used for mocking functions, running tests, and handling assertions.
- `react-router-dom`: Used for routing-related functionality, like navigation and path management.

## Mocked Functions

- **`jest.mock("react-router-dom")`**: Mock the `useNavigate` function to simulate navigation between routes. The mock implementation uses `mockNavigate` to track calls to the navigation function.

## Test Setup

- **`beforeEach`**: Clears all mocks and sessionStorage to ensure that the state is reset before each test.
  
- **`afterEach`**: Ensures that no sessionStorage data persists across tests.

## Test Scenarios

### 1. **Rendering UF Marketplace Logo and Sell Button**
   - **Purpose**: Verifies that the logo and "Sell items" button are rendered correctly.
   - **Test Steps**:
     - Render the component inside `MemoryRouter`.
     - Check that the text "UF" and "Marketplace" appear in the logo.
     - Confirm that the "Sell items" button exists in the document.

### 2. **Displays Default Email if sessionStorage is Empty**
   - **Purpose**: Verifies that the default email (`mani@gmail.com`) is displayed in the user menu if sessionStorage is empty.
   - **Test Steps**:
     - Render the component.
     - Simulate a click on the "User menu" button to toggle the user menu.
     - Verify that the default email is shown in the user menu.

### 3. **Displays Name and Email from sessionStorage**
   - **Purpose**: Ensures that the name and email from sessionStorage are correctly displayed in the user menu.
   - **Test Steps**:
     - Set `email` and `name` in sessionStorage.
     - Render the component.
     - Simulate a click on the "User menu" button to toggle the user menu.
     - Check that the correct name and email from sessionStorage are displayed.

### 4. **Clicking Sell Button Calls navigate("/listing")**
   - **Purpose**: Verifies that clicking the "Sell items" button triggers navigation to the `/listing` page.
   - **Test Steps**:
     - Render the component.
     - Simulate a click on the "Sell items" button.
     - Verify that `mockNavigate` is called with the `/listing` route.

### 5. **Clicking the "Marketplace" Text Calls navigate("/dashboard")**
   - **Purpose**: Verifies that clicking the "Marketplace" text in the logo triggers navigation to the `/dashboard` page.
   - **Test Steps**:
     - Render the component.
     - Simulate a click on the "Marketplace" text.
     - Verify that `mockNavigate` is called with the `/dashboard` route.

### 6. **Clicking User Icon Toggles User Menu Open and Closed**
   - **Purpose**: Confirms that clicking the user icon opens and closes the user menu.
   - **Test Steps**:
     - Render the component.
     - Simulate a click on the "User menu" button to open the menu.
     - Verify that the default email is displayed.
     - Simulate another click to close the menu and check that the email is no longer visible.

### 7. **Clicking Logout Clears sessionStorage and Navigates to /login**
   - **Purpose**: Verifies that clicking the "Logout" button clears sessionStorage and navigates to the `/login` page.
   - **Test Steps**:
     - Set `email` and `name` in sessionStorage.
     - Render the component and open the user menu.
     - Simulate a click on the "Logout" button.
     - Verify that sessionStorage is cleared and `mockNavigate` is called with the `/login` route.

## Test Utilities

- **`render`**: Renders the component into the DOM for testing.
- **`screen`**: Provides access to the rendered component and allows querying elements.
- **`fireEvent`**: Simulates user interactions like clicking and toggling.
- **`MemoryRouter`**: A router that keeps the history in memory, used for testing routing components.

## Mocked API Responses

- **`useNavigate`**: Mocked to track navigation calls, simulating the behavior of `react-router-dom`'s `useNavigate` hook.

## Error Handling

- No explicit error handling is tested in this file as it mainly focuses on component rendering and user interaction behavior.

---
# Sell Component Test Documentation

This file contains unit tests for the `SellComponent`. The component is responsible for handling product listings, user interactions, API requests, and UI updates. These tests validate its core functionalities and expected behaviors.

## Dependencies

- `@testing-library/react`: Provides utilities for testing React components.
- `jest`: Used for mocking functions, running tests, and handling assertions.
- `react-router-dom`: Used for routing-related functionality, like navigation and path management.
- `apiService`: A mocked module that simulates API calls for fetching and submitting product data.

## Mocked Functions

- **`jest.mock("../apiService")`**: Mocks the `apiService` module functions:
  - `fetchProducts`: Mocked to simulate fetching product listings from an API.
  - `submitListing`: Mocked to simulate submitting a new product listing to an API.

- **`jest.mock("react-router-dom")`**: Mocks `useNavigate` to simulate navigation between routes.

## Test Setup

- **`beforeEach`**: Clears all mocks and sets a default state before each test to maintain consistency.
- **`afterEach`**: Cleans up sessionStorage and unmounts components after each test.

## Test Scenarios

### 1. **Rendering SellComponent and Fetching Product Listings on Mount**
   - **Purpose**: Ensures that when the `SellComponent` is mounted, product data is fetched from the API and displayed.
   - **Test Steps**:
     - Render the component.
     - Verify that the API call to `fetchProducts` is made.
     - Ensure that the products are displayed correctly.

### 2. **Displays Loading Indicator Before Products Load**
   - **Purpose**: Ensures that a loading state is shown while waiting for the API response.
   - **Test Steps**:
     - Render the component.
     - Check for the presence of a loading message/spinner.
     - Confirm that the loading indicator disappears once data is loaded.

### 3. **Handles API Errors Gracefully**
   - **Purpose**: Ensures that an error message is displayed if the API request fails.
   - **Test Steps**:
     - Mock `fetchProducts` to reject with an error.
     - Render the component.
     - Verify that an error message is shown to the user.

### 4. **Submitting a New Product Listing and Handling Responses**
   - **Purpose**: Confirms that the form submission triggers the `submitListing` function and handles success/failure correctly.
   - **Test Steps**:
     - Render the component.
     - Fill out the form fields with product details.
     - Click the submit button.
     - Verify that `submitListing` is called with correct values.
     - Check for success message if submission is successful.
     - Check for error message if submission fails.

### 5. **Navigating to Another Page on Button Click**
   - **Purpose**: Ensures that clicking the navigation button redirects the user to another page.
   - **Test Steps**:
     - Render the component.
     - Simulate a button click.
     - Verify that `mockNavigate` is called with the expected route.

## Test Utilities

- **`render`**: Renders the component into the DOM for testing.
- **`screen`**: Provides access to the rendered component and allows querying elements.
- **`fireEvent`**: Simulates user interactions like typing and clicking.
- **`waitFor`**: Waits for asynchronous operations to complete.
- **`act`**: Simulates actions that cause state changes.

## Mocked API Responses

- **`fetchProducts`**: Mocked to return a successful response containing sample product data.
- **`submitListing`**: Mocked to resolve on success or reject with an error message on failure.

## Error Handling

- Ensures that API errors do not crash the component.
- Displays appropriate feedback messages for failed actions.
- Prevents submission if required fields are empty.
