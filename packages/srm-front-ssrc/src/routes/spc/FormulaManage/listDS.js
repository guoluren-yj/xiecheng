import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { formatTreeData } from './utils';

const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  selection: false, // 导出做了再放出
  idField: 'formulaId',
  parentField: 'parentId',
  expandField: 'expand',
  paging: 'server',
  pageSize: 20,
  modifiedCheck: false,
  fields: [
    {
      name: 'formulaStatusCode',
      label: intl.get('hzero.common.templateStatus').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'formulaCode',
      label: intl.get(`spc.formulaManage.model.formulaCode`).d('公式编码'),
    },
    {
      name: 'formulaName',
      label: intl.get(`spc.formulaManage.model.formulaName`).d('公式名称'),
    },
    {
      name: 'formulaTypeCode',
      label: intl.get(`spc.formulaManage.model.formulaTypeCode`).d('公式类型'),
    },
    {
      name: 'assignItemBom',
      label: intl.get(`spc.formulaManage.view.title.assignItemBom`).d('分配物料BOM'),
    },
    {
      name: 'versionNum',
      label: intl.get('spc.formulaManage.model.versionNum').d('版本'),
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
      url: `${SRM_SPC}/v1/${organizationId}/price-formulas/list`,
      method: 'GET',
      params: {
        ...params,
        customizeUnitCode:
          'SPC.PRICE_FORMULA_MANAGE.LIST.FILTER,SPC.PRICE_FORMULA_MANAGE.LIST.ALL_TABLE',
      },
      transformResponse: (data) => {
        return formatTreeData(data, 'formulaId', 'formulaStatusCode');
      },
    }),
  },
});

export { tableDS };
