/* eslint-disable eqeqeq */
/**
 * 供应商报价-物品行
 * */

import React, { Component } from 'react';
import { Form, DatePicker, Input, Popover, InputNumber, Badge, Tag } from 'hzero-ui';
import { Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import moment from 'moment';
import { isNumber, sum, isEmpty, noop } from 'lodash';
import { Bind } from 'lodash-decorators';

import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import { getDateFormat, getCurrentTenant } from 'utils/utils';
import { dateRender, enableRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
// import EditTable from '_components/EditTable';
import Lov from 'components/Lov';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import styles from '@/routes/ssrc/InquiryHall/Update/index.less';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Supplier';
import { numberSeparatorRender, roundEliminate, parseAmount } from '@/utils/renderer';
import BatchMaintainFrom from './BatchMaintainFrom';
import FormInputWrapper from '../components/WrapperTooltip';
import style from './index.less';

class ItemLine extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.state = {};
  }

  componentDidMount() {
    this.handleItemLineCuxBeforeMount();
  }

  // cux
  handleItemLineCuxBeforeMount = () => {
    const { remote } = this.props;

    if (remote?.event) {
      // 给state中设置二开的值
      remote.event.fireEvent('remoteHandleItemLineDidMount', {
        that: this,
      });
    }
  };

  getDadata(val = null, record = {}) {
    const {
      $form: { setFieldsInitialValue },
    } = record;
    if (setFieldsInitialValue) {
      setFieldsInitialValue({
        currentQuotationPrice: val,
      });
    }
    return val;
  }

  /**
   * 校验单价输入格式是否正确
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  @Bind()
  priceValidator(_, value, callback) {
    const arr = String(value).split('.');
    if (arr[0] && arr[1]) {
      if (arr[1].length > 10) {
        callback(intl.get(`ssrc.supplierQuotation.model.supQuo.price`).d('不能超过十位小数'));
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  /**
   * 报价行
   * @protected 此方法被【五粮浓香\奥克斯】等项目二开，请勿修改此方法名！！！
   */
  renderColunns() {
    const {
      remote,
      quotationName,
      quotationHeader = {},
      organizationId,
      onVisibleChange,
      renderHistoryTable,
      openTableRow,
      handleFloatingWay,
      handleQuotationRange,
      changeTaxId,
      changeQuantity,
      openLadder,
      afterOpenUploadModal,
      uploadSuccess,
      fetchHistoryline,
      // roundFlag = null,
      supplierSelectedRowKeys = [],
      bargingFlag = false,
      onChangeUnitPrice,
      onChangeTaxIncludedFlag,
      giveUpQuotationLine = () => {},
      handleChangeNetPrice,
      currencyCode,
      onRefreshQuotationLines, // 刷新报价行
      onSaveAllQutationData, // 大保存报价页面
      viewApplicationOrgModal = () => {},
      currencyPrecision,
      quotationLinePagination,
      caclRule,
      onRefreshQuotationHeader = noop,
      bidFlag = false,
    } = this.props;
    const {
      tenantId = null,
      roundQuotationRankFlag,
      currentQuotationRound,
      existBargainedFlag = null,
    } = quotationHeader || {};

    // 报价明细
    const quotationDetailProps = {
      sourceFrom: 'RFX',
      detailFrom: 'SUP_QUOTATION', // 针对一些子模块的情况
      quotationStatus: quotationHeader.quotationStatus,
      continuousQuotationFlag: quotationHeader.continuousQuotationFlag,
      onBeforeOpen: () => onSaveAllQutationData(quotationLinePagination),
      onOk: () => {
        onRefreshQuotationHeader();
        onRefreshQuotationLines(quotationLinePagination);
      },
      onCancel: () => {
        onRefreshQuotationHeader();
        onRefreshQuotationLines(quotationLinePagination);
      },
      headerData: quotationHeader,
    };

    const isUnTaxPriceFlag = quotationHeader && quotationHeader.priceTypeCode === 'NET_PRICE';

    const lineColumns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 250,
        render: (val, record) => roundEliminate(val, record),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        dataIndex: 'applicationScopeFlag',
        width: 100,
        render: (_, record) => {
          const { applicationScopeFlag = 0, rfxLineItemId = null } = record || {};
          return (
            <a
              disabled={!applicationScopeFlag}
              onClick={() =>
                viewApplicationOrgModal({ sourceLineItemId: rfxLineItemId, applicationScopeFlag })
              }
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        },
      },
      roundQuotationRankFlag && currentQuotationRound > 1
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.lastRank`).d('上一轮排名'),
            dataIndex: 'autoRoundRank',
            width: 100,
          }
        : '',
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
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
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStatus`, { quotationName })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatus',
        width: 100,
        render: (_, record) => this.quotationLineStatusTableColor(record),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃'),
        dataIndex: 'abandonedFlag',
        width: 60,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('abandonedFlag', {
                initialValue: value,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    record.quotationScope === 'ALL_QUOTATION' ||
                    record.eliminateRoundNumber ||
                    record.quotationLineStatus === 'ABANDONED' ||
                    (record.bargainFlag === 0 && record.bargainStatus === 'BARGAINING_ONLINE')
                  }
                  onChange={(e) => giveUpQuotationLine(e, record)}
                />
              )}
            </Form.Item>
          ) : (
            value
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
        dataIndex: 'floatType',
        width: 140,
        render: (val) => (
          <Popover
            placement="topLeft"
            content={intl
              .get(`ssrc.inquiryHall.view.message.floatingMoneyDetail`)
              .d('浮动方式：最小价格幅度的计算按照金额或者比率！')}
          >
            {handleFloatingWay(val)}
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationRange`).d('报价幅度'),
        dataIndex: 'quotationRange',
        width: 140,
        render: (val, record) => (
          <Popover
            placement="topLeft"
            content={intl
              .get(`ssrc.inquiryHall.view.message.floatingRatioDetail`)
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {handleQuotationRange(val, record.floatType)}
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`).d('单价(含税)'),
        dataIndex: 'currentQuotationPrice',
        width: 150,
        align: 'right',
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          const isSubmit = supplierSelectedRowKeys.some((item) => item === record.quotationLineId);
          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('currentQuotationPrice', {
                initialValue: value,
                rules: [
                  {
                    required:
                      !$form.getFieldValue('abandonedFlag') &&
                      (!bargingFlag || (isSubmit && bargingFlag)) &&
                      !isUnTaxPriceFlag &&
                      !(
                        quotationHeader.quotationStatus !== 'NEW' &&
                        quotationHeader.quotationChange === 'ORDER'
                      ) &&
                      !record.eliminateRoundNumber &&
                      ($form.getFieldValue('ladderInquiryFlag') !== 1 ||
                        ($form.getFieldValue('ladderInquiryFlag') === 1 &&
                          !record.priceReadonlyFlag)),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPrice`).d('单价'),
                    }),
                  },
                  {
                    validator: this.priceValidator,
                  },
                ],
              })(
                <FormInputWrapper
                  priceReadonlyFlag={record.priceReadonlyFlag === 1}
                  onChange={(val) => onChangeUnitPrice(val, record)}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '98%' }}
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 ||
                    (record.continuousQuotationFlag === 0 &&
                      // record.currentQuotationPrice &&
                      record.quotationLineStatus === 'SUBMITTED') ||
                    (record.bargainFlag === 0 && record.bargainStatus === 'BARGAINING_ONLINE') ||
                    isUnTaxPriceFlag ||
                    (quotationHeader.quotationStatus !== 'NEW' &&
                      quotationHeader.quotationChange === 'ORDER') ||
                    record.eliminateRoundNumber ||
                    ($form.getFieldValue('ladderInquiryFlag') === 1 &&
                      record.priceReadonlyFlag === 1)
                  }
                  parser={(val) => parseAmount(val, currencyPrecision)}
                  allowThousandth
                  zeroValueVisibleFlag={
                    caclRule === 'Amount' &&
                    isUnTaxPriceFlag &&
                    $form.getFieldValue('netPrice') !== 0 &&
                    parseAmount($form.getFieldValue('currentQuotationPrice'), currencyPrecision) ==
                      0
                  }
                  currencyPrecision={currencyPrecision}
                  taxFlag={isUnTaxPriceFlag}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            value
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 150,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          const isSubmit = supplierSelectedRowKeys.some((item) => item === record.quotationLineId);
          const disabled =
            $form?.getFieldValue('abandonedFlag') === 1 ||
            (record.continuousQuotationFlag === 0 &&
              // record.currentQuotationPrice &&
              record.quotationLineStatus === 'SUBMITTED') ||
            (record.bargainFlag === 0 && record.bargainStatus === 'BARGAINING_ONLINE') ||
            !isUnTaxPriceFlag ||
            (quotationHeader.quotationStatus !== 'NEW' &&
              quotationHeader.quotationChange === 'ORDER') ||
            record.eliminateRoundNumber ||
            ($form.getFieldValue('ladderInquiryFlag') === 1 && record.priceReadonlyFlag === 1);
          const input = $form?.getFieldDecorator('netPrice', {
            rules: [
              {
                required:
                  !$form.getFieldValue('abandonedFlag') &&
                  (!bargingFlag || (isSubmit && bargingFlag)) &&
                  isUnTaxPriceFlag &&
                  !(
                    quotationHeader.quotationStatus !== 'NEW' &&
                    quotationHeader.quotationChange === 'ORDER'
                  ) &&
                  !record.eliminateRoundNumber &&
                  ($form.getFieldValue('ladderInquiryFlag') !== 1 ||
                    ($form.getFieldValue('ladderInquiryFlag') === 1 && !record.priceReadonlyFlag)),
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
                }),
              },
              {
                validator: this.priceValidator,
              },
            ],
            initialValue: record.netPrice,
          })(
            <FormInputWrapper
              priceReadonlyFlag={record.priceReadonlyFlag === 1}
              onChange={(val) => handleChangeNetPrice(val, record)}
              min="0"
              max="99999999999999999999"
              style={{ width: '98%' }}
              disabled={disabled}
              parser={(val) => parseAmount(val, currencyPrecision)}
              allowThousandth
              currencyPrecision={currencyPrecision}
              zeroValueVisibleFlag={
                caclRule === 'Amount' &&
                !isUnTaxPriceFlag &&
                $form.getFieldValue('currentQuotationPrice') !== 0 &&
                parseAmount($form.getFieldValue('netPrice'), currencyPrecision) == 0
              }
              taxFlag={!isUnTaxPriceFlag}
              queryPrecisionParams={{
                purTenantId: tenantId,
              }}
            />
          );
          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>{input}</Form.Item>
          ) : (
            value
          );
        },
      },
      quotationHeader.quotationRoundNumber
        ? !isUnTaxPriceFlag
          ? {
              title: intl
                .get('ssrc.supplierQuotation.model.supQuo.lastValidTaxQuotationPrice')
                .d('上轮有效报价(含税)'),
              dataIndex: 'lastQuotationPrice',
              width: 140,
              render: numberSeparatorRender,
            }
          : {
              title: intl
                .get('ssrc.supplierQuotation.model.supQuo.lastValidUnTaxQuotationPrice')
                .d('上轮有效报价(不含税)'),
              dataIndex: 'lastValidNetPrice',
              width: 140,
              render: numberSeparatorRender,
            }
        : null,
      !isUnTaxPriceFlag
        ? {
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validTaxQuotationPrice`)
              .d('有效含税报价'),
            dataIndex: 'validQuotationPrice',
            align: 'right',
            width: 100,
            render: numberSeparatorRender,
          }
        : {
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validUnTaxQuotationPrice`)
              .d('有效报价(不含税)'),
            dataIndex: 'validNetPrice',
            align: 'right',
            width: 100,
            render: (val) => numberSeparatorRender(val),
          },
      existBargainedFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.validBargainPrice`).d('还价-单价'),
            dataIndex: 'validBargainPrice',
            width: 120,
            align: 'right',
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineAmount`).d('行金额'),
        dataIndex: 'totalAmount',
        width: 120,
        align: 'right',
        render: (val, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('totalAmount', {
                initialValue: val,
              })(<span>{numberSeparatorRender(record.totalAmount)}</span>)}
            </Form.Item>
          ) : (
            numberSeparatorRender(record.totalAmount)
          );
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 120,
        align: 'right',
        render: (val, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('netAmount', {
                initialValue: val,
              })(<span>{numberSeparatorRender(record.netAmount)}</span>)}
            </Form.Item>
          ) : (
            numberSeparatorRender(record.netAmount)
          );
        },
      },
      existBargainedFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.counterOfferReason`).d('还价理由'),
            dataIndex: 'validBargainRemark',
            width: 200,
            render: (value) => (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ),
          }
        : null,
      existBargainedFlag
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.bargainer`).d('还价人'),
            dataIndex: 'bargainName',
            width: 100,
          }
        : null,
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        // render: yesOrNoRender,
        render: (val, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 ||
                    record.taxChangeFlag === 0 ||
                    record.eliminateRoundNumber
                  }
                  onChange={(e) => onChangeTaxIncludedFlag(e, record)}
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        dataIndex: 'taxId',
        width: 120,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            // && record.taxIncludedFlag && header.taxChangeFlag
            <Form.Item>
              {$form.getFieldDecorator('taxId', {
                initialValue: record.taxId,
                rules: [
                  {
                    required:
                      // $form.getFieldValue('abandonedFlag') !== 1 &&
                      // record.taxChangeFlag &&
                      // record.taxIncludedFlag &&
                      $form.getFieldValue('abandonedFlag') !== 1 &&
                      record.taxChangeFlag === 1 &&
                      $form.getFieldValue('taxIncludedFlag') === 1 &&
                      (!bargingFlag ||
                        (supplierSelectedRowKeys.some((item) => item === record.quotationLineId) &&
                          bargingFlag)) &&
                      !record.eliminateRoundNumber,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supplierBid.modifyTheRate`)
                        .d('税率(%)'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.TAX"
                  style={{ width: '98%' }}
                  textValue={record.taxRate}
                  textField="taxRate"
                  disabled={
                    record.taxChangeFlag === 0 ||
                    $form.getFieldValue('taxIncludedFlag') === 0 ||
                    $form.getFieldValue('abandonedFlag') === 1 ||
                    record.eliminateRoundNumber
                  }
                  onChange={(val, dataList) => changeTaxId(val, dataList, record)}
                  queryParams={{
                    organizationId: getCurrentTenant().tenantId,
                    tenantId,
                  }}
                />
              )}
              {$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })}
            </Form.Item>
          ) : (
            record.taxRate
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxQuantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 120,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          const isSubmit = supplierSelectedRowKeys.some((item) => item === record.quotationLineId);
          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('currentQuotationQuantity', {
                initialValue: value,
                rules: [
                  {
                    required:
                      record.quantityChangeFlag === 1 &&
                      !$form.getFieldValue('abandonedFlag') &&
                      (!bargingFlag || (isSubmit && bargingFlag)) &&
                      !record.eliminateRoundNumber,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationQuantity`)
                        .d('可供数量'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  // precision={2}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 ||
                    !record.quantityChangeFlag ||
                    record.eliminateRoundNumber
                  }
                  onChange={(val) => changeQuantity(val, record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            value
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量'),
        dataIndex: 'batchPrice',
        align: 'right',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
        dataIndex: 'priceDetail',
        width: 100,
        render: (_, record = {}) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return (
            <>
              <QuotationDetailModal
                rowData={record}
                bidFlag={bidFlag}
                disabled={$form?.getFieldValue('abandonedFlag') || record.eliminateRoundNumber}
                incomingEditDisable={[
                  $form?.getFieldValue('abandonedFlag') === 1 ||
                    (record.continuousQuotationFlag === 0 &&
                      record.quotationLineStatus === 'SUBMITTED') ||
                    (record.bargainFlag === 0 && record.bargainStatus === 'BARGAINING_ONLINE') ||
                    (quotationHeader.quotationStatus !== 'NEW' &&
                      quotationHeader.quotationChange === 'ORDER') ||
                    record.eliminateRoundNumber,
                ]}
                {...quotationDetailProps}
              />
              {$form?.getFieldValue('abandonedFlag') || record.eliminateRoundNumber
                ? null
                : record.quotationDetailRequire === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
                  )}
            </>
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderInquiryFlag`).d('启用阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 120,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('ladderInquiryFlag', {
                initialValue: value,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    record.diyLadderQuotationFlag === 0 ||
                    record.eliminateRoundNumber ||
                    $form.getFieldValue('abandonedFlag') === 1
                  }
                />
              )}
            </Form.Item>
          ) : (
            value
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价'),
        dataIndex: 'ladderLevel',
        width: 100,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }
          const abandonedFlag = $form?.getFieldValue('abandonedFlag');
          const disabledEditorFlag = abandonedFlag === 1 || record.eliminateRoundNumber;

          return $form?.getFieldValue('ladderInquiryFlag') === 1 ? (
            <>
              <a onClick={() => openLadder(record)} disabled={disabledEditorFlag}>
                {intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
              {record.ladderInquiryRequire === 1 && !disabledEditorFlag && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null;
        },
      },
      {
        title: intl.get('ssrc.common.productionPlace').d('产地'),
        dataIndex: 'origin',
        width: 120,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('origin', {
                initialValue: value,
              })(<Input disabled={$form.getFieldValue('abandonedFlag') === 1} />)}
            </Form.Item>
          ) : (
            value
          );
        },
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        dataIndex: 'currentExpiryDateFrom',
        width: 150,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          const isSubmit = supplierSelectedRowKeys.some((item) => item === record.quotationLineId);
          return ['update', 'create'].includes(record._status) &&
            record.validDateInputType !== 'READONLY' ? (
              <Form.Item>
                {$form.getFieldDecorator('currentExpiryDateFrom', {
                initialValue: value && moment(value),
                rules: [
                  {
                    required:
                      record.validDateInputType === 'REQUIRED' &&
                      !$form.getFieldValue('abandonedFlag') &&
                      (!bargingFlag || (isSubmit && bargingFlag)) &&
                      !record.eliminateRoundNumber,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateFrom`)
                        .d('报价有效期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder={null}
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 || record.eliminateRoundNumber
                  }
                  disabledDate={(currentDate) => {
                    const toData = $form.getFieldValue('currentExpiryDateTo');
                    if (toData) {
                      return moment(toData).isBefore(currentDate, 'day');
                    }
                  }}
                />
              )}
              </Form.Item>
          ) : (
            <Form.Item>
              {$form.getFieldDecorator('currentExpiryDateFrom', {
                initialValue: value && moment(value),
              })(<span>{dateRender(value)}</span>)}
            </Form.Item>
          );
        },
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        dataIndex: 'currentExpiryDateTo',
        width: 150,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          const isSubmit = supplierSelectedRowKeys.some((item) => item === record.quotationLineId);
          return ['update', 'create'].includes(record._status) &&
            record.validDateInputType !== 'READONLY' ? (
              <Form.Item>
                {$form.getFieldDecorator('currentExpiryDateTo', {
                initialValue: value && moment(value),
                rules: [
                  {
                    required:
                      record.validDateInputType === 'REQUIRED' &&
                      !$form.getFieldValue('abandonedFlag') &&
                      (!bargingFlag || (isSubmit && bargingFlag)) &&
                      !record.eliminateRoundNumber,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
                        .d('报价有效期至'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder={null}
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 || record.eliminateRoundNumber
                  }
                  disabledDate={(currentDate) => {
                    const fromDate = $form?.getFieldValue('currentExpiryDateFrom');
                    if (fromDate) {
                      return moment(fromDate).isAfter(currentDate, 'day');
                    }

                    return moment().isAfter(currentDate, 'day');
                  }}
                />
              )}
              </Form.Item>
          ) : (
            <Form.Item>
              {$form.getFieldDecorator('currentExpiryDateTo', {
                initialValue: value && moment(value),
              })(<span>{dateRender(value)}</span>)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.promisedDeliveryDate`).d('承诺交货期'),
        dataIndex: 'currentPromisedDate',
        width: 150,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('currentPromisedDate', {
                initialValue: value && moment(value),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder={null}
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 || record.eliminateRoundNumber
                  }
                />
              )}
            </Form.Item>
          ) : (
            dateRender(value)
          );
        },
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('currentDeliveryCycle', {
                initialValue: value,
                rules: [
                  {
                    pattern: /^[1-9]\d*$/,
                    message: intl.get('ssrc.common.positiveInteger').d('正整数'),
                  },
                ],
              })(
                <InputNumber
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 || record.eliminateRoundNumber
                  }
                />
              )}
            </Form.Item>
          ) : (
            value
          );
        },
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }
          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('currentQuotationRemark', {
                initialValue: value,
              })(
                <Input
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 || record.eliminateRoundNumber
                  }
                />
              )}
            </Form.Item>
          ) : (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          );
        },
      },
      // {
      //   title: intl
      //     .get(`ssrc.supplierQuotation.model.supQuo.priceBatchQuantity`)
      //     .d('批量单价（参考）'),
      //   dataIndex: 'priceBatchQuantity',
      //   width: 150,
      //   render: (value, record) =>
      //     ['update', 'create'].includes(record._status) ? (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator('priceBatchQuantity', {
      //           initialValue: value,
      //         })(
      //           <PrecisionInputNumber
      //             style={{ width: '100%' }}
      //             min={0}
      //             disabled={record.$form.getFieldValue('abandonedFlag') === 1}
      //           />
      //         )}
      //       </Form.Item>
      //     ) : (
      //         value
      //       ),
      // },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.minimumPurchaseAmount`)
          .d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('minPurchaseQuantity', {
                initialValue: value,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  min="0"
                  max="99999999999999999999"
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 || record.eliminateRoundNumber
                  }
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.minimumPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 100,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('minPackageQuantity', {
                initialValue: value,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  min="0"
                  max="99999999999999999999"
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 || record.eliminateRoundNumber
                  }
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.itemCategory`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: (val, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('freightIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  disabled={
                    quotationHeader.freightUpdatableFlag === 0 ||
                    $form.getFieldValue('abandonedFlag') === 1 ||
                    record.eliminateRoundNumber
                  }
                  onChange={() => {
                    $form.setFieldsValue({
                      freightAmount:
                        $form.getFieldValue('freightIncludedFlag') === 1
                          ? $form.freightAmount
                          : null,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 120,
        render: (value, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          let cuxFreightAmountProps = {};
          cuxFreightAmountProps = remote
            ? remote.process(
                'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_FREIGHT_AMOUNT_PROPS',
                cuxFreightAmountProps,
                {
                  that: this,
                  currencyCode,
                  form: $form,
                  record,
                }
              )
            : cuxFreightAmountProps;
          cuxFreightAmountProps = cuxFreightAmountProps || {};

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {$form.getFieldDecorator('freightAmount', {
                initialValue: value,
              })(
                <PrecisionInputNumber
                  financial={currencyCode}
                  type="hzero"
                  style={{ width: '100%' }}
                  min="0"
                  max="99999999999999999999"
                  disabled={
                    $form.getFieldValue('abandonedFlag') === 1 ||
                    $form.getFieldValue('freightIncludedFlag') === 1 ||
                    record.eliminateRoundNumber
                  }
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                  {...cuxFreightAmountProps}
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          );
        },
      },

      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonSourceLineAttachment`, {
            documentTypeName: this.documentTypeName,
          })
          .d('{documentTypeName}行附件'),
        dataIndex: 'rfxAttachmentUuid',
        width: 180,
        render: (value) => (
          <Upload
            filePreview
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            tenantId={organizationId}
            attachmentUUID={value}
            viewOnly
            icon="download"
          />
        ),
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.purchaserLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'currentAttachmentUuid',
        width: 220,
        render: (value, record = {}) => {
          const { $form, quotationLineId } = record || {};
          if (!$form) {
            return;
          }

          return (
            <Form.Item>
              {$form.getFieldDecorator('currentAttachmentUuid', {
                initialValue: value,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationline"
                  tenantId={organizationId}
                  attachmentUUID={value}
                  afterOpenUploadModal={afterOpenUploadModal}
                  uploadSuccess={() => uploadSuccess(quotationLineId)}
                  viewOnly={
                    $form.getFieldValue('abandonedFlag') === 1 || record.eliminateRoundNumber
                  }
                  {...ChunkUploadProps}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationHistory`, { quotationName })
          .d('{quotationName}历史'),
        width: 100,
        dataIndex: 'quotationHistory',
        fixed: 'right',
        render: (_, record) => (
          <Popover
            trigger="click"
            placement="topLeft"
            onVisibleChange={onVisibleChange}
            content={renderHistoryTable(record)}
            title={intl
              .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationHistory`, { quotationName })
              .d('{quotationName}历史')}
          >
            {(record.roundQuotationFlag && Number(record.roundFlag) === 1) || record.bargainFlag ? (
              <a onClick={() => fetchHistoryline(record.quotationLineId)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ) : (
              ''
            )}
          </Popover>
        ),
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'playDesc',
        width: 100,
        fixed: 'right',
        render: (val, record) => (
          <a onClick={() => openTableRow(record)}>
            {intl.get(`ssrc.supplierQuotation.view.message.button.switchView`).d('切换视图')}
          </a>
        ),
      },
    ].filter(Boolean);

    const columns = remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_ITEM_LINE_TABLE_COLUMNS',
          lineColumns,
          {
            that: this,
          }
        )
      : lineColumns;

    return columns.filter(Boolean);
  }

  /**
   *  quotationLineStatusTablcColor - 列表行状态颜色变化
   *  NEW-新建，SUBMITTED-已报价， ABANDONED-放弃
   */
  @Bind()
  quotationLineStatusTableColor(item) {
    let color = '';
    let backGround = '';
    switch (item.quotationLineStatus) {
      case 'NEW':
        color = '#F88D10';
        backGround = 'rgba(252,160,0,0.10)';
        break;
      case 'SUBMITTED':
        color = '#47B881';
        backGround = 'rgba(71,184,129,0.10)';
        break;
      case 'ABANDONED':
        color = 'rgba(0,0,0,0.65)';
        backGround = 'rgba(0,0,0,0.06)';
        break;
      default:
        color = '#0687FF';
        backGround = '#DAEDFE';
        break;
    }
    return (
      <div>
        <Tag
          style={{
            minWidth: '52px',
            textAlign: 'center',
            backgroundColor: backGround,
            color,
            border: 0,
          }}
        >
          {item.quotationLineStatusMeaning}
        </Tag>
      </div>
    );
  }

  // 广东高景二开
  renderPage() {
    return ['10', '20'];
  }

  // 永祥按钮二开
  @Bind()
  renderButtons() {
    const {
      startBatchMaintainItemLine,
      quotationLines = {},
      supplierSelectedRowKeys,
      quotationHeader,
      batchEditLineLockLoading,
      remote,
    } = this.props;
    const { supplierStatus } = quotationHeader || {};
    const wholeAbandonFlag =
      supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识

    let buttons = [
      <a
        onClick={startBatchMaintainItemLine}
        disabled={isEmpty(quotationLines.content) || batchEditLineLockLoading || wholeAbandonFlag}
      >
        <Icon type="mode_edit" style={{ marginRight: '8px', fontSize: '14px' }} />
        <Tooltip
          title={
            !supplierSelectedRowKeys?.length
              ? intl
                  .get('ssrc.inquiryHall.model.inquiryHall.batchEditAllData')
                  .d('批量编辑全部数据')
              : null
          }
        >
          {supplierSelectedRowKeys?.length
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.batchCheckData').d('勾选批量编辑')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护')}
        </Tooltip>
      </a>,
    ];

    buttons = remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_ITEM_LINE_TABLE_BUTTONS',
          buttons,
          {
            that: this,
          }
        )
      : buttons;

    return (
      <div className={styles['m-b-m']} style={{ marginLeft: '10px' }}>
        {buttons}
      </div>
    );
  }

  render() {
    const {
      custkey,
      customizeTable,
      fetchListLoading,
      quotationLines = {},
      quotationLinePagination = {},
      handleTableChange,
      onRow,
      supplierRowSelection,
      hasChangeData,
      // bargingFlag = false,
      batchMaintainItemLineVisible,
      form,
      quotationHeader = {},
      cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine,
      resetBatchMaintainItemLine,
      customizeForm,
      supplierSelectedRowKeys,
      batchEditLineLockLoading,
      remote,
    } = this.props;
    // if (isEmpty(quotationLines?.content)) {
    //   return '';
    // }

    const lineColumns = this.renderColunns();
    const scrollX = sum(lineColumns.map((n) => (isNumber(n.width) ? n.width : 0)));

    let newQuotationLinePagination = {
      ...quotationLinePagination,
      pageSizeOptions: this.renderPage(),
    };

    newQuotationLinePagination = remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_ITEM_LINE_TABLE_PAGINATION',
          newQuotationLinePagination,
          {
            that: this,
          }
        )
      : newQuotationLinePagination;

    // 批量维护
    const batchMaintainProps = {
      form,
      custkey,
      quotationHeader,
      customizeForm,
      supplierSelectedRowKeys,
      batchMaintainItemLineVisible,
      cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine,
      resetBatchMaintainItemLine,
      batchEditLineLockLoading,
    };

    return (
      <React.Fragment>
        <div
          style={{
            lineHeight: '16px',
            fontSize: '14px',
            marginBottom: '16px',
            height: '16px',
            display: 'flex',
          }}
        >
          <div className={style.subTitle} />
          <div>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.itemDetailTable`).d('物料明细表')}
          </div>
        </div>
        {this.renderButtons()}
        {customizeTable(
          {
            code: `SSRC.${custkey}SUPPLIER_QUOTATION.LINE`,
          },
          <EditTable
            bordered
            rowKey="quotationLineId"
            columns={lineColumns}
            loading={fetchListLoading}
            scroll={{ x: scrollX, y: '70vh' }}
            dataSource={quotationLines?.content || []}
            onDataChange={hasChangeData}
            pagination={newQuotationLinePagination}
            onChange={(page) => handleTableChange(page)}
            rowSelection={supplierRowSelection}
            onRow={(record) => {
              return {
                onChange: () => onRow(record),
              };
            }}
          />
        )}

        {batchMaintainItemLineVisible && <BatchMaintainFrom {...batchMaintainProps} />}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return Form.create({ fieldNameProp: null })(Comp);
};

export default HOCComponent(ItemLine);
export { ItemLine, HOCComponent };
