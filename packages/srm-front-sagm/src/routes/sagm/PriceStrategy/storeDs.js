import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { getCurrentOrganizationId } from 'utils/utils';
import { maxSAGMMessageValidator } from '@/utils/validator';

const organizationId = getCurrentOrganizationId();

// 详情formDs
const formDs = (readOnly = false) => ({
  fields: [
    {
      name: 'strategyCode',
      type: 'string',
      disabled: true,
      label: intl.get('sagm.priceStrategy.view.strategyCode').d('策略编码'),
    },
    {
      name: 'strategyName',
      type: 'string',
      required: true,
      readOnly,
      label: intl.get('sagm.priceStrategy.view.strategyName').d('策略名称'),
    },
    {
      name: 'remark',
      type: 'string',
      readOnly,
      label: intl.get('sagm.common.view.remark').d('备注'),
    },
    {
      name: 'versionNum',
      type: 'number',
      disabled: true,
      label: intl.get('sagm.common.model.versionNum1').d('版本号'),
      defaultValue: 1,
    },
    {
      name: 'adjustDirection',
      type: 'string',
      label: intl.get('sagm.common.view.adjustDirection').d('调价方向'),
      readOnly,
      required: true,
      lookupCode: 'SAGM.PRICE_ADJUST_DIRECTION',
      defaultValue: 'UPWARD',
    },
    {
      name: 'priceMethod',
      type: 'number',
      textField: 'text',
      valueField: 'value',
      readOnly,
      required: true,
      label: intl.get('sagm.common.view.adjustWay').d('调价方式'),
      defaultValue: 1,
      computedProps: {
        options: ({ record }) => {
          const adjust = record.get('adjustDirection');
          const dataSource = [
            { text: intl.get('sagm.common.model.percent').d('按百分比'), value: 1 },
            {
              text: intl.get('sagm.common.model.fixMoney').d('按固定值'),
              value: 2,
              tag: 'UPWARD',
            },
          ].filter(f => !('tag' in f) || f.tag === adjust);
          return new DataSet({ data: dataSource });
        },
      },
      transformResponse(_, record) {
        const { amountMarkupFlag } = record;
        const value = amountMarkupFlag ? 2 : 1;
        return value;
      },
    },
    {
      name: 'isLadderPrice',
      lookupCode: 'SAGM.SRATEGY_PRICE_TYPE',
      label: intl.get('sagm.common.view.priceType').d('价格类型'),
      defaultValue: 0,
      readOnly,
      required: true,
    },
    {
      name: 'markupPercentage',
      type: 'number',
      readOnly,
      min: 0,
      // max: 1000,
      // step: 0.01,
      label: intl.get('sagm.priceStrategy.model.markupPercentage').d('百分比'),
      computedProps: {
        required: ({ record }) => {
          const { priceMethod, isLadderPrice } = record.get(['priceMethod', 'isLadderPrice']);
          const isLadder = isLadderPrice ? Number(isLadderPrice) : isLadderPrice;
          return priceMethod === 1 && !isLadder;
        },
        max: ({ record }) => (record.get('adjustDirection') === 'UPWARD' ? null : 100),
      },
    },
    {
      name: 'upperPrice',
      type: 'number',
      readOnly,
      min: 0,
      // max: '99999999999999999999',
      // step: 0.01,
      label: intl.get('sagm.priceStrategy.model.upperPrice').d('数值'),
      computedProps: {
        required: ({ record }) => {
          const { priceMethod, isLadderPrice } = record.get(['priceMethod', 'isLadderPrice']);
          const isLadder = isLadderPrice ? Number(isLadderPrice) : isLadderPrice;
          return priceMethod === 2 && !isLadder;
        },
      },
      validator: maxSAGMMessageValidator,
    },
    {
      name: 'upperLimitPercentage',
      type: 'number',
      labelWidth: 120,
      readOnly,
      min: 0,
      max: 1000,
      // step: 0.01,
      label: intl.get('sagm.priceStrategy.model.upperLimitPercentage').d('加价上限百分比'),
      computedProps: {
        required: ({ record }) => {
          const { priceMethod, isLadderPrice } = record.get(['priceMethod', 'isLadderPrice']);
          const isLadder = isLadderPrice ? Number(isLadderPrice) : isLadderPrice;
          return priceMethod === 2 && !isLadder;
        },
      },
    },
    {
      name: 'overlinePriceEnable',
      trueValue: 1,
      falseValue: 0,
      labelWidth: 128,
      required: true,
      readOnly,
      label: intl.get('sagm.priceStrategy.model.overlinePriceEnable').d('可以超过划线价'),
    },
    {
      name: 'overlinePriceEnableMeaning',
      label: intl.get('sagm.priceStrategy.model.overlinePriceEnable').d('可以超过划线价'),
    },
  ],
});

