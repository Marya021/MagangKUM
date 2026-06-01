import jsPDF from "jspdf";
import certificateBg from "@/assets/certificate-bg.png";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatTanggalIndonesia(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTanggalPadded(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

interface CertificateData {
  fullName: string;
  startDate: string;
  endDate: string;
  supervisorName?: string | null;
}

async function loadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateCertificatePdf(data: CertificateData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  const bgData = await loadImage(certificateBg);
  doc.addImage(bgData, "PNG", 0, 0, W, H);

  const cx = W / 2;
  const darkBlue = [20, 50, 100] as const;

  doc.setFillColor(255, 255, 255);
  doc.rect(40, 90, 217, 105, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...darkBlue);
  doc.text(data.fullName.toUpperCase(), cx, 105, { align: "center" });

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.6);
  doc.line(75, 112, 222, 112);

  const startFormatted = formatTanggalPadded(data.startDate);
  const endFormatted = formatTanggalPadded(data.endDate);

  const line1 = `Telah mengikuti kegiatan magang terhitung sejak tanggal ${startFormatted}`;
  const line2 = `sampai dengan ${endFormatted} dan dinyatakan `;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(16);
  doc.setTextColor(...darkBlue);
  doc.text(line1, cx, 122, { align: "center" });
  doc.text(line2, cx, 128, { align: "center" });

  const textWidth = doc.getTextWidth(line2);
  doc.setFont("helvetica", "bolditalic");
  doc.text("Kompeten", cx + textWidth / 2, 128, { align: "left" });

  const today = new Date();
  const todayFormatted = `${String(today.getDate()).padStart(2, "0")} ${BULAN[today.getMonth()]} ${today.getFullYear()}`;

  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(11);
  doc.setTextColor(...darkBlue);
  doc.text(`Pekanbaru, ${todayFormatted}`, cx, 145, { align: "center" });

  const supervisorLabel = data.supervisorName || "PEMBIMBING (NAMA)";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...darkBlue);
  doc.text(supervisorLabel.toUpperCase(), cx, 178, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("NIP Pembimbing", cx, 185, { align: "center" });

  return doc;
}
