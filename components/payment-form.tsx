"use client";

import { useState } from "react";

export function PaymentForm() {
  const [hash, setHash] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");
  const [license, setLicense] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("Checking transaction...");
    setLicense("");
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch("/api/verify-payment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ transactionHash: hash, couponCode: couponCode || undefined }), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (data.licenseKey) setMessage("Payment verified. Save your license key.");
      else setMessage(data.reason ? `Payment not verified: ${data.reason}` : data.error ?? "Payment not verified.");
      if (data.licenseKey) setLicense(data.licenseKey);
    } catch (error: unknown) {
      setMessage(error instanceof DOMException && error.name === "AbortError"
        ? "Verification took too long. Check the transaction hash and try again."
        : "Could not reach payment verification. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      setIsSubmitting(false);
    }
  }
  return <form onSubmit={submit}><label className="label" htmlFor="hash">Transaction hash</label><div className="row"><input className="input" id="hash" value={hash} onChange={(event) => setHash(event.target.value)} placeholder="0x..." required disabled={isSubmitting} /><button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Checking..." : "Verify Payment"}</button></div><label className="label coupon-label" htmlFor="coupon-code">Discount code <span>Optional</span></label><input className="input" id="coupon-code" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Enter code" autoCapitalize="characters" disabled={isSubmitting} />{message && <div className="notice" role="status">{message}</div>}{license && <div className="panel"><div className="kicker">Your Blitle license</div><h2>{license}</h2><p>Save this key. Enter it in the Garmin app to activate premium functionality.</p></div>}</form>;
}
