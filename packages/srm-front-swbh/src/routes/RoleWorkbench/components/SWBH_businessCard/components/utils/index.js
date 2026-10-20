/* eslint-disable no-param-reassign */
import React from 'react';
// import { Skeleton } from 'choerodon-ui/pro';
import notification from 'utils/notification';

import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { getCurrentLanguage } from 'utils/utils';
import { stringify } from 'querystring';
import intl from 'utils/intl';
import { isNumber } from 'lodash';

import styles from './index.less';

/**
 * 金额格式化
 * @param {Number} amount 金额
 * @param {Number} precision 精度
 * @param {Boolean} isSupplement 是否补0
 * @param {Boolean} useGrouping 是否展示分隔符
 * @returns
 */
export function formatAmount(amount, precision, isSupplement, useGrouping = true) {
  if (isNumber(amount)) {
    const language = getCurrentLanguage().split('_').join('-');
    const options = Object.assign(
      { useGrouping },
      { maximumFractionDigits: isNumber(precision) ? precision : 20 },
      precision && isSupplement ? { minimumFractionDigits: precision } : {}
    );
    return amount.toLocaleString(language, options);
  }
  return amount;
}
// 单据类型
export function esDocumentType(code) {
  let typeText = null;
  if (code) {
    switch (code) {
      case 'SRM_C_SRM_SODR_PO_HEADER':
        typeText = intl.get('srm.common.view.common.purchaseOrder').d('采购订单');
        break;
      case 'SRM_C_SRM_SPCM_PC_HEADER':
        typeText = intl.get('srm.common.view.common.spcmPc').d('采购协议');
        break;
      case 'SRM_C_SRM_SSRC_RFX_HEADER':
        typeText = intl.get('srm.common.view.common.sspcRfx').d('询价单');
        break;
      case 'SRM_C_SRM_SRM_SMAL_PO_HEADER':
        typeText = intl.get('srm.common.view.common.smalPo').d('商城订单头');
        break;
      case 'SRM_C_SRM_SSLM_LIFE_CYCLE':
        typeText = intl.get('srm.common.view.common.sslmLifrCycle').d('供应商生命周期');
        break;
      case 'SRM_C_SRM_SSLM_LIFE_CYCLE_REQS':
        typeText = intl.get('srm.common.view.common.sslmLifeCycleReqs').d('供应商生命周期阶段申请表');
        break;
      case 'SRM_C_SRM_SLOD_ASN_HEADER':
        typeText = intl.get('srm.common.view.common.slodAsn').d('发货工作台-送货单');
        break;
      case 'SRM_C_SRM_SINV_RCV_TRX_HEADER':
        typeText = intl.get('srm.common.view.common.sinvPcvTrx').d('采购事务');
        break;
      case 'SRM_C_SRM_SINV_ASN_HEADER':
        typeText = intl.get('srm.common.view.common.sinvAsn').d('送货单');
        break;
      case 'SRM_C_SRM_SSLM_SUPPLIER_CATEGORY':
        typeText = intl.get('srm.common.view.common.sslmSupplierCategory').d('供应商分类定义');
        break;
      case 'SRM_C_SRM_SSLM_SUPPLIER_CTG_ALTER':
        typeText = intl.get('srm.common.view.common.sslmSupplierCtgAlter').d('供应商分类变更申请');
        break;
      case 'SRM_C_SRM_SSLM_KPI_EVAL_HEADER':
        typeText = intl.get('srm.common.view.common.sslmKpiEval').d('供应商绩效考评档案头定义');
        break;
      case 'SRM_C_SRM_SSLM_SUPPLY_ABILITY':
        typeText = intl.get('srm.common.view.common.sslmSupplyAbility').d('供应商供货能力清单');
        break;
      case 'SRM_C_SRM_SSLM_SUPPLIER_QUOTA_HEADER':
        typeText = intl.get('srm.common.view.common.sslmSupplierQuoto').d('供应商配额头表');
        break;
      case 'SRM_C_SRM_SSLM_FIRM_CHANGE_REQ':
        typeText = intl.get('srm.common.view.common.sslmFirmChage').d('企业信息变更申请单');
        break;
      case 'SRM_C_SRM_SNTM_BUSINESS_NOTIFICATION':
        typeText = intl.get('srm.common.view.common.sntmBusiness').d('业务通知单');
        break;
      case 'SRM_C_STANDARD_SPRM_FCST_HEADER':
        typeText = intl.get('srm.common.view.common.sprmFcst').d('预测标准组合');
        break;
      case 'SRM_C_STANDARD_SPRM_DEMAND_FORECAST':
        typeText = intl.get('srm.common.view.common.sprmDemandForecast').d('需求预测标准组合');
        break;
      case 'SRM_C_SRM_SSTA_SETTLE':
        typeText = intl.get('srm.common.view.common.sstaSettle').d('结算池');
        break;
      case 'SRM_C_SRM_SSTA_BILL_HEADER':
        typeText = intl.get('srm.common.view.common.sstaBill').d('对账单');
        break;
      case 'SRM_C_SRM_SSTA_SETTLE_HEADER':
        typeText = intl.get('srm.common.view.common.sstaSettlement').d('结算单');
        break;
      case 'SRM_C_STANDARD_SBUD_BUDGET':
        typeText = intl.get('srm.common.view.common.sbudBudget').d('预算标准组合');
        break;
      case 'SRM_C_SRM_SSTA_CHARGE_HEADER':
        typeText = intl.get('srm.common.view.common.sstaCharge').d('费用单');
        break;
      case 'SRM_C_SRM_SQAM_ED_PROBLEM_HEADER':
        typeText = intl.get('srm.common.view.common.sqamEdProblem').d('质量整改8D');
        break;
      case 'SRM_C_SRM_SQAM_CLAIM_FORM_HEADER':
        typeText = intl.get('srm.common.view.common.sqamClaimForm').d('索赔单');
        break;
      case 'SRM_C_SRM_SIEC_MOULD_ACCOUNT_HEADER':
        typeText = intl.get('srm.common.view.common.siecMouldAccount').d('模具台账');
        break;
      case 'SRM_C_SRM_SRPM_REQUEST_PLAN_HEADER':
        typeText = intl.get('srm.common.view.common.sprmRequestPlan').d('需求计划提报单');
        break;
      case 'SRM_C_STANDARD_SRPM_REQUEST_PLAN_BL_HEADER':
        typeText = intl.get('srm.common.view.common.sprmRequestPlanBl').d('需求计划单标准组合');
        break;
      case 'SRM_C_SRM_SRPM_REQUEST_PLAN_VT_HEADER':
        typeText = intl.get('srm.common.view.common.sprmRequestPlanVt').d('需求计划虚拟单');
        break;
      case 'SRM_C_STANDARD_SPRM_PR_HEADER':
        typeText = intl.get('srm.common.view.common.sprmPr').d('采购申请标准组合');
        break;
      case 'SRM_C_SRM_SPFM_SUPPLIER_INVITE_REG':
        typeText = intl.get('srm.common.view.common.spfmSupplierInviteReg').d('供应商邀请注册');
        break;
      case 'SRM_C_STANDARD_SSLM_INVESTG_HEADER':
        typeText = intl.get('srm.common.view.common.sslmInvestg').d('调查表标准组合');
        break;
      case 'SRM_C_SRM_SSLM_SAMPLE_SEND_REQ':
        typeText = intl.get('srm.common.view.common.sslmSampleSendReq').d('送样申请发布信息');
        break;
      case 'SRM_C_STANDARD_SSLM_SITE_EVAL_HEADER':
        typeText = intl.get('srm.common.view.common.sslmSiteEval').d('现场考察单标准组合');
        break;
      case 'SRM_C_SRM_SSLM_SUPPLIER_CHANGE_REQ':
        typeText = intl.get('srm.common.view.common.sslmSupplierChangeReq').d('供应商信息变更申请单');
        break;
      case 'SRM_C_SLOD_PLAN_HEADER':
        typeText = intl.get('srm.common.view.common.slodPlan').d('发货工作台-计划');
        break;
      case 'SRM_C_SLOD_LABEL_HEADER':
        typeText = intl.get('srm.common.view.common.slodLabel').d('发货工作台-标签');
        break;
      default:
        break;
    }
  }
  return { typeText };
}

