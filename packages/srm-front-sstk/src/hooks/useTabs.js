import { useState, useRef, useEffect, useCallback } from 'react';

import { getResponse } from 'utils/utils';

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
  const { current: groupInitLoad = {} } = useRef({});

  useEffect(() => {
    if (tabInit) {
      onTabChange(initTabKey);
    }
  }, []);

  const onTabChange = useCallback(
    (key) => {
      if (!key || !tabList.some((s) => s.key === key)) return false;
      const { groupKey = 'default', dataSet } = tabList.find((item) => item.key === key) || {};
      // 处理各个组件缓存逻辑
      tabChange(key, groupKey);
      // 判断筛选器是否就绪，是否手动查询
      if (dataSet && dataSet.getState('queryStatus') === 'ready') {
        dataSet.query();
      }
      // 初始化当前tab组其他tab数量
      if (groupKey && !groupInitLoad[groupKey]) {
        tabList.forEach((f) => {
          // 只对当前组下的其他tab进行初始查询
          if (f.groupKey === groupKey && f.key !== key) {
            f.dataSet.query(1, { onlyCountFlag: 'Y', ...queryCountFlagParam });
          }
        });
        groupInitLoad[groupKey] = true;
      }
      // 变更当前state tab
      setTabKey(key);
    },
    [tabList]
  );

  return [tabKey, onTabChange];
}

export function useSingleTabs(initTabKey, { tabList = [], tabChange = e => e }, onChange = e => e) {
  // 不同tab组下tab总数
  const [tabsCount, setTabsCount] = useState({});
  const [tabKey, setTabKey] = useState(initTabKey);
  let { current: { tabLoaded = false } } = useRef({});
  useEffect(() => {
    onTabChange(initTabKey);
  }, []);
  const onTabChange = useCallback(
    (key) => {
      if (!key || !tabList.some((s) => s.key === key)) return false;
      const { dataSet } = tabList.find((item) => item.key === key) || {};
      tabChange(key);
      setTabKey(key);
      onChange(key);
      queryTabsCount(key);
      // 判断筛选器是否就绪，是否手动查询
      if (dataSet && dataSet.getState('queryStatus') === 'ready') {
        dataSet.query(dataSet.currentPage);
      }
    },
    [tabList]
  );

  const queryTabsCount = useCallback(async (activeKey) => {
    // 已全部查询过，只查当前tab数量
    if (tabLoaded) {
      const find = tabList.find((f) => f.key === activeKey);
      if (find) {
        const { queryCount, key } = find;
        const res = await queryCount();
        if (getResponse(res)) {
          setTabsCount(pre => ({ ...pre, [key]: res.totalElements || 0 }));
        }
      }
      return;
    }
    const apis = [];
    tabList.forEach((f) => {
      apis.push(f.queryCount);
    });
    // 数量查询完毕统一更新数量
    Promise.all(apis.map(api => api())).then((res) => {
      const _tabsCount = {};
      // 当前tab组下
      tabList.forEach((s, idx) => {
        _tabsCount[s.key] = res[idx]?.totalElements || 0;
      });
      setTabsCount(pre => ({...pre, ..._tabsCount}));
    });
    tabLoaded = true;
  }, [tabKey]);
  return [tabKey, onTabChange, {tabsCount, queryTabsCount}];
}
