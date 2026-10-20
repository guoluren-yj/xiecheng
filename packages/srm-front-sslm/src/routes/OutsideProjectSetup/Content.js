/*
 * @Description: 外部寻源-Content
 * @Date: 2025-05-21 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import React, { useContext } from 'react';
import { Tabs } from 'choerodon-ui';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';

import { StoreContext } from './ListProvider';
import HeaderBtns from './HeaderBtns';

const { TabPane } = Tabs;

const Contents = () => {
  const {
    mixObj,
    tabKey,
    loading,
    listTab,
    dispatch,
    columns,
    lineDataSet,
    setLoading,
    onTabChange,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
  } = useContext(StoreContext);
  return (
    <>
      <Header
        title={intl.get('sslm.outsideProjectSetup.view.title.outsideProjectSetup').d('外部寻源')}
      >
        <HeaderBtns
          mixObj={mixObj}
          tabKey={tabKey}
          loading={loading}
          dispatch={dispatch}
          setLoading={setLoading}
          lineDataSet={lineDataSet}
          customizeBtnGroup={customizeBtnGroup}
        />
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SSLM_OUTSIEDPROJECTSETUP.TABS',
          },
          <Tabs
            activeKey={tabKey}
            onChange={key => {
              mixObj.activeKey = key;
              onTabChange(key);
            }}
          >
            {listTab.map(item => (
              <TabPane key={item.key} tab={item.tab}>
                <div style={{ height: 'calc(100vh - 252px)' }}>
                  {customizeTable(
                    { code: item.customizeUnitCode },
                    <SearchBarTable
                      cacheState
                      columns={columns}
                      searchCode={item?.searchCode}
                      dataSet={lineDataSet[item.key]}
                      style={{ maxHeight: `calc(100% - 22px)` }}
                    />
                  )}
                </div>
              </TabPane>
            ))}
          </Tabs>
        )}
      </Content>
    </>
  );
};

export default Contents;
