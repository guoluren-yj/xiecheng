/**
 * DetailTable.js - 发票行明细表格
 * @date: 2018-12-03
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, InputNumber, Input } from 'hzero-ui';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import EditTable from 'components/EditTable';
import { math } from 'choerodon-ui/dataset';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  thousandBitSeparator,
  // precisionParams,
  precisionNum,
  thousandBitSeparatorIsNew,
  thousandBitSeparatorCut,
  cutZero,
  getIncTaxAmountByNetPrice,
  getNetPriceByTaxIncPrice,
} from '@/routes/utils';
import styles from '../index.less';
import { TreeInput } from './TreeInput';

const promptCode = 'sfin.invoiceBill';

@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/queryDetailLine'],
  queryTaxationDataing: loading.effects['invoice/queryTaxationData'],
  queryTreeDataing: loading.effects['invoice/queryTreeData'],

  organizationId: getCurrentOrganizationId(),
}))
@withRouter
@withCustomize({
  unitCode: ['SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE'],
})
@formatterCollections({
  code: ['smdm.materiel'],
})
export default class DetailTable extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/batchQuerySetting',
      payload: {
        '010505': '010505', // 对账及开票基准价
      },
    });
    this.init();
  }

  // shouldComponentUpdate (prevProps) {
  //   if (prevProps.defaultActiveKey !== this.props.defaultActiveKey) {
  //     this.handleSearch();
  //     // eslint-disable-next-line react/no-did-update-set-state
  //     return true;
  //   }
  // }

  componentDidUpdate(prevProps) {
    const { match, showPubType = true } = prevProps;
    if (showPubType) {
      if (match.params.invoiceHeaderId !== undefined) {
        const { invoiceHeaderId } = match.params;
        if (this.props.match.params.invoiceHeaderId !== invoiceHeaderId) {
          // eslint-disable-next-line react/no-did-update-set-state
          this.handleSearch();
        }
      } else if (prevProps.defaultActiveKey !== this.props.defaultActiveKey) {
        this.handleSearch();
      }
    }
  }

  @Bind()
  setTreeInputData(data) {
    this.TreeInputData = data;
  }

  @Bind()
  getTreeInput(taxItemId = null, fn) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `invoice/queryTreeData`,
      payload: {
        organizationId,
        taxItemId,
      },
    }).then(fn);
  }

  @Bind()
  getTaxationData(page = {}, taxItemId = null, fn) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `invoice/queryTaxationData`,
      payload: {
        page,
        organizationId,
        taxItemId,
      },
    }).then(fn);
  }

  @Bind()
  init() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}, _, sort = {}) {
    const { dispatch, match, type } = this.props;
    if (match.params.invoiceHeaderId !== undefined) {
      const { invoiceHeaderId } = match.params;
      dispatch({
        type: 'invoice/queryDetailLine',
        payload: {
          sort,
          customizeUnitCode: 'SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE',
          type,
          invoiceHeaderId,
          page,
        },
      });
    } else {
      const { invoiceHeaderId } = this.props;
      dispatch({
        type: 'invoice/queryDetailLine',
        payload: {
          sort,
          customizeUnitCode: 'SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE',
          type,
          invoiceHeaderId,
          page,
        },
      });
    }
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  numberFixed(exp, per) {
    const num = Number(per) || 0;
    return math.toFixed(exp, num);
  }

  @Bind
  changeGoodsName(val, record) {
    const simpleName = record.$form.getFieldValue('taxItemSimpleName');
    const invoiceName = val.target.value;
    record.$form.setFieldsValue({
      goodsName: `*${simpleName}*${invoiceName}`,
    });
  }

  @Bind()
  handleInPriceChange(value, record) {
    const val = value?.includes(',') ? value?.replace(/\$\s?|(,*)/g, '') : value;
    const {
      dispatch,
      type,
      invoice: { detailLine = {}, detailLinePagination = {} },
    } = this.props;
    const lines = detailLine[type];
    const pagination = detailLinePagination[type];
    const {
      quantity,
      unitPriceBatch,
      taxRate,
      invoiceLineId,
      taxAmountUpdFlag,
      pricePrecision,
      amountPrecision,
    } = record;
    const newTaxRate = math.div(taxRate, 100);
    // 含税金额
    const taxIncludedAmount = this.numberFixed(
      math.div(math.multipliedBy(val, quantity), unitPriceBatch),
      amountPrecision
    );
    // 税额
    const taxAmount = this.numberFixed(
      math.div(math.multipliedBy(taxIncludedAmount, newTaxRate), math.plus(1, newTaxRate)),
      amountPrecision
    );
    // 不含税金额
    const netAmount = this.numberFixed(math.minus(taxIncludedAmount, taxAmount), amountPrecision);
    // 不含税单价
    const netPrice =
      quantity === 0
        ? this.numberFixed(math.div(val, math.plus(1, newTaxRate)), pricePrecision)
        : getNetPriceByTaxIncPrice(val, quantity, taxRate, pricePrecision, unitPriceBatch, taxAmountUpdFlag, amountPrecision);

    const taxIncludedPrice = cutZero(this.numberFixed(val, pricePrecision));
    record.$form.setFieldsValue({ taxIncludedPrice });

    dispatch({
      type: 'invoice/updateDetailLine',
      payload: {
        type,
        lines: {
          ...lines,
          content: (lines.content || []).map((item) =>
            item.invoiceLineId === invoiceLineId && ['update', 'create'].includes(type)
              ? { ...item, netPrice, taxIncludedAmount, netAmount, taxAmount }
              : item
          ),
        },
        pagination,
      },
    });
    // 如果税额可编辑，需设置表单
    if (taxAmountUpdFlag) {
      record.$form.setFieldsValue({ taxAmount });
    }
  }

  @Bind()
  handleNetPriceChange(value, record) {
    // 使用onBlur方法后同时配置了allowThousandth，如果超过千位返回的value会带有千分位符号，需要去掉，不然计算会NaN
    const val = value?.includes(',') ? value?.replace(/\$\s?|(,*)/g, '') : value;
    const {
      dispatch,
      type,
      invoice: { detailLine = {}, detailLinePagination = {} },
    } = this.props;
    const lines = detailLine[type];
    const pagination = detailLinePagination[type];
    const {
      quantity,
      unitPriceBatch,
      taxRate,
      invoiceLineId,
      taxAmountUpdFlag,
      pricePrecision,
      amountPrecision,
    } = record;
    const newTaxRate = math.div(taxRate, 100);

    const netPrice = cutZero(this.numberFixed(val, pricePrecision));
    record.$form.setFieldsValue({ netPrice });

    // 不含税金额
    const netAmount = this.numberFixed(
      math.div(math.multipliedBy(val, quantity), unitPriceBatch),
      amountPrecision
    );
    // 税额
    const taxAmount = this.numberFixed(math.multipliedBy(netAmount, newTaxRate), amountPrecision);
    // 含税金额
    const taxIncludedAmount = this.numberFixed(math.plus(netAmount, taxAmount), amountPrecision);

    // 含税单价
    const taxIncludedPrice =
      quantity === 0
        ? this.numberFixed(math.multipliedBy(val, math.plus(1, newTaxRate)), pricePrecision)
        : getIncTaxAmountByNetPrice(val, quantity, taxRate, pricePrecision, unitPriceBatch, taxAmountUpdFlag, amountPrecision);

    dispatch({
      type: 'invoice/updateDetailLine',
      payload: {
        type,
        lines: {
          ...lines,
          content: (lines.content || []).map((item) =>
            item.invoiceLineId === invoiceLineId && ['update', 'create'].includes(type)
              ? { ...item, taxIncludedPrice, taxIncludedAmount, netAmount, taxAmount }
              : item
          ),
        },
        pagination,
      },
    });
    // 如果税额可编辑，需设置表单
    if (taxAmountUpdFlag) {
      record.$form.setFieldsValue({ taxAmount });
    }
  }

  @Bind()
  handleTaxAmountChange(val, record) {
    const {
      dispatch,
      type,
      invoice: { detailLine = {}, detailLinePagination = {} },
    } = this.props;
    const lines = detailLine[type];
    const pagination = detailLinePagination[type];
    const { taxIncludePriceUpdFlag, invoiceLineId, amountPrecision } = record;
    // 不含税金额
    const netAmount = this.numberFixed(
      math.minus(record.taxIncludedAmount, val),
      amountPrecision || 2
    );
    // 含税金额
    const taxIncludedAmount = this.numberFixed(
      math.plus(record.netAmount, val),
      amountPrecision || 2
    );

    dispatch({
      type: 'invoice/updateDetailLine',
      payload: {
        type,
        lines: {
          ...lines,
          content: (lines.content || []).map((item) =>
            item.invoiceLineId === invoiceLineId && ['update', 'create'].includes(type)
              ? taxIncludePriceUpdFlag
                ? { ...item, netAmount }
                : { ...item, taxIncludedAmount }
              : item
          ),
        },
        pagination,
      },
    });
  }

  render() {
    const {
      loading,
      customizeTable,
      invoice: { detailLine = {}, detailLinePagination = {}, settings = {} },
      permitDirectInvoiceFlag,
      type,
      rowSelection = null,
      queryTreeDataing = false,
      queryTaxationDataing = false,
    } = this.props;
    const TreeInputProps = {
      queryTreeDataing,
      getTreeInput: this.getTreeInput,
      queryTaxationDataing,
      getTaxationData: this.getTaxationData,
    };
    // record.$form.getFieldDecorator('taxItemId', {
    //   initialValue: value,
    // })
    const setting010505 = settings['010505'] && settings['010505'].settingValue;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceLineNum`).d('发票行号'),
        dataIndex: 'invoiceLineNum',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 120,
        fixed: 'left',
      },

      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxItemCode`).d('税收商品编码'),
        dataIndex: 'taxItemCode',
        width: 120,
        render: (value, record) => {
          if (['create', 'update'].includes(type)) {
            const { taxItemId } = record;
            record.$form.getFieldDecorator('taxItemId', {
              initialValue: taxItemId,
            });
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('taxItemCode', {
                  initialValue: value,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.invoiceBill.taxItemCode`)
                          .d('税收商品编码'),
                      }),
                    },
                  ],
                })(
                  <TreeInput
                    record={record}
                    setTreeInputData={this.setTreeInputData}
                    initialValue={value}
                    TreeInputProps={TreeInputProps}
                  />
                )}
              </Form.Item>
            );
          }
        },
      },

      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxItemSimpleName`).d('税收商品简称'),
        dataIndex: 'taxItemSimpleName',
        width: 120,
        render: (value, record) => {
          if (['create', 'update'].includes(type)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('taxItemSimpleName', {
                  initialValue: value,
                })(<Input disabled />)}
              </Form.Item>
            );
          }
        },
      },

      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceItemName`).d('发票品名'),
        dataIndex: 'invoiceItemName',
        width: 120,
        render: (value, record) => {
          if (['create', 'update'].includes(type)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('invoiceItemName', {
                  initialValue: value,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.invoiceBill.invoiceItemName`)
                          .d('发票品名'),
                      }),
                    },
                  ],
                })(<Input onChange={(val) => this.changeGoodsName(val, record)} />)}
              </Form.Item>
            );
          }
        },
      },

      {
        title: intl.get(`${promptCode}.model.invoiceBill.goodsName`).d('货物或应税劳务、服务名称'),
        dataIndex: 'goodsName',
        width: 120,
        render: (value, record) => {
          const { taxItemSimpleName, invoiceItemName } = record;
          if (['create', 'update'].includes(type)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('goodsName', {
                  initialValue: `*${taxItemSimpleName}*${invoiceItemName}`,
                })(<Input disabled />)}
              </Form.Item>
            );
          }
        },
      },

      {
        title: intl.get('smdm.materiel.model.materiel.commonName').d('通用名'),
        dataIndex: 'commonName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemDesc`).d('供应商料号描述'),
        dataIndex: 'supplierItemDesc',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceQuantity`).d('本次开票数量'),
        dataIndex: 'quantity',
        width: 150,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        width: 180,
        align: 'right',
        render: (value, record) => {
          const { orignNetPrice, priceShieldFlag, netPriceUpdFlag } = record;
          if (priceShieldFlag) {
            return '***';
          } else if (netPriceUpdFlag && ['create', 'update'].includes(type)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`netPrice`, {
                  initialValue: value,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.invoiceBill.netPrice`).d('不含税单价'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    allowThousandth
                    // {...precisionParams(value, true)}
                    onBlur={(e) => this.handleNetPriceChange(e.target.value, record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (type === 'approve' || type === 'review') &&
              +value !== +orignNetPrice &&
              setting010505 === 'NET_PRICE' ? (
                <span style={{ color: 'red' }}>
                  {thousandBitSeparatorCut(value, record.pricePrecision)}
                </span>
            ) : (
              thousandBitSeparatorCut(value, record.pricePrecision)
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        width: 120,
        align: 'right',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag ? '***' : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
        dataIndex: 'taxRate',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        render: (value, record) => {
          const { priceShieldFlag, taxAmountUpdFlag } = record;
          return priceShieldFlag ? (
            '***'
          ) : taxAmountUpdFlag && ['create', 'update'].includes(type) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`taxAmount`, {
                initialValue: value,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
                    }),
                  },
                  {
                    // eslint-disable-next-line
                    validator: (i, value, callback) => {
                      const currentLength = math.dp(value);

                      if (currentLength > record.amountPrecision) {
                        callback(intl.get(`${promptCode}.msgError`).d(`精度校验不通过`));
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  precision={precisionNum(value, record, 'taxAmount')}
                  // {...precisionParams(value, true)}
                  allowThousandth
                  onChange={(val) => this.handleTaxAmountChange(val, record)}
                />
              )}
            </Form.Item>
          ) : (
            thousandBitSeparator(value, record.amountPrecision)
          );
        },
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        align: 'right',
        width: 150,
        render: (value, record) => {
          const { orignTaxIncludedPrice, priceShieldFlag, taxIncludePriceUpdFlag } = record;

          if (priceShieldFlag) {
            return '***';
          } else if (taxIncludePriceUpdFlag && ['create', 'update'].includes(type)) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`taxIncludedPrice`, {
                  initialValue: value,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.invoiceBill.taxIncludedPrice`)
                          .d('含税单价'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    // {...precisionParams(value, true)}
                    allowThousandth
                    onBlur={(e) => this.handleInPriceChange(e.target.value, record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return (type === 'approve' || type === 'review') &&
              +value !== +orignTaxIncludedPrice &&
              setting010505 === 'TAX_INCLUDED_PRICE' ? (
                <span style={{ color: 'red' }}>
                  {thousandBitSeparatorCut(value, record.pricePrecision)}
                </span>
            ) : (
              thousandBitSeparatorCut(value, record.pricePrecision)
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        width: 120,
        align: 'right',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag ? '***' : thousandBitSeparatorIsNew(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.asnNumAndAsnLineNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxAndLineNum`).d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        width: 180,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 140,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.billNumAndBillLineNum`).d('对账单号|行号'),
        dataIndex: 'billNumAndBillLineNum',
        // width: 150,
      },
    ];
    if (type === 'approve' || type === 'review') {
      columns.splice(1, 0, {
        title: intl.get(`${promptCode}.model.invoiceBill.priceDifferenceFlag`).d('比对结果'),
        dataIndex: 'priceDifferenceMsgMeaning',
        width: 150,
        fixed: 'left',
        onCell: (record) => {
          const { priceDifferenceFlag } = record;
          if (+priceDifferenceFlag === 1) {
            return { className: styles['invoice-diff-col'] };
          } else if (priceDifferenceFlag === 0) {
            return { className: styles['invoice-normal-col'] };
          } else {
            return {};
          }
        },
        render: (value, record) => {
          if (!Number.isNaN(Number(value))) {
            return thousandBitSeparatorCut(value || 0, record.pricePrecision);
          } else {
            return value;
          }
        },
      });

      if (setting010505 === 'NET_PRICE') {
        columns.splice(8, 0, {
          title: intl.get(`${promptCode}.model.invoiceBill.rawNetPrice`).d('原不含税价'),
          dataIndex: 'orignNetPrice',
          width: 120,
          render: (value, record) => {
            const { netPrice, priceShieldFlag } = record;

            if (priceShieldFlag) {
              return '***';
            } else {
              return (type === 'approve' || type === 'review') && +value !== +netPrice ? (
                <span style={{ color: 'red' }}>{thousandBitSeparatorCut(value, 10)}</span>
              ) : (
                thousandBitSeparatorCut(value, 10)
              );
            }
          },
        });
      }

      if (setting010505 === 'TAX_INCLUDED_PRICE') {
        columns.splice(8, 0, {
          title: intl.get(`${promptCode}.model.invoiceBill.rawTaxPrice`).d('原含税价'),
          dataIndex: 'orignTaxIncludedPrice',
          width: 140,
          render: (value, record) => {
            const { taxIncludedPrice, priceShieldFlag } = record;

            if (priceShieldFlag) {
              return '***';
            } else {
              return (type === 'approve' || type === 'review') && +value !== +taxIncludedPrice ? (
                <span style={{ color: 'red' }}>{thousandBitSeparatorCut(value, 10)}</span>
              ) : (
                thousandBitSeparatorCut(value, 10)
              );
            }
          },
        });
      }
    }
    if (permitDirectInvoiceFlag !== 1) {
      if (type === 'approve' || type === 'review') {
        columns.splice(4, 4);
      } else {
        columns.splice(3, 4);
      }
    }
    const scrollWidth = this.scrollWidth(columns, 230);
    const dataSource = (detailLine[type] && detailLine[type].content) || [];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SFIN.INVOICE_UPDATE_DETAIL.INVOICE_LINE',
          },
          <EditTable
            bordered
            loading={loading}
            rowKey="invoiceLineId"
            columns={columns}
            rowSelection={rowSelection}
            dataSource={dataSource}
            pagination={detailLinePagination[type]}
            onChange={this.handleSearch}
            scroll={{ x: scrollWidth, y: 'calc(100vh - 422px)' }}
          />
        )}
      </React.Fragment>
    );
  }
}
