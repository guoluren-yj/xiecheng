import { useState, useRef, useEffect, useCallback } from 'react';

export default function useTabs(
  initTabKey,
  { tabList = [], tabInit = true, defaultQueryParams = {}, tabChange = e => e }
) {
  let initKey = initTabKey;
  if (!tabList.some(s => s.key === initTabKey)) {
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
    key => {
      if (!key || !tabList.some(s => s.key === key)) return false;
      const { groupKey = 'default', dataSet } = tabList.find(item => item.key === key) || {};
      // 处理各个组件缓存逻辑
      tabChange(key, groupKey);
      // 判断筛选器是否就绪，是否手动查询
      if (dataSet && dataSet.getState('queryStatus') === 'ready') {
        dataSet.query();
      }
      // 初始化当前tab组其他tab数量
      if (groupKey && !groupInitLoad[groupKey]) {
        tabList.forEach(f => {
          const tabGroupKey = f.groupKey || 'default';
          // 只对当前组下的其他tab进行初始查询
          if (tabGroupKey === groupKey && f.key !== key) {
            f.dataSet.query(1, { onlyCountFlag: 'Y', ...defaultQueryParams });
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
