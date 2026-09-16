import Link from "next/link";

export default function Home() {
  return <main className="shell">
    <nav className="nav"><Link className="logo" href="/">bli<span>t</span>le</Link><Link href="/pay">Get License <span aria-hidden="true">↗</span></Link></nav>
    <section className="hero"><div><div className="kicker">Premium Garmin application</div><h1>More of your watch, on your terms.</h1><p className="lede">Blitle adds a focused premium layer to your Garmin experience. Install the app, purchase a license with direct crypto payment, and unlock it on your watch.</p><Link className="button accent" href="/pay">Get License <span aria-hidden="true">↗</span></Link></div><div className="hero-art"><div className="device"><div className="device-screen">BLITLE<br /><br /><span style={{ fontSize: 28 }}>READY</span></div></div></div></section>
    <section className="section"><div className="grid"><article className="feature"><h3>Direct payment</h3><p>Pay the configured amount directly to the public receiving address. No custodial checkout.</p></article><article className="feature"><h3>One device</h3><p>Your license activates once and binds to your Garmin installation.</p></article><article className="feature"><h3>Designed for offline</h3><p>Once activated, Blitle keeps its entitlement locally and rechecks when available.</p></article></div></section>
  </main>;
}
