/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2024-04-18 16:53:45
 * @LastEditors: yiping.liu
 */
import React, { Component } from 'react';
import { Form, Input, Popover } from 'hzero-ui';
import { isEmpty, isNumber, sum, isNil } from 'lodash';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { Attachment } from 'choerodon-ui/pro';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import {
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  TooltipTitle,
} from '@/utils/utils';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import LadderLevelModal from './LadderLevelModal';

export default class ItemLineTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 检查表格内容值发生变化，更新redux
  hasChangeData = (record, changeValues) => {
    const { dispatch, itemContentChange, modelName = 'inquiryHall' } = this.props;
    if (!isEmpty(changeValues) && record.rfxLineItemId) {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          itemLineChange: true,
          itemContentChange: {
            ...itemContentChange,
            [record.rfxLineItemId]: true,
          },
        },
      });
    }
  };

  renderRedMinPrice({ value, record, name, isNeedSeparator = true }) {
    const { ssrcRemote } = this.props;
    const formatValue = isNeedSeparator ? numberSeparatorRender(value) : value;
    if (isNil(value)) return value;
    // eslint-disable-next-line prefer-destructuring
    const redField = record.redField;
    const colorRemote = ssrcRemote
      ? ssrcRemote?.process(
          'SSRC_INQUIRY_HALL_FEEDBACK_BARGAIN_PROCESS_ITEM_LINE_TABLE_COLOR',
          'red'
        )
      : 'red';
    return redField === name ? (
      <span style={{ color: colorRemote }}>{formatValue}</span>
    ) : (
      formatValue
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      // loading,
      header,
      dataSource = [],
      onSearch,
      rfxLineItemId,
      // organizationId,
      viewLadderLevel,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData = {},
      itemLineRowSelection,
      viewLadderLevelVisible,
      hideModal,
      fetchLoading,
      saveLoading,
      loadingObj,
      doubleUnitFlag = false,
      sourceKey = INQUIRY,
      customizeTable = () => {},
      newQuotationFlag = false,
    } = this.props;
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading,
      fetchLoading,
      doubleUnitFlag,
    };
    const testData = (dataSource[`${rfxLineItemId}`] && dataSource[`${rfxLineItemId}`].list) || [];
    const pagination = dataSource[`${rfxLineItemId}`] && dataSource[`${rfxLineItemId}`].pagination;
    const quotationName = getQuotationName(sourceKey === BID);
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
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
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName,
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('quotationLineStatusMeaning', {
              initialValue: val,
            })}{' '}
            {val}
          </Form.Item>
        ),
      },
      header && header.multiCurrencyFlag === 1
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`)
              .d('报价币种'),
            dataIndex: 'quotationCurrencyCode',
            width: 100,
            align: 'right',
          }
        : null,
      header && header.multiCurrencyFlag === 1
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 100,
            align: 'right',
          }
        : null,
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validQuotationPrice',
        width: 100,
        render: (value, record) =>
          value || value === 0 ? (
            <Popover placement="topLeft" content={numberSeparatorRender(value)}>
              {this.renderRedMinPrice({ value, record, name: 'validQuotationPrice' })}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        width: 100,
        align: 'right',
        render: (value, record) => this.renderRedMinPrice({ value, record, name: 'validNetPrice' }),
      },
      doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
            dataIndex: 'validQuotationSecPrice',
            width: 100,
            render: (value) =>
              value || value === 0 ? (
                <Popover placement="topLeft" content={numberSeparatorRender(value)}>
                  {numberSeparatorRender(value)}
                </Popover>
              ) : (
                ''
              ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            width: 100,
            align: 'right',
            render: numberSeparatorRender,
          }
        : null,
      header && header.multiCurrencyFlag === 1
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
              .d('本币含税单价'),
            dataIndex: 'baseQuotationPrice',
            width: 120,
            align: 'right',
            render: numberSeparatorRender,
          }
        : null,
      header && header.multiCurrencyFlag === 1
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`)
              .d('本币单价(不含税)'),
            dataIndex: 'baseNetPrice',
            align: 'right',
            width: 120,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价')}
            tipValue={intl
              .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
              .d('辅助单位对应的上次报价')}
          />
        ),
        dataIndex: 'preQuotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
      },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价')}
            tipValue={intl
              .get('ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary')
              .d('辅助单位对应的还价单价')}
          />
        ),
        textForTitle: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`)
          .d('还价单价'),
        dataIndex: 'currentBargainPrice',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentBargainPrice', {
                initialValue: val,
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`)
                        .d('还价单价'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  disabled={
                    (record.quotationLineStatus !== 'SUBMITTED' &&
                      record.quotationLineStatus !== 'REPLIED') ||
                    !record.supplierCompanyId
                  }
                  // currency={(header || {}).currencyCode}
                  currency={record.quotationCurrencyCode}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        dataIndex: 'currentBargainRemark',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentBargainRemark', {
                initialValue: val,
                rules: [
                  {
                    max: 500,
                    message: intl.get('hzero.common.validation.max', {
                      max: 500,
                    }),
                  },
                ],
              })(
                <Input
                  disabled={
                    (record.quotationLineStatus !== 'SUBMITTED' &&
                      record.quotationLineStatus !== 'REPLIED') ||
                    !record.supplierCompanyId
                  }
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价')}
            tipValue={intl
              .get('ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary')
              .d('辅助单位对应的有效还价单价')}
          />
        ),
        dataIndex: 'validBargainPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
        dataIndex: 'validBargainRemark',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 140,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={numberSeparatorRender(value)}>
              {numberSeparatorRender(value)}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 140,
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
        dataIndex: 'validQuotationRemark',
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
        title: intl.get(`ssrc.common.productionPlace`).d('产地'),
        dataIndex: 'origin',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        dataIndex: 'paymentTypeName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.termsOfPayment`).d('付款条款'),
        dataIndex: 'paymentTermName',
        width: 100,
      },
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            align: 'right',
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 120,
        render: (val) => dateRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 120,
        render: (val) => dateRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 100,
        render: (val) => dateRender(val),
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        align: 'right',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        align: 'right',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.freightAmount').d('运费'),
        dataIndex: 'freightAmount',
        width: '',
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        width: 120,
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
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
        width: 180,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              value={val}
              viewMode="popup"
              funcType="link"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 510; // 固定10行
    return (
      <React.Fragment>
        {customizeTable(
          { code: `SSRC.${sourceKey}_HALL.BARGAIN.QUOTATION_ITEM` },
          <EditTable
            bordered
            onDataChange={this.hasChangeData}
            rowKey="quotationLineId"
            // loading={loading}
            columns={columns}
            scroll={{ x: scrollX, y: scrollY }}
            loading={
              loadingObj[rfxLineItemId] && loadingObj[rfxLineItemId].fetchAloneItemLineLoading
            }
            dataSource={testData}
            pagination={pagination}
            rowSelection={itemLineRowSelection}
            onChange={(page) => onSearch(page, rfxLineItemId)}
          />
        )}
        {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}
