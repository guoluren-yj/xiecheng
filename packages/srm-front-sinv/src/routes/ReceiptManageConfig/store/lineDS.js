/*
 * @Description:
 * @Date: 2020-09-06 10:38:14
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// import uuidV4 from 'uuid/v4';

const organizationId = getCurrentOrganizationId();

const mainTableDS = () => ({
  primaryKey: 'nodeConfigId',
  // autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'nodeConfigCode',
      type: 'number',
      required: true,
      label: intl.get('sinv.receiptManage.model.receipt.lineSeq').d('节点顺序'),
      // validator: (value, _, record) => {
      //   const reg = /[\u4e00-\u9fa5]/gm;
      //   if (reg.test(record.get('nodeConfigCode'))) {
      //     return intl
      //       .get('sinv.receiptManage.viewCode.validation.notChinese')
      //       .d('节点编码不能为中文');
      //   }
      //   return true;
      // },
    },
    {
      name: 'nodeConfigName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.nodeConfigName').d('业务流程节点'),
      required: true,
    },
    {
      name: 'nodeOrderType',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.nodeOrderType').d('单据类型'),
      required: true,
      lookupCode: 'SINV.RCV_NODE_ORDER_TYPE',
      dynamicProps: ({ record }) => {
        return {
          defaultValue: !record.workFlag ? 'RCV' : null,
        };
      },
    },
    {
      name: 'nodeCodeRuleLov',
      type: 'object',
      lovCode: 'SPUC.SINV.CODE.RULE',
      ignore: 'always',
      label: intl.get('sinv.receiptManage.model.receipt.nodeCodeRule').d('单号编码规则'),
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
        };
      },
    },
    {
      name: 'nodeCodeRule',
      type: 'string',
      bind: 'nodeCodeRuleLov.ruleCode',
    },
    {
      name: 'nodeCodeRuleMeaning',
      type: 'string',
      bind: 'nodeCodeRuleLov.ruleName',
    },
    {
      name: 'refRcvTypeCodeLov',
      type: 'object',
      ignore: 'always',
      label: intl
        .get('sinv.receiptManage.model.receipt.receiptRcvTrxTypCode')
        .d('平台收货类型编码'),
      lovCode: 'SINV.RECEIVE_TRX_TYPE_NEW',
      help: intl
        .get('sinv.receiptManage.model.receipt.receiptExplain')
        .d(
          '单据不显示此类型，仅用于系统判断是否需将收货数据匹配到订单/送货单；请在【租户收货类型】中维护明细用于体现业务数据分类'
        ),
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: ({ record }) => {
        const flag =
          record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN';
        return {
          disabled: flag,
          required: !flag,
        };
      },
      // validator: (value, name, record) => {
      //   const list = record.dataSet
      //     .toData()
      //     .filter(i => i.refRcvTypeCode === record.get('refRcvTypeCode'));
      //   if (list.length > 1 && record.get('nodeOrderType') !== 'ASN') {
      //     return intl
      //       .get('sinv.receiptManage.model.receipt.rcvTrxTypCode.repeat')
      //       .d('SRM事务编码不能重复');
      //   }
      //   return true;
      // },
    },
    {
      name: 'refRcvTypeCode',
      type: 'string',
      bind: 'refRcvTypeCodeLov.rcvTrxTypeCode',
    },
    {
      name: 'refRcvTypeId',
      type: 'string',
      bind: 'refRcvTypeCodeLov.rcvTrxTypeId',
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptRcvName').d('平台收货类型描述'),
      bind: 'refRcvTypeCodeLov.rcvTrxTypeName',
    },
    {
      name: 'associateExternal',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptType').d('租户收货类型'),
      help: intl
        .get('sinv.receiptManage.model.receipt.receiptTypename')
        .d('支持维护不同系统来源的收货类型编码及描述，请至少维护一个收货类型'),
    },
    {
      name: 'reverseEnable',
      type: 'boolean',
      label: intl.get('sinv.receiptManage.model.receipt.reverseReturns').d('可退货'),
      trueValue: 1,
      falseValue: 0,
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('nodeOrderType') === 'ASN' || record.get('nodeOrderType') === 'PLAN',
        };
      },
    },
    {
      name: 'reversalMain',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptReturnTypes').d('租户退货类型'),
      help: intl
        .get('sinv.receiptManage.model.receipt.receipReturnTypeHelpers')
        .d(
          '支持维护不同系统来源的退货类型编码及描述，如果没有退货，则无需维护，如有，则至少维护一个退货类型'
        ),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('trxLineCount') > 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
    update: ({ record, name, value }) => {
      if (name === 'nodeOrderType' && (value === 'ASN' || value === 'PLAN')) {
        record.set('nodeCodeRuleLov', null);
        record.set('nodeCodeRule', null);
        record.set('nodeCodeRuleName', null);
        record.set('refRcvTypeCodeLov', null);
        record.set('rcvTrxTypeId', null);
        record.set('rcvTypeName', null);
        record.set('reverseEnable', null);
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-node-configs`,
        method: 'GET',
        data: {
          tenantId: organizationId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-node-configs`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const systemDS = () => ({
  primaryKey: 'mappingId',
  paging: false,
  fields: [
    {
      name: 'externalSystemCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptSystemCode').d('来源系统代码'),
      defaultValue: 'SRM',
      help: intl
        .get('sinv.receiptManage.model.receipt.receiptSystemCodeHelp')
        .d(
          '默认SRM系统，若为外部系统，请按照接口给出的外部系统编码进行修改维护（SRM收货只可选到代码为“SRM”的数据）'
        ),
    },
    {
      name: 'rcvTypeCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptRcvTypeCode').d('收货类型编码'),
      required: true,
    },
    {
      name: 'rcvTypeName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.receiptRcvTypeName').d('收货类型描述'),
      required: true,
    },
    {
      name: 'attachmentUuid',
      help: intl
        .get('sinv.receiptManage.model.receipt.attachmentUuidCodehelp')
        .d('收货单选择对应收货类型后可进行模板附件下载'),
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.attachmentUuidCode').d('附件模板'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('trxLineCount') > 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      const { params = {} } = data;
      const { name, ...other } = params;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-ext-mappings/${params[name]}`,
        method: 'GET',
        data: other,
      };
    },
  },
});

const returnDS = () => ({
  primaryKey: 'mappingId',
  paging: false,
  fields: [
    {
      name: 'externalSystemCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptSystemCode').d('来源系统代码'),
      defaultValue: 'SRM',
      help: intl
        .get('sinv.receiptManage.model.receipt.returnSystemCodeHelps')
        .d(
          '默认SRM系统，若为外部系统，请按照接口给出的外部系统编码进行修改维护（SRM退货只可选到代码为“SRM”的数据）'
        ),
    },
    {
      name: 'rcvTypeCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.returnRcvTypeCodes').d('退货类型编码'),
      required: true,
    },
    {
      name: 'rcvTypeName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.returnRcvTypeNames').d('退货类型描述'),
      required: true,
    },
    {
      name: 'attachmentUuid',
      help: intl
        .get('sinv.receiptManage.model.receipt.returnSystemUuidHelp')
        .d('收货单选择对应退货类型后可进行模板附件下载'),
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.attachmentUuidCode').d('附件模板'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('trxLineCount') > 0) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      const { params = {} } = data;
      const { name, ...other } = params;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-ext-mappings/${params[name]}`,
        method: 'GET',
        data: other,
      };
    },
  },
});

const reverseDS = () => ({
  paging: false,
  primaryKey: 'reverseConfigId',
  fields: [
    {
      name: 'reverseNodeConfigLov',
      type: 'object',
      label: intl.get('sinv.receiptManage.model.receipt.reversalNodes').d('退货节点'),
      required: true,
      ignore: 'always',
      lovCode: 'SINV.NODE_CONFIG_PRE',
      lovPara: {
        tenantId: organizationId,
      },
      // dynamicProps: {
      //   lovPara: ({ dataSet }) => ({
      //     tenantId: organizationId,
      //     nodeConfigId: dataSet.queryParameter.nodeConfigId,
      //   }),
      // },
    },
    {
      name: 'reverseNodeConfigId',
      type: 'string',
      bind: 'reverseNodeConfigLov.nodeConfigId',
    },
    {
      name: 'reverseNodeConfigName',
      type: 'string',
      bind: 'reverseNodeConfigLov.nodeConfigName',
    },
    {
      name: 'refRcvTypeCodeLov',
      type: 'object',
      ignore: 'always',
      label: intl
        .get('sinv.receiptManage.model.receipt.receipReturnTypCodes')
        .d('平台退货类型编码'),
      lovCode: 'SINV.RECEIVE_TRX_TYPE_NEW',
      lovPara: {
        tenantId: organizationId,
      },
      required: true,
    },
    {
      name: 'rcvTypeCode',
      type: 'string',
      bind: 'refRcvTypeCodeLov.rcvTrxTypeCode',
    },
    {
      name: 'refRcvTypeId',
      type: 'string',
      bind: 'refRcvTypeCodeLov.rcvTrxTypeId',
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiptRcvNames').d('平台退货类型描述'),
      bind: 'refRcvTypeCodeLov.rcvTrxTypeName',
    },
    {
      name: 'associateExternalSystemCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.assReturnTypes').d('租户退货类型'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        record.set('status', 'update');
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { nodeConfigId },
      } = dataSet;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-reverse-configs/${nodeConfigId}`,
        method: 'GET',
      };
    },
  },
});

const strTableDS = (workFlag) => ({
  primaryKey: 'nodeStrategyId',
  autoQuery: true,
  // paging: false,
  fields: [
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.strategyCode').d('策略编号'),
      required: true,
    },
    {
      name: 'strategyName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.strategyName').d('策略名称'),
      required: true,
    },
    {
      name: 'sourceOrderType',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.sourceOrderType').d('单据来源'),
      // textField: 'sourceOrderTypeMeaning',
      // valueField: 'sourceOrderType',
      dynamicProps: ({ record }) => {
        return {
          required: true,
          lookupCode:
            workFlag || record.get('workFlag')
              ? 'SINV.RCV_SOURCE_ORDER_TYPE_SLOD'
              : 'SINV.RCV_SOURCE_ORDER_TYPE',
          // defaultValue: !(record.workFlag || record.get('workFlag')) && null,
        };
      },
    },
    {
      name: 'scheduledDeliveryFlag',
      type: 'boolean',
      label: intl.get('sinv.receiptManage.model.receipt.scheduledDeliveryFlag').d('按计划排程送货'),
      trueValue: 1,
      falseValue: 0,
      dynamicProps: ({ record }) => {
        return {
          disabled: !(record.get('scheduledDeliveryEditFlag') === 1),
        };
      },
    },
    {
      name: 'detailMaintain',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.detailMaintain').d('明细维护'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sinv.receiptManage.model.receipt.enabledFlag').d('启用'),
    },
  ],
  // event: {
  //   load: ({ dataSet }) => {
  //     queryDeliveryWorkbench().then(res => {
  //       dataSet.forEach((record) => {
  //         // eslint-disable-next-line no-param-reassign
  //         record.workFlag = res;
  //       });
  //     });
  //   },
  // },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-strategy-headers`,
        method: 'GET',
        data: {
          tenantId: organizationId,
        },
      };
    },
  },
});

const lineDS = () => ({
  primaryKey: 'strategyLineId',
  fields: [
    {
      name: 'lineSeq',
      type: 'number',
      label: intl.get('sinv.receiptManage.model.receipt.lineSeq').d('节点顺序'),
    },
    {
      name: 'nodeConfigNameLov',
      type: 'object',
      label: intl.get('sinv.receiptManage.model.receipt.nodeConfigNameLov').d('节点名称'),
      required: true,
      lovCode: 'SINV.NODE_CONFIG_STRATEGY',
      ignore: 'always',
      lovPara: {
        tenantId: organizationId,
      },
      validator: (value, name, record) => {
        const list = record.dataSet.toData().filter((i) => +i.nodeConfigId === +value.nodeConfigId);
        if (list.length > 1) {
          return intl.get('sinv.receiptManage.model.receipt.node.repeat').d('节点不能重复');
        }
        return true;
      },
    },
    {
      name: 'nodeConfigId',
      type: 'string',
      bind: 'nodeConfigNameLov.nodeConfigId',
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      bind: 'nodeConfigNameLov.nodeConfigName',
    },
    {
      name: 'nodeOrderType',
      type: 'string',
      bind: 'nodeConfigNameLov.nodeOrderType',
    },
    {
      name: 'rcvTrxTypeCode',
      type: 'string',
      bind: 'nodeConfigNameLov.rcvTrxTypeCode',
    },
    {
      name: 'srmEnable',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.srmEnable').d('执行系统'),
      required: true,
      lookupCode: 'SINV.STRATEGY_EXTERNAL_SYSTERM',
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'subjectType',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.subjectType').d('执行标的'),
      required: true,
      lookupCode: 'SINV.RCV_SUBJECT_TYPE',
    },
    {
      name: 'updateRoleIdsLov',
      type: 'object',
      label: intl.get('sinv.receiptManage.model.receipt.operateRole').d('操作权限角色'),
      required: true,
      multiple: true,
      lovCode: 'SPUC.SINV_LOV_ROLE',
      lovPara: {
        tenantId: organizationId,
      },
      // transformRequest: val => val && val.toString(),
      // transformResponse: val => val && val.split(','),
    },
    {
      name: 'updateRoleIds',
      type: 'string',
      bind: 'updateRoleIdsLov.id',
      multiple: ',',
    },
    {
      name: 'updateRoleNames',
      type: 'string',
      bind: 'updateRoleIdsLov.name',
      multiple: ',',
    },
    {
      name: 'updateRoleCodes',
      type: 'string',
      bind: 'updateRoleIdsLov.code',
      multiple: ',',
    },
    {
      name: 'queryRoleIdsLov',
      type: 'object',
      label: intl.get('sinv.receiptManage.model.receipt.queryRole').d('查询权限角色'),
      required: true,
      multiple: true,
      lovCode: 'SPUC.SINV_LOV_ROLE',
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'queryRoleIds',
      type: 'string',
      bind: 'queryRoleIdsLov.id',
      multiple: ',',
    },
    {
      name: 'queryRoleNames',
      type: 'string',
      bind: 'queryRoleIdsLov.name',
      multiple: ',',
    },
    {
      name: 'queryRoleCodes',
      type: 'string',
      bind: 'queryRoleIdsLov.code',
      multiple: ',',
    },
    {
      name: 'autoReceiveRule',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.autoReceiveRule').d('单据自动生成规则'),
      lookupCode: 'SINV.AUTO_RECEIVE_RULE',
      dynamicProps: {
        disabled: ({ record }) => {
          if (record.get('srmEnable') === '0' || record.get('nodeOrderType') === 'PLAN') {
            return true;
          } else {
            return false;
          }
        },
      },
      defaultValue: 'NONE',
    },
    {
      name: 'approveRuleCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiveApproveRule').d('收货审批规则'),
      required: true,
      lookupCode: 'SINV.STRATEGY_APPROVE_METHOD',
      defaultValue: 'NONE',
    },
    {
      name: 'returnedApproveRule',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.returnApproveRule').d('退货审批规则'),
      required: true,
      lookupCode: 'SINV.STRATEGY_APPROVE_METHOD',
      defaultValue: 'NONE',
    },

    {
      name: 'financeReverseCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.financeReverseCode').d('财务冲销控制'),
      lookupCode: 'SINV.FINANCE_REVERSE_CONTROL_CODE',
      help: intl
        .get('sinv.receiptManage.model.receipt.financeReverseCodeTip')
        .d('用于控制在【收货工作台】退货时，已对账/开票事务是否允许退货。'),
    },
    {
      name: 'exportExtEnable',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.exportExtEnable').d('导出至外部系统'),
      lookupCode: 'SPUC.SINV_EXPORT_CONFIG',
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            record.get('srmEnable') === '0' ||
            record.get('nodeOrderType') === 'ASN' ||
            record.get('nodeOrderType') === 'PLAN'
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'settleFlag',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.settleFlag').d('导出至结算平台'),
      lookupCode: 'SPUC.SINV_SETTLE_CONFIG',
    },
    {
      name: 'poReceiveRule',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.poReceiveRule').d('订单接收规则'),
      lookupCode: 'SINV_STRATEGY_PO_RECEIVE_RULE',
      multiple: true,
      valueField: 'value',
      textField: 'meaning',
      defaultValue: ['NONE'],
      help: intl
        .get('sinv.receiptManage.model.receipt.poReceiveRuleTip')
        .d('用于外部系统导入的接收事务,配置订单的可接收状态'),
      dynamicProps: {
        disabled: ({ dataSet, record }) => {
          // 第一个事务节点为RCV放开 其他禁用
          if (
            record.get('lineSeq') ===
              Math.min(
                ...dataSet
                  .toData()
                  .filter((i) => i.nodeOrderType === 'RCV')
                  .map((i) => i.lineSeq)
              ) &&
            record.get('nodeOrderType') === 'RCV'
          ) {
            return false;
          } else {
            return true;
          }
        },
      },
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
    },

    {
      name: 'slodReceiveRule',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.ShipmentReceiptRules').d('发货单接收规则'),
      lookupCode: 'SINV.SLOD_RECEIVE_RULE',
      multiple: true,
      valueField: 'value',
      textField: 'meaning',
      defaultValue: ['NONE'],
      help: intl
        .get('sinv.receiptManage.model.receipt.slodReceiveRuleTip')
        .d('用于外部系统导入的接收事务中存在发货单信息时，配置发货单的可接收状态。'),
      dynamicProps: {
        disabled: ({ dataSet, record }) => {
          // 第一个事务节点为RCV放开 其他禁用
          if (
            record.get('lineSeq') ===
              Math.min(
                ...dataSet
                  .toData()
                  .filter((i) => i.nodeOrderType === 'RCV')
                  .map((i) => i.lineSeq)
              ) &&
            record.get('nodeOrderType') === 'RCV'
          ) {
            return false;
          } else {
            return true;
          }
        },
      },
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
    },

    {
      name: 'asnReceiveRule',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.asnReceiveRule').d('送货单接收规则'),
      required: true,
      lookupCode: 'ASN_RECEIVE_RULE',
      defaultValue: 'NONE',
      help: intl
        .get('sinv.receiptManage.model.receipt.asnReceiveRuleTip')
        .d('用于控制外部系统导入的接收事务所传的送货单已失效时，是否允许接收'),
    },
    {
      name: 'asnMatchRule',
      type: 'string',
      defaultValue: 'FUZZY',
      lookupCode: 'ASN_MATCH_RULE',
      label: intl.get('sinv.receiptManage.model.receipt.asnMatchRule').d('接收匹配送货单规则'),
      help: intl
        .get('sinv.receiptManage.model.receipt.asnMatchRuleTip')
        .d('用于控制外部系统导入的事务未传送货单信息时，事务匹配送货单的方式'),
    },
    {
      name: 'returnAsnMatchRule',
      type: 'string',
      label: intl
        .get('sinv.receiptManage.model.receipt.returnAsnMatchRule')
        .d('退货匹配送货单规则'),
      required: true,
      lookupCode: 'ASN_MATCH_RULE',
      defaultValue: 'FUZZY',
      help: intl
        .get('sinv.receiptManage.model.receipt.returnAsnMatchRuleTip')
        .d('用于控制外部系统导入的退货事务未传送货单信息时，退货事务匹配送货单的方式'),
    },
    {
      name: 'overReceiveFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sinv.receiptManage.model.receipt.overReceiveFlag').d('允许超量收货'),
      help: intl
        .get('sinv.receiptManage.model.receipt.overReceiveFlagTip')
        .d('用于控制外部系统导入的事务能否超量接收'),
      dynamicProps: {
        disabled: ({ record }) => {
          // 有生成事务单的、节点顺序是第一个的事务单节点时，匹配送货单规则、允许超量收货可以编辑, 其他事务不可以编辑
          // const targetIndex = dataSet
          //   .toData()
          //   .filter(t => t.nodeOrderType === 'RCV')
          //   .findIndex(t => t.strategyLineId === record.get('strategyLineId'));
          if (record.get('nodeOrderType') === 'RCV') {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      name: 'strategyLov',
      type: 'object',
      label: intl.get('sinv.receiptManage.model.receipt.readyStrategyERP').d('ERP收货备用策略'),
      multiple: true,
      lovCode: 'SINV.PARALLEL_STRATEGY_HEADER',
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          return {
            tenantId: organizationId,
            nodeStrategyId:
              record.get('strategyHeaderId') || dataSet.getQueryParameter('nodeStrategyId'),
            sourceOrderType: dataSet.getState('sourceOrderType'),
          };
        },
        disabled: ({ dataSet, record }) => {
          if (record.get('srmEnable') === '1') return true;
          if (
            record.get('lineSeq') ===
              Math.min(
                ...dataSet
                  .toData()
                  .filter((i) => i.nodeOrderType === 'RCV')
                  .map((i) => i.lineSeq)
              ) &&
            record.get('nodeOrderType') === 'RCV'
          ) {
            return false;
          }
          return true;
        },
      },
    },
    {
      name: 'parallelStrategyHeaderIds',
      type: 'number',
      bind: 'strategyLov.nodeStrategyId',
      multiple: ',',
    },
    {
      name: 'parallelStrategyHeaderNames',
      type: 'string',
      bind: 'strategyLov.strategyName',
      multiple: ',',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      const flag = dataSet.some((i) => i.get('trxLineCount') > 0);
      dataSet.forEach((record) => {
        if (record.get('trxLineCount') > 0) {
          Object.assign(record, { selectable: false });
        } else if (flag && record.get('nodeOrderType') === 'ASN') {
          Object.assign(record, { selectable: false });
        }
        const num = record.index + 1;
        if (String(num).length > 2) {
          record.set('lineSeq', num);
        } else {
          const seq = (Array(2).join(0) + num).slice(-2);
          record.set('lineSeq', seq);
        }
      });
    },
    update: ({ record, name, value }) => {
      if (name === 'srmEnable' && value === '0') {
        record.set('exportExtEnable', 0);
      }
      if (name === 'nodeConfigNameLov' && value && value.nodeOrderType !== 'RCV') {
        record.set('overReceiveFlag', 0);
        record.set('asnMatchRule', 'FUZZY');
      }
      const num = record.index + 1;
      if (String(num).length > 2) {
        record.set('lineSeq', num);
      } else {
        const seq = (Array(2).join(0) + num).slice(-2);
        record.set('lineSeq', seq);
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { nodeStrategyId } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-strategy-lines/${nodeStrategyId}`,
        method: 'GET',
      };
    },
  },
});

export { mainTableDS, systemDS, reverseDS, strTableDS, lineDS, returnDS };
