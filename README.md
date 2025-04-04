# YieldNest Analytics

[![Tests](https://github.com/AndreMiras/yieldnest-analytics/actions/workflows/tests.yml/badge.svg)](https://github.com/AndreMiras/yieldnest-analytics/actions/workflows/tests.yml)

Extract & chart YieldNest analytics using The Graph Protocol.

<https://yieldnest-analytics.vercel.app/>

<img src="https://i.imgur.com/yf8eAI6.png" alt="Screenshot">

## Features

- Real-time exchange rate tracking
- Historical APY calculations
- Interactive time period selection

## Links

- [Dashboard](https://yieldnest-analytics.vercel.app/)
- [Subgraph](https://thegraph.com/explorer/subgraphs/tzAqe6bWVrFZeSmLJRc9bp5i1tHic2QbnMY3kNZihUv)
- [Subgraph Repository](https://github.com/AndreMiras/yieldnest-subgraphs)

## Install

```sh
npm ci
```

## Development

```sh
# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000)
