/*
 * @Date: 2023-07-24 09:31:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import { investigateDS } from './stores/investigateDS';
import { sampleDS } from './stores/sampleDS';
import { siteInspectionDS } from './stores/siteInspectionDS';
import { evaluationDS } from './stores/evaluationDS';
import { agreementDS } from './stores/agreementDS';
import { inquiryDS } from './stores/inquiryDS';
import { bidDS } from './stores/bidDS';
import { rectifyDS } from './stores/rectifyDS';
import { materialDS } from './stores/materialDS';
import { evalEventDS } from './stores/evalEventDS';
import { supplierEvaluationDS } from './stores/supplierEvaluationDS';
import { supplierChangeDS } from './stores/supplierChangeDS';
import { ppapDocumentDS } from './stores/ppapDocumentDS';

export const getTabPaneList = ({ currentRow }) => [
  {
    key: 'investigate',
    dataSet: new DataSet(investigateDS(currentRow)),
    tab: intl.get('sslm.common.view.title.investigate').d('调查表'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.QUESTIONNAIRE',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.INVESTIGATE_SEARCH_BAR',
  },
  {
    key: 'sample',
    dataSet: new DataSet(sampleDS(currentRow)),
    tab: intl.get('sslm.common.view.title.sample').d('送样申请'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SAMPLE',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SAMPLE_SEARCH_BAR',
  },
  {
    key: 'siteInspection',
    dataSet: new DataSet(siteInspectionDS(currentRow)),
    tab: intl.get('sslm.common.view.title.siteInspection').d('现场考察'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SITE_INSPECTION',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SITEINSPECTION_SEARCH_BAR',
  },
  {
    key: 'evaluation',
    dataSet: new DataSet(evaluationDS(currentRow)),
    tab: intl.get('sslm.common.view.title.evaluation').d('绩效考评'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALUATION',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALUATION_SEARCH_BAR',
  },
  {
    key: 'agreement',
    dataSet: new DataSet(agreementDS(currentRow)),
    tab: intl.get('sslm.common.view.title.agreement').d('协议'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.AGREEMENT_LIST',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.AGREEMENT_SEARCH_BAR',
  },
  {
    key: 'inquiry',
    dataSet: new DataSet(inquiryDS(currentRow)),
    tab: intl.get('sslm.common.view.title.inquiry').d('询价单'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.INQUIRY_LIST',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.INQUIRY_SEARCH_BAR',
  },
  {
    key: 'bid',
    dataSet: new DataSet(bidDS(currentRow)),
    tab: intl.get('sslm.common.view.title.bid').d('招投标'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.BID_LIST',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.BID_SEARCH_BAR',
  },
  {
    key: 'rectify',
    dataSet: new DataSet(rectifyDS(currentRow)),
    tab: intl.get('sslm.common.view.title.rectify').d('整改单'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.RECTIFY_LIST',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.RECTIFY_SEARCH_BAR',
  },
  {
    key: 'material',
    dataSet: new DataSet(materialDS({ ...currentRow, isReturnEmptyCompanyFlag: 1 })),
    tab: intl.get('sslm.common.view.title.material').d('物料认证'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.MATERIAL_LIST',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.MATERIAL_SEARCH_BAR',
  },
  {
    key: 'evalEvent',
    dataSet: new DataSet(evalEventDS(currentRow)),
    tab: intl.get('sslm.common.view.title.evalEvent').d('考评事件'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVAL_EVENT',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALEVENT_SEARCH_BAR',
  },
  {
    key: 'supplierEvaluationReport',
    dataSet: new DataSet(supplierEvaluationDS(currentRow)),
    tab: intl.get('sslm.common.view.title.supplierEvaluationReport').d('供应商评估'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALUATION_REPORT',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SUPPLIER_EVALUATION_SEARCH_BAR',
  },
  {
    key: 'supplierInfoChange',
    dataSet: new DataSet(supplierChangeDS(currentRow)),
    tab: intl.get('sslm.supplierInform.view.title.changeSupplier').d('供应商信息变更'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SUPPLIER_CHANGE_TABLE',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SUPPLIER_CHANGE_SEARCH_BAR',
  },
  {
    key: 'ppapDocument',
    dataSet: new DataSet(ppapDocumentDS(currentRow)),
    tab: intl.get('sslm.common.view.title.ppapDocument').d('PPAP单据'),
    customizeCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.PPAP_DOCUMENT',
    searchCode: 'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.PPAP_SEARCH_BAR',
  },
];
