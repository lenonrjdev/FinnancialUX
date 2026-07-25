"use client";

import { useState } from "react";
import { ArrowUpIcon, CoinBagIcon, TrendIcon, WalletIcon } from "./icons";

function EarningsCard() {
  return (
    <div className="earnings-card">
      <div className="earnings-main"><span className="earnings-icon"><CoinBagIcon /></span><strong>$0.00</strong></div>
      <span>Your Earnings / Day</span>
    </div>
  );
}

function MetricsCard() {
  return (
    <section className="metrics-card">
      <div className="metric-block metric-apy">
        <div className="metric-label-row"><span>APY</span><span className="metric-symbol">%</span></div>
        <strong>257,900%</strong>
      </div>
      <div className="metric-block">
        <span>Total Value Deposited</span>
        <div className="metric-value-row"><strong>$571,320</strong><span className="round-arrow"><ArrowUpIcon /></span></div>
      </div>
      <div className="metric-block">
        <span>Current Index</span>
        <div className="metric-value-row"><strong>1.99 <small>HUMP</small></strong><TrendIcon className="trend" /></div>
      </div>
    </section>
  );
}

function EmptyWalletCard() {
  return (
    <section className="empty-wallet-card">
      <div className="wallet-illustration">
        <span className="spark spark-a">✦</span><span className="spark spark-b">✦</span><WalletIcon />
      </div>
      <button className="outline-button">Connect Wallet</button>
      <p>Connect your wallet to stake HUMP</p>
    </section>
  );
}

function StakeForm() {
  const [tab, setTab] = useState<"stake" | "unstake">("stake");
  return (
    <section className="stake-form-card">
      <div className="stake-tabs">
        <button className={tab === "stake" ? "active" : ""} onClick={() => setTab("stake")}>STAKE</button>
        <button className={tab === "unstake" ? "active" : ""} onClick={() => setTab("unstake")}>UNSTAKE</button>
      </div>
      <div className="stake-form-body">
        <div className="amount-field"><input aria-label="Amount" placeholder="Enter the amount" /><button>MAX</button></div>
        <button className="primary-wide">{tab === "stake" ? "Stake HUMP" : "Unstake HUMP"}</button>
        <dl className="balance-list">
          <div><dt>Your Balance:</dt><dd>0.0 HUMP</dd></div>
          <div><dt>Your Staked Balance:</dt><dd>0 sHUMP ($0)</dd></div>
          <div><dt>Next Reward Amount:</dt><dd>0 sHUMP ($0)</dd></div>
          <div><dt>Next Reward Yield:</dt><dd>0.5378%</dd></div>
          <div><dt>ROI (5-Day Rate):</dt><dd>8.7796%</dd></div>
        </dl>
      </div>
    </section>
  );
}

export default function StakeView() {
  return (
    <div className="stake-page">
      <div className="page-heading-row">
        <div>
          <h1>Single Stake (3,3)</h1>
          <p><span className="clock-dot">◷</span> 7 hrs, 9 min to next rebase</p>
        </div>
        <EarningsCard />
      </div>

      <div className="stake-grid">
        <div className="desktop-empty"><EmptyWalletCard /></div>
        <div className="responsive-form"><StakeForm /></div>
        <MetricsCard />
      </div>
    </div>
  );
}
