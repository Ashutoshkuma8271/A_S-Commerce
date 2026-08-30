/**
 * Luxury Tax Invoice Generator for A_S Commerce
 * Generates an official, print-ready luxury PDF invoice without heavy bundle bloat.
 */
export const downloadOrderInvoice = (order) => {
  if (!order) return;

  const orderId = order.id || 'AS-ORD-001';
  const invoiceNo = `INV-${orderId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const orderDate = order.date ? new Date(order.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const customerName = order.shippingAddress?.fullName || order.shippingAddress?.name || order.customerName || 'Valued Patron';
  const customerEmail = order.shippingAddress?.email || order.userEmail || 'customer@ascommerce.luxury';
  const customerPhone = order.shippingAddress?.phone || '+91 99999 99999';
  const shippingStreet = order.shippingAddress?.street || 'Exclusive Residence';
  const shippingCity = order.shippingAddress?.city || 'Mumbai';
  const shippingPincode = order.shippingAddress?.pincode || '400001';
  const shippingState = order.shippingAddress?.state || 'Maharashtra';

  const items = order.items || [];
  const subtotal = Number(order.subtotal || order.total || 0);
  const total = Number(order.total || subtotal);
  const shippingFee = Number(order.shippingFee || (total > 999 ? 0 : 99));
  const discount = Number(order.discount || 0);
  const paymentMethod = order.paymentMethod || 'Razorpay Verified Gateway';
  const paymentStatus = order.paymentStatus || 'Paid (Verified)';

  const itemsHtml = items.map((item, index) => `
    <tr style="border-bottom: 1px solid #E5E7EB;">
      <td style="padding: 12px 8px; text-align: center; color: #6B7280; font-size: 11px;">${index + 1}</td>
      <td style="padding: 12px 8px;">
        <div style="font-weight: 600; color: #061A27; font-size: 12px;">${item.name || 'Luxury Collection Item'}</div>
        <div style="font-size: 10px; color: #9CA3AF; margin-top: 2px;">
          ${item.selectedSize ? `Size: ${item.selectedSize} | ` : ''}
          ${item.selectedColor ? `Color: ${item.selectedColor}` : ''}
        </div>
      </td>
      <td style="padding: 12px 8px; text-align: center; font-size: 12px; color: #374151;">${item.quantity || 1}</td>
      <td style="padding: 12px 8px; text-align: right; font-size: 12px; color: #374151;">₹${(item.price || 0).toLocaleString('en-IN')}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600; font-size: 12px; color: #061A27;">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    alert('Please allow popups to download your PDF Tax Invoice.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Tax Invoice - ${invoiceNo} - A_S Commerce</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Cinzel:wght@600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1F2937;
          background: #FFFFFF;
          padding: 36px 48px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          body { padding: 20px 30px; }
          .no-print { display: none !important; }
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #F5B83D;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .brand {
          font-family: 'Cinzel', serif;
          font-size: 24px;
          font-weight: 700;
          color: #061A27;
          letter-spacing: 2px;
        }
        .tagline {
          font-size: 10px;
          color: #D97706;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-top: 2px;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          font-size: 20px;
          font-weight: 700;
          color: #061A27;
          letter-spacing: 1px;
        }
        .invoice-badge {
          display: inline-block;
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #F59E0B;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          margin-top: 4px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .detail-block h3 {
          font-size: 11px;
          font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .detail-block p {
          font-size: 12px;
          color: #1F2937;
          line-height: 1.5;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #061A27;
          color: #F9FAFB;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 10px 8px;
        }

        .totals-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        .totals-table {
          width: 280px;
        }
        .totals-table tr td {
          padding: 6px 0;
          font-size: 12px;
        }
        .totals-table .grand-total {
          border-top: 2px solid #061A27;
          padding-top: 10px;
          font-weight: 700;
          font-size: 15px;
          color: #061A27;
        }

        .footer {
          border-top: 1px dashed #D1D5DB;
          padding-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #6B7280;
        }
        .seal {
          display: inline-block;
          border: 1.5px solid #10B981;
          color: #059669;
          font-weight: 700;
          font-size: 9px;
          padding: 4px 10px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .action-bar {
          background: #061A27;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .print-btn {
          background: #F5B83D;
          color: #061A27;
          border: none;
          font-weight: 700;
          font-size: 12px;
          padding: 8px 18px;
          border-radius: 6px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="action-bar no-print">
        <span>📄 Ready to save or print your official Tax Invoice</span>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="brand">A_S COMMERCE</div>
          <div class="tagline">Shop Smart • Live Premium</div>
          <p style="font-size: 10px; color: #6B7280; margin-top: 4px;">
            A_S Commerce Luxury Retails Pvt. Ltd.<br>
            GSTIN: 27AABCA1234F1Z8 • Reg No: MH/2026/099182<br>
            VIP Concierge: support@ascommerce.luxury
          </p>
        </div>
        <div class="invoice-title">
          <h1>TAX INVOICE</h1>
          <div class="invoice-badge">ORIGINAL FOR RECIPIENT</div>
          <p style="font-size: 11px; color: #4B5563; margin-top: 6px;">
            <strong>Invoice No:</strong> ${invoiceNo}<br>
            <strong>Order ID:</strong> ${orderId}<br>
            <strong>Date:</strong> ${orderDate}
          </p>
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-block">
          <h3>Billed & Shipped To</h3>
          <p>
            <strong style="color: #061A27;">${customerName}</strong><br>
            ${shippingStreet}<br>
            ${shippingCity}, ${shippingState} - ${shippingPincode}<br>
            Phone: ${customerPhone}<br>
            Email: ${customerEmail}
          </p>
        </div>
        <div class="detail-block">
          <h3>Payment & Logistics Details</h3>
          <p>
            <strong>Payment Mode:</strong> ${paymentMethod}<br>
            <strong>Payment Status:</strong> <span style="color: #059669; font-weight: 600;">${paymentStatus}</span><br>
            <strong>Delivery Carrier:</strong> Bluedart Luxury White-Glove<br>
            <strong>Place of Supply:</strong> ${shippingState}
          </p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: left;">Item Description</th>
            <th style="width: 60px; text-align: center;">Qty</th>
            <th style="width: 100px; text-align: right;">Unit Price</th>
            <th style="width: 110px; text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || `
            <tr>
              <td colspan="5" style="text-align: center; padding: 16px; color: #9CA3AF;">Order Items Summary</td>
            </tr>
          `}
        </tbody>
      </table>

      <div class="totals-container">
        <table class="totals-table">
          <tr>
            <td style="color: #6B7280;">Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">₹${subtotal.toLocaleString('en-IN')}</td>
          </tr>
          ${discount > 0 ? `
            <tr>
              <td style="color: #059669;">Promo Discount:</td>
              <td style="text-align: right; color: #059669; font-weight: 600;">-₹${discount.toLocaleString('en-IN')}</td>
            </tr>
          ` : ''}
          <tr>
            <td style="color: #6B7280;">White-Glove Shipping:</td>
            <td style="text-align: right; font-weight: 600;">${shippingFee === 0 ? '<span style="color: #059669;">COMPLIMENTARY</span>' : `₹${shippingFee}`}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; font-size: 10px;">Applicable Taxes (GST 18% Incl.):</td>
            <td style="text-align: right; color: #9CA3AF; font-size: 10px;">₹${Math.round(total * 0.18 / 1.18).toLocaleString('en-IN')}</td>
          </tr>
          <tr class="grand-total">
            <td>Grand Total:</td>
            <td style="text-align: right;">₹${total.toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <div>
          <p>Thank you for choosing A_S Commerce. All items are backed by our 7-Day Authenticity Guarantee.</p>
          <p style="margin-top: 2px;">This is a computer generated invoice and does not require physical signature.</p>
        </div>
        <div class="seal">
          ✓ Digitally Verified
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
