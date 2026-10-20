import { HZERO_HITF, HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const treeSearchDs = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'searchIn',
        type: FieldType.string,
        dynamicProps: {
          disabled: ({ record }) => !isTenantRoleLevel() && !record.get('tenantLov'),
        },
      },
      {
        name: 'tenantLov',
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        textField: 'tenantName',
        valueField: 'tenantId',
        ignore: FieldIgnore.always,
        required: true,
        lovQueryAxiosConfig: () => {
          return {
            url: `${HZERO_PLATFORM}/v1/lovs/sql/data?lovCode=HPFM.TENANT_PAGING`,
            method: 'GET',
            transformResponse: (data) => {
              const res = JSON.parse(data || '{}');
              const newContent = res.content.filter(item => item.tenantId !== "0");
              const totalNum = res.totalElements - 1;
              return {
                ...res,
                content: newContent,
                totalElements: totalNum,
              };
            },
          };
        },
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        bind: 'tenantLov.tenantName',
      },
    ],
  };
};

const listTableDS = (): DataSetProps => {
  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get('hitf.interfaceMonitor.model.operate').d('操作'),
        name: 'operate',
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.dataExecuteResult').d('数据执行结果'),
        name: 'dataExecuteResult',
        type: FieldType.string,
        lookupCode: 'HITF.OPEN_DATA_RESULT',
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.executeErrorMessage').d('错误消息'),
        name: 'executeErrorMessage',
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.parameterDetail').d('报文详情'),
        name: 'parameterDetail',
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.interfaceCode').d('接口代码'),
        name: 'interfaceCode',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.interfaceName').d('接口名称'),
        name: 'interfaceName',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.trigger.type').d('触发类型'),
        name: 'triggerType',
        type: FieldType.string,
      },
      {
        label: 'TraceId',
        name: 'traceId',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.interfaceType').d('接口类型'),
        name: 'interfaceType',
        type: FieldType.string,
        lookupCode: 'SOPP.INTERFACE_TYPE',
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.insideBatchNum').d('内部请求编号'),
        name: 'insideBatchNum',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.externalBatchNum').d('外部请求编号'),
        name: 'externalBatchNum',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.responseStatus').d('请求响应状态'),
        name: 'responseStatus',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.requestTime').d('请求时间'),
        name: 'requestTime',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.errorMessage').d('请求错误消息'),
        name: 'errorMessage',
        type: FieldType.string,
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { requestTime = '', insideBatchNum = '', queryParams } = data;
        const requestTimeArr = requestTime ? requestTime.split(',') : [];
        const queryParamCurrent = {
          requestTimeFrom: requestTimeArr[0],
          requestTimeTo: requestTimeArr[1],
          externalBatchNum: insideBatchNum,
          ...queryParams,
          requestTime: undefined,
        };
        const queryParam = filterNullValueObject({...data, ...queryParamCurrent, ...params});
        return {
          url: `${HZERO_HITF}/v1${level}/open-monitor-details`,
          method: 'GET',
          data: {...queryParam, queryParams: undefined},
        };
      },
    },
  };
};

// 接口查询左侧树
const treeListDs = (): DataSetProps => {
  return {
    fields: [
      {
        name: 'interfaceId',
        type: FieldType.number,
      },
      {
        name: 'name',
        type: FieldType.string,
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const param = filterNullValueObject(params);
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1${level}/open-monitor-manages/list${isTenantRoleLevel() ? '-banner' : ''}`,
          method: 'GET',
          data: { ...param, ...queryParam },
        };
      },
    },
  };
};

const filterFormDs = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'interfaceName',
        type: FieldType.string,
      },
      {
        name: 'dataExecuteResult',
        type: FieldType.string,
      },
      {
        name: 'interfaceType',
        type: FieldType.string,
      },
      {
        name: 'insideBatchNum',
        type: FieldType.string,
      },
      {
        name: 'requestTime',
        type: FieldType.date,
        range: ['requestTimeFrom', 'requestTimeTo'],
      },
      {
        name: 'requestTimeFrom',
        type: FieldType.date,
      },
      {
        name: 'requestTimeTo',
        type: FieldType.date,
      },
    ],
  };
};

export { treeListDs, listTableDS, treeSearchDs, filterFormDs };
