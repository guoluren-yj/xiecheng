export default [
  { code: 'SODR.WORKSPACE_MAINTENANCE_PURCHASEAGREEMENT' },
  {
    events: {
      async beforSubmit() {
        return true;
      },
      // 基础信息dataSet update监听事件
      basicInfoDsUpdate() {},
      // 交易方采买组织信息dataSet update监听事件
      organizationInfoDsUpdate() {},
    },
    process: {
      linePriceTip: () => {
        return null;
      },
      // bom弹窗单位数量字段计算
      transformBomUnitQuantity(value) {
        return value;
      },
      // 提交弱校验弹框内容埋点
      getConfirmModalProps: () => {},
      // bom弹窗数量字段计算
      transformBomQuantity(value) {
        return value;
      },
      // 基础信息额外表单字段
      basicInfoExtraForm(value) {
        return value;
      },
      // 交易方采买组织信息额外表单字段
      organizationInfoExtraForm(value) {
        return value;
      },
      // bom查询参数
      transformBomQueryPara(params) {
        return params;
      },
      // bom新增行默认值
      transformBomCreateDefault(params) {
        return params;
      },
      // bom保存前置埋点
      beforBomSave(_) {
        return _;
      },
      // 采购协议转订单表格props(引用单据新增行)
      purchaseAgreementSearchBarTableProps: (props) => props,
      processColumns: (columns) => columns,
      // 基础信息Ds二次处理
      getBasicInfoDs(value) {
        return value;
      },
    },
  },
];
