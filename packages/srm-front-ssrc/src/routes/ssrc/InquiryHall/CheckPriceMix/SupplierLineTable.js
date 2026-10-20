import React, { PureComponent } from 'react';
import { Form, InputNumber, Input, Checkbox, Popover, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isEmpty, isFunction, noop } from 'lodash';
import moment from 'moment';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { getDateFormat } from 'utils/utils';
import EditTable from 'components/EditTable';
import { Attachment } from 'choerodon-ui/pro';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender, roundEliminate } from '@/utils/renderer';
import { INQUIRY, getQuotationName } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';

import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';

export default class SupplierLineTable extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.rfxLineSupplierId, this);
    }
    this.state = {
      suggestedFlagValue: {},
    };
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
  }

  /**
   * 选用状态->整包推荐-todo,e.target.value
   * 当选用状态，全部选用时，整包推荐也勾选上
   */
  @Bind()
  changeSuggestedFlag(e, quotationLineId, rfxLineSupplierId) {
    const { dataSource, onSetWholePackageFlag, onSetWholePackageFlagFalse } = this.props;
    const { suggestedFlagValue } = this.state;
    // 从dataSource中过滤出供应商行相同的未操作的明细数据
    const newDataSource = dataSource.filter(
      // eslint-disable-next-line
      (r) => r.rfxLineSupplierId == rfxLineSupplierId && r.quotationLineId !== quotationLineId
    );
    // 未操作的明细数据和正在操作的数据，都勾选时，设置整包推荐为1，否则为0
    if (
      newDataSource.every(
        (item) => item.$form && item.$form.getFieldValue('suggestedFlag') === 1
      ) &&
      !e.target.value
    ) {
      onSetWholePackageFlag(rfxLineSupplierId);
    } else {
      onSetWholePackageFlagFalse(rfxLineSupplierId);
    }
    // 将正在操作的数据，设置必填项
    this.setState({
      suggestedFlagValue: {
        ...suggestedFlagValue,
        [`${quotationLineId}#${rfxLineSupplierId}`]: Number(!e.target.value),
      },
    });
  }

  // 表格行选择
  @Bind()
  changeTableSeletion(keys = [], rows = []) {
    const {
      changeSupplierLineTableSelection = () => {},
      changeCurrentPaneActiveSelected,
      rfxLineSupplierId,
    } = this.props;

    changeSupplierLineTableSelection(keys, rows);
    changeCurrentPaneActiveSelected(rows, rfxLineSupplierId);
  }

  render() {
    const {
      checkWay,
      // organizationId,
      header = {},
      rfxLineSupplierId,
      loadingObj,
      onChange,
      dataSource,
      pagination,
      viewLadderLevel,
      customizeTable,
      sourceKey = INQUIRY,
      renderValidQuotationQuantity = noop,
      supplierLineTableSelectedKeys = [],
      supplierLineTableSelectedRows = [],
    } = this.props;
    const { onlyAllowAllWinBids = 0 } = header || {};
    // eslint-disable-next-line
    const newDataSource = dataSource.filter((r) => r.rfxLineSupplierId == rfxLineSupplierId) || [];
    const newPagination = pagination[rfxLineSupplierId];
    // const wholePackageFlag = form.getFieldValue(`value#${rfxLineSupplierId}`);

    const rowSelection = {
      selectedRows: supplierLineTableSelectedRows,
      selectedRowKeys: supplierLineTableSelectedKeys,
      onChange: this.changeTableSeletion,
      getCheckboxProps: (record) => ({
        disabled: !!onlyAllowAllWinBids || record.eliminateRoundNumber,
      }),
    };

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
                  checkedValue={1}
                  unCheckedValue={0}
                  onChange={(e) => {
                    if (e.target.checked === 1) {
                      record.$form.setFieldsValue({
                        allottedQuantity: record.rfxQuantity,
                      });
                    } else {
                      record.$form.setFieldsValue({
                        allottedQuantity: '',
                        allottedRatio: '',
                      });
                    }
                    this.changeSuggestedFlag(e, record.quotationLineId, record.rfxLineSupplierId);
                  }}
                  disabled={
                    record.invalidFlag ||
                    onlyAllowAllWinBids ||
                    record.summaryReviewResult === 'NO_APPROVED' ||
                    record.eliminateRoundNumber
                  }
                />
              )}
            </Form.Item>
          ) : (
            <span>{yesOrNoRender(val)}</span>
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 250,
        render: (val, record) => roundEliminate(val, record),
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 120,
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
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(sourceKey === 'NEW_BID'),
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      header.multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`)
              .d('报价币种'),
            dataIndex: 'quotationCurrencyCode',
            width: 100,
          }
        : '',
      header.multiCurrencyFlag
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
        render: (val) => (val !== null ? numberSeparatorRender(val) : '-'),
      },
      header.rankRule === 'WEIGHT_PRICE'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
            dataIndex: 'priceCoefficient',
            width: 100,
          }
        : '',
      header.rankRule === 'WEIGHT_PRICE'
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        dataIndex: 'differentPrice',
        width: 100,
        render: (val, record) =>
          (header.priceTypeCode === 'NET_PRICE'
            ? record.validNetPrice
            : record.validQuotationPrice) !== null && record.referencePrice !== null
            ? (header.priceTypeCode === 'NET_PRICE'
                ? record.validNetPrice
                : record.validQuotationPrice) - record.referencePrice
            : '',
      },
      header.multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
              .d('本币含税单价'),
            dataIndex: 'baseQuotationPrice',
            align: 'right',
            width: 120,
            render: numberSeparatorRender,
          }
        : '',
      header.multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`)
              .d('本币单价(不含税)'),
            dataIndex: 'baseNetPrice',
            align: 'right',
            width: 120,
            render: numberSeparatorRender,
          }
        : '',
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
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        width: 100,
        render: numberSeparatorRender,
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
                      disabled={!record.$form.getFieldValue('suggestedFlag') || onlyAllowAllWinBids}
                      max={99999999999999}
                      type="hzero"
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
                      disabled={!record.$form.getFieldValue('suggestedFlag') || onlyAllowAllWinBids}
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        dataIndex: 'suggestedRemark',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('suggestedRemark', {
                initialValue: val,
                rules: [
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        dataIndex: 'preQuotationPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        align: 'right',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
        dataIndex: 'initialFluctuation',
        width: 130,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.priceCompareToFirst`)
          .d('与首次报价差额'),
        dataIndex: 'priceCompareToFirst',
        width: 130,
        render: (value) => {
          if (value * 1 > 0) {
            return `↑ ${value}`;
          } else if (value * 1 < 0) {
            return `↓ ${value}`;
          } else {
            return value;
          }
        },
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
        render: (val, record) => renderValidQuotationQuantity(val, record, 'supplier'),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 80,
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
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`)
              .d('预估单价(含税)'),
            dataIndex: 'estimatedPrice',
            width: 100,
            align: 'right',
          }
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
              .d('预估单价(不含税)'),
            dataIndex: 'netEstimatedPrice',
            width: 100,
            align: 'right',
          },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`)
              .d('预估行金额(含税)'),
            dataIndex: 'estimatedAmount',
            width: 100,
            align: 'right',
          }
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
              .d('预估行金额(不含税)'),
            dataIndex: 'netEstimatedAmount',
            width: 100,
            align: 'right',
          },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
            quotationName: getQuotationName(sourceKey === 'NEW_BID'),
          })
          .d('{quotationName}说明'),
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
        title: intl.get('ssrc.common.productionPlace').d('产地'),
        dataIndex: 'origin',
        width: 120,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('validDeliveryCycle', {
              initialValue: val,
            })(<Input disabled />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('minPurchaseQuantity', {
              initialValue: val,
            })(<PrecisionInputNumber type="hzero" disabled uom={record.uomId} />)}
          </Form.Item>
        ),
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
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 110,
        render: (val) =>
          val ? (
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              value={val}
              viewMode="popup"
            />
          ) : (
            ''
          ),
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`, // 单元编码，必传
        namespace: rfxLineSupplierId,
        // clearCache: () => {},
        // useNewValid: true,
      },
      <EditTable
        bordered
        rowKey="quotationLineId"
        loading={
          loadingObj[rfxLineSupplierId] && loadingObj[rfxLineSupplierId].fetchItemQuoteLineLoading
        }
        columns={columns}
        scroll={{ x: scrollX, y: '30vh' }}
        dataSource={newDataSource}
        pagination={newPagination}
        onDataChange={this.hasChangeData}
        onChange={(page) => onChange(page, rfxLineSupplierId)}
        rowSelection={rowSelection}
      />
    );
  }
}
