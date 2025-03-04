/// <reference types="cypress" />

import { random } from "cypress/types/lodash";


describe('Authentication Page', () => {
  
    beforeEach(() => {

      cy.visit('http://localhost:5173/login');
    });
  
    it('displays the login form by default', () => {
      cy.get('.tab.active').should('contain', 'Login');
  
      cy.get('input').should('have.length', 2); 
    });
  
    it('can switch between Login and Sign Up tabs', () => {
  
      cy.contains('Sign Up').click();
  
      cy.get('.tab.active').should('contain', 'Sign Up');
  
      cy.get('input').should('have.length', 4);
    });
  
    it('shows an error if email is not a UF email on login', () => {
      cy.get('input[value=""]').first().type('test@example.com'); // Email
      cy.get('input[type="password"]').first().type('dummyPassword'); // Password
  
      cy.get('.submit-btn').click();
  
      cy.get('.error-message').should('contain', 'Only UF email is allowed');
    });
  
    it('shows an error if password and confirm password do not match on sign up', () => {

      cy.contains('Sign Up').click();
  
      cy.get('input').eq(0).type('Test User');                        // Name
      cy.get('input').eq(1).type('test@ufl.edu');                     // Email
      cy.get('input').eq(2).type('password123');                      // Password
      cy.get('input').eq(3).type('differentPassword');                // Confirm Password
  

      cy.get('.submit-btn').click();
  
      cy.get('.error-message').should('contain', 'Passwords do not match');
    });
  
    it('redirects to /dashboard on successful login', () => {

      cy.get('input').eq(0).type('dineshramdanaraj@ufl.edu');   // Email
      cy.get('input').eq(1).type('password123');    // Password
  

      cy.get('.submit-btn').click();
  
      cy.url().should('include', '/dashboard');
    });
  
    it('redirects to /verify-otp on successful signup', () => {

      cy.contains('Sign Up').click();
      const username = Math.random() + "@ufl.edu";

      cy.get('input').eq(0).type('Test User');        
      cy.get('input').eq(1).type(username);     
      cy.get('input').eq(2).type('password123');      
      cy.get('input').eq(3).type('password123');      
  

      cy.get('.submit-btn').click();
  
      cy.url().should('include', '/verify-otp');
    });
  
  
  });
  