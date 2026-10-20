import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const uniquelineListDataSet = (lineId) => ({
  autoQuery: false,
  dataToJSON: 'all',
  primaryKey: 'labelLineExtId',
  selection: !lineId && 'multiple',
  modifiedCheck: false,
  forceValidate: true,
  // cacheSelection: true,
  // cacheModified: true,
  pageSize: 20,
  fields: [
    {
      label: intl.get('slod.deliveryWorkbench.model.common.uniqueLabelNum').d('唯一标签编码'),
      name: 'uniqueLabelNum', // 唯一标签编码
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.lineExExtNum').d('标签行'),
      name: 'lineExtNum', // 标签行
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
      name: 'itemCode', // 物料编码
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
      name: 'itemName', // 物料名称
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
      name: 'unitPackageQuantity', // 单包装数
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.volumeLength').d('体积长（CM)'),
      name: 'volumeLength', // 体积长（CM
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.volumeWidth').d('体积宽（CM)'),
      name: 'volumeWidth', // 体积宽（CM)
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.volumeHeight').d('体积高（CM)'),
      name: 'volumeHeight', // 体积高（CM)
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.netWeight').d('净重（KG)'),
      name: 'netWeight', // 净重（KG)
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.grossWeight').d('毛重（KG)'),
      name: 'grossWeight', // 毛重（KG)
      type: 'number',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/unique-label/list`,
        method: 'GET',
        data: data?.params,
      };
    },
  },
});

export { uniquelineListDataSet };
