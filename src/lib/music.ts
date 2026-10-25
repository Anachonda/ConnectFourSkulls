import { useEffect, useRef } from "react";

// The background track is created in memory (not attached to the DOM), so
// document.querySelector("audio") can't find it. Keep a module-level ref so
// unlockMusic() can reach it from a user-gesture handler in another module.
let bgAudio: HTMLAudioElement | null = null;

function getBackgroundAudio(): HTMLAudioElement {
  if (bgAudio) return bgAudio;

  const audio = new Audio(`${import.meta.env.BASE_URL}Macabre_Waltz.mp3`);
  audio.loop = true;
  audio.volume = 0.4;
  audio.preload = "none";
  bgAudio = audio;
  return audio;
}

// Plays the looping background track under both screens. The same <audio>
// element persists across start/game screen transitions so the music doesn't
// restart when navigating. Muting is controlled by the `on` flag and is also
// applied directly to the element so the browser shows it as muted.
export function useBackgroundMusic(on: boolean) {
  useEffect(() => {
    return () => {
      if (!bgAudio) return;
      bgAudio.pause();
      bgAudio.src = "";
      bgAudio = null;
    };
  }, []);

  useEffect(() => {
    if (!on) {
      bgAudio?.pause();
      return;
    }

    const audio = getBackgroundAudio();
    audio.muted = false;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* Autoplay blocked; will retry on the next user gesture via toggle. */
      });
    }
  }, [on]);
}

// Call from a user-gesture handler (button click) to unlock playback.
export function unlockMusic() {
  if (bgAudio && bgAudio.paused) {
    void bgAudio.play().catch(() => {});
  }
}
