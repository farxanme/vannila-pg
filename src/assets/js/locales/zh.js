/**
 * Chinese (Simplified) Translations
 * Falls back to English for keys not explicitly translated.
 */
import en from './en.js';

export default {
  ...en,

  // Header
  'header.title': '网络支付网关',

  // Common
  'common.cancel': '取消',
  'common.close': '关闭',
  'common.help': '帮助',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.clear': '清除',
  'common.processing': '处理中...',
  'common.loading': '加载中...',

  // Accessibility
  'accessibility.selectLanguage': '选择语言',
  'accessibility.openSettings': '设置',

  // Form
  'form.title': '请输入您的银行卡信息',
  'form.pay': '支付',
  'form.cancel': '取消',
  'form.getOtp': '获取动态密码',
  'form.pay.processing': '正在连接银行...',

  // Receipt
  'receipt.success': '扣款成功',
  'receipt.failed': '扣款失败',
  'receipt.merchant': '商户',
  'receipt.terminal': '终端',
  'receipt.share': '分享',
  'receipt.save': '保存到相册',
  'receipt.paymentSuccessDesc': '已成功从银行卡完成扣款。',
  'receipt.paymentFailedDesc': '未能从银行卡完成扣款。',
  'receipt.copied': '回执内容已复制',
  'receipt.saveError': '保存回执时出错',
  'receipt.shareText': '交易回执',
  'receipt.download': '下载回执',
  'receipt.status': '交易状态',
  'receipt.statusSuccessDetail': '已成功从银行卡完成扣款',
  'receipt.statusFailedDetail': '未能从银行卡完成扣款',
  'receipt.plain.amount': '金额:',
  'receipt.plain.merchant': '商户:',
  'receipt.plain.transactionId': '交易号:',
  'receipt.plain.date': '日期:',
  'receipt.plain.card': '卡号:',
  'receipt.sectionMerchant': '商户信息',
  'receipt.sectionTransaction': '交易信息',
  'receipt.internetTitle': '交易明细',
  'receipt.sectionInstallmentInfo': '分期交易信息',
  'receipt.sectionBillInfo': '已缴账单信息',
  'receipt.installmentCount': '分期期数',
  'receipt.installmentAmount': '每期金额',
  'receipt.installmentNumber': '分期编号',
  'receipt.billInfoId': '账单信息ID',
  'receipt.billId': '账单号',
  'receipt.payId': '支付ID',
  'receipt.completeAndReturn': '完成流程并返回商户网站',
  'receipt.autoReturnPrefix': '自动返回倒计时',
  'receipt.traceCode': '跟踪码',
  'receipt.digitalReceipt': '电子回执',
  'receipt.transactionType': '交易类型',
  'receipt.transactionTime': '交易时间',
  'receipt.transactionAmount': '交易金额',
  'receipt.discountAmount': '优惠金额',
  'receipt.deductedAmount': '实扣金额',
  'receipt.issuerBank': '发卡银行',
  'receipt.merchantNumber': '商户号',
  'receipt.terminalNumber': '终端号',
  'receipt.gatewayCode': '网关代码',
  'receipt.paymentFacilitator': '支付服务商',
  'receipt.merchantSiteAddress': '商户网站地址',
  'receipt.traceNo': '跟踪号',
  'receipt.rrn': '参考号 (RRN)',
  'receipt.pTraceNo': '终端跟踪号',
  'receipt.demo.transactionType': '购买',
  'receipt.noticePolicy':
    '若商户在30分钟内未向 SEP 确认商品或服务已交付，扣款金额将在72小时内退回您的账户。',

  // Transaction
  'transaction.merchant': '商户',
  'transaction.amount': '金额',
  'transaction.terminal': '商户号 / 终端号',
  'transaction.site': '商户网站',
  'transaction.paymentFacilitatorName': '支付服务商名称',
  'transaction.transactionType': '交易类型',
  'transaction.billListTitle': '账单列表',
  'transaction.billItem': '账单',
  'transaction.billCount': '{count} 个账单',
  'transaction.rial': '里亚尔',
  'transaction.amountInWordsPrefix': '约合',
  'transaction.toman': '土曼',

  // Timer
  'timer.title': '剩余时间',
  'timer.expired': '时间已结束',
};
