"use client";

import { useState } from "react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from "@heroicons/react/24/outline";
import React from "react";

interface CreateMintProps {
  onMintCreated: (mintAddress: web3.PublicKey) => void;
}

export default function CreateMint({ onMintCreated }: CreateMintProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [mintTx, setMintTx] = useState<string>("");
  const [mintAddr, setMintAddr] = useState<web3.PublicKey | null>(null);

  const connectionErr = () => {
    if (!publicKey || !connection) {
      toast.error("Please connect your wallet");
      return true;
    }
    return false;
  };

  const createMint = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (connectionErr()) return;

    try {
      if (!publicKey) {
        console.error("Public key is null. Ensure wallet is connected.");
        return;
      }
      // Generate a new keypair for the token mint
      const tokenMint = web3.Keypair.generate();
      // Calculate minimum balance for rent exemption for a mint
      const lamports = await token.getMinimumBalanceForRentExemptMint(connection);
      // Create a transaction to create and initialize the mint
      const transaction = new web3.Transaction().add(
        web3.SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: tokenMint.publicKey,
          space: token.MINT_SIZE,
          lamports,
          programId: token.TOKEN_PROGRAM_ID,
        }),
        token.createInitializeMintInstruction(
          tokenMint.publicKey,
          0, // decimals set to 0 for whole tokens
          publicKey, // mint authority
          null, // freeze authority (optional)
          token.TOKEN_PROGRAM_ID
        )
      );
      const signature = await sendTransaction(transaction, connection, {
        signers: [tokenMint],
      });
      setMintTx(signature);
      setMintAddr(tokenMint.publicKey);
      toast.success("Mint created successfully!");

      // Pass the mint address back to the parent
      onMintCreated(tokenMint.publicKey);
    } catch (err) {
      toast.error("Error creating Token Mint");
      console.error("Mint error", err);
    }
  };

  const mintOutputs = [
    {
      title: "Token Mint Address:",
      dependency: mintAddr,
      href: mintAddr
        ? `https://explorer.solana.com/address/${mintAddr.toBase58()}?cluster=devnet`
        : "",
    },
    {
      title: "Mint Transaction Signature:",
      dependency: mintTx,
      href: mintTx ? `https://explorer.solana.com/tx/${mintTx}?cluster=devnet` : "",
    },
  ];

  return (
    <form onSubmit={createMint} className="bg-[#2a302f] p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-2xl text-[#fa6ece]">Create Mint 🦄</h2>
        <button
          type="submit"
          className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] 
             bg-gradient-to-r from-[#00ffff] to-[#ff00ff] border-2 border-white 
             rounded-lg w-24 py-1 font-semibold transition-all duration-200 
             text-white shadow-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,255,1)]"
        >
          Submit
        </button>
      </div>
      <div className="text-sm font-semibold bg-[#222524] border border-gray-500 rounded-lg p-2">
        <ul className="space-y-2">
          {mintOutputs.map(({ title, dependency, href }) => (
            <li key={title} className="flex justify-between items-center">
              <span className="tracking-wider">{title}</span>
              {dependency && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex text-[#80ebff] italic hover:text-white transition-all duration-200"
                >
                  {dependency.toString().slice(0, 25)}...
                  <ExternalLinkIcon className="w-5 ml-1" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
