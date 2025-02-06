"use client";

import { useState } from "react";
import * as web3 from "@solana/web3.js";
import AccountInfo from "./AccountInfo";
import CreateMint from "./CreateMint";
import SendSOL from "./SendSOL";
import CreateTokenAccount from "./CreateTokenAccount";
import MintTokens from "./MintTokens";

export default function Dashboard() {
  // State to hold the mint and token account addresses as PublicKey objects
  const [mintAddr, setMintAddr] = useState<web3.PublicKey | null>(null);
  const [accAddr, setAccAddr] = useState<web3.PublicKey | null>(null);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      {/* Top Grid: Account Info & Send SOL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AccountInfo />
        <SendSOL />
      </div>

      {/* Bottom Grid: Minting (Create Mint & Create Token Account) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <CreateMint onMintCreated={setMintAddr} />
        <CreateTokenAccount mintAddr={mintAddr} onAccountCreated={setAccAddr} />
      </div>

      {/* Full-width Mint Tokens Panel */}
      <div className="mt-8"><MintTokens mintAddr={mintAddr} accAddr={accAddr} /></div>
    </main>
  );
}
