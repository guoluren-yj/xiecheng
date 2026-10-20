import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

import { getFieldHelp } from '../utils/utils';

const organizationId = getCurrentOrganizationId();

const getFields = (props = {}) => {
  const { tableTabFlag = true, configName = '' } = props || {};
  return [
    {
      name: 'visualFlag',
      type: 'boolean',
      required: true,
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.currentTab').d('显示当前页签信息'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      help: getFieldHelp(configName),
    },
    tableTabFlag && {
      name: 'atLeastFlag',
      type: 'number',
      defaultValue: 1,
      precision: 0,
      step: 1,
      min: 0,
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.atLeastFilled').d('至少填写行数'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.fillRemark').d('填写说明'),
    },
    {
      name: 'orderSeq',
      type: 'number',
      required: true,
      defaultValue: 1,
      precision: 0,
      step: 1,
      min: 1,
      label: intl.get('sslm.common.model.field.orderSeq').d('排序'),
    },
    {
      name: 'restrictDataStatus',
      lookupCode: 'SSLM.RESTRICT_DATA_STATUS',
      label: intl.get('sslm.common.model.field.restrictDataStatus').d('限制数据状态'),
    },
  ].filter(Boolean);
};

// 头DS
const headerDS = (props = {}) => ({
  fields: getFields(props),
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { assignId, strategyCfBasicId, configName, tenantId } = {},
      } = dataSet;
      const isPlatform = dataSet.getState('isPlatform');
      const path = `${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-headers`;
      const url = isPlatform ? `${path}/site/${assignId}` : `${path}/${assignId}`;
      return {
        url,
        method: 'GET',
        params: {
          strategyCfBasicId,
          configName,
          tenantId,
        },
        data: {},
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

// 表格ds
const tableDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'fieldCode',
      type: 'string',
      required: true,
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.fieldCode').d('字段编码'),
    },
    {
      name: 'fieldDescription',
      required: true,
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.fieldName').d('字段名称'),
    },
    {
      name: 'visualFlag',
      type: 'boolean',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.enable').d('启用'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.required').d('要求必输'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

export { headerDS, tableDS };
