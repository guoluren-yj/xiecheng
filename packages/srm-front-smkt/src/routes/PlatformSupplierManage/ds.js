import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

const tableDs = () => ({
  autoQuery: true,
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'enableFlag',
      label: intl.get('smkt.platformSupplierManage.modal.enableFlag').d('状态'),
    },
    {
      name: 'companyInfosVO',
      type: 'object',
    },
    {
      name: 'companyName',
      label: intl.get('smkt.supplierManage.modal.companyName').d('供应商名称'),
      bind: 'companyInfosVO.companyName',
    },
    {
      name: 'companyNum',
      label: intl.get('smkt.supplierManage.modal.companyNum').d('供应商编码'),
      bind: 'companyInfosVO.companyNum',
    },
    {
      name: 'logoUrl',
      label: intl.get('smkt.supplierManage.modal.logoUrl').d('供应商图片'),
      bind: 'companyInfosVO.logoUrl',
    },
    {
      name: 'description',
      bind: 'companyInfosVO.description',
    },
    {
      name: 'website',
      bind: 'companyInfosVO.website',
    },
    {
      name: 'managementList',
      label: intl.get('smkt.supplierManage.modal.managementList').d('经营性质'),
      type: 'object',
    },
    {
      name: 'industryList',
      label: intl.get('smkt.supplierManage.modal.industryList').d('行业性质'),
      type: 'object',
      bind: 'companyInfosVO.industryList',
    },
    {
      name: 'industryCategoryList',
      label: intl.get('smkt.supplierManage.modal.industryCategoryList').d('主营品类'),
      type: 'object',
      bind: 'companyInfosVO.industryCategoryList',
    },
    {
      name: 'serviceAreaList',
      type: 'object',
      bind: 'companyInfosVO.serviceAreaList',
    },
    {
      name: 'creationDate',
      label: intl.get('smkt.platformSupplierManage.modal.creationDate').d('创建日期'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.table.column.options').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smkt/v1/pick-suppliers/platform`,
        method: 'GET',
        data: {
          ...filterNullValueObject({
            tenantId: 0,
            ...data,
            customizeUnitCode: 'SMKT.MARKT.PLATFORM_SUPPLIER_MANAGE.SEARCHBAR',
          }),
        },
      };
    },
  },
});

const formDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'companyLov',
      label: intl.get('smkt.supplierManage.modal.companyNum').d('供应商编码'),
      required: true,
      lovCode: 'SMKT.ALL_SUPPLIER',
      type: 'object',
      textField: 'companyNum',
      valueField: 'companyId',
      ignore: 'always',
    },
    {
      name: 'supplierId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'supplierCode',
      bind: 'companyLov.companyNum',
    },
    {
      name: 'companyName',
      label: intl.get('smkt.supplierManage.modal.companyName').d('供应商名称'),
      required: true,
      disabled: true,
      bind: 'companyLov.companyName',
    },
  ],
});

export { tableDs, formDs };
