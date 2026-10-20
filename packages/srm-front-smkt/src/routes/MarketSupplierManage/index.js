import React, { Fragment, useState, useEffect } from 'react';
import { flowRight } from 'lodash';
import { DataSet, Tabs } from 'choerodon-ui/pro';

import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import TableCom from './list/TableCom';
import getDs from './ds';

const initKey = 'srm-sup';
const getWithProps = withProps(
  () => {
    const list = [
      {
        tab: intl.get('smkt.supplierManage.view.tab.srmSupplier').d('平台甄选供应商'),
        key: 'srm-sup',
        customizeUnitCode: 'SMKT.SUPPLIER.SRM.LIST1',
        searchBarCode: 'SMKT.SUPPLIER.SRM.LIST',
      },
      {
        tab: intl.get('smkt.supplierManage.view.tab.mySupplier').d('我的甄选供应商'),
        key: 'my-sup',
        customizeUnitCode: 'SMKT.SUPPLIER.TENANT.LIST',
        searchBarCode: 'SMKT.SUPPLIER.TENANT.SEARCHBAR',
      },
    ];
    const _list = list.map((m) => {
      const { key, url, params, customizeUnitCode = '', searchBarCode = '' } = m;
      const code = [customizeUnitCode, searchBarCode].filter((f) => f).join(',');
      return {
        ...m,
        ds: new DataSet(getDs(key === 'srm-sup', { url, params, code })),
      };
    });
    return { tabPaneList: _list };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
);

function MarketWorkbench(props) {
  const { tabPaneList = [] } = props;
  const [activeKey, setActiveKey] = useState(initKey);

  useEffect(() => {
    const currentDs = (tabPaneList.find((item) => item.key === activeKey) || {}).ds;
    currentDs.query(currentDs.currentPage);
  }, [activeKey]);

  return (
    <Fragment>
      <Header title={intl.get('smkt.supplierManage.view.title.workbench').d('甄选供应商管理')} />
      <Content>
        <Tabs
          animated={false}
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          customizedCode="SMKT.SUPPLIER_MANAGE.TAB"
        >
          {tabPaneList.map((item) => (
            <Tabs.TabPane tab={item.tab} key={item.key}>
              <TableCom
                ds={item.ds}
                searchBarCode={item.searchBarCode}
                tableCode={item.customizeUnitCode}
                tabKey={item.key}
              />
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Content>
    </Fragment>
  );
}

export default flowRight(
  //   withCustomize({ unitCode: getTabs('custCode') }),
  formatterCollections({ code: ['smkt.supplierManage', 'smpc.product'] }),
  getWithProps
)(MarketWorkbench);
