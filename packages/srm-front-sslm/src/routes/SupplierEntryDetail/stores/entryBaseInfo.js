import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE } from 'utils/regExp';
import { validatePasswordRule } from '../utils/validator.js';

const organizationId = getCurrentOrganizationId();

const getEntryBaseInfoDs = ({ changeReqId }) => ({
  paging: false,
  fields: [
    {
      name: 'changeReqNumber',
      type: 'string',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.entryNumber').d('录入单编号'),
      disabled: true,
      required: true,
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.creator').d('创建人'),
      disabled: true,
      required: true,
    },
    {
      name: 'departmentObj',
      type: 'object',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.department').d('所属部门'),
      ignore: 'always',
      lovCode: 'SPRM.USER_UNIT',
      textField: 'unitName',
    },
    {
      name: 'departmentName',
      bind: 'departmentObj.unitName',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.department').d('所属部门'),
    },
    {
      name: 'departmentId',
      bind: 'departmentObj.unitId',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.department').d('所属部门'),
    },
    {
      name: 'departmentCode',
      bind: 'departmentObj.unitCode',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.department').d('所属部门'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.createDate').d('创建时间'),
      disabled: true,
      required: true,
    },
    {
      name: 'realName',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.supplierName').d('供应商姓名'),
      required: true,
    },
    {
      name: 'password',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.password').d('登录密码'),
      // required: true,
      // pattern: PASSWORD,
      validator: (value, _name, record) => {
        return validatePasswordRule(value, record.toData());
      },
    },
    {
      name: 'phone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.loginPhoneNum').d('登录手机号'),
      dynamicProps: {
        // 不支持座机
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86'
            ? /^134[0-9]\d{7}$|^13[^4]\d{8}$|^14[5-9]\d{8}$|^15[^4]\d{8}$|^16[2,5,6,7]\d{8}$|^17[0-8]\d{8}$|^18\d{9}$|^19[^4]\d{8}$/
            : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      disabled: true,
      // required: !isDisable,
    },
    {
      name: 'email',
      type: 'email',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.loginEmail').d('登录邮箱'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.attachment').d('附件'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.supplierEntryDetail.model.entryBaseForm.entryRemark').d('录入说明'),
    },
    {
      name: 'remarkForm',
    },
    {
      name: 'language',
      type: 'object',
      label: intl.get('sslm.common.model.common.defaultLanguage').d('默认语言'),
      lovCode: 'SSLM.LANGUAGE_LIST_TENANT',
      transformRequest: value => value && value.code,
      transformResponse: (value, data) => {
        const { language, languageMeaning } = data;
        return value
          ? {
              code: language,
              name: languageMeaning,
            }
          : null;
      },
    },
    {
      name: 'timeZone',
      type: 'object',
      label: intl.get('sslm.common.model.common.defaultTimeZone').d('默认时区'),
      lovCode: 'HIAM.TIME_ZONE',
      transformRequest: value => value && value.value,
      transformResponse: (value, data) => {
        const { timeZone, timeZoneMeaning } = data;
        return value
          ? {
              value: timeZone,
              meaning: timeZoneMeaning,
            }
          : null;
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq/detail`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_BASIC_INFO',
          ...queryParams,
          ...other,
          changeReqId,
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

export { getEntryBaseInfoDs };
