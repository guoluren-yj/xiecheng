import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const addedDS = () => ({
  paging: 'server',
  parentField: 'parentIndicatorId',
  idField: 'indicatorId',
  autoQuery: true,
  cacheSelection: true,
  fields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorName`).d('指标描述'),
    },
    {
      name: 'scoreTypeMeaning',
      label: intl.get(`sslm.supplierDocManage.model.docManage.evaluationWay`).d('评分方式'),
    },
    {
      name: 'evalWeight',
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      step: 0.01,
    },
    {
      name: 'evalStandard',
      label: intl.get(`sslm.supplierDocManage.model.docManage.evaluationStandard`).d('评分标准'),
    },
  ],
  queryFields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorName`).d('指标描述'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { evalHeaderId, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-headers/tree-selected/${evalHeaderId}`,
        method: 'GET',
        data: {
          ...other,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { evalHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-line/deleteKpiEvalLineByIds/${evalHeaderId}`,
        method: 'POST',
        data,
      };
    },
    submit: ({ data, dataSet }) => {
      const { queryParameter: { evalHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-line/createOrUpdate/${evalHeaderId}`,
        data,
        method: 'POST',
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.leafFlag === 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
    append: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.leafFlag === 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});

const notAddedDS = () => ({
  autoQuery: true,
  paging: 'server',
  parentField: 'parentIndicatorId',
  idField: 'indicatorId',
  dataToJSON: 'selected',
  cacheSelection: true,
  fields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorName`).d('指标描述'),
    },
    {
      name: 'scoreTypeMeaning',
      label: intl.get(`sslm.supplierDocManage.model.docManage.evaluationWay`).d('评分方式'),
    },
    {
      name: 'evalWeight',
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
    },
    {
      name: 'evalStandard',
      label: intl.get(`sslm.supplierDocManage.model.docManage.evaluationStandard`).d('评分标准'),
    },
  ],
  queryFields: [
    {
      name: 'indicatorCode',
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorCode`).d('指标编码'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorName`).d('指标描述'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { evalHeaderId, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-headers/tree-not-selected/${evalHeaderId}`,
        method: 'GET',
        data: {
          ...other,
        },
      };
    },
    submit: ({ data, dataSet }) => {
      const { queryParameter: { evalHeaderId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-line/createOrUpdate/${evalHeaderId}`,
        data,
        method: 'POST',
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.leafFlag === 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
    append: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.leafFlag === 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});

export { addedDS, notAddedDS };
