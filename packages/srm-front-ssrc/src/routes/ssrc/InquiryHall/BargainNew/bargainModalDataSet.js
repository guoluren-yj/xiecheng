import intl from 'utils/intl';

// const baseInfoDataSet = () => {

//   return {
//     autoQuery: false,
//     fields: [
//       {
//         label: intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户'),
//         name: 'companyName',
//         disabled: true,
//       },
//       {
//         name: 'rfxBusinessAttachmentUuid',
//         type: 'attachment',
//         label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
//         bucketDirectory: 'ssrc-rfx-rfxheader',
//       },
//     ],
//   };
// };

const startBargainModalDataSet = () => {
  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.bargain.bargainDeadline`).d('议价截止时间'),
        name: 'bargainEndDate',
        required: true,
        type: 'date',
        dateMode: 'dateTime',
        min: new Date(),
      },
      {
        name: 'bargainRemark',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.bargain.reasonToBargain`).d('议价理由'),
      },
    ],
  };
};

const counterOffersBulkDataSet = (data = {}) => {
  const { bargainFlag } = data || {};

  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainType`).d('还价方式'),
        name: 'bargainType',
        lookupCode: bargainFlag ? 'SSRC.BARGAIN_TYPE' : 'SSRC.BARGAIN_OFFLINE_TYPE',
        type: 'string',
      },
      {
        name: 'bargainPrice',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.bargain.reasonToBargain`).d('议价理由'),
        min: '0',
        dynamicProps: {
          label({ record }) {
            const bargainType = record.get('bargainType');
            let label = bargainFlag
              ? intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainPrice`).d('还价单价')
              : intl.get('ssrc.common.unitPrice').d('单价');
            if (bargainType === 'DISCOUNT_RATE') {
              label = intl.get(`ssrc.inquiryHall.model.inquiryHall.discountRate`).d('折扣率');
            }
            if (bargainType === 'DEDUCTION_PRICE') {
              label = intl
                .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceDiscount`)
                .d('单价折扣额');
            }
            return label;
          },
          required({ record }) {
            const bargainType = record.get('bargainType');
            const flag = !!bargainType;

            return flag;
          },
          disabled({ record }) {
            const bargainType = record.get('bargainType');
            const flag = !bargainType;

            return flag;
          },
          max({ record }) {
            const bargainType = record.get('bargainType');
            let max = '99999999999999999999';
            if (bargainType === 'DISCOUNT_RATE') {
              max = '1';
            }

            return max;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainRemark`).d('还价理由'),
        name: 'bargainRemark',
        type: 'string',
      },
    ],
    events: {
      update: ({ name, record }) => {
        if (name === 'bargainType') {
          record.set({
            bargainPrice: null,
          });
        }
      },
    },
  };
};

export { startBargainModalDataSet, counterOffersBulkDataSet };
