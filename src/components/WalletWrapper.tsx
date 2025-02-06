"use client";

import * as web3 from "@solana/web3.js";
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  AlphaWalletAdapter,
  LedgerWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { FC, useMemo } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

type Props = {
  children?: React.ReactNode;
};

export const WalletWrapper: FC<Props> = ({ children }) => {
  //input your RPC as your endpoint value
  const endpoint = web3.clusterApiUrl("devnet");

  const wallets = useMemo(
    () => [new SolflareWalletAdapter(), new AlphaWalletAdapter(), new LedgerWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
