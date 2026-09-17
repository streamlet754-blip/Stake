"use client";

import { useState } from "react";

type AdminData = {
	payments: Array<{ id: string; status: string; transactionHash: string }>;
	licenses: Array<{ id: string; status: string; deviceId: string | null }>;
};

export default function AdminPage() {
	const [secret, setSecret] = useState("");
	const [ownerCode, setOwnerCode] = useState("");
	const [ownerMessage, setOwnerMessage] = useState("");
	const [ownerLicense, setOwnerLicense] = useState("");
	const [data, setData] = useState<AdminData | null>(null);

	async function load() {
		const response = await fetch("/api/admin", { headers: { authorization: `Bearer ${secret}` } });
		setData(response.ok ? await response.json() : null);
	}

	async function issueOwnerLicense(event: React.FormEvent) {
		event.preventDefault();
		setOwnerMessage("Issuing owner license...");
		setOwnerLicense("");
		const response = await fetch("/api/admin/issue-license", {
			method: "POST",
			headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
			body: JSON.stringify({ code: ownerCode })
		});
		const result = await response.json().catch(() => ({}));
		if (result.licenseKey) {
			setOwnerLicense(result.licenseKey);
			setOwnerMessage("Owner license issued. Save this key securely.");
		} else {
			setOwnerMessage(result.error ?? "Owner license could not be issued.");
		}
	}

	return <main className="shell"><section className="page"><div className="kicker">Private console</div><h1 style={{ fontSize: 58 }}>Blitle admin.</h1><div className="panel"><label className="label" htmlFor="secret">Admin secret</label><input className="input" id="secret" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} /><button className="button" style={{ marginTop: 14 }} onClick={load}>Load records</button></div><form className="panel" onSubmit={issueOwnerLicense}><div className="kicker">Owner access</div><h2>Issue license without payment</h2><p>For private owner use only. Requires the admin secret and the server-side owner code.</p><label className="label" htmlFor="owner-code">Owner code</label><input className="input" id="owner-code" type="password" value={ownerCode} onChange={(event) => setOwnerCode(event.target.value)} required /><button className="button" style={{ marginTop: 14 }} type="submit">Issue owner license</button>{ownerMessage && <div className="notice" role="status">{ownerMessage}</div>}{ownerLicense && <div className="panel"><div className="kicker">Owner license</div><h2>{ownerLicense}</h2><p>Save this key securely and enter it in the Garmin app.</p></div>}</form>{data && <div className="panel"><h2>Payments</h2>{data.payments.map((payment) => <p key={payment.id}>{payment.status} · {payment.transactionHash}</p>)}<h2>Licenses</h2>{data.licenses.map((license) => <p key={license.id}>{license.status} · {license.deviceId ?? "unbound"}</p>)}</div>}</section></main>;
}
