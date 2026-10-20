import intl from 'srm-front-boot/lib/utils/intl';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

interface triggerInfoProps {
  businessObjectId?: string;
  boTriggerId?: string;
  businessObjectTenantId?: string;
}

const baseUrl = `${lowcodeOrganizationURL({ route: HZERO_HMDE })}`;

// 搜索框
const queryTenantTriggerDs = () => ({
  autoCreate: false,
  autoQuery: false,
  selection: DataSetSelection.single,
  fields: [
    {
      name: 'tenant',
      type: FieldType.object,
      label: '所属租户',
      lovCode: 'HPFM.TENANT',
      valueField: 'tenantId',
      textField: 'tenantName',
    },
  ],
});

// 触发器列表
const triggerListDs = ({
  businessObjectId,
  businessObjectTenantId,
}: triggerInfoProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: false,
  fields: [],
  transport: {
    read: ({ params }) => {
      const url = `${baseUrl}/bo-triggers`;
      return {
        url,
        method: 'GET',
        params: businessObjectTenantId
          ? {
              ...params,
              businessObjectId,
              tenantId: businessObjectTenantId,
            }
          : {
              ...params,
              businessObjectId,
            },
      };
    },
    destroy: ({ data }) => {
      const url = `${baseUrl}/bo-triggers`;
      const record = data[0];
      return {
        url,
        data: { ...record },
        method: 'DELETE',
      };
    },
  },
});

// 触发器信息
const triggerInfoDs = ({ boTriggerId }: triggerInfoProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  transport: {
    read: ({ params }) => {
      const url = `${baseUrl}/bo-triggers/${boTriggerId}`;
      return {
        url,
        method: 'GET',
        params: {
          ...params,
        },
      };
    },
    submit: ({ data }) => {
      const url = `${baseUrl}/bo-triggers`;
      return {
        url,
        method: 'POST',
        data: data[0],
      };
    },
    update: ({ data }) => {
      const url = `${baseUrl}/bo-triggers`;
      const record = data[0];
      return {
        url,
        data: { ...record },
        method: 'PUT',
      };
    },
  },
  fields: [
    {
      name: 'tenant',
      type: FieldType.object,
      label: intl.get('hmde.common.tenant').d('所属租户'),
      lovCode: 'HPFM.TENANT',
      textField: 'tenantName',
      valueField: 'tenantId',
      required: true,
      // dynamicProps: {
      //   required: () => !isDetail,
      // },
      ignore: FieldIgnore.always,
    },
    {
      name: 'tenantId',
      type: FieldType.string,
      bind: 'tenant.tenantId',
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      bind: 'tenant.tenantName',
    },
    {
      name: 'businessObjectId',
      type: FieldType.string,
    },
    {
      label: intl.get('hmde.bo.option.triggerType').d('触发器类型'),
      name: 'triggerTypeObject',
      type: FieldType.object,
      lookupCode: 'HMDE.BUSINESS_OBJECT.TRIGGER.TYPE',
      required: true,
      ignore: FieldIgnore.always,
    },
    {
      label: intl.get('hmde.bo.option.triggerTypeMeaning').d('触发器类型名称'),
      name: 'triggerTypeMeaning',
      type: FieldType.string,
      bind: 'triggerTypeObject.meaning',
    },
    {
      label: intl.get('hmde.bo.option.triggerTypeCode').d('触发器类型编码'),
      name: 'triggerTypeCode',
      type: FieldType.string,
      bind: 'triggerTypeObject.value',
    },
    {
      name: 'enabledFlag',
      type: FieldType.boolean,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: '是否启用',
      labelWidth: '110',
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: '描述',
    },
  ],
});

export { triggerListDs, queryTenantTriggerDs, triggerInfoDs };
