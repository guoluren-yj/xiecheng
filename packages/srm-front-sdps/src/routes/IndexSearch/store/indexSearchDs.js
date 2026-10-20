/**
 * 指标探查DS文件（平台级）
 * @date: 2021-11-1
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';
import _ from 'lodash';
import LovCodeStore from 'choerodon-ui/pro/lib/stores/LovCodeStore';
import moment from 'moment';

/**
 * getIndexDimensionQueryFormDS: 指标编码查询表单
 * @returns DataSet
 */
function getIndexDimensionQueryFormDs() {
  return {
    fields: [
      {
        name: 'serviceLov',
        type: 'object',
        lovCode: 'SDPS.ROUTE.DATA',
        label: intl.get('sdps.indexSearch.view.title.serviceName').d('服务名称'),
      },
      {
        name: 'serviceRoute',
        type: 'string',
        bind: 'serviceLov.serviceRoute',
      },
      {
        name: 'serviceCode',
        type: 'string',
        bind: 'serviceLov.serviceCode',
      },
    ],
  };
}

/**
 * getIndexDimensionFormDs：指标维度表单
 * @param {Object[]} fields Field对象
 * @returns Dataset
 */
function getIndexDimensionFormDs(fields) {
  return {
    autoCreate: true,
    fields,
  };
}

/**
 * getIndexResultDs:指标结果表单
 * @returns Dataset
 */
function getIndexResultDs() {
  const pageSize = 10;
  return {
    selection: false, // 隐藏选择列
    pageSize,
    fields: [
      {
        name: 'indexKey',
        type: 'string',
        label: intl.get('sdps.indexSearch.view.title.indexCode').d('指标编码'),
      },
      {
        name: 'indexName',
        type: 'string',
        label: intl.get('sdps.indexSearch.view.title.indexName').d('指标名称'),
      },
      {
        name: 'indexValue',
        type: 'string',
        label: intl.get('sdps.indexSearch.view.title.indexValue').d('指标值'),
      },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        if (Object.keys(data).length === 0) {
          // 如果是分页查询，则先获取查询项
          const dimensionalityInfoMap = dataSet.getState('dimensionalityInfoMap');
          const queryUri = dataSet.getState('queryUri');
          return {
            url: `${SRM_DATA_PROCESS}/v1/index-search/execute`,
            method: 'POST',
            data: {
              dimensionalityInfoMap,
              queryUri,
            },
          };
        }
        // 如果是初次查询，则构造查询项
        const { record, queryUri } = data;
        // 需要对record进行处理
        const dimensionalityInfoMap = _.mapValues(record.toData(), (value, key) => {
          // 排除dirty字段
          if (key === '__dirty') return undefined;
          // 处理日期字段
          if ((key === 'evalDateFrom' || key === 'evalDateTo') && value) {
            const dateObj = moment(value);
            const dateYear = dateObj.year();
            const dateMonth = dateObj.month() < 9 ? `0${dateObj.month() + 1}` : dateObj.month() + 1;
            const dateDay = dateObj.date() < 10 ? `0${dateObj.date()}` : dateObj.date();
            return `${dateYear}${dateMonth}${dateDay}`;
          }
          // 根据字段名获取字段值
          const field = record.getField(key);
          return typeof value === 'object' && value
            ? value[LovCodeStore.getConfig(field.get('lovCode')).valueField] // 取得配置的值字段的值
            : value;
        });
        // 初次查询则缓存这些查询项
        dataSet.setState('dimensionalityInfoMap', dimensionalityInfoMap);
        dataSet.setState('queryUri', queryUri);
        return {
          url: `${SRM_DATA_PROCESS}/v1/index-search/execute`,
          method: 'POST',
          data: {
            dimensionalityInfoMap,
            queryUri,
          },
        };
      },
    },
  };
}

export { getIndexDimensionQueryFormDs, getIndexDimensionFormDs, getIndexResultDs };
