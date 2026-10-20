/*
 * @Description: index
 * @Date: 2021-11-24 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const chartsDS = (formDs, urlFlag) => ({
  dataToJSON: 'dirty-field',
  paging: false,
  forceValidate: true,
  // autoCreate: true,
  fields: [
    {
      name: 'createCampCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.createCampCode').d('创建方'),
      lookupCode: 'SLOD.CAMP_CODE',
      dynamicProps: ({ record }) => {
        return {
          required: record.canEditFlag === 1,
          disabled: record.canEditFlag === 0,
        };
      },
    },
    {
      name: 'createQuantityCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.createQuantityCode').d('创建数量控制'),
      lookupCode: 'SLOD.STRATEGY_CREATE_QUANTITY',
      dynamicProps: {
        required: ({ record }) => Number(record?.get('unlimitedCreateFlag')) !== 1,
        disabled: ({ record }) => Number(record?.get('unlimitedCreateFlag')) === 1,
      },
    },
    {
      name: 'approveMethod',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.approveMethod').d('内部审批'),
      lookupCode: 'SLOD.APPROVE_TYPE',
      dynamicProps: {
        required: ({ record }) => record.get('createCampCode') !== 'SUPPLIER',
        disabled: ({ record }) => record.get('createCampCode') === 'SUPPLIER',
      },
    },
    {
      name: 'unlimitedCreateFlag',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.unlimitedCreateFlag').d('允许无限创建'),
      lookupCode: 'HPFM.FLAG',
      help: intl
        .get('slod.shipmentsConfiguration.model.unlimitedCreateFlagTip')
        .d('若配置为【是】，只要来源订单为已确认的有效状态，则允许无限创建，没有任何数量限制'),
      dynamicProps: ({ record }) => {
        return {
          // required: record.canEditFlag === 1,
          disabled: record.canEditFlag === 0,
        };
      },
    },
    {
      name: 'autoCreateFlag', // 自动创建控制
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.autoCreateFlag').d('自动创建控制'),
      lookupCode: 'SLOD_AUTO_CREATE.FLAG',
      required: true,
      help: intl
        .get('slod.shipmentsConfiguration.model.autoCreateFlagTip')
        .d('配置是否根据来源单据初始化数据自动创建业务单据'),
    },
    {
      name: 'interactiveCampCode',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.interactiveCampCode').d('交互方'),
      lookupCode: 'SLOD.INTERACTIVE_CAMP_CODE',
      dynamicProps: ({ record }) => {
        return {
          required: record?.canEditFlag === 1,
          disabled: record?.canEditFlag === 0,
        };
      },
    },
    {
      name: 'interactiveType',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.interactiveType').d('交互方式'),
      lookupCode: 'SLOD.INTERACTIVE_TYPE',
      dynamicProps: {
        required: ({ record }) => record.get('interactiveCampCode') === 'PURCHASER',
        disabled: ({ record }) => record.get('interactiveCampCode') !== 'PURCHASER',
      },
    },
    {
      name: 'cooperativeLineFlag',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.cooperativeLineFlag').d('按行协同'),
      lookupCode: 'HPFM.FLAG',
      // required: true,
      dynamicProps: {
        required: ({ record }) =>
          (record.get('interactiveType') !== 'EXTERNAL_SYSTEM' ||
            record.get('interactiveType') !== 'WORKFLOW') &&
          record.get('interactiveCampCode') !== 'NONE',
        disabled: ({ record }) =>
          record.get('interactiveType') === 'EXTERNAL_SYSTEM' ||
          record.get('interactiveType') === 'WORKFLOW' ||
          record.get('interactiveCampCode') === 'NONE',
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.cooperativeLineFlagDetail')
        .d('配置供应商或者采购方在确认/拒绝业务单据时，是否可以按行操作'),
    },
    {
      name: 'demolitionUpdateCode',
      type: 'string',
      label: intl
        .get('slod.shipmentsConfiguration.model.demolitionUpdateCode')
        .d('允许交互方拆行更新'),
      lookupCode: 'SLOD.INTERACTIVE_SPLIT_LINE',
      dynamicProps: {
        required: ({ record }) => record.get('interactiveCampCode') !== 'NONE',
        disabled: ({ record }) =>
          record.get('interactiveCampCode') === 'NONE' ||
          ['LABEL', 'UNIQUE_LABEL'].includes(record.get('nodeTemplateCode')) ||
          record.get('interactiveType') === 'WORKFLOW',
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.demolitionUpdateCodeDetail')
        .d(
          '配置供应商或者采购方在确认业务单据时，是否可以对已发布的行进行拆分（拆行）、是否可以对已发布的行修改确认数量（更新）'
        ),
    },
    {
      name: 'feedbackRule',
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.feedbackRule').d('交互反馈规则'),
      dynamicProps: ({ record, dataSet }) => {
        return {
          required:
            ['PLAN', 'ASN'].includes(dataSet?.getState('nodeCode')) &&
            ['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
              record?.get('demolitionUpdateCode')
            ),
          multiple: ['PLAN'].includes(dataSet?.getState('nodeCode')),
          lookupCode: ['ASN'].includes(dataSet?.getState('nodeCode'))
            ? 'SLOD.ASN.CONFIRM_FEEDBACK_RULE'
            : 'SLOD.PLAN.CONFIRM_FEEDBACK_RULE',
          disabled: !['CAN_SPLIT_UPDATE', 'NO_SPLIT_CAN_UPDATE'].includes(
            record?.get('demolitionUpdateCode')
          ),
        };
      },
      transformResponse: (value) => {
        return value && value.split(',');
      },
      // transformRequest: (val) => val && val?.join(','),
      transformRequest: (val, record) => {
        if (['PLAN'].includes(record?.get('nodeTemplateCode'))) {
          return val && val?.join(',');
        }
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.feedbackRuleMessage')
        .d('当采购方/供应商点击【确认】按钮时，匹配该执行规则，来决定执行反馈逻辑还是确认逻辑。'),
    },
    {
      name: 'cooperativeQuantityCode',
      type: 'string',
      label: intl
        .get('slod.shipmentsConfiguration.model.cooperativeQuantityCode')
        .d('协同数量控制'),
      lookupCode: 'SLOD.STRATEGY_COOPERATIVE_QUANTITY',
      dynamicProps: {
        required: ({ record }) => record.get('interactiveCampCode') !== 'NONE',
        disabled: ({ record }) =>
          record.get('interactiveCampCode') === 'NONE' ||
          ['LABEL', 'UNIQUE_LABEL'].includes(record.get('nodeTemplateCode')) ||
          record.get('interactiveType') === 'WORKFLOW',
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.cooperativeQuantityCodeDetail')
        .d('配置供应商或者采购方在确认业务单据，且可以修改确认数量时，可以修改数量的最大范围值'),
    },
    {
      name: 'nodeQuantityOccupyStrategy',
      type: 'string',
      label: intl
        .get('slod.shipmentsConfiguration.model.nodeQuantityOccupyStrategys')
        .d('当前节点初始化数量占用规则'),
      lookupCode: 'SLOD.NODE_QUANTITY_OCCUPY_STRATEGY',
      dynamicProps: ({ record }) => {
        return {
          required: record.canEditFlag === 1,
          disabled: record.canEditFlag === 0,
        };
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.nodeQuantityOccupyStrategyDetail')
        .d(
          '用于控制当前节点的占用数量是仅由已创建的单据累加，还是包括已收货的数量同时累加，来更新可用数量'
        ),
    },
    {
      name: 'receiveStrategyFlag',
      type: 'string',
      label: intl
        .get('slod.shipmentsConfiguration.model.receiveStrategyFlags')
        .d('当前节点同步收货规则'),
      lookupCode: 'SLOD.SYNC_RECEIVE_CONFIG',
      dynamicProps: ({ record }) => {
        return {
          required:
            record.get('nodeQuantityOccupyStrategy') !== 'CURRENT' && record.canEditFlag === 1,
          disabled:
            record.get('nodeQuantityOccupyStrategy') === 'CURRENT' || record.canEditFlag === 0,
        };
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.receiveStrategyFlagDetail')
        .d('配置当前节点的单据变为【已确认】状态后，是否需要同步至下游收货模块，用于收货操作'),
    },
    {
      name: 'overReceiveRule', // 收货回写节点超量策略
      type: 'string',
      label: intl
        .get('slod.shipmentsConfiguration.model.overReceiveRules')
        .d('收货回写节点超量规则'),
      lookupCode: 'SLOD.OVER_RECEIVE_RULE',
      dynamicProps: ({ record }) => {
        return {
          required: true,
          disabled: record.get('nodeQuantityOccupyStrategy') === 'CURRENT',
        };
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.overReceiveRuleDetail')
        .d(
          '用于控制收货数量回写当前节点时，加上累计占用，是否允许超过当前节点的初始可用数量（即来源单据数量）'
        ),
    },
    {
      name: 'canCloseCampCode', // 可关闭单据角色阵营
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.canCloseCampCode').d('可关闭单据角色阵营'),
      lookupCode: 'SLOD.OPERABLE_CAMP_CODE',
      required: true,
    },
    {
      name: 'documentClosingStatusLimit', // 单据关闭状态限制
      type: 'string',
      label: intl
        .get('slod.shipmentsConfiguration.model.documentClosingStatusLimit')
        .d('单据关闭状态限制'),
    },
    {
      name: 'jurisdiction', // 操作/查询权限角色
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.jurisdiction').d('操作/查询权限角色'),
    },
    {
      name: 'alteration', // 变更字段定义列表
      type: 'string',
      label: intl.get('slod.shipmentsConfiguration.model.alteration').d('变更字段定义列表'),
    },
    {
      name: 'submitExportEsFlag', // 提交导出外部系统
      type: 'string',
      label: intl
        .get('slod.shipmentsConfiguration.model.submitExportEsEnable')
        .d('提交导出外部系统'),
      lookupCode: 'HPFM.FLAG',
      required: true,
    },
    {
      name: 'syncOutsourceFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl
        .get('slod.shipmentsConfiguration.model.syncOutsourceFlag')
        .d('确认导出委外协同工作台'),
    },
    {
      name: 'outsourceStrategy',
      type: 'object',
      lovCode: 'SLOD.SINV_STOCK_OUT_STRATEGY_LIST',
      label: intl.get('slod.shipmentsConfiguration.model.outsourceStrategyCode').d('映射委外类型'),
      dynamicProps: ({ record }) => {
        return {
          lovPara: {
            inspectFlag: '1', // 自定义非空参数，可以传任意值
          },
          required:
            record.get('syncOutsourceFlag') === '1' && record.get('nodeTemplateCode') === 'ASN',
          disabled:
            record.get('syncOutsourceFlag') !== '1' && record.get('nodeTemplateCode') === 'ASN',
        };
      },
    },
    {
      name: 'outsourceStrategyCode',
      bind: 'outsourceStrategy.strategyCode',
    },
    {
      name: 'outsourceStrategyCodeMeaning',
      bind: 'outsourceStrategy.strategyName',
    },
    {
      name: 'consultPlanCreateFlag',
      type: 'string',
      label: intl
        .get('slod.shipmentsConfiguration.model.consultPlanCreateFlag')
        .d('参考计划排程基于订单创建发货单'),
      lookupCode: 'SLOD.STRATEGY_CONSULT_PLAN_FLAG',
      dynamicProps: ({ record }) => {
        return {
          // required: record.canEditFlag === 1,
          disabled: record?.canEditFlag === 0,
        };
      },
      help: intl
        .get('slod.shipmentsConfiguration.model.consultPlanCreateFlagDetailMessage')
        .d(
          '计划协议订单的发货场景下，发货策略配置：订单同时存在两个下游节点：订单-计划排程；订单-送货单/标签。此时，送货单/标签节点可以配置【参考计划排程基于订单创建发货单】，配置后，引用采购订单创建送货单/标签页面，动态列展示计划排程数据用于指导送货，在创建送货单后，除了占用采购订单数量，会同步占用计划排程数量。'
        ),
    },
    {
      name: 'consultPlanNodeIdLov',
      type: 'object',
      label: intl
        .get('slod.shipmentsConfiguration.model.consultPlanNodeId')
        .d('被参考计划排程节点'),
      lovCode: 'SLOD.STRATEGY_CONSULT_PLAN_NODE',
      dynamicProps: ({ record }) => {
        return {
          lovPara: {
            strategyHeaderId: record?.get('strategyHeaderId'),
          },
          required: String(record?.get('consultPlanCreateFlag')) === '1',
          disabled:
            record?.canEditFlag === 0 || String(record?.get('consultPlanCreateFlag')) === '0',
        };
      },
    },
    {
      name: 'consultPlanNodeId',
      bind: 'consultPlanNodeIdLov.nodeConfigId',
    },
    {
      name: 'consultPlanNodeIdMeaning',
      bind: 'consultPlanNodeIdLov.nodeConfigName',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { strategyLineId, ...other } = data.params || {};
      const url = urlFlag ? `copy-strategy-line` : 'strategy-line';
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/${url}/${strategyLineId}`,
        method: 'GET',
        data: other,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      const { canEditLineFlag } = formDs?.current?.toData();
      dataSet.forEach((record) => {
        Object.assign(record, { canEditFlag: canEditLineFlag });
        if (!record.get('autoCreateFlag')) {
          record.set('autoCreateFlag', '0');
        }
        if (record.get('interactiveCampCode') === 'NONE') {
          record.set('interactiveType', '');
          record.set('cooperativeLineFlag', '');
          record.set('demolitionUpdateCode', '');
          record.set('cooperativeQuantityCode', '');
        }
        if (record.get('createCampCode') === 'SUPPLIER') {
          record.set('approveMethod', 'NONE');
        }
        if (
          record.get('nodeTemplateCode') === 'LABEL' ||
          record.get('nodeTemplateCode') === 'UNIQUE_LABEL'
        ) {
          record.set('demolitionUpdateCode', 'NO_SPLIT_NO_UPDATE');
          record.set('cooperativeQuantityCode', 'COOPERATIVE_EQ_INIT');
        }
        if (record.get('interactiveType') === 'WORKFLOW') {
          record.set('demolitionUpdateCode', 'NO_SPLIT_NO_UPDATE');
          record.set('cooperativeQuantityCode', 'COOPERATIVE_EQ_INIT	');
        }
        // if (!['PLAN'].includes(dataSet.getState('nodeCode'))) {
        //   record.set('feedbackRule', 'QUANTITY');
        // } else {
        //   record.set('feedbackRule', ['QUANTITY', 'ARRIVAL_DATE']);
        // }
      });
    },
    update: ({ dataSet, record, name, value }) => {
      // if (name === 'createQuantityCode') { // pur-7869需求解除级联关系
      //   if (value !== 'EQ_SOURCE_QUANTITY') {
      //     record.set('autoCreateFlag', '0');
      //   }
      // }
      if (name === 'createCampCode') {
        if (value === 'SUPPLIER') {
          record.set('approveMethod', 'NONE');
        }
      }
      if (name === 'interactiveCampCode') {
        if (value === 'NONE') {
          record.set('interactiveType', '');
          record.set('cooperativeLineFlag', '');
          record.set('feedbackRule', ['QUANTITY', 'ARRIVAL_DATE']);
          // record.set('cooperativeQuantityCode', ''); // 梦雪： 交互方为无须交互 不清空 协同数量控制Hi
        } else if (value === 'SUPPLIER') {
          record.set('interactiveType', 'FUNCTIONAL');
        }
      }
      if (name === 'interactiveType') {
        if (value === 'EXTERNAL_SYSTEM') {
          record.set('cooperativeLineFlag', '0');
        }
        if (value === 'WORKFLOW') {
          record.set('cooperativeLineFlag', '0');
          record.set('demolitionUpdateCode', 'NO_SPLIT_NO_UPDATE');
          record.set('cooperativeQuantityCode', 'COOPERATIVE_EQ_INIT');
        }
      }
      if (name === 'nodeQuantityOccupyStrategy') {
        if (value === 'CURRENT') {
          record.set('receiveStrategyFlag', '0');
          record.set('overReceiveRule', 'NONE');
        } else if (value === 'CUR_AND_DOWNSTREAM') {
          record.set('overReceiveRule', '');
        }
      }
      if (name === 'demolitionUpdateCode') {
        if (value === 'NO_SPLIT_NO_UPDATE') {
          if (['PLAN'].includes(dataSet?.getState('nodeCode'))) {
            record.set('feedbackRule', ['QUANTITY', 'ARRIVAL_DATE']);
          } else {
            record.set('feedbackRule', 'QUANTITY');
          }
        }
      }
      if (name === 'unlimitedCreateFlag') {
        if (value === '1') {
          record.set('createQuantityCode', '');
        }
      }
      if (name === 'consultPlanCreateFlag') {
        if (String(value) === '0') {
          record.set('consultPlanNodeId', null);
          record.set('consultPlanNodeIdLov', null);
          record.set('consultPlanNodeIdMeaning', null);
        }
      }
    },
  },
});

const chartsAddDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'nodeConfigName',
      type: 'object',
      label: intl.get('slod.shipmentsConfiguration.model.nodeConfigNames').d('添加子节点'),
      lovCode: 'SLOD.NODE_CONFIG',
      required: true,
    },
  ],
});

export { chartsDS, chartsAddDS };
