import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';

import { DataSet, Table, Form } from 'choerodon-ui/pro';
import { Tabs, Card, Radio } from 'choerodon-ui';
import intl from 'utils/intl';
import querystring from 'querystring';
import { amountLocalRender, getResponse } from '@/utils/utils';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { lineTableDs } from './mainDS';
import { getSettleHeaderId, getFeeDetail } from '@/services/costSheetService';
import { decimalPointAccuracy } from '@/routes/utils';
import { statusTagRender } from '@/utils/renderer';
import ImplementForm from '@/routes/Components/ImplementForm';

import Styles from '@/routes/common.less';

const { TabPane } = Tabs;
const prefix = 'ssta.supplySettlePool';

class ExeResult extends Component {
  lineTableDs = {
    BILL: new DataSet(lineTableDs.BILL('BILL')),
    INVOICE: new DataSet(lineTableDs.INVOICE('INVOICE')),
    PAYMENT: new DataSet(lineTableDs.PAYMENT('PAYMENT')),
  };

  constructor(props) {
    super(props);
    this.state = {
      billTabs: 'billFinal',
      billTable: 1,
      invoiceTabs: 'invoiceFinal',
      invoiceTable: 1,
      paymentTabs: 'paymentFinal',
      paymentTable: 1,
      detailData: {},
    };
  }

  @Bind()
  getDetailDSFUn = async () => {
    const { record } = this.props;
    const res = getResponse(
      await getFeeDetail({
        chargeLineId: record.get('chargeLineId'),
      })
    );
    if (res) {
      this.setState({ detailData: res });
    }
  };

  componentDidMount() {
    this.init();
    this.getDetailDSFUn();
  }

  @Bind()
  init() {
    const { record, chargeHeaderId } = this.props;
    const { billTable, invoiceTable, paymentTable } = this.state;
    const chargeLineId = record.get('chargeLineId');
    const dsList = Object.values(this.lineTableDs);
    dsList.forEach((item) => item.setQueryParameter('chargeLineId', chargeLineId));
    dsList.forEach((item) => item.setQueryParameter('chargeHeaderId', chargeHeaderId));

    this.lineTableDs.BILL.setQueryParameter('finalFlag', billTable);
    this.lineTableDs.BILL.query();

    this.lineTableDs.INVOICE.setQueryParameter('finalFlag', invoiceTable);
    this.lineTableDs.INVOICE.query();

    this.lineTableDs.PAYMENT.setQueryParameter('finalFlag', paymentTable);
    this.lineTableDs.PAYMENT.query();
  }

  @Bind()
  viewDetail(record, documentType) {
    const { history, closeExeResult } = this.props;
    const documentId = record.get('documentNum');
    getSettleHeaderId(documentId).then((res) => {
      if (res) {
        closeExeResult();
        const { settleHeaderId } = res;
        history.push({
          pathname: '/ssta/supply-settle/detail',
          search: querystring.stringify({
            documentId: settleHeaderId,
            documentType,
            source: 'runDetail',
            type: 'ALL',
          }),
        });
      }
    });
  }

  @Bind()
  handleChangeModeBill(e) {
    this.lineTableDs.BILL.setQueryParameter('finalFlag', e.target.value);
    this.lineTableDs.BILL.query();
    this.setState({
      billTable: e.target.value,
      billTabs: e.target.value === 1 ? 'billFinal' : 'billRecord',
    });
  }

  @Bind()
  handleChangeModeInvoice(e) {
    this.lineTableDs.INVOICE.setQueryParameter('finalFlag', e.target.value);
    this.lineTableDs.INVOICE.query();
    this.setState({
      invoiceTable: e.target.value,
      invoiceTabs: e.target.value === 1 ? 'invoiceFinal' : 'invoiceRecord',
    });
  }

  @Bind()
  handleChangeModePayment(e) {
    this.lineTableDs.PAYMENT.setQueryParameter('finalFlag', e.target.value);
    this.lineTableDs.PAYMENT.query();
    this.setState({
      paymentTable: e.target.value,
      paymentTabs: e.target.value === 1 ? 'paymentFinal' : 'paymentRecord',
    });
  }

