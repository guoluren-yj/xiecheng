import React, { useEffect, useMemo, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';

import { queryDeliveryWorkbench } from '@/services/receiptManageConfigService';
import moment from 'moment';
import { isBoolean } from 'lodash';
import { getResponse } from 'utils/utils';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';

export const useMount = (callback) => {
  useEffect(() => {
    callback(); // 需要初始化请求（加载）的方法或接口
  }, []);
};

export const useCreate = (callback, param) => {
  useMemo(() => {
    callback();
  }, [param]);
};

// 是否启用发货工作台
export default function SlodStatusHOC(WrapComponent) {
  return function Advances(props) {
    const [workFlag, setState] = useState();

    useEffect(() => {
      try {
        queryDeliveryWorkbench().then((res) => {
          setState(res);
        });
      } catch (e) {
        throw e;
      }
    }, []);

    const hocProps = {
      ...props,
      workFlag,
    };
    if (isBoolean(workFlag)) {
      return <WrapComponent {...hocProps} />;
    }
    return <Spin />;
  };
}

export function dateRangeTransform(dateRange = null) {
  const transToArr = () => {
    switch (dateRange) {
      case 'IN_ONE_MONTH':
        return [moment().subtract(1, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'IN_TO_MONTH':
        return [moment().subtract(2, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'IN_THREE_MONTH':
        return [moment().subtract(3, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'HALF_THE_YEAR':
        return [moment().subtract(6, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'IN_ONE_YEAR':
        return [moment().subtract(12, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'ALL':
        return [];
      default:
        return [moment().subtract(3, 'month'), moment(new Date()).format('YYYY-MM-DD')];
    }
  };
  return transToArr();
}

export function hzeroDateRangeTransform(dateRange = null) {
  const transToArr = () => {
    switch (dateRange) {
      case 'IN_ONE_MONTH':
        return moment().subtract(1, 'month');
      case 'IN_TO_MONTH':
        return moment().subtract(2, 'month');
      case 'IN_THREE_MONTH':
        return moment().subtract(3, 'month');
      case 'HALF_THE_YEAR':
        return moment().subtract(6, 'month');
      case 'IN_ONE_YEAR':
        return moment().subtract(12, 'month');
      case 'ALL':
        return '';
      default:
        return moment().subtract(6, 'month');
    }
  };
  return transToArr();
}

/**
 * 子节点树结构递归
 * 数据扁平化
 */
export function recursion(arrs, childs, attrArr) {
  let attrList = [];
  if (!Array.isArray(arrs) && !arrs.length) return [];
  if (typeof childs !== 'string') return [];
  if (!Array.isArray(attrArr) || (Array.isArray(attrArr) && !attrArr.length)) {
    attrList = Object.keys(arrs[0]);
    attrList.splice(attrList.indexOf(childs), 1);
  } else {
    attrList = attrArr;
  }
  const list = [];
  const getObj = (arr) => {
    arr.forEach((row) => {
      const obj = {};
      attrList.forEach((item) => {
        obj[item] = row[item];
      });
      list.push(obj);
      if (row[childs]) {
        getObj(row[childs]);
      }
    });
    return list;
  };
  return getObj(arrs);
}

export function isText(str) {
  let result;
  try {
    result = getResponse(JSON.parse(str));
    return result;
  } catch (e) {
    return str;
  }
}
