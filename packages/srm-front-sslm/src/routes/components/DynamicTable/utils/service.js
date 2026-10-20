/**
 * service
 * @date 2021/8/12
 * @author CDJ <dengji.chen@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { isArray } from 'lodash';
import { queryTableCodeList } from '@/services/dynamicTableService';

/**
 * 获取配置表配置
 * @param targetPage: 目标页面标识
 * @returns {*}
 */
export async function queryRelTableConfig(targetPage = '', relationId = null) {
  // 查询配置表code
  const resp = await queryTableCodeList({ targetPage, relationId });
  const tableCodeList = getResponse(resp);
  const tableList = [];
  if (tableCodeList && isArray(tableCodeList.content)) {
    const codeList = tableCodeList.content;
    for (let i = 0; i < codeList.length; i++) {
      tableList.push({
        ...codeList[i],
      });
    }
  }
  return tableList;
}