const getDimensionValueComputedProps = () => {
  const dynamicDimensionMap = {
    ORGANIZATION: {
      getInitialValue: record => {
        const list = record.allOrgEnable
          ? [
              {
                unitName: intl.get('sagm.common.model.allOrganizations').d('所有组织'),
                unitId: 'ALL',
                orgId: 'ALL',
              },
            ]
          : record.orgMappings || [];
        return list.map(m => ({
          ...m,
          unitCode: m.unitCode || m.orgCode,
          unitName: m.unitName || m.orgName,
          unitId: m.unitId || m.orgId,
          key: m.key || m.orgId,
          levelPath: m.levelPath || m.orgLevelPath,
        }));
      },
      fieldProps: {
        textField: 'unitName',
        valueField: 'unitId',
        required: true,
        multiple: true,
      },
    },
    CATALOG: {
      getInitialValue: record => {
        const list = record.includeAllFlag
          ? [
              {
                categoryName: intl.get('sagm.common.model.allCategory').d('所有分类'),
                categoryId: 'ALL',
              },
            ]
          : record.catalogMappings || [];
        return list.map(m => ({
          ...m,
          categoryName: m.categoryName || m.name,
          categoryId: m.categoryId || m.catalogId,
          key: m.key || m.catalogId,
        }));
      },
      fieldProps: {
        textField: 'categoryName',
        valueField: 'categoryId',
        required: true,
        multiple: true,
      },
    },
    SUPPLIER: {
      getInitialValue: record => {
        return (record.supplierMappings || []).map(m => ({
          ...m,
          supplierName: m.supplierName || m.supplierCompanyName,
          supplierId: m.supplierId || m.supplierCompanyId,
          supplierNum: m.supplierNum || m.supplierCompanyNum,
        }));
      },
      fieldProps: {
        lovCode: 'SMAL.SUPPLIER_BY_PUR',
        lovPara: { tenantId: organizationId },
        textField: 'supplierName',
        valueField: 'supplierId',
        required: true,
        multiple: true,
      },
    },
    DIRECTORY: {
      getInitialValue: record => {
        return (record.directoryMappings || []).map(m => ({
          ...m,
          catalogName: m.directoryName || m.name,
          catalogId: m.directoryId,
          catalogCode: m.directoryCode || m.code,
          key: m.key || m.directoryId,
        }));
      },
      fieldProps: {
        textField: 'catalogName',
        valueField: 'catalogId',
        required: true,
        multiple: true,
      },
    },
  };

  const computedProps = {};
  ['lovCode', 'lovPara', 'textField', 'valueField', 'required', 'multiple'].forEach(_props => {
    computedProps[_props] = ({ record }) => {
      const dimensionCode = record.get('strategyDimensionCode');
      const { fieldProps = {} } = dynamicDimensionMap[dimensionCode] || {};
      return fieldProps[_props];
    };
  });

  return [
    (_, record) => {
      const { strategyDimensionCode } = record.strategyDimension || {};
      const { getInitialValue = () => {} } = dynamicDimensionMap[strategyDimensionCode] || {};
      return getInitialValue(record);
    },
    computedProps,
  ];
};

