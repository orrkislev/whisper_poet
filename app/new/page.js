'use client'

import { useEffect, useState } from "react";
const hark = require('hark');

export default function Page() {

  const [texts, setTexts] = useState([])

  useEffect(() => {
    let ticker
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const speechEvents = hark(stream, {});

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start()
        const audioChunks = []

        let shouldRecord = false

        ticker = setInterval(() => {
          if (!shouldRecord) {
            mediaRecorder.stop();
            mediaRecorder.start();
          }
        }, 500)

        mediaRecorder.addEventListener("dataavailable", event => {
          if (shouldRecord) audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          if (!shouldRecord) return
          const selectedChunks = (audioChunks.length > 2) ? audioChunks.slice(audioChunks.length - 2) : audioChunks
          const audioBlob = new Blob(selectedChunks, { type: 'audio/wav' });

          audioChunks.length = 0;
          const audioUrl = URL.createObjectURL(audioBlob);
          sendToWhisper(audioBlob)
          const audio = new Audio(audioUrl);
          audio.play();
          shouldRecord = false
          mediaRecorder.start();
        });

        speechEvents.on('speaking', () => {
          console.log('speaking')
          shouldRecord = true
        })

        speechEvents.on('stopped_speaking', () => {
          console.log('stopped_speaking')
          mediaRecorder.stop();
        })
      })
    return () => {
      if (ticker) clearInterval(ticker)
    }
  }, [])

  const sendToWhisper = async (blob) => {
    const file = new File([blob], "audio.wav", { type: "audio/wav" });

    const data = new FormData();
    data.append("file", file);
    data.append("model", "whisper-1");
    data.append("language", "he");

    const res = await fetch("./api/transcribe", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    const newText = {text: json.text, right: Math.random() * window.innerWidth, top: Math.random() * window.innerHeight, size: Math.random() * 20 + 10}
    setTexts([...texts, newText])
  }

  return (
    <div>
      {texts.map((text, i) => 
        <div key={i} style={{ position: 'absolute', right: text.right, top: text.top, fontSize: text.size }}>
          {text.text}
        </div>
      )}
    </div>
  );
}
