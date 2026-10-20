import React, { Fragment, useContext, useMemo, createElement, useCallback } from 'react';
import { Tabs, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';

import TenderTable from './TenderTable';
import DepositTable from './DepositTable';
import ServiceTable from './ServiceTable';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import { formatDynamicBtns } from '../../../utils/utils';
import DepositBalance from '../components/DepositBalance';
import { ActiveKey, ListTabsCustCode, ListBtnsCustCode } from '../utils/type';
import commonStyles from '../../common.less';

const { TabPane, TabGroup } = Tabs;

const List = observer(() => {
  const {
    dsMap,
    remote,
    activeKey,
    tenderKeys,
    depositKeys,
    serviceKeys,
    handleTabChange,
    customizeTabPane,
    customizeBtnGroup,
    handleReQuery,
  } = useContext<StoreValueType>(Store);

  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const loading = tableDs.status !== 'loading';

  const handleViewDepositBalance = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.depositBalance').d('保证金余额'),
      className: commonStyles['ssta-large-modal'],
      children: <DepositBalance />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const tabColumns = useMemo(() => {
    return [
      {
        key: 'tender',
        defaultActiveKey: ActiveKey.TenderAll,
        tab: intl.get(`ssta.sourcingCost.view.title.tenderFileFee`).d('招标文件费'),
        content: TenderTable,
        children: [
          {
            key: ActiveKey.TenderPay,
            tab: intl.get(`ssta.sourcingCost.view.title.payable`).d('可缴纳'),
          },
          {
            key: ActiveKey.TenderInv,
            tab: intl.get(`ssta.sourcingCost.view.title.invoicable`).d('可开票'),
          },
          {
            key: ActiveKey.TenderDownload,
            tab: intl.get(`ssta.sourcingCost.view.title.downloadable`).d('可下载'),
          },
          {
            key: ActiveKey.TenderAll,
            tab: intl.get(`ssta.sourcingCost.view.title.all`).d('全部'),
          },
        ],
      },
      {
        key: 'deposit',
        defaultActiveKey: ActiveKey.DepositAll,
        tab: intl.get(`ssta.sourcingCost.view.title.securityDeposit`).d('保证金'),
        content: DepositTable,
        children: [
          {
            key: ActiveKey.DepositPay,
            tab: intl.get(`ssta.sourcingCost.view.title.payable`).d('可缴纳'),
          },
          {
            key: ActiveKey.DepositReturn,
            tab: intl.get(`ssta.sourcingCost.view.title.returnable`).d('可退回'),
          },
          {
            key: ActiveKey.DepositAll,
            tab: intl.get(`ssta.sourcingCost.view.title.all`).d('全部'),
          },
        ],
      },
      {
        key: 'service',
        defaultActiveKey: ActiveKey.ServiceAll,
        tab: intl.get(`ssta.sourcingCost.view.title.serviceFee`).d('服务费'),
        content: ServiceTable,
        children: [
          // {
          //   key: ActiveKey.ServicePay,
          //   tab: intl.get(`ssta.sourcingCost.view.title.payable`).d('可缴纳'),
          // },
          // {
          //   key: ActiveKey.ServiceInv,
          //   tab: intl.get(`ssta.sourcingCost.view.title.invoicable`).d('可开票'),
          // },
          {
            key: ActiveKey.ServiceAll,
            tab: intl.get(`ssta.sourcingCost.view.title.all`).d('全部'),
          },
        ],
      },
    ];
  }, []);

  const tenderBtns = useMemo(() => {
    const normalBtns = [];
    const otherProps = { tableDs, activeKey, loading };
    const processBtns = remote
      ? remote.process('SSTA.SOURCING_COST_SUP_CUX.TENDER_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [remote, tableDs, activeKey, loading]);

  const depositBtns = useMemo(() => {
    const normalBtns = [
      {
        name: 'depositBalance',
        child: intl.get('ssta.sourcingCost.view.button.depositBalance').d('保证金余额'),
        btnProps: {
          icon: 'gradient',
          funcType: FuncType.flat,
          color: ButtonColor.default,
          onClick: handleViewDepositBalance,
        },
      },
    ];
    const otherProps = { tableDs, activeKey, loading, handleReQuery };
    const processBtns = remote
      ? remote.process('SSTA.SOURCING_COST_SUP_CUX.DEPOSIT_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [remote, tableDs, activeKey, loading, handleViewDepositBalance]);

  const serviceBtns = useMemo(() => {
    const normalBtns = [];
    const otherProps = { tableDs, activeKey, loading };
    const processBtns = remote
      ? remote.process('SSTA.SOURCING_COST_SUP_CUX.SERVICE_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [remote, tableDs, activeKey, loading]);

  return (
    <Fragment>
      <Header title={intl.get('ssta.sourcingCost.view.title.supSourcingCostWorkbench').d('供应商寻源费用工作台')}>
        {tenderKeys.includes(activeKey) && customizeBtnGroup(
          { code: ListBtnsCustCode.TENDER, pro: true },
          <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={tenderBtns} />
        )}
        {depositKeys.includes(activeKey) && customizeBtnGroup(
          { code: ListBtnsCustCode.DEPOSIT, pro: true },
          <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={depositBtns} />
        )}
        {serviceKeys.includes(activeKey) && customizeBtnGroup(
          { code: ListBtnsCustCode.SERVICE, pro: true },
          <DynamicButtons maxNum={5} defaultBtnType='c7n-pro' buttons={serviceBtns} />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: ListTabsCustCode,
            cascade: true,
          },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            {tabColumns.map(({ key, tab, content, children, defaultActiveKey }) => (
              <TabGroup tab={tab} key={key} defaultActiveKey={defaultActiveKey}>
                {children.map(({ key, tab }) => (
                  <TabPane tab={tab} key={key} count={dsMap[key].getState('totalCount')}>
                    {createElement(content, { key, privateKey: key })}
                  </TabPane>
                ))}
              </TabGroup>
            ))}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const PaymentPlanList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default PaymentPlanList;