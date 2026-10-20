import React from 'react';
import { DataSet, Table, Tabs, Modal } from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';
import intl from 'utils/intl';
import { compose } from 'lodash';
import queryString from 'querystring';
import ExcelExport from '@/components/ExcelExport';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { tableDs, reconDs, invoiceDs, payDs, prepaymentDs } from './settlementKanbanDS';
import { searchHeaderInfo } from '../../services/settlePoolServices';
import Record from '../SupplySettlePool/Record';
import { hxDS } from '@/routes/pubDS/hxDS';
import { amountLocalRender, findMenuName, getResponse, transformSupplierData } from '@/utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { getSettleReport } from '@/services/kanbanService';
import '../SupplySettlePool/index.less';

const tenantId = getCurrentOrganizationId();

const prefix = 'ssta.supplySettlementKanban';
const uxFlag = findMenuName('srm.settle-account.reconciliation-workbench.ux-supplier');
const uxFlagSettle = findMenuName('srm.settle-account.jsd.ux-supply');
const { TabPane } = Tabs;

const SettlementKanban = (props) => {
  const { history, customizeTable } = props;
  const dsWriter = (ds) => {
    return new DataSet({
      ...ds(),
      events: {
        select: () => handleSelect(),
        unSelect: () => handleSelect(),
        selectAll: () => handleSelect(),
        unSelectAll: () => handleSelect(),
      },
    });
  };
  const tableDS = React.useMemo(() => dsWriter(tableDs), []);
  const reconDS = React.useMemo(() => new DataSet(reconDs()), []);
  const invoiceDS = React.useMemo(() => new DataSet(invoiceDs()), []);
  const payDS = React.useMemo(() => new DataSet(payDs()), []);
  const prepaymentDS = React.useMemo(() => new DataSet(prepaymentDs()), []);

  const [iconShow, setIconShow] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [currentKey, setActiveKey] = React.useState('BILL');
  const [ids, setIds] = React.useState(null);
  const [lineVal, setLineVal] = React.useState(null);
  const [recordCount, setRecordCount] = React.useState({});
  const [queryData, setQueryData] = React.useState({});

  const searchBarRef = React.useRef({});

  const hxDs = React.useMemo(
    () =>
      new DataSet(
        hxDS({
          url: `/ssta/v1/${getCurrentOrganizationId()}/pre-payment-lines/write/off/record/`,
          pk: 'prepaymentLineId',
          urlPramas: true,
        })
      ),
    []
  );

  // 核销记录
  const handleViewDetail = (record) => {
    const { documentLineId } = record.data;
    hxDs.setQueryParameter('prepaymentLineId', documentLineId);
    hxDs.query();

    const hxColumns = [
      {
        name: 'settleTransactionNum', // 结算事务编号
        width: 150,
      },
      {
        name: 'settleNum', // 关联结算单号
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'settleStatusMeaning', // 关联结算单号
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'lineNum', // 关联结算行号
        width: 100,
      },
      {
        name: 'applyAmount', //  核销金额
        width: 120,
        tooltip: 'overflow',
        renderer: amountLocalRender,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('ssta.common.view.title.writeOffRecord').d('核销记录'),
      style: {
        width: 680,
      },
      children: <Table dataSet={hxDs} columns={hxColumns} />,
      onOk: () => {},
      onCancel: () => {},
    });
  };

  const columns = [
    { name: 'dimensionMeaning' },
    { name: 'documentNum', width: 160 },
    { name: 'documentLineNum', width: 160 },
    { name: 'netAmount', width: 160 },
    { name: 'taxAmount', width: 160 },
    { name: 'taxIncludedAmount', width: 160 },
    { name: 'companyName', width: 200 },
    { name: 'displaySupplierName', width: 200 },
    { name: 'currencyCode' },
    { name: 'billOccupiedNetAmount', width: 160 },
    { name: 'billOccupiedTaxAmount', width: 160 },
    { name: 'billOccupiedAmount', width: 160 },
    { name: 'billCompletedNetAmount', width: 160 },
    { name: 'billCompletedTaxAmount', width: 160 },
    { name: 'billCompletedAmount', width: 160 },
    { name: 'invoiceOccupiedNetAmount', width: 160 },
    { name: 'invoiceOccupiedTaxAmount', width: 160 },
    { name: 'invoiceOccupiedAmount', width: 160 },
    { name: 'invoiceCompletedNetAmount', width: 160 },
    { name: 'invoiceCompletedTaxAmount', width: 160 },
    { name: 'invoiceCompletedAmount', width: 160 },
    { name: 'paymentOccupiedAmount', width: 160 },
    { name: 'paymentCompletedAmount', width: 160 },
    { name: 'applyOccupiedAmount', width: 160 },
    { name: 'applyCompletedAmount', width: 160 },
    { name: 'prepaymentOccupiedAmount', width: 160 },
    { name: 'prepaymentCompletedAmount', width: 200 },
    {
      name: 'operation',
      width: 120,
      lock: 'right',
      renderer: ({ record }) => (
        <a onClick={() => handleView({ ...record.toData(), key: 'BILL' })}>
          {intl.get('hzero.common.button.details').d('查看详情')}
        </a>
      ),
    },
  ];

  const reconColumns = [
    { width: 200, name: 'documentAndLineNum' },
    { width: 200, name: 'settleNum' },
    { width: 200, name: 'quantity' },
    { width: 200, name: 'netPrice' },
    { width: 200, name: 'unitPriceBatch' },
    { width: 200, name: 'netAmount' },
    { width: 200, name: 'taxRate' },
    { width: 200, name: 'taxAmount' },
    { width: 200, name: 'taxIncludedPrice' },
    { width: 200, name: 'taxIncludedAmount' },
    { width: 200, name: 'recordStatusMeaning' },
    { width: 200, name: 'recordDate' },
    { width: 200, name: 'recordSource' },
    { width: 200, name: 'companyName' },
    { width: 200, name: 'supplierCompanyName' },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      width: 80,
      lock: 'right',
      renderer: ({ record }) => {
        if (record.get('autoGenerateFlag') === 0) {
          return (
            <a
              onClick={() => {
                handleDetail(record, 'BILL');
              }}
            >
              {intl.get('hzero.common.button.details').d('查看详情')}
            </a>
          );
        }
      },
    },
  ];
  const invoiceColumns = [
    { width: 200, name: 'documentAndLineNum' },
    { width: 200, name: 'settleNum' },
    { width: 200, name: 'quantity' },
    { width: 200, name: 'netPrice' },
    { width: 200, name: 'unitPriceBatch' },
    { width: 200, name: 'netAmount' },
    { width: 200, name: 'taxRate' },
    { width: 200, name: 'taxAmount' },
    { width: 200, name: 'taxIncludedPrice' },
    { width: 200, name: 'taxIncludedAmount' },
    { width: 200, name: 'recordStatusMeaning' },
    { width: 200, name: 'recordDate' },
    { width: 200, name: 'recordSource' },
    { width: 200, name: 'companyName' },
    { width: 200, name: 'supplierCompanyName' },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      width: 80,
      lock: 'right',
      renderer: ({ record }) => {
        if (record.get('autoGenerateFlag') === 0) {
          return (
            <a
              onClick={() => {
                handleDetail(record, 'INVOICE');
              }}
            >
              {intl.get('hzero.common.button.details').d('查看详情')}
            </a>
          );
        }
      },
    },
  ];
  const payColumns = [
    {
      width: 200,
      name: 'documentNum',
      renderer: ({ record, value }) => {
        return (
          <a
            onClick={() => {
              handleRecord(record);
            }}
          >
            {value}
          </a>
        );
      },
    },
    { width: 200, name: 'settleNum' },
    { width: 200, name: 'paymentTypeMeaning' },
    { width: 200, name: 'paymentAmount' },
    { width: 200, name: 'recordStatusMeaning' },
    { width: 200, name: 'recordDate' },
    { width: 200, name: 'recordSource' },
    { width: 200, name: 'companyName' },
    { width: 200, name: 'supplierCompanyName' },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      width: 80,
      lock: 'right',
      renderer: ({ record }) => {
        if (record.get('autoGenerateFlag') === 0) {
          return (
            <a
              onClick={() => {
                handleDetail(record, 'PAYMENT');
              }}
            >
              {intl.get('hzero.common.button.details').d('查看详情')}
            </a>
          );
        }
      },
    },
  ];
  const prepaymentColumns = [
    { name: 'documentAndLineNum' },
    { name: 'prepaymentAmount' },
    { name: 'documentStatusMeaning' },
    { name: 'associateNum' },
    { name: 'associateAmount' },
    { name: 'prepaymentApplyAmount' },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      lock: 'right',
      renderer: ({ record }) => {
        return (
          <span>
            <a onClick={() => handleDetail(record, 'PREPAYMEN')}>
              {intl.get('hzero.common.button.details').d('查看详情')}
            </a>
            &nbsp;&nbsp;&nbsp;
            <a onClick={() => handleViewDetail(record)}>
              {intl.get('ssta.common.view.title.writeOffRecord').d('核销记录')}
            </a>
          </span>
        );
      },
    },
  ];

  // tabs切换
  const handleTabChange = (activeKey) => {
    setActiveKey(activeKey);
    handleView({ key: activeKey, lineFlag: true });
  };

  const handleView = async (record) => {
    const { key, lineFlag } = record;
    setIconShow(true);
    setShow(true);
    const lineObj = lineFlag ? lineVal : record;
    const params = {
      dimension: lineObj.dimension,
      supplierCompanyId: lineObj.supplierCompanyId,
      supplierId: lineObj.supplierId,
      currencyCode: lineObj.currencyCode,
      documentNum: lineObj.documentNum,
      documentLineNum: lineObj.documentLineNum,
      companyId: lineObj.companyId,
    };
    if (!lineFlag) {
      setActiveKey('BILL');
      setLineVal(record);
    }
    const res = await getSettleReport(params);
    setRecordCount(res);
    switch (key) {
      case 'BILL':
        reconDS.setQueryParameter('val', params);
        reconDS.query();
        break;
      case 'INVOICE':
        invoiceDS.setQueryParameter('val', params);
        invoiceDS.query();
        break;
      case 'PAYMENT':
        payDS.setQueryParameter('val', params);
        payDS.query();
        break;
      case 'PREPAYMEN':
        prepaymentDS.setQueryParameter('val', params);
        prepaymentDS.query();
        break;
      default:
        break;
    }
  };
  const handleDetail = async (record, keys) => {
    const headerId = record.get('documentId');
    const num = record.get('documentNum');
    const res = getResponse(await searchHeaderInfo({ settleHeaderNum: num }));
    if (!res || !res?.documentType) return;
    const { documentType } = res;
    switch (keys) {
      case 'BILL':
        history.push({
          pathname: uxFlag
            ? '/ssta/new-reconciliation-workbench-supplier/detail'
            : '/ssta/reconciliation-workbench-supplier/detail',
          search: queryString.stringify({
            editFlag: 0,
            billList: JSON.stringify([{ billNum: num, billHeaderId: headerId }]),
          }),
        });
        break;
      case 'PREPAYMEN':
        history.push({
          pathname: uxFlagSettle
            ? '/ssta/new-supply-settle/pre-payment'
            : '/ssta/supply-settle/pre-payment',
          search: queryString.stringify({
            source: 'detail',
            settleHeaderId: headerId,
            documentType,
            type: 'ALL',
          }),
        });
        break;
      default:
        if (uxFlagSettle) {
          history.push({
            pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${headerId}`,
            search: queryString.stringify({
              source: 'kanban',
              type: 'view',
            }),
          });
        } else {
          history.push({
            pathname: '/ssta/supply-settle/detail',
            search: queryString.stringify({
              source: 'detail',
              type: 'ALL',
              documentType,
              settleHeaderId: headerId,
            }),
          });
        }
        // source: 'detail',
        // settleHeaderId: record.settleHeaderId,
        // documentType: record.documentType,
        // type: 'ALL',
        break;
    }
  };
  const handleRecord = (record) => {
    Modal.open({
      title: intl.get(`${prefix}.view.title.payinfo`).d('付款明细信息'),
      closable: true,
      footer: null,
      style: { width: 1300 },
      children: <Record settleRecordId={record.get('settleRecordId')} />,
    });
  };

  //  监控勾选
  const handleSelect = () => {
    const selected = tableDS.selected.map((item) => item.toData().dimensionKey).join(',');
    setIds(selected);
  };

  const handleFieldChange = () => {
    setIds(null);
    setIconShow(false);
    setShow(false);
  };

  const queryParams = {
    dimensionKeyList: ids,
    dimensionList: 'ORDER',
    ...queryData,
  };
  return (
    <React.Fragment>
      <Header
        title={intl
          .get(`${prefix}.view.message.title.purchaseSettlementKanbans`)
          .d('销售方结算看板')}
      >
        <ExcelExport
          otherButtonProps={{ icon: 'export' }}
          requestUrl={`/ssta/v1/${getCurrentOrganizationId()}/settle-report/supplier/report-page/export`}
          queryParams={filterNullValueObject(queryParams)}
        />
      </Header>
      <Content>
        {customizeTable(
          {
            code: 'SSTA.SUPPLY_SETTLEMENT_KANBAN.GRID',
          },
          <SearchBarTable
            cacheState
            searchBarRef={(ref) => {
              searchBarRef.current = ref;
            }}
            searchCode="SSTA.SUPPLY_SETTLEMENT_KANBAN.SEARCH_BAR"
            columns={columns}
            dataSet={tableDS}
            searchBarConfig={{
              fieldProps: {
                supplierCompanyId: { lovPara: { tenantId } },
              },
              onFieldChange: handleFieldChange,
              onQuery: ({ params }) => {
                const { supplierCompanyId } = params || {};
                setQueryData({ ...params, ...transformSupplierData(supplierCompanyId) });
                tableDS.setQueryParameter('data', params);
                tableDS.query();
              },
            }}
          />
        )}
        <div className="settle-pool-tabs">
          {iconShow && (
            <div className={show ? 'settle-anchor-wrapper' : 'no-wrapper'}>
              <div
                className="settle-anchor"
                style={{ marginRight: 120 }}
                onClick={() => setShow(!show)}
              >
                <Icon className="settle-anchor-icon" type={show ? 'caret-down' : 'caret-up'} />
              </div>
            </div>
          )}
          <br />
          {show && (
            <div>
              <hr
                style={{
                  height: 1,
                  border: 'none',
                  backgroundColor: '#EBEBEB',
                  boxShadow: '0 -2px 4px 0 rgba(0,0,0,0.10)',
                }}
              />
              <Tabs activeKey={currentKey} animated onChange={handleTabChange}>
                <TabPane
                  tab={
                    <span>
                      {intl.get(`${prefix}.view.title.bill`).d('对账记录')}
                      {recordCount?.billRecordCount >= 99 ? '99+' : recordCount?.billRecordCount}
                    </span>
                  }
                  key="BILL"
                >
                  <div style={{ height: '100%' }}>
                    <div style={{ height: '100%' }}>
                      {customizeTable(
                        {
                          code: 'SSTA.SUPPLY_KANBAN_RECORD.BILL_GRID',
                        },
                        <Table columns={reconColumns} dataSet={reconDS} queryBar="none" />
                      )}
                    </div>
                  </div>
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      {intl.get(`${prefix}.view.title.invoice`).d('开票记录')}
                      {recordCount?.invoiceRecordCount >= 99
                        ? '99+'
                        : recordCount?.invoiceRecordCount}
                    </span>
                  }
                  key="INVOICE"
                >
                  <div style={{ height: '100%' }}>
                    <div style={{ height: '100%' }}>
                      {customizeTable(
                        {
                          code: 'SSTA.SUPPLY_KANBAN_RECORD.INVOICE_GRID',
                        },
                        <Table columns={invoiceColumns} dataSet={invoiceDS} queryBar="none" />
                      )}
                    </div>
                  </div>
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      {intl.get(`${prefix}.view.title.payment`).d('付款记录')}
                      {recordCount?.paymentRecordCount >= 99
                        ? '99+'
                        : recordCount?.paymentRecordCount}
                    </span>
                  }
                  key="PAYMENT"
                >
                  <div style={{ height: '100%' }}>
                    <div style={{ height: '100%' }}>
                      {customizeTable(
                        {
                          code: 'SSTA.SUPPLY_KANBAN_RECORD.PAYMENT_GRID',
                        },
                        <Table columns={payColumns} dataSet={payDS} queryBar="none" />
                      )}
                    </div>
                  </div>
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      {intl.get(`${prefix}.view.title.payments`).d('预付款记录')}
                      {recordCount?.prepaymentRecordCount >= 99
                        ? '99+'
                        : recordCount?.prepaymentRecordCount}
                    </span>
                  }
                  key="PREPAYMEN"
                >
                  <div style={{ height: '100%' }}>
                    <div style={{ height: '100%' }}>
                      {customizeTable(
                        {
                          code: 'SSTA.SUPPLY_KANBAN_RECORD.PREPAYMEN_GRID',
                        },
                        <Table columns={prepaymentColumns} dataSet={prepaymentDS} queryBar="none" />
                      )}
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          )}
        </div>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['ssta.supplySettlementKanban', 'hzero.common', 'hzero.c7nProUI', 'hzero.c7nProU'],
  }),
  withCustomize({
    unitCode: [
      'SSTA.SUPPLY_SETTLEMENT_KANBAN.SEARCH_BAR',
      'SSTA.SUPPLY_SETTLEMENT_KANBAN.GRID',
      'SSTA.SUPPLY_KANBAN_RECORD.BILL_GRID',
      'SSTA.SUPPLY_KANBAN_RECORD.INVOICE_GRID',
      'SSTA.SUPPLY_KANBAN_RECORD.PAYMENT_GRID',
      'SSTA.SUPPLY_KANBAN_RECORD.PREPAYMEN_GRID',
    ],
  })
)(SettlementKanban);
