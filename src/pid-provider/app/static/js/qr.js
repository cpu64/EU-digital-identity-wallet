const timer = document.getElementById('timer');
const qrContainer = document.getElementById("qrcode");
let timeLeft = 120;
let countdown;

refreshQR();

function updateTimerDisplay() {
    if (timeLeft <= 0) {
        if (typeof countdown !== 'undefined') clearInterval(countdown);
        refreshQR();
    } else {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function startTimer() {
    if (typeof countdown !== 'undefined') clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
    }, 1000);
}

function refreshQR() {
    timeLeft = 120;
    fetch('/api/refresh-qr', { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const offer_uri = data.offer_uri;

            qrContainer.innerHTML = '';

            new QRCode(document.getElementById("qrcode"), {
                text: offer_uri,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            const uri = document.getElementById('offer_uri');
            uri.textContent = offer_uri;

            updateTimerDisplay();
            startTimer();
        });
}

function copyCode() {
    const code = document.getElementById('offer_uri').textContent;
    navigator.clipboard.writeText(code);
}
