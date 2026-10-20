// import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

// const organizationId = getCurrentOrganizationId();

const detailDS = () => {
  return {
    autoLocateAfterCreate: true,
    paging: false,
    dataToJSON: 'all',
    rowKeys: 'labelId',
    autoQuery: false,
    fields: [
      {
        name: 'labelCode',
        type: 'string',
        pattern: /^[0-9A-Za-z]{1,30}$/,
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelCode').d('标签编码'),
        required: true,
      },
      {
        name: 'labelName',
        type: 'string',
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelName').d('标签名称'),
        required: true,
      },
      {
        name: 'labelDescription',
        required: true,
        type: 'string',
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelDescription').d('标签描述'),
      },
      {
        name: 'docLabelEntityList',
        type: 'object',
        lovCode: 'SADA.SIMPLE_STRUCTURE_VIEW',
        multiple: true,
        required: true,
        label: intl.get('spfm.cnfLabel.model.cnfLabel.docLabelEntityList').d('分配适用范围'),
      },
      {
        name: 'icon',
        type: 'string',
        required: true,
        label: intl.get('hzero.c7nProUI.Icon.icons').d('图标'),
      },
      {
        name: 'level',
        required: true,
        type: 'string',
        label: intl.get('spfm.cnfLabel.model.level').d('层级'),
        lookupCode: 'SMDM.DOC_LABEL_LEVEL',
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        defaultValue: 1,
        falseValue: 0,
        label: intl.get('hzero.common.enabledFlag').d('是否启用'),
      },
      {
        name: 'orderSeq',
        type: 'number',
        required: true,
        step: 1,
        label: intl.get('spfm.configServer.model.configServer.orderSeq').d('序号'),
      },
    ],
  };
};

const tenantLineDS = () => {
  return {
    paging: false,
    rowKey: 'assignValueId',
    fields: [
      {
        name: 'tenantNum',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.tenantNum').d('租户编号'),
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.tenantName').d('租户名称'),
      },
      {
        name: 'tenantId',
      },
    ],
  };
};

export { detailDS, tenantLineDS };
