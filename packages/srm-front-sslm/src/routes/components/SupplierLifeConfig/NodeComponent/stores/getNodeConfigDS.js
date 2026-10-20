/*
 * @Date: 2022-10-28 16:32:17
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

// 条件ds
const conditionDS = () => ({
  fields: [
    {
      name: 'conditionDesc',
      required: true,
      label: intl.get('sslm.supplierLifePolicyConfig.modal.config.conditionDesc').d('条件描述'),
    },
    {
      name: 'orderSeq',
      type: 'number',
      min: 1,
      step: 1,
      required: true,
      numberGrouping: false,
      label: intl.get('sslm.supplierLifePolicyConfig.modal.config.orderSeq').d('优先级'),
    },
    {
      name: 'authManualFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sslm.supplierLifePolicyConfig.modal.config.authManualFlag')
        .d('是否允许手工发起'),
    },
  ],
});

// 节点ds
const nodeDS = () => ({
  fields: [
    {
      name: 'nodeDesc',
      required: true,
      label: intl.get('sslm.supplierLifePolicyConfig.modal.config.nodeDesc').d('节点描述'),
    },
    {
      name: 'nodeType',
      required: true,
      lookupCode: 'SSLM.STRATEGY_NODE_TYPE',
      label: intl.get('sslm.supplierLifePolicyConfig.modal.config.nodeType').d('节点类型'),
    },
    {
      name: 'documentType',
      required: true,
      dynamicProps: {
        lookupCode: ({ record }) =>
          record.get('nodeType') === 'REGULATION'
            ? 'SSLM.STRATEGY_NODE_RULE_TYPE'
            : 'SSLM.STRATEGY_NODE_DOCUMENT_TYPE_SQL',
        label: ({ record }) =>
          record.get('nodeType') === 'REGULATION'
            ? intl.get('sslm.supplierLifePolicyConfig.modal.config.regulationType').d('规则类型')
            : intl.get('sslm.supplierLifePolicyConfig.modal.config.documentType').d('单据类型'),
      },
    },
    {
      name: 'controlFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('sslm.common.modal.field.strongControlFlag').d('手工发起升降级时是否强管控'),
    },
    {
      name: 'queryDocRule',
      required: true,
      defaultValue: 'QUERY_ALL_DOCUMENT',
      lookupCode: 'SSLM_STRATEGY_NODE_QUERY_RULE',
      label: intl.get('sslm.common.model.field.queryDocRule').d('查询单据规则'),
    },
    {
      name: 'ruleValue',
      type: 'number',
      step: 1,
      precision: 0,
      numberGrouping: false,
      label: intl.get('sslm.supplierLifePolicyConfig.modal.config.days').d('天数'),
      dynamicProps: {
        required: ({ record }) => record.get('nodeType') === 'REGULATION',
      },
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      switch (name) {
        case 'controlFlag': // controlFlag为0时，queryDocRule不显示，恢复默认值
          if (!value) {
            record.set('queryDocRule', 'QUERY_ALL_DOCUMENT');
          }
          break;
        default:
          break;
      }
    },
  },
});

// 后置动作ds
const actionDS = () => ({
  fields: [
    {
      name: 'actionContinueFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sslm.supplierLifePolicyConfig.modal.config.allActionContinueFlag')
        .d('所有节点完成后是否进行其他后置动作'),
    },
    {
      name: 'autoUpgradeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sslm.supplierLifePolicyConfig.modal.config.autoUpgradeFlag')
        .d('自动升级到目标阶段'),
      dynamicProps: {
        disabled: ({ record }) => record && !record.get('actionContinueFlag'),
      },
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'actionContinueFlag':
          record.set('autoUpgradeFlag', 0);
          break;
        default:
          break;
      }
    },
  },
});

export { conditionDS, nodeDS, actionDS };