/**
 *  * 详情页抽屉

 * @param {*} val
 * @param {*} path
 * @param {*} params
 * @param {*} search
 * @returns
 */
export function getEmbedPageLink(
  val,
  path = '',
  params = {},
  search = {},
  { dataSet, openModal, modalRef, modal: { update } }
) {
  update({
    style: { maxWidth: `calc(100vw - 200px)`, minWidth: 996 },
    resizable: true,
  });
  if (!path) {
    notification.warning({
      message: intl.get(`srm.common.view.message.detailPageLink`).d('请检查详情页链接配置'),
    });
    return;
  }
  const newSearch = stringify(search);
  const _search = `?${newSearch}`;
  const _location = {
    hash: '',
    pathname: path,
    search: _search,
  };
  const flexLinkProps = {
    path,
    text: val,
    location: _location,
    match: {
      params,
      path,
    },
    history: {
      ...window.dvaApp._history,
      location: _location,
    },
  };
  // 审批页面需单独添加样式
  if (path && path.includes('/hwfp')) {
    flexLinkProps.contentStyle = { height: '100%' };
  }
  const modalObj = {
    mask: false,
    maskClosable: true,
    footer: null,
    drawer: true,
    resizable: true,
    customizedCode: 'SWBH.ROLE_WORKBENCH.SUPER_QUERY',
    children: <EmbedPage href={path} {...flexLinkProps} />,
    style: { maxWidth: `calc(100vw - 200px)`, minWidth: 780 },
    className: styles['detailDrawer-modal'],

    onClose: () => {
      modalRef.current = '';
      update({
        resizable: false,
        style: { maxWidth: 996, minWidth: 996 },
      });
      dataSet.current.reset();
    },
  };
  openModal(modalObj);
}
export function sizeChangerRenderer({ text }) {
  return intl
    .get(`srm.common.view.message.numberPage`, {
      num: text,
    })
    .d(`{num}条/页`);
}
