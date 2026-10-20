import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import {
  filterNullValueObject,
  getCurrentUser,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'hzero-front/lib/utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { getLovQueryAxiosConfig } from 'srm-front-boot/lib/components/SearchBarTable/util';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

// 应用管理列表页-表格
export const listTableDS = (): DataSetProps => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'statusMeaning',
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'applicationCode',
        type: FieldType.string,
        label: intl.get('hitf.application.code').d('应用编码'),
      },
      {
        name: 'applicationName',
        type: FieldType.string,
        label: intl.get('hitf.application.applicationName').d('应用名称'),
      },
      {
        name: 'applicationTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.application.applicationType').d('应用类型'),
      },
      {
        name: 'comments',
        type: FieldType.string,
        label: intl.get('hitf.application.introduction').d('应用介绍'),
      },
      {
        name: 'dataSourceMeaning',
        type: FieldType.string,
        label: intl.get('hitf.application.dataSource').d('应用来源'),
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        label: intl.get('hzero.common.tenantName').d('所属租户'),
      },
      {
        name: 'creationName',
        type: FieldType.string,
        label: intl.get('hzero.common.creationName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get('hzero.common.creationDate').d('创建时间'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/open-warn-rules`,
          method: 'GET',
          data: {
            page,
            size,
            ...queryParam,
          },
        };
      },
    },
  };
};

// 告警详情页-表单
export const detailFormDS = (): DataSetProps => {
  return {
    autoCreate: true,
    primaryKey: 'code',
    fields: [
      {
        name: 'warnCode',
        type: FieldType.string,
        label: intl.get('hitf.application.warnCode').d('告警编码'),
        required: true,
      },
      {
        name: 'warnName',
        type: FieldType.string,
        label: intl.get('hitf.application.warnName').d('告警名称'),
        required: true,
      },
      {
        name: 'status',
        label: intl.get('hzero.common.status').d('状态'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HITF.OPEN_STATUS',
        defaultValue: '1',
      },
      {
        name: 'applicationHeaders',
        type: FieldType.object,
        ignore: FieldIgnore.always,
        multiple: true,
        label: intl.get('hitf.application.alreadyApplicationNames').d('已关联应用'),
        lovCode: 'HITF.OPEN_APPLICATION_QUERY.VIEW',
      },
      {
        name: 'applicationIdList',
        type: FieldType.string,
        bind: 'applicationHeaders.applicationHeaderId',
      },
      {
        name: 'creationName',
        type: FieldType.string,
        defaultValue: getCurrentUser().realName,
        label: intl.get('hzero.common.creationName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get('hzero.common.creationDate').d('创建时间'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hzero.common.remark').d('备注'),
      },
    ],
    cacheSelection: true,
  };
};


// 告警规则-表格
export const apiTableDS = (headerId): DataSetProps => {
  return {
    primaryKey: 'warnRuleLineId',
    cacheSelection: true,
    fields: [
      {
        name: 'email',
        type: FieldType.object,
        label: intl.get('hitf.application.email').d('通知邮箱'),
        required: true,
        pattern: /^([a-z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})([,，]([a-z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6}))*$/,
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hzero.common.remark').d('备注'),
        required: true,
      },
      {
        name: 'messageSendType',
        type: FieldType.string,
        label: intl.get('hitf.application.messageSendType').d('发送类型'),
        required: true,
        lookupCode: 'HITF.OPEN_MESSAGE_SEND_TYPE',
      },
      {
        name: 'messageSendMethod',
        type: FieldType.string,
        label: intl.get('hzero.common.messageSendMethod').d('发送方式'),
        lookupCode: 'HITF.OPEN_MESSAGE_SEND_METHOD',
        disabled: true,
        required: true,
      },
      {
        name: 'messageSendStartTime',
        type: FieldType.dateTime,
        label: intl.get('hzero.common.messageSendStartTime').d('开始时间'),
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('messageSendType') === 'REQUEST';
          },
          required: ({ record }) => {
            return record.get('messageSendType') !== 'REQUEST';
          },
        },
      },
      {
        name: 'messageSendCycle',
        type: FieldType.number,
        label: intl.get('hitf.common.messageSendCycle').d('发送周期(24小时)'),
        max: 24,
        min: 1,
        precision: 0,
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('messageSendType') === 'REQUEST';
          },
          required: ({ record }) => {
            return record.get('messageSendType') !== 'REQUEST';
          },
        },
      },
      {
        name: 'interfaceIds',
        type: FieldType.string,
        label: intl.get('hitf.common.interfaceIds').d('关联接口'),
      },
      {
        name: 'interfaces',
        textField: 'name',
        valueField: 'id',
        type: FieldType.object,
        ignore: FieldIgnore.always,
        lovCode: 'HITF.OPEN_INTERFACE_QUERY',
        multiple: true,
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': 'HITF.OPEN_INTERFACE_QUERY',
              's-lov-display-field': 'name',
            },
          }),
        lovPara: { warnRuleId: headerId },
      },
      {
        name: 'interfaceList',
        type: FieldType.string,
        bind: 'interfaces',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1/${organizationId}/open-warn-rule-lines?warnRuleId=${headerId}`,
          method: 'GET',
          data: {
            page,
            size,
            ...queryParam,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/open-warn-rule-lines`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

// 应用管理详情页-API信息-表格-新增
export const addApiDS = (headerId): DataSetProps => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'addApi',
        textField: 'interfaceName',
        valueField: 'interfaceCode',
        type: FieldType.object,
        lovCode: 'HITF.OPEN_INTERFACE_QUERY',
        multiple: true,
        lovPara: { applicationHeaderId: headerId },
      },
    ],
  };
};
