import { Booking } from '@/types/cleaning';

export interface EmailDispatchRecord {
  id: string;
  to: string;
  type: 'customer_confirmation' | 'admin_alert';
  subject: string;
  sentAt: string;
  htmlContent: string;
}

export const generateCustomerEmailHtml = (booking: Booking): string => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">PureSpace</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Your Booking is Confirmed</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 15px; color: #334155; margin-top: 0;">Hi <strong>${booking.customer.name}</strong>,</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
          Your home cleaning has been confirmed! A 5-star verified pro will arrive at your home during the scheduled window.
        </p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Booking Details (${booking.id})</h3>
          <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Date & Time:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a;">${booking.date} (${booking.timeSlot})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Package:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a; text-transform: capitalize;">${booking.serviceType.replace('_', ' ')} Clean</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Home Layout:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a;">${booking.rooms.bedrooms} Bed, ${booking.rooms.bathrooms} Bath</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Location:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a;">${booking.address.street}, ${booking.address.postcode}</td>
            </tr>
            ${booking.access.lockboxCode ? `
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #059669;">Lockbox Code:</td>
              <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: 700; color: #059669;">${booking.access.lockboxCode}</td>
            </tr>
            ` : ''}
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 10px 0 0 0; font-weight: 700; font-size: 14px; color: #0f172a;">Total (Pay on completion):</td>
              <td style="padding: 10px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #059669;">$${booking.totalPrice.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; margin: 16px 0; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #065f46; font-weight: 600;">
            ✨ PureSpace 72-Hour Free Re-Clean Guarantee Included
          </p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          You can check live room checklists or reschedule anytime with 1 click using your registered email: <strong>${booking.customer.email}</strong>.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        PureSpace Technologies Inc. • Support: support@purespace.app
      </div>
    </div>
  `;
};

export const generateAdminEmailHtml = (booking: Booking): string => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0f172a; padding: 20px; text-align: center; color: #ffffff;">
        <span style="background: #10b981; color: #022c22; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Admin Notification</span>
        <h2 style="margin: 8px 0 0 0; font-size: 20px;">🚨 New Booking Received (#${booking.id})</h2>
      </div>
      <div style="padding: 24px;">
        <h3 style="margin-top: 0; font-size: 15px; color: #0f172a;">Customer Information</h3>
        <ul style="font-size: 13px; color: #334155; line-height: 1.6; padding-left: 20px;">
          <li><strong>Name:</strong> ${booking.customer.name}</li>
          <li><strong>Email:</strong> ${booking.customer.email}</li>
          <li><strong>Phone:</strong> ${booking.customer.phone}</li>
          <li><strong>Address:</strong> ${booking.address.street}, ${booking.address.postcode}</li>
          ${booking.customer.notes ? `<li><strong>Notes:</strong> "${booking.customer.notes}"</li>` : ''}
        </ul>

        <h3 style="font-size: 15px; color: #0f172a; margin-top: 20px;">Job & Financials</h3>
        <ul style="font-size: 13px; color: #334155; line-height: 1.6; padding-left: 20px;">
          <li><strong>Date:</strong> ${booking.date} (${booking.timeSlot})</li>
          <li><strong>Service:</strong> ${booking.serviceType} (${booking.frequency})</li>
          <li><strong>Gross Revenue:</strong> $${booking.totalPrice.toFixed(2)}</li>
          <li><strong>Cleaner Net Payout (85%):</strong> $${(booking.totalPrice * 0.85).toFixed(2)}</li>
          <li><strong>Assigned Pro:</strong> ${booking.cleaner?.name || 'Pending dispatch'}</li>
        </ul>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="font-size: 12px; color: #64748b;">
            Logged in Admin Center. Cleaner has been notified via automatic SMS dispatch.
          </p>
        </div>
      </div>
    </div>
  `;
};

export const dispatchBookingEmails = (booking: Booking): { customerEmail: EmailDispatchRecord; adminEmail: EmailDispatchRecord } => {
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const customerEmail: EmailDispatchRecord = {
    id: `email-cust-${Date.now()}`,
    to: booking.customer.email,
    type: 'customer_confirmation',
    subject: `Booking Confirmed #${booking.id} - PureSpace Cleaning for ${booking.date}`,
    sentAt: nowStr,
    htmlContent: generateCustomerEmailHtml(booking)
  };

  const adminEmail: EmailDispatchRecord = {
    id: `email-admin-${Date.now()}`,
    to: 'admin@purespace.app',
    type: 'admin_alert',
    subject: `🚨 [New Order] #${booking.id} - ${booking.customer.name} ($${booking.totalPrice.toFixed(2)})`,
    sentAt: nowStr,
    htmlContent: generateAdminEmailHtml(booking)
  };

  return { customerEmail, adminEmail };
};
