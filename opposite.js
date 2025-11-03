// --- Perbaikan untuk SyntaxError ---
const axios = require('axios');
require('dotenv').config(); // Memuat variabel dari .env

// --- KONFIGURASI BOT NON-SENSITIF ---
const USER_URL = "https://motionmuse.ai/api/user";
const CLAIM_URL = "https://motionmuse.ai/subscription";
const NEXT_ACTION = "7fadadc55bc463c843700871cf2558bb32417d8102";
// ------------------------------------

// Ambil COOKIES dari .env
const COOKIES = process.env.COOKIES;

// Pastikan cookies ada sebelum menjalankan fungsi apapun
if (!COOKIES || COOKIES.length < 50) { 
    console.error("🚨 ERROR: Variabel lingkungan COOKIES tidak ditemukan atau string terlalu pendek. Cek file .env Anda.");
    process.exit(1); 
}

// 1. Fungsi Mendapatkan Data Pengguna
async function fetchData() {
    console.log("\n👤 Mencoba mengambil data pengguna menggunakan Cookies...");

    const headers = {
        "cookie": COOKIES, 
        "accept": "*/*",
        "referer": "https://motionmuse.ai/explore",
    };

    try {
        const response = await axios.get(USER_URL, { headers });
        console.log("✅ Status Permintaan User:", response.status);
        console.log("Data Pengguna Diterima (Otentikasi Cookie Berhasil):", response.data);
    } catch (error) {
        // ... (Error handling)
    }
}

// 2. Fungsi Daily Claim Free Credit
async function claimDailyCredit() {
    console.log("\n🚀 Mencoba melakukan Daily Claim Free Credit...");
    
    // ... (Logika claimDailyCredit di sini)

    const headers = {
        "cookie": COOKIES, 
        "accept": "text/x-component",
        "content-type": "text/plain;charset=UTF-8",
        "next-action": NEXT_ACTION, 
        "origin": "https://motionmuse.ai",
        "referer": "https://motionmuse.ai/explore",
        "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22subscription%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
    };

    const config = {
        method: 'post', 
        url: CLAIM_URL,
        headers: headers,
        data: '[]',
        validateStatus: (status) => status >= 200 && status < 400
    };

    try {
        const response = await axios(config);
        
        console.log(`\n✅ Permintaan Klaim Terkirim. Status: ${response.status}`);
        
        if (response.status === 200 || response.status === 204) {
             console.log("Status respons menunjukkan Klaim Berhasil.");
        } else if (response.status === 302) {
             console.log(`Status 302 Redirect. Klaim kemungkinan diproses.`);
        }

    } catch (error) {
        // ... (Error handling)
    }
}

// Jalankan bot
async function runBot() {
    await claimDailyCredit(); 
    await fetchData(); 
}

runBot();
