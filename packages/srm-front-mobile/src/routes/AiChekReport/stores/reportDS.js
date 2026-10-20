/**
 * 文件名：reportDS.js
 * 文件描述：智能审核统计报表数据源配置
 * 创建时间：2026-04-10
 * 作者：Felix(LQX5731@163.com)
 * 版本号：1.0
 * 最后更新时间：2026-04-10 11:30:00
 */
import intl from 'utils/intl';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const ReportListDS = () => ({
  pageSize: 20,
  selection: false,
  autoQuery: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check/report-overview/list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get('smbl.aiChekReport.model.documentCode').d('流程单据'),
      name: 'documentName',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.categoryCode').d('流程分类'),
      name: 'categoryName',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.batchId').d('批次号'),
      name: 'batchId',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.bindObjName').d('数据'),
      name: 'bindObjName',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.ruleCode').d('规则编码'),
      name: 'ruleCode',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.ruleName').d('规则名称'),
      name: 'ruleName',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.ruleDetail').d('规则详情'),
      name: 'ruleDetail',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.finalResult').d('审核结果'),
      name: 'finalResult',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.executeResult').d('原因'),
      name: 'executeResult',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.submitter').d('提报人'),
      name: 'userName',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.feedbackType').d('是否点踩'),
      name: 'feedbackType',
      type: 'string',
      lookupCode: 'SMBL_AI_CHECK_FEEDBACK',
      transformResponse: (value) => value !== 'DISLIKE' ? 'LIKE' : 'DISLIKE',
    },
    {
      label: intl.get('smbl.aiChekReport.model.lastUpdateDate').d('提交时间'),
      name: 'lastUpdateDate',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('smbl.aiChekReport.model.statisticalPeriod').d('统计周期'),
      name: 'viewTimeRange',
      type: 'date',
      range: true,
      lookupCode: 'SMBL.AI_CHECK_STATISTICAL_PERIOD',
    },
    {
      label: intl.get('smbl.aiChekReport.model.documentCode').d('流程单据编码'),
      name: 'documentCodeObj',
      type: 'object',
      lovCode: 'SMBL.AI_CHECK_DOCUMENT_LIST',
      noCache: true,
      multiple: true,
    },
    {
      name: 'documentCode',
      bind: 'documentCodeObj.documentCode',
    },
    {
      label: intl.get('smbl.aiChekReport.model.categoryCode').d('流程分类编码'),
      name: 'categoryCodeObj',
      type: 'object',
      lovCode: 'SMBL.AI_CHECK_CATEGORY_LIST',
      noCache: true,
      multiple: true,
      // dynamicProps: {
      //   lovPara: ({ record }) => {
      //     const codeList = record?.get('documentCode') || [];
      //     return { documentCodes: codeList?.join(',') || '' };
      //   },
      // },
    },
    {
      name: 'categoryCode',
      bind: 'categoryCodeObj.categoryCode',
    },
    {
      label: intl.get('smbl.aiChekReport.model.feedbackType').d('是否点踩'),
      name: 'feedbackType',
      type: 'string',
      lookupCode: 'SMBL_AI_CHECK_FEEDBACK',
    },
  ],
});

/**
 * 智能审核报表规则比率列表
 * @returns
 */
const RuleRateListDS = () => ({
  pageSize: 10,
  selection: false,
  autoQuery: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check/report-overview/rate-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get('smbl.aiChekReport.model.documentCode').d('流程单据'),
      name: 'documentName',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.categoryCode').d('流程分类'),
      name: 'categoryName',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.ruleCode').d('规则编码'),
      name: 'ruleCode',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.ruleName').d('规则名称'),
      name: 'ruleName',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.rate').d('比率'),
      name: 'rate',
      type: 'string',
    },
    {
      label: intl.get('smbl.aiChekReport.model.ruleDetail').d('规则详情'),
      name: 'ruleDetail',
      type: 'string',
    },
  ],
});

export { ReportListDS, RuleRateListDS };
