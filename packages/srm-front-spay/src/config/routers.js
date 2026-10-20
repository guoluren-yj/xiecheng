module.exports = [
  {
    path: '/spay/pay-config',
    component: () => import('../routes/PayConfig'),
    models: [() => import('../models/payConfig')],
    FilterSupplier: true,
  },
  {
    path: '/spay/payment-order',
    component: () => import('../routes/PaymentOrder'),
    models: [() => import('../models/paymentOrder')],
    FilterSupplier: true,
  },
  {
    path: '/spay/refund-order',
    component: () => import('../routes/RefundOrder'),
    models: [() => import('../models/refundOrder')],
    FilterSupplier: true,
  },
];
