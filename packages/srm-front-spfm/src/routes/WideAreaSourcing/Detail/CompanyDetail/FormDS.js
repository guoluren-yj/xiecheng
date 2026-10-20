/**
 * 供应商详情 DS
 */
import intl from 'utils/intl';

const FormDS = () => ({
  transport: {},
  fields: [
    {
      label: intl.get(`spfm.wideArea.modal.legalPerson`).d('法人'),
      name: 'legalPerson',
    },
    {
      label: intl.get(`spfm.wideArea.modal.socialCreditCode`).d('统一社会信用代码'),
      name: 'socialCreditCode',
    },
    {
      label: intl.get(`spfm.wideArea.modal.phoneNumber`).d('电话'),
      name: 'phoneNumber',
    },
    {
      label: intl.get(`spfm.wideArea.modal.officialWebsite`).d('官网'),
      name: 'officialWebsite',
    },
    {
      label: intl.get(`spfm.wideArea.modal.email`).d('邮箱'),
      name: 'email',
    },
    {
      label: intl.get(`spfm.wideArea.modal.address`).d('地址'),
      name: 'address',
    },
  ],
  queryFields: [],
  events: {},
});

export default FormDS;
