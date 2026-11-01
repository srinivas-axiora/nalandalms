import { useState, useEffect } from "react";

// Inline SVG icons
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.81a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
  </svg>
);
const Printer = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

export function VerifyCertificate() {
  const [certId, setCertId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const id = parts[parts.length - 1];
    setCertId(id);

    if (id && id !== "verify") {
      fetchVerification(id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchVerification = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(id)}`);
      const json = await res.json();
      if (res.ok && json.verified) {
        setData(json.certificate);
      } else {
        setError(json.error || "Certificate could not be verified");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach verification registry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Brand Banner */}
      <header className="w-full max-w-3xl flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-cyan-500/20">
            N
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-white block">Nalanda Registry</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Official Credential Verification</span>
          </div>
        </div>
        <a
          href="/"
          className="text-xs text-slate-400 hover:text-cyan-400 border border-slate-800 px-3 py-1.5 rounded-lg transition"
        >
          Explore Catalog →
        </a>
      </header>

      {/* Main Verification Card */}
      <main className="w-full max-w-3xl my-8">
        {loading ? (
          <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">Verifying Cryptographic Digital Signature...</p>
            <p className="text-xs text-slate-500 mt-1">Checking root integrity with Nalanda Academic Ledger</p>
          </div>
        ) : error || !data ? (
          <div className="bg-rose-950/20 border border-rose-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-4">
            <XCircle className="w-16 h-16 text-rose-400 mx-auto" />
            <h1 className="text-2xl font-bold text-rose-200">Invalid or Unverified Credential</h1>
            <p className="text-sm text-rose-300/80 max-w-md mx-auto">
              The credential ID <span className="font-mono font-semibold text-white">{certId}</span> was not found in our public registry or its cryptographic signature has been tampered with.
            </p>
            <div className="pt-4">
              <a
                href="/"
                className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Return to Nalanda Platform
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Top Verified Ribbon */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-2xl w-fit mb-6">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold tracking-wide">VERIFIED OFFICIAL CREDENTIAL</span>
            </div>

            {/* Credential Header */}
            <div className="space-y-1 mb-8">
              <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase block">
                {data.certificateId}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {data.courseTitle}
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Conferred to <span className="text-slate-100 font-semibold">{data.recipientName}</span>
              </p>
            </div>

            {/* Integrity Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Issuing Authority</span>
                <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{data.issuingAuthority}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Date Conferred</span>
                <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
                  {new Date(data.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Proctoring Status</span>
                <span className="text-sm font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  AI & Human Verified
                </span>
              </div>
            </div>

            {/* Cryptographic Signature Fingerprint */}
            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl mb-8">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300">HMAC-SHA256 Digital Signature</span>
                <span className="text-emerald-400 font-mono text-[11px] font-semibold">✓ Cryptographically Valid</span>
              </div>
              <p className="font-mono text-[11px] text-slate-500 break-all select-all bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                {data.signatureHash}
              </p>
            </div>

            {/* Share & Print Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800">
              <a
                href={data.linkedinShareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white text-xs font-semibold shadow-md transition"
              >
                <Linkedin className="w-4 h-4" />
                Add to LinkedIn Profile
              </a>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Notice */}
      <footer className="w-full text-center py-4 text-xs text-slate-500 border-t border-slate-900">
        Nalanda Academic Ledger • Cryptographically Sealed Electronic Credential
      </footer>
    </div>
  );
}

