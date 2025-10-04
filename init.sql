use radiospy;

DROP TABLE IF EXISTS recordings;
-- # DROP TABLE IF EXISTS talkgroups;
-- # DROP TABLE IF EXISTS systems;

-- ----------------------
-- Systems Table
-- ----------------------
CREATE TABLE IF NOT EXISTS systems
(
    id         INT AUTO_INCREMENT PRIMARY KEY, -- internal PK
    name       VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ----------------------
-- Talkgroups Table
-- ----------------------
CREATE TABLE IF NOT EXISTS talkgroups
(
    id         INT AUTO_INCREMENT PRIMARY KEY,        -- internal PK (talkgroupPK)
    tgid       INT NOT NULL,                          -- P25 ID (safeTalkgroupID)
    system_id  INT NOT NULL,
    name       VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_system_talkgroup (system_id, tgid), -- prevents duplicates per system
    auto_transcribe BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (system_id) REFERENCES systems (id) ON DELETE CASCADE
);

-- ----------------------
-- Recordings Table
-- ----------------------
CREATE TABLE IF NOT EXISTS recordings
(
    id           INT AUTO_INCREMENT PRIMARY KEY, -- internal PK for recordings
    talkgroup_id INT NOT NULL,                   -- FK to talkgroups.id
    system_id    INT NOT NULL,                   -- FK to systems.id (optional but useful for joins)
    folder_path  TEXT,
    filename     VARCHAR(255),
    transcription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (talkgroup_id) REFERENCES talkgroups (id) ON DELETE CASCADE,
    FOREIGN KEY (system_id) REFERENCES systems (id) ON DELETE CASCADE
);