/**
 * exportDS - 导出`dataset`配置文件
 * @date: 2020-07-21
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPC } from '_utils/config';
import { isArray } from 'lodash';

const organizationId = getCurrentOrganizationId();

/**
 *
 * @param {Object} res - 树形数据结构
 * @returns {Array} - 平铺数据结构
 */
function dealWithData(res) {
  const temp = [];
  const loop = (item = {}) => {
    temp.push(item); // 先放进外层对象
    if (isArray(item.children)) {
      item.children.forEach((_item) => {
        loop(_item);
      });
    }
  };
  loop(res);
  return temp.filter((item, index) => index === 0 || Number(item.fieldVisible));
}

const basicFormDS = () => ({
  primaryKey: 'exportId',
  paging: false,
  fields: [
    {
      name: 'fileName',
      type: 'string',
      label: intl.get('ssrc.common.model.common.fileName').d('自定义文件名'),
    },
    // {
    //   name: 'fillerType',
    //   type: 'string',
    //   label: intl.get('ssrc.common.model.common.fillerType').d('导出类型'),
    //   lookupCode: 'HPFM.EXCEL_EXPORT_TYPE',
    // },
    {
      name: 'async',
      type: 'string',
      label: intl.get('ssrc.common.model.common.async').d('异步'),
      defaultValue: 'false',
    },
    // {
    //   name: 'singleExcelMaxSheetNum',
    //   type: 'number',
    //   min: 1,
    //   step: 1,
    //   label: intl.get('ssrc.common.model.common.singleExcelMaxSheetNum').d('最大sheet页'),
    // },
    // {
    //   name: 'singleSheetMaxRow',
    //   type: 'number',
    //   min: 1,
    //   step: 1,
    //   label: intl.get('ssrc.common.model.common.singleSheetMaxRow').d('单sheet最大数量'),
    // },
  ],
  transport: {
    read: ({ data: { queryParams = {} } }) => {
      // data 基本头信息数据, 需要添加树形参数
      const {
        basicInfo: { async, fileName, fillerType, singleSheetMaxRow, singleExcelMaxSheetNum },
        viewCode,
        queryData = {},
        templateCode,
        shieldDimCodeList = [],
        selectedRowKeys = [],
        pageCode,
      } = queryParams;
      const query = {};
      for (const key in queryData) {
        // 日期数字 特殊处理
        if (queryData[key].start || queryData[key].end) {
          Object.assign(query, {
            [key]: JSON.stringify({
              from: queryData[key].start,
              to: queryData[key].end,
            }),
          });
        } else if (Array.isArray(queryData[key]?.slice && queryData[key]?.slice())) {
          // 下拉框 值集 多选处理
          Object.assign(query, { [key]: queryData[key].toString() });
        } else {
          Object.assign(query, { [key]: queryData[key] });
        }
      }
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-mains/excel/export`,
        method: 'POST',
        data: {
          pageCode,
          asyncFlag: async,
          fileName,
          fillerType,
          templateCode,
          singleSheetMaxRow,
          singleExcelMaxSheetNum,
          ...query, // 列表页查询条件
          viewCode: viewCode || 'ALL_VIEW',
          priceLibIdStrings: selectedRowKeys.join(','),
          exportColumnFlag: 0,
          shieldDimCodeList: shieldDimCodeList.join(','),
          from: viewCode && viewCode !== 'ALL_VIEW' ? 'VIEW_LIST' : 'LIST',
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
    {
      name: 'dimensionCode',
    },
  ],
  transport: {
    read: ({ data: { queryParams = {} }, dataSet }) => {
      const { requestUrl, templateCode } = queryParams;
      return {
        url: requestUrl,
        method: 'POST',
        data: {
          templateCode,
          exportColumnFlag: 1,
        },
        transformResponse: (res) => {
          // 除去 `相关价格`和`适用范围` 自动勾选
          const dealData = JSON.parse(res);
          dataSet.setState('exportAppScopeMethod', dealData.exportAppScopeMethod);
          const children = dealData?.children?.map((r) => ({
            ...r,
            isChecked:
              dealData.exportAppScopeMethod === 'IMPORT'
                ? true
                : !['applicationScope', 'relevantPrice'].includes(r.dimensionCode),
          }));
          return dealWithData({
            ...dealData,
            children,
          });
        },
      };
    },
  },
});

export { basicFormDS, dynamicColDS };
