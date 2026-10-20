import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { formatTreeData } from '../FormulaManage/utils';

const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  selection: false, // 导出做了再放出
  idField: 'bomTemplateId',
  parentField: 'parentId',
  expandField: 'expand',
  paging: 'server',
  pageSize: 20,
  modifiedCheck: false,
  fields: [
    {
      name: 'bomTemplateStatus',
      label: intl.get('hzero.common.templateStatus').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'bomTemplateCode',
      label: intl.get(`spc.bomDimConfig.model.bomTemplateCode`).d('结构编码'),
    },
    {
      name: 'bomTemplateName',
      label: intl.get(`spc.bomDimConfig.model.bomTemplateName`).d('结构名称'),
    },
    {
      name: 'bomTemplateVersion',
      label: intl.get('spc.bomDimConfig.model.bomTemplateVersion').d('版本'),
      type: 'number',
    },
    {
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      name: 'creationDate',
    },
    {
      label: intl.get('entity.roles.creator').d('创建人'),
      name: 'createdBy',
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_SPC}/v1/${organizationId}/price-bom-template/list`,
      method: 'GET',
      params: {
        ...params,
        customizeUnitCode: 'SPC.PRICE_BOM_DIM_CONFIG.LIST.FILTER',
      },
      // data,
      transformResponse: (data) => {
        return formatTreeData(data, 'bomTemplateId', 'bomTemplateStatus');
      },
    }),
  },
});

export { tableDS };
