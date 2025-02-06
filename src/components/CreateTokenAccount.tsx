"use client";

import { useState } from "react";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from "@heroicons/react/24/outline";
import React from "react";

interface CreateTokenAccountProps {
  mintAddr: web3.PublicKey | null;
  onAccountCreated: (account: web3.PublicKey) => void;
}

export default function CreateTokenAccount({
  mintAddr,
  onAccountCreated,
}: CreateTokenAccountProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [accTx, setAccTx] = useState<string>("");
  const [accAddr, setAccAddr] = useState<web3.PublicKey | null>(null);

  const connectionErr = (): boolean => {
    if (!publicKey || !connection) {
      toast.error("Please connect your wallet");
      return true;
    }
    return false;
  };

  const createAccount = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (connectionErr()) return;
    if (!mintAddr) {
      toast.error("Please create a mint first.");
      return;
    }

    try {
      if (!publicKey) {
        console.error("Public key is null. Ensure wallet is connected.");
        return;
      }
      // Generate a new keypair for the token account
      const tokenAccount = web3.Keypair.generate();
      const space = token.ACCOUNT_SIZE;
      const lamports = await connection.getMinimumBalanceForRentExemption(space);
      const transaction = new web3.Transaction().add(
        web3.SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: tokenAccount.publicKey,
          space,
          lamports,
          programId: token.TOKEN_PROGRAM_ID,
        }),
        token.createInitializeAccountInstruction(
          tokenAccount.publicKey, // new token account
          mintAddr, // token mint address
          publicKey, // owner of the token account
          token.TOKEN_PROGRAM_ID
        )
      );
      const signature = await sendTransaction(transaction, connection, {
        signers: [tokenAccount],
      });
      setAccTx(signature);
      setAccAddr(tokenAccount.publicKey);
      toast.success("Token account created successfully!");

      // Pass the token account address back to the parent
      onAccountCreated(tokenAccount.publicKey);
    } catch (err) {
      toast.error("Error creating Token Account");
      console.error("Account error", err);
    }
  };

  const accOutputs = [
    {
      title: "Token Account Address:",
      dependency: accAddr,
      href: accAddr
        ? `https://explorer.solana.com/address/${accAddr.toBase58()}?cluster=devnet`
        : "",
    },
    {
      title: "Account Transaction Signature:",
      dependency: accTx,
      href: accTx ? `https://explorer.solana.com/tx/${accTx}?cluster=devnet` : "",
    },
  ];

  return (
    <form onSubmit={createAccount} className="bg-[#2a302f] p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-2xl text-[#fa6ece]">Create Account ✨</h2>
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
          {accOutputs.map(({ title, dependency, href }) => (
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
