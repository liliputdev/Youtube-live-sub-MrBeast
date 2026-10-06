const el = document.getElementById("subscriberCount");

// ---- Settings ----
const POLL_MS = 30000;          // ask your server every 30 seconds
const DEFAULT_RATE_PER_SEC = 3; // starting guess (subs/sec); it corrects itself
const FOLLOW_SPEED = 3;         // higher = display catches up faster

// ---- State ----
let lastApi = null;
let lastChangeAt = 0;
let anchor = 0;
let rate = DEFAULT_RATE_PER_SEC / 1000; // subs per millisecond
let seenChange = false;
let display = 0;
let ready = false;
let lastFrame = performance.now();

function stepFor(value) {
    // YouTube rounds to 3 significant figures
    const digits = String(Math.round(value)).length;
    return Math.pow(10, Math.max(digits - 3, 0));
}

function bump() {
    el.classList.remove("bump");
    void el.offsetWidth; // restart the animation
    el.classList.add("bump");
}

el.addEventListener("animationend", () => el.classList.remove("bump"));

async function poll() {
    try {
        const res = await fetch("/api/subscribers");
        const data = await res.json();
        const value = Number(data.subscribers);
        if (!Number.isFinite(value)) return;

        const now = Date.now();

        if (lastApi === null) {
            lastApi = value;
            lastChangeAt = now;
            anchor = value;
            ready = true;
            return;
        }

        if (value !== lastApi) {
            const step = stepFor(value);
            const dir = value > lastApi ? 1 : -1;
            const boundary = value - dir * (step / 2);

            // Only learn the rate from real, consecutive increases
            if (dir === 1 && seenChange) {
                const dt = now - lastChangeAt;
                if (dt > 5000) {
                    const measured = (value - lastApi) / dt;
                    rate = rate * 0.5 + measured * 0.5;
                }
            }

            seenChange = true;
            anchor = boundary;
            lastChangeAt = now;
            lastApi = value;
            bump();
        }
    } catch (err) {
        console.error(err); // keep showing the last number
    }
}

function estimate() {
    const elapsed = Date.now() - lastChangeAt;
    const est = anchor + rate * elapsed;
    const half = stepFor(lastApi) / 2;
    return Math.min(Math.max(est, lastApi - half), lastApi + half);
}

function frame(now) {
    const dt = Math.min(now - lastFrame, 100) / 1000;
    lastFrame = now;

    if (ready) {
        display += (estimate() - display) * (1 - Math.exp(-FOLLOW_SPEED * dt));
        const text = Math.round(display).toLocaleString();
        if (el.textContent !== text) el.textContent = text;
    }
    requestAnimationFrame(frame);
}

poll();
setInterval(poll, POLL_MS);
requestAnimationFrame(frame);