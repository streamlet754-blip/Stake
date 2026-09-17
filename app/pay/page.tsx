import Link from "next/link";
import { getPublicPaymentConfig } from "@/lib/config";
import { paymentQrDataUrl } from "@/lib/qr";
import { PaymentForm } from "@/components/payment-form";
import { CopyAddress } from "@/components/copy-address";

export const dynamic = "force-dynamic";

export default async function PayPage() {
  try {
      const config = getPublicPaymentConfig();
      const qr = await paymentQrDataUrl(config.recipientAddress);
      return <main className="shell payment-shell"><nav className="nav"><Link className="logo" href="/">bli<span>t</span>le</Link><Link href="/">Home</Link></nav><section className="payment-page"><div className="payment-intro"><div className="kicker">Blitle Premium</div><h1>Unlock your watch.</h1><p className="lede">One simple license for your Garmin installation. Pay directly, then verify the transaction below.</p><div className="trust-row"><span>Ethereum mainnet</span><span>2.34 USDT</span><span>One device</span></div></div><div className="payment-grid"><section className="panel payment-card"><div className="card-heading"><div><div className="eyebrow">Step 01</div><h2>Send payment</h2></div><div className="amount">2.34 <small>USDT</small></div></div><div className="qr-wrap"><img className="qr" src={qr} alt="Public payment address QR code" /></div><p className="send-label">Send USDT on Ethereum mainnet to</p><div className="address-row"><strong>{config.recipientAddress}</strong><CopyAddress address={config.recipientAddress} /></div><div className="notice">Only send USDT on Ethereum mainnet. Other tokens and networks may not be recognized.</div></section><section className="panel verify-card"><div className="eyebrow">Step 02</div><h2>Verify payment</h2><p>Paste your transaction hash after the transfer is confirmed.</p><PaymentForm /></section></div></section></main>;
    } catch {
      return <main className="shell payment-shell"><nav className="nav"><Link className="logo" href="/">bli<span>t</span>le</Link><Link href="/">Home</Link></nav><section className="payment-page unavailable"><div className="status-mark">!</div><div className="kicker">Checkout unavailable</div><h1>We are fixing payment setup.</h1><p className="lede">The payment service is temporarily unavailable. Please try again later.</p><Link className="button" href="/">Return home</Link></section></main>;
    }
}
