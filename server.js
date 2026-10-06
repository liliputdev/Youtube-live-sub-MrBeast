const express = require("express");

const app = express();
const PORT = 3000;

// Serve files from public folder
app.use(express.static("public"));

// Subscriber API
app.get("/api/subscribers", async (req, res) => {
    try {
        // Temporary test value
        const subscribers = 520000000;

        res.json({
            subscribers
        });
    } catch (error) {
        console.error("Subscriber API failed:", error);

        res.status(500).json({
            error: "Failed to get subscribers"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});