export default [
  { code: 'SODR.WORKSPACE_MAINTENANCE_CREATEMANUALLY' },
  {
    process: {
      handleCreateData(data) {
        return data;
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
      // 点击单价是否获取最新价格
      canFetchNewPriceLib(value) {
        return value;
      },
      // 获取价格库价格是否校验双单位
      getDoubleUomPriceFailed(value) {
        return value;
      },
      // 基础信息Ds二次处理
      getBasicInfoDs(value) {
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
      // 订单行参考价格带出字段对象
      setPriceFields(fields) {
        return fields;
      },
      // 订单行点击单价/选择物料 取价带出字段
      setPriceFcousFields(fields) {
        return fields;
      },
      // bom查询参数
      transformBomQueryPara(params) {
        return params;
      },
      // 交易方采买组织信息供应商的参数
      getSupplierLovPara(params) {
        return params;
      },
      // 供应商组件props
      getSupplierLovCompProp(params) {
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
      // 参考价格组件props
      transformPriceModalProps(_) {
        return _;
      },
      companyEditorProps(_) {
        return _;
      },
      ouEditorProps(_) {
        return _;
      },
      purchaseOrgEditorProps(_) {
        return _;
      },
      // 明细行信息按钮组buttons
      detailInfoGetButtons(_) {
        return _;
      },
      processColumns: (columns) => columns,
      processPanels: (panels) => panels,
      // 获取明细的所有ds
      getDetailDs(ds) {
        return ds;
      },
    },
    events: {
      async beforSubmit() {
        return true;
      },
      async startSubmit() {
        return true;
      },
      // 基础信息dataSet update监听事件
      basicInfoDsUpdate() {},
      // 交易方采买组织信息dataSet update监听事件
      async organizationInfoDsUpdate() {
        return true;
      },
      // 明细信息dataSet update监听事件
      detailInfoDsUpdate() {},
      // 基础信息dataSet load事件
      basicInfoDsLoad() {},
      // 保存提交方法公共前置埋点
      beforHandleSaveOrSubmit: async () => {
        return true;
      },
      // 明细信息dataSet load事件
      detailInfoDsLoad() {},
    },
  },
];
