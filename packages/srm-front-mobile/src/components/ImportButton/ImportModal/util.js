import React from 'react';
import intl from 'utils/intl';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Icon } from 'choerodon-ui/pro';

const unitFilterFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'status',
      label: intl.get('smbl.checkRules.import.status').d('状态'),
    },
    {
      name: 'documentCodeOrName',
      label: intl.get('smbl.checkRules.view.tag.documentCodeOrName').d('流程单据名称/编码'),
    },
  ],
});

const fieldFilterFormDS = () => ({
  fields: [
    {
      name: 'status',
      label: intl.get('smbl.checkRules.import.status').d('状态'),
    },
    {
      name: 'fieldName',
      label: intl.get('smbl.checkRules.import.fieldName').d('字段名称'),
    },
    {
      name: 'fieldCode',
      label: intl.get('smbl.checkRules.import.fieldCode').d('字段编码'),
    },
    {
      name: 'model',
      label: intl.get('smbl.checkRules.import.model').d('所属模型'),
    },
  ],
});

const ImportUnitTableDs = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'businessObjectName',
      label: intl.get('smbl.checkRules.import.businessObjectName').d('业务对象名称'),
    },
    {
      name: 'documentCode',
      label: intl.get('smbl.checkRules.view.model.processDocCode').d('流程单据编码'),
    },
    {
      name: 'documentName',
      label: intl.get('smbl.checkRules.model.processDocName').d('流程单据名称'),
    },
    {
      name: 'processDocBindObj',
      label: intl.get('smbl.checkRules.model.processDocBindObj').d('绑定业务对象'),
    },
    {
      name: 'importStatus',
      label: intl.get('hzero.common.components.import.model.dataStatus').d('状态'),
    },
    { name: 'errMsg', label: intl.get('hzero.common.message.errorMessage').d('错误信息') },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/import-history/detail`,
        method: 'GET',
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
    { name: 'fieldCode', label: intl.get('smbl.checkRules.common.fieldCode').d('字段编码') },
    { name: 'fieldName', label: intl.get('smbl.checkRules.common.fieldName').d('字段名称') },
    {
      name: 'fieldType',
      label: intl.get('smbl.checkRules.model.individuationUnit.fieldType').d('字段类型'),
    },
    {
      name: 'modelName',
      label: intl.get('smbl.checkRules.model.config.modelCategory').d('所属模型'),
    },
    {
      name: 'status',
      label: intl.get('hzero.common.components.import.model.dataStatus').d('数据状态'),
    },
    { name: 'message', label: intl.get('hzero.common.message.errorMessage').d('错误信息') },
  ],
});

const ImportStatusRenderer = (status) => {
  switch (status) {
    case 'SUCCESS':
      return <Icon type="check_circle" style={{ fontSize: '16px', color: '#47B881' }} />;
    case 'FAIL':
      return <Icon type="cancel" style={{ fontSize: '16px', color: '#F56349' }} />;
    case 'WARN':
      return <Icon type="error" style={{ fontSize: '16px', color: '#FCA000' }} />;
    case 'IMPORTING':
      return <Icon type="sync" style={{ fontSize: '16px', color: '#47B881' }} />;
    default:
      return <Icon type="access_time_filled" style={{ fontSize: '16px', color: '#29bece' }} />;
  }
};

export {
  unitFilterFormDS,
  fieldFilterFormDS,
  ImportUnitTableDs,
  ImportFieldTableDs,
  ImportStatusRenderer,
};
