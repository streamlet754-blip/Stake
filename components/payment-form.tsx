"use client";

import { useState } from "react";

export function PaymentForm() {
  const [hash, setHash] = useState("");
  const [message, setMessage] = useState("");
  const [license, setLicense] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage("Checking transaction..."); setLicense("");
    const response = await fetch("/api/verify-payment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ transactionHash: hash }) });
    const data = await response.json();
    if (data.licenseKey) { setLicense(data.licenseKey); setMessage("Payment verified. Save your license key."); } else { setMessage(data.reason ? `Payment not verified: ${data.reason}` : data.error ?? "Payment not verified."); }
  }
  return <form onSubmit={submit}><label className="label" htmlFor="hash">Transaction hash</label><div className="row"><input className="input" id="hash" value={hash} onChange={(event) => setHash(event.target.value)} placeholder="0x..." required /><button className="button" type="submit">Verify Payment</button></div>{message && <div className="notice" role="status">{message}</div>}{license && <div className="panel"><div className="kicker">Your Blitle license</div><h2>{license}</h2><p>Save this key. Enter it in the Garmin app to activate premium functionality.</p></div>}</form>;
}

export function CouponForm() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [license, setLicense] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage("Checking owner coupon..."); setLicense("");
    const response = await fetch("/api/redeem-coupon", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
    const data = await response.json();
    if (data.licenseKey) { setLicense(data.licenseKey); setMessage("Owner test license created. Save this key."); } else setMessage(data.error ?? "Coupon could not be redeemed.");
  }
  return <div className="coupon-box"><div className="coupon-heading"><span>Owner / test access</span><small>Server-only coupon</small></div><p>For owner updates and testing only. This does not process a crypto payment.</p><form onSubmit={submit}><label className="label" htmlFor="coupon-code">Coupon code</label><div className="row"><input className="input" id="coupon-code" value={code} onChange={(event) => setCode(event.target.value)} minLength={8} maxLength={128} required /><button className="button" type="submit">Redeem</button></div></form>{message && <div className="notice" role="status">{message}</div>}{license && <div className="coupon-license"><strong>{license}</strong><span>Enter this key in the Garmin app.</span></div>}</div>;
}
