/** Public brand contacts — Big ITunes Collection */
export const BRAND = {
  name: 'Big ITunes Collection',
  /** One sentence shoppers should remember */
  tagline: 'Lagos-ready polish for women who don’t dress down.',
  promise:
    'Elevated Nigerian women’s fashion — confident, feminine, and made for real life from Lagos to Abuja.',
  email: 'hello@bigitunes.com',
  phoneDisplay: '+234 814 920 1929',
  /** Digits only for wa.me links */
  whatsappE164: '2348149201929',
  tiktokHandle: 'itunesbrownie01',
  tiktokUrl: 'https://www.tiktok.com/@itunesbrownie01',
  instagramUrl: 'https://www.instagram.com/',
  location: 'Lagos · Nigeria',
  /** Free returns window shown on product pages */
  returnWindowDays: 7,
  /** Update these to your real account before launch */
  bank: {
    bankName: 'Opay / Your Bank',
    accountName: 'Big ITunes Collection',
    accountNumber: '8149201929',
  },
} as const

export function whatsappUrl(prefilledMessage?: string): string {
  const base = `https://wa.me/${BRAND.whatsappE164}`
  if (!prefilledMessage) return base
  return `${base}?text=${encodeURIComponent(prefilledMessage)}`
}

export function productWhatsAppMessage(product: {
  name: string
  price: number
  size?: string
}): string {
  const sizeLine = product.size ? `Size: ${product.size}\n` : ''
  return (
    `Hi Big ITunes Collection! 💕\n` +
    `I want to order:\n` +
    `• ${product.name}\n` +
    sizeLine +
    `Price: ₦${product.price.toLocaleString('en-NG')}\n` +
    `Please confirm availability. Thank you!`
  )
}

export function orderWhatsAppMessage(order: {
  id: string
  customer: { name: string; phone: string; city?: string; state?: string }
  total: number
  items?: { name: string; size: string; quantity: number }[]
  paymentMethod?: string
  paymentStatus?: string
}): string {
  const lines =
    order.items
      ?.map((i) => `• ${i.name} (${i.size}) × ${i.quantity}`)
      .join('\n') ?? ''
  const isTransfer = order.paymentMethod === 'transfer'
  const hasProof = order.paymentStatus === 'proof_sent'

  let payBlock: string
  if (isTransfer) {
    payBlock = hasProof
      ? `Payment: Bank transfer\nI uploaded proof on the website.\n👉 Please also find my RECEIPT / TRANSFER SCREENSHOT attached in this chat (I will send the image now).`
      : `Payment: Bank transfer\nAmount: ₦${order.total.toLocaleString('en-NG')}\n👉 Please OPEN THIS CHAT and ATTACH my bank transfer RECEIPT / SCREENSHOT so you can confirm payment.`
  } else if (order.paymentMethod === 'paystack') {
    payBlock = 'Payment: Paystack (card / bank)'
  } else if (order.paymentMethod === 'whatsapp') {
    payBlock = 'Payment: Confirm on WhatsApp'
  } else {
    payBlock = 'Payment: To confirm'
  }

  return (
    `Hi Big ITunes! I just placed order ${order.id}.\n\n` +
    `Name: ${order.customer.name}\n` +
    `Phone: ${order.customer.phone}\n` +
    (order.customer.city
      ? `Location: ${order.customer.city}${order.customer.state ? `, ${order.customer.state}` : ''}\n`
      : '') +
    (lines ? `\nItems:\n${lines}\n` : '') +
    `\nTotal: ₦${order.total.toLocaleString('en-NG')}\n` +
    `${payBlock}\n\n` +
    (isTransfer
      ? `Thank you! 💕 (Tap 📎 or the gallery icon to attach the receipt photo.)`
      : `Please confirm my order. Thank you! 💕`)
  )
}

/** Admin → customer: request payment receipt in WhatsApp */
export function requestReceiptWhatsAppMessage(order: {
  id: string
  customer: { name: string }
  total: number
}): string {
  return (
    `Hi ${order.customer.name} 💕\n` +
    `This is Big ITunes Collection about order ${order.id}.\n\n` +
    `Please reply with your bank transfer RECEIPT / SCREENSHOT for ₦${order.total.toLocaleString('en-NG')} so we can confirm payment and pack your order.\n\n` +
    `Thank you!`
  )
}

export function generalOrderWhatsAppMessage(): string {
  return 'Hi Big ITunes Collection! I want to place / follow up on an order.'
}
