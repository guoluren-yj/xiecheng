import { isEmpty } from 'lodash';
import qs from 'qs';

import { getCurrentUserId, getCurrentRole } from 'utils/utils';
import { getDvaApp } from 'utils/iocUtils';

export function getStoragePurchase() {
  const useId = getCurrentUserId();
  const idAdmin = getCurrentRole().code === 'administrator';
  let storageData = window.localStorage.getItem('small-purchase-config') || '';
  if (storageData) storageData = JSON.parse(storageData);
  const { role = 'purchase' } = storageData[useId] || {};
  if (!idAdmin && role === 'tenant') {
    window.localStorage.setItem(
      'small-purchase-config',
      JSON.stringify({
        ...(!isEmpty(storageData) ? storageData : {}),
        [getCurrentUserId()]: { role: 'purchase', purchase: {} },
      })
    );
  }
  storageData = window.localStorage.getItem('small-purchase-config') || '';
  if (storageData) storageData = JSON.parse(storageData);
  return storageData[useId] || { role: 'purchase' };
}

// 购物车模板分配获取当前tab页
export function getTemplateStyle() {
  return (
    qs.parse(window.location.search.substr(1))?.templateStyle ||
    getDvaApp()._store.getState()?.cartDefinition?.templateStyle
  );
}
