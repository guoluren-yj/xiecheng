import React from 'react';
import intl from 'utils/intl';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Icon } from 'choerodon-ui/pro';

const unitFilterFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'status',
      label: intl.get('hpfm.individual.import.status').d('状态'),
    },
    {
      name: 'unitName',
      label: intl.get('hpfm.individual.import.unitName').d('单元名称'),
    },
    {
      name: 'unitCode',
      label: intl.get('hpfm.individual.import.unitCode').d('单元编码'),
    },
  ],
});

const fieldFilterFormDS = () => ({
  fields: [
    {
      name: 'status',
      label: intl.get('hpfm.individual.import.status').d('状态'),
    },
    {
      name: 'fieldName',
      label: intl.get('hpfm.individual.import.fieldName').d('字段名称'),
    },
    {
      name: 'fieldCode',
      label: intl.get('hpfm.individual.import.fieldCode').d('字段编码'),
    },
    {
      name: 'model',
      label: intl.get('hpfm.individual.import.model').d('所属模型'),
    },
  ],
});

const ImportUnitTableDs = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'unitName',
      label: intl.get('hpfm.individual.import.unitName').d('单元名称'),
    },
    {
      name: 'status',
      label: intl.get('hzero.common.components.import.model.dataStatus').d('状态'),
    },
    { name: 'message', label: intl.get('hzero.common.message.errorMessage').d('错误信息') },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/import/line-log`,
        method: 'POST',
        params: {
          ...params,
          ...filterNullValueObject(data),
        },
      };
    },
  },
});

const ImportFieldTableDs = () => ({
  selection: false,
  paging: false,
  fields: [
    { name: 'fieldCode', label: intl.get('hpfm.customize.common.fieldCode').d('字段编码') },
    { name: 'fieldName', label: intl.get('hpfm.customize.common.fieldName').d('字段名称') },
    {
      name: 'fieldType',
      label: intl.get('hpfm.individuationUnit.model.individuationUnit.fieldType').d('字段类型'),
    },
    {
      name: 'modelName',
      label: intl.get('hpfm.individual.model.config.modelCategory').d('所属模型'),
    },
    {
      name: 'status',
      label: intl.get('hzero.common.components.import.model.dataStatus').d('数据状态'),
    },
    { name: 'message', label: intl.get('hzero.common.message.errorMessage').d('错误信息') },
  ],
});

/**
 * @param {String} status
 * @param {import('react').CSSProperties} styles
 * @returns {import('react').ReactNode}
 */
const ImportStatusRenderer = (status, styles) => {
  switch (status) {
    case 'pass':
      return <Icon type="check_circle" style={{fontSize: "16px", color: "#47B881", ...styles}} />;
    case 'error':
      return <Icon type="cancel" style={{fontSize: "16px", color: "#F56349", ...styles}} />;
    case 'warn':
      return <Icon type="error" style={{fontSize: "16px", color: "#FCA000", ...styles}} />;
    default:
      return <Icon type="access_time_filled" style={{fontSize: "16px", color: "#29bece", ...styles}} />;
  }
};

export {
  unitFilterFormDS,
  fieldFilterFormDS,
  ImportUnitTableDs,
  ImportFieldTableDs,
  ImportStatusRenderer,
};
