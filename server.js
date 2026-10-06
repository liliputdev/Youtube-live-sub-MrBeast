let currentCount = 0;

function animateCount(newCount) {
    const element = document.getElementById("subscriberCount");

    const start = currentCount;
    const difference = newCount - start;
    const duration = 1500;
    const startTime = performance.now();

    function update(time) {
        const progress = Math.min((time - startTime) / duration, 1);

        // Smooth easing
        const eased = 1 - Math.pow(1 - progress, 3);

        const value = Math.floor(start + difference * eased);

        element.textContent = value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            currentCount = newCount;
        }
    }

    requestAnimationFrame(update);
}

async function updateSubscribers() {
    try {
        const response = await fetch("/api/subscribers");

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (data.subscribers !== undefined) {
            const newCount = Number(data.subscribers);

            if (!Number.isNaN(newCount)) {
                animateCount(newCount);
            }
        }

    } catch (error) {
        console.error("Subscriber update failed:", error);
    }
}

// Initial update
updateSubscribers();

// Check YouTube every 60 seconds
setInterval(updateSubscribers, 60000);