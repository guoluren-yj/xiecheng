export default [
  { code: 'SODR.WORKSPACE_MAINTENANCE_SOURCINGRESULTS' },
  {
    events: {
      async beforSubmit() {
        return true;
      },
      // 基础信息dataSet update监听事件
      basicInfoDsUpdate() {},
      // 交易方采买组织信息dataSet update监听事件
      organizationInfoDsUpdate() {},
      onSubmit(eventsProps) {
        const { onSubmit } = eventsProps || {};
        if (onSubmit) {
          onSubmit();
        }
      },
      // 保存提交方法公共前置埋点
      beforHandleSaveOrSubmit: async () => {
        return true;
      },
    },
    process: {
      // transferPurchaseAgentId() {
      //   return false;
      // },
      linePriceTip: () => {
        return null;
      },
      // bom弹窗单位数量字段计算
      transformBomUnitQuantity(value) {
        return value;
      },
      // bom弹窗数量字段计算
      transformBomQuantity(value) {
        return value;
      },
      // 提交弱校验弹框内容埋点
      getConfirmModalProps: () => {},
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
      // 寻源转订单表格props(引用单据新增行)
      sourcingResultsSearchBarTableProps: (props) => props,
      // 引用寻源结果新增行前置埋点
      sourceCreate: async () => true,
      // 是否需要执行联动公司、业务实体、采购组织、采购员等字段的联动逻辑
      whetherToGetAutoBind() {
        return true;
      },
      processColumns: (columns) => columns,
      // 基础信息Ds二次处理
      getBasicInfoDs(value) {
        return value;
      },
    },
  },
];
