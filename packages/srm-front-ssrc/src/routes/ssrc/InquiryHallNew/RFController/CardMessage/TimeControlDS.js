// time control DS
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';

const TimeControlDS = () => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'adjustFields',
        type: 'object',
        defaultValue: [],
      },
      {
        // name: 'rfxRequireQuotationDTO',
        name: 'rfConfRuleOriginalDTO',
        type: 'object',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplier')
          .d('最少报价供应商数'),
        name: 'minQuotedSupplier',
        type: 'number',
        min: 0,
        step: 1,
      },
      {
        name: 'nowAdjustedField',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyEndDate`).d('澄清截止时间'),
        name: 'clarifyEndDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        dynamicProps: {
          disabled: ({ record }) => {
            return record
              .get('fieldPropertyDTOList')
              ?.find?.((item) => item.name === 'clarifyEndDate')?.disabled;
          },
        },
      },
    ],
  };
};

const promptInfoDS = () => {
  return {
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.quoController.model.controller.messageDesc').d('问题列表'),
        name: 'messageDesc',
      },
      {
        label: intl.get('ssrc.quoController.model.controller.validateValue').d('对应标段'),
        name: 'validateValue',
      },
    ],
  };
};

export { TimeControlDS, promptInfoDS };
