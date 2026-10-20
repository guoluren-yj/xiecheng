import React, { useMemo } from 'react';
import withProps from 'utils/withProps';
import { DataSet, NumberField, Button, Tabs, Form, Table } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { flowRight } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import ExcelExportPro from 'components/ExcelExportPro';
import cuxRemote from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';

import { useSingleTabs } from '@/hooks/useTabs';
import c7nModal from '@/utils/c7nModal';
import getTabs from './tab';
import { fetchSetWaring } from './api';
import { affairInfoDS } from './ds';

import styles from './index.less';

const { TabPane } = Tabs;

const getWithProps = withProps(
  () => {
    return {
      tabList: getTabs(),
    };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
);
let defaultTabKey = 'STOCK';
function StockReportWorkbench(props) {
  const { tabList = [], customizeTable, remote } = props;
  const [activeKey, onTabChange, { tabsCount }] = useSingleTabs(
    defaultTabKey,
    { tabList },
    (key) => {
      defaultTabKey = key;
    }
  );

  const getCurrentDataset = () => (tabList.find((f) => f.key === activeKey) || {}).dataSet;
  const getCurrentTab = () => tabList.find((f) => f.key === activeKey) || {};

  // const query = () => {
  //   const ds = getCurrentDataset();
  //   queryTabsCount();
  //   ds.query(ds.currentPage);
  // };

  const setWarningStock = (record) => {
    const ds = getCurrentDataset();
    const dsConfig = remote.process(
      'SSTK_STOCK_REPORT_WORKBENCH_WARNING_STOCK',
      {
        autoCreate: true,
        fields: [
          {
            name: 'warningStock',
            label: intl.get('sstk.stockReportWorkbench.model.maxWaningStock').d('可用库存预警'),
            type: 'number',
            step: 1,
            required: true,
          },
        ],
      },
      { record }
    );
    const waningDs = new DataSet(dsConfig);
    if (record) {
      const warningStock = record.get('warningStock');
      if (warningStock) {
        waningDs.current.init('warningStock', warningStock);
      }
    }
    c7nModal({
      title: intl.get('sstk.stockReportWorkbench.setWarningStock').d('设置预警'),
      style: { width: 380 },
      children: (
        <>
          {remote.render(
            'SSTK_STOCK_REPORT_WORKBENCH_WARNING_AlERT',
            <Alert
              className={styles['waning-help']}
              message={intl
                .get('sstk.stockReportWorkbench.view.stockWaning.helpInfo')
                .d('当前库存数低于预警值时触发库存预警')}
              type="info"
              showIcon
              closable
            />
          )}

          <Form dataSet={waningDs} columns={1} labelLayout="float">
            {remote.render(
              'SSTK_STOCK_REPORT_WORKBENCH_WARNING_STOCK',
              <NumberField name="warningStock" />,
              { waningDs }
            )}
          </Form>
        </>
      ),
      onOk: async () => {
        const flag = await waningDs.validate();
        if (flag) {
          let params = null;
          const form = waningDs.current.toJSONData();
          // 单个
          if (record) {
            params = [
              {
                stockId: record.get('stockId'),
                ...form,
              },
            ];
          } else {
            params = ds.selected.map((r) => ({
              stockId: r.get('stockId'),
              ...form,
            }));
          }
          const res = getResponse(await fetchSetWaring(params));
          if (res) {
            notification.success();
            ds.query(ds.currentPage);
            return true;
          }
        }
        return false;
      },
    });
  };

  const getPara = () => {
    const queryPara = getCurrentDataset().queryDataSet?.current?.toJSONData() || {};
    delete queryPara.__dirty;
    delete queryPara.__id;
    delete queryPara._status;
    return {
      ...queryPara,
      customizeUnitCode: getCurrentTab().customizeUnitCode,
    };
  };

  const openAffairDetailModal = (record) => {
    const ds = new DataSet(
      affairInfoDS({
        queryParams: { stockId: record.get('stockId') },
        dsProps: {
          selection: false,
        },
      })
    );
    const columns = [
      {
        name: 'operationUserName',
        width: 120,
      },
      {
        name: 'operationTime',
        width: 150,
      },
      {
        name: 'transactionTypeMeaning',
        width: 120,
      },
      {
        name: 'operationTypeMeaning',
        width: 120,
      },
      {
        name: 'modifiedNum',
        width: 130,
      },
      {
        name: 'sourceCode',
        width: 150,
      },
      {
        name: 'sourceLineCode',
      },
      {
        name: 'remark',
        width: 200,
      },
    ];
    ds.query();
    c7nModal({
      title: intl.get('sstk.stockReportWorkbench.affairDetail').d('事务明细'),
      style: { width: 1100 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: (
        <Table
          style={{ maxHeight: 'calc(100vh - 200px)' }}
          dataSet={ds}
          columns={columns}
          customizedCode="stock.detail"
        />
      ),
    });
  };

  const getStockColumns = useMemo(
    () => [
      {
        name: 'itemCode',
        width: 130,
      },
      {
        name: 'itemName',
        width: 130,
      },
      {
        name: 'currentStock',
        width: 110,
        renderer: ({ record, value }) => {
          const isWaning = Number(value) <= record.get('warningStock');
          return <span style={{ color: isWaning ? '#E64322' : '#1d2129' }}>{value}</span>;
        },
      },
      {
        name: 'lockedStock',
        width: 100,
      },
      {
        name: 'totalStock',
        width: 100,
      },
      {
        name: 'uomName',
        width: 100,
      },
      // {
      //   name: 'companyNum',
      //   // width: 140,
      // },
      {
        name: 'companyName',
        // width: 140,
      },
      // {
      //   name: 'invOrganizationCode',
      //   // width: 120,
      // },
      {
        name: 'invOrganizationName',
        width: 120,
      },
      // {
      //   name: 'inventoryCode',
      //   // width: 130,
      // },
      {
        name: 'inventoryName',
        width: 130,
      },
      // {
      //   name: 'locationCode',
      //   width: 120,
      // },
      {
        name: 'locationName',
        width: 120,
      },
      {
        name: 'batchNum',
        width: 150,
      },
      {
        name: 'operate',
        width: 120,
        title: intl.get('hzero.common.action').d('操作'),
        renderer: ({ record }) =>
          remote.render(
            'SSTK_STOCK_REPORT_WORKBENCH_OPERATE',
            <>
              <Button funcType="link" onClick={() => setWarningStock(record)}>
                {intl.get('sstk.stockReportWorkbench.setWarningStock').d('设置预警')}
              </Button>
              <Button funcType="link" onClick={() => openAffairDetailModal(record)}>
                {intl.get('sstk.stockReportWorkbench.viewDetail').d('查看明细')}
              </Button>
            </>,
            { record, setWarningStock, openAffairDetailModal }
          ),
      },
    ],
    []
  );

  const getAffairColumns = useMemo(
    () => [
      {
        name: 'transactionCode',
        width: 150,
      },
      {
        name: 'transactionTypeMeaning',
        width: 120,
      },
      {
        name: 'operationTypeMeaning',
        width: 120,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 130,
      },
      {
        name: 'modifiedNum',
        width: 130,
      },
      {
        name: 'uomName',
        width: 110,
      },
      {
        name: 'sourceCode',
        width: 150,
      },
      {
        name: 'sourceLineCode',
      },
      {
        name: 'operationUserName',
        width: 120,
      },
      {
        name: 'operationTime',
        width: 150,
      },
      // {
      //   name: 'companyNum',
      //   width: 120,
      // },
      {
        name: 'companyName',
        width: 150,
      },
      // {
      //   name: 'invOrganizationCode',
      //   width: 120,
      // },
      {
        name: 'invOrganizationName',
        width: 120,
      },
      // {
      //   name: 'inventoryCode',
      //   // width: 130,
      // },
      {
        name: 'inventoryName',
        width: 130,
      },
      // {
      //   name: 'locationCode',
      //   width: 120,
      // },
      {
        name: 'locationName',
        width: 120,
      },
      {
        name: 'batchNum',
        width: 130,
      },
      {
        name: 'remark',
        width: 200,
      },
    ],
    []
  );

  const buttons = [
    {
      show: activeKey === 'STOCK',
      key: 'batchSetWarningStock',
      btnType: 'c7n-pro',
      child: intl.get('sstk.stockReportWorkbench.batchSetWarningStock').d('批量设置预警'),
      btnProps: {
        color: 'primary',
        onClick: () => setWarningStock(null),
      },
      observerBtnProps: () => ({
        disabled: getCurrentDataset().selected.length === 0,
      }),
    },
    {
      show: activeKey === 'STOCK',
      key: 'newStockExport',
      btnType: 'c7n-pro',
      btnComp: ExcelExportPro,
      child: intl.get('sstk.common.button.exportNew').d('(新)导出'),
      btnProps: {
        templateCode: 'STCK_STOCK_EXPORT',
        requestUrl: `/stck/v1/${getCurrentOrganizationId()}/stocks/export`,
        queryParams: () => getPara(),
        exportAsync: true,
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
          permissionList: [
            {
              code: `sta.srm.mall.stock.stock_manage.repot.button.stock.export-new`,
              type: 'button',
              meaning: '导出权限',
            },
          ],
        },
      },
    },
    {
      show: activeKey === 'AFFAIR',
      key: 'newAffairExport',
      btnType: 'c7n-pro',
      btnComp: ExcelExportPro,
      child: intl.get('sstk.common.button.exportNew').d('(新)导出'),
      btnProps: {
        templateCode: 'STCK_STOCK_TRANSACTION_EXPORT',
        requestUrl: `/stck/v1/${getCurrentOrganizationId()}/stock-transactions/export`,
        queryParams: () => getPara(),
        exportAsync: true,
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
          permissionList: [
            {
              code: `sta.srm.mall.stock.stock_manage.repot.button.affair.export-new`,
              type: 'button',
              meaning: '导出权限',
            },
          ],
        },
      },
    },
  ].filter((button) => button.show);

  const cuxButtons = remote.process('SSTK_STOCK_REPORT_WORKBENCH_BUTTONS', buttons, {
    buttons,
    activeKey,
    ds: getCurrentDataset(),
  });

  return (
    <>
      <Header title={intl.get('sstk.stockReportWorkbench.view.title').d('库存报表工作台')}>
        <DynamicButtons buttons={cuxButtons} />
      </Header>
      <Content>
        <Tabs
          defaultActiveKey={defaultTabKey}
          activeKey={activeKey}
          onChange={onTabChange}
          customizable
          customizedCode="SSTK.STOCK_REPORT_WORKBENCH.tabs"
        >
          {tabList.map((m) => {
            const { tab, key, dataSet } = m;
            const cuxTableProps = remote.process(
              `SSTK_STOCK_REPORT_WORKBENCH_${key}_TABLE_PROPS`,
              {},
              { dataSet, tab, key }
            );
            return (
              <TabPane tab={tab} key={key} count={tabsCount[key]}>
                <div style={{ height: 'calc(100vh - 245px)' }}>
                  {remote.render(`SSTK_STOCK_REPORT_WORKBENCH_${key}_TABLE_RENDER`, null, {
                    dataSet,
                    tab,
                    key,
                  })}
                  {customizeTable(
                    {
                      code:
                        activeKey === 'STOCK'
                          ? 'SSTK.STOCK_REPORT_WORKBENCH.STOCK.LIST'
                          : 'SSTK.STOCK_REPORT_WORKBENCH.AFFAIR.LIST',
                    },
                    <SearchBarTable
                      style={{ maxHeight: 'calc(100% - 22px)' }}
                      dataSet={dataSet}
                      columns={key === 'STOCK' ? getStockColumns : getAffairColumns}
                      searchCode={m.searchBarCode}
                      customizedCode={m.tableCode}
                      cacheState
                      {...cuxTableProps}
                    />
                  )}
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      </Content>
    </>
  );
}

export default flowRight(
  withCustomize({
    unitCode: ['SSTK.STOCK_REPORT_WORKBENCH.STOCK.LIST', 'SSTK.STOCK_REPORT_WORKBENCH.AFFAIR.LIST'],
  }),
  formatterCollections({
    code: ['hzero.common', 'sstk.stockReportWorkbench', 'sstk.common'],
  }),
  getWithProps,
  cuxRemote({
    code: 'STOCK_REPORT_WORKBENCH',
    name: 'remote',
  })
)(StockReportWorkbench);
