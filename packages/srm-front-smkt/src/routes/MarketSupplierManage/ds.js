import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export default (isSrm = true, config = {}) => {
  const { params = {}, code } = config;
  const tenantId = isSrm ? 0 : organizationId;
  const fields = [
    {
      name: 'companyInfosVO',
      type: 'object',
    },
    {
      name: 'initiationFlag',
      label: intl.get('smkt.supplierManage.modal.initiationFlag').d('意向状态'),
      type: 'number',
      filter: !isSrm,
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
      name: 'operation',
      label: intl.get('hzero.common.table.column.options').d('操作'),
    },
  ];
  return {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    fields: fields.filter((f) => f.filter !== false),
    transport: {
      read({ data }) {
        return {
          url: `/smkt/v1/${organizationId}/pick-suppliers`,
          method: 'GET',
          data: {
            ...filterNullValueObject({ tenantId, ...data, ...params, customizeUnitCode: code }),
          },
        };
      },
    },
  };
};
