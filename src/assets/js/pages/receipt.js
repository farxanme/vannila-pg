/**
 * Receipt Page Script
 */
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { shareContent } from '../utils/share.js';
import { getNumberLocaleForLang } from '../utils/localeHelpers.js';
import { i18n } from '../main.js';

let header, footer;
/** Last rendered receipt payload (for language refresh). */
let lastReceiptData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('receipt-card')) {
    return;
  }

  await initializePage();
});

async function initializePage() {
  await i18n.readyPromise;

  header = new Header({
    title: i18n.t('header.title'),
    logo: '/assets/images/logo-shaparak.svg',
    secondaryLogo: '/assets/images/logo.svg',
    showCard: false,
  });

  footer = new Footer({
    logo: '/assets/images/logo.svg',
    supportPrefix: i18n.t('footer.supportPrefix'),
    supportPhone: i18n.t('footer.supportPhone'),
    copyright: i18n.t('footer.copyright'),
  });

  // Load receipt data from URL params or storage
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('id') || '123456789';
  const status = urlParams.get('status') || 'success';

  // Update receipt content (demo payload; real API can set useDemoCopy: false and pass strings)
  updateReceiptContent({
    id: transactionId,
    status: status,
    amount: 100000,
    useDemoCopy: true,
    dateMs: Date.now(),
    cardNumber: '****1234',
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
    footer.updateSupportPrefix(i18n.t('footer.supportPrefix'));
    footer.updateSupportPhone(i18n.t('footer.supportPhone'));
  }
  i18n.applyDataI18n(document);
  const shareBtn = document.getElementById('share-button');
  const saveBtn = document.getElementById('save-button');
  if (shareBtn) shareBtn.setAttribute('aria-label', i18n.t('receipt.share'));
  if (saveBtn) saveBtn.setAttribute('aria-label', i18n.t('receipt.save'));
  if (lastReceiptData) {
    updateReceiptContent(lastReceiptData);
  }
}

function updateReceiptContent(data) {
  lastReceiptData = { ...data };
  const locale = getNumberLocaleForLang(i18n.getLanguage());
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
  statusBadge.textContent =
    data.status === 'success' ? i18n.t('receipt.success') : i18n.t('receipt.failed');

  title.textContent =
    data.status === 'success' ? i18n.t('receipt.success') : i18n.t('receipt.failed');
  subtitle.textContent =
    data.status === 'success'
      ? i18n.t('receipt.paymentSuccessDesc')
      : i18n.t('receipt.paymentFailedDesc');

  amount.textContent = `${data.amount.toLocaleString(locale)} ${i18n.t('transaction.rial')}`;
  transactionId.textContent = data.id;
  transactionDate.textContent =
    typeof data.dateMs === 'number' ? new Date(data.dateMs).toLocaleString(locale) : data.date;
  cardNumber.textContent = data.cardNumber;
  merchantName.textContent = data.useDemoCopy
    ? i18n.t('transaction.demo.merchantName')
    : data.merchant;
  type.textContent = data.useDemoCopy ? i18n.t('receipt.demo.transactionType') : data.type;
}

function attachEvents() {
  const shareButton = document.getElementById('share-button');
  const saveButton = document.getElementById('save-button');
  const receiptCard = document.getElementById('receipt-card');

  shareButton.addEventListener('click', async () => {
    const receiptText = generateReceiptText();
    const success = await shareContent({
      text: receiptText,
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
      text: i18n.t('receipt.shareText'),
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
${i18n.t('receipt.plain.amount')} ${amount}
${i18n.t('receipt.plain.merchant')} ${merchant}
${i18n.t('receipt.plain.transactionId')} ${transactionId}
${i18n.t('receipt.plain.date')} ${date}
  `.trim();
}
