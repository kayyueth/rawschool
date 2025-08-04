# Book Club Staking Contracts

This directory contains the smart contracts for the Book Club staking system, including a mock ERC20 token for testing purposes.

## Contracts

### MockERC20.sol

A mock ERC20 token contract for testing purposes. Features:

- Standard ERC20 functionality
- Mintable and burnable tokens
- Configurable decimals (default: 6 for USDC-like tokens)
- OpenZeppelin ERC20 implementation

### Staking.sol (BookClubStaking)

The main staking contract for the book club system. Features:

- Users stake 100 USDC to join the book club
- Admin can set participation percentages (0-100%)
- Users can claim refunds based on their participation
- Admin functions for managing the contract
- Comprehensive view functions for stats and user info

## Key Features

### Staking Process

1. Users approve tokens for the staking contract
2. Users call `stake()` to join the book club (100 USDC deposit)
3. Admin sets participation percentages for users
4. Users can claim refunds based on their participation

### Participation System

- Participation is set by admin (0-100%)
- 100% participation = full refund
- 0% participation = no refund
- Partial participation = proportional refund

### Admin Functions

- `setParticipation()` - Set individual user participation
- `setMultipleParticipation()` - Set multiple users at once
- `withdrawRemaining()` - Withdraw unclaimed funds
- `transferOwnership()` - Transfer admin rights

## Deployment

### Prerequisites

- Node.js and npm installed
- Hardhat configured

### Install Dependencies

```bash
cd contracts
npm install
```

### Deploy Contracts

```bash
npx hardhat run scripts/deploy.ts --network <network-name>
```

### Local Development

```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

## Testing

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Test Files

```bash
npx hardhat test test/MockERC20.test.ts
npx hardhat test test/Staking.test.ts
```

### Test Coverage

```bash
npx hardhat coverage
```

## Contract Addresses

After deployment, you'll get:

- **MockERC20**: Mock USDC token address
- **BookClubStaking**: Main staking contract address

## Environment Variables

Set these in your `.env` file:

```
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=<staking-contract-address>
NEXT_PUBLIC_STAKING_TOKEN_ADDRESS=<token-contract-address>
```

## Usage Examples

### Joining the Book Club

```javascript
// 1. Approve tokens
await token.approve(staking.address, stakeAmount);

// 2. Stake tokens
await staking.stake();
```

### Setting Participation (Admin Only)

```javascript
// Set individual participation
await staking.setParticipation(userAddress, 75); // 75%

// Set multiple participations
await staking.setMultipleParticipation([user1, user2, user3], [80, 90, 60]);
```

### Claiming Refunds

```javascript
// User claims refund based on participation
await staking.refund();
```

### View Functions

```javascript
// Get user stake info
const stakeInfo = await staking.getStakeInfo(userAddress);

// Get contract statistics
const stats = await staking.getContractStats();

// Get all stakers
const stakers = await staking.getAllStakers();
```

## Security Features

- Only owner can set participation percentages
- Users cannot stake multiple times
- Users cannot claim refunds without participation set
- Users cannot claim refunds multiple times
- Comprehensive input validation
- Emergency functions for admin use

## Events

The contract emits the following events:

- `Staked(address indexed user, uint256 amount)`
- `ParticipationSet(address indexed user, uint8 percentage)`
- `Refunded(address indexed user, uint256 amount)`
- `OwnershipTransferred(address indexed previousOwner, address indexed newOwner)`

## Gas Optimization

- Efficient storage patterns
- Batch operations for multiple users
- Optimized view functions
- Minimal external calls

## License

MIT License - see LICENSE file for details.
