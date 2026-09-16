import { getPublicPaymentConfig } from "@/lib/config";
import { paymentQrDataUrl } from "@/lib/qr";
import { PaymentForm } from "@/components/payment-form";
import { CopyAddress } from "@/components/copy-address";

export const dynamic = "force-dynamic";

export default async function PayPage() {
  const config = getPublicPaymentConfig();
  const qr = await paymentQrDataUrl(config.recipientAddress);
  return <main className="shell"><nav className="nav"><a className="logo" href="/">bli<span>t</span>le</a><a href="/">Home</a></nav><section className="page"><div className="kicker">Blitle Premium</div><h1 style={{ fontSize: 58 }}>Unlock your watch.</h1><div className="panel"><div className="detail"><span>Price</span><strong>2.34 USDT</strong></div><div className="detail"><span>Network</span><strong>Ethereum Mainnet</strong></div><div className="detail"><span>Send USDT to</span><strong>{config.recipientAddress}</strong></div><img className="qr" src={qr} alt="Public payment address QR code" /><CopyAddress address={config.recipientAddress} /><div className="notice">Send USDT on Ethereum mainnet only. Sending another token or using another network may not be automatically recognized.</div><PaymentForm /></div></section></main>;
}
