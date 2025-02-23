# Recycling Rewards Platform - Project Plan

## Project Overview
A recycling project that tracks user contributions through QR code scans at smart trashcans. Users earn credits for recycling activities and can spend these credits in a marketplace, including options for NGO donations.

## Technical Stack
- **Framework**: Next.js App Router
- **Cloud Services**: AWS Amplify, Cognito, DynamoDB, Lambda
- **Frontend**: TypeScript, Tailwind CSS, Tailwind UI
- **Development Tools**: ESLint
- **Authentication**: AWS Cognito

## Core Features
- QR code scanning system
- Credit accumulation system
- User dashboard
- Marketplace for credit redemption
- Admin panel for marketplace management
- Authentication system

## Development Phases

### Phase 1: Project Setup and Authentication
1. **Initial Setup**
   - Next.js project with TypeScript
   - AWS Amplify configuration
   - Tailwind CSS and UI components
   - ESLint setup
   - Project structure implementation

2. **Authentication System**
   - Cognito User Pool configuration
   - Sign-up flow
   - Sign-in flow
   - Protected routes
   - Token persistence

### Phase 2: Database and API Design
1. **DynamoDB Schema**
   ```
   Users Table:
   - userId (PK)
   - email
   - totalCredits
   - createdAt
   - updatedAt

   Scans Table:
   - scanId (PK)
   - userId
   - timestamp
   - credits
   - binLocation
   - tokenId

   MarketplaceItems Table:
   - itemId (PK)
   - title
   - description
   - creditCost
   - type (NGO/Product)
   - status
   - createdAt

   Transactions Table:
   - transactionId (PK)
   - userId
   - itemId
   - credits
   - timestamp
   ```

2. **Amplify API (GraphQL & REST)**
   ```
   GraphQL APIs:
   
   Types:
   - User
   - Scan
   - MarketplaceItem
   - Transaction

   Queries:
   - getUser
   - listScans
   - listMarketplaceItems
   - getTransactionHistory
   
   Mutations:
   - createScan
   - verifyToken
   - purchaseItem
   - createMarketplaceItem (admin)
   - updateMarketplaceItem (admin)

   Amplify Functions (Lambda):
   - handleQRScan
     - Validates QR token
     - Creates scan record
     - Updates user credits
   
   - handlePurchase
     - Validates credit balance
     - Creates transaction
     - Updates user credits
   
   - adminMarketplace
     - Handles marketplace item management
     - Protected by admin authorization
   
   - notificationHandler
     - Manages email notifications
     - Handles system notifications
   ```

3. **Authentication Flow**
   ```
   Amplify Auth:
   - Cognito User Pool
   - Identity Pool for fine-grained access
   - OAuth flow for social providers (optional)
   - Admin group for privileged access
   ```

### Phase 3: Core Features Implementation
1. **QR Code Handling**
   - Token verification system
   - Scan validation Lambda function
   - Token persistence during auth flow

2. **Dashboard Development**
   - Dashboard layout
   - Credits display
   - Recent scans section
   - Statistics and charts

3. **Marketplace Implementation**
   - Marketplace UI
   - Item listing
   - Purchase flow
   - Transaction history

### Phase 4: Admin Features
1. **Admin Panel**
   - Admin dashboard
   - Marketplace item management
   - Analytics and reporting
   - User management interface

### Phase 5: Integration and Enhancement
1. **Integration Features**
   - QR scanning with user accounts
   - Credit calculation system
   - Notification system
   - Email notifications

2. **Security Enhancements**
   - Rate limiting
   - Token validation
   - Audit logging
   - Error handling

### Phase 6: Testing and Deployment
1. **Testing Strategy**
   - Unit tests
   - Integration tests
   - E2E testing
   - Security testing

2. **Deployment**
   - AWS Amplify deployment
   - CI/CD pipeline
   - Environment configuration
   - Performance optimization

## Project Structure 