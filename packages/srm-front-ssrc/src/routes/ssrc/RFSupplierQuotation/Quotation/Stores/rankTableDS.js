import intl from 'utils/intl';

const biddingRankTableDS = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    primaryKey: 'quotationLineId',
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.ranking`).d('排名'),
        name: 'rank',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.gridQuotationPrice`).d('报价'),
        name: 'gridQuotationPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        showType: 'dateTime',
      },
    ],
  };
};

// 多轮报价排名表ds
const roundQuotationRankDS = ({ quotationName }) => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    primaryKey: 'roundHeaderDateId',
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        name: 'quotationRound',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStatus`, { quotationName })
          .d('{quotationName}状态'),
        name: 'quotationStatusMeaning',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStartTime`, { quotationName })
          .d('{quotationName}开始时间'),
        name: 'roundQuotationStartDate',
        showType: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationEndTime`, { quotationName })
          .d('{quotationName}截止时间'),
        name: 'roundQuotationEndDate',
        showType: 'dateTime',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
        name: 'roundRank',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.taxRateQuotationAmount`)
          .d('含税报价总金额'),
        name: 'quotationAmount',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.noTaxRateQuotationAmount`)
          .d('报价总金额(不含税)'),
        name: 'netQuotationAmount',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.roundQutaionReson`)
          .d('发起本轮报价原因'),
        name: 'roundRemark',
      },
    ],
  };
};

export { biddingRankTableDS, roundQuotationRankDS };
