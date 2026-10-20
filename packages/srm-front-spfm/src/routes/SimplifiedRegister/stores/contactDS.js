import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { isEmpty } from 'lodash';

// 联系人DS
const contactDS = () => ({
  paging: false,
  fields: [
    {
      name: 'name',
      type: 'string',
      required: true,
      label: intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名'),
    },
    // {
    //   name: 'gender',
    //   type: 'string',
    //   lookupCode: 'HPFM.GENDER',
    //   // required: true,
    //   label: intl.get('spfm.contactPerson.model.contactPerson.gender').d('性别'),
    // },
    {
      name: 'internationalTelCode',
      required: true,
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'mail',
      required: true,
      pattern: EMAIL,
      label: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'mobilephone',
      required: true,
      dynamicProps: ({ record }) => {
        return {
          pattern:
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
        };
      },
      label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
    },
    // {
    //   name: 'idType',
    //   type: 'string',
    //   lookupCode: 'SPFM.ID_TYPE',
    //   label: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
    // },
    // {
    //   name: 'idNum',
    //   type: 'string',
    //   maxLength: 30,
    //   label: intl.get('spfm.contactPerson.model.contactPerson.idNum').d('证件号码'),
    // },
    {
      name: 'department',
      type: 'string',
      label: intl.get('spfm.contactPerson.model.contactPerson.department').d('部门'),
    },
    {
      name: 'position',
      type: 'string',
      label: intl.get('spfm.contactPerson.model.contactPerson.position').d('职位'),
    },
    {
      name: 'telephone',
      type: 'string',
      maxLength: 30,
      label: intl.get('spfm.contactPerson.model.contactPerson.telephone').d('固定电话'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'defaultFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('spfm.contactPerson.model.contactPerson.default').d('默认联系人'),
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          const hasDefaultFlag = isEmpty(dataSet.toData());
          if (hasDefaultFlag) {
            return 1;
          }
          return 0;
        },
      },
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('spfm.contactPerson.model.contactPerson.enabled').d('启用'),
      computedProps: {
        disabled: ({ record }) => !!record.get('defaultFlag'),
      },
    },
    {
      name: 'mobilephoneField',
      label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
      ignore: 'always',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/contacts/${companyId}`,
        method: 'GET',
        params: {},
        data: {},
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/contacts/${companyId}/batch-delete`,
        method: 'DELETE',
        data,
        params: {},
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'defaultFlag') {
        if (value === 1) {
          record.set('enabledFlag', 1);
        }
      }
      if (name === 'internationalTelCode') {
        record.set('mobilephone', null);
      }
    },
  },
});

export { contactDS };
