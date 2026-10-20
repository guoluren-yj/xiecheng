import React, { useMemo, useEffect, useState, useRef } from 'react';
import { DataSet, Tabs } from 'choerodon-ui/pro';
import { compose } from 'lodash';

import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';

import SubTable from './subTable';
import { parentTabs } from './data';
import { tableDs } from './ds';

const { TabPane, TabGroup } = Tabs;

const initTab = {
  group: 'SKU',
  groupDefaultKey: { SKU: 'UPDATE', ORDER: 'ECORDER', AFSALE: 'AFALL', SETTLE: 'STATEMENT' },
};

function EcBillWorkBench(props) {

  const [tabsCount, setTabsCount] = useState({}); // 不同tab组下tab总数
  const tabLoaded = useRef({});

  const tabs = useMemo(() => parentTabs(), []);

  const { DSMap, customizeTable } = props;

  useEffect(() => {
    queryTabsCount();
  }, []);

  const queryTabsCount = async () => {
    const { group } = initTab;
    const activeKey = initTab.groupDefaultKey[group];
    const findSon = parentTabs().find(i => i.key === group);
    if (findSon) {
      const sonList = findSon.panes;
      // 已全部查询过，只查当前tab数量
      if (tabLoaded.current[`${group}Loaded`]) {
        const find = sonList.find((f) => f.key === activeKey);
        if (find) {
          const { queryCount } = find;
          const res = await queryCount();
          if (getResponse(res)) {
            setTabsCount(pre => ({ ...pre, [group]: { ...tabsCount[group], [activeKey]: res.totalElements || 0 } }));
          }
        }
        return;
      }
      const apis = [];
      sonList.forEach((f) => {
        const { queryCount = (e) => e } = f;
        apis.push(queryCount);
      });
      // 数量查询完毕统一更新数量
      Promise.all(apis.map((api) => api())).then((res) => {
        const _tabsCount = {};
        // 当前tab组下
        sonList.forEach((s, idx) => {
          _tabsCount[s.key] = res[idx]?.totalElements || 0;
        });
        setTabsCount(pre => ({ ...pre, [group]: _tabsCount }));
      });
      tabLoaded.current[`${group}Loaded`] = true;
    }
  };

  function handleChaneg(key) {
    const find = parentTabs().find(i => i.panes.find(f => f.key === key));
    if (find) {
      initTab.group = find.key;
      initTab.groupDefaultKey[find.key] = key;
    }
    queryTabsCount();
    if (DSMap[key].getState('queryStatus') === 'ready') {
      DSMap[key].query(DSMap[key].currentPage);
    }
  }

  return (
    <>
      <Header title={intl.get('smodr.ecBill.view.title').d('电商单据工作台')} />
      <Content>
        <Tabs onChange={(key) => handleChaneg(key)}>
          {tabs.map(item => (
            <TabGroup tab={item.tab} key={item.key}>
              {item.panes.map(pane => (
                <TabPane tab={pane.tab} key={pane.key} count={(tabsCount[item.key] || {})[pane.key]}>
                  <SubTable
                    parentKey={item.key}
                    subKey={pane.key}
                    singleConfig={pane}
                    ds={DSMap[pane.key]}
                    customizeTable={customizeTable}
                  />
                </TabPane>
              ))}
            </TabGroup>
          ))}
        </Tabs>
      </Content>
    </>
  );
}

export default compose(
  withCustomize({
    unitCode: ['SMOP.EC.RECORD.EC.DETAIL', 'SMOP.EC.TABLE.SKU.ALL.TABLE'],
  }),
  formatterCollections({
    code: 'smodr.ecBill',
  }),
  withProps(
    () => {
      const DSMap = {};
      parentTabs().forEach(i => {
        const { panes } = i;
        panes.forEach(p => {
          DSMap[p.key] = new DataSet(tableDs(p.key, i.key, p));
        });
      });
      return { DSMap };
    },
    {
      cacheState: true,
    }
  )
)(EcBillWorkBench);
