/**
 * Receipt Page Script
 */
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { shareContent } from '../utils/share.js';
import { i18n } from '../main.js';

let header, footer;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await initializePage();
});

async function initializePage() {
  await i18n.readyPromise;

  header = new Header({
    title: i18n.t('header.title'),
    logo: '/assets/images/logo-shaparak.svg',
    secondaryLogo: '/assets/images/logo.svg',
    showCard: false
  });

  footer = new Footer({
    logo: '/assets/images/logo.svg',
    copyright: i18n.t('footer.copyright')
  });

  // Load receipt data from URL params or storage
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('id') || '123456789';
  const status = urlParams.get('status') || 'success';

  // Update receipt content
  updateReceiptContent({
    id: transactionId,
    status: status,
    amount: 100000,
    merchant: 'فروشگاه نمونه',
    date: new Date().toLocaleString('fa-IR'),
    cardNumber: '****1234',
    type: 'خرید'
  });

  attachEvents();
  updateReceiptLanguage();
  document.addEventListener('languageChange', updateReceiptLanguage);
}

function updateReceiptLanguage() {
  if (header) {
    header.updateTitle(i18n.t('header.title'));
  }
  if (footer) {
    footer.updateCopyright(i18n.t('footer.copyright'));
  }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = i18n.t(key);
  });
  const shareBtn = document.getElementById('share-button');
  const saveBtn = document.getElementById('save-button');
  if (shareBtn) shareBtn.setAttribute('aria-label', i18n.t('receipt.share'));
  if (saveBtn) saveBtn.setAttribute('aria-label', i18n.t('receipt.save'));
}

function updateReceiptContent(data) {
  const statusBadge = document.getElementById('receipt-status-badge');
  const title = document.getElementById('receipt-title');
  const subtitle = document.getElementById('receipt-subtitle');
  const amount = document.getElementById('receipt-amount');
  const type = document.getElementById('receipt-type');
  const transactionId = document.getElementById('transaction-id');
  const transactionDate = document.getElementById('transaction-date');
  const cardNumber = document.getElementById('card-number');
  const merchantName = document.getElementById('merchant-name');

  // Update status
  statusBadge.className = `badge badge-${data.status === 'success' ? 'success' : 'danger'}`;
  statusBadge.textContent = data.status === 'success' ? i18n.t('receipt.success') : i18n.t('receipt.failed');

  title.textContent = data.status === 'success' ? i18n.t('receipt.success') : i18n.t('receipt.failed');
  subtitle.textContent = data.status === 'success' ? i18n.t('receipt.paymentSuccessDesc') : i18n.t('receipt.paymentFailedDesc');

  amount.textContent = `${data.amount.toLocaleString()} ریال`;
  type.textContent = data.type;
  transactionId.textContent = data.id;
  transactionDate.textContent = data.date;
  cardNumber.textContent = data.cardNumber;
  merchantName.textContent = data.merchant;
}

function attachEvents() {
  const shareButton = document.getElementById('share-button');
  const saveButton = document.getElementById('save-button');
  const receiptCard = document.getElementById('receipt-card');

  shareButton.addEventListener('click', async () => {
    const receiptText = generateReceiptText();
    const success = await shareContent({
      text: receiptText
    });

    if (!success) {
      const { copyToClipboard } = await import('../utils/clipboard.js');
      await copyToClipboard(receiptText);
      alert(i18n.t('receipt.copied'));
    }
  });

  saveButton.addEventListener('click', async () => {
    const success = await shareContent({
      element: receiptCard,
      text: i18n.t('receipt.shareText')
    });

    if (!success) {
      alert(i18n.t('receipt.saveError'));
    }
  });
}

function generateReceiptText() {
  const title = document.getElementById('receipt-title').textContent;
  const amount = document.getElementById('receipt-amount').textContent;
  const merchant = document.getElementById('merchant-name').textContent;
  const transactionId = document.getElementById('transaction-id').textContent;
  const date = document.getElementById('transaction-date').textContent;

  return `
${title}
مبلغ: ${amount}
پذیرنده: ${merchant}
شماره تراکنش: ${transactionId}
تاریخ: ${date}
  `.trim();
}
