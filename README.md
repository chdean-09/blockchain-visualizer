# Blockchain Visualizer

A stunning, interactive web application that visualizes how blockchain technology works.

## Features

### Core Features
- **Visual Blockchain Display** - See each block with all 6 required fields:
  - Block number
  - Timestamp
  - Data (transaction info)
  - Previous hash (truncated)
  - Nonce
  - Hash (truncated)

- **Mining Functionality** - Mine new blocks with visual feedback:
  - Real-time mining process with spinner
  - Mining time display
  - Configurable difficulty (1-4)
  - Auto-mine feature for multiple blocks

- **Validation Indicator** - Large, clear chain status:
  - Green "VALID" indicator when chain is intact
  - Red "INVALID" indicator when chain is broken
  - Auto-updates on any change

- **Difficulty Selector** - Choose mining difficulty 1-4
  - Higher difficulty = more leading zeros required
  - Visual difficulty level indicator

### Bonus Features
- **Tampering Demo** - Edit block data without re-mining
  - Click "EDIT" on any block
  - Modify the data
  - Watch the chain become invalid
  - Red borders on tampered blocks

- **Auto-Mine** - Mine multiple blocks automatically
  - Shows progress for each block
  - Displays mining time

- **Mining Statistics**
  - Total blocks mined counter
  - Average mining time
  - Individual block mining times

- **Visual Chain Links** - Animated arrows showing hash connections
  - Color-coded hash matching
  - Clear visual flow from block to block

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chdean-09/blockchain-visualizer.git
cd blockchain-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Deployment

### GitHub Pages
```bash
npm run build
# Deploy the dist folder to GitHub Pages
```

## Technology Stack

- **Framework**: Svelte
- **Build Tool**: Vite
- **Cryptography**: crypto-js (SHA-256)
- **Styling**: Tailwind CSS
- **UI framework** - Skeleton.dev uniform design language

## 📝 Project Structure

```
blockchain-visualizer/
├── public/
│   └── blockchain-logo.svg
├── src/
│   ├── lib/
│   │   ├── blockchain.ts      # Core blockchain logic
│   │   └── BlockCard.svelte   # Individual block component
│   ├── App.svelte             # Main application
│   ├── app.css                # Global styles
│   └── main.ts                # Entry point
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## 📜 License

MIT License - Feel free to use this for educational purposes!
