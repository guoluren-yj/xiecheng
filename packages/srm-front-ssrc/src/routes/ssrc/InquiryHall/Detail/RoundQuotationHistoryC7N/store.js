import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

const lineTableDataSet = ({ quotationName }) => {
  return {
    primaryKey: 'quotationLineId',
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        name: 'quotationRoundNumber',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
        name: 'roundRank',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
        name: 'creationDate',
        type: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotedByName`, {
            quotationName,
          })
          .d('{quotationName}人'),
        name: 'realName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('含税行金额'),
        name: 'quotationAmount',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.noTaxQuotationAmount`).d('未税行金额'),
        name: 'netQuotationAmount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        name: 'secondaryQuantity',
      },
      {
        label: intl.get(`ssrc.common.model.inquiryHall.basicAvailableQuantity`).d('基本可供数量'),
        name: 'quotationQuantity',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.taxPrice`).d('含税单价'),
        name: 'quotationPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.noTaxPrice`).d('未税单价'),
        name: 'validNetPrice',
      },
    ],

    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commons = {} },
        } = dataSet;
        const { organizationId, ...others } = commons || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/round-quotation-lines`,
          method: 'GET',
          data: others,
        };
      },
    },
  };
};

export { lineTableDataSet };