const tableDs = readOnly => ({
  paging: false,
  selection: readOnly ? false : 'multiple',
  record: {
    dynamicProps: {
      selectable: record => record.get('strategyDimensionCode') !== 'ORGANIZATION',
    },
  },
  fields: [
    {
      name: 'dimension',
      label: intl.get('sagm.common.view.dimension').d('维度'),
    },
    {
      name: 'strategyDimension',
      type: 'object',
      label: intl.get('sagm.common.view.dimension').d('维度'),
      required: true,
      textField: 'strategyDimensionName',
      valueField: 'strategyDimensionCode',
      computedProps: {
        disabled: ({ record }) => record.status !== 'add',
        options: ({ record, dataSet }) => {
          const notStrategyDimensionCodes = dataSet
            .map(_r => _r.get('strategyDimensionCode'))
            .filter(i => i)
            .join(',');
          const para = {
            enabledFlag: 1,
            tenantId: organizationId,
            priceStrategyId: record ? record.get('priceStrategyId') : undefined,
            notStrategyDimensionCodes: notStrategyDimensionCodes || undefined,
          };
          return new DataSet({
            paging: false,
            transport: {
              read: {
                url: `/sagm/v1/${organizationId}/strategy-dimensions/list`,
                method: 'GET',
                data: para,
              },
            },
          });
        },
      },
    },
    {
      name: 'strategyDimensionId',
      bind: 'strategyDimension.strategyDimensionId',
    },
    {
      name: 'strategyDimensionCode',
      bind: 'strategyDimension.strategyDimensionCode',
    },
    {
      name: 'strategyDimensionName',
      bind: 'strategyDimension.strategyDimensionName',
    },
    {
      name: 'dimensionValue',
      label: intl.get('sagm.common.view.value').d('值'),
      type: 'object',
      ignore: 'always',
      computedProps: readOnly ? {} : getDimensionValueComputedProps()[1],
      transformResponse: getDimensionValueComputedProps()[0],
    },
    {
      name: 'orgMappings',
      label: intl.get('sagm.common.model.organization').d('组织'),
      multiple: true,
      type: 'object',
      textField: 'unitName',
      valueField: 'unitId',
      dynamicProps: {
        required: ({ record }) => record.get('strategyDimensionCode') === 'ORGANIZATION',
      },
      transformResponse: (_, record) => {
        const list = record.allOrgEnable
          ? [
              {
                unitName: intl.get('sagm.common.model.allOrganizations').d('所有组织'),
                unitId: 'ALL',
                orgId: 'ALL',
              },
            ]
          : record.orgMappings || [];
        return list.map(m => ({
          ...m,
          unitCode: m.unitCode || m.orgCode,
          unitName: m.unitName || m.orgName,
          unitId: m.unitId || m.orgId,
          key: m.key || m.orgId,
          levelPath: m.levelPath || m.orgLevelPath,
        }));
      },
    },
    {
      name: 'initOrgs',
      type: 'object',
      transformResponse: (_, record) => record.orgMappings || [],
    },
    {
      name: 'initCatalogs',
      type: 'object',
      transformResponse: (_, record) => record.catalogMappings || [],
    },
    {
      name: 'catalogMappings',
      label: intl.get('sagm.common.view.platformCategorm').d('平台分类'),
      multiple: true,
      type: 'object',
      textField: 'categoryName',
      valueField: 'categoryId',
      dynamicProps: {
        required: ({ record }) => record.get('strategyDimensionCode') === 'CATALOG',
      },
      transformResponse: (_, record) => {
        const list = record.includeAllFlag
          ? [
              {
                categoryName: intl.get('sagm.common.model.allCategory').d('所有分类'),
                categoryId: 'ALL',
              },
            ]
          : record.catalogMappings || [];
        const initData = list.map(m => ({
          ...m,
          categoryName: m.categoryName || m.name,
          categoryId: m.categoryId || m.catalogId,
          key: m.key || m.catalogId,
        }));
        return initData;
      },
    },
    {
      name: 'directoryMappings',
      label: intl.get('sagm.common.view.directory').d('目录'),
      multiple: true,
      type: 'object',
      textField: 'catalogName',
      valueField: 'catalogId',
      dynamicProps: {
        required: ({ record }) => record.get('strategyDimensionCode') === 'DIRECTORY',
      },
      transformResponse: (_, record) => {
        const initData = (record.directoryMappings || []).map(m => ({
          ...m,
          catalogName: m.directoryName || m.name,
          catalogId: m.directoryId,
          catalogCode: m.directoryCode || m.code,
          key: m.key || m.directoryId,
        }));
        return initData;
      },
    },
    {
      name: 'supplierMappings',
      label: intl.get('sagm.common.view.supplierMappings').d('供应商'),
      type: 'object',
      multiple: true,
      lovCode: 'SMAL.SUPPLIER_BY_PUR',
      lovPara: { tenantId: organizationId },
      textField: 'supplierName',
      valueField: 'supplierId',
      dynamicProps: {
        required: ({ record }) => record.get('strategyDimensionCode') === 'SUPPLIER',
      },
      transformResponse: (_, record) => {
        return (record.supplierMappings || []).map(m => ({
          ...m,
          supplierName: m.supplierName || m.supplierCompanyName,
          supplierId: m.supplierId || m.supplierCompanyId,
          supplierNum: m.supplierNum || m.supplierCompanyNum,
        }));
      },
    },
    {
      name: 'allSkuEnable',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sagm.common.model.allSku').d('全部商品'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      const code = record.get('strategyDimensionCode');
      const mappingNames = {
        ORGANIZATION: 'orgMappings',
        CATALOG: 'catalogMappings',
        SUPPLIER: 'supplierMappings',
        DIRECTORY: 'directoryMappings',
      };
      const dimensionName = mappingNames[code];

      // 值变更联动对应字段
      if (name === 'dimensionValue' && dimensionName) {
        record.set(dimensionName, value);
      }
      // 维度变更联动
      // if (name === 'strategyDimension' && dimensionName) {
      //   const values = record.get(dimensionName) || [];
      //   if (values.length) {
      //     record.set('dimensionValue', values.slice());
      //   }
      // }
      if (name === 'strategyDimension' && !value) {
        record.set('dimensionValue', null);
        record.set(dimensionName, null);
      }
    },
  },
  transport: {
    destroy: () => ({
      url: `/sagm/v1/${organizationId}/price-strategy-conditions/batch`,
      method: 'DELETE',
    }),
  },
});

