import express from "express";
import mysql from "mysql2/promise";
import {createServer} from "http";
import {Server} from "socket.io";
import chokidar from "chokidar";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import * as fs from "node:fs";

const RECORDINGS_DIR = "C:\\ProScan\\Recordings";
const app = express();
const httpServer = createServer(app);

dotenv.config();

// Watcher setup
const watcher = chokidar.watch(RECORDINGS_DIR, {
    persistent: true, ignoreInitial: false, depth: 5,
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

// --- Middleware ---
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));


// when creating the io server
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // <-- your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});
// Save original emit
const originalEmit = io.emit;

// Override
io.emit = function(event, ...args) {
    console.log(`[Socket.IO Emit] Event: ${event}, Data:`, args);
    return originalEmit.call(this, event, ...args);
};

// --- API Endpoints ---

// SYSTEMS API

// Get all systems
app.get("/api/systems", async (req, res) => {
    const [systems] = await db.execute("SELECT * FROM systems");
    res.json(systems);
});

// Get a specific system by ID
app.get("/api/systems/:id", async (req, res) => {
    const [systems] = await db.execute("SELECT * FROM systems WHERE id = ?", [req.params.id]);
    if (!systems.length) return res.sendStatus(404);
    res.json(systems[0]);
});

// Get all talkgroups for a specific system
app.get("/api/systems/:id/talkgroups", async (req, res) => {
    const [talkgroups] = await db.execute("SELECT * FROM talkgroups WHERE system_id = ?", [req.params.id]);
    res.json(talkgroups);
});

// Get a specific talkgroup by system ID and talkgroup ID
// Deprecated: use /api/talkgroups/:talkgroupID instead
app.get("/api/systems/:systemID/talkgroups/:talkgroupID", async (req, res) => {
    return res.status(400).json({error: "Use /talkgroups/:talkgroupID instead"});
    // const {systemID, talkgroupID} = req.params;
    // const [talkgroups] = await db.execute("SELECT * FROM talkgroups WHERE system_id = ? AND id = ?", [systemID, talkgroupID]);
    // if (!talkgroups.length) return res.sendStatus(404);
    // res.json(talkgroups[0]);
});


// --- Serve recordings for a talkgroup ---
app.get("/api/talkgroups/:talkgroupID/recordings", async (req, res) => {
    const {talkgroupID} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Get total count for pagination
        const [countResult] = await db.execute("SELECT COUNT(*) as total FROM recordings WHERE talkgroup_id = ?", [talkgroupID]);
        const totalPages = Math.ceil(countResult[0].total / limit);
        // Get recordings
        const [recordings] = await db.execute("SELECT * FROM recordings WHERE talkgroup_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", [talkgroupID, limit, offset]);
        res.json({
            recordings, page, totalPages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Server error"});
    }
});


// TALKGROUPS API


// Get all talkgroups
app.get("/api/talkgroups", async (req, res) => {
    const [talkgroups] = await db.execute("SELECT * FROM talkgroups");
    res.json(talkgroups);
});

// Get a specific talkgroup by ID (PK)
app.get("/api/talkgroups/:talkgroupID", async (req, res) => {
    const {talkgroupID} = req.params;
    const [talkgroups] = await db.execute("SELECT * FROM talkgroups WHERE id = ?", [talkgroupID]);
    if (!talkgroups.length) return res.sendStatus(404);
    res.json(talkgroups[0]);
});


// RECORDINGS API


// Disabled
app.get("/api/recordings", async (req, res) => {
    return res.status(400).json({error: "Use /systems/:systemID/talkgroups/:talkgroupID/recordings instead"});
    // const [recordings] = await db.execute("SELECT * FROM recordings ORDER BY created_at DESC LIMIT 100");
    // res.json(recordings);
});

// Get a specific recording by ID
app.get("/api/recordings/:recordingID", async (req, res) => {
    const {recordingID} = req.params;
    const [recordings] = await db.execute("SELECT * FROM recordings WHERE id = ?", [recordingID]);
    if (!recordings.length) return res.sendStatus(404);
    res.json(recordings[0]);
});

// Stream audio file for a recording
app.get("/api/recordings/:recordingID/audio", async (req, res) => {
    const {recordingID} = req.params;

    const [rows] = await db.execute("SELECT folder_path, filename FROM recordings WHERE id = ?", [recordingID]);

    if (!rows.length) return res.sendStatus(404);

    const recording = rows[0];
    const fullPath = path.join(recording.folder_path, recording.filename);

    // Set headers so browser can play it
    res.setHeader("Access-Control-Allow-Origin", "*"); // or your frontend URL
    res.setHeader("Content-Type", "audio/mpeg");

    res.sendFile(fullPath, (err) => {
        if (err) {
            console.error("Failed to send file:", err);
            res.sendStatus(500);
        }
    });
});

// - for Python and Node, : for Node and Vue
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("transcription-complete", async (data) => {
        const { recording_id, transcription } = data;
        try {
            await db.execute(
                "UPDATE recordings SET transcription = ? WHERE id = ?",
                [transcription, recording_id]
            );
            console.log(`Transcription saved for recording ${recording_id}`);

            // Optionally notify frontend
            io.emit("transcription:complete", {
                recording_id,
                transcription
            });
        } catch (err) {
            console.error("Failed to save transcription:", err);
        }
    });

    socket.on("transcription:request", (data) => { // From Vue -> Node -> Python
        console.log("Received transcription request:", data);
        // Broadcast to other clients (e.g., transcription service)
        io.emit("transcription-request", data);
    });
});



