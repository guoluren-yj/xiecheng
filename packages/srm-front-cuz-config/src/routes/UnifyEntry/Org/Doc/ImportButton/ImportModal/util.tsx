import React from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { Icon } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

const unitFilterFormDS = (): DataSetProps => ({
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

const ImportUnitTableDs = (): DataSetProps => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'unitName',
      label: intl.get('hpfm.individual.import.unitName').d('单元名称'),
    },
    {
      name: 'unitCode',
      label: intl.get('hpfm.individual.import.unitCode').d('单元编码'),
    },
    {
      name: 'status',
      label: intl.get('hzero.common.components.import.model.dataStatus').d('状态'),
    },
    { name: 'message', label: intl.get('hzero.common.message.errorMessage').d('错误信息') },
  ],
  transport: {
    read: ({ params, data }) => {
      const {headerData = {}, ...others} = data;
      const { id } = headerData;
      return {
        url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/import/line-log`,
        method: 'POST',
        params: {
          ...params,
          ...filterNullValueObject(others),
          pageId: id,
        },
      };
    },
  },
});

const ImportFieldTableDs = (): DataSetProps => ({
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

const ImportStatusRenderer = status => {
  switch (status) {
    case 'pass':
      return <Icon type="check_circle" style={{fontSize: "16px", color: "#47B881"}} />;
    case 'error':
      return <Icon type="cancel" style={{fontSize: "16px", color: "#F56349"}} />;
    case 'warn':
      return <Icon type="error" style={{fontSize: "16px", color: "#FCA000"}} />;
    default:
      return <Icon type="access_time_filled" style={{fontSize: "16px", color: "#29bece"}} />;
  }
};

export {
  unitFilterFormDS,
  fieldFilterFormDS,
  ImportUnitTableDs,
  ImportFieldTableDs,
  ImportStatusRenderer,
};
