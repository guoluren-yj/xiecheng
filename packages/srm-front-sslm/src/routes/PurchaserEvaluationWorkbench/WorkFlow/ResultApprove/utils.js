/*
 * @Date: 2024-02-04 10:24:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

import BasicInfo from '../components/BasicInfo';
import CompanyInfo from '../../Details/CompanyInfo';
import SupplierInfo from '../../Details/SupplierInfo';
import ReformContent from '../../Details/ReformContent';
import AssessmentResult from '../../Details/AssessmentResult';
import ItemCategoryInfo from '../../Details/ItemCategoryInfo';
import AssessmentPanel from '../../Details/AssessmentPanel';
import AssessmentInfo from '../../Details/AssessmentInfo';
import AllAttachments from '../../Details/AllAttachments';
import Result from './Supplement/Result';

export const getPanelList = ({ evalType }) =>
  [
    {
      key: 'assessmentResult',
      title: intl.get('sslm.purchaserEvaluationDetail.view.content.assessmentResult').d('评估结果'),
      component: AssessmentResult,
      componentProps: {
        isEdit: false,
        customizeReadOnly: true,
        customizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.ASSESSMENT_RESULT',
      },
    },
    {
      key: 'reformContent',
      title: intl.get('sslm.purchaserEvaluationDetail.view.content.reformContent').d('质量整改'),
      component: ReformContent,
      componentProps: {
        isPub: true,
        readOnly: true,
        customizeReadOnly: true,
        sourceKey: 'EVALUATION_REPORT',
        customizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.QUALITY_RECTIFIC',
      },
    },
    {
      key: 'basicInfo',
      title: intl.get('sslm.purchaserEvaluationDetail.view.content.basicInfo').d('基础信息'),
      component: BasicInfo,
      componentProps: {
        customizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.BASIC_INFO',
      },
    },
    {
      key: 'companyInfo',
      title: intl.get('sslm.purchaserEvaluationDetail.view.content.companyInfo').d('公司信息'),
      component: CompanyInfo,
      componentProps: {
        isEdit: false,
        isCreate: false,
        pubEdit: false,
        customizeReadOnly: true,
        customizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.COMPANY_INFO',
      },
    },
    {
      key: 'supplierInfo',
      title: intl.get('sslm.purchaserEvaluationDetail.view.content.supplierInfo').d('供应商信息'),
      component: SupplierInfo,
      componentProps: {
        isEdit: false,
        isCreate: false,
        pubEdit: false,
        isSupplier: true,
        customizeReadOnly: true,
        customizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.SUPPLIER_INFO',
      },
    },
    {
      key: 'itemCategoryInfo',
      title: intl
        .get('sslm.purchaserEvaluationDetail.view.content.itemCategoryInfo')
        .d('评估物料/品类'),
      component: ItemCategoryInfo,
      componentProps: {
        isEdit: false,
        pubEdit: false,
        customizeReadOnly: true,
        customizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.MATERIALS_TABLE',
      },
    },
    {
      key: 'assessmentPanel',
      title: intl.get('sslm.purchaserEvaluationDetail.view.content.assessmentPanel').d('评估小组'),
      component: AssessmentPanel,
      componentProps: {
        pubEdit: false,
        readOnly: true,
        customizeReadOnly: true,
        customizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.ASSESSMENT_TEAM',
      },
    },
    {
      key: 'assessmentInfo',
      hidden: evalType !== 'ONLINE',
      title: intl.get('sslm.purchaserEvaluationDetail.view.content.assessmentInfo').d('评估信息'),
      component: AssessmentInfo,
      componentProps: {
        isEdit: false,
        pubEdit: false,
        customizeReadOnly: true,
        searchCode: 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO',
        customizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.EVALUATION_INFO',
        customizeBtnGroupCode: 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_BTN_GROUP',
      },
    },
    {
      // 内部、外部附件
      key: 'attachment',
      title: null,
      isNoAllowFolding: true,
      component: AllAttachments,
      componentProps: {
        isEdit: false,
        pubEdit: false,
        customizeReadOnly: true,
        exAttCustomizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.EX_ATT_FORM',
        inAttCustomizeCode: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.IN_ATT_FORM',
      },
    },
  ].filter(n => !n.hidden);

// 信息补录
export const getSupplementList = () => [
  {
    key: 'assessmentResult',
    title: intl.get('sslm.purchaserEvaluationDetail.view.content.assessmentResult').d('评估结果'),
    component: Result,
    componentProps: {
      customizeCode: 'SSLM.PURCHASER_ASSESS_INFO_SUPPLEMENT.ASSESSMENT_RESULT',
    },
  },
];