// --- Start server ---
httpServer.listen(3000, () => console.log("Server running on http://localhost:3000"));


/// --- Watch folder for new recordings ---
watcher.on("add", async (filepath) => {
    try {
        const parsed = path.parse(filepath);
        const filename = parsed.base;

        const segments = filepath.split(path.sep);
        // ...\Recordings\[DATE]\[Favorite]\[SYSTEM]\[TALKGROUP_ID]\File
        const dateFolder = segments[segments.length - 5];
        const favorite = segments[segments.length - 4];
        const systemName = segments[segments.length - 3];
        const tgidSegment = segments[segments.length - 2];
        const tgid = parseInt(tgidSegment, 10);
        const folderPath = path.join(...segments.slice(0, segments.length - 1));

        // --- Insert or get system safely ---
        const [systemResult] = await db.execute(
            `INSERT INTO systems (name)
             VALUES (?)
             ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
            [systemName]
        );
        const system_id = systemResult.insertId;

        // --- Insert or get talkgroup safely ---
        if (isNaN(tgid)) {
            console.warn("Invalid talkgroup ID:", tgidSegment);
            return;
        }

        const [tgResult] = await db.execute(
            `INSERT INTO talkgroups (tgid, system_id, name)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
            [tgid, system_id, `Talkgroup ${tgid}`]
        );
        const talkgroup_id = tgResult.insertId;

        // --- Check if recording already exists ---
        const [existing] = await db.execute(
            "SELECT id FROM recordings WHERE folder_path = ? AND filename = ? AND talkgroup_id = ? AND system_id = ?",
            [folderPath, filename, talkgroup_id, system_id]
        );

        // Check for existing recording
        if (existing.length) {
            console.log(`Recording already exists in DB: ${filepath}`);
            return;
        }

        const stats = await fs.promises.stat(filepath);

        const [insertResult] = await db.execute(
            `INSERT INTO recordings (talkgroup_id, system_id, folder_path, filename, created_at)
                 VALUES (?, ?, ?, ?, ?)`,
            [talkgroup_id, system_id, folderPath, filename, stats.birthtime]
        );
        let recording_id = insertResult.insertId;
        console.log(`New recording added: ${filepath} (ID: ${recording_id})`);

        // --- Notify frontend ---
        io.emit("recording:new", {
            talkgroup_id,
            tgid,
            system_id,
            folderPath,
            filename
        });

        // Technically this is an extra query we don't need all the time since we can tell if a TG has been created this run which defaults to false
        const [result] = await db.execute(`SELECT auto_transcribe FROM talkgroups WHERE id = ?`, [talkgroup_id]);

        // Check if this talkgroup is set for auto transcription
        if (result.length && result[0].auto_transcribe) {
            io.emit("transcription-request", { // By sending all id's, you don't have to make an additional query
                system_id,
                talkgroup_id,
                recording_id,
                folderPath,
                filename
            });
        }


    } catch (err) {
        console.error("Watcher error:", err);
    }
});
