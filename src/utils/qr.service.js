import QRCode from "qrcode";

export async function generateQRCode(data) {
  return QRCode.toDataURL(data); // returns base64 image string
}
