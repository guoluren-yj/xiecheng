import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get('smpc.import.model.batchNum').d('批次号'),
      name: 'batchNum',
    },
    {
      label: intl.get('smpc.product.model.catalogCode').d('目录编码'),
      name: 'catalogCode',
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
    read: () => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/catalog-icon-imports`,
        method: 'GET',
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
