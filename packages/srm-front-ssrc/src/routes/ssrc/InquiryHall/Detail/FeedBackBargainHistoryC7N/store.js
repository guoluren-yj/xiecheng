import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

import { getQuotationPrice } from '@/utils/utils';

const promptCode = 'ssrc.queryRfq';

const headerDataSet = () => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'supplierCompanyName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
      },
    ],
  };
};

const lineTableDataSet = ({ doubleUnitFlag, quotationName }) => {
  return {
    primaryKey: 'quotationLineId',
    selection: false,
    pageSize: 10,
    fields: [
      {
        label: intl.get(`${promptCode}.model.queryRfq.quotationTimes`).d('报价次数'),
        name: 'quotationCount',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.round`).d('轮次'),
        name: 'quotationRoundNumber',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl
          .get(`${promptCode}.model.queryQuotation.commonquotationPerson`, {
            quotationName,
          })
          .d('{quotationName}人'),
        name: 'quotedByName',
      },
      {
        label: getQuotationPrice(doubleUnitFlag),
        name: 'quotationPrice',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.unitPrice`).d('单价'),
        name: 'quotationSecondaryPrice',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.priceBatch`).d('价格批量'),
        name: 'priceBatchQuantity',
      },
      {
        label: intl
          .get(`${promptCode}.model.queryRfq.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
        name: 'currentQuotationRemark',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.counterOfferPrice`).d('还价-单价'),
        name: 'bargainPrice',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.counterOfferReason`).d('还价理由'),
        name: 'bargainRemark',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.counterBidTime`).d('还价时间'),
        name: 'bargainDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.bargainer`).d('还价人'),
        name: 'bargainByName',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.promisedDeliveryDate`).d('承诺交货期'),
        name: 'promisedDate',
        type: 'date',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.deliveryPeroid`).d('供货周期'),
        name: 'deliveryCycle',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.quotationValidityFrom`).d('报价有效期从'),
        name: 'quotationExpiryDateFrom',
        type: 'date',
      },
      {
        label: intl.get(`${promptCode}.model.queryRfq.quotationValidityTo`).d('报价有效期至'),
        name: 'quotationExpiryDateTo',
        type: 'date',
      },
    ],

    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commons = {} },
        } = dataSet;
        const { quotationLineId, organizationId, ...others } = commons || {};
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/quotation/${quotationLineId}/records`,
          method: 'GET',
          data: others,
        };
      },
    },
  };
};

export { lineTableDataSet, headerDataSet };
