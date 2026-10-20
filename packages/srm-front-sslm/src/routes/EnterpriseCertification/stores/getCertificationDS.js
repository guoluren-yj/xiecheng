/*
 * @Date: 2022-06-13 16:16:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { IDENTITY_CARD, PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

const dataSetFields = key => {
  switch (key) {
    case 'MANPOWER':
      return [
        {
          name: 'name',
          required: true,
          label: intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名'),
        },
        {
          name: 'idCard',
          required: true,
          pattern: /^[0-9A-Za-z]*$/,
          label: intl.get('spfm.contactPerson.model.contactPerson.idNum').d('证件号码'),
        },
        {
          name: 'idBackUuid',
          required: true,
        },
        {
          name: 'idFrontUuid',
          required: true,
        },
      ];
    default:
      return [
        {
          name: 'name',
          required: true,
          label: intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名'),
        },
        {
          name: 'idType',
          required: true,
          lookupCode: 'SPFM.ID_TYPE',
          label: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
        },
        {
          name: 'idCard',
          required: true,
          label: intl.get('spfm.contactPerson.model.contactPerson.idNum').d('证件号码'),
          computedProps: {
            pattern: ({ record }) =>
              record.get('idType') === 'I'
                ? IDENTITY_CARD
                : record.get('idType') === 'P'
                ? /^([a-zA-z]|[0-9]){5,17}$/
                : record.get('idType') === 'T'
                ? /^\d{8}|^[a-zA-Z0-9]{10}|^\d{18}$/
                : record.get('idType') === 'H'
                ? /^([A-Z]\d{6,10}(\(\w{1}\))?)$/
                : null,
          },
        },
        {
          name: 'bankNum',
          label: intl.get('spfm.contactPerson.model.contactPerson.bankNum').d('银行卡号'),
          computedProps: {
            required: ({ record }) => record.get('idType') !== 'I',
          },
        },
        {
          name: 'internationalTelCode',
          required: true,
          lookupCode: 'HPFM.IDD',
          defaultValue: '+86',
        },
        {
          name: 'phone',
          required: true,
          label: intl.get('hzero.common.cellphone').d('手机号'),
          computedProps: {
            pattern: ({ record }) => record.get('internationalTelCode') === '+86' && PHONE,
          },
        },
        {
          name: 'authCode',
          label: intl.get('hzero.common.model.verifyCode').d('验证码'),
          computedProps: {
            disabled: ({ record }) => {
              const serviceId = record.get('serviceId');
              return !serviceId;
            },
          },
        },
      ];
  }
};

const certificationDS = key => ({
  forceValidate: true,
  fields: dataSetFields(key),
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/user-attestations`,
      method: 'GET',
    },
    submit: ({ data = [] }) => {
      const saveData = data[0] || {};
      const { idType, idCard } = saveData;
      if (idType !== 'I' && key === 'ID') {
        saveData.idCard = null;
        saveData.passport = idCard;
      }
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/user-attestations/attestations`,
        method: 'POST',
        data: {
          ...saveData,
          attestationType: key,
        },
      };
    },
  },
});

export { certificationDS };
