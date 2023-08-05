function initVis() {
    fft = new p5.FFT();
    fft.setInput(mic);

    level = 0
    pitch = 0

    recordData = []
}

function startRecordData() {
    recordData = []
    recordStart = Date.now()
}

function visRecording() {
    return
    background(255)
    const recordingTime = (Date.now() - recordStart) / 1000

    const minLevel = recordData.reduce((a, b) => a.level < b.level ? a : b).level
    const maxLevel = recordData.reduce((a, b) => a.level > b.level ? a : b).level
    const minPitch = recordData.reduce((a, b) => a.pitch < b.pitch ? a : b).pitch
    const maxPitch = recordData.reduce((a, b) => a.pitch > b.pitch ? a : b).pitch

    noFill()
    stroke(0)
    beginShape()
    for (let i = 0; i < recordData.length; i++) {
        const x = width * i / recordData.length
        const y = map(recordData[i].level, minLevel, maxLevel, 0, height * .1)
        vertex(x, height * .1 + y);
    }
    endShape()

    beginShape()
    for (let i = 0; i < recordData.length; i++) {
        const x = width * i / recordData.length
        const y = map(recordData[i].pitch, minPitch, maxPitch, 0, height * .1)
        vertex(x, height * .2 + y);
    }
    endShape()
}

function visLive() {
    fill(200)
    noStroke()
    rect(0, height, width, -height * .1)

    const newLevel = mic.getLevel();
    level = lerp(level, newLevel, 0.5);

    const spectrum = fft.analyze();
    const relevant = spectrum.filter((_, i) => i < 120);
    const newPitch = relevant.indexOf(spectrum.reduce((a, b) => a > b ? a : b));
    pitch = lerp(pitch, newPitch, 0.5);

    recordData.push({ level, pitch })

    stroke(0)
    // strokeWeight(width / spectrum.length)
    for (let i = 0; i < spectrum.length; i++) {
        const x = i * 3
        const h = map(spectrum[i], 0, 255, 0, height * .1);
        line(x, height, x, height - h)
    }


    fill(255)
    noStroke()
    circle(width * .75, height * .95, level * height)
    rect(pitch * 3, height, 3, -height * .1)

    let waveform = fft.waveform();
    let rms = 0
    stroke(255)
    strokeWeight(2)
    noFill()
    beginShape()
    for (let i = 0; i < waveform.length; i++) {
        let x = map(i, 0, waveform.length, 0, width);
        let y = waveform[i] * height * .05
        vertex(x, height * .95 + y);

        rms += waveform[i] * waveform[i]
    }
    endShape()
    rms = sqrt(rms / waveform.length)

    if (speaking) {
        fill(255, 0, 0)
        noStroke()
        circle(width - 10, height * .9 + 10, 10)
    }
}