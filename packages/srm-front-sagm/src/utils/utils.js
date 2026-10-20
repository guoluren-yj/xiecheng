import { filterNullValueObject } from 'utils/utils';
import { isFunction } from 'lodash';

export function getC7NQueryParams(dataSet, fixParams = {}) {
  const queryRecord = dataSet?.queryDataSet?.current;
  // ds.setQueryParameter设置的参数
  const params = dataSet.queryParameter;
  // 筛选器查询条件
  const query = queryRecord ? queryRecord.toJSONData() : {};
  const queryParams = { ...params, ...query };
  delete queryParams.__id;
  delete queryParams.__dirty;
  delete queryParams._status;
  return filterNullValueObject({ ...fixParams, ...queryParams });
}

/**
 *
 * @param {*} dataSet
 * @param {勾选导出数据行主键} keyId
 * @returns 导出参数
 */
export function getC7NExportQueryParams(dataSet, keyId, customQuery, options) {
  const { exportIdsName } = options || {};
  const params =
    dataSet.selected.length > 0
      ? // 勾选导出与筛选器查询条件无关
        { [exportIdsName || 'exportSkuIds']: dataSet.selected.map((m) => m.get(keyId)) }
      : customQuery && isFunction(customQuery)
      ? customQuery()
      : getC7NQueryParams(dataSet);
  return filterNullValueObject(params);
}
