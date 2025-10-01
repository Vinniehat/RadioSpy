import express from "express";
import mysql from "mysql2/promise";
import { createServer } from "http";
import { Server } from "socket.io";
import chokidar from "chokidar";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const RECORDINGS_DIR = "C:\\ProScan\\Recordings";

// Watcher setup
const watcher = chokidar.watch(RECORDINGS_DIR, {
    persistent: true,
    ignoreInitial: false,
    depth: 5,
});

// MariaDB pool


const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
});


app.use(express.json());

// --- API Endpoints ---
app.get("/api/systems", async (req, res) => {
    const [systems] = await db.execute("SELECT * FROM systems");
    res.json(systems);
});

app.get("/api/systems/:id/talkgroups", async (req, res) => {
    const [talkgroups] = await db.execute(
        "SELECT * FROM talkgroups WHERE system_id = ?",
        [req.params.id]
    );
    res.json(talkgroups);
});

app.get("/api/talkgroups/:id/recordings", async (req, res) => {
    const [recordings] = await db.execute(
        "SELECT * FROM recordings WHERE talkgroup_id = ? ORDER BY timestamp DESC",
        [req.params.id]
    );
    res.json(recordings);
});

app.get("/api/recordings/:id/audio", async (req, res) => {
    const [rows] = await db.execute(
        "SELECT folder_path, filename FROM recordings WHERE id = ?",
        [req.params.id]
    );
    if (rows.length === 0) return res.sendStatus(404);

    const recording = rows[0];
    const fullPath = path.join(recording.folder_path, recording.filename);
    res.sendFile(fullPath);
});

// --- Watch folder for new recordings ---
watcher.on("add", async (filepath) => {
    try {
        const parsed = path.parse(filepath);
        const filename = parsed.base;

        const segments = filepath.split(path.sep);
        // ...\Recordings\[DATE]\[Favorite]\[SYSTEM]\[TG ID]\File
        const dateFolder = segments[segments.length - 5];
        const favorite = segments[segments.length - 4];
        const systemName = segments[segments.length - 3];
        const tgSegment = segments[segments.length - 2];
        const talkgroupId = parseInt(tgSegment, 10);
        const folderPath = path.join(...segments.slice(0, segments.length - 1));

        console.log({ dateFolder, favorite, systemName, talkgroupId, folderPath, filename });

        // --- Insert system safely ---
        await db.execute("INSERT IGNORE INTO systems (name) VALUES (?)", [systemName]);
        const [systemRows] = await db.execute("SELECT id FROM systems WHERE name = ?", [systemName]);
        const systemId = systemRows[0].id;

        // --- Insert talkgroup safely ---
        const safeTalkgroupId = !isNaN(talkgroupId) ? talkgroupId : null;
        if (safeTalkgroupId !== null) {
            await db.execute(
                "INSERT IGNORE INTO talkgroups (id, system_id, name) VALUES (?, ?, ?)",
                [safeTalkgroupId, systemId, `Talkgroup ${safeTalkgroupId}`]
            );
        } else {
            console.warn("Invalid talkgroup ID:", tgSegment);
        }

        // --- Insert recording ---
        await db.execute(
            "INSERT INTO recordings (talkgroup_id, folder_path, filename) VALUES (?, ?, ?)",
            [safeTalkgroupId, folderPath, filename]
        );

        // --- Notify frontend ---
        io.emit("new-recording", { talkgroupId: safeTalkgroupId, folderPath, filename });
    } catch (err) {
        console.error("Watcher error:", err);
    }
});


// --- Start server ---
httpServer.listen(3000, () => console.log("Server running on http://localhost:3000"));
