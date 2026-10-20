import intl from 'utils/intl';

const openingDS = () => ({
  selection: false,
  paging: false,
  autoCreate: true,
  fields: [
    {
      name: 'openPassword',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.inputBidPassword`).d('输入开标密码'),
      maxLength: 10,
      required: true,
    },
  ],
});

export { openingDS };
