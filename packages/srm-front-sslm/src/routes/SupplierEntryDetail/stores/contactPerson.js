import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

// 联系人DS
const getContactDS = ({ changeReqId }) => ({
  paging: false,
  fields: [
    {
      name: 'name',
      type: 'string',
      required: true,
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.name').d('姓名'),
    },
    // {
    //   name: 'gender',
    //   type: 'string',
    //   lookupCode: 'HPFM.GENDER',
    //   // required: true,
    //   label: intl.get('sslm.supplierEntryDetail.model.contactPerson.gender').d('性别'),
    // },
    {
      name: 'internationalTelCode',
      required: true,
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'mail',
      type: 'email',
      required: true,
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'contactType',
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.contactType').d('联系人类型'),
      lookupCode: 'SSLM.CONTACT_TYPE',
    },
    {
      name: 'mobilephone',
      required: true,
      type: 'tel',
      regionField: 'internationalTelCode',
      computedProps: {
        pattern: ({ record }) => {
          return (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
        },
      },
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.mobilephone').d('手机号码'),
    },
    {
      name: 'department',
      type: 'string',
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.department').d('部门'),
    },
    {
      name: 'position',
      type: 'string',
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.position').d('职位'),
    },
    {
      name: 'telephone',
      type: 'string',
      maxLength: 30,
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.telephone').d('固定电话'),
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
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.default').d('默认联系人'),
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
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.enabled').d('启用'),
      computedProps: {
        disabled: ({ record }) => !!record.get('defaultFlag'),
      },
    },
    {
      name: 'mobilephoneField',
      label: intl.get('sslm.supplierEntryDetail.model.contactPerson.mobilephone').d('手机号码'),
      ignore: 'always',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs/no-basic`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.CONTACT_INFO',
          ...queryParams,
          ...other,
          changeReqId,
          dataSource: 3,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs/delete`,
        method: 'DELETE',
        data,
        params: {
          ...params,
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.CONTACT_INFO',
        },
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
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

export { getContactDS };
