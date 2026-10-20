/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-23 13:09:57
 */

import React, { useState, useEffect } from 'react';
import { Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryBudgetList } from './occupiedService.js';
import OccupiedOrApplied from './OccupiedOrApplied.js';
// 设置sbdm国际化前缀 - common - model
const Index = function Index({ pageData, documentType, docLineId }) {
//   const { record } = pageData || {};
  const [emptyFlag, setEmptyFlag] = useState(null);
  const [budgetLineId, setBudgetLineId] = useState(null);
  // const { prLineId, prHeaderId } = record?.get(['prLineId', 'prHeaderId']);

  useEffect(() => {
    queryBudgetList({ documentType, docLineId }).then((res) => {
      if (getResponse(res)) {
        if (res?.budgetLineId) {
          setBudgetLineId(res?.budgetLineId);
          setEmptyFlag(0);
        } else {
          setEmptyFlag(1);
        }
      }else{
        setEmptyFlag(1);
      }
    });
  }, [ documentType, docLineId]);

  return (
    <Spin spinning={!(emptyFlag || budgetLineId)}>
      {!budgetLineId ? <span>{intl.get(`hzero.common.components.noticeIcon.null`).d('暂无数据')}</span>
        : (
          <OccupiedOrApplied
            budgetLineId={budgetLineId}
          />
        )}
    </Spin>
  );
};

export default formatterCollections({
  code: ['sbdm.common', 'hzero.common'],
})(Index);
