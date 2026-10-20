import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const queryFormDS = () => ({
  fields: [
    {
      name: 'status',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
      multiple: ',',
    },
  ],
});

const BasicInfoDS = () => ({
  primaryKey: 'bomViewId',
  selection: false,
  fields: [
    {
      name: '_dataStatus',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
    },
    {
      name: '_info',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.message').d('错误信息'),
    },
    {
      name: 'bomViewStatus',
      label: intl.get('hzero.common.templateStatus').d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_STATUS',
    },
    {
      name: 'bomViewCode',
      label: intl.get(`spc.bomViewWorkbench.model.bomViewCode`).d('价格BOM编码'),
    },
    {
      name: 'bomViewName',
      label: intl.get(`spc.bomViewWorkbench.model.bomViewName`).d('价格BOM名称'),
    },
    {
      name: 'companyId',
      label: intl.get(`spc.bomViewWorkbench.model.bomViewScope`).d('公司'),
    },
    {
      name: 'bomViewItemId',
      label: intl.get('spc.bomViewWorkbench.model.bomViewItemId').d('主物料'),
    },
    {
      name: 'bomViewSupplierId',
      label: intl.get('spc.bomViewWorkbench.model.bomViewSupplierId').d('供应商'),
    },
    {
      name: 'bomTemplateCode',
      label: intl.get('spc.bomViewWorkbench.model.bomTemplateId').d('BOM结构'),
    },
    {
      name: 'bomTemplateName',
      bind: 'bomTemplateId.bomTemplateName',
    },
  ],
  transport: {
    read: ({data}) => {
      const { params, ...otherData } = data;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/lib-mains-import`,
        method: 'GET',
        data: {
          ...params,
          ...otherData,
        },
        transformResponse: (res) => {
          const dealData = JSON.parse(res);
          const { content = [] } = dealData;
          const result = content.map((item) => {
            const { _data = '{}', ...reset } = item;
            const newData = JSON.parse(_data);
            return { ...newData, ...reset };
          });
          return { ...dealData, content: result };
        },
      };
    },
  },
});

const DetailInfoDS = () => ({
  primaryKey: 'bomDetailsLineId',
  selection: false,

  // table表单显示的字段
  fields: [
    {
      name: '_dataStatus',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
    },
    {
      name: '_info',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.message').d('错误信息'),
    },
    {
      name: 'dimensionType',
      label: intl.get(`spc.bomViewWorkbench.model.unitPrice`).d('单价'),
      lookupCode: 'SSRC.PRICE_SOURCE_TYPE',
    },
    {
      name: 'dimensionValue',
      label: intl.get(`spc.bomViewWorkbench.model.fixedValueOrsourcePricelib`).d('固定值/来源价格库'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { params, ...otherData } = data;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/lib-mains-import`,
        method: 'GET',
        data: {
          ...params,
          ...otherData,
        },
        transformResponse: (res) => {
          const dealData = JSON.parse(res);
          const { content = [] } = dealData;
          const result = content.map((item) => {
            const { _data = '{}', ...reset } = item;
            const newData = JSON.parse(_data);
            return { ...newData, ...reset };
          });
          return { ...dealData, content: result };
        },
      };
    },
  },
});




export { queryFormDS, BasicInfoDS, DetailInfoDS };
