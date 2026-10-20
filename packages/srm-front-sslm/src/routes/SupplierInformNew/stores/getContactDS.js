/*
 * @Date: 2023-04-10 19:57:06
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE, PHONE, EMAIL } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

export const getContactDS = () => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'name',
      type: 'secret',
      required: true,
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.name').d('姓名'),
    },
    {
      name: 'mail',
      type: 'secret',
      required: true,
      pattern: EMAIL,
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'mobilephone',
      type: 'tel',
      required: true,
      telMode: 'secret',
      regionField: 'internationalTelCode',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.mobilephone').d('手机号码'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'contactType',
      lookupCode: 'SSLM.CONTACT_TYPE',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.contactType').d('联系人类型'),
    },
    {
      name: 'department',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.department').d('部门'),
    },
    {
      name: 'position',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.position').d('职位'),
    },
    {
      name: 'telephone',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.telephone').d('固定电话'),
    },
    {
      name: 'description',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.description').d('备注'),
    },
    {
      name: 'defaultFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.common.model.contact.defaultContact').d('默认联系人'),
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
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.enabledFlag').d('启用'),
      defaultValue: 1,
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.get('supplierContactId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-contacts-reqs/no-basic`,
        method: 'GET',
        params: {},
        data: {
          companyId,
          changeReqId,
          dataSource: 2,
          supplierFlag: 1,
          supplierCompanyId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.CONTACT',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-contacts-reqs/delete`,
        method: 'DELETE',
        params: {
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.CONTACT',
        },
        data,
      };
    },
  },
});
