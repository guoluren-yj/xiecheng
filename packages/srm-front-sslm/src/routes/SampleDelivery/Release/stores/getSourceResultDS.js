/*
 * @Date: 2021-12-14 11:16:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM.SAMPLE_DELIVERY_PUBLISH.SOURCE_RESULT_SEARCH_BAR',
  'SSLM.SAMPLE_DELIVERY_PUBLISH.SOURCE_RESULT_LIST',
];

const sourceResultDS = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'resultId',
  fields: [
    {
      name: 'sourceNum',
      label: intl.get('sslm.sample.modal.sourceResult.sourceNumAndItemNum').d('寻源单号-行号'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.sample.modal.sourceResult.supplierCompanyNum').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.sample.modal.sourceResult.supplierCompanyName').d('供应商名称'),
    },
    {
      name: 'supplierPendingFlag',
      label: intl.get('sslm.sample.modal.sourceResult.isPending').d('是否暂挂'),
    },
    {
      name: 'erpSupplierCompanyNum',
      label: intl.get('sslm.sample.modal.sourceResult.erpSupplierCompanyNum').d('ERP供应商编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.sample.modal.sourceResult.itemName').d('物料描述'),
    },
    {
      name: 'itemCode',
      label: intl.get('sslm.sample.modal.sourceResult.itemCode').d('物料编码'),
    },
    {
      name: 'categoryName',
      label: intl.get('sslm.sample.modal.sourceResult.itemCategoryName').d('物料分类'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sslm.sample.modal.sourceResult.currencyCode').d('币种'),
    },
    {
      name: 'quantity',
      label: intl.get('sslm.sample.modal.sourceResult.quantity').d('数量'),
    },
    {
      name: 'taxRate',
      label: intl.get('sslm.sample.modal.sourceResult.taxRate').d('税率'),
    },
    {
      name: 'taxPrice',
      label: intl.get('sslm.sample.modal.sourceResult.taxPrice').d('单价(含税)'),
    },
    {
      name: 'unitPrice',
      label: intl.get('sslm.sample.modal.sourceResult.unitPrice').d('单价(不含税)'),
    },
    {
      name: 'validPromisedDate',
      type: 'date',
      label: intl.get('sslm.sample.modal.sourceResult.validPromisedDate').d('承诺交货日期'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.sample.modal.sourceResult.companyName').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.sample.modal.sourceResult.ouName').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get('sslm.sample.modal.sourceResult.purOrganizationName').d('采购组织'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('sslm.sample.modal.sourceResult.invOrganizationName').d('库存组织'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.creationDate').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/source/result/result-list/api-lov`,
        method: 'GET',
        data: {
          ...data,
          queryPurpose: 'supplierSendSep', // 用于后端区分入口
          customizeUnitCode: customizeUnitCode.join(),
        },
      };
    },
  },
});

export { sourceResultDS };
