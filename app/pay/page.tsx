import { getPublicPaymentConfig } from "@/lib/config";
import { paymentQrDataUrl } from "@/lib/qr";
import { PaymentForm } from "@/components/payment-form";

export const dynamic = "force-dynamic";

export default async function PayPage() {
  const config = getPublicPaymentConfig();
  const qr = await paymentQrDataUrl(config.recipientAddress);
  return <main className="shell"><nav className="nav"><a className="logo" href="/">bli<span>t</span>le</a><a href="/">Home</a></nav><section className="page"><div className="kicker">Blitle Premium License</div><h1 style={{ fontSize: 58 }}>Unlock your watch.</h1><div className="panel"><div className="detail"><span>Price</span><strong>{config.amount} {config.currency}</strong></div><div className="detail"><span>Crypto</span><strong>{config.token}</strong></div><div className="detail"><span>Network</span><strong>{config.network}</strong></div><div className="detail"><span>Address</span><strong>{config.recipientAddress}</strong></div><img className="qr" src={qr} alt="Public payment address QR code" /><PaymentForm /></div></section></main>;
}
