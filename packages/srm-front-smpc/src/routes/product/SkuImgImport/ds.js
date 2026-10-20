import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const SRM_SMPC = '/smpc';
const organizationId = getCurrentOrganizationId();

const tableDs = (searchCode) => ({
  selection: false,
  autoQuery: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get('smpc.import.model.batchNum').d('批次号'),
      name: 'batchNum',
    },
    {
      label: intl.get('smpc.import.model.skuItemCode').d('商品编码/物料编码'),
      name: 'skuCode',
    },
    {
      label: intl.get('smpc.import.model.fileName').d('文件名称'),
      name: 'imageName',
    },
    {
      label: intl.get('smpc.import.model.fileSize').d('文件大小'),
      name: 'imageSize',
    },
    {
      label: intl.get('smpc.import.model.importResult').d('导入结果'),
      name: 'importStatusMeaning',
    },
    {
      label: intl.get('smpc.import.model.importErrorMsg').d('导入报错信息'),
      name: 'errorMsg',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/sku-image-imports`,
        method: 'GET',
        data: { ...data, customizeUnitCode: searchCode },
      };
    },
  },
});

const filterDs = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get('smpc.import.model.importStatus').d('校验结果'),
      name: 'importStatus',
      lookupCode: 'SMPC.IMAGE_IMPORT_STATUS',
    },
  ],
});

export { tableDs, filterDs };
