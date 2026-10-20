module.exports = {
  package: {
    tenantNum: 'SRM-TRIP',
    initLoad: false,
    registerRegex: "\\/scux|sinv|ssrc|sslm\\/"
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  theme: require.resolve('srm-front-boot/lib/config/theme.js'), // less 变量配置, theme 的值可以是 string 表示指向配置文件

  hzeroMS: {
    exposes: {
      SSRC_INQUIRY_HALL_NEW_LIST: './src/routes/ssrc/InquiryHallNew/expose.js',
      SSRC_EXPERT_SCORING_BUSS: './src/routes/sbid/ExpertScoring/Update/expose.js',
      SSRC_SUPPLIER_QUOTATION_NEW: './src/routes/ssrc/RFSupplierQuotation/Quotation/expose.js',
      SPRM_PRDETAIL_REMOTE: './src/routes/sprm/NewPurchaseDetail/expose.js',
      SPRM_PURCHASE_DETAIL_CUSTOMLOV: './src/routes/sprm/NewPurchaseDetail/BaseInfo/expose.js',
      SPCM_WORKSPACE_LIST: './src/routes/spcm/workspace/expose.js',
      SPCM_WORKSPACE_DETAIL: './src/routes/spcm/workspace/Detail/expose.js',
      SSTA_PURCHASESETTLE_DETAIL_PRE: './src/routes/ssta/NewPurchaseSettle/PrePayment/Detail/expose.js',
      SSTA_PURCHASESETTLE_DETAIL: './src/routes/ssta/NewPurchaseSettle/Detail/expose.js',
      SINV_PRDETAIL_REMOTE: './src/routes/sinv/ReceipWorkbenchWorks/expose.js',
      'SODR.WORKSPACE_LIST': './src/routes/sodr/OrderWorkspace/expose.js',
      SINV_PRLIST_REMOTE: './src/routes/sinv/ReceipWorkbench/expose.js',
      SSRC_WHOLE_OFFLINE_ENTRY_DETAIL: './src/routes/ssrc/InquiryHallNew/Whole/Detail/expose.js',
      SSRC_COMPONENTS_OPERATION_RECORD_CONTAINER: './src/routes/ssrc/components/OperationRecord/expose.js',
    },
  },
};
