/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

import { getReadTransport } from '../utils';

const organizationId = getCurrentOrganizationId();

export const getContactDS = ({
  isAllPlatform,
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'name',
      // type: 'secret',
      required: true,
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.name').d('姓名'),
    },
    {
      name: 'gender',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.gender').d('性别'),
      lookupCode: 'HPFM.GENDER',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
    },
    {
      name: 'idType',
      type: 'string',
      lookupCode: 'SPFM.ID_TYPE',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.enterpriseInform.model.personal.certificateType').d('证件类型'),
    },
    {
      name: 'idNum',
      type: 'string',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.idNum').d('证件号码'),
      pattern: /^[0-9A-Za-z]*$/,
    },
    {
      name: 'contactType',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.contactType').d('联系人类型'),
      lookupCode: 'SSLM.CONTACT_TYPE',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
    },
    {
      name: 'mail',
      type: 'email',
      required: true,
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
    },
    {
      name: 'mobilephone',
      type: 'tel',
      regionField: 'internationalTelCode',
      required: true,
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.mobilephone').d('手机号码'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
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
    {
      name: 'objectFlag',
      ignore: 'always',
      label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (!isAllPlatform && record.get('supplierContactId')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      // 只读页面标红用readUrlProps这个接口
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs/no-basic`
        : `${SRM_SSLM}/v1/${organizationId}/sup-contacts-reqs/no-basic`;
      return !readOnlyFlag
        ? {
            url,
            method: 'GET',
            params: {},
            data: {
              changeReqId,
              companyId,
              supplierCompanyId,
              supplierFlag: isAllPlatform ? 0 : 1,
              dataSource: 1,
              customizeUnitCode: isAllPlatform ? null : code,
              customizeTenantId: isAllPlatform ? null : partnerTenantId,
              desensitize: false,
            },
          }
        : readUrlProps;
    },
    submit: ({ dataSet, data }) => {
      const { companyId, changeReqId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs`
        : `${SRM_SSLM}/v1/${organizationId}/sup-contacts-reqs`;
      return {
        url,
        method: 'POST',
        params: {
          dataSource: 1,
          customizeUnitCode: isAllPlatform ? null : code,
          customizeTenantId: isAllPlatform ? null : partnerTenantId,
          desensitize: false,
        },
        data: {
          [isAllPlatform ? 'comContactsReqs' : 'supContactsReqs']: data,
          changeReqId,
          companyId,
        },
      };
    },
    destroy: ({ data }) => {
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs/delete`
        : `${SRM_SSLM}/v1/${organizationId}/sup-contacts-reqs/delete`;
      return {
        url,
        method: 'DELETE',
        data,
      };
    },
  },
});