const ladderDs = readOnly => ({
  paging: false,
  selection: readOnly ? false : 'multiple',
  fields: [
    {
      name: 'number',
      label: intl.get('sagm.common.view.lineNum').d('行号'),
    },
    {
      name: 'quantityFrom',
      label: intl.get('sagm.common.view.ladderFrom').d('数量从>='),
      required: true,
      type: 'number',
      min: 1,
      // max: '99999999999999999999',
      // step: 1,
      validator: (value, name, record) => {
        const quantityTo = record.get('quantityTo');
        if (quantityTo && math.lte(quantityTo, value)) {
          return intl.get('sagm.common.view.ladderFromMsg').d('数量从必须小于数量至');
        }
        if (math.gte(value, '100000000000000000000')) {
          return intl.get('sagm.common.view.maxMessage').d('值必须小于100000000000000000000');
        }
      },
    },
    {
      name: 'quantityTo',
      label: intl.get('sagm.common.view.ladderTo').d('数量至<'),
      type: 'number',
      // step: 1,
      // min: 'ladderFrom',
      // max: '99999999999999999999',
      validator: (value, name, record) => {
        const quantityFrom = record.get('quantityFrom');
        if (quantityFrom && value && math.gte(quantityFrom, value)) {
          return intl.get('sagm.common.view.ladderToMsg').d('数量至必须大于数量从');
        }
        if (math.gte(value, '100000000000000000000')) {
          return intl.get('sagm.common.view.maxMessage').d('值必须小于100000000000000000000');
        }
      },
    },
    {
      name: 'percentage',
      label: intl.get('sagm.common.view.percent').d('百分比'),
      min: 0,
      max: 1000,
      type: 'number',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      label: intl.get('sagm.common.view.amount').d('金额'),
      min: 0,
      // max: '99999999999999999999',
      validator: maxSAGMMessageValidator,
    },
  ],
  transport: {
    destroy: () => ({
      url: `/sagm/v1/${organizationId}/ladder-price-strategy`,
      method: 'DELETE',
    }),
  },
  // events: {
  //   update: ({ dataSet, record, name, value, oldValue }) => {
  //     const data = dataSet.toData();
  //     const { lineNum, ladderFrom, ladderTo } = record.toData();
  //     if (name === 'ladderFrom') {
  //       const prev = data.find(f=>f.lineNum === lineNum - 1);
  //       const min = prev ? prev.ladderTo || 1 : 1;
  //       if(ladderFrom < min) {
  //         notification.warning({ message: intl.get().d('数量从数量不能少于') });
  //       }
  //     }
  //     if (name === 'ladderTo') {
  //       console.log(oldValue);
  //     }
  //   },
  // },
});

export { formDs, tableDs, ladderDs };
