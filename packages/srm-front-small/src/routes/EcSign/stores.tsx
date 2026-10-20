import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { isEmpty } from 'lodash';
import type { AxiosRequestConfig } from 'axios';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
import { FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';

export const ecListDS = (): DataSetProps => ({
  autoQuery: true,
  paging: false,
  fields: [],
  transport: {
    read: ({data}): AxiosRequestConfig => {
      return {
        url: `${SRM_MALL}/v1/${getCurrentOrganizationId()}/ec-signs`,
        method: 'GET',
        data,
      };
    },
  },
});

export const ecSigningDS = (ecPlatformId: string): DataSetProps => ({
  autoQuery: true,
  forceValidate: true,
  fields: [
    {
      name: 'tenantNum',
      label: intl.get('small.ecSign.model.tenantCode').d('租户编码'),
      required: true,
    },
    {
      name: 'tenantName',
      label: intl.get('small.ecSign.model.tenantName').d('租户名称'),
      required: true,
    },
    {
      name: 'ecPlatformName',
      label: intl.get('small.ecSign.model.ecPlatformName').d('电商名称'),
      required: true,
    },
    {
      name: 'contactLov',
      label: intl.get('small.ecSign.model.contactLov').d('联系人'),
      lovCode: 'SMAL.TENANT_USER',
      required: true,
      type: FieldType.object,
    },
    {
      name: 'contactId',
      bind: 'contactLov.id',
    },
    {
      name: 'contactName',
      label: intl.get('small.ecSign.model.contactLov').d('联系人'),
      bind: 'contactLov.realName',
    },
    {
      name: 'contactPhone',
      label: intl.get('small.ecSign.model.contactPhone').d('联系电话'),
      required: true,
      // pattern: PHONE,
    },
    {
      name: 'contactEmail',
      label: intl.get('small.ecSign.model.contactEmail').d('联系邮箱'),
      // required: true,
      pattern: EMAIL,
    },
    {
      name: 'unitLov',
      lovCode: 'SPFM.USER_UNIT_D',
      type: FieldType.object,
      label: intl.get('small.ecSign.model.unitLov').d('部门'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('contactId'),
        lovPara: ({ record }) => {
          return {
            userId: record.get('contactId'),
            tenantId: getCurrentOrganizationId()
          };
        },
      },
    },
    {
      name: 'unitId',
      bind: 'unitLov.unitId',
    },
    {
      name: 'unitName',
      bind: 'unitLov.unitName',
      label: intl.get('small.ecSign.model.unitLov').d('部门'),
    },
    {
      name: 'positionLov',
      type: FieldType.object,
      lovCode: 'SMAL.USER_POSITION',
      label: intl.get('small.ecSign.model.positionLov').d('职位'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('contactId'),
        lovPara: ({ record }) => {
          return {
            userId: record.get('contactId'),
            unitId: record.get('unitId'),
          };
        },
      },
    },
    {
      name: 'positionId',
      bind: 'positionLov.positionId',
    },
    {
      name: 'positionName',
      bind: 'positionLov.positionName',
      label: intl.get('small.ecSign.model.positionLov').d('职位'),
    },
    {
      name: 'remark',
      required: true,
      label: intl.get('small.ecSign.model.remark').d('签约说明'),
    },
  ],
  events: {
    update: ({ record, name, value })  => {
      if(name === 'contactLov') {
        const { phone, email, unitId, unitName, positionId, positionName } = value || {};
        record.set({
          contactPhone: phone,
          contactEmail: email,
          unitLov: isEmpty(value) ? null : {
            unitId,
            unitName,
          },
          positionLov: isEmpty(value) ? null : {
            positionId,
            positionName,
          },
        });
      }
    }
  },
  transport: {
    read: ({data}): AxiosRequestConfig => {
      return {
        url: `${SRM_MALL}/v1/${getCurrentOrganizationId()}/ec-signs/${ecPlatformId}`,
        method: 'GET',
        data,
      };
    },
  },
});

export const ecClintDS = (): DataSetProps => ({
  autoCreate: false,
  forceValidate: true,
  fields: [
    {
      name: 'ecPlatformName',
      ignore: FieldIgnore.always,
      label: intl.get('small.ecClient.model.ecPlatform').d('电商平台'),
    },
    {
      name: 'companyLov',
      label: intl.get('small.ecClient.model.ecCompanyCode').d('电商公司编码'),
      lovCode: 'SMAL.COMPANY',
      type: FieldType.object,
      ignore: FieldIgnore.always,
      textField: 'companyNum',
      required: true,
      dynamicProps({ record }) {
        return {
          lovPara: { tenantId: record.get('ecPlatformTenantId') },
        };
      },
    },
    { name: 'ecCompanyId', bind: 'companyLov.companyId' },
    {
      name: 'ecCompanyName',
      bind: 'companyLov.companyName',
      label: intl.get('small.ecClient.model.ecCompanyName').d('电商公司名称'),
    },
    {
      name: 'dataType',
      lookupCode: 'SMAL.ACCOUNT_TYPE',
      label: intl.get('small.ecClient.model.accountType').d('账号类型'),
      required: true,
    },
    {
      name: 'userName',
      required: true,
      label: intl.get('small.ecClient.model.userName').d('授权账号'),
    },
    {
      name: 'userPassword',
      required: true,
      label: intl.get('small.ecClient.model.userPassword').d('授权密码'),
    },
    {
      name: 'accessKeyId',
      label: intl.get('small.ecClient.model.accessKeyId').d('鉴权信息账号'),
    },
    {
      name: 'accessKeySecret',
      label: intl.get('small.ecClient.model.accessKeySecret').d('鉴权信息密码'),
    },
  ],
});
