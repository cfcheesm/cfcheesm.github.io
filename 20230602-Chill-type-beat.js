const audio = document.getElementById('audio');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let audioContext;
let analyser;
let source;
let dataArray;

audio.addEventListener('play', () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 1024;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
});

let rotationAngle = 0; // Initial rotation angle

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    let avgFreq = 0;
    for (let i = 0; i < dataArray.length; i++) {
        avgFreq += dataArray[i];
    }
    avgFreq /= dataArray.length;
    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 10, canvas.width / 2, canvas.height / 2, canvas.width);
    gradient.addColorStop(0, `hsl(${avgFreq}, 100%, 50%)`);
    gradient.addColorStop(1, 'black');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save(); // Save the current canvas state
    ctx.translate(centerX, centerY); // Translate the canvas origin to the center
    ctx.rotate(rotationAngle); // Apply rotation
    ctx.translate(-centerX, -centerY); // Translate the canvas origin back

    ctx.beginPath();
    for (let i = 0; i < dataArray.length; i++) {
        const radius = (dataArray[i] / 255) * canvas.height / 2;
        const angle = (i / dataArray.length) * 2 * Math.PI;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();

    ctx.strokeStyle = `hsl(${performance.now() / 100 % 360}, 100%, 50%)`; // Color changes over time
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.restore(); // Restore the saved canvas state

    rotationAngle += 0.005; // Increment rotation angle for the next frame
}


