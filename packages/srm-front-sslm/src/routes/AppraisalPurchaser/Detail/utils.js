/*
 * @Date: 2023-11-06 16:30:26
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import Basic from '../components/Basic';
import ScoreInfo from '../components/ScoreInfo';
import ScoreResult from '../components/ScoreResult';
import AppraisalPerson from '../components/AppraisalPerson';
import ResultAttachment from '../components/ResultAttachment';
import ParticipSupplier from '../components/ParticipSupplier';
import AppraisalIndicator from '../components/AppraisalIndicator';
import AppraisalAttachment from '../components/AppraisalAttachment';

export const getHeaderTitle = editFlag => {
  const status = editFlag
    ? intl.get('hzero.common.button.edit').d('编辑')
    : intl.get('hzero.common.button.view').d('查看');
  return intl
    .get('sslm.appraisalPurchaser.view.title.headerTitle', {
      status,
    })
    .d(`${status}考评档案`);
};

// 参评供应商、考评指标、评分人页签展示逻辑,评分完成之前都显示，评分完成之后都隐藏
const multiTabFlag = (evalStatus, recordEvalStatus) => {
  const statusList = ['NEW', 'NEW_APPROVING', 'NEW_REJECTED', 'NEW_APPROVED'];
  if (evalStatus === 'DISCARDED') {
    if (recordEvalStatus) {
      return statusList.includes(recordEvalStatus);
    } else {
      return true; // recordEvalStatus为空，代表是老单据
    }
  }
  return statusList.includes(evalStatus);
};

// 评分信息页签显示逻辑
const scoreInfoFlag = (evalStatus, recordEvalStatus) => {
  const statusList = [
    'SYSTEM_PROCESSING',
    'SYSTEM_FAIL',
    'SYSTEM_COMPLETE',
    'MANUAL_EVALUATING',
    'MANUAL_COMPLETE',
  ];
  return evalStatus === 'DISCARDED'
    ? statusList.includes(recordEvalStatus)
    : statusList.includes(evalStatus);
};

// 评分结果页签显示逻辑
const scoreResultFlag = (evalStatus, recordEvalStatus) => {
  const statusList = [
    'FINAL_COLLECTED',
    'APPROVING',
    'REJECTED',
    'COMPLETED',
    'PUBLISHED',
    'APPEALING',
    'PARTIAL_PUBLISHED',
    'SUPPLIER_CONFIRMED',
  ];
  return evalStatus === 'DISCARDED'
    ? statusList.includes(recordEvalStatus)
    : statusList.includes(evalStatus);
};

// 考评附件页签显示逻辑
const appraisalAttachmentFlag = (evalStatus, recordEvalStatus) => {
  const statusList = [
    'MANUAL_COMPLETE',
    'FINAL_COLLECTED',
    'APPROVING',
    'REJECTED',
    'COMPLETED',
    'PUBLISHED',
    'SUPPLIER_CONFIRMED',
    'APPEALING',
    'PARTIAL_PUBLISHED',
  ];
  return evalStatus === 'DISCARDED'
    ? statusList.includes(recordEvalStatus)
    : statusList.includes(evalStatus);
};

// 附件页签显示逻辑
const resultAttachmentFlag = (evalStatus, recordEvalStatus) => {
  const statusList = ['FINAL_COLLECTED', 'APPROVING', 'REJECTED', 'COMPLETED', 'PUBLISHED'];
  return evalStatus === 'DISCARDED'
    ? statusList.includes(recordEvalStatus)
    : statusList.includes(evalStatus);
};

/**
 * recordEvalStatus 哪个阶段废弃的，历史单据为空，默认显示新建状态的页签
 * workflowFlag 判断是否是工作流，工作流走单据样式定制的个性化单元
 */
