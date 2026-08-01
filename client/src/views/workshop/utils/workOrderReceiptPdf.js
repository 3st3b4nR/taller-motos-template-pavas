import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { STATUS_LABELS } from './workOrderStatus';

const ORANGE = [241, 145, 0];
const INK = [30, 37, 48];
const MUTED = [92, 103, 116];
const LIGHT = [245, 247, 250];
const BORDER = [222, 226, 232];

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const valueOrDash = (value) => {
  const normalized = String(value ?? '').trim();
  return normalized || '—';
};

const safeFilePart = (value) =>
  String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sin-placa';

const drawField = (doc, label, value, x, y, width) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), x, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(valueOrDash(value), width);
  doc.text(lines, x, y + 5);
};

const drawSectionTitle = (doc, title, y) => {
  doc.setFillColor(...ORANGE);
  doc.roundedRect(14, y - 4, 3, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(title, 21, y + 1);
};

const drawFooter = (doc) => {
  const pages = doc.getNumberOfPages();

  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...BORDER);
    doc.line(14, 282, 196, 282);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('PAVAS S.A.S. · Taller de motos', 14, 287);
    doc.text(`Página ${page} de ${pages}`, 196, 287, { align: 'right' });
  }
};

export const createWorkOrderReceiptPdf = (order) => {
  if (!order) throw new Error('No hay información de la orden para generar el recibo.');

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const bike = order.bike ?? {};
  const client = bike.client ?? {};
  const items = Array.isArray(order.items) ? order.items : [];

  doc.setFillColor(...INK);
  doc.rect(0, 0, 210, 31, 'F');
  doc.setFillColor(...ORANGE);
  doc.roundedRect(14, 8, 14, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('P', 21, 18.5, { align: 'center' });
  doc.setFontSize(18);
  doc.text('PAVAS', 33, 15.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('TALLER DE MOTOS', 33, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RECIBO DE SERVICIO', 196, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Orden #${valueOrDash(order.id)}`, 196, 20, { align: 'right' });
  doc.text(`Estado: ${STATUS_LABELS[order.status] ?? valueOrDash(order.status)}`, 196, 25, { align: 'right' });

  drawSectionTitle(doc, 'Datos del cliente y la moto', 41);
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, 47, 182, 40, 2, 2, 'FD');

  drawField(doc, 'Cliente', client.name, 20, 55, 51);
  drawField(doc, 'Teléfono', client.phone, 76, 55, 48);
  drawField(doc, 'Correo electrónico', client.email, 130, 55, 60);
  drawField(doc, 'Placa', bike.plate, 20, 72, 33);
  drawField(doc, 'Marca', bike.brand, 59, 72, 36);
  drawField(doc, 'Modelo', bike.model, 101, 72, 43);
  drawField(doc, 'Cilindraje', bike.cylinder, 150, 72, 40);

  drawSectionTitle(doc, 'Motivo de ingreso', 99);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(14, 105, 182, 26, 2, 2, 'FD');
  drawField(doc, 'Fecha de ingreso', order.entryDate, 20, 113, 42);
  drawField(doc, 'Falla o solicitud reportada', order.faultDescription, 68, 113, 122);

  drawSectionTitle(doc, 'Trabajos realizados y repuestos', 143);

  const tableRows = items.length
    ? items.map((item) => {
        const quantity = Number(item.count) || 0;
        const unitValue = Number(item.unitValue) || 0;
        return [
          item.type === 'MANO_OBRA' ? 'Mano de obra' : 'Repuesto',
          valueOrDash(item.description),
          quantity,
          money(unitValue),
          money(quantity * unitValue),
        ];
      })
    : [['—', 'Sin trabajos o repuestos registrados.', '—', '—', money(0)]];

  autoTable(doc, {
    startY: 149,
    margin: { left: 14, right: 14, bottom: 27 },
    head: [['Tipo', 'Descripción', 'Cant.', 'Valor unitario', 'Subtotal']],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3.2,
      lineColor: BORDER,
      lineWidth: 0.2,
      textColor: INK,
      valign: 'middle',
    },
    headStyles: {
      fillColor: INK,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 31 },
      1: { cellWidth: 69 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
  });

  let totalY = (doc.lastAutoTable?.finalY ?? 160) + 10;
  if (totalY > 258) {
    doc.addPage();
    totalY = 28;
  }

  doc.setFillColor(...ORANGE);
  doc.roundedRect(121, totalY, 75, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text('TOTAL', 127, totalY + 7);
  doc.setFontSize(15);
  doc.text(money(order.total), 190, totalY + 12, { align: 'right' });

  const noteY = totalY + 27;
  if (noteY < 274) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text('Este documento resume el servicio registrado para la motocicleta indicada.', 14, noteY);
  }

  drawFooter(doc);
  return doc;
};

export const downloadWorkOrderReceiptPdf = (order) => {
  const doc = createWorkOrderReceiptPdf(order);
  const filename = `recibo-orden-${order.id}-${safeFilePart(order.bike?.plate)}.pdf`;
  doc.save(filename);
};
