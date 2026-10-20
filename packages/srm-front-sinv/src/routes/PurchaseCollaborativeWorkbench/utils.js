/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

const handleCommonFunc = (ajax, params, ds, callback) => {
  ds.status = 'submitting';
  ajax(params)
    .then((res) => {
      if (getResponse(res)) {
        notification.success();
        ds.status = 'ready';
        ds.clearCachedSelected(); // 初始化时清除缓存的勾选记录
        ds.unSelectAll(); // 初始化时清除缓存的勾选记录
        ds.query();
        if (callback) callback();
      } else if (callback) {
        ds.status = 'ready';
        callback();
      }
    })
    .catch(() => {
      ds.status = 'ready';
    });
};

const getUnitCode = (key) => {
  const unit = {
    0: {
      units: [
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.WAIT.ZERO',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.WAIT.ZEROLINE',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.SUBMITDETAIL.BTNS',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRMDETAIL.BTNS',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALLDETAIL.BTNS',
      ],
      cuszTplStageCode: 'TRANSFER_DETAIL',
      cuszTplPageCode: 'TRANSFER_DETAIL_UNIT',
    },
    1: {
      units: [
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.WAIT.ONE',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.WAIT.ONELINE',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.SUBMITDETAIL.BTNS',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRMDETAIL.BTNS',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALLDETAIL.BTNS',
      ],
      cuszTplStageCode: 'INVENTORY_DETAIL',
      cuszTplPageCode: 'INVENTORY_DETAIL_UNIT',
    },
    2: {
      units: [
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.WAIT.TWO',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.WAIT.TWOLINE',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.SUBMITDETAIL.BTNS',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRMDETAIL.BTNS',
        'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALLDETAIL.BTNS',
      ],
      cuszTplStageCode: 'NORMAL_DETAIL',
      cuszTplPageCode: 'NORMAL_DETAIL_UNIT',
    },
  };
  return unit[`${key}`];
};

const handleQuery = ({ params = {} }, dataSet, location, paramType, history) => {
  const clearParams = {}; // 清理
  const { state: { _back } = {} } = location;
  const dataObj = dataSet.queryDataSet?.current?.toData() || {};
  if (dataObj) {
    for (const key in dataObj) {
      if (![`${paramType}`].includes(key)) {
        // 排除掉自定义的查询条件
        if (!Object.prototype.hasOwnProperty.call(params, key)) {
          clearParams[key] = undefined;
        }
      }
    }
  }
  dataSet.queryDataSet?.current
    ? dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      })
    : dataSet.queryDataSet.loadData([
        {
          ...params,
          ...clearParams,
        },
      ]);
  console.log(_back, '_back');
  history.replace({
    ...history.location,
    state: {},
  });
  if (_back === -1) {
    dataSet.query(dataSet.currentPage);
  } else {
    dataSet.query();
  }
};

const handleReset = (dataSet) => {
  dataSet.queryDataSet?.current?.reset();
  // dataSet.query();
};

export { handleCommonFunc, getUnitCode, handleReset, handleQuery };
