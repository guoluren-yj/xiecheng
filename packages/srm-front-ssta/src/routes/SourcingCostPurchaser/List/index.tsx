import React, { Fragment, useContext, useMemo, createElement, useRef } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import TenderTable from './TenderTable';
import DepositTable from './DepositTable';
import ServiceTable from './ServiceTable';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import { formatDynamicBtns } from '../../../utils/utils';
import { ActiveKey, ListTabsCustCode, ListBtnsCustCode, TenderListGridCustCode, TenderSearchCustCode } from '../utils/type';
import { transformSupplierData } from '../../../utils/utils';

const { TabPane, TabGroup } = Tabs;

const List = observer(() => {
  const {
    dsMap,
    remote,
    activeKey,
    tenderKeys,
    depositKeys,
    serviceKeys,
    searchBarRefMap,
    handleTabChange,
    customizeTabPane,
    customizeBtnGroup,
    handleReQuery,
  } = useContext<StoreValueType>(Store);

  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const loading = tableDs.status !== 'loading';

  const tabColumns = useMemo(() => {
    let tabs = [
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
          {
            key: ActiveKey.ServicePay,
            tab: intl.get(`ssta.sourcingCost.view.title.payable`).d('可缴纳'),
          },
          {
            key: ActiveKey.ServiceInv,
            tab: intl.get(`ssta.sourcingCost.view.title.invoicable`).d('可开票'),
          },
          {
            key: ActiveKey.ServiceAll,
            tab: intl.get(`ssta.sourcingCost.view.title.all`).d('全部'),
          },
        ],
      },
    ];

    tabs = remote ? remote.process('SSTA.SOURCING_COST_PUR_CUX.TAB_COLUMNS', tabs, {
      dsMap,
      activeKey,
    }) : tabs;
    tabs = tabs || [];
    return tabs;
  }, []);

  // 获取导出参数
  const getExportParams = () => {
    const { queryDataSet } = tableDs;
    const { current } = queryDataSet || {};
    const params = current ? current.toData() : {};
    const { supplierLovKey, ...otherParams } = params;
    return {
      ...otherParams,
      ...transformSupplierData(supplierLovKey),
      customizeUnitCode: `${TenderListGridCustCode[activeKey]},${TenderSearchCustCode[activeKey]}`
    }
  }

  const tenderBtns = useMemo(() => {
    const normalBtns = [{
      name: 'exportTender',
      btnComp: ExcelExportPro,
      btnProps: {
        allBody: true,
        method: 'POST',
        hidden: activeKey !== 'tender-all',
        templateCode: 'SRM_C_SRM_SDEP_TENDER_FEES_PURCHASER_PAGE_EXCEL',
        name: 'exportTender',
        requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/tender-feess/purchaser/page-all/excel`,
        buttonText: intl.get(`hzero.common.button.export`).d('导出'),
        queryParams: getExportParams(),
        otherButtonProps: {
          funcType: 'flat',
          permissionList: [
            {
              code:
                'srm.settle-account.purchaser-sourcing-cost.button.tender-export',
              type: 'button',
              meaning: `${intl.get(`ssta.sourcingCost.view.title.tenderFileFee`).d('招标文件费') -
                intl.get(`hzero.common.button.export`).d('导出')
                }`,
            },
          ],
        },
      },
    }];
    const otherProps = { dsMap, tableDs, activeKey, loading, searchBarRefMap, handleReQuery, handleTabChange };
    const processBtns = remote
      ? remote.process('SSTA.SOURCING_COST_PUR_CUX.TENDER_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [remote, tableDs, activeKey, loading, tableDs?.selected?.length]);

  const depositBtns = useMemo(() => {
    const normalBtns = [
      {
        name: 'exportDeposit',
        btnComp: ExcelExportPro,
        btnProps: {
          allBody: true,
          method: 'POST',
          hidden: activeKey !== 'deposit-all',
          templateCode: 'SRM_C_SRM_SDEP_DEPOSIT_PURCHASER_PAGE_EXCEL',
          name: 'exportDeposit',
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/deposits/purchaser/page-all/excel`,
          buttonText: intl.get(`hzero.common.button.export`).d('导出'),
          queryParams: getExportParams(),
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [
              {
                code:
                  'srm.settle-account.purchaser-sourcing-cost.button.deposit-export',
                type: 'button',
                meaning: `${intl.get(`ssta.sourcingCost.view.title.securityDeposit`).d('保证金') -
                  intl.get(`hzero.common.button.export`).d('导出')
                  }`,
              },
            ],
          },
        },
      }
    ];
    const otherProps = { dsMap, tableDs, activeKey, loading, searchBarRefMap, handleReQuery, handleTabChange };
    const processBtns = remote
      ? remote.process('SSTA.SOURCING_COST_PUR_CUX.DEPOSIT_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [remote, tableDs, activeKey, loading, tableDs?.selected?.length]);

  const serviceBtns = useMemo(() => {
    const normalBtns = [
      {
        name: 'exportService',
        btnComp: ExcelExportPro,
        btnProps: {
          allBody: true,
          method: 'POST',
          hidden: activeKey !== 'service-all',
          templateCode: 'SRM_C_SRM_SDEP_SERVER_FEES_PURCHASER_PAGE_EXCEL',
          name: 'exportService',
          requestUrl: `/ssta/v1/${getCurrentOrganizationId()}/server-feess/purchaser/page-all/excel`,
          buttonText: intl.get(`hzero.common.button.export`).d('导出'),
          queryParams: getExportParams(),
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [
              {
                code:
                  'srm.settle-account.purchaser-sourcing-cost.button.service-export',
                type: 'button',
                meaning: `${intl.get(`ssta.sourcingCost.view.title.serviceFee`).d('服务费') -
                  intl.get(`hzero.common.button.export`).d('导出')
                  }`,
              },
            ],
          },
        },
      }
    ];
    const otherProps = { dsMap, tableDs, activeKey, loading, searchBarRefMap, handleReQuery, handleTabChange };
    const processBtns = remote
      ? remote.process('SSTA.SOURCING_COST_PUR_CUX.SERVICE_BTNS', normalBtns, otherProps)
      : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [remote, tableDs, activeKey, loading]);

  return (
    <Fragment>
      <Header title={intl.get('ssta.sourcingCost.view.title.purSourcingCostWorkbench').d('采购方寻源费用工作台')}>
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
            {Array.isArray(tabColumns) && (tabColumns as any[])?.map(({ key, tab, content, children, defaultActiveKey }) => {
              if (!key) {
                return "";
              }

              return (
                <TabGroup tab={tab} key={key} defaultActiveKey={defaultActiveKey}>
                  {children.map(({ key, tab }) => {
                    const contentDom = createElement(content, { key, privateKey: key });
                    const tabContent = remote ? remote.process('SSTA.SOURCING_COST_PUR_CUX.TAB_CONTENT', contentDom, {
                      dsMap,
                      activeKey,
                      key,
                      tab,
                      tabColumns,
                      children,
                    }) : contentDom;

                    return (
                      <TabPane tab={tab} key={key} count={dsMap[key].getState('totalCount')}>
                        {tabContent}
                      </TabPane>
                    );
                  })}
                </TabGroup>
              );
            })}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const PaymentPlanList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default PaymentPlanList;
