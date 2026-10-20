import { useState, useRef, useEffect, useCallback } from 'react';

import request from 'utils/request';

// 不是要dataSet.query， 查询的总数量有问题（估计内部·做了处理）
export async function fetchOnlyCount(url, param) {
  return request(url, {
    method: 'GET',
    query: param,
  });
}

export default function useTabs(
  initTabKey,
  { tabList = [], tabInit = true, queryCountFlagParam = {}, tabChange = (e) => e }
) {
  let initKey = initTabKey;
  if (!tabList.some((s) => s.key === initTabKey)) {
    const { key } = tabList?.[0] || {};
    initKey = key;
  }
  const [tabKey, setTabKey] = useState(initKey);
  // 不同tab下数据数量
  const [tabsCount, setTabsCount] = useState({});
  const { current: groupInitLoad = {} } = useRef({});

  useEffect(() => {
    if (tabInit) {
      onTabChange(initTabKey);
    }
  }, []);

  const onTabChange = useCallback(
    async (key) => {
      if (!key || !tabList.some((s) => s.key === key)) return false;
      const { groupKey = 'default', dataSet, url } = tabList.find((item) => item.key === key) || {};
      // 处理各个组件缓存逻辑
      tabChange(key, groupKey);
      // 切换Tab查询最新数量
      if (groupInitLoad[groupKey]) {
        const res =
          (await fetchOnlyCount(url, {
            onlyCountFlag: 'Y',
            ...queryCountFlagParam,
            ...(dataSet.queryParameter || {}),
            ...(dataSet.getState('onlyQueryParam') || {}),
          })) || {};
        setTabsCount((pre) => ({ ...pre, [key]: res.totalElements || 0 }));
      }
      // 判断筛选器是否就绪，是否手动查询
      if (dataSet && dataSet.getState('queryStatus') === 'ready') {
        dataSet.query(dataSet.currentPage);
      }
      // 对当前组下的tab数量进行初始查询
      if (groupKey && !groupInitLoad[groupKey]) {
        const _tabsCount = {};
        const realTabs = tabList.filter((f) => f.groupKey === groupKey);
        try {
          Promise.all(
            realTabs.map((tab) => {
              return fetchOnlyCount(tab.url, {
                onlyCountFlag: 'Y',
                ...queryCountFlagParam,
                ...(tab.dataSet.queryParameter || {}),
                ...(tab.dataSet.getState('onlyQueryParam') || {}),
              });
            })
          ).then((res = []) => {
            realTabs.forEach((f, idx) => {
              _tabsCount[f.key] = res[idx]?.totalElements || 0;
            });
            setTabsCount((pre) => ({ ...pre, ..._tabsCount }));
            groupInitLoad[groupKey] = true;
          });
        } catch (err) {
          console.log('err-useTabs', err);
        }
      }
      // 变更当前state tab
      setTabKey(key);
    },
    [tabList]
  );
  return [tabKey, onTabChange, tabsCount, setTabsCount];
}
