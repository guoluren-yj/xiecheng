import { filterNullValueObject } from 'utils/utils';
import imgDefault from '@/assets/sku_default.svg';

// 一些通用方法
export function getSkuImagePath(record) {
  const { imagePath, skuImageList } = record.get(['imagePath', 'skuImageList']);
  const { mediaPath } = (skuImageList || []).find((f) => f.primaryFlag === 1) || {};
  return imagePath || mediaPath || imgDefault;
}

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
  return filterNullValueObject({
    ...fixParams,
    ...queryParams,
    ...(dataSet.getState('dsDefaultParams') || {}),
  });
}

/**
 *
 * @param {*} dataSet
 * @param {勾选导出数据行主键} keyId
 * @param {勾选导出参数名} exportIds
 * @returns 导出参数
 */
export function getC7NExportQueryParams(
  dataSet,
  keyId,
  exportIds = 'exportIds',
  selectParamFromFilter = {}
) {
  const params =
    dataSet.selected.length > 0
      ? // 勾选导出与筛选器查询条件无关
        {
          [exportIds]: dataSet.selected.map((m) => m.get(keyId)),
          ...(dataSet.getState('dsDefaultParams') || {}),
          ...selectParamFromFilter,
        }
      : getC7NQueryParams(dataSet);
  return filterNullValueObject(params);
}

/**
 * getDecodeFileUrl - 解码fileUrl
 * fileUrl格式为服务器目录@文件名, 此方法用于解码getEncodeFileUrl后重复编码的url
 */
export const getDecodeFileUrl = (fileUrl) => {
  if (!fileUrl) {
    return '';
  }
  const index = fileUrl.indexOf('@');
  if (index === -1) {
    return fileUrl;
  }
  return fileUrl.substring(0, index + 1).concat(decodeURIComponent(fileUrl.substring(index + 1)));
};
