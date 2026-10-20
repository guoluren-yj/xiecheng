import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const exceptionListDS = (): DataSetProps => {
  return {
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'monitorId',
    fields: [
      {
        label: intl.get('hitf.interfaceMonitor.model.applicationType').d('应用类型'),
        name: 'applicationType',
        type: FieldType.string,
        lookupCode: 'SOPP.APPLICATION',
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.applicationName').d('应用名称'),
        name: 'applicationName',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.insideBatchNum').d('内部请求编号'),
        name: 'insideBatchNum',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.outRequestCode').d('外部请求编号'),
        name: 'externalBatchNum',
        type: FieldType.string,
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
        name: 'tenantId',
        type: FieldType.string,
        lovCode: 'HPFM.TENANT',
        textField: 'tenantName',
        valueField: 'tenantId',
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
        label: intl.get('hitf.interfaceMonitor.model.callType').d('调用类型'),
        name: 'callTypeMeaning',
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.parameterDetail').d('报文详情'),
        name: 'parameterDetail',
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.requestMethod').d('请求方法'),
        name: 'requestMethod',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.interactiveMethodMeaning').d('交互方式'),
        name: 'interactiveMethodMeaning',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.requestTime').d('请求时间'),
        name: 'requestTime',
        type: FieldType.dateTime,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.executeStatus').d('执行状态'),
        name: 'responseStatus',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.requestStatus').d('请求状态'),
        name: 'status',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.platformResponseTime').d('平台接口响应时间'),
        name: 'insideResponseTime',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.outResponseTime').d('外部接口响应时间'),
        name: 'externalResponseTime',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.port').d('客户端端口'),
        name: 'port',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.clientIp').d('客户端ip'),
        name: 'ip',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.requestInterfaceUrl').d('请求URL'),
        name: 'interfaceUrl',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.processStatusMeaning').d('重试状态'),
        name: 'processStatusMeaning',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.limitTypeMeaning').d('异常类型'),
        name: 'limitTypeMeaning',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceMonitor.model.retry').d('重新执行'),
        name: 'monitorId',
        type: FieldType.string,
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { insideBatchNum, interfaceName } = data;
        const requestTimeArr = data.requestTime_range ? data.requestTime_range.split(',') : [];
        const queryParamCurrent = {
            requestTimeFrom: requestTimeArr[0],
            requestTimeTo: requestTimeArr[1],
            interfaceCode: interfaceName,
            externalBatchNum: insideBatchNum,
            requestTime: undefined,
        };
        const queryParam = filterNullValueObject({...data, ...queryParamCurrent, ...params});
        return {
          url: `${HZERO_HITF}/v1${level}/open-monitors-exception`,
          method: 'GET',
          data: {...queryParam, tenantLov: undefined},
        };
      },
    },
  };
};

export { exceptionListDS };
