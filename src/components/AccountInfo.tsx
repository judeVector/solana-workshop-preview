"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import * as web3 from "@solana/web3.js";

export default function AccountInfo() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const getBalance = async () => {
      if (connection && publicKey) {
        const info = await connection.getAccountInfo(publicKey);
        if (info) {
          setBalance(info.lamports / web3.LAMPORTS_PER_SOL);
        }
      }
    };

    getBalance();
  }, [connection, publicKey]);

  return (
    <div className="bg-[#2a302f] p-6 rounded-lg shadow-lg">
      <h2 className="font-bold text-2xl text-[#fa6ece]">Account Info ✨</h2>
      <ul className="space-y-4">
        <li className="flex justify-between">
          <span className="tracking-wider">Wallet Connected:</span>
          <span className="text-helius-orange italic font-semibold">
            {connected && publicKey ? "Yes" : "No"}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="tracking-wider">Wallet Address:</span>
          <span className="text-helius-orange italic font-semibold">
            {publicKey ? publicKey.toBase58() : "--"}
          </span>
        </li>
        <li className="flex justify-between text-sm">
          <span className="tracking-wider">Balance:</span>
          <span className="text-helius-orange italic font-semibold">
            {publicKey ? `${balance} SOL` : "--"}
          </span>
        </li>
      </ul>
    </div>
  );
}
