import React from 'react';

export default [
  { code: 'SODR.WORKSPACE_MAINTENANCE_PURCHASEREQUEST' },
  {
    events: {
      async beforSubmit() {
        return true;
      },
      async startSubmit() {
        return true;
      },
      // 明细行信息ds update
      async handleDetailInfoDsUpdate() {
        return true;
      },
      // 基础信息dataSet update监听事件
      basicInfoDsUpdate() {},
      // 交易方采买组织信息dataSet update监听事件
      async organizationInfoDsUpdate() {
        return true;
      },
      // 订单行dataSet load监听事件
      handleDetailInfoDsLoad() {},
      // 订单行删除前置埋点
      async beforDeleteLine() {
        return true;
      },
      // 订单行删除后置埋点
      afterDeleteLine() {},
      // 引用单据创建 明细-采购申请ds update
      handlePurchaseRequestDsUpdate: () => {},
      // 基础信息dataSet load事件
      basicInfoDsLoad() {},
      // 保存提交方法公共前置埋点
      beforHandleSaveOrSubmit: async () => {
        return true;
      },
      afterSaveEvent: () => {},
    },
    process: {
      // transferPurchaseAgentId() {
      //   return false;
      // },
      linePriceTip: () => {
        return null;
      },
      async handleBeforAdd() {
        return true;
      },
      // 明细采购申请筛选器查询参数埋点
      getPurchaseRequestQueryParams() {
        return {};
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
      // bom新增行默认值
      transformBomCreateDefault(params) {
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
      // bom保存前置埋点
      beforBomSave(_) {
        return _;
      },
      // 更新推荐供应商需更新的字段（引用采购申请新增行）
      transformOrderSupplierFields(fields) {
        return fields;
      },
      // 参考价格组件props
      transformPriceModalProps(_) {
        return _;
      },
      // 采购申请转订单表格props(引用单据新增行)
      purchaseRequestSearchBarTableProps: (props) => props,
      // 折叠面板埋点
      processCollapse({ Component, props, children }) {
        return <Component {...props}>{children}</Component>;
      },
      // 明细行信息按钮组buttons
      detailInfoGetButtons(_) {
        return _;
      },
      processColumns: (columns) => columns,
    },
  },
];
