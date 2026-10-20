/*
 * @Description:通用导出ds
 * @Date: 2020-07-30 14:52:28
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { getDatas } from '@/utils/utils';

const basicFormDS = () => ({
  primaryKey: 'exportId',
  paging: false,
  fields: [
    {
      name: 'fileName',
      type: 'string',
      label: intl.get('sbud.budgeting.model.common.fileName').d('自定义文件名'),
    },
    {
      name: 'fillerType',
      type: 'string',
      label: intl.get('sbud.budgeting.model.common.fillerType').d('导出类型'),
      lookupCode: 'HPFM.EXCEL_EXPORT_TYPE',
    },
    {
      name: 'async',
      type: 'string',
      label: intl.get('sbud.budgeting.model.common.async').d('异步'),
      defaultValue: 'false',
    },
    {
      name: 'singleExcelMaxSheetNum',
      type: 'number',
      min: 1,
      step: 1,
      label: intl.get('sbud.budgeting.model.common.singleExcelMaxSheetNum').d('最大sheet页'),
    },
    {
      name: 'singleSheetMaxRow',
      type: 'number',
      min: 1,
      step: 1,
      label: intl.get('sbud.budgeting.model.common.singleSheetMaxRow').d('单sheet最大数量'),
    },
  ],
  transport: {
    read: ({ data: { queryParams = {} } }) => {
      // data 基本头信息数据, 需要添加树形参数
      const {
        basicInfo: { fileName, fillerType, singleSheetMaxRow, singleExcelMaxSheetNum },
        requestUrl,
        templateCode,
        shieldCodeList = [],
        selectedRowKeys = [],
        ...othersParams
      } = queryParams;

      const others = getDatas(othersParams);
      return {
        url: requestUrl,
        method: 'GET',
        // responseType: 'blob',
        data: {
          fileName,
          fillerType,
          templateCode,
          singleSheetMaxRow,
          singleExcelMaxSheetNum,
          budgetIds: selectedRowKeys.join(','),
          exportColumnFlag: 0,
          shieldCodeList: shieldCodeList.join(','),
          paramMap: {
            ...others,
          },
        },
      };
    },
  },
});

const dynamicColDS = () => ({
  primaryKey: 'id',
  paging: false,
  // autoQuery: true,
  parentField: 'parentId',
  // expandField: 'expand',
  checkField: 'isChecked',
  idField: 'id',
  fields: [
    { name: 'id', type: 'string' },
    // { name: 'expand', type: 'boolean' },
    { name: 'parentId', type: 'string' },
  ],
  transport: {
    read: ({ data: { queryParams = {} } }) => {
      const { requestUrl } = queryParams;
      return {
        url: requestUrl,
        method: 'GET',
        data: {
          exportColumnFlag: 1,
        },
      };
    },
  },
});

export { basicFormDS, dynamicColDS };
