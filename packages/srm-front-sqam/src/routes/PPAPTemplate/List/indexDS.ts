import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { ListCustomizeCode } from '../utils/type';

export const ListDS = (): DataSetProps => {
  const organizationId = getCurrentOrganizationId();
  return {
    pageSize: 20,
    autoQuery: false,
    selection: false,
    childrenField: 'children',
    paging: 'server',
    primaryKey: 'templateId',
    fields: [
      {
        name: 'templateStatus',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.templateStatus`).d('模板状态'),
        lookupCode: 'SQAM.PPAP_TEMPLATE_STATUS',
      },
      {
        name: 'displayStatus',
        type: FieldType.string,
        label: intl.get(`hzero.common.common.status`).d('状态'),
        lookupCode: 'SQAM.PPAP_TEMPLATE_STATUS',
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('hzero.common.oprate').d('操作'),
      },
      {
        name: 'templateNum',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.templateNum`).d('模板编码'),
      },
      {
        name: 'templateName',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.template.templateName`).d('模板名称'),
      },
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('hzero.common.model.status.enable').d('启用'),
        trueValue: 1,
        falseValue: 0,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        label: intl.get(`sqam.ppap.view.title.version`).d('版本'),
      },
    ],
    queryParameter: {
      customizeUnitCode: Object.values(ListCustomizeCode).join(),
    },
    transport: {
      read: () => ({
        url: `${SRM_SQAM}/v1/${organizationId}/access-template-headers/page`,
        method: 'GET',
      }),
      submit: ({ data }) => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-template-headers/enable`,
          method: 'PUT',
          data: data[0],
        };
      },
    },
  };
};
