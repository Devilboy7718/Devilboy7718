
const express = require('express');
const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const qrcode = require('qrcode');
const { unlinkSync, existsSync, writeFileSync } = require('fs');
const { join } = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_FILE_PATH = './session.json';

const { state, saveState } = useSingleFileAuthState(SESSION_FILE_PATH);

app.use(express.json());
app.use(express.static('public')); // Assuming your HTML file is in the public directory

let sock = makeWASocket({
    auth: state,
});

sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if (qr) {
        console.log('QR received:', qr);
    }
    if (connection === 'close') {
        console.log('Connection closed, reconnecting...');
        sock = makeWASocket({ auth: state });
    }
});

sock.ev.on('creds.update', saveState);

app.get('/generate-qr', (req, res) => {
    sock.ev.once('connection.update', (update) => {
        const { qr } = update;
        if (qr) {
            res.json({ qr });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${3000}`);
});
