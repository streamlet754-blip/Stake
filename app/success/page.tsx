import Link from "next/link";
export default function SuccessPage() { return <main className="shell"><section className="page"><div className="kicker">Payment complete</div><h1 style={{ fontSize: 58 }}>Your license is ready.</h1><p className="lede">Enter the key shown after verification in your Garmin app.</p><Link className="button" href="/pay">Back to payment</Link></section></main>; }