export const getPanelList = ({ evalStatus, recordEvalStatus, workflowFlag = false } = {}) =>
  [
    {
      key: 'basicInfo',
      header: intl.get('sslm.common.view.title.baseInfo').d('基础信息'),
      component: Basic,
      componentProps: {
        customizeUnitCode: workflowFlag
          ? 'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.BASIC'
          : 'SSLM.APPRAISAL_PURCHASER_DETAIL.BASIC',
      },
    },
    {
      key: 'participSupplier',
      header: intl.get('sslm.supplierDocManage.model.evalDocManage.scoreVendor').d('参评供应商'),
      component: ParticipSupplier,
      componentProps: {
        searchCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.PARTICIP_SUPPLIER_SEARCH',
        customizeUnitCode: workflowFlag
          ? 'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.PARTICIP_SUPPLIER_LIST'
          : 'SSLM.APPRAISAL_PURCHASER_DETAIL.PARTICIP_SUPPLIER_LIST',
      },
      hidden: !multiTabFlag(evalStatus, recordEvalStatus),
    },
    {
      key: 'appraisalIndicator',
      header: intl.get('sslm.common.model.archiveFilled.evaluationIndex').d('考评指标'),
      component: AppraisalIndicator,
      componentProps: {
        searchCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.INDICATOR_SEARCH',
        customizeUnitCode: workflowFlag
          ? 'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.INDICATOR_LISTS'
          : 'SSLM.APPRAISAL_PURCHASER_DETAIL.INDICATOR_LIST',
      },
      hidden: !multiTabFlag(evalStatus, recordEvalStatus),
    },
    {
      key: 'appraisalPerson',
      header: intl.get('sslm.supplierDocManage.model.docManage.evaluationPerson').d('评分人'),
      component: AppraisalPerson,
      componentProps: {},
      hidden: !multiTabFlag(evalStatus, recordEvalStatus),
    },
    {
      key: 'scoreInfo',
      header: intl.get('sslm.common.view.message.gradInfo').d('评分信息'),
      component: ScoreInfo,
      hidden: !scoreInfoFlag(evalStatus, recordEvalStatus),
    },
    {
      key: 'scoreResult',
      header: intl.get('sslm.common.view.title.scoreResult').d('评分结果'),
      component: ScoreResult,
      hidden: !scoreResultFlag(evalStatus, recordEvalStatus),
      componentProps: {
        workflowFlag,
        searchCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_SEARCH',
        detailLineCode: workflowFlag
          ? 'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.SCORE_RESULT_DETAIL'
          : 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_DETAIL',
        customizeUnitCode: workflowFlag
          ? 'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.SCORE_RESULT_LIST'
          : 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_LIST',
      },
    },
    {
      key: 'appraisalAttachment',
      header: intl.get('sslm.common.model.evaluation.appraisalAttachment').d('考评附件'),
      component: AppraisalAttachment,
      hidden: !appraisalAttachmentFlag(evalStatus, recordEvalStatus),
    },
    {
      key: 'resultAttachment',
      header: intl.get('hzero.common.upload.modal.title').d('附件'),
      component: ResultAttachment,
      hidden: !resultAttachmentFlag(evalStatus, recordEvalStatus),
    },
  ].filter(n => !n.hidden);

// 查看档案详情
export const getDetailsList = ({ workflowFlag } = {}) => [
  {
    key: 'participSupplier',
    header: intl.get('sslm.supplierDocManage.model.evalDocManage.scoreVendor').d('参评供应商'),
    component: ParticipSupplier,
    componentProps: {
      searchCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.PARTICIP_SUPPLIER_SEARCH',
      customizeUnitCode: workflowFlag
        ? 'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.PARTICIP_SUPPLIER_LIST'
        : 'SSLM.APPRAISAL_PURCHASER_DETAIL.PARTICIP_SUPPLIER_LIST',
    },
  },
  {
    key: 'appraisalIndicator',
    header: intl.get('sslm.common.model.archiveFilled.evaluationIndex').d('考评指标'),
    component: AppraisalIndicator,
    componentProps: {
      searchCode: 'SSLM.APPRAISAL_PURCHASER_DETAIL.INDICATOR_SEARCH',
      customizeUnitCode: workflowFlag
        ? 'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.INDICATOR_LISTS'
        : 'SSLM.APPRAISAL_PURCHASER_DETAIL.INDICATOR_LIST',
    },
  },
  {
    key: 'appraisalPerson',
    header: intl.get('sslm.supplierDocManage.model.docManage.evaluationPerson').d('评分人'),
    component: AppraisalPerson,
    componentProps: {},
  },
];
