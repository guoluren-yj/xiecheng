import { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import { filterNullValueObject, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { baseInfoDS, batchLineDS, itemRangeDS } from '../store/strategyDetailDs';
import { fetchSaveStrategy, fetchPublishStrategy, fetchCancelPublish } from '../api';

function initStore(strategyId, readOnly) {
  const baseInfoDs = useMemo(() => new DataSet(baseInfoDS(strategyId)), [strategyId]);
  const batchLineDs = useMemo(() => new DataSet(batchLineDS(readOnly)), [readOnly]);
  const itemRangeDs = useMemo(() => new DataSet(itemRangeDS(strategyId)), [strategyId]);
  return {
    baseInfoDs,
    batchLineDs,
    itemRangeDs,
  };
}

// 发布必须维护物料
const handleSave = async ({
  baseInfoDs,
  batchLineDs,
}, type, callBack = e => e) => {
  const apiMap = {
    save: fetchSaveStrategy,
    unPublish: fetchCancelPublish,
    publish: fetchPublishStrategy,
  };
  if (['save', 'publish'].includes(type) && !batchLineDs.length) {
    notification.warning({
      message: intl.get('sstk.stockConfig.view.publishInfo').d('批次维度不可为空，请添加批次维度'),
    });
    return;
  }
  const baseFlag = await baseInfoDs.validate();
  if (baseFlag) {
    const baseData = baseInfoDs.current.toJSONData();
    baseData.lines = batchLineDs.toData().map((m, idx) => ({ ...m, orderSeq: idx + 1 }));
    const res = getResponse(await apiMap[type](filterNullValueObject(baseData)));
    if (res) {
      notification.success();
      callBack(res);
    }
  }
};
export {
  initStore,
  handleSave,
};