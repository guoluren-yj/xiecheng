/* eslint-disable import/named */
import React from 'react';
import { Form, Output, DataSet, Spin, Table, Modal, Button } from 'choerodon-ui/pro';
import { Tabs, Card, Radio } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse, findMenuName } from '@/utils/utils';
import intl from 'utils/intl';
import queryString, { stringify } from 'querystring';
import { PermComponent } from '@/routes/Components/Permission';
import ImplementForm from '@/routes/Components/ImplementForm';
import { statusTagRender } from '@/utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { FormItem } from '@/routes/Components';
import { compose, isNil } from 'lodash';
import Styles from '@/routes/common.less';
import Record from './Record';
import {
  detailDS as detailDs,
  configDS as configDs,
  invoiceDS,
  reconDS,
  payDS,
} from '../../stores/SupplySettlePoolDS';
import { getDetailDS, searchHeaderInfo } from '../../services/settlePoolServices';

// import '@/routes/common.less';

const { TabPane } = Tabs;

const prefix = 'ssta.supplySettlePool';

const settleUxFlag = findMenuName('srm.settle-account.jsd.ux-supply');
const uxSupplierFlag = findMenuName('srm.settle-account.reconciliation-workbench.ux-supplier');

const FilterDrawer = (props) => {
  const { record, type, customizeForm, history, customizeTable } = props;
  const [activeKey, setActiveKey] = React.useState('main');

  const detailDS = React.useMemo(() => new DataSet(detailDs()), []);

  const configDS = React.useMemo(() => new DataSet(configDs()), []);

  const reconDs = React.useMemo(() => new DataSet(reconDS()), []);

  const invoiceDs = React.useMemo(() => new DataSet(invoiceDS()), []);

  const payDs = React.useMemo(() => new DataSet(payDS()), []);

  const [infoTabs, setInfoTabs] = React.useState(props.infoTabs || 'mainFinal');

  const [statusTabs, setStatusTabs] = React.useState(props.statusTabs || 'statusFinal');

  const [paymentTabs, setPaymentTabs] = React.useState(props.paymentTabs || 'paymentFinal');

  const [infoIsTable, setInfoTable] = React.useState(props.infoIsTable || 1);

  const [statusIsTable, setstatusTable] = React.useState(props.statusIsTable || 1);

  const [paymentIsTable, setPaymentTable] = React.useState(props.paymentIsTable || 1);

  const [detailData, setDetailData] = React.useState(null);

  const {
    data: { amountPrecision, currencyCode, uom, settleMatchDimension },
  } = record;

  const getDetailDSFUn = async () => {
    const res = getResponse(
      await getDetailDS({
        type,
        settleId: record.get('settleId'),
        settleErrorId: record.get('settleErrorId'),
      })
    );
    if (res) {
      setDetailData(res);
    }
  };
  React.useEffect(() => {
    getDetailDSFUn();
  }, []);
  React.useEffect(() => {
    detailDS.setQueryParameter('settleId', record.get('settleId'));
    detailDS.setQueryParameter('settleErrorId', record.get('settleErrorId'));
    detailDS.setQueryParameter('type', type);
    configDS.setQueryParameter('type', type);
    configDS.setQueryParameter('settleId', record.get('settleId'));
    configDS.setQueryParameter('settleConfigNum', record.get('settleConfigNum'));
    detailDS.query().then((res) => {
      if (res) {
        detailDS.loadData([{ ...record.get(['errorSettleNum']), ...res }]);
      }
    });
    configDS.query().then((res) => {
      if (res) {
        configDS.loadData([
          {
            ...res,
            settleBasePriceMeaning: record.get('settleBasePriceMeaning'),
            settleModeMeaning: record.get('settleModeMeaning'),
            settleMatchDimensionMeaning: record.get('settleMatchDimensionMeaning'),
            settleConfigVersionNumber: record.get('settleConfigVersionNumber'),
          },
        ]);
      }
    });
    reconDs.setQueryParameter('settleId', record.get('settleId'));
    reconDs.setQueryParameter('documentType', 'BILL');
    reconDs.setQueryParameter('finalFlag', infoIsTable);
    reconDs.setQueryParameter('customizeUnitCode', 'SSTA.SUPPLY_POOL_RECORD.BILL_GRID');
    reconDs.query();

    invoiceDs.setQueryParameter('settleId', record.get('settleId'));
    invoiceDs.setQueryParameter('documentType', 'INVOICE');
    invoiceDs.setQueryParameter('finalFlag', statusIsTable);
    invoiceDs.setQueryParameter('customizeUnitCode', 'SSTA.SUPPLY_POOL_RECORD.INVOICE_GRID');
    invoiceDs.query();

    payDs.setQueryParameter('settleId', record.get('settleId'));
    payDs.setQueryParameter('documentType', 'PAYMENT');
    payDs.setQueryParameter('finalFlag', paymentIsTable);
    payDs.setQueryParameter('customizeUnitCode', 'SSTA.SUPPLY_POOL_RECORD.PAYMENT_GRID');
    payDs.query();
  }, []);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const handleChangeModeInfo = (e) => {
    reconDs.setQueryParameter('finalFlag', e.target.value);
    reconDs.query();
    setInfoTabs(e.target.value === 1 ? 'mainFinal' : 'mainRecord');
    setInfoTable(e.target.value);
  };

  const handleChangeModeStatus = (e) => {
    invoiceDs.setQueryParameter('finalFlag', e.target.value);
    invoiceDs.query();
    setStatusTabs(e.target.value === 1 ? 'statusFinal' : 'statusRecord');
    setstatusTable(e.target.value);
  };

  const handleChangeModePayment = (e) => {
    payDs.setQueryParameter('finalFlag', e.target.value);
    payDs.query();
    setPaymentTabs(e.target.value === 1 ? 'paymentFinal' : 'paymentRecord');
    setPaymentTable(e.target.value);
  };

  /**
   * 对账记录详情 - 跳转
   */
  const handleDetail = (records) => {
    const billHeaderId = records.get('documentId');
    const billNum = records.get('documentNum');
    history.push({
      pathname: uxSupplierFlag
        ? '/ssta/new-reconciliation-workbench-supplier/detail'
        : '/ssta/reconciliation-workbench-supplier/detail',
      search: queryString.stringify({
        editFlag: 0,
        billList: JSON.stringify([{ billHeaderId, billNum }]),
        from: 'pool',
      }),
    });
  };

  /**
   * 发票匹配,收款审批详情 - 跳转
   * @param {*} record
   */
  const handleStatementDetail = async (currentRecord) => {
    const settleHeaderId = currentRecord.get('documentId');
    const settleHeaderNum = currentRecord.get('documentNum');
    const res = getResponse(await searchHeaderInfo({ settleHeaderNum }));
    if (!res || !res?.documentType) return;
    const { documentType } = res;
    if (settleUxFlag) {
      history.push({
        pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${settleHeaderId}`,
        search: stringify({
          source: 'pool',
          type: 'view',
        }),
      });
      return;
    }
    history.push({
      pathname: '/ssta/supply-settle/detail',
      search: queryString.stringify({
        source: 'detail',
        type: 'ALL',
        documentType,
        settleHeaderId,
      }),
    });
  };

  const handleRecord = (records) => {
    Modal.open({
      // mask: false,
      drawer: true,
      title: intl.get(`${prefix}.model.supplySettlePool.payCollectionInfo`).d('收款明细信息'),
      closable: true,
      footer: null,
      className: Styles['ssta-large-modal'],
      children: <Record settleRecordId={records.get('settleRecordId')} paymentType={records?.get('paymentType')} customizeTable={customizeTable} history={history} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };
  /**
   * 对账记录表格列
   */
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
        width: 120,
        name: 'remark',
      },
      {
        name: 'operation',
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
        width: 120,
        name: 'remark',
      },
      {
        name: 'operation',
        width: 120,
        renderer: (records) => {
          if (
            records.record.get('autoGenerateFlag') === 0 &&
            !['LOCK', 'REMOVE', 'UNREMOVE'].includes(records.record.get('recordStatus'))
          ) {
            return (
              <a onClick={() => handleStatementDetail(records.record)}>
                {intl.get('hzero.common.button.viewDetails').d('查看执行情况')}
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
        name: 'recordStatusMeaning',
        width: 120,
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
        width: 120,
        name: 'remark',
      },
      {
        name: 'operation',
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
  return (
    <Spin dataSet={detailDS}>
      <Tabs activeKey={activeKey} animated onChange={handleTabChange}>
        <TabPane tab={intl.get(`${prefix}.view.title.main`).d('结算主信息')} key="main">
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${prefix}.view.title.tradingInfo`).d('交易方信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLY_POOL_DETAIL.TRADINGPARTY' },
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
            title={intl.get(`${prefix}.view.title.amountInfo`).d('交易金额信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLY_POOL_DETAIL.TRANSACTIONAMOUNT' },
              <Form dataSet={detailDS} columns={4} useColon={false} labelLayout="vertical">
                <Output name="itemCode" />
                <Output name="itemName" />
                <Output name="quantity" />
                <Output name="unitPriceBatch" />
                <Output name="netPrice" />
                <Output name="netAmount" />
                <Output name="taxIncludedPrice" />
                <Output name="taxIncludedAmount" />
                <Output name="taxRate" />
                <Output name="taxAmount" />
                <Output name="currencyCode" />
                <Output name="uom" style={{ wordBreak: 'break-all' }} />
                <Output name="specificationsModel" />
                <Output name="srmItemCode" />
                <Output name="categoryName" />
                <Output name="secondaryQuantity" />
                <Output name="secondaryUomCode" style={{ wordBreak: 'break-all' }} />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${prefix}.view.title.transactionInfo`).d('交易事务信息')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLY_POOL_DETAIL.TRANSACTIONMATTER' },
              <Form dataSet={detailDS} columns={4} useColon={false} labelLayout="vertical">
                <Output name={type === 'E' ? 'errorSettleNum' : 'settleNum'} />
                <Output name="sourceSettleNum" />
                <Output name="sourceSettleLineNum" />
                <Output name="dataSourceMeaning" />
                <Output
                  name="trxLineNums"
                  renderer={({ record: curRecord }) => {
                    const { trxLineNum, trxNum } = curRecord?.toData() || {};
                    if (trxLineNum && trxNum) {
                      return `${trxNum}-${trxLineNum}`;
                    }
                    if (trxLineNum) {
                      return trxLineNum;
                    }
                    if (trxNum) {
                      return trxNum;
                    }
                    return '';
                  }}
                />
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
                <Output name="creationDate" />
                <Output name="businessTypeMeaning" />
                <Output name="stockTypeMeaning" />
                <Output name="sourcePlatformCodeMeaning" />
                <Output name="purchaseAgentName" />
                <Output name="sourceParentSettleAndLineNum" />
                <Output name="freightFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Output name="ecPoNum" />
                <Output name="ecPoSubNum" />
                <Output name="deliverTime" />
                <Output name="deliverQuantity" />
                <Output name="ecDeliverQuantity" />
                <Output name="invoiceMethodMeaning" />
                <Output
                  name="invoiceInfo"
                  renderer={() => {
                    return (
                      <Button funcType="flat" disabled>
                        {intl.get('hzero.common.button.view').d('查看')}
                      </Button>
                    );
                  }}
                />
                <Output name="afterSalesStatusMeaning" />
                <Output name="invoiceTypeMeaning" />
                <Output name="costName" />
                <Output name="termCode" />
                <Output name="supplierOrderTypeCode" />
                <FormItem
                  dataSet={detailDS}
                  name="sinvLineAttachmentUuid"
                  editor="attachment"
                  showHistory
                  readOnly
                  bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                />
                {type !== 'E' && <Output name="ouName" />}
                <Output name="multiDealTrxNum" />
                <Output name="multiDealTrxLineNum" />
                <Output name="multiDealPoNum" />
                <Output name="multiDealPoLineNum" />
                <Output name="pcSubjectLineNum" />
                <Output name="poClosedFlagMeaning" />
                <Output name="unitName" />
                <Output name="requestedByRealName" />
                <Output name="prLineNum" />
                <Output name="prNum" />
                <Output name="poLineObjectVersionNumber" />
                <Output name="lineLocationObjectVersionNumber" />
                <Output name="projectTaskMeaning" />
              </Form>
            )}
          </Card>
        </TabPane>
        <TabPane tab={intl.get(`${prefix}.view.title.run`).d('结算执行信息')} key="run">
          <PermComponent
            permissionList={[
              { code: 'srm.settle-account.settle-pool.supply.ps.radio.button.bill' },
            ]}
          >
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <div>
                  {intl.get(`${prefix}.view.title.reconciliationInfo`).d('对账信息')}
                  &nbsp;
                  <span style={{ background: '#d8d6d6' }}>
                    {record.get('billRemoveFlag') === 1 &&
                      intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
                  </span>
                </div>
              }
            >
              <Form
                columns={2}
                labelLayout="vertical"
                className={`${Styles['card-implementForm']}`}
              >
                <ImplementForm
                  detailData={detailData || []}
                  data={[
                    {
                      position: 'top',
                      icon: 'lock_clock',
                      name: ['billOccupiedQuantity', 'billOccupiedAmount'],
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
                  detailData={detailData || []}
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
                      <Radio.Group
                        size="large"
                        value={Number(infoIsTable)}
                        onChange={handleChangeModeInfo}
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
                  <TabPane key={Number(infoIsTable) === 1 ? 'mainFinal' : 'mainRecord'}>
                    {customizeTable(
                      { code: 'SSTA.SUPPLY_POOL_RECORD.BILL_GRID' },
                      <Table columns={reconciliationColumns} dataSet={reconDs} queryBar="none" />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </Card>
          </PermComponent>
          <PermComponent
            permissionList={[
              { code: 'srm.settle-account.settle-pool.supply.ps.radio.button.invoice' },
            ]}
          >
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <div>
                  {intl
                    .get(`ssta.supplySettlePool.model.supplySettlePool.invoiceStatusInfo`)
                    .d('发票申请信息')}
                  &nbsp;
                  <span style={{ background: '#d8d6d6' }}>
                    {record.get('invoiceRemoveFlag') === 1 &&
                      intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
                  </span>
                </div>
              }
            >
              <Form columns={2} labelLayout="vertical" className={Styles['card-implementForm']}>
                <ImplementForm
                  detailData={detailData || []}
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
                  detailData={detailData || []}
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
                      <Radio.Group
                        size="large"
                        value={Number(statusIsTable)}
                        onChange={handleChangeModeStatus}
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
                  <TabPane key={Number(statusIsTable) === 1 ? 'statusFinal' : 'statusRecord'}>
                    {customizeTable(
                      { code: 'SSTA.SUPPLY_POOL_RECORD.INVOICE_GRID' },
                      <Table columns={invoiceColumns} dataSet={invoiceDs} queryBar="none" />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </Card>
          </PermComponent>
          <PermComponent
            permissionList={[
              { code: 'srm.settle-account.settle-pool.supply.ps.radio.button.payment' },
            ]}
          >
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <div>
                  {intl
                    .get('ssta.supplySettlePool.view.title.billHeaderCollectionInfo')
                    .d('收款申请信息')}
                  &nbsp;
                  <span style={{ background: '#d8d6d6' }}>
                    {record.get('paymentRemoveFlag') === 1 &&
                      intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
                  </span>
                </div>
              }
            >
              <Form columns={2} labelLayout="vertical" className={Styles['card-implementForm']}>
                <ImplementForm
                  detailData={detailData || []}
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
                  detailData={detailData || []}
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
                        size="large"
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
                      { code: 'SSTA.SUPPLY_POOL_RECORD.PAYMENT_GRID' },
                      <Table columns={payColumns} dataSet={payDs} queryBar="none" />
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </Card>
          </PermComponent>
        </TabPane>
        <TabPane tab={intl.get(`${prefix}.view.title.strategy`).d('结算策略信息')} key="strategy">
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${prefix}.view.title.settlementDataRules`).d('结算数据规则')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLY_POOL_DETAIL.DATARULES' },
              <Form dataSet={configDS} columns={4} useColon={false} labelLayout="vertical">
                <Output name="settleConfigNum" />
                <Output name="settleConfigName" />
                <Output name="versionNumber" />
                <Output name="settleBasePriceMeaning" />
                <Output name="settleModeMeaning" />
                <Output name="settleMatchDimensionMeaning" />
                <Output name="settleConfigVersionNumber" />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${prefix}.view.title.statementRules`).d('对账单规则')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLY_POOL_DETAIL.BILLRULES' },
              <Form dataSet={configDS} columns={4} useColon={false} labelLayout="vertical">
                <Output name="billCompanyMeaning" />
                <Output name="billSupplierMeaning" />
                <Output name="billPartMatchFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Output name="priceAdjustFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Output name="billDependencyFlag" renderer={({ value }) => yesOrNoRender(value)} />
              </Form>
            )}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`${prefix}.view.title.settlementRules`).d('结算单规则')}
          >
            {customizeForm(
              { code: 'SSTA.SUPPLY_POOL_DETAIL.SETTLERULES' },
              <Form dataSet={configDS} columns={4} useColon={false} labelLayout="vertical">
                <Output name="invoiceSettleCompanyCodeMeaning" />
                <Output name="paymentSettleCompanyCodeMeaning" />
                <Output name="invoiceSettleSupplierCodeMeaning" />
                <Output name="paymentSettleSupplierCodeMeaning" />
                <Output
                  name="invoicePartMatchFlag"
                  renderer={({ value }) => yesOrNoRender(value)}
                />
                <Output
                  name="paymentPartMatchFlag"
                  renderer={({ value }) => yesOrNoRender(value)}
                />
                <Output
                  name="invoicePriceEditFlag"
                  renderer={({ value }) => yesOrNoRender(value)}
                />
                <Output
                  name="invoiceTaxRateEditFlag"
                  renderer={({ value }) => yesOrNoRender(value)}
                />
                <Output
                  name="invoiceTaxAmountEditFlag"
                  renderer={({ value }) => yesOrNoRender(value)}
                />
                <Output
                  name="taxAmountAllowanceRange"
                  renderer={({ value, record }) => {
                    if (
                      !isNil(value) &&
                      record.get('taxAmountAllowanceCtrlType') === 'PROPORTION'
                    ) {
                      return `${value}%`;
                    } else {
                      return value;
                    }
                  }}
                />
                <Output
                  name="invoiceDependencyFlag"
                  renderer={({ value }) => yesOrNoRender(value)}
                />
                <Output
                  name="paymentDependencyFlag"
                  renderer={({ value }) => yesOrNoRender(value)}
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
  withCustomize({
    unitCode: [
      'SSTA.SUPPLY_POOL_DETAIL.TRADINGPARTY',
      'SSTA.SUPPLY_POOL_DETAIL.TRANSACTIONAMOUNT',
      'SSTA.SUPPLY_POOL_DETAIL.TRANSACTIONMATTER',
      'SSTA.SUPPLY_POOL_DETAIL.PAYMENT',
      'SSTA.SUPPLY_POOL_DETAIL.DATARULES',
      'SSTA.SUPPLY_POOL_DETAIL.BILLRULES',
      'SSTA.SUPPLY_POOL_DETAIL.SETTLERULES',
      'SSTA.SUPPLY_POOL_RECORD.BILL_GRID',
      'SSTA.SUPPLY_POOL_RECORD.INVOICE_GRID',
      'SSTA.SUPPLY_POOL_RECORD.PAYMENT_GRID',
      'SSTA.SUPPLY_POOL_RECORD.PEYPAYMENT_BOX',
    ],
  }),
  formatterCollections({
    code: ['ssta.supplySettlePool'],
  })
)(FilterDrawer);
