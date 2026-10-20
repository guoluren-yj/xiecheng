/**
 * exportDS - 导出`dataset`配置文件
 * @date: 2021-03-17
 * @author: mjq<jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

const basicFormDS = () => ({
  primaryKey: 'exportId',
  paging: false,
  fields: [
    {
      name: 'fileName',
      type: 'string',
      label: intl.get('sodr.common.model.common.fileName').d('自定义文件名'),
    },
    // {
    //   name: 'fillerType',
    //   type: 'string',
    //   label: intl.get('sodr.common.model.common.fillerType').d('导出类型'),
    //   lookupCode: 'HPFM.EXCEL_EXPORT_TYPE',
    // },
    {
      name: 'async',
      type: 'string',
      label: intl.get('sodr.common.model.common.async').d('异步'),
      defaultValue: 'false',
    },
    // {
    //   name: 'singleExcelMaxSheetNum',
    //   type: 'number',
    //   min: 1,
    //   step: 1,
    //   label: intl.get('sodr.common.model.common.singleExcelMaxSheetNum').d('最大sheet页'),
    // },
    // {
    //   name: 'singleSheetMaxRow',
    //   type: 'number',
    //   min: 1,
    //   step: 1,
    //   label: intl.get('sodr.common.model.common.singleSheetMaxRow').d('单sheet最大数量'),
    // },
  ],
  transport: {
    read: ({ data: { queryParams = {} } }) => {
      // data 基本头信息数据, 需要添加树形参数
      const {
        params = {},
        basicInfo: { async, fileName, fillerType, singleSheetMaxRow, singleExcelMaxSheetNum },
        // viewCode,
        // queryData,
        requestUrl,
        templateCode,
        shieldDimCodeList = [],
        // selectedRowKeys = [],
        feedbackIds,
        searchType,
        statusConfigId,
      } = queryParams;
      return {
        url: requestUrl,
        method: 'POST',
        data: {
          async,
          fileName,
          fillerType,
          templateCode,
          singleSheetMaxRow,
          singleExcelMaxSheetNum,
          // ...queryData, // 列表页查询条件
          // viewCode: viewCode || 'ALL_VIEW',
          // priceLibIdStrings: selectedRowKeys.join(','),
          exportColumnFlag: 0,
          feedbackIds,
          shieldDimCodeList: shieldDimCodeList.join(','),
          // from: viewCode && viewCode !== 'ALL_VIEW' ? 'VIEW_LIST' : 'LIST',
          ...params,
          searchType,
          statusConfigId,
        },
      };
    },
  },
});

const dynamicColDS = () => ({
  primaryKey: 'fieldId',
  paging: false,
  // autoQuery: true,
  parentField: 'parentId',
  // expandField: 'expand',
  checkField: 'isChecked',
  idField: 'fieldId',
  fields: [],
  transport: {
    read: ({ data: { queryParams = {} } }) => {
      const { requestUrl, templateCode } = queryParams;
      return {
        url: requestUrl,
        method: 'POST',
        data: {
          templateCode,
          exportColumnFlag: 1,
        },
      };
    },
  },
});

export { basicFormDS, dynamicColDS };
