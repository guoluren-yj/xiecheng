import React from 'react';
import { Form, Output, DataSet, Spin, Table, Modal } from 'choerodon-ui/pro';
import { Tabs, Card, Radio, Tag } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import queryString from 'querystring';
import { amountRender, numberRender, findMenuName, getResponse } from '@/utils/utils';
import { getBillLineDetail } from '@/services/reconciliationWorkbenchService';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';
import ImplementForm from '@/routes/Components/ImplementForm';
import { statusTagRender } from '@/utils/renderer';
import { FormItem } from '@/routes/Components';
import { searchHeaderInfo } from '../../services/settlePoolServices';
import { formDs, strategyDs } from './mainDS';
import Record from '../PurchaseSettlePool/Record';
import { PermComponent } from '@/routes/Components/Permission';
import { invoiceDS, reconDS, payDS } from '../../stores/PurchaseSettlePoolDS';
import Styles from '@/routes/common.less';

const { TabPane } = Tabs;
const camp = 'PURCHASER';
const prefix = 'ssta.purchaseSettlePool';
const settleUxFlag = findMenuName('srm.settle-account.jsd.ux-purchase');
const FilterDrawer = (props) => {
  const { customizeForm, customizeTable, isNew, history, modal = {} } = props;
  const [activeKey, setActiveKey] = React.useState('main');
  const [loadingData, setLoadingData] = React.useState(false);

  const detailDS = React.useMemo(() => new DataSet(formDs()), []);
  const strategyDS = React.useMemo(() => new DataSet(strategyDs()), []);
  const [DetailData, setDetailData] = React.useState([]);
  const [infoTabs, setInfoTabs] = React.useState(props.infoTabs || 'mainFinal');
  const [statusTabs, setStatusTabs] = React.useState(props.statusTabs || 'statusFinal');
  const [paymentTabs, setPaymentTabs] = React.useState(props.paymentTabs || 'paymentFinal');
  const [infoIsTable, setInfoTable] = React.useState(props.infoIsTable || 1);
  const [statusIsTable, setstatusTable] = React.useState(props.statusIsTable || 1);
  const [paymentIsTable, setPaymentTable] = React.useState(props.paymentIsTable || 1);

  const reconDs = React.useMemo(() => new DataSet(reconDS()), []);
  const invoiceDs = React.useMemo(() => new DataSet(invoiceDS()), []);
  const payDs = React.useMemo(() => new DataSet(payDS()), []);

  const { record = {}, type } = props;
  const {
    settleId,
    settleConfigId,
    settleConfigNum,
    billHeaderId,
    settleBasePriceMeaning,
    settleModeMeaning,
    settleMatchDimensionMeaning,
    settleMatchDimension,
    uom,
    currencyCode,
    amountPrecision,
  } = record.toData();
  React.useEffect(() => {
    strategyDS.setQueryParameter('type', type);
    strategyDS.setQueryParameter('settleConfigId', settleConfigId);
    strategyDS.setQueryParameter('settleConfigNum', settleConfigNum);
    setLoadingData(true);
    getBillLineDetail(settleId, camp, billHeaderId).then((res) => {
      if (res) {
        detailDS.loadData([res]);
        setLoadingData(false);
        setDetailData(res);
      }
    });
    strategyDS.query().then((strRes) => {
      if (strRes) {
        strategyDS.loadData([
          {
            ...strRes,
            settleBasePriceMeaning,
            settleModeMeaning,
            settleMatchDimensionMeaning,
          },
        ]);
      }
    });
    reconDs.setQueryParameter('settleId', record.get('settleId'));
    reconDs.setQueryParameter('documentType', 'BILL');
    reconDs.setQueryParameter('finalFlag', infoIsTable);
    reconDs.setQueryParameter('customizeUnitCode', 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_GRID');
    reconDs.query();

    invoiceDs.setQueryParameter('settleId', record.get('settleId'));
    invoiceDs.setQueryParameter('documentType', 'INVOICE');
    invoiceDs.setQueryParameter('finalFlag', statusIsTable);
    invoiceDs.setQueryParameter(
      'customizeUnitCode',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.INVOICE_GRID'
    );
    invoiceDs.query();

    payDs.setQueryParameter('settleId', record.get('settleId'));
    payDs.setQueryParameter('documentType', 'PAYMENT');
    payDs.setQueryParameter('finalFlag', paymentIsTable);
    payDs.setQueryParameter('customizeUnitCode', 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.PAYMENT_GRID');
    payDs.query();
  }, [record, type]);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };
  const handleChangeModeInfo = (e) => {
    reconDs.setQueryParameter('settleId', record.get('settleId'));
    reconDs.setQueryParameter('documentType', 'BILL');
    reconDs.setQueryParameter('finalFlag', e.target.value);
    reconDs.query();
    setInfoTabs(e.target.value === 1 ? 'mainFinal' : 'mainRecord');
    setInfoTable(() => e.target.value);
  };

  const handleChangeModeStatus = (e) => {
    invoiceDs.setQueryParameter('settleId', record.get('settleId'));
    invoiceDs.setQueryParameter('documentType', 'INVOICE');
    invoiceDs.setQueryParameter('finalFlag', e.target.value);
    invoiceDs.query();
    setStatusTabs(e.target.value === 1 ? 'statusFinal' : 'statusRecord');
    setstatusTable(e.target.value);
  };

  const handleChangeModePayment = (e) => {
    payDs.setQueryParameter('settleId', record.get('settleId'));
    payDs.setQueryParameter('documentType', 'PAYMENT');
    payDs.setQueryParameter('finalFlag', e.target.value);
    payDs.query();
    setPaymentTabs(e.target.value === 1 ? 'paymentFinal' : 'paymentRecord');
    setPaymentTable(e.target.value);
  };

  const reconciliationColumns = React.useMemo(() => {
    return [
      {
        width: 120,
        name: 'recordStatusMeaning',
        renderer: (records) => {
          let color = '';
          switch (records.record.get('recordStatus')) {
            case 'OCCUPIED':
              color = 'error';
              break;

            case 'CANCELED':
              color = 'info';
              break;

            case 'COMPLETED':
              color = 'success';
              break;

            default:
              color = 'warn';
              break;
          }
          return statusTagRender(records.value, color);
        },
      },
      {
        width: 200,
        name: 'documentNumAndLine',
      },
      {
        name: 'quantity',
      },
      {
        width: 200,
        name: 'netPrice',
      },
      {
        name: 'unitPriceBatch',
        width: 80,
      },
      {
        name: 'netAmount',
        width: 180,
      },
      {
        width: 120,
        name: 'taxRate',
      },
      {
        width: 120,
        name: 'taxAmount',
      },
      {
        width: 120,
        name: 'taxIncludedPrice',
      },
      {
        width: 120,
        name: 'netAmount',
      },
      {
        width: 120,
        name: 'taxIncludedAmount',
      },
      {
        width: 150,
        name: 'recordDate',
      },
      {
        width: 120,
        name: 'recordSource',
      },
      {
        width: 120,
        name: 'companyName',
      },
      {
        width: 120,
        name: 'supplierCompanyName',
      },
      {
        width: 120,
        name: 'campMeaning',
      },
      {
        width: 120,
        name: 'createdUserName',
      },
      {
        width: 120,
        name: 'creationDate',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        renderer: (records) => {
          if (
            records.record.get('autoGenerateFlag') === 0 &&
            !['LOCK', 'REMOVE', 'UNREMOVE'].includes(records.record.get('recordStatus'))
          ) {
            return (
              <a
                onClick={() => {
                  handleDetail(records.record);
                }}
              >
                {intl.get('hzero.common.button.watchDetails').d('查看执行情况')}
              </a>
            );
          }
        },
      },
    ];
  }, [infoIsTable]);
  /**
   * 发票匹配记录表格列
   */
  const invoiceColumns = React.useMemo(() => {
    return [
      {
        width: 120,
        name: 'recordStatusMeaning',
        renderer: (records) => {
          let color = '';
          switch (records.record.get('recordStatus')) {
            case 'OCCUPIED':
              color = 'error';
              break;

            case 'CANCELED':
              color = 'info';
              break;

            case 'COMPLETED':
              color = 'success';
              break;

            default:
              color = 'warn';
              break;
          }
          return statusTagRender(records.value, color);
        },
      },
      {
        width: 200,
        name: 'documentNumAndLine',
      },
      {
        name: 'quantity',
      },
      {
        width: 200,
        name: 'netPrice',
      },
      {
        name: 'unitPriceBatch',
        width: 80,
      },
      {
        name: 'netAmount',
        width: 180,
      },
      {
        width: 120,
        name: 'taxRate',
      },
      {
        width: 120,
        name: 'taxAmount',
      },
      {
        width: 120,
        name: 'taxIncludedPrice',
      },
      {
        width: 120,
        name: 'taxIncludedAmount',
      },
      {
        width: 150,
        name: 'recordDate',
      },
      {
        width: 120,
        name: 'recordSource',
      },
      {
        width: 120,
        name: 'companyName',
      },
      {
        width: 120,
        name: 'supplierCompanyName',
      },
      {
        width: 120,
        name: 'campMeaning',
      },
      {
        width: 120,
        name: 'createdUserName',
      },
      {
        width: 120,
        name: 'creationDate',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        renderer: (records) => {
          if (
            records.record.get('autoGenerateFlag') === 0 &&
            !['LOCK', 'REMOVE', 'UNREMOVE'].includes(records.record.get('recordStatus'))
          ) {
            return (
              <a onClick={() => handleStatementDetail(records.record)}>
                {intl.get('hzero.common.button.viewDetails').d('查看详情')}
              </a>
            );
          }
        },
      },
    ];
  }, [statusIsTable]);

  /**
   * 收款记录表格列
   */
  const payColumns = React.useMemo(() => {
    return [
      {
        width: 120,
        name: 'recordStatusMeaning',
        renderer: (records) => {
          let color = '';
          switch (records.record.get('recordStatus')) {
            case 'OCCUPIED':
              color = 'error';
              break;

            case 'CANCELED':
              color = 'info';
              break;

            case 'COMPLETED':
              color = 'success';
              break;

            default:
              color = 'warn';
              break;
          }
          return statusTagRender(records.value, color);
        },
      },
      {
        width: 200,
        name: 'documentNum',
        renderer: (records) => {
          return <a onClick={() => handleRecord(records.record)}>{records.value}</a>;
        },
      },

      {
        width: 200,
        name: 'paymentTypeMeaning',
      },
      {
        width: 200,
        name: 'paymentAmount',
      },
      {
        name: 'recordDate',
        width: 150,
      },
      {
        width: 120,
        name: 'recordSource',
      },
      {
        width: 120,
        name: 'companyName',
      },
      {
        width: 120,
        name: 'supplierCompanyName',
      },
      {
        width: 120,
        name: 'campMeaning',
      },
      {
        width: 120,
        name: 'createdUserName',
      },
      {
        width: 120,
        name: 'creationDate',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        renderer: (records) => {
          if (!['LOCK', 'REMOVE', 'UNREMOVE'].includes(records.record.get('recordStatus'))) {
            return (
              <a
                onClick={() => {
                  handleStatementDetail(records.record);
                }}
              >
                {intl.get('hzero.common.button.seeHandleDetail').d('查看执行情况')}
              </a>
            );
          }
        },
      },
    ];
  }, [paymentIsTable]);
  /**
   * 对账记录详情 - 跳转
   */
  const handleDetail = (records) => {
    const billId = records.get('documentId');
    const billNum = records.get('documentNum');
    modal.close();
    history.push({
      pathname: isNew
        ? '/ssta/new-reconciliation-workbench/detail'
        : '/ssta/reconciliation-workbench/detail',
      search: queryString.stringify({
        editFlag: 0,
        billList: JSON.stringify([{ billHeaderId: billId, billNum }]),
      }),
    });
  };

  const handleStatementDetail = async (records) => {
    const settleHeaderId = records.get('documentId');
    const settleHeaderNum = records.get('documentNum');
    const res = getResponse(await searchHeaderInfo({ settleHeaderNum }));
    if (!res || !res?.documentType) return;
    const { documentType } = res;
    if (settleUxFlag) {
      history.push({
        pathname: `/ssta/new-purchase-settle/${documentType.toLowerCase()}/${settleHeaderId}`,
        search: queryString.stringify({
          source: 'reconciliation',
          type: 'view',
        }),
      });
    } else {
      history.push({
        pathname: '/ssta/purchase-settle/detail',
        search: queryString.stringify({
          source: 'detail',
          type: 'ALL',
          documentType,
          settleHeaderId,
        }),
      });
    }
  };

  const handleRecord = (records) => {
    Modal.open({
      // mask: false,
      drawer: true,
      title: intl.get(`${prefix}.view.title.payinfo`).d('付款明细信息'),
      closable: true,
      footer: null,
      className: Styles['ssta-large-modal'],
      children: <Record settleRecordId={records.get('settleRecordId')} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };
  return (
    <Spin spinning={loadingData}>
      <Tabs activeKey={activeKey} animated onChange={handleTabChange}>
        <TabPane
          tab={intl.get('ssta.reconciliationWorkbench.view.title.main').d('结算主信息')}
          key="main"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbench.view.title.tradingPartyInformation')
              .d('交易方信息')}
          >
            {customizeForm(
              { code: 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRADING_PARTY' },
              <Form dataSet={detailDS} columns={4} useColon={false} labelLayout="vertical">
                <Output name="sourceCompanyNum" />
                <Output name="sourceCompanyName" />
                <Output name="sourceSupplierCompanyNum" />
                <Output name="sourceSupplierCompanyName" />
                <Output name="companyNum" />
                <Output name="companyName" />
                <Output name="supplierCompanyNum" />
                <Output name="supplierCompanyName" />
                <Output name="supplierSiteCode" />
                <Output name="sourceSupplierSiteCode" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbench.view.title.transactionAmountInformation')
              .d('交易金额信息')}
          >
            {customizeForm(
              { code: 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRANSACTION_AMOUNT' },
              <Form dataSet={detailDS} columns={4} useColon={false} labelLayout="vertical">
                <Output name="itemCode" />
                <Output name="itemName" />
                <Output name="quantity" />
                <Output name="unitPriceBatch" />
                <Output name="netPriceMeaning" renderer={numberRender} />
                <Output name="netAmountMeaning" renderer={amountRender} />
                <Output name="taxIncludedPriceMeaning" renderer={numberRender} />
                <Output name="taxIncludedAmountMeaning" renderer={amountRender} />
                <Output name="taxRate" />
                <Output name="taxAmountMeaning" renderer={amountRender} />
                <Output name="currencyCode" />
                <Output name="uom" />
                <Output name="specificationsModel" />
                <Output name="srmItemCode" />
                <Output name="categoryName" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbench.view.title.transactionAffairInfo')
              .d('交易事务信息')}
          >
            {customizeForm(
              { code: 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRANSACTION_AFFAIR' },
              <Form dataSet={detailDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="settleNum" />
                <Output name="sourceSettleNum" />
                <Output name="sourceSettleLineNum" />
                <Output name="dataSourceMeaning" />
                <Output name="trxDate" />
                <Output name="trxYear" />
                <Output name="contractAndLineNum" />
                <Output name="poAndLineNum" />
                <Output name="asnAndLineNum" />
                <Output name="poLineLocation" />
                <Output name="releaseNum" />
                <Output name="orderType" />
                <Output name="purOrganizationName" />
                <Output name="invOrganizationName" />
                <Output name="inventoryName" />
                <Output name="trxTypeCode" />
                <Output name="trxTypeCodeMeaning" />
                <Output name="createdByName" />
                <Output name="purchaseAgentName" />
                <Output name="sourceParentSettleLineNum" />
                <Output
                  name="freightFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output name="ecPoNum" />
                <Output name="ecPoSubNum" />
                <Output name="deliverTime" />
                <Output name="deliverQuantity" />
                <Output name="ecDeliverQuantity" />
                <Output name="invoiceMethodMeaning" />
                <Output name="elecInvoiceView" />
                <Output name="afterSalesStatusMeaning" />
                <Output name="invoiceTypeMeaning" />
                <Output name="termCode" />
                <Output name="costName" />
                <Output name="multiDealTrxNum" />
                <Output name="multiDealTrxLineNum" />
                <Output name="multiDealPoNum" />
                <Output name="multiDealPoLineNum" />
                <FormItem
                  dataSet={detailDS}
                  name="sinvLineAttachmentUuid"
                  editor="attachment"
                  showHistory
                  readOnly
                  bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                />
                <Output name="pcSubjectLineNum" />
                <Output name="poClosedFlagMeaning" />
                <Output name="unitName" />
              </Form>
            )}
          </Card>
        </TabPane>
        <TabPane
          tab={intl.get('ssta.reconciliationWorkbench.view.title.run').d('结算执行信息')}
          key="run"
        >
          <PermComponent
            permissionList={[
              { code: 'srm.settle-account.settle-pool.purchase.ps.radio.button.bill' },
            ]}
          >
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <div>
                  {intl.get(`${prefix}.view.title.billInfo`).d('对账信息')}
                  &nbsp;
                  {detailDS.current?.get('billRemoveFlag') && (
                    <Tag color="rgba(0, 0, 0, 0.1)" style={{ fontWeight: 600, padding: '0 5px' }}>
                      <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                        {intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
                      </span>
                    </Tag>
                  )}
                </div>
              }
            >
              <Form columns={2} labelLayout="vertical" className={Styles['card-implementForm']}>
                <ImplementForm
                  detailData={DetailData || []}
                  data={[
                    {
                      position: 'top',
                      icon: 'lock_clock',
                      name: ['billOccupiedQuantity', 'billOccupiedAmount'],
                      label: `${
                        settleMatchDimension !== 'AMOUNT'
                          ? intl.get('ssta.common.model.common.occupiedQuantity').d('占用数量')
                          : ''
                      }
                      ${settleMatchDimension !== 'AMOUNT' && uom ? `(${uom})/` : ''}
                      ${
                        settleMatchDimension !== 'AMOUNT'
                          ? ''
                          : intl
                              .get('ssta.common.model.common.occupiedAmountWithTax')
                              .d('占用金额(含税)')
                      }(${currencyCode})`,
                      amountPrecision,
                      dimension: settleMatchDimension === 'AMOUNT',
                    },
                    {
                      position: 'buttom',
                      amountPrecision,
                      data: [
                        {
                          label: intl.get(`${prefix}.view.TaxExcluded`).d('不含税'),
                          name: 'billOccupiedNetAmount',
                        },
                        {
                          label: intl.get(`${prefix}.view.TaxAamount`).d('税额'),
                          name: 'billOccupiedTaxAmount',
                        },
                      ],
                    },
                  ]}
                />
                <ImplementForm
                  detailData={DetailData || []}
                  data={[
                    {
                      position: 'top',
                      icon: 'done',
                      name: ['billCompletedQuantity', 'billCompletedAmount'],
                      label: `
                      ${
                        settleMatchDimension !== 'AMOUNT'
                          ? intl.get('ssta.common.model.common.completedQuantity').d('完成数量')
                          : ''
                      }
                      ${settleMatchDimension !== 'AMOUNT' && uom ? `(${uom})/` : ''}
                      ${
                        settleMatchDimension !== 'AMOUNT'
                          ? ''
                          : intl
                              .get('ssta.common.model.common.completedAmountWithTax')
                              .d('完成金额(含税)')
                      }(${currencyCode})`,
                      amountPrecision,
                      dimension: settleMatchDimension === 'AMOUNT',
                    },
                    {
                      position: 'buttom',
                      icon: 'question-circle-o',
                      amountPrecision,
                      data: [
                        {
                          label: intl.get(`${prefix}.view.TaxExcluded`).d('不含税'),
                          name: 'billCompletedNetAmount',
                        },
                        {
                          label: intl.get(`${prefix}.view.TaxAamount`).d('税额'),
                          name: 'billCompletedTaxAmount',
                        },
                      ],
                    },
                  ]}
                />
              </Form>
              <div className={Styles['ssta-detailDrawer-content']}>
                <Tabs
                  activeKey={infoTabs}
                  animated
                  tabBarExtraContent={
                    <div className="ssta-reconciliation-mode">
                      <Radio.Group value={Number(infoIsTable)} onChange={handleChangeModeInfo}>
                        <Radio.Button value={1}>
                          {intl.get(`ssta.purchaseSettlePool.button.inalDisplay`).d('最终展示')}
                        </Radio.Button>
                        <Radio.Button value={0}>
                          {intl.get(`ssta.purchaseSettlePool.button.displayRecord`).d('展示记录')}
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                  }
                >
                  <TabPane key={Number(infoIsTable) === 1 ? 'mainFinal' : 'mainRecord'}>
                    {customizeTable(
                      { code: 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_GRID' },
                      <Table columns={reconciliationColumns} dataSet={reconDs} queryBar="none" />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </Card>
          </PermComponent>
          <PermComponent
            permissionList={[
              { code: 'srm.settle-account.settle-pool.purchase.ps.radio.button.invoice' },
            ]}
          >
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <div>
                  {intl
                    .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.invoiceApplicationInfo`)
                    .d('发票申请信息')}
                  &nbsp;
                  {detailDS.current?.get('invoiceRemoveFlag') === 1 && (
                    <Tag color="rgba(0, 0, 0, 0.1)" style={{ fontWeight: 600, padding: '0 5px' }}>
                      <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                        {intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
                      </span>
                    </Tag>
                  )}
                </div>
              }
            >
              <Form columns={2} labelLayout="vertical" className={Styles['card-implementForm']}>
                <ImplementForm
                  detailData={DetailData || []}
                  data={[
                    {
                      position: 'top',
                      icon: 'lock_clock',
                      name: ['invoiceOccupiedQuantity', 'invoiceOccupiedAmount'],
                      label: `
                      ${
                        settleMatchDimension !== 'AMOUNT'
                          ? intl.get('ssta.common.model.common.occupiedQuantity').d('占用数量')
                          : ''
                      }
                      ${settleMatchDimension !== 'AMOUNT' && uom ? `(${uom})/` : ''}
                      ${
                        settleMatchDimension !== 'AMOUNT'
                          ? ''
                          : intl
                              .get('ssta.common.model.common.occupiedAmountWithTax')
                              .d('占用金额(含税)')
                      }(${currencyCode})`,
                      amountPrecision,
                      dimension: settleMatchDimension === 'AMOUNT',
                    },
                    {
                      position: 'buttom',
                      amountPrecision,
                      data: [
                        {
                          label: intl.get(`${prefix}.view.TaxExcluded`).d('不含税'),
                          name: 'invoiceOccupiedNetAmount',
                        },
                        {
                          label: intl.get(`${prefix}.view.TaxAamount`).d('税额'),
                          name: 'invoiceOccupiedTaxAmount',
                        },
                      ],
                    },
                  ]}
                />
                <ImplementForm
                  detailData={DetailData || []}
                  data={[
                    {
                      position: 'top',
                      icon: 'done',
                      name: ['invoiceCompletedQuantity', 'invoiceCompletedAmount'],
                      label: `
                      ${
                        settleMatchDimension !== 'AMOUNT'
                          ? intl.get('ssta.common.model.common.completedQuantity').d('完成数量')
                          : ''
                      }
                      ${settleMatchDimension !== 'AMOUNT' && uom ? `(${uom})/` : ''}
                      ${
                        settleMatchDimension !== 'AMOUNT'
                          ? ''
                          : intl
                              .get('ssta.common.model.common.completedAmountWithTax')
                              .d('完成金额(含税)')
                      }(${currencyCode})`,
                      amountPrecision,
                      dimension: settleMatchDimension === 'AMOUNT',
                    },
                    {
                      position: 'buttom',
                      amountPrecision,
                      data: [
                        {
                          label: intl.get(`${prefix}.view.TaxExcluded`).d('不含税'),
                          name: 'invoiceCompletedNetAmount',
                        },
                        {
                          label: intl.get(`${prefix}.view.TaxAamount`).d('税额'),
                          name: 'invoiceCompletedTaxAmount',
                        },
                      ],
                    },
                  ]}
                />
              </Form>
              <div className={Styles['ssta-detailDrawer-content']}>
                <Tabs
                  activeKey={statusTabs}
                  animated
                  tabBarExtraContent={
                    <div className="ssta-reconciliation-mode">
                      <Radio.Group value={Number(statusIsTable)} onChange={handleChangeModeStatus}>
                        <Radio.Button value={1}>
                          {intl.get(`ssta.purchaseSettlePool.button.inalDisplay`).d('最终展示')}
                        </Radio.Button>
                        <Radio.Button value={0}>
                          {intl.get(`ssta.purchaseSettlePool.button.displayRecord`).d('展示记录')}
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                  }
                >
                  <TabPane key={Number(statusIsTable) === 1 ? 'statusFinal' : 'statusRecord'}>
                    {customizeTable(
                      { code: 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.INVOICE_GRID' },
                      <Table columns={invoiceColumns} dataSet={invoiceDs} queryBar="none" />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </Card>
          </PermComponent>
          <PermComponent
            permissionList={[
              { code: 'srm.settle-account.settle-pool.purchase.ps.radio.button.payment' },
            ]}
          >
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <div>
                  {intl.get('ssta.purchaseSettlePool.view.title.paymentInfo').d('付款申请信息')}
                  &nbsp;
                  {detailDS.current?.get('paymentRemoveFlag') === 1 && (
                    <Tag color="rgba(0, 0, 0, 0.1)" style={{ fontWeight: 600, padding: '0 5px' }}>
                      <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                        {intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
                      </span>
                    </Tag>
                  )}
                </div>
              }
            >
              <Form columns={2} labelLayout="vertical" className={Styles['card-implementForm']}>
                <ImplementForm
                  detailData={DetailData || []}
                  data={[
                    {
                      position: 'top',
                      icon: 'lock_clock',
                      name: ['paymentOccupiedAmount'],
                      label: `${intl
                        .get('ssta.common.model.common.occupiedAmount')
                        .d('占用金额')}(${currencyCode})`,
                      amountPrecision,
                    },
                  ]}
                />
                <ImplementForm
                  detailData={DetailData || []}
                  data={[
                    {
                      position: 'top',
                      icon: 'done',
                      name: ['paymentCompletedAmount'],
                      label: `${intl
                        .get('ssta.common.model.common.completedAmount')
                        .d('完成金额')}(${currencyCode})`,
                      amountPrecision,
                    },
                  ]}
                />
              </Form>
              <div className={Styles['ssta-detailDrawer-content']}>
                <Tabs
                  activeKey={paymentTabs}
                  animated
                  tabBarExtraContent={
                    <div className="ssta-reconciliation-mode">
                      <Radio.Group
                        value={Number(paymentIsTable)}
                        onChange={handleChangeModePayment}
                      >
                        <Radio.Button value={1}>
                          {intl.get(`ssta.purchaseSettlePool.button.inalDisplay`).d('最终展示')}
                        </Radio.Button>
                        <Radio.Button value={0}>
                          {intl.get(`ssta.purchaseSettlePool.button.displayRecord`).d('展示记录')}
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                  }
                >
                  <TabPane key={Number(paymentIsTable) === 1 ? 'paymentFinal' : 'paymentRecord'}>
                    {customizeTable(
                      { code: 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.PAYMENT_GRID' },
                      <Table columns={payColumns} dataSet={payDs} queryBar="none" />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </Card>
          </PermComponent>
        </TabPane>
        <TabPane
          tab={intl.get('ssta.reconciliationWorkbench.view.title.strategy').d('结算策略信息')}
          key="strategy"
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl
              .get('ssta.reconciliationWorkbench.view.title.settleDataRule')
              .d('结算数据规则')}
          >
            {customizeForm(
              { code: 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.SETTLE_DATA_RULE' },
              <Form dataSet={strategyDS} columns={4} useColon={false} labelLayout="vertical">
                <Output name="settleConfigNum" />
                <Output name="settleConfigName" />
                <Output name="versionNumber" />
                <Output name="settleBasePriceMeaning" />
                <Output name="settleModeMeaning" />
                <Output name="settleMatchDimensionMeaning" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get('ssta.reconciliationWorkbench.view.title.billRule').d('对账单规则')}
          >
            {customizeForm(
              { code: 'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_RULE' },
              <Form dataSet={strategyDS} columns={3} useColon={false} labelLayout="vertical">
                <Output name="billCompanyMeaning" />
                <Output name="billSupplierMeaning" />
                <Output
                  name="billPartMatchFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output
                  name="priceAdjustFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
                <Output
                  name="billDependencyFlag"
                  renderer={({ value }) => {
                    return <>{yesOrNoRender(Number(value))}</>;
                  }}
                />
              </Form>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </Spin>
  );
};

export default compose(
  // formatterCollections({ code: ['ssta.reconciliationWorkbench'] }),
  withCustomize({
    unitCode: [
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_INFO',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_RULE',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.INVOICE_INFO',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.PAYMENT_INFO',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.SETTLE_DATA_RULE',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRADING_PARTY',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRANSACTION_AFFAIR',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRANSACTION_AMOUNT',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_GRID',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.INVOICE_GRID',
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.PAYMENT_GRID',
    ],
  })
)(FilterDrawer);
