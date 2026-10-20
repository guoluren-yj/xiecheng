// import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const isTenantRole = isTenantRoleLevel();

export default function TableDs() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'labelCode',
        type: 'string',
        required: true,
        disabled: true,
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelCode').d('标签编码'),
      },
      {
        name: 'labelName',
        type: 'string',
        required: true,
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelName').d('标签名称'),
      },
      {
        name: 'labelDescription',
        type: 'string',
        required: true,
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
        typeof: 'string',
        required: true,
        label: intl.get('hzero.c7nProUI.Icon.icons').d('图标'),
      },
      {
        name: 'level',
        typeof: 'string',
        required: true,
        label: intl.get('spfm.cnfLabel.model.level').d('层级'),
        lookupCode: 'SMDM.DOC_LABEL_LEVEL',
      },
      {
        name: 'orderSeq',
        required: true,
        typeof: 'string',
        label: intl.get('spfm.configServer.model.configServer.orderSeq').d('序号'),
      },
      {
        name: 'enabledFlag',
        typeof: 'boolean',
        trueValue: 1,
        defaultValue: 1,
        falseValue: 0,
        label: intl.get('hzero.common.button.status').d('状态'),
      },
      {
        name: 'tenantId',
        label: intl.get('hzero.common.source').d('来源'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'labelCode',
        type: 'string',
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelCode').d('标签编码'),
      },
      {
        name: 'labelName',
        type: 'string',
        label: intl.get('spfm.cnfLabel.model.cnfLabel.labelName').d('标签名称'),
      },
      {
        name: 'level',
        typeof: 'string',
        label: intl.get('spfm.cnfLabel.model.level').d('层级'),
        lookupCode: 'SMDM.DOC_LABEL_LEVEL',
      },
      {
        name: 'enabledFlag',
        type: 'number',
        lookupCode: 'SPFM.ENABLED_FLAG',
        label: intl.get('hzero.common.enabledFlag').d('是否启用'),
      },
    ],

    transport: {
      read: () => {
        return {
          url: isTenantRole
            ? `${SRM_PLATFORM}/v1/${organizationId}/doc-labels`
            : `${SRM_PLATFORM}/v1/doc-labels`,
          method: 'GET',
        };
      },
    },
  };
}
