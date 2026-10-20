import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 新建ds
const ListDateSet = () => ({
  // autoQuery: true,
  dataToJSON: 'all',
  pageSize: 20,
  primaryKey: 'strategyHeaderId',
  forceValidate: true,
  cacheModified: true,
  fields: [
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.strategyCode`).d('类型编码'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('dataFlag') === '1',
      },
    },
    {
      name: 'strategyName',
      type: 'intl',
      label: intl.get(`sinv.inventoryBench.model.view.strategyName`).d('类型描述'),
      required: true,
    },
    {
      name: 'cuszDocTmplCodeObj',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.cuszDocTmplCode`).d('单据样式模版'),
      lovCode: 'HPFM.CUSZ.DOC_TEMPLATE_LAST',
      valueField: 'templateCode',
      textField: 'templateCode',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            docCode:
              record.get('processFactory') === 1
                ? 'SINV_COLLABORATIVE_WORKBENCH_ONE_INVENTORY'
                : record.get('processFactory') === 2
                ? 'SINV_COLLABORATIVE_WORKBENCH_TWO_ORDINARY'
                : 'SINV_COLLABORATIVE_WORKBENCH_ZERO_TRANSFER',
          };
        },
      },
    },
    {
      name: 'cuszDocTmplCode',
      type: 'string',
      bind: 'cuszDocTmplCodeObj.templateCode',
    },
    {
      name: 'processFactory',
      type: 'number',
      lookupCode: 'SPUC.SINV_STOCK_OUT_TYPE',
      label: intl.get(`sinv.inventoryBench.model.view.processFactory`).d('类型属性'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('objectVersionNumber'),
      },
    },
    {
      name: 'enableFlag',
      type: 'number',
      label: intl.get(`hzero.common.templateStatus`).d('状态'),
      // lookupCode: 'HPFM.FLAG',
      // trueValue: 1,
      // falseValue: 0,
      // defaultValue: 1,
      // required: true,
    },
    {
      name: 'codeRuleLov',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.codeRule`).d('编码规则'),
      lovCode: 'HMDE.CODE_RULE',
      valueField: 'codeRule',
      textField: 'ruleName',
      ignore: 'always',
    },
    {
      name: 'codeRule',
      type: 'string',
      bind: 'codeRuleLov.ruleCode',
    },
    {
      name: 'ruleName',
      type: 'string',
      bind: 'codeRuleLov.ruleName',
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.creationName`).d('创建人'),
    },
    {
      name: 'per',
      // label: intl.get(`sinv.inventoryBench.model.view.per`).d('操作/查询权限角色维护 '),
    },
    {
      name: 'action',
      label: intl.get(`sinv.inventoryBench.model.view.action`).d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/page`,
        method: 'GET',
        data,
      };
    },
  },
});

// 列表ds
const HeaderDetailDataSet = () => ({
  primaryKey: 'strategyHeaderId',
  forceValidate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.strategyCode`).d('类型编码'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('dataFlag') === '1',
      },
    },
    {
      name: 'strategyName',
      type: 'intl',
      label: intl.get(`sinv.inventoryBench.model.view.strategyName`).d('类型描述'),
      required: true,
    },
    {
      name: 'cuszDocTmplCodeObj',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.cuszDocTmplCode`).d('单据样式模版'),
      lovCode: 'HPFM.CUSZ.DOC_TEMPLATE_LAST',
      valueField: 'templateCode',
      textField: 'templateCode',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            docCode:
              record.get('processFactory') === 1
                ? 'SINV_COLLABORATIVE_WORKBENCH_ONE_INVENTORY'
                : record.get('processFactory') === 2
                ? 'SINV_COLLABORATIVE_WORKBENCH_TWO_ORDINARY'
                : 'SINV_COLLABORATIVE_WORKBENCH_ZERO_TRANSFER',
          };
        },
      },
    },
    {
      name: 'cuszDocTmplCode',
      type: 'string',
      bind: 'cuszDocTmplCodeObj.templateCode',
    },
    {
      name: 'processFactory',
      type: 'number',
      lookupCode: 'SPUC.SINV_STOCK_OUT_TYPE',
      label: intl.get(`sinv.inventoryBench.model.view.processFactory`).d('类型属性'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('objectVersionNumber'),
      },
    },
    {
      name: 'enableFlag',
      type: 'number',
      label: intl.get(`sinv.inventoryBench.model.view.enableFlags`).d('启用标记'),
      lookupCode: 'HPFM.FLAG',
      trueValue: 1,
      falseValue: 0,
      required: true,
    },
    {
      name: 'codeRuleLov',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.codeRule`).d('编码规则'),
      lovCode: 'HMDE.CODE_RULE',
      valueField: 'codeRule',
      textField: 'ruleName',
      ignore: 'always',
    },
    {
      name: 'codeRule',
      type: 'string',
      bind: 'codeRuleLov.ruleCode',
    },
    {
      name: 'ruleName',
      type: 'string',
      bind: 'codeRuleLov.ruleName',
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.creationName`).d('创建人'),
    },
    {
      name: 'per',
      // label: intl.get(`sinv.inventoryBench.model.view.per`).d('操作/查询权限角色维护 '),
    },
    {
      name: 'action',
      label: intl.get(`sinv.inventoryBench.model.view.action`).d('操作'),
    },
    {
      name: 'cycleRange',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.cycleRanges`).d('周期范围'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_CYCLE_DIMENSION',
      // required: true,
      dynamicProps: {
        required: ({ record }) =>
          record.get('processFactory') === 1 && record.get('cycleAuto') === 1,
      },
    },
    {
      name: 'cycleDimension',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.cycleDimension`).d('自动生单维度'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_AUTO_DIMENSION',
      multiple: true,
      valueField: 'value',
      textField: 'meaning',
      transformResponse: (value) => {
        return value && value.split(',');
      },
      transformRequest: (val) => val && val.join(','),
    },
    {
      name: 'cycleAuto',
      type: 'number',
      label: intl.get(`sinv.inventoryBench.model.view.cycleAuto`).d('按周期时间自动生成'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    {
      name: 'cycleDate',
      type: 'date',
      label: intl.get(`sinv.inventoryBench.model.view.cycleDate`).d('周期起始日'),
      // required: true,
      dynamicProps: {
        required: ({ record }) =>
          record.get('processFactory') === 1 && record.get('cycleAuto') === 1,
      },
    },
    // {
    //   name: 'cycleConsumeQuantity',
    //   type: 'string',
    //   label: intl
    //     .get(`sinv.inventoryBench.model.view.cycleConsumeQuantity`)
    //     .d('系统自动统计周期内发料/消耗数量'),
    //   lookupCode: 'HPFM.FLAG',
    //   // required: true,
    //   dynamicProps: {
    //     required: ({ record }) => record.get('processFactory') === '1',
    //   },
    // },
  ],
  // transport: {
  //   read: ({ data }) => {
  //     const { params, ...other } = data;
  //     const query = filterNullValueObject({ ...params, ...other });

  //     return {
  //       url: `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/page`,
  //       method: 'GET',
  //       data: query,
  //     };
  //   },
  // },
});

export { ListDateSet, HeaderDetailDataSet };
