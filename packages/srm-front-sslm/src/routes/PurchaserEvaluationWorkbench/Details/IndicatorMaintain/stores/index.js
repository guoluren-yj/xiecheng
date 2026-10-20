import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const addedDS = () => ({
  paging: false,
  primaryKey: 'indicatorId',
  parentField: 'parentIndicatorId',
  idField: 'indicatorId',
  autoQuery: true,
  forceValidate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.indicatorName`).d('指标描述'),
    },
    {
      name: 'scoreTypeMeaning',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.evaluationWay`).d('评分方式'),
    },
    {
      name: 'evalWeight',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.scoreWeight`).d('权重'),
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      step: 0.01,
    },
    {
      name: 'evalStandard',
      label: intl
        .get(`sslm.siteInvestigateReport.model.docManage.evaluationStandard`)
        .d('评分标准'),
    },
  ],
  queryFields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.indicatorName`).d('指标描述'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { evalHeaderId, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/tree-selected/${evalHeaderId}`,
        method: 'GET',
        data: {
          ...other,
          customizeUnitCode: 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO_INDICATOR',
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { evalHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/deleteSiteEvalLineByIds/${evalHeaderId}`,
        method: 'POST',
        data,
      };
    },
    submit: ({ data, dataSet }) => {
      const { queryParameter: { evalHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/createOrUpdate/${evalHeaderId}`,
        data,
        method: 'POST',
      };
    },
  },
  events: {
    select: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.select(i));
      }
    },
    unSelect: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.unSelect(i));
      }
    },
  },
});

const notAddedDS = () => ({
  autoQuery: true,
  paging: false,
  childrenField: 'children',
  primaryKey: 'indicatorId',
  dataToJSON: 'selected',
  fields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.indicatorName`).d('指标描述'),
    },
    {
      name: 'scoreTypeMeaning',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.evaluationWay`).d('评分方式'),
    },
    {
      name: 'evalWeight',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.scoreWeight`).d('权重'),
    },
    {
      name: 'evalStandard',
      label: intl
        .get(`sslm.siteInvestigateReport.model.docManage.evaluationStandard`)
        .d('评分标准'),
    },
  ],
  queryFields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.siteInvestigateReport.model.docManage.indicatorName`).d('指标描述'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/indicators/new/tree`,
      method: 'GET',
    },
    submit: ({ data, dataSet }) => {
      const { queryParameter: { evalHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/createOrUpdate/${evalHeaderId}`,
        data,
        method: 'POST',
      };
    },
  },
  events: {
    select: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.select(i));
      }
    },
    unSelect: ({ dataSet, record }) => {
      if (record.children) {
        record.children.forEach(i => dataSet.unSelect(i));
      }
    },
  },
});

export { addedDS, notAddedDS };
