import { useEffect, useRef } from "react";

// Plays the looping background track under both screens. The same <audio>
// element persists across start/game screen transitions so the music doesn't
// restart when navigating. Muting is controlled by the `on` flag and is also
// applied directly to the element so the browser shows it as muted.
export function useBackgroundMusic(on: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/Macabre_Waltz.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !on;
    if (on) {
      // Play only after a user gesture; browsers block autoplay otherwise.
      // unlockAudio() is called from the toggle/start buttons in the UI.
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          /* Autoplay blocked; will retry on the next user gesture via toggle. */
        });
      }
    } else {
      audio.pause();
    }
  }, [on]);
}

// Call from a user-gesture handler (button click) to unlock playback.
export function unlockMusic() {
  const audio = document.querySelector("audio");
  if (audio && audio.paused) {
    void audio.play().catch(() => {});
  }
}
