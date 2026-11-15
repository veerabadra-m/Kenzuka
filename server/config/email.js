
import nodemailer from 'nodemailer'

const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_APP_PASSWORD

  if (!emailUser || !emailPassword) {
    throw new Error('Email credentials are missing from the environment configuration.')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  })
}

// Escape dynamic values before inserting them into HTML emails.
const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character]
  })

const formatPrice = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)

const getOrderDetails = (order) => {
  const items = (order.orderItems || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #333">
            ${escapeHtml(item.name)}
            <br />
            <span style="color:#999;font-size:12px">
              Size: ${escapeHtml(item.size)} | Qty: ${item.quantity}
            </span>
          </td>
          <td style="padding:12px;border-bottom:1px solid #333;text-align:right">
            ${formatPrice(item.price * item.quantity)}
          </td>
        </tr>
      `
    )
    .join('')

  const address = order.shippingAddress || {}

  return `
    <div style="margin:24px 0">
      <h3 style="color:#f4ae21">ORDER SUMMARY</h3>
      <table style="width:100%;border-collapse:collapse;color:#fff">
        ${items}
        <tr>
          <td style="padding:12px">Items total</td>
          <td style="padding:12px;text-align:right">${formatPrice(order.itemsPrice)}</td>
        </tr>
        <tr>
          <td style="padding:12px">Delivery fee</td>
          <td style="padding:12px;text-align:right">${formatPrice(order.deliveryFee)}</td>
        </tr>
        <tr>
          <td style="padding:12px;color:#f4ae21;font-weight:bold">TOTAL</td>
          <td style="padding:12px;text-align:right;color:#f4ae21;font-weight:bold">
            ${formatPrice(order.totalPrice)}
          </td>
        </tr>
      </table>
    </div>

    <div style="margin:24px 0;color:#ccc">
      <h3 style="color:#f4ae21">DELIVERY DETAILS</h3>
      <p>
        ${escapeHtml(address.fullName)}<br />
        ${escapeHtml(address.address)}<br />
        ${escapeHtml(address.city)} - ${escapeHtml(address.pincode)}<br />
        Phone: ${escapeHtml(address.phone)}
      </p>
      <p>Payment method: ${escapeHtml(order.paymentMethod)}</p>
    </div>
  `
}

const sendBrandedEmail = async ({
  to,
  subject,
  heading,
  message,
  order,
  extraDetails = '',
}) => {
  if (!to) {
    throw new Error('Recipient email address is missing.')
  }

  const emailUser = process.env.EMAIL_USER
  const transporter = getTransporter()

  const html = `
    <div style="background:#080908;padding:30px 12px;font-family:Arial,sans-serif;color:#fff">
      <div style="max-width:600px;margin:auto;background:#111;padding:28px;border:1px solid #333">
        <h1 style="color:#f4ae21;letter-spacing:5px;text-align:center">
          KENZUKA
        </h1>
        <p style="text-align:center;color:#999;letter-spacing:2px">
          NOT MADE TO BLEND
        </p>
        <hr style="border:0;border-top:1px solid #333;margin:24px 0" />

        <h2 style="color:#f4ae21">${escapeHtml(heading)}</h2>
        <p style="color:#ddd;line-height:1.7">${escapeHtml(message)}</p>

        ${extraDetails}

        <p style="color:#999">Order reference: ${escapeHtml(order._id)}</p>
        ${getOrderDetails(order)}

        <hr style="border:0;border-top:1px solid #333;margin:24px 0" />
        <p style="text-align:center;color:#999;font-size:12px">
          Thank you for choosing KENZUKA.<br />
          Strength in style. Confidence in every move.
        </p>
      </div>
    </div>
  `

  return transporter.sendMail({
    from: `"KENZUKA" <${emailUser}>`,
    to,
    subject,
    html,
    text: `${heading}\n${message}\nOrder reference: ${order._id}\nTotal: ${formatPrice(order.totalPrice)}`,
  })
}

// Existing customer OTP email — preserved.
export const sendOtpEmail = async (to, otp) => {
  const transporter = getTransporter()
  const emailUser = process.env.EMAIL_USER

  return transporter.sendMail({
    from: `"KENZUKA" <${emailUser}>`,
    to,
    subject: 'Your KENZUKA verification code',
    text: `Your KENZUKA verification code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px">
        <h2>Welcome to KENZUKA</h2>
        <p>Your email verification code is:</p>
        <h1 style="letter-spacing:8px">${escapeHtml(otp)}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>Please do not share this code with anyone.</p>
      </div>
    `,
  })
}

// Customer: order placed successfully.
export const sendOrderConfirmationEmail = async (to, order) =>
  sendBrandedEmail({
    to,
    subject: 'KENZUKA — Your order is confirmed!',
    heading: 'ORDER CONFIRMED',
    message: 'Thank you for shopping with KENZUKA. We have successfully received your order.',
    order,
  })

// Admin: new customer order received.
export const sendAdminNewOrderEmail = async (order, customer) =>
  sendBrandedEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'KENZUKA — New order received',
    heading: 'NEW ORDER RECEIVED',
    message: `A new order has been placed by ${customer.name} (${customer.email}).`,
    order,
  })

// Customer: order status changed.
export const sendOrderStatusEmail = async (to, order) =>
  sendBrandedEmail({
    to,
    subject: `KENZUKA — Your order is ${order.orderStatus}`,
    heading: `ORDER ${String(order.orderStatus).toUpperCase()}`,
    message: `Your KENZUKA order status has been updated to ${order.orderStatus}.`,
    order,
  })
