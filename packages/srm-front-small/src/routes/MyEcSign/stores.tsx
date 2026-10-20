import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import type { AxiosRequestConfig } from 'axios';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

export const ecListDS = (): DataSetProps => ({
  autoQuery: true,
  paging: false,
  fields: [],
  transport: {
    read: ({data}): AxiosRequestConfig => {
      return {
        url: `${SRM_MALL}/v1/${getCurrentOrganizationId()}/ec-signs/my-ec`,
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
      lovCode: 'HIAM.TENANT.USER',
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
      required: true,
      pattern: EMAIL,
    },
    {
      name: 'unitLov',
      lovCode: 'SPFM.USER_UNIT_D',
      type: FieldType.object,
      label: intl.get('small.ecSign.model.unitLov').d('部门'),
      required: true,
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
      required: true,
      dynamicProps: {
        disabled: ({ record }) => !record.get('contactId'),
        lovPara: ({ record }) => {
          return {
            userId: record.get('contactId'),
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
      if(name=== 'contactLov') {
        record.set({
          contactPhone: value?.phone,
          contactEmail: value?.email,
          unitLov: null,
          positionLov: null,
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
