import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const indexDS = () => ({
  dataToJSON: 'all',
  primaryKey: 'labelLineId',
  selection: false,
  pagination: false,
  forceValidate: true,
  fields: [
    {
      label: intl.get('slod.deliveryWorkbench.model.common.exportStatus').d('同步记录'),
      name: 'exportStatusMeaning', // 同步记录
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.synchronous').d('同步执行'),
      name: 'synchronous', // 同步执行
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.exportMessage').d('反馈信息'),
      name: 'exportMessage', // 反馈信息
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.externalSystemCode').d('外部系统'),
      name: 'externalSystemCode', // 外部系统
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.exportType').d('接口代码'),
      name: 'exportType', // 接口代码
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.exportTypeMeaning').d('接口名称'),
      name: 'exportTypeMeaning', // 接口名称
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { nodeTemplateCode } = data.params || {};
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/export-record?campKey=s`,
        method: 'GET',
        data: data?.params,
      };
    },
  },
});

export { indexDS };
