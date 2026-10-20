import React, { Fragment, useContext, useMemo, useState, useCallback } from 'react';
// import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';
// import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
// import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import queryString from 'querystring';
// import { getResponse } from 'utils/utils'; // , filterNullValueObject, getCurrentOrganizationId
// import { isArray, unionBy } from 'lodash';

import StoreProvider, { Store } from './store';
// import WholeTable from './components/TableList';
import InvoiceTableList from './components/InvoiceTableList';
import { formatDynamicBtns } from '../../../utils/utils';
import { ActiveKey, ListBtnsCustCode, ListTabsCustCode } from './utils/type';
// import { deleteInvoice, directInvoice } from '../../../services/directPoolSupplyService';
// import { transformSupplierData } from '../../../utils/utils';

const { TabPane, TabGroup } = Tabs;

const prefix = 'ssta.directPoolSupply';
// const detailExportModelCode = {
//     a: 'SDIM_POOL_SUPPLIER_ALL_EXPORT',
//     b: 'SDIM_POOL_SUPPLIER_INVOICE_EXPORT',
//     c: 'SDIM_POOL_SUPPLIER_INVOICED_EXPORT',
//     d: 'SDIM_POOL_ERROR_SUPPLIER_EXPORT',
//   };

const List = observer(() => {
  const {
    dsMap,
    cacheState,
    permissionMap,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
    history,
  } = useContext(Store);
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const { selected } = currentListDs;
  const loading = currentListDs.status !== 'ready';

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


  // const wholePaneList = useMemo(() => {
  //   return [
  //     {
  //       key: ActiveKey.B,
  //       tab: intl.get(`${prefix}.view.button.billing`).d('待开票'),
  //     },
  //     {
  //       key: ActiveKey.C,
  //       tab: intl.get(`${prefix}.view.button.billed`).d('已开票'),
  //     },
  //     {
  //       key: ActiveKey.D,
  //       tab: intl.get(`${prefix}.view.button.dustbin`).d('垃圾箱'),
  //     },
  //     {
  //       key: ActiveKey.A,
  //       tab: intl.get(`${prefix}.view.button.all`).d('全部'),
  //     },
  //   ];
  // }, []);

  const detailPaneList = useMemo(() => {
    return [
      {
        key: ActiveKey.InvoicePending,
        tab: intl.get(`${prefix}.view.button.pending`).d('待处理'),
      },
      {
        key: ActiveKey.InvoiceAll,
        tab: intl.get(`${prefix}.view.button.all`).d('全部'),
      },
    ];
  }, []);

  // const handleToInvoiceDetail = (applyHeaderList) => {
  //   history.push({
  //     pathname: '/ssta/direct-pool-supply/detail',
  //     search: queryString.stringify({ applyHeaderList }),
  //   });
  // };

  // 直连开票
  // const handleDirectInvoice = async () => {
  //   const datas = selected.map((record) => record.toData());
  //   const res = getResponse(await directInvoice(datas));
  //   if (res) {
  //     // 进入开票申请单
  //     const refDocNumList = res.reduce((prev, item) => {
  //       const { refDocNumListStr = '[]' } = item;
  //       let refDocNums = [];
  //       try {
  //         refDocNums = JSON.parse(refDocNumListStr);
  //         if (!isArray(refDocNums)) {
  //           refDocNums = [];
  //         }
  //       } catch (e) {
  //         refDocNums = [];
  //       }
  //       return prev.concat(refDocNums);
  //     }, []);
  //     const applyHeaderList = unionBy(refDocNumList, 'applyHeaderId');
  //     handleToInvoiceDetail({ applyHeaderList: JSON.stringify(applyHeaderList) });
  //     await currentListDs.query();
  //     fetchTabKeysCount(activeKey);
  //   }
  // };

  // 放弃开票
  // const handleAbandonInvoice = async () => {
  //   const datas = selected.map((record) => record.toData());
  //   const res = getResponse(await deleteInvoice(datas));
  //   if (res) {
  //     notification.success({});
  //     fetchTabKeysCount(activeKey);
  //     await currentListDs.query();
  //     currentListDs.clearCachedSelected();
  //   }
  // };

  // const requestUrl = () => {
  //   switch (activeKey) {
  //     case ActiveKey.A:
  //       return `/ssta/v1/${getCurrentOrganizationId()}/direct-pools/excel-export/all`;
  //     case ActiveKey.B:
  //       return `/ssta/v1/${getCurrentOrganizationId()}/direct-pools/excel-export/invoice`;
  //     case ActiveKey.C:
  //       return `/ssta/v1/${getCurrentOrganizationId()}/direct-pools/excel-export/invoiced`;
  //     case ActiveKey.D:
  //       return `/ssta/v1/${getCurrentOrganizationId()}/direct-pool-errors/excel-export`;
  //     default:
  //       return `/ssta/v1/${getCurrentOrganizationId()}/direct-pools/excel-export/all`;
  //   }
  // };

  // const getQueryParams = useCallback(() => {
  //   const idList = selected.map((item) => item.key);
  //   const queryData = queryDataSet?.current?.toData() || {};
  //   const { primaryKey } = currentListDs.props;
  //   if (selected.length > 0) {
  //     return filterNullValueObject({ [`${primaryKey}s`]: idList });
  //   } else {
  //     return filterNullValueObject({
  //       ...queryData,
  //       exportSearchbarUnitCode: currentListDs.getQueryParameter('customizeUnitCode'),
  //       ...transformSupplierData(queryData.supplierCompanyId),
  //   });
  //   }
  // }, [currentListDs, selected, queryDataSet]);

  const buttons = useMemo(() => {
    const btns = [
        permissionMap?.get(`create`) &&
        [ActiveKey.A].includes(activeKey) && {
          name: 'create',
          child: intl.get(`ssta.common.button.createInvoicing`).d('新建开票申请单'),
          btnProps: {
            icon: 'add',
            onClick: () =>
              history.push({
                pathname: '/ssta/direct-pool-supply/create',
                search: queryString.stringify({ type: 'CREATE' }),
              }),
          },
        },
        // permissionMap?.get(`direct`) &&
        // [ActiveKey.B].includes(activeKey) && {
        //   name: 'direct',
        //   child: intl.get(`ssta.common.button.directInvoicing`).d('直连开票'),
        //   btnProps: {
        //     icon: 'check',
        //     disabled: selected && selected.length === 0,
        //     onClick: handleDirectInvoice,
        //     loading,
        //   },
        // },
        // permissionMap?.get(`cancel`) &&
        // [ActiveKey.B, ActiveKey.D].includes(activeKey) && {
        //   name: 'abandon',
        //   child: intl.get(`ssta.common.button.abandonInvoicing`).d('放弃开票'),
        //   btnProps: {
        //     icon: 'cancel',
        //     disabled: selected && selected.length === 0,
        //     onClick: handleAbandonInvoice,
        //     loading,
        //   },
        // },
      //   permissionMap?.get(`export`) && [ActiveKey.A, ActiveKey.B, ActiveKey.C, ActiveKey.D].includes(activeKey) && {
      //       name: 'exports',
      //       btnComp: ExcelExportPro,
      //       childFor: 'buttonText',
      //       child:
      //       selected.length === 0
      //           ? intl.get('ssta.costSheet.button.export').d('导出')
      //           : intl.get('ssta.costSheet.button.tickExport').d('勾选导出'),
      //       btnProps: {
      //       method: 'POST',
      //       otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
      //       requestUrl: requestUrl(),
      //       queryParams: getQueryParams(),
      //       templateCode: detailExportModelCode[activeKey],
      //   },
      // },
    ];
    return formatDynamicBtns(btns);
  }, [loading, selected, permissionMap, activeKey]);

  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.title.directPoolSupply`).d('销售方待开票池')}>
        {customizeBtnGroup(
          { code: ListBtnsCustCode, pro: true },
          <DynamicButtons defaultBtnType="c7n-pro" maxNum={5} buttons={buttons} />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          { code: ListTabsCustCode, cascade: true },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            <TabGroup tab={intl.get(`${prefix}.view.button.invoiceDoc`).d('开票申请单')} key="detail">
              {detailPaneList.map(({ key, tab }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={dsMap[key].getState('totalCount')}
                >
                  <InvoiceTableList activeKey={key} />
                </TabPane>
              ))}
            </TabGroup>
            {/* <TabGroup tab={intl.get(`${prefix}.view.button.invoiceAffair`).d('开票事务')} key="whole">
              {wholePaneList.map(({ key, tab }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={dsMap[key].getState('totalCount')}
                >
                  <WholeTable activeKey={key} />
                </TabPane>
              ))}
            </TabGroup> */}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const DirectPoolSupplyList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default DirectPoolSupplyList;
