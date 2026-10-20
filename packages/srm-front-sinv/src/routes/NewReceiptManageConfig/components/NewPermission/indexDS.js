import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const indexDS = (workFlag, readOnly) => ({
  dataToJSON: 'all',
  paging: false,
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      name: 'srmEnable',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.srmEnable').d('执行系统'),
      required: true,
      lookupCode: 'SINV.STRATEGY_EXTERNAL_SYSTERM',
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: ({ record }) => {
        return {
          disabled: !!(record.get('trxLineCount') > 0),
        };
      },
    },
    {
      name: 'subjectType',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.subjectType').d('执行标的'),
      // required: true,
      lookupCode: 'SINV.RCV_SUBJECT_TYPE',
      dynamicProps: ({ record }) => {
        return {
          required: !['PLAN', 'ASN'].includes(record?.get('nodeOrderType')),
          disabled: !(!(record.get('trxLineCount') > 0) && record.get('nodeOrderType') === 'RCV'),
        };
      },
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
      name: 'coopFlag',
      type: 'number',
      label: intl.get('sinv.receiptManage.model.receipt.coopFlag').d('启用交互'),
      lookupCode: 'SLOD.TACTICS_ENABLE_FLAG',
    },
    {
      name: 'approveRuleCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.receiveApproveRule').d('收货审批规则'),
      // required: true,
      lookupCode: 'SINV.STRATEGY_APPROVE_METHOD',
      dynamicProps: ({ record }) => {
        return {
          required: !['PLAN', 'ASN'].includes(record?.get('nodeOrderType')),
        };
      },
      defaultValue: 'NONE',
    },
    {
      name: 'returnedApproveRule',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.returnApproveRule').d('退货审批规则'),
      // required: true,
      lookupCode: 'SINV.STRATEGY_APPROVE_METHOD',
      dynamicProps: ({ record }) => {
        return {
          required: !['PLAN', 'ASN'].includes(record?.get('nodeOrderType')),
        };
      },
      defaultValue: 'NONE',
    },
    {
      name: 'approveUserFlag',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.approveUserFlag').d('启用收货指定审批人'),
      // required: true,
      lookupCode: 'SLOD.TACTICS_ENABLE_FLAG',
      defaultValue: '0',
      dynamicProps: ({ record }) => {
        return {
          required: ['WFL', 'WORKFLOW_APPROVAL'].includes(record?.get('approveRuleCode')),
        };
      },
    },
    {
      name: 'returnApproveUserFlag',
      type: 'string',
      label: intl
        .get('sinv.receiptManage.model.receipt.returnApproveUserFlag')
        .d('启用退货指定审批人'),
      // required: true,
      lookupCode: 'SLOD.TACTICS_ENABLE_FLAG',
      defaultValue: '0',
      dynamicProps: ({ record }) => {
        return {
          required: ['WFL', 'WORKFLOW_APPROVAL'].includes(record?.get('returnedApproveRule')),
        };
      },
    },
    // {
    //   name: 'tailDifferenceQuantity',
    //   type: 'number',
    //   label: intl.get('sinv.receiptManage.model.receipt.tailDifferenceQuantity').d('数量尾差范围'),
    //   range: ['start', 'end'],
    //   defaultValue: { start: 0, end: 0 },
    //   min: 0,
    //   help: intl
    //     .get('sinv.receiptManage.model.receipt.tailDifferenceQuantityText')
    //     .d(
    //       '按金额验收时，系统会自动根据接收金额反算数量。反算出的数量若存在尾差，可配置容许的数量尾差范围。在范围内的数量尾差系统将忽略，否则可能会阻塞流程。'
    //     ),
    //   validator: (value) => {
    //     if (value?.start > 0) {
    //       return intl.get('sinv.receiptManage.model.receipt.numberMustZero').d('起始数量必须为0');
    //     } else {
    //       return true;
    //     }
    //   },
    //   transformResponse: (value) => {
    //     return value && { start: 0, end: value || 0 };
    //   },
    //   transformRequest: (val) => val && val.end,
    //   dynamicProps: {
    //     disabled: ({ record }) => record.get('subjectType') === 'QUANTITY',
    //   },
    // },
    {
      name: 'updateRoleIdsLov',
      type: 'object',
      label: intl.get('sinv.receiptManage.model.receipt.operateRole').d('操作权限角色'),
      // required: true,
      multiple: true,
      lovCode: 'SPUC.SINV_LOV_ROLE',
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: ({ record }) => {
        return {
          required: !['PLAN', 'ASN'].includes(record?.get('nodeOrderType')),
        };
      },
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
      // required: true,
      multiple: true,
      lovCode: 'SPUC.SINV_LOV_ROLE',
      lovPara: {
        tenantId: organizationId,
      },
      dynamicProps: ({ record }) => {
        return {
          required: !['PLAN', 'ASN'].includes(record?.get('nodeOrderType')),
        };
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
      name: 'settleFlag',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.settleFlag').d('事务推送结算平台'),
      lookupCode: 'SPUC.SINV_SETTLE_CONFIG',
    },
    {
      name: 'financeReverseCode',
      type: 'string',
      label: intl
        .get('sinv.receiptManage.model.receipt.financeReverseCode')
        .d('对账/开票状态控制是否可退货'),
      lookupCode: 'SINV.FINANCE_REVERSE_CONTROL_CODE',
      help: intl
        .get('sinv.receiptManage.model.receipt.financeReverseCodeTip')
        .d('用于控制在【收货工作台】退货时，已对账/开票事务是否允许退货。'),
      multiple: true,
      valueField: 'value',
      textField: 'meaning',
      defaultValue: ['NONE'],
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
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
        disabled: ({ record }) => !record.get('firstRcvNodeFlag'),
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
        disabled: ({ record }) => !record.get('firstRcvNodeFlag'),
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
      // required: !workFlag,
      lookupCode: 'ASN_RECEIVE_RULE',
      defaultValue: 'NONE',
      help: intl
        .get('sinv.receiptManage.model.receipt.asnReceiveRuleTip')
        .d('用于控制外部系统导入的接收事务所传的送货单已失效时，是否允许接收'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('firstRcvNodeFlag'),
        required: ({ record }) =>
          !['PLAN', 'ASN'].includes(record?.get('nodeOrderType')) && !workFlag,
      },
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
      lookupCode: 'ASN_MATCH_RULE',
      defaultValue: 'FUZZY',
      help: intl
        .get('sinv.receiptManage.model.receipt.returnAsnMatchRuleTip')
        .d('用于控制外部系统导入的退货事务未传送货单信息时，退货事务匹配送货单的方式'),
    },
    {
      name: 'overReceiveFlag',
      type: 'string',
      lookupCode: 'SINV.OVER_RECEIVE_STANDARD',
      label: intl.get('sinv.receiptManage.model.receipt.overReceiveFlag').d('允许超量收货'),
      help: readOnly
        ? null
        : intl
            .get('sinv.receiptManage.model.receipt.overReceiveFlagTip')
            .d('用于控制外部系统导入的事务能否超量接收'),
      dynamicProps: {
        disabled: ({ record }) => {
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
    {
      name: 'exportOutsourceFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('sinv.receiptManage.model.receipt.exportOutsourceFlag').d('导出至委外工作台'),
    },
    {
      name: 'exportStockFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('sinv.receiptManage.model.receipt.exportStockFlag').d('导出至库存管理工作台'),
      help: !readOnly
        ? intl
            .get('sinv.receiptManage.model.receipt.exportStockFlagTip')
            .d('默认异步导出至库存管理工作台，导出结果可在单据导出记录中查看')
        : null,
    },
    // {
    //   name: 'exportFinanceFlag',
    //   type: 'string',
    //   lookupCode: 'HPFM.FLAG',
    //   label: intl.get('sinv.receiptManage.model.receipt.exportFinanceFlag').d('导出至资金计划'),
    //   help: !readOnly
    //     ? intl
    //         .get('sinv.receiptManage.model.receipt.exportFinanceFlagTips')
    //         .d(
    //           '配合业务规则定义“资金计划编制事务来源与预制规则”使用，当导出至资金计划配置为是、且资金计划编制事务来源配置为收货事务时，收货事务支持导出用于资金计划编制'
    //         )
    //     : null,
    // },
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
        // const num = record.index + 1;
        // if (String(num).length > 2) {
        //   record.set('lineSeq', num);
        // } else {
        //   const seq = (Array(2).join(0) + num).slice(-2);
        //   record.set('lineSeq', seq);
        // }
      });
    },
    update: ({ record, name, value }) => {
      if (
        name === 'srmEnable' &&
        value === '0' &&
        !['PLAN', 'ASN'].includes(record?.get('nodeOrderType'))
      ) {
        record.set('exportExtEnable', 0);
      }
      if (name === 'nodeConfigNameLov' && value && value.nodeOrderType !== 'RCV') {
        record.set('overReceiveFlag', 0);
        record.set('asnMatchRule', 'FUZZY');
      }
      // if (name === 'subjectType' && value === 'QUANTITY') {
      //   record.set('tailDifferenceQuantity', { start: 0, end: 0 });
      // }
      // const num = record.index + 1;
      // if (String(num).length > 2) {
      //   record.set('lineSeq', num);
      // } else {
      //   const seq = (Array(2).join(0) + num).slice(-2);
      //   record.set('lineSeq', seq);
      // }
    },
  },
});

export { indexDS };
