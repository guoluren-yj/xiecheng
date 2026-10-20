import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function thirdPartyDS() {
  return {
    primaryKey: 'thirdPartyId',
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'thirdPartyCode',
        type: 'string',
        required: true,
        unique: true,
        label: intl.get('smbl.thirdParty.model.ThirdParty.thirdPartyCode').d('三方平台编码'),
      },
      {
        name: 'thirdPartyDesc',
        type: 'intl',
        required: true,
        label: intl.get('smbl.thirdParty.model.ThirdParty.thirdPartyDesc').d('三方平台描述'),
      },
      {
        name: 'sendMessageUrl',
        type: 'url',
        label: intl.get('smbl.thirdParty.model.ThirdParty.sendMessageUrl').d('消息发送地址'),
      },
      {
        name: 'getTokenUrl',
        type: 'url',
        label: intl.get('smbl.thirdParty.model.ThirdParty.getTokenUrl').d('签名获取地址'),
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.model.remark').d('备注'),
      },
      {
        name: 'executeCode',
        type: 'string',
        label: intl.get('smbl.thirdParty.model.ThirdParty.executeCode').d('执行代码'),
      },
      {
        name: 'operationAction',
        type: 'string',
        label: intl.get('hzero.common.table.column.option').d('操作'),
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'thirdPartyCode',
        type: 'string',
        label: intl.get('smbl.thirdParty.model.ThirdParty.thirdPartyCode').d('三方平台编码'),
      },
      {
        name: 'thirdPartyDesc',
        type: 'string',
        label: intl.get('smbl.thirdParty.model.ThirdParty.thirdPartyDesc').d('三方平台描述'),
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },

    transport: {
      read: {
        url: `${SRM_SMBL}/v1/third-partys`,
        method: 'get',
      },
      destroy: {
        url: `${SRM_SMBL}/v1/third-partys`,
        method: 'delete',
      },
      create: {
        url: `${SRM_SMBL}/v1/third-partys`,
        method: 'post',
        autoQuery: true,
      },
      update: {
        url: `${SRM_SMBL}/v1/third-partys`,
        method: 'post',
      },
    },
  };
}
export { thirdPartyDS };
