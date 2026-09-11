import { useEffect, useRef, useState } from "react";
import monkeyAsset from "@/assets/monkey-purple-hoodie.png.asset.json";
import monkeyAnimation from "@/assets/monkey-password-polished.mp4.asset.json";
import monkeyLookDown from "@/assets/monkey-look-down.png";

type Props = {
  /** Monkey closes both eyes while the password field is active. */
  covering: boolean;
  /** Monkey watches while the user fills another field. */
  watching?: boolean;
  /** Monkey looks toward the field below. */
  lookDown?: boolean;
  className?: string;
};

export function MonkeyGuard({ covering, watching = false, lookDown = false, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [animating, setAnimating] = useState(false);
  const wasCovering = useRef(false);
  const phase = useRef<"cover" | "reveal" | null>(null);

  const playPhase = (nextPhase: "cover" | "reveal") => {
    const video = videoRef.current;
    if (!video) return;
    phase.current = nextPhase;
    setAnimating(true);

    const start = nextPhase === "cover" ? 0 : 5.7;
    const startPlayback = () => {
      video.currentTime = start;
      void video.play().catch(() => undefined);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startPlayback();
    } else {
      video.addEventListener("loadedmetadata", startPlayback, { once: true });
      video.load();
    }
  };

  useEffect(() => {
    if (covering) {
      wasCovering.current = true;
      playPhase("cover");
      return;
    }

    if (!wasCovering.current) return;
    wasCovering.current = false;
    playPhase("reveal");
  }, [covering]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTime = () => {
      if (phase.current === "cover" && video.currentTime >= 5.6) {
        video.pause();
      }
    };
    const handleEnded = () => {
      phase.current = null;
      setAnimating(false);
    };
    video.addEventListener("timeupdate", handleTime);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", handleTime);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div
      className={`${className ?? ""} relative overflow-hidden rounded-full bg-secondary shadow-sm ring-1 ring-border transition-transform duration-300 ease-out ${
        watching ? "scale-[1.02]" : "scale-100"
      }`}
      aria-hidden="true"
    >
      <img
        src={lookDown ? monkeyLookDown : monkeyAsset.url}
        alt=""
        draggable={false}
        className={`absolute inset-0 h-full w-full select-none object-cover transition-all duration-300 ease-out ${
          lookDown ? "translate-y-1" : "translate-y-0"
        } ${animating ? "opacity-0" : "opacity-100"}`}
      />
      <video
        ref={videoRef}
        src={monkeyAnimation.url}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-300 ease-in-out ${
          animating ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
    </div>
  );
}