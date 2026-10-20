import React, { Component } from 'react';
import { Form, InputNumber, Input, Select, Popover, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { sum, isNumber, isEmpty, isFunction } from 'lodash';
import { connect } from 'dva';

import { getDateFormat } from 'utils/utils';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import notification from 'utils/notification';
import EditTable from '_components/EditTable';
import Checkbox from 'components/Checkbox';
import { Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender, roundEliminate } from '@/utils/renderer';
import LadderLevel from '../../components/LadderLevel';

import styles from './index.less';

const { Option } = Select;
@connect(({ inquiryHall }) => ({
  inquiryHall,
}))
@Form.create({ fieldNameProp: null })
export default class QuoteLineTable extends Component {
  // 无需纯组件, 因为props都已经扁平化处理!!!
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'quoteLine');
    }
  }

  state = {
    selectStrategy: '', // 快速选用策略
  };

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      inquiryHall: { quoteLine },
    } = this.props;
    const {
      inquiryHall: { quoteLine: preLine },
    } = preProps;
    if (quoteLine !== preLine) {
      return true;
    }
    return null;
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const {
      dispatch,
      inquiryHall: { allLineChange = false },
    } = this.props;
    if (!isEmpty(changeValues) && !allLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          allLineChange: true,
        },
      });
    }
  }

  /**
   * 渲染单价样式
   * 竞价方向为正向时，行号相同的物料，单价最高的标红
   * 否则，单价最小的标红
   */
  renderValidQuotationPrice(val, record, flag) {
    if (val === null) {
      return null;
    }

    const { auctionDirection } = this.props;
    const { itemLineFloorPrice, itemLineHighestPrice } = record;

    // let rfxLineItemNumList = [];
    // if (flag) {
    //   rfxLineItemNumList =
    //     dataSource &&
    //     dataSource
    //       .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
    //       .map((r) => r.baseQuotationPrice);
    // } else {
    //   rfxLineItemNumList =
    //     dataSource &&
    //     dataSource
    //       .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
    //       .map((r) => r.validQuotationPrice);
    // }
    // const validQuotationPriceMax = Math.max(...rfxLineItemNumList);
    // const validQuotationPriceMin = Math.min(...rfxLineItemNumList);
    let min = null;
    let max = null;
    if (flag) {
      min = itemLineFloorPrice;
      max = itemLineHighestPrice;
    }
    let mean = '';
    const formatValue = numberSeparatorRender(val);
    if (auctionDirection === 'FORWARD') {
      mean = max === val ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
    } else {
      mean = min === val ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
    }
    return mean;
  }

  // 表格行选择
  @Bind()
  changeTableSeletion(keys = [], rows = []) {
    const {
      changeAllQuotationLineTableSelection = () => {},
      changeCurrentPaneActiveSelected = () => {},
    } = this.props;

    changeAllQuotationLineTableSelection(keys, rows);
    changeCurrentPaneActiveSelected(rows, 'allSupplier');
  }

  /**
   * 获取表格数据 不校验
   */
  @Bind()
  getTableData(dataSource = []) {
    const paramsList = [];
    if (Array.isArray(dataSource)) {
      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].$form && dataSource[i]._status) {
          paramsList.push({ ...dataSource[i], ...dataSource[i].$form.getFieldsValue() });
        }
      }
    }
    return paramsList;
  }

  /**
   * 改变策略
   */
  @Bind()
  changeselecStrategy(value) {
    const {
      dispatch,
      dataSource = [],
      fetchQuoteLine,
      fetchSupplierLine,
      fetchItemLine,
      match: { params },
    } = this.props;
    const tableData = this.getTableData(dataSource);
    const rfxQuotationLineList = tableData.filter((item) => item.suggestedFlag);
    if (value === 'MINIMUM') {
      this.setState({ selectStrategy: 'MINIMUM' });
    } else {
      this.setState({ selectStrategy: '' });
    }
    if (value) {
      dispatch({
        type: 'inquiryHall/batchChangeChooseStrategy',
        payload: {
          selectStrategy: value,
          rfxHeaderId: params.rfxId,
          rfxQuotationLineList,
        },
      }).then(() => {
        notification.success();
        // FIXED 有一个渲染机制问题,临时处理
        dispatch({
          type: 'inquiryHall/updateState',
          payload: {
            quoteLine: [],
            quoteLinePagination: {},
          },
        });

        fetchItemLine();
        fetchSupplierLine();
        fetchQuoteLine();
      });
    }
    this.forceUpdate();
  }

  // 选用 改变
  @Bind()
  changeSuggestedFlag(e = {}, record = {}) {
    if (e.target.checked) {
      record.$form.setFieldsValue({
        allottedQuantity: record.rfxQuantity,
        suggestedFlag: 1,
      });
    } else {
      record.$form.setFieldsValue({
        allottedQuantity: '',
        allottedRatio: '',
        suggestedRemark: '',
        suggestedFlag: 0,
      });
    }
  }

  render() {
    const {
      checkWay,
      // organizationId,
      loading,
      dataSource,
      pagination,
      form,
      rankRule,
      priceTypeCode,
      multiCurrencyFlag,
      quoteLineSelectionStrategy,
      hideModal,
      viewLadderLevel,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      customizeTable,
      fetchQueryPriceInfoLoading,
      allQuotationLineTableSelectedKeys = [],
      allQuotationLineTableSelectedRows = [],
      changeQuoteLinePagination,
    } = this.props;
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
    };

    const rowSelection = {
      selectedRows: allQuotationLineTableSelectedRows,
      selectedRowKeys: allQuotationLineTableSelectedKeys,
      onChange: this.changeTableSeletion,
      getCheckboxProps: (record) => ({
        disabled: record.eliminateRoundNumber,
      }),
    };

    const { selectStrategy = '' } = this.state;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        dataIndex: 'suggestedFlag',
        width: 60,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('suggestedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  onChange={(e) => this.changeSuggestedFlag(e, record)}
                  disabled={
                    record.invalidFlag ||
                    record.summaryReviewResult === 'NO_APPROVED' ||
                    record.eliminateRoundNumber
                  }
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'companyName',
        width: 250,
        render: (val, record) => roundEliminate(val, record),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
        dataIndex: 'candidateSuggestion',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 120,
      },
      multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`)
              .d('报价币种'),
            dataIndex: 'quotationCurrencyCode',
            width: 100,
          }
        : '',
      multiCurrencyFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 100,
          }
        : '',
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
        render: (val, record) => {
          if (record.baseQuotationPrice) {
            return numberSeparatorRender(val);
          } else {
            this.renderValidQuotationPrice(val, record, false);
          }
        },
      },
      rankRule === 'WEIGHT_PRICE'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
            dataIndex: 'priceCoefficient',
            width: 100,
          }
        : '',
      rankRule === 'WEIGHT_PRICE'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
            dataIndex: 'weightPrice',
            width: 100,
            render: numberSeparatorRender,
          }
        : '',
      {
        title: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        dataIndex: 'perNetPrice',
        width: 120,
      },
      {
        title: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        dataIndex: 'perTaxIncludedPrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
        dataIndex: 'referencePrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        dataIndex: 'differentPrice',
        width: 100,
        render: (val, record) =>
          record.validQuotationPrice !== null && record.referencePrice !== null
            ? record.validQuotationPrice - record.referencePrice
            : '',
      },
      multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
              .d('本币含税单价'),
            dataIndex: 'baseQuotationPrice',
            align: 'right',
            width: 100,
            render: (val, record) => val && this.renderValidQuotationPrice(val, record, true),
          }
        : '',
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <React.Fragment>
            {<QuotationDetail rowData={record} sourceFrom="RFX" allowBuyerViewFlag />}
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 110,
        align: 'right',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('priceBatchQuantity', {
                initialValue:
                  val || val === 0 ? val : record.batchPrice === null ? 1 : record.batchPrice,
                rules: [
                  {
                    required: record.$form.getFieldValue('suggestedFlag'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  disabled={!record.$form.getFieldValue('suggestedFlag')}
                  max={99999999999999}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      checkWay === 'quantity'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
            dataIndex: 'allottedQuantity',
            width: 100,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('allottedQuantity', {
                    initialValue: val,
                    rules: [
                      {
                        required: record.$form.getFieldValue('suggestedFlag'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`)
                            .d('分配数量'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      disabled={!record.$form.getFieldValue('suggestedFlag')}
                      type="hzero"
                      max={99999999999999}
                      uom={record.uomId}
                      style={{ width: '100%' }}
                      // onChange={e => allottedQuantityChange(e, record)}
                    />
                  )}
                </Form.Item>
              ) : (
                val
              ),
          }
        : {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
            dataIndex: 'allottedRatio',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('allottedRatio', {
                    initialValue: val,
                    rules: [
                      {
                        required: record.$form.getFieldValue('suggestedFlag'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`)
                            .d('分配比例%'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      disabled={!record.$form.getFieldValue('suggestedFlag')}
                      min={0}
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              ) : (
                val
              ),
          },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationStatus`).d('报价状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        dataIndex: 'suggestedRemark',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('suggestedRemark', {
                initialValue:
                  val ||
                  (selectStrategy === 'MINIMUM' && record.$form.getFieldValue('suggestedFlag')
                    ? `${intl.get('ssrc.inquiryHall.model.inquiryHall.minPrice').d('最低价')}`
                    : ''),
                rules: [
                  {
                    required: record.$form.getFieldValue('suggestedFlag'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
                    }),
                  },
                  {
                    max: 500,
                    message: intl.get('hzero.common.validation.max', {
                      max: 500,
                    }),
                  },
                ],
              })(<Input disabled={!record.$form.getFieldValue('suggestedFlag')} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        dataIndex: 'preQuotationPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
        dataIndex: 'initialFluctuation',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: (val) => (val !== null ? numberSeparatorRender(val) : '-'),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 140,
        render: numberSeparatorRender,
      },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`)
              .d('预估单价(含税)'),
            dataIndex: 'estimatedPrice',
            width: 100,
          }
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
              .d('预估单价(不含税)'),
            dataIndex: 'netEstimatedPrice',
            width: 100,
          },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`)
              .d('预估行金额(含税)'),
            dataIndex: 'estimatedAmount',
            width: 100,
          }
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
              .d('预估行金额(不含税)'),
            dataIndex: 'netEstimatedAmount',
            width: 100,
          },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDescription`).d('报价说明'),
        dataIndex: 'validQuotationRemark',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        dataIndex: 'paymentTypeName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        dataIndex: 'paymentTermName',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
        render: (val) =>
          val ? (
            <Attachment
              readOnly
              bucketName="private-bucket"
              bucketDirectory="ssrc-rfx-quotationline"
              value={val}
              viewMode="popup"
            />
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.productionPlace').d('产地'),
        dataIndex: 'origin',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 180,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('validExpiryDateFrom', {
              initialValue: val && moment(val, 'YYYY-MM-DD'),
            })(
              <DatePicker
                style={{ width: '100%' }}
                disabled
                format={getDateFormat()}
                disabledDate={(currentDate) =>
                  record?.$form.getFieldValue('validExpiryDateTo') &&
                  moment(record?.$form.getFieldValue('validExpiryDateTo')).isBefore(
                    currentDate,
                    'day'
                  )
                }
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 180,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('validExpiryDateTo', {
              initialValue: val && moment(val, 'YYYY-MM-DD'),
            })(
              <DatePicker
                style={{ width: '100%' }}
                disabled
                format={getDateFormat()}
                disabledDate={(currentDate) =>
                  record?.$form.getFieldValue('validExpiryDateFrom') &&
                  moment(record?.$form.getFieldValue('validExpiryDateFrom')).isAfter(
                    currentDate,
                    'day'
                  )
                }
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.promDeliveryDate').d('承诺交货日期'),
        dataIndex: 'validPromisedDate',
        width: 120,
        render: dateRender,
      },

      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.changePercent`).d('涨跌幅(%)'),
        dataIndex: 'changePercent',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        width: 100,
        render: (val, record) => {
          if (val === 0) {
            return '';
          }
          return numberSeparatorRender(val, record);
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
        dataIndex: 'minPrice',
        width: 100,
        render: numberSeparatorRender,
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        <div className={styles['allQutation-select']}>
          <Form layout="inline">
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quickSelection`).d('快速选用')}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{
                width: '260px',
              }}
            >
              {form.getFieldDecorator('selectedPolicyValue')(
                <Select allowClear onChange={this.changeselecStrategy}>
                  {quoteLineSelectionStrategy &&
                    quoteLineSelectionStrategy.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Form>
          {fetchQueryPriceInfoLoading && (
            <Button icon="sync" loading={fetchQueryPriceInfoLoading}>
              {intl.get(`ssrc.inquiryHall.view.message.button.updating`).d('更新中')}
            </Button>
          )}
        </div>

        {customizeTable(
          { code: 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL' },
          <EditTable
            bordered
            rowKey="quotationLineId"
            loading={loading}
            columns={columns}
            scroll={{ x: scrollX, y: '40vh' }}
            dataSource={dataSource}
            pagination={pagination}
            onDataChange={this.hasChangeData}
            onChange={(page) => changeQuoteLinePagination(page)}
            rowSelection={rowSelection}
          />
        )}
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}
