"use client";

import { useState } from "react";
import * as web3 from "@solana/web3.js";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function SendSOL() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [solRecipient, setSolRecipient] = useState<string>("");
  const [solAmount, setSolAmount] = useState<number>(0);
  const [solTxSig, setSolTxSig] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);

  // Function to update balance after a transaction
  const updateBalance = async () => {
    if (connection && publicKey) {
      const info = await connection.getAccountInfo(publicKey);
      if (info) {
        setBalance(info.lamports / web3.LAMPORTS_PER_SOL);
      }
    }
  };

  const handleTransaction = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return;
    }

    let recipient: web3.PublicKey;
    try {
      recipient = new web3.PublicKey(solRecipient);
    } catch (error) {
      console.log(error);

      toast.error("Invalid recipient address.");
      return;
    }

    const lamports = solAmount * web3.LAMPORTS_PER_SOL;
    const transaction = new web3.Transaction();
    const instruction = web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      lamports,
      toPubkey: recipient,
    });
    transaction.add(instruction);

    try {
      const signature = await sendTransaction(transaction, connection);
      setSolTxSig(signature);
      await updateBalance();
      toast.success("Transaction sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed!");
    } finally {
      setSolRecipient("");
      setSolAmount(0);
    }
  };

  const solOutputs = [
    {
      title: "Updated Balance:",
      dependency: balance,
    },
    {
      title: "Transaction Signature:",
      dependency: solTxSig,
      href: solTxSig ? `https://explorer.solana.com/tx/${solTxSig}?cluster=devnet` : "",
    },
  ];

  return (
    <div className="bg-[#2a302f] p-6 rounded-lg shadow-lg">
      <form onSubmit={handleTransaction}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-2xl text-[#fa6ece]">Sol Transfer 💸</h2>
          <button
            type="submit"
            disabled={!solRecipient || solAmount <= 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] 
             bg-gradient-to-r from-[#00ffff] to-[#ff00ff] border-2 border-white 
             rounded-lg w-24 py-1 font-semibold transition-all duration-200 
             text-white shadow-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,255,1)]"
          >
            Submit
          </button>
        </div>
        <div className="mb-4">
          <label className="italic text-sm">Receiver Address</label>
          <input
            type="text"
            placeholder="Public key of receiver"
            className="mt-1 text-[#9e80ff] py-1 w-full bg-transparent outline-none border-b border-white"
            value={solRecipient}
            onChange={(e) => setSolRecipient(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="italic text-sm">Amount (SOL)</label>
          <input
            type="number"
            step="any"
            placeholder="Amount of SOL"
            className="mt-1 text-[#9e80ff] py-1 w-full bg-transparent outline-none border-b border-white"
            value={solAmount}
            onChange={(e) => setSolAmount(Number(e.target.value))}
          />
        </div>
        <div className="text-sm font-semibold bg-[#222524] border border-gray-500 rounded-lg p-2">
          <ul className="space-y-2">
            {solOutputs.map(({ title, dependency, href }) => (
              <li key={title} className="flex justify-between items-center">
                <span className="tracking-wider">{title}</span>
                {dependency &&
                  (href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex text-[#80ebff] italic hover:text-white transition-all duration-200"
                    >
                      {dependency.toString().slice(0, 25)}
                      <ExternalLinkIcon className="w-5 ml-1" />
                    </a>
                  ) : (
                    <span className="text-[#80ebff] italic">{dependency.toString()}</span>
                  ))}
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
}
