import React, { Fragment, useContext, useMemo, useState, useCallback } from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import ListTable from './components/ListTable';
import StoreProvider, { Store } from './stores';
import { formatDynamicBtns } from '../../../utils/utils';
import { ActiveKey, ListBtnsCustCode, ListTabsCustCode, ActionMap } from '../utils/type';

const { TabPane } = Tabs;


const List = observer(() => {
  const {
    dsMap,
    remote,
    history,
    cacheState,
    permissionMap,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
  } = useContext(Store);

  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const { selected, queryDataSet } = currentListDs;

  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    const currentDs = dsMap[key];
    setActiveKey(key);
    cacheState.set('activeKey', key);
    if (currentDs.getState('queryStatus') === 'ready') currentDs.query(currentDs.currentPage);
    fetchTabKeysCount([key]);
  },
    [dsMap, cacheState, fetchTabKeysCount]
  );

  const getExportParams = useCallback(() => {
    const serialIdList = selected.map((item) => item.get('serialId'));
    const queryData = queryDataSet?.current?.toData() || {};
    if (selected.length > 0) {
      return filterNullValueObject({ serialIdList });
    } else {
      return filterNullValueObject({
        ...queryData,
        exportSearchbarUnitCode: currentListDs.getQueryParameter('customizeUnitCode'),
      });
    }
  }, [queryDataSet, selected, currentListDs]);


  const buttons = useMemo(() => {
    const normalBtns = [
      permissionMap.get('export') && {
        name: 'export',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`sbsm.common.view.button.export`).d('导出')
          : intl.get(`sbsm.common.view.button.selectedExport`).d('勾选导出'),
        btnProps: {
          templateCode: 'SRM_C_SBSM_BANK_SERIAL_POOL_LIST_EXPORT',
          otherButtonProps: { funcType: 'flat' },
          method: 'POST',
          allBody: true,
          requestUrl: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-serial/export?tab=${ActionMap[activeKey]}`,
          queryParams: getExportParams,
        },
      },
    ];
    const processBtns = remote
      ? remote.process('SBSM.BANK_FLOW_POOL_LIST_CUX.HEAD_BTNS', normalBtns, { selected, dsMap, history, activeKey })
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    dsMap,
    remote,
    history,
    selected,
    activeKey,
    permissionMap,
    getExportParams,
  ]);

  const TabColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.Success,
        tab: intl.get(`sbsm.bankFlow.view.title.success`).d('支付成功'),
      },
      {
        key: ActiveKey.Refund,
        tab: intl.get(`sbsm.bankFlow.view.title.refund`).d('支付退票'),
      },
      {
        key: ActiveKey.Refundable,
        tab: intl.get(`sbsm.bankFlow.view.title.refundable`).d('可退票'),
      },
      {
        key: ActiveKey.Abnormal,
        tab: intl.get(`sbsm.bankFlow.view.title.abnormal`).d('异常'),
      },
      {
        key: ActiveKey.All,
        tab: intl.get(`sbsm.bankFlow.view.title.all`).d('全部'),
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sbsm.bankFlow.view.title.bankFlowPool').d('银行流水池')}>
        {customizeBtnGroup(
          { code: ListBtnsCustCode, pro: true },
          <DynamicButtons defaultBtnType="c7n-pro" maxNum={5} buttons={buttons} />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          { code: ListTabsCustCode },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            {TabColumns.map(({ key, tab }) => (
              <TabPane
                tab={tab}
                key={key}
                count={dsMap[key].getState('totalCount')}
              >
                <ListTable activeKey={key} />
              </TabPane>
            ))}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const BankFlowPoolList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default BankFlowPoolList;
