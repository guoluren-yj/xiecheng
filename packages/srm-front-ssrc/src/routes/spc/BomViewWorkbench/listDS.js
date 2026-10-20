import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { formatTreeData } from '../FormulaManage/utils';

const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  selection: 'multiple', // 导出做了再放出
  idField: 'bomViewId',
  parentField: 'parentId',
  expandField: 'expand',
  paging: 'server',
  pageSize: 20,
  modifiedCheck: false,
  fields: [
    {
      name: 'bomViewStatus',
      label: intl.get('hzero.common.templateStatus').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
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
      name: 'bomViewVersion',
      label: intl.get('spc.bomViewWorkbench.model.bomViewVersion').d('版本'),
      type: 'number',
    },
    {
      label: intl.get('entity.roles.creator').d('创建人'),
      name: 'createdBy',
    },
    {
      name: 'bomViewValidDate',
      label: intl.get('spc.bomViewWorkbench.model.bomViewValidDate').d('有效期'),
      type: FieldType.date,
      range: true,
      transformResponse: (_, record) => {
        const { bomViewValidDateFrom = null, bomViewValidDateTo = null } = record;
        return bomViewValidDateFrom || bomViewValidDateTo
          ? [bomViewValidDateFrom, bomViewValidDateTo]
          : null;
      },
    },
    {
      name: 'bomViewType',
      label: intl.get('spc.bomViewWorkbench.model.bomViewType').d('价格BOM类型'),
    },
    {
      name: 'bomViewItemId',
      label: intl.get('spc.bomViewWorkbench.model.bomViewItemId').d('主物料'),
    },
    {
      name: 'bomTemplateId',
      label: intl.get('spc.bomViewWorkbench.model.bomTemplateId').d('BOM结构'),
    },
    {
      name: 'bomViewSupplierId',
      label: intl.get('spc.bomViewWorkbench.model.bomViewSupplierId').d('供应商'),
    },
    // {
    //   label: intl.get('hzero.common.date.creation').d('创建时间'),
    //   name: 'creationDate',
    // },
    // {
    //   label: intl.get('entity.roles.creator').d('创建人'),
    //   name: 'creationName',
    // },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_SPC}/v1/${organizationId}/price-bom-workbenches/list`,
      method: 'GET',
      params: {
        ...params,
        customizeUnitCode:
          'SPC.PRICE_BOM_WORKBENCH.LIST.FILTER,SPC.PRICE_BOM_WORKBENCH.LIST.ALL_TABLE',
      },
      // data,
      transformResponse: (data) => {
        return formatTreeData(data, 'bomViewId', 'bomViewStatus');
      },
    }),
  },
});

export { tableDS };
