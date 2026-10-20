module.exports = [
  {
    path: '/spct/pay-config',
    component: () => import('../routes/PayConfig'),
    models: [() => import('../models/payConfigNewly')],
    FilterSupplier: true,
  },
  {
    path: '/spct/payment-order',
    component: () => import('../routes/PaymentOrder'),
    models: [() => import('../models/paymentOrderNewly')],
    FilterSupplier: true,
  },
  {
    path: '/spct/refund-order',
    component: () => import('../routes/RefundOrder'),
    models: [() => import('../models/refundOrderNewly')],
    FilterSupplier: true,
  },
  {
    path: '/pub/spct/payment-cashier',
    component: () => import('../routes/PaymentCashier'),
    // FilterSupplier: true,
    authorized: true,
  },
  {
    path: '/pub/spct/payment-cashier-plateform',
    component: () => import('../routes/PlatPaymentCashier'),
    // FilterSupplier: true,
    authorized: true,
  },
  {
    path: '/spct/payment-config',
    component: () => import('../routes/PaymentConfig'),
    FilterSupplier: true,
  },
  {
    path: '/spct/payment-config-platform',
    component: () => import('../routes/PlatPaymentConfig'),
    // authorized: true,
    FilterSupplier: true,
  },
  {
    path: '/spct/cashier-config',
    component: () => import('../routes/CashierConfig'),
    FilterSupplier: true,
    // authorized: true,
  },
  {
    path: '/pub/spct/payment-cashier-preview',
    component: () => import('../routes/CashierPreview'),
    // FilterSupplier: true,
    authorized: true,
  },
  {
    path: '/spct/payment-flow',
    component: () => import('../routes/PaymentFlow'),
    FilterSupplier: true,
    // authorized: true,
  },
];
