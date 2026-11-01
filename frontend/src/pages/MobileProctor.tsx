import { useState, useEffect, useRef } from "react";
// Inline SVG icons
const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const Battery = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="7" width="16" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 11v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function MobileProctor() {
  const [, setToken] = useState<string>("");
  const [pairingStatus, setPairingStatus] = useState<"idle" | "pairing" | "paired" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [, setAttemptId] = useState<string>("");
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [chunkCount, setChunkCount] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      pairDevice(tokenParam);
    } else {
      setPairingStatus("error");
      setErrorMessage("No mobile pairing token found in URL. Please scan the QR code displayed on your desktop exam.");
    }

    // Monitor battery level
    if ("getBattery" in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    return () => {
      stopCamera();
    };
  }, []);

  const pairDevice = async (pairingToken: string) => {
    setPairingStatus("pairing");
    try {
      const res = await fetch("/api/proctoring/companion/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairingToken,
          deviceName: `${navigator.platform || "Mobile"} - ${navigator.userAgent.slice(0, 30)}`,
          batteryLevel: batteryLevel ?? undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to pair mobile device");
      }

      setAttemptId(data.data.attemptId);
      setPairingStatus("paired");
      startCompanionCamera(data.data.attemptId, data.data.companionToken);
    } catch (err: any) {
      setPairingStatus("error");
      setErrorMessage(err.message || "Could not pair companion camera");
    }
  };

  const startCompanionCamera = async (targetAttemptId: string, companionToken: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Record 10-second chunks
      const mimeType = MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      let chunkIdx = 0;
      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          const formData = new FormData();
          formData.append("chunk", event.data, `companion_${chunkIdx}.webm`);
          formData.append("chunkIndex", String(chunkIdx));
          formData.append("streamRole", "companion");
          formData.append("durationSeconds", "10");

          try {
            await fetch(`/api/proctoring/attempts/${targetAttemptId}/chunks`, {
              method: "POST",
              headers: { "x-companion-token": companionToken },
              body: formData,
            });
            setChunkCount((prev) => prev + 1);
            chunkIdx++;
          } catch (uploadErr) {
            console.warn("Companion chunk upload error:", uploadErr);
          }
        }
      };

      recorder.start(10000); // 10-second intervals

      // Companion Heartbeat ping every 15s
      const pingInterval = setInterval(async () => {
        try {
          await fetch(`/api/proctoring/attempts/${targetAttemptId}/companion/ping`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-companion-token": companionToken },
            body: JSON.stringify({ batteryLevel }),
          });
        } catch {
          // Ignore transient network errors
        }
      }, 15000);

      return () => clearInterval(pingInterval);
    } catch (err: any) {
      setPairingStatus("error");
      setErrorMessage(`Camera access denied: ${err.message}. Please allow camera permissions to serve as secondary angle.`);
    }
  };

  const stopCamera = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 font-sans">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span className="font-semibold text-lg tracking-tight">Nalanda Proctor</span>
        </div>
        {batteryLevel !== null && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>{batteryLevel}%</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-sm flex-1 flex flex-col items-center justify-center py-6 text-center">
        {pairingStatus === "pairing" && (
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <h2 className="text-lg font-medium">Connecting to exam session...</h2>
            <p className="text-xs text-slate-400">Verifying secure pairing token</p>
          </div>
        )}

        {pairingStatus === "error" && (
          <div className="bg-rose-950/40 border border-rose-800/80 p-5 rounded-2xl flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <h2 className="text-base font-semibold text-rose-200">Pairing Error</h2>
            <p className="text-xs text-rose-300/90 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {pairingStatus === "paired" && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-emerald-500/50 shadow-lg shadow-emerald-500/10 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-emerald-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE WORKSPACE ANGLE
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <h2 className="text-base font-semibold text-emerald-400">Secondary Angle Active</h2>
              <p className="text-xs text-slate-400 max-w-xs">
                Keep your phone propped up on your desk pointing at your hands and laptop screen.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mt-2">
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Chunks Uploaded</span>
                <span className="text-lg font-semibold text-slate-100">{chunkCount}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Session State</span>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Synced
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full text-center py-2 text-[11px] text-slate-500 border-t border-slate-900">
        Nalanda Anti-Cheating Sentinel • Do not lock screen or switch apps
      </footer>
    </div>
  );
}
