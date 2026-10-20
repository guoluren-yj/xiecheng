// import React from 'react';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
// import intl from 'utils/intl';

import { fetchSaveApply, fetchSubmitApply, fetchDeleteApply } from '@/services/product/shelfApply';

async function handleSave(headerDs, callBack) {
  headerDs.setState('group_loading', true);
  const headerFlag = await headerDs.validate();
  if (headerFlag) {
    const baseData = headerDs.current.toJSONData();
    const res = getResponse(await fetchSaveApply({ ...baseData }));
    if (res) {
      headerDs.current.set('objectVersionNumber', res.objectVersionNumber);
      notification.success();
      callBack(res);
    }
  }
  headerDs.setState('group_loading', false);
}

async function handleSubmit(headerDs, backCallBack) {
  headerDs.setState('group_loading', true);
  const headerFlag = await headerDs.validate();
  // const attachFlag = await attachDs.validate();
  if (headerFlag) {
    const baseData = headerDs.current.toJSONData();
    const res = getResponse(await fetchSubmitApply({ ...baseData }));
    if (res) {
      notification.success();
      backCallBack(res);
    }
  }
  headerDs.setState('group_loading', false);
}

async function deleteApply(headerDs, backCallBack) {
  const { applyHeaderId, objectVersionNumber } = headerDs.current.get([
    'applyHeaderId',
    'objectVersionNumber',
  ]);
  // const res = await headerDs.delete([{applyHeaderId, status: 'add'}], {
  //     title: intl.get('smpc.ShelfApply.view.modal.delTitle', {value: applyCode}).d(`删除供应商下架申请${applyCode}`),
  //     children: intl.get('smpc.ShelfApply.view.modal.confirmDel').d('确定删除供应商下架申请?'),
  // }
  // );
  const res = await fetchDeleteApply({ applyHeaderId, objectVersionNumber });
  if (getResponse(res)) {
    notification.success();
    backCallBack(res);
  }
}

export { handleSave, handleSubmit, deleteApply };
