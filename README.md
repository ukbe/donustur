# Recycling Rewards Platform

A Next.js application that encourages recycling through a rewards system. Users can earn credits by scanning QR codes at smart trashcans and redeem them through various options including NGO donations.

## Tech Stack

- Next.js 14 (App Router)
- AWS Amplify
- TypeScript
- Tailwind CSS
- AWS Services (Cognito, DynamoDB, Lambda)

## Prerequisites

- Node.js 18.x or later
- AWS Account
- AWS Amplify CLI
- npm or yarn

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
cd recycling-rewards
```

2. Install dependencies
```bash
npm install
```

3. Configure Amplify
```bash
amplify init
amplify push
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/          # Next.js app router pages
├── components/   # React components
├── lib/         # Utility functions and API
└── types/       # TypeScript definitions
```

## Documentation

For detailed documentation about the project architecture and development phases, see [PROJECT_PLAN.md](PROJECT_PLAN.md)

## License

[License Type]