  render() {
    const {
      billTabs,
      billTable,
      invoiceTabs,
      invoiceTable,
      paymentTabs,
      paymentTable,
      detailData,
    } = this.state;
    const { settleMatchDimension, uom, amountPrecision, currencyCode } = detailData;
    const lineColumns = {
      BILL: [
        {
          name: 'recordStatusMeaning',
          width: 120,
          tooltip: 'overflow',
          renderer: ({ record, value }) => {
            let color = '';
            switch (record.get('recordStatus')) {
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
            return statusTagRender(value, color);
          },
        },
        {
          name: 'documentNumAndLine',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'quantity',
          width: 120,
          tooltip: 'overflow',
          renderer: amountLocalRender,
        },
        {
          name: 'netPrice',
          width: 180,
          align: 'right',
          tooltip: 'overflow',
          renderer: amountLocalRender,
        },
        {
          name: 'unitPriceBatch',
          width: 120,
          tooltip: 'overflow',
          renderer: amountLocalRender,
        },
        {
          name: 'netAmount',
          width: 180,
          align: 'right',
          tooltip: 'overflow',
          renderer: ({ value, record }) => {
            return decimalPointAccuracy(value, record?.get('amountPrecision'), {
              repair: true,
              check: true,
            });
          },
        },
        {
          name: 'taxRate',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'taxAmount',
          width: 120,
          align: 'right',
          tooltip: 'overflow',
          renderer: ({ value, record }) => {
            return decimalPointAccuracy(value, record?.get('amountPrecision'), {
              repair: true,
              check: true,
            });
          },
        },
        {
          name: 'taxIncludedPrice',
          width: 120,
          align: 'right',
          tooltip: 'overflow',
          renderer: amountLocalRender,
        },
        {
          name: 'taxIncludedAmount',
          width: 120,
          align: 'right',
          tooltip: 'overflow',
          renderer: ({ value, record }) => {
            return decimalPointAccuracy(value, record?.get('amountPrecision'), {
              repair: true,
              check: true,
            });
          },
        },
        {
          name: 'executionDate',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'recordSource',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'companyName',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'supplierCompanyName',
          width: 120,
          tooltip: 'overflow',
        },
      ],
      INVOICE: [
        {
          name: 'recordStatusMeaning',
          width: 120,
          tooltip: 'overflow',
          renderer: ({ record, value }) => {
            let color = '';
            switch (record.get('recordStatus')) {
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
            return statusTagRender(value, color);
          },
        },
        {
          name: 'documentNumAndLine',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'quantity',
          width: 120,
          tooltip: 'overflow',
          renderer: amountLocalRender,
        },
        {
          name: 'netPrice',
          width: 180,
          renderer: amountLocalRender,
        },
        {
          name: 'unitPriceBatch',
          width: 120,
          tooltip: 'overflow',
          renderer: amountLocalRender,
        },
        {
          name: 'netAmount',
          width: 180,
          align: 'right',
          tooltip: 'overflow',
          renderer: ({ value, record }) => {
            return decimalPointAccuracy(value, record?.get('amountPrecision'), {
              repair: true,
              check: true,
            });
          },
        },
        {
          name: 'taxRate',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'taxAmount',
          width: 120,
          align: 'right',
          tooltip: 'overflow',
          renderer: ({ value, record }) => {
            return decimalPointAccuracy(value, record?.get('amountPrecision'), {
              repair: true,
              check: true,
            });
          },
        },
        {
          name: 'taxIncludedPrice',
          width: 120,
          align: 'right',
          tooltip: 'overflow',
          renderer: amountLocalRender,
        },
        {
          name: 'taxIncludedAmount',
          width: 120,
          align: 'right',
          tooltip: 'overflow',
          renderer: ({ value, record }) => {
            return decimalPointAccuracy(value, record?.get('amountPrecision'), {
              repair: true,
              check: true,
            });
          },
        },
        {
          name: 'executionDate',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'recordSource',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'companyName',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'supplierCompanyName',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'opr',
          width: 120,
          renderer: ({ record }) => (
            <a onClick={() => this.viewDetail(record, 'INVOICE')}>
              {intl.get(`ssta.costSheet.view.message.panel.viewDetail`).d('详情')}
            </a>
          ),
        },
      ],
      PAYMENT: [
        {
          name: 'recordStatusMeaning',
          width: 120,
          tooltip: 'overflow',
          renderer: ({ record, value }) => {
            let color = '';
            switch (record.get('recordStatus')) {
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
            return statusTagRender(value, color);
          },
        },
        {
          name: 'documentNumAndLine',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'paymentTypeMeaning',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'paymentAmount',
          width: 120,
          align: 'right',
          tooltip: 'overflow',
          renderer: ({ value, record }) => {
            return decimalPointAccuracy(value, record?.get('amountPrecision'), {
              repair: true,
              check: true,
            });
          },
        },
        {
          name: 'executionDate',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'recordSource',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'settleHeaderNum',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'companyName',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'supplierCompanyName',
          width: 120,
          tooltip: 'overflow',
        },
        {
          name: 'opr',
          width: 120,
          renderer: ({ record }) => (
            <a onClick={() => this.viewDetail(record, 'PAYMENT')}>
              {intl.get(`ssta.costSheet.view.message.panel.viewDetail`).d('详情')}
            </a>
          ),
        },
      ],
    };
    return (
      <div>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          // title={intl.get(`ssta.costSheet.view.message.panel.checkRecord`).d('对账记录')}
          title={
            <div>
              {intl.get(`${prefix}.view.title.reconciliationInfo`).d('对账信息')}
              &nbsp;
              <span style={{ background: '#d8d6d6' }}>
                {detailData.billRemoveFlag === 1 &&
                  intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
              </span>
            </div>
          }
        >
          <Form
            columns={2}
            labelLayout="vertical"
            // className="injectGuide-card-implementForm"
            className={`${Styles['card-implementForm']}`}
          >
            <ImplementForm
              detailData={detailData}
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
              detailData={detailData}
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
              activeKey={billTabs}
              animated
              tabBarExtraContent={
                <div className="ssta-reconciliation-mode">
                  <Radio.Group value={billTable} onChange={this.handleChangeModeBill}>
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
              <TabPane key={billTable === 1 ? 'billFinal' : 'billRecord'}>
                <Table
                  columns={lineColumns.BILL}
                  dataSet={this.lineTableDs.BILL}
                  selectionMode="click"
                  queryFieldsLimit={3}
                />
              </TabPane>
            </Tabs>
          </div>
        </Card>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          // title={intl.get(`ssta.costSheet.view.message.panel.invRecord`).d('开票记录')}
          title={
            <div>
              {intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.invoiceStatusInfo`)
                .d('发票申请信息')}
              &nbsp;
              <span style={{ background: '#d8d6d6' }}>
                {detailData.invoiceRemoveFlag === 1 &&
                  intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
              </span>
            </div>
          }
        >
          <Form columns={2} labelLayout="vertical" className={Styles['card-implementForm']}>
            <ImplementForm
              detailData={detailData}
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
              detailData={detailData}
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
              activeKey={invoiceTabs}
              animated
              tabBarExtraContent={
                <div className="ssta-reconciliation-mode">
                  <Radio.Group value={invoiceTable} onChange={this.handleChangeModeInvoice}>
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
              <TabPane key={invoiceTable === 1 ? 'invoiceFinal' : 'invoiceRecord'}>
                <Table
                  columns={lineColumns.INVOICE}
                  dataSet={this.lineTableDs.INVOICE}
                  selectionMode="click"
                  queryFieldsLimit={3}
                />
              </TabPane>
            </Tabs>
          </div>
        </Card>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          // title={intl.get(`ssta.costSheet.view.message.panel.payRecord`).d('付款记录')}
          title={
            <div>
              {intl
                .get('ssta.supplySettlePool.view.title.billHeaderCollectionInfo')
                .d('收款申请信息')}
              &nbsp;
              <span style={{ background: '#d8d6d6' }}>
                {detailData.paymentRemoveFlag === 1 &&
                  intl.get(`${prefix}.view.title.pending`).d('暂挂中')}
              </span>
            </div>
          }
        >
          <Form columns={2} labelLayout="vertical" className={Styles['card-implementForm']}>
            <ImplementForm
              detailData={detailData}
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
              detailData={detailData}
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
                  <Radio.Group value={paymentTable} onChange={this.handleChangeModePayment}>
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
              <TabPane key={paymentTable === 1 ? 'paymentFinal' : 'paymentRecord'}>
                <Table
                  columns={lineColumns.PAYMENT}
                  dataSet={this.lineTableDs.PAYMENT}
                  selectionMode="click"
                  queryFieldsLimit={3}
                />
              </TabPane>
            </Tabs>
          </div>
        </Card>
      </div>
    );
  }
}

export default ExeResult;
