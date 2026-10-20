/*
 * @Date: 2023-07-24 09:31:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

export const getTabPaneList = ({ sourceKey }) => {
  const prefix =
    sourceKey === 'NEW360QUERY'
      ? 'SSLM.SUPPLIER_360_PAGE_RELATED_DOC'
      : sourceKey === 'LIFE_CYCLE'
      ? 'SSLM.LIFE_CYCLE.RELATED_DOC'
      : 'SSLM.SUPPLIER_RELATED_DOC';
  return [
    {
      key: 'investigate',
      tab: intl.get('sslm.common.view.title.investigate').d('调查表'),
      customizeCode: `${prefix}.SURVEY`,
      searchCode: `${prefix}.SURVEY_SEARCH_BAR`,
    },
    {
      key: 'sample',
      tab: intl.get('sslm.common.view.title.sample').d('送样申请'),
      customizeCode: `${prefix}.SAMPLE`,
      searchCode: `${prefix}.SAMPLE_SEARCH_BAR`,
    },
    {
      key: 'siteInspection',
      tab: intl.get('sslm.common.view.title.siteInspection').d('现场考察'),
      customizeCode: `${prefix}.SITE_INSPECTION`,
      searchCode: `${prefix}.SITE_INSPECTION_SEARCH_BAR`,
    },
    {
      key: 'evaluation',
      tab: intl.get('sslm.common.view.title.evaluation').d('绩效考评'),
      customizeCode: `${prefix}.EVALUATION`,
      searchCode: `${prefix}.EVALUATION_SEARCH_BAR`,
    },
    {
      key: 'agreement',
      tab: intl.get('sslm.common.view.title.agreement').d('协议'),
      customizeCode: `${prefix}.AGREEMENT_LIST`,
      searchCode: `${prefix}.AGREEMENT_SEARCH_BAR`,
    },
    {
      key: 'inquiry',
      tab: intl.get('sslm.common.view.title.inquiry').d('询价单'),
      customizeCode: `${prefix}.INQUIRY_LIST`,
      searchCode: `${prefix}.INQUIRY_SEARCH_BAR`,
    },
    {
      key: 'bid',
      tab: intl.get('sslm.common.view.title.bid').d('招投标'),
      customizeCode: `${prefix}.BID_LIST'`,
      searchCode: `${prefix}.BID_SEARCH_BAR`,
    },
    {
      key: 'rectify',
      tab: intl.get('sslm.common.view.title.rectify').d('整改单'),
      customizeCode: `${prefix}.RECTIFY_LIST`,
      searchCode: `${prefix}.RECTIFY_SEARCH_BAR`,
    },
    {
      key: 'material',
      tab: intl.get('sslm.common.view.title.material').d('物料认证'),
      customizeCode: `${prefix}.MATERIAL_LIST`,
      searchCode: `${prefix}.MATERIAL_SEARCH_BAR`,
    },
    {
      key: 'evalEvent',
      tab: intl.get('sslm.common.view.title.evalEvent').d('考评事件'),
      customizeCode: `${prefix}.EVAL_EVENT`,
      searchCode: `${prefix}.EVAL_EVENT_SEARCH_BAR`,
    },
    {
      key: 'supplierEvaluationReport',
      tab: intl.get('sslm.common.view.title.supplierEvaluationReport').d('供应商评估'),
      customizeCode: `${prefix}.EVALUATION_REPORT`,
      searchCode: `${prefix}.EVALUATION_REPORT_SEARCH_BAR`,
    },
    {
      key: 'ppapDocument',
      tab: intl.get('sslm.common.view.title.ppapDocument').d('PPAP单据'),
      customizeCode: `${prefix}.PPAP_DOCUMENT`,
      searchCode: `${prefix}.PPAP_SEARCH_BAR`,
    },
  ];
};

// 3套
// 1、老360查询页面
// 2、新360查询页面
// 3、新生命周期管理工作台
export const unitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.ELIMINATE_RELATED_DOC',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_RELATED_DOC',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_RELATED_DOC',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_RELATED_DOC',
  'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_RELATED_DOC',
  'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL.RELATED_DOC',
  'SSLM.SUPPLIER_RELATED_DOC.SURVEY',
  'SSLM.SUPPLIER_RELATED_DOC.BID_LIST',
  'SSLM.SUPPLIER_RELATED_DOC.RECTIFY_LIST',
  'SSLM.SUPPLIER_RELATED_DOC.SAMPLE', // 送样申请
  'SSLM.SUPPLIER_RELATED_DOC.MATERIAL_LIST',
  'SSLM.SUPPLIER_RELATED_DOC.AGREEMENT_LIST',
  'SSLM.SUPPLIER_RELATED_DOC.INQUIRY_LIST',
  'SSLM.SUPPLIER_RELATED_DOC.SITE_INSPECTION', // 现场考察
  'SSLM.SUPPLIER_RELATED_DOC.EVALUATION', // 绩效考评
  'SSLM.SUPPLIER_RELATED_DOC.EVAL_EVENT', // 考评事件
  'SSLM.SUPPLIER_RELATED_DOC.EVALUATION_REPORT', // 供应商评估
  'SSLM.SUPPLIER_RELATED_DOC.PPAP_DOCUMENT',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.TABS',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.EVALUATION',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.AGREEMENT_LIST',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.EVALUATION_REPORT',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.EVAL_EVENT',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.MATERIAL_LIST',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.SAMPLE',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.RECTIFY_LIST',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.SITE_INSPECTION',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.SURVEY',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.BID_LIST',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.INQUIRY_LIST',
  'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.PPAP_DOCUMENT',
  'SSLM.LIFE_CYCLE.RELATED_DOC.TABS',
  'SSLM.LIFE_CYCLE.RELATED_DOC.BID_LIST',
  'SSLM.LIFE_CYCLE.RELATED_DOC.INQUIRY_LIST',
  'SSLM.LIFE_CYCLE.RELATED_DOC.RECTIFY_LIST',
  'SSLM.LIFE_CYCLE.RELATED_DOC.MATERIAL_LIST',
  'SSLM.LIFE_CYCLE.RELATED_DOC.EVALUATION',
  'SSLM.LIFE_CYCLE.RELATED_DOC.AGREEMENT_LIST',
  'SSLM.LIFE_CYCLE.RELATED_DOC.EVALUATION_REPORT',
  'SSLM.LIFE_CYCLE.RELATED_DOC.EVAL_EVENT',
  'SSLM.LIFE_CYCLE.RELATED_DOC.SAMPLE',
  'SSLM.LIFE_CYCLE.RELATED_DOC.SITE_INSPECTION',
  'SSLM.LIFE_CYCLE.RELATED_DOC.SURVEY',
  'SSLM.LIFE_CYCLE.RELATED_DOC.PPAP_DOCUMENT',
];

export const formatterCode = [
  'sslm.common',
  'sslm.sample',
  'sslm.siteInvestigateReport',
  'spcm.common',
  'spfm.certificationApproval',
  'spcm.purchaseContractView',
  'sslm.evaluationQuery',
  'sslm.supplierDocManage',
  'ssrc.inquiryHall',
  'ssrc.bidHall',
  'sqam.common',
  'entity.supplier',
  'entity.item',
  'entity.company',
  'entity.organization',
  'sslm.lifeCycleManage',
  'entity.roles',
  'entity.attachment',
  'sslm.material',
  'sslm.eventRecord',
  'sslm.purchaserEvaluation',
  'sqam.ppap',
];

// 跳转明细页
export const jumpDetail = ({ state, title, dispatch, pathname, search = {}, openTabFlag }) => {
  if (openTabFlag) {
    openTab({
      title,
      key: pathname,
      search: querystring.stringify({
        ...search,
        openTab: 1,
      }),
    });
  } else {
    dispatch(
      routerRedux.push({
        pathname,
        search: querystring.stringify(search),
        state,
      })
    );
  }
};
