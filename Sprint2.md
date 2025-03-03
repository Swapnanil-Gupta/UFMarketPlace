# Sprint 2

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
23. **US-023**: As a user, I want animated form interactions to enjoy the submission process

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
2. Implement favoriting/bookmarking system
3. Create user profile management interface
4. Add loading skeletons for images
5. Develop drag-and-drop image upload

---
