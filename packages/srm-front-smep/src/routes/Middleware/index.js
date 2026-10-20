import React, { useState, useEffect } from 'react';
import { flowRight } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import { DataSet, Button, Tabs } from 'choerodon-ui/pro';

import { tableDs, formDs } from './ds';
import { fetchRetailers } from '@/services/middware';
import c7nModal from '@/utils/c7nModal';
import Detail from './Detail';
import SearchTable from './SearchTable';

const { TabGroup, TabPane } = Tabs;

function MiddlewarePolling() {
  const [tabKey, setTabKey] = useState('');
  const [groupDefaultKey, setGroupDefaultKey] = useState({});
  const [tabList, setTabList] = useState([]);
  const groupList = [
    {
      tab: intl.get('smep.middlewarePolling.view.srmPolling').d('平台级轮询'),
      key: 'srm',
    },
    {
      tab: intl.get('smep.middlewarePolling.view.tenantPolling').d('租户级轮询'),
      key: 'tenant',
    },
  ];

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { content: retailers = [] } = (await fetchRetailers()) || {};
    // 去重
    const keys = [];
    const _retailers = [];
    retailers.forEach((i) => {
      if (!keys.includes(i.ecCode)) {
        keys.push(i.ecCode);
        _retailers.push(i);
      }
    });
    const initTabs = [];
    setTabKey(`srm_${_retailers[0]?.ecCode}`);
    setGroupDefaultKey({
      srm: `srm_${_retailers[0]?.ecCode}`,
      tenant: `tenant_${_retailers[0]?.ecCode}`,
    });
    groupList.forEach((g) => {
      _retailers.forEach((r) => {
        const obj = {
          tab: r.ecCodeMeaning,
          key: `${g.key}_${r.ecCode}`,
          groupKey: g.key,
          params: {
            type: g.key === 'srm' ? undefined : 'TENANT',
            // ecCode: r.ecCode,
          },
          ecCode: r.ecCode,
          customizeUnitCode: `SMEP.MIDDLEWARE.${g.key}_${r.ecCode}.TABLE`,
        };
        initTabs.push(obj);
      });
    });
    const searchBarCode = 'SMEP.MIDDLEWARE.SRM_VOP.SEARCH_BAR';
    const tabs = initTabs.map((i) => {
      const { customizeUnitCode: tableCode = '', params = {} } = i;
      const customizeUnitCode = [tableCode, searchBarCode].filter((f) => f).join(',');
      const queryParams = { customizeUnitCode, ...params };
      const dataSet = new DataSet(tableDs(queryParams));
      dataSet.setQueryParameter('ecCode', i.ecCode);
      dataSet.query(dataSet.currentPage);
      // 个性化编码 和 筛选器编码
      return {
        dataSet,
        // 公用一个筛选器
        searchBarCode,
        // getPara: () => {
        //   const queryPara = dataSet?.queryDataSet?.current.toJSONData() || {};
        //   return filterNullValueObject({
        //     ...queryPara,
        //     ...params,
        //     customizeUnitCode,
        //   });
        // },
        ...i,
      };
    });
    setTabList(tabs);
  }

  function getCurrentDs() {
    return tabList.find((f) => f.key === tabKey)?.dataSet;
  }

  const handleTabsChange = (_tabKey) => {
    setTabKey(_tabKey);
  };
  function callBack() {
    query();
    notification.success();
  }

  function handleCreate(data) {
    const { pullId } = data || {};
    const readOnly = pullId;
    const isTenant = tabKey.includes('tenant');
    const currentTab = tabList.find((f) => f.key === tabKey) || {};
    const operation = !pullId
      ? intl.get('hzero.common.button.new').d('新建')
      : intl.get('hzero.common.button.edit').d('编辑');
    const type = (tabKey?.split('_') || [])[1];
    const name = tabKey.includes('srm')
      ? intl.get('smep.middlewarePolling.view.plat').d('平台')
      : intl.get('smep.middlewarePolling.view.tenant').d('租户');
    const ecParams = {
      ecMeaning: currentTab.tab,
      ecCode: currentTab.key?.split('_')[1],
    };
    const ds = new DataSet(formDs(isTenant, ecParams.ecCode));
    if (pullId) {
      ds.create({ ...data, ...ecParams });
    } else {
      ds.create(ecParams);
    }
    c7nModal({
      title: intl
        .get('smep.middlewarePolling.edit.title', {
          operation,
          name,
          type,
        })
        .d(`${operation}${name}${type}轮询`),
      style: { width: 380 },
      children: <Detail dataSet={ds} readOnly={readOnly} isTenant={isTenant} callBack={callBack} />,
    });
  }

  function query() {
    getCurrentDs().query(getCurrentDs().currentPage);
  }

  return (
    <>
      <Header title={intl.get('smep.middlewarePolling.view.header.title').d('中间件轮询规则')}>
        <Button color="primary" icon="add" onClick={handleCreate}>
          {intl.get('hzero.common.button.new').d('新建')}
        </Button>
      </Header>
      <Content>
        <Tabs
          activeKey={tabKey}
          onChange={handleTabsChange}
          defaultChangeable={false}
          customizedCode="SMEP.MIDDLEWARE.TABS"
        >
          {groupList.map((group) => (
            <TabGroup tab={group.tab} key={group.key} defaultActiveKey={groupDefaultKey[group.key]}>
              {tabList
                .filter((tab) => tab.groupKey === group.key)
                .map((m) => {
                  const { key, tab, dataSet, searchBarCode, customizeUnitCode } = m;
                  return (
                    <TabPane key={key} tab={tab} count={() => dataSet.totalCount}>
                      <SearchTable
                        customizeUnitCode={customizeUnitCode}
                        dataSet={dataSet}
                        tabKey={tabKey}
                        searchBarCode={searchBarCode}
                        handleCreate={handleCreate}
                        ecCode={m.ecCode}
                      />
                    </TabPane>
                  );
                })}
            </TabGroup>
          ))}
        </Tabs>
      </Content>
    </>
  );
}
export default flowRight(
  formatterCollections({ code: ['smep.middlewarePolling', 'hzero.common'] })
)(MiddlewarePolling);
