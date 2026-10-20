/* eslint no-empty-function: 0 */
import React from 'react';

export default [
  { code: 'SODR.WORKSPACE_CHANGE_DETAIL' },
  {
    process: {
      // bom弹窗单位数量字段计算
      transformBomUnitQuantity(value) {
        return value;
      },
      // bom弹窗数量字段计算
      transformBomQuantity(value) {
        return value;
      },
      // 基础信息Ds二次处理
      getBasicInfoDs(value) {
        return value;
      },
      // 行信息Ds二次处理
      getDetailInfoDs(value) {
        return value;
      },
      // 基础信息额外表单字段
      basicInfoExtraForm(value) {
        return value;
      },
      // 提交弱校验弹框内容埋点
      getConfirmModalProps: () => {},
      // 交易方采买组织信息额外表单字段
      organizationInfoExtraForm(value) {
        return value;
      },
      // 取价相关带出字段
      setPriceFields(fields) {
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
      // bom弹窗是否使用缓存数据
      useCacheBomData(res) {
        return res;
      },
      // bom保存后置埋点
      afterBomSave() {},
      // bom保存前置埋点
      beforBomSave(_) {
        return _;
      },
      // 更新推荐供应商需更新的字段（引用采购申请新增行）
      transformOrderSupplierFields(fields) {
        return fields;
      },
      // 采购申请转订单表格props(引用单据新增行)
      purchaseRequestSearchBarTableProps: (props) => props,
      // 采购协议转订单表格props(引用单据新增行)
      purchaseAgreementSearchBarTableProps: (props) => props,
      // 寻源转订单表格props(引用单据新增行)
      sourcingResultsSearchBarTableProps: (props) => props,
      // 变更提交是否未修改数据
      handleSubmitNotModified: (result) => result,
      // 变更新增行前置埋点
      beforHandleCreateLine: async () => true,
      // 明细行信息columns
      transformColumns: (columns) => columns,
      // 折叠面板埋点
      processCollapse({ Component, props, children }) {
        return <Component {...props}>{children}</Component>;
      },
    },
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
      // 引用单据创建 明细-采购申请ds update
      handlePurchaseRequestDsUpdate: () => {},
      // 明细行信息ds load
      async detailInfoDsLoad() {},
      // 基础信息dataSet load事件
      basicInfoDsLoad() {},
      // 明细信息dataSet 新增行事件
      detailInfoDsCreate() {},
      // 预算校验后置事件
      async afterBudgetVerification(eventProps) {
        const { onCallBack } = eventProps || {};
        if (onCallBack) {
          await onCallBack();
        }
      },
    },
  },
];
