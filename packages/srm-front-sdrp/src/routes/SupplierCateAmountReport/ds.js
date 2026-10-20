import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const tenantId = getCurrentOrganizationId();

export default function ReportDs({ customizeUnitCodes }) {
  return {
    // autoQuery: true,
    pageSize: 20,
    // selection: false,
    fields: [
      {
        label: intl.get('sdrp.suppierCate.model.companyName').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get('sdrp.suppierCate.model.supplierNum').d('供应商ERP编码'),
        name: 'supplierNum',
      },
      {
        label: intl.get('sdrp.suppierCate.model.supplierCompanyNum').d('供应商平台编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get('sdrp.suppierCate.model.supplierName').d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sdrp.suppierCate.model.supplierComapanyCategory').d('供应商类别'),
        name: 'supplierComapanyCategory',
      },
      {
        label: intl.get('sdrp.suppierCate.model.stageCode').d('供应商生命周期'),
        name: 'stageDescription',
      },
      {
        label: intl.get('sdrp.suppierCate.model.registeredAddress').d('所在地'),
        name: 'registeredAddress',
      },
      {
        label: intl.get('sdrp.suppierCate.model.addressDetail').d('详细地址'),
        name: 'addressDetail',
      },
      {
        label: intl.get('sdrp.suppierCate.model.name').d('联系人'),
        name: 'name',
      },
      {
        label: intl.get('sdrp.suppierCate.model.mobilePhone').d('联系方式'),
        name: 'mobilephone',
      },
      {
        label: intl.get('sdrp.suppierCate.model.categoryCode').d('品类编码'),
        name: 'categoryCode',
      },
      {
        label: intl.get('sdrp.suppierCate.model.categoryName').d('品类名称'),
        name: 'categoryName',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumPoTaxAmount').d('采购金额'),
        name: 'sumPoTaxAmount',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumPoQuantity').d('采购数量'),
        name: 'sumPoQuantity',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumSinvTaxAmount').d('交易金额'),
        name: 'sumSinvTaxAmount',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumSinvQuantity').d('交易数量'),
        name: 'sumSinvQuantity',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumSinvReQuantity').d('退货数量'),
        name: 'sumSinvReQuantity',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumSinvReTaxAmount').d('退货金额'),
        name: 'sumSinvReTaxAmount',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumPoQuantityLast').d('去年同期采购数量'),
        name: 'sumPoQuantityLast',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumPoTaxAmountLast').d('去年同期采购金额'),
        name: 'sumPoTaxAmountLast',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumSinvQuantityLast').d('去年同期交易数量'),
        name: 'sumSinvQuantityLast',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumSinvTaxAmountLast').d('去年同期交易金额'),
        name: 'sumSinvTaxAmountLast',
      },

      {
        label: intl.get('sdrp.suppierCate.model.sumPoTaxAmountSub').d('采购金额差异'),
        name: 'sumPoTaxAmountSub',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumPoTaxAmountSubRatio').d('采购金额差异百分比'),
        name: 'sumPoTaxAmountSubRatio',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumSinvTaxAmountSub').d('交易金额差异'),
        name: 'sumSinvTaxAmountSub',
      },
      {
        label: intl.get('sdrp.suppierCate.model.sumSinvTaxAmountSubRatio').d('交易金额差异百分比'),
        name: 'sumSinvTaxAmountSubRatio',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${tenantId}/supplier/report/category-amount-query`,
          method: 'GET',
          params: {
            ...params,
            tenantId,
            customizeUnitCode: customizeUnitCodes.join(','),
          },
        };
      },
    },
  };
}
