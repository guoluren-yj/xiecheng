import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_SMAL = '/smal';

export const tableDataSet = () => ({
  autoQuery: true,
  selection: false,
  parentkey: 'parentVersion',
  idField: 'mySubVersion',
  parentField: 'parentVersion',
  paging: false, // 不分页
  fields: [
    {
      label: intl.get('small.common.model.status').d('状态'),
      name: 'status',
    },
    {
      label: intl.get('small.common.model.operation').d('操作'),
      name: 'edit',
    },
    {
      label: intl.get(`small.comparePrice.model.compareRuleCode`).d('策略编码'),
      name: 'compareRuleCode',
    },
    {
      label: intl.get(`small.comparePrice.model.compareRuleName`).d('策略名称'),
      name: 'compareRuleName',
      required: true,
    },
    {
      name: 'displayVersion',
      align: 'left',
      label: intl.get(`small.comparePrice.model.model.version`).d('版本'),
    },
    {
      name: 'strategyTypeMeaning',
      label: intl.get(`small.comparePrice.model.strategyTypeMeaning`).d('来源'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SMAL}/v1/${organizationId}/compare-rule-headers`,
        method: 'GET',
        transformResponse: res => {
          try {
            const resp = JSON.parse(res);
            // 处理树形数据
            // 历史版本
            // 状态： 已发布 已禁用 未发布
            const historyList = resp.filter(i=> i.historyFlag===1) || [];
            const unHistoryList = resp.filter(i=> i.historyFlag!==1) || [];
            const isPreDefineFlag = (item) => item.compareRuleCode === 'ST00001';
            const isCustomFlag = (item) => ["Z-DISABLED", 'PUBLISHED'].includes(item.status);
            const result = unHistoryList.map((item) => {
              //  预定义
              const preDefineFlag = isPreDefineFlag(item);
              // 禁用/发布
              const customFlag = isCustomFlag(item);
              const parentVersion = customFlag || preDefineFlag ||
                // 未发布状态只有列表不存在已发布和已经用的才会在头节点
                (item.status === 'UNPUBLISHED' && !unHistoryList.some((i=> !isPreDefineFlag(i) && isCustomFlag(i))) )
                  ? null : 2;
              return {
                ...item,
                strategyTypeMeaning: preDefineFlag ?
                  intl.get(`small.comparePrice.model.predefine`).d('预定义') :
                  intl.get(`small.comparePrice.model.custom`).d('自定义'),
                historyList: !preDefineFlag && !parentVersion ? historyList : null,
                preDefineFlag,
                customFlag,
                parentVersion,
                mySubVersion: preDefineFlag ? 1 : customFlag ? 2 : 3, // 1预定义2自定义3自定义子级
              };
            });
            return result;
          } catch {
            return [];
          }
        },
      };
    },
  },
});

export const compareDS = (readOnly) => ({
  selection: false,
  paging: false,
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      label: intl.get(`small.comparePrice.model.compareRuleCode`).d('策略编码'),
      name: 'compareRuleCode',
    },
    {
      label: intl.get(`small.comparePrice.model.compareRuleName`).d('策略名称'),
      name: 'compareRuleName',
      required: true,
      type: 'intl',
    },
    {
      label: intl.get(`small.comparePrice.model.createName`).d('创建人'),
      name: 'createName',
    },
    {
      name: 'creationDate',
      label: intl.get('small.comparePrice.model.creationDate').d('创建时间'),
    },
    {
      name: 'displayVersion',
      label: intl.get('small.comparePrice.model.model.version').d('版本'),
    },
    {
      name: 'status',
      label: intl.get('small.common.model.status').d('状态'),
    },
    {
      name: 'compareRule',
      label: intl.get('small.comparePrice.model.compareRule').d('比价方式'),
      required: true,
    },
    {
      name: 'compareRuleDisplay',
      label: intl.get('small.comparePrice.model.compareRule').d('比价方式'),
    },
    {
      name: 'ruleList',
      label: intl.get('small.comparePrice.model.requiredAttr').d('必选属性'),
      lookupCode: 'SMAL.COMPARE_SEARCH_RULE',
      dynamicProps: {
        multiple: ()=> !readOnly,
        required: ({ record }) => {
          return record.get('compareRule') === 4;
        },
      },
      transformResponse: (_, record) => {
            const { ruleList = [] } = record;
            const arr = ruleList.map(i => i.value);
            return arr;
          },
    },
    {
      name: 'compareRuleConditionListDisplay',
      label: intl.get('small.common.model.compareCatalog').d('比价目录范围'),
    },
    {
      name: 'compareRuleConditionList',
      multiple: true,
      type: 'object',
      textField: 'catalogName',
      valueField: 'catalogId',
      label: intl.get('small.common.model.compareCatalog').d('比价目录范围'),
      dynamicProps: {
        required: ({ record }) => {
          return record.get('compareRule') === 5;
        },
      },
    },
    {
      name: 'aiSkuPool',
      label: intl.get('small.comparePrice.view.aiSkuPool').d('智能同款商品池')
    },
    {
      name: 'aiSkuCategory',
      label: intl.get('small.comparePrice.view.aiSkuCategory').d('智能同款品类属性模板配置'),
    },
    // {
    //   name: 'ruleListDisplay',
    //   label: intl.get('small.comparePrice.model.requiredAttr').d('必选属性'),
    //   multiple: ',',
    //   dynamicProps: {
    //     required: ({ record }) => {
    //       return record.get('compareRule') === 4;
    //     },
    //   },
    //   transformResponse: (_, record) => {
    //     const { ruleList = [] } = record;
    //     const arr = ruleList.map(i => i.value);
    //     return arr;
    //   },
    // },
    {
      name: 'lowerLimit',
      label: intl.get('small.comparePrice.model.skuLowerLimit').d('比价单中sku数量下限'),
      dynamicProps: {
        required: ({ record }) => {
          return record.get('compareRule') !== 1;
        },
        min: ({ record }) => {
          const required = record.get('compareRule') !== 1;
          return required ? 2 : null;
        },
        max: ({ record }) => {
          const required = record?.get('compareRule') !== 1;
          return required ? 21 : null;
        },
      },
      validator: (value, name, record) => {
        const required = record.get('compareRule') !== 1;
        const upperLimit = record.get('upperLimit');
        const lowerLimit = record.get('lowerLimit');
        if (required && upperLimit < lowerLimit) {
          return intl
            .get('small.comparePrice.model.limit.tips')
            .d('比价单中sku数量上限不能小于下限，请重新输入');
        }
      },
    },
    {
      name: 'upperLimit',
      label: intl.get('small.comparePrice.model.skuUpperLimit').d('比价单中sku数量上限'),
      dynamicProps: {
        min: ({ record }) => {
          const required = record.get('compareRule') !== 1;
          return required ? 2 : null;
        },
        max: ({ record }) => {
          const required = record.get('compareRule') !== 1;
          return required ? 21 : null;
        },
        required: ({ record }) => {
          return record.get('compareRule') !== 1;
        },
      },
      validator: (value, name, record) => {
        const upperLimit = record.get('upperLimit');
        const lowerLimit = record.get('lowerLimit');
        const required = record.get('compareRule') !== 1;
        if (required && upperLimit < lowerLimit) {
          return intl
            .get('small.comparePrice.model.limit.tips')
            .d('比价单中sku数量上限不能小于下限，请重新输入');
        }
      },
    },
  ],
});

export const dimensionDS = (readOnly) => ({
  selection: false,
  paging: false,
  autoQuery: false,
  fields: [
    {
      name: 'dimensionCode',
      label: intl.get('small.comparePrice.model.dimension').d('维度'),
    },
    {
      name: 'dimensionValueLov',
      type: 'object',
      label: intl.get('small.comparePrice.model.dimensionValue').d('维度值'),
      computedProps: {
        multiple: ()=> !readOnly,
        lovPara: ({record}) => record.get('dimensionCode') === 'label' ? {enabledFlag: 1} : {},
        lovCode: ({ record }) => {
          if (record.get('dimensionCode') === 'label') {
            return 'SMAL.SKU_LABEL';
          } else {
            return 'SMAL.SUPPLIER_BY_PUR';
          }
        },
        textField: ({ record }) => {
          if (record.get('dimensionCode') === 'label') {
            return 'labelName';
          } else {
            return 'supplierName';
          }
        },
        valueField: ({ record }) => {
          if (record.get('dimensionCode') === 'label') {
            return 'labelCode';
          } else {
            return 'supplierId';
          }
        },
      },
      optionsProps: props => {
        return {
          ...props,
          pageSize: 20,
        };
      },
      // 回显
      transformResponse(_, record) {
        const text = record.dimensionCode === 'label' ? 'labelName' : 'supplierName';
        const value = record.dimensionCode === 'label' ? 'labelCode' : 'supplierId';
        const arr = record.valueList?.map(i => ({
          ...i,
          [text]: i.valueMeaning,
          [value]: i?.value,
        }));
        return arr;
      },
    },
    {
      name: 'labelCode',
      bind: 'dimensionValueLov.labelCode',
    },
    {
      name: 'labelName',
      type: 'string',
      bind: 'dimensionValueLov.labelName',
    },
    {
      name: 'supplierId',
      type: 'string',
      bind: 'dimensionValueLov.supplierId',
    },
    {
      name: 'supplierName',
      type: 'string',
      bind: 'dimensionValueLov.supplierName',
    },
  ],
  data: [
    {
      dimensionCode: 'label',
    },
    {
      dimensionCode: 'supplier',
    },
  ],
});
