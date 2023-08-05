function setup() {
    createCanvas(windowWidth, windowHeight);

    textFont('Helvetica');

    mic = new p5.AudioIn();
    mic.start();

    initHark();
    initVis()

    speaking = false
}

function mousePressed() {
    background(255)
    getAudioContext().resume()
}

async function initHark() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    var options = {};
    var speechEvents = hark(stream, options);

    const recorder = new MediaRecorder(stream);
    const audioChunks = []
    recorder.start();

    function resetRecording(resetSpeaking = false) {
        if (resetSpeaking) speaking = false
        if (!speaking) {
            startRecordData()
            audioChunks.length = 0;
            recorder.stop();
            recorder.start();
        }
    }

    async function endRecording() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendToWhisper(audioBlob)
        await visRecording()

        resetRecording(true)

        // const audioUrl = URL.createObjectURL(audioBlob);
        // const audio = new Audio(audioUrl);
        // audio.play();
    }

    recorder.addEventListener("stop", () => {
        if (!speaking) return
        endRecording()
    });


    ticker = setInterval(resetRecording, 500)
    recorder.addEventListener("dataavailable", event => { if (speaking) audioChunks.push(event.data) });
    speechEvents.on('speaking', () => speaking = true);
    speechEvents.on('stopped_speaking', () => recorder.stop());
}

async function sendToWhisper(blob) {
    const file = new File([blob], "audio.wav", { type: "audio/wav" });

    const data = new FormData();
    data.append("file", file);
    data.append("model", "whisper-1");
    data.append("language", "he");

    const res = await fetch("https://whisper-poet.vercel.app/api/transcribe", {
        method: "POST",
        body: data,
    });

    const json = await res.json()
    const txt = json.text
    putText(txt)
}


let textY = 20
function putText(txt){
    textSize(20)
    // const textW = textWidth(txt)
    // const newTextSize = width / textW * 20
    // textSize(newTextSize)
    // textAlign(CENTER, CENTER);
    fill(0)
    noStroke()
    textAlign(RIGHT, TOP)
    text(txt, random(width*.6,width*.9), textY)
    textY += 22
}


function draw() {
    visLive();
}