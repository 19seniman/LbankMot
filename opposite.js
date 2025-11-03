import 'dotenv/config'; 
import axios from 'axios';

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
    process.exit(1); // Hentikan skrip
}

## 1. Fungsi Mendapatkan Data Pengguna (Menggunakan Cookies)

async function fetchData() {
    console.log("\n👤 Mencoba mengambil data pengguna menggunakan Cookies...");

    const headers = {
        // Otorisasi sekarang menggunakan header Cookie
        "cookie": COOKIES, 
        "accept": "*/*",
        "referer": "https://motionmuse.ai/explore",
    };

    try {
        const response = await axios.get(USER_URL, { headers });
        console.log("✅ Status Permintaan User:", response.status);
        console.log("Data Pengguna Diterima (Otentikasi Cookie Berhasil):", response.data);
    } catch (error) {
        console.error("\n❌ Gagal mengambil data pengguna:");
        if (error.response) {
            console.error(`Status: ${error.response.status} (401 atau 403 kemungkinan Cookie kedaluwarsa)`);
        } else {
            console.error(error.message);
        }
    }
}

---

## 2. Fungsi Daily Claim Free Credit (Menggunakan Cookies)

async function claimDailyCredit() {
    console.log("\n🚀 Mencoba melakukan Daily Claim Free Credit...");
    
    const headers = {
        // Menggunakan Cookie yang sama
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
        console.error("\n❌ Gagal melakukan Daily Claim:");
        if (error.response) {
            console.error(`Status: ${error.response.status} (400 kemungkinan sudah diklaim hari ini)`);
            console.error(`Respons Error:`, error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

// Jalankan bot: Klaim dulu, lalu cek data pengguna untuk verifikasi
async function runBot() {
    await claimDailyCredit(); 
    await fetchData(); 
}

runBot();
