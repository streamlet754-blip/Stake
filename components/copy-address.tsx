"use client";

import { useState } from "react";

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
  }
  return <button className="button" type="button" onClick={copy}>{copied ? "Copied" : "Copy Address"}</button>;
}
