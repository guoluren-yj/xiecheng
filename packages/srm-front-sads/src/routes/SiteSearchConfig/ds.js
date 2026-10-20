import intl from 'utils/intl';

const tableDS = () => ({
  selection: false,
  autoQuery: true,
  fields: [
    {
      label: intl.get('sads.siteSearchConfig.model.tenantName').d('租户名称'),
      name: 'tenantName',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.aggregateAttrFlag').d('是否聚合属性值'),
      name: 'aggregateAttrFlag',
      lookupCode: 'HPFM.FLAG',
    },
    // {
    //   label: intl.get('sads.siteSearchConfig.model.searchRequiredField').d('搜索必选字段'),
    //   name: 'searchRequiredFieldList',
    //   multiple: true,
    //   lookupCode: 'SDAP.SEARCH_REQUIRED_FIELD',
    //   transformResponse: (_, data) => {
    //     return (data.searchRequiredFieldList || []).length > 0
    //       ? data.searchRequiredFieldList.map((i) => ({
    //           value: i.code,
    //           meaning: i.name,
    //         }))
    //       : null;
    //   },
    // },
    {
      label: intl.get('sads.siteSearchConfig.model.matchLogicMeaning').d('匹配逻辑'),
      name: 'matchLogicMeaning',
      help: intl.get('sads.searchConfig.view.matchTypeHelp').d('搜索词的分词结果与目标词匹配关系'),
    },
    {
      label: intl.get('sads.siteSearchConfig.model.aggregateUomFlagMeaning').d('是否聚合单位'),
      name: 'aggregateUomFlagMeaning',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.recordConditionFlag').d('是否记录搜索条件'),
      name: 'recordConditionFlagMeaning',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.recordWordFlag').d('是否记录搜索词'),
      name: 'recordWordFlagMeaning',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.namedEntityRecognition').d('命名实体识别'),
      name: 'namedRecognitionFlagMeaning',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.characterSplittingFlag').d('中英文字符拆分'),
      name: 'characterSplittingFlagMeaning',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.categoryPrediction').d('分类预测'),
      name: 'categoryPredictionFlagMeaning',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.status').d('状态'),
      name: 'enabledFlagMeaning',
    },
  ],
  queryFields: [
    {
      label: intl.get('sads.siteSearchConfig.model.tenantName').d('租户名称'),
      name: 'tenantLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'HPFM.TENANT',
    },
    {
      name: 'tenantId',
      bind: 'tenantLov.tenantId',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.status').d('状态'),
      name: 'enabledFlag',
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
  ],
  transport: {
    read: {
      url: `/sads/v1/mall-search-configs`,
      method: 'GET',
    },
    // create: ({ data }) => {
    //   return {
    //     url: `/sdap/v1/input-source`,
    //     data: data[0],
    //     method: 'POST',
    //   };
    // },
    // update: ({ data }) => {
    //   return {
    //     url: `/sdap/v1/input-source`,
    //     data: data[0],
    //     method: 'POST',
    //   };
    // },
  },
});

const formDS = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('sads.siteSearchConfig.model.tenantName').d('租户名称'),
      name: 'tenantLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'HPFM.TENANT',
      required: true,
      textField: 'tenantName',
      valueField: 'tenantId',
    },
    {
      name: 'tenantId',
      bind: 'tenantLov.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantLov.tenantName',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.aggregateAttrFlag').d('是否聚合属性值'),
      name: 'aggregateAttrFlag',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    // {
    //   label: intl.get('sads.siteSearchConfig.model.searchRequiredField').d('搜索必选字段'),
    //   name: 'searchRequiredFieldList',
    //   multiple: true,
    //   lookupCode: 'SDAP.SEARCH_REQUIRED_FIELD',
    // },
    {
      label: intl.get('sads.siteSearchConfig.model.matchLogicMeaning').d('匹配逻辑'),
      name: 'matchLogic',
      required: true,
      defaultValue: 1,
      lookupCode: 'SDAP.LOGIC_MATCH_TYPE',
    },
    {
      label: intl.get('sads.siteSearchConfig.model.aggregateUomFlagMeaning').d('是否聚合单位'),
      name: 'aggregateUomFlag',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    {
      label: intl.get('sads.siteSearchConfig.model.recordConditionFlag').d('是否记录搜索条件'),
      name: 'recordConditionFlag',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    {
      label: intl.get('sads.siteSearchConfig.model.recordWordFlag').d('是否记录搜索词'),
      name: 'recordWordFlag',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    {
      label: intl.get('sads.siteSearchConfig.model.namedEntityRecognition').d('命名实体识别'),
      name: 'namedRecognitionFlag',
      type: 'number',
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    {
      label: intl.get('sads.siteSearchConfig.model.characterSplittingFlag').d('中英文字符拆分'),
      name: 'characterSplittingFlag',
      type: 'number',
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    {
      label: intl.get('sads.siteSearchConfig.model.categoryPrediction').d('分类预测'),
      name: 'categoryPredictionFlag',
      type: 'number',
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
    {
      label: intl.get('sads.siteSearchConfig.model.remark').d('备注'),
      name: 'remark',
    },
  ],
  events: {
    // update: ({ record, name, value }) => {
    //   if (
    //     name === 'searchRequiredFieldList' &&
    //     value.length > 0 &&
    //     value.some((s) => s === 'uom')
    //   ) {
    //     record.set('aggregateUomFlag', 1);
    //   }
    // },
  },
});

export { tableDS, formDS };
