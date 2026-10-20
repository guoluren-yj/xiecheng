/* eslint-disable no-unused-expressions */
/*
 * @filename:
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import { isArray, isObject, isString } from 'lodash';
import notification from 'utils/notification';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

/**
 * 将对象中的string属性进行trim
 * @param {Object} data 待处理的对象
 * 处理完成后的对象
 */
const trimData = (data) => {
  if (!isObject(data)) {
    return null;
  }
  const res = {};
  Object.keys(data).forEach((k) => {
    if (isString(data[k])) {
      res[k] = data[k].trim();
    } else {
      res[k] = data[k];
    }
  });
  return res;
};

/**
 * 将列表中的对象的string属性进行trim
 * @param {Array<Object>} data 待处理的列表
 * 处理后的列表
 */
const trimListData = (data) => {
  if (!isArray(data)) {
    return [];
  }
  return data.map(trimData);
};

/**
 * DS配置生成器
 * @param {Function} apiConfig DS基础配置对象生成函数
 * @param {Object} sourceDetail 数据对象明细对象
 * @param {Object} queryDate 查询字段
 * @param {'update' | 'delete' | 'query' | 'list' | 'page'} requestType 请求类型
 */
export default (apiConfig, { dataObjectCode }, requestType) =>
  ({
    autoCreate: true,
    feedback: {
      // 覆盖hzero默认行为
      submitFailed: () => {},
      submitSuccess: () => {},
    },
    fields: [
      { name: 'jsonData', type: 'string' },
      { name: 'exampleData', type: 'string' },
      { name: 'response', type: 'string', ignore: 'always', readOnly: true },
      {
        name: 'applicationType',
        label: 'Parameter content type',
        type: 'string',
        ignore: 'always',
        readOnly: true,
      },
    ],
    transport: {
      submit: ({ data, dataSet }: any) => {
        // fixme
        const { queryDate } = dataSet.queryParameter;
        let _data: any = null;
        if (requestType === 'update' || requestType === 'delete') {
          try {
            _data = JSON.parse(data[0].jsonData);
          } catch (e) {
            return null;
          }
          _data = trimListData(_data);
        } else if (
          requestType === 'query' ||
          requestType === 'page' ||
          requestType === 'list' ||
          requestType === 'aggregation'
        ) {
          _data = trimData(queryDate);
        } else {
          return null;
        }
        const { url, method } = apiConfig();
        return {
          url: url.replace('#dataObjectCode#', dataObjectCode),
          method,
          data: _data,
          transformResponse: (response) => {
            if (!response || response === 'null') {
              // 删除成功返回为空
              dataSet?.current?.set('response', '{}');
              dataSet?.current?.set('response', '');
              // dataSet?.current?.removeAll();
              notification.success({ message: '提示', description: '操作成功' });
              // return;
            } else {
              const _res = JSON.parse(response);
              if (_res && _res.failed) {
                notification.error({
                  message: _res.code,
                  description: _res.message,
                });
              } else {
                notification.success({ message: '提示', description: '操作成功' });
              }
              dataSet?.current?.set('response', response);
            }
          },
        };
      },
    },
  } as DataSetProps);
