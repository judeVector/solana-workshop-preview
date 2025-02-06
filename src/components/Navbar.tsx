"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";

// Dynamically import WalletMultiButton with ssr disabled
const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

const shortenAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

const Navbar = () => {
  const wallet = useWallet();

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Superteam Workshop
            </span>
          </div>
          <div className="wallet-button">
            <WalletMultiButton>
              {wallet.connected && wallet.publicKey
                ? shortenAddress(wallet.publicKey.toString())
                : "Connect Wallet"}
            </WalletMultiButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
