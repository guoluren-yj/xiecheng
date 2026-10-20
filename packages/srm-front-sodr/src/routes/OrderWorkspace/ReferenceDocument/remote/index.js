export default [
  { code: 'SODR.WORKSPACE_REFERENCEDOCUMENT' },
  {
    process: {
      agreementColumns(props) {
        return props;
      },
      // 寻源转单埋点
      sourceCreate() {
        return true;
      },
      // 更新推荐供应商需更新的字段（引用采购申请新增行）
      transformOrderSupplierFields(fields) {
        return fields;
      },
      // 明细采购申请筛选器查询参数埋点
      getPurchaseRequestQueryParams() {
        return {};
      },
      // 明细-申请转订单表格ds props
      purchaseRequestDsProps: (props) => props,
      // 更新引用单据弹窗footer（租户级）
      updateFooter(footer) {
        return footer;
      },
      // 采购申请转订单表格props
      purchaseRequestSearchBarTableProps: (props) => props,
      // 采购协议转订单表格props
      purchaseAgreementSearchBarTableProps: (props) => props,
      // 寻源转订单表格props
      sourcingResultsSearchBarTableProps: (props) => props,
    },
    events: {
      handleSourceCreate: (e) => e,
      // 更新推荐供应商额外操作
      handleGetOrderSupplier: () => {},
      // 引用采购申请新建前置
      beforHandleCreate: async () => {
        return true;
      },
      // 引用单据创建 明细-采购申请ds update
      handlePurchaseRequestDsUpdate: () => {},
    },
  },
];
