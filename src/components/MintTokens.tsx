"use client";

import { useState } from "react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from "@heroicons/react/24/outline";
import React from "react";

interface MintTokensProps {
  mintAddr: web3.PublicKey | null;
  accAddr: web3.PublicKey | null;
}

export default function MintTokens({ mintAddr, accAddr }: MintTokensProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [tokensToMint, setTokensToMint] = useState<number>(0);
  const [mintTokenTxSig, setMintTokenTxSig] = useState<string>("");

  const handleMintTokens = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }
    if (!mintAddr || !accAddr) {
      toast.error("Mint and token account must be created first.");
      return;
    }
    try {
      const transaction = new web3.Transaction();
      // Create mintTo instruction to mint tokens directly into the token account
      const mintToIx = token.createMintToInstruction(mintAddr, accAddr, publicKey, tokensToMint);
      transaction.add(mintToIx);
      const signature = await sendTransaction(transaction, connection);
      setMintTokenTxSig(signature);
      toast.success("Tokens minted successfully!");
    } catch (err) {
      toast.error("Error minting tokens");
      console.error(err);
    }
  };

  return (
    <div className="bg-[#2a302f] p-6 rounded-lg shadow-lg">
      <form onSubmit={handleMintTokens}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-2xl text-[#fa6ece]">Mint Tokens 🎉</h2>
          <button
            type="submit"
            disabled={!tokensToMint || tokensToMint <= 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] 
             bg-gradient-to-r from-[#00ffff] to-[#ff00ff] border-2 border-white 
             rounded-lg w-24 py-1 font-semibold transition-all duration-200 
             text-white shadow-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,255,1)]"
          >
            Submit
          </button>
        </div>
        <div className="mb-4">
          <label className="italic text-sm">Amount to Mint</label>
          <input
            type="number"
            min={0}
            placeholder="Number of tokens"
            className="mt-1 text-[#9e80ff] py-1 w-full bg-transparent outline-none border-b border-white"
            value={tokensToMint}
            onChange={(e) => setTokensToMint(Number(e.target.value))}
          />
        </div>
        {mintTokenTxSig && (
          <div className="text-sm font-semibold bg-[#222524] border border-gray-500 rounded-lg p-2">
            <a
              href={`https://explorer.solana.com/tx/${mintTokenTxSig}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#80ebff] italic hover:text-white transition-all duration-200"
            >
              {mintTokenTxSig.toString().slice(0, 25)}...
              <ExternalLinkIcon className="w-5 ml-1" />
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
