import QRCode from "qrcode";

export async function paymentQrDataUrl(address: string) {
  return QRCode.toDataURL(address, { errorCorrectionLevel: "M", margin: 1, width: 240 });
}
