# RAW-WEBSITE

Raw School is a crypto-humanities reading project initiated by the Uncommons community, dedicated to providing a decentralized knowledge exploration platform for learners and researchers. The website features two core functions:

1. **BookClub** – Logs reading club events and book lists while offering a review aggregation dashboard, allowing users to publish and browse reading notes.
2. **Ambient Project** – A decentralized academic glossary that empowers community members to define and expand terminology, collaboratively building an open knowledge system.

The website integrates Web3 functionalities, enabling users to connect their crypto wallets and contribute book reviews and wiki entries based on their wallet address identity. All data is stored on Arweave, ensuring decentralization and long-term persistence.

## Features

- **Web3 Wallet Authentication**: Connect with crypto wallets for secure authentication
- **Book Club System**: Browse, review, and interact with book club content
- **Wiki Component**: View and manage wiki entries with detailed content
- **Ambient Card System**: Create and share ambient cards
- **Profile Management**: Manage user profiles with wallet integration
- **Real-time Clock**: Interactive clock component

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Shadcn UI
- **Web3**: RainbowKit, Wagmi, Viem, Ethers.js, Arweave
- **Backend**: Supabase (PostgreSQL)
- **Animation**: P5.js, Matter.js

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm or yarn
- Supabase account

### Database Setup

1. Create a Supabase project
2. Set up the database tables by running the SQL script in `supabase_setup.sql`

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Project Structure

- `/app`: Next.js app directory with page components
- `/components`: Reusable UI components
  - `/auth`: Authentication components with Web3 integration
  - `/bookclub`: Book club related components
  - `/header`: Navigation and header components
  - `/join`: User onboarding components
  - `/profile`: User profile components
  - `/ui`: Shadcn UI components
  - `/wiki`: Wiki system components
- `/lib`: Utility functions and shared logic
- `/supabase`: Supabase configuration and client
- `/types`: TypeScript type definitions

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- `users`: Stores user information including wallet addresses
- `sessions`: Manages authentication sessions
- `bookclub_reviews`: Stores book reviews submitted by users
- `ambient_cards`: Stores ambient card content created by users

## Authentication Flow

1. User connects their Web3 wallet
2. Backend generates a nonce for the user to sign
3. User signs the nonce with their wallet
4. Backend verifies the signature and creates a session
5. User receives an authentication token

## License

This project is licensed under the MIT License.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
