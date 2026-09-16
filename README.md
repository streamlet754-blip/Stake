# Blitle licensing system

Blitle is a Next.js App Router site and server API for selling a premium Garmin license through direct cryptocurrency payment. The existing Garmin project remains in `../ArcadeIQ`.

## Architecture

- `app/`: public pages and route handlers.
- `lib/blockchain/evm.ts`: configured EVM/ERC-20 transaction verification.
- `lib/licensing/`: CSPRNG license generation and salted SHA-256 hashes.
- `prisma/schema.prisma`: PostgreSQL payment/license state and uniqueness constraints.
- Rate-limit buckets are stored in PostgreSQL so limits work across Vercel instances.
- The existing Garmin integration is in `../ArcadeIQ`; it adds a license picker and HTTPS activation without embedding secrets.

## Local setup

1. Copy `.env.example` to `.env.local` and fill every value. The app fails closed if payment configuration is incomplete.
2. Run `npm install`.
3. Run `npm run db:push` against a PostgreSQL database.
4. Run `npm run dev`.
5. Open `/pay`.

Required values include the actual network, token, contract, recipient, amount, RPC URL, database URL, and long random secrets. Never commit `.env.local` or private wallet material.

## Blockchain behavior

The current adapter targets EVM/ERC-20 transfers and checks transaction existence, receipt success, confirmation depth, token contract, transfer recipient, and amount. It does not invent a chain, endpoint, contract, wallet, or token. A different chain requires a new adapter implementing the normalized verification contract.

Production payment configuration is Ethereum mainnet USDT at 2.34 USDT (2,340,000 base units). The canonical USDT contract is `0xdAC17F958D2ee523a2206206994597C13D831ec7`; it is verified against the [Etherscan Ethereum-mainnet token page](https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7), which identifies Tether USD and 6 decimals.

## Vercel

Import the repository, set the same server-only environment variables in Vercel, connect `blitle.com` under Project Settings > Domains, and configure PostgreSQL migrations/deployment. Do not use `NEXT_PUBLIC_` for secrets.

## Tests and commands

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run db:generate`
- `npm run db:push`

## Remaining manual work

- Create/configure PostgreSQL and blockchain RPC credentials.
- Choose the chain/token/amount and provide the public recipient address.
- Configure Vercel and `blitle.com` DNS.
- Confirm the Garmin target device and complete a simulator/device activation test against the deployed API.
- Replace the old placeholder Garmin application ID only with the ID assigned by the Connect IQ Developer Dashboard. Do not use a generated ID.
- Complete Garmin Store metadata/review separately.
