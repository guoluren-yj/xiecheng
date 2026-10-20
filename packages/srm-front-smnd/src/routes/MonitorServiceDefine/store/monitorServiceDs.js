import intl from 'utils/intl';
// import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const monitorServiceDataSet = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  pageSize: 20,
  primaryKey: 'settingId',
  selection: false,
  queryFields: [
    {
      name: 'settingCode',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.settingCode`).d('配置编码'),
    },
    {
      name: 'routingKey',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.routingKey`).d('分组键'),
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.interfaceName`).d('接口名称'),
    },
    {
      name: 'requestModule',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.requestModule`).d('发起模块'),
    },
  ],
  fields: [
    {
      name: 'tenantId',
      label: intl.get('smnd.monitorDashboard.view.message.tenantNum').d('租户'),
      lookupCode: 'HPFM.TENANT',
    },
    {
      name: 'interfaceName',
      label: intl.get(`smnd.monitorDashboard.view.message.interfaceName`).d('接口名称'),
      help: intl
        .get('smnd.monitorDashboard.view.message.interfaceNameTip')
        .d('手动录入该配置对应的接口名称'),
    },
    // {
    //   name: 'requestModuleCode',
    //   type: 'string',
    //   lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_MODULE',
    //   label: intl.get(`smnd.monitorDashboard.view.message.requestModule`).d('发起模块'),
    // },
    {
      name: 'requestModule',
      type: 'string',
      // lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_MODULE',
      label: intl.get(`smnd.monitorDashboard.view.message.requestModule`).d('发起模块'),
    },
    {
      name: 'requestService',
      label: intl.get(`smnd.monitorDashboard.view.message.requestService`).d('发起服务'),
      help: intl
        .get('smnd.monitorDashboard.view.message.requestServiceTip')
        .d('手动录入mq的生产者服务，feign的调用方服务'),
    },
    {
      name: 'responseModuleCode',
      type: 'string',
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_MODULE',
      label: intl.get(`smnd.monitorDashboard.view.message.responseModule`).d('响应模块'),
      help: intl
        .get('smnd.monitorDashboard.view.message.responseModuleTip')
        .d('手动录入该配置对应的mq的消费者服务模块，feign的被调用方服务模块'),
    },
    // {
    //   name: 'responseModule',
    //   type: 'string',
    //   // lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_MODULE',
    //   label: intl.get(`smnd.monitorDashboard.view.message.responseModule`).d('响应模块'),
    //   help: intl
    //     .get('smnd.monitorDashboard.view.message.responseModuleTip')
    //     .d('手动录入该配置对应的mq的消费者服务模块，feign的被调用方服务模块'),
    // },
    {
      name: 'responseService',
      label: intl.get(`smnd.monitorDashboard.view.message.responseService`).d('响应服务'),
    },
    {
      name: 'tableName',
      label: intl.get(`smnd.monitorDashboard.view.message.tableName`).d('功能主表'),
    },
    {
      name: 'retentionTime',
      label: intl.get(`smnd.monitorDashboard.view.message.retentionTime`).d('异常数据保留时长(天)'),
      help: intl.get('smnd.monitorDashboard.view.message.retentionTimeTip').d('最大保留时间'),
    },
    {
      name: 'blacklistObj',
      label: intl.get(`smnd.monitorDashboard.view.message.blacklist`).d('租户黑名单'),
      lovCode: 'HPFM.TENANT_ALL',
      multiple: true,
      type: 'object',
      ignore: 'always',
      help: intl
        .get('smnd.monitorDashboard.view.message.blacklistObjTip')
        .d('该租户的数据会被直接丢弃，不会持久化。'),
    },
    {
      name: 'blacklist',
      bind: 'blacklistObj.tenantId',
    },
    {
      name: 'enableFlag',
      label: intl.get(`smnd.monitorDashboard.view.message.enableFlag`).d('是否启用'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'requestMapping',
      label: intl.get(`smnd.monitorDashboard.view.message.requestMapping`).d('请求报文字段映射'),
      help: intl
        .get('smnd.monitorDashboard.view.message.requestMappingTip')
        .d('表达式格式 xxx.xxx'),
    },
    {
      name: 'responseMapping',
      label: intl.get(`smnd.monitorDashboard.view.message.responseMapping`).d('返回报文字段映射'),
      help: intl
        .get('smnd.monitorDashboard.view.message.responseMappingTip')
        .d('表达式格式 xxx.xxx'),
    },
    {
      name: 'type',
      label: intl.get(`smnd.monitorDashboard.view.message.type`).d('监控类型'),
      lookupCode: 'SMND_TYPE',
    },
    {
      name: 'routingKey',
      label: intl.get(`smnd.monitorDashboard.view.message.routingKey`).d('分组键'),
      help: intl
        .get('smnd.monitorDashboard.view.message.routingKeyTip')
        .d(
          '主要用来给mq使用，针对同一主题，对应多种数据格式的情况，它的值等于报文中根据代码中分组键表达式解析报文计算出来的值。'
        ),
    },
    {
      name: 'settingCode',
      label: intl.get(`smnd.monitorDashboard.view.message.settingCode`).d('配置编码'),
      help: intl
        .get('smnd.monitorDashboard.view.message.settingCodeTip')
        .d('与代码中监控注解汇中配置编码保持一致'),
    },
    {
      name: 'exceptionDefinition',
      label: intl.get(`smnd.monitorDashboard.view.message.exceptionDefinition`).d('异常定义'),
    },
    {
      name: 'action',
      label: intl.get(`smnd.monitorDashboard.view.message.action`).d('操作'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `/smnd/v1/${organizationId}/config/queryList`,
        method: 'GET',
      };
    },
  },
  events: {
    update: ({ record, name }) => {
      // if (name === 'requestModuleCode') {
      //   const txtdata = record?.getField('requestModuleCode').getText();
      //   if (!txtdata) {
      //     const selecdData = record?.dataSet?.getField('requestModuleCode');
      //     const text = selecdData?.getLookupText(record.get('requestModuleCode'), true, record);
      //     record.set('requestModule', text);
      //   }
      // }
      if (name === 'responseModuleCode') {
        // const txtdata = record?.getField('responseModuleCode').getText();
        // console.log(txtdata, 'txtdata');
        // if (!txtdata) {
        //   const selecdData = record?.dataSet?.getField('responseModuleCode');
        //   const text = selecdData?.getLookupText(record.get('responseModuleCode'), true, record);
        //   console.log(text, 'text');
        //   record.set('responseModule', text);
        // }
        const selecdData = record?.dataSet?.getField('responseModuleCode');
        const text = selecdData?.getLookupText(record.get('responseModuleCode'), true, record);
        console.log(text, 'text');
        record.set('responseModule', text);
      }
    },
  },
});

export { monitorServiceDataSet };
