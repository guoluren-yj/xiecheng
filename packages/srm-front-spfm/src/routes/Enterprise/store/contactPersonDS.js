/**
 * contactPersonDS.js - 联系人页面DS
 * @date: 2020-09-09
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

function contactPersonDS() {
  return {
    autoQuery: false,
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
      //   required: true,
      //   label: intl.get('spfm.contactPerson.model.contactPerson.gender').d('性别'),
      // },
      {
        name: 'mail',
        required: true,
        pattern: EMAIL,
        label: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
      },
      {
        name: 'internationalTelCode',
        required: true,
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
      },
      {
        name: 'mobilephone',
        type: 'tel',
        required: true,
        regionField: 'internationalTelCode',
        dynamicProps: ({ record }) => {
          return {
            required: true,
            pattern:
              (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
          };
        },
        label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
      },
      {
        name: 'idType',
        type: 'string',
        lookupCode: 'SPFM.ID_TYPE',
        label: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
      },
      {
        name: 'idNum',
        type: 'string',
        maxLength: 30,
        label: intl.get('spfm.contactPerson.model.contactPerson.idNum').d('证件号码'),
      },
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
      },
      {
        name: 'option',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
  };
}

export default contactPersonDS;
