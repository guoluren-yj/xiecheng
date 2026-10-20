import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { getPriceName, getNetPriceName } from '@/utils/utils';

const priceDS = ({ doubleUnitFlag = false, bidFlag = false }) => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        name: 'rfxLineItemNum',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemNum`).d('行号'),
      },
      {
        name: 'itemCode',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
      },
      {
        name: 'quotationSecondaryPrice',
        type: 'number',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
      },
      {
        name: 'validNetSecondaryPrice',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'quotationPrice',
        type: 'number',
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'validNetPrice',
        type: 'number',
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.companyNum`).d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
      },
    ],
    transport: {
      read: ({ dataSet, params }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;

        return {
          url: `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/bid/announcement/search/quotation/line`,
          method: 'POST',
          data: {
            ...commonProps,
          },
          params: {
            ...params,
            customizeUnitCode: `SSRC.${
              bidFlag ? 'BID_' : ''
            }SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_LINE`,
          },
        };
      },
    },
  };
};

const amountDS = ({ bidFlag = false }) => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        name: 'supplierCompanyNum',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.companyNum`).d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
      },
      {
        name: 'qtnTotalAmount',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountTax`)
          .d('总价(含税)'),
      },
      {
        name: 'qtnNetAmount',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountNotTax`)
          .d('总价(不含税)'),
      },
    ],
    transport: {
      read: ({ dataSet, params }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;

        return {
          url: `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/bid/announcement/search/quotation/header`,
          method: 'POST',
          data: {
            ...commonProps,
          },
          params: {
            ...params,
            customizeUnitCode: `SSRC.${
              bidFlag ? 'BID_' : ''
            }SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_HEADER`,
          },
        };
      },
    },
  };
};

export { priceDS, amountDS };
