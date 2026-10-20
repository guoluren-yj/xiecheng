import React, { Component } from 'react';
import { Popover, Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import moment from 'moment';

import Upload from 'srm-front-boot/lib/components/Upload';
import { yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import {
  getContentScrollHeight,
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { PRIVATE_BUCKET } from '_utils/config';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';

const promptCode = 'ssrc.expertScoring';

export default class ItemLineTable extends Component {
  render() {
    const {
      match,
      customizeTable,
      header = {},
      organizationId,
      item,
      onSearch,
      scoringQuotationList = [],
      loadingObj = {},
      quotationHeaderId,
      sectionId,
      team,
      viewLadderLevel,
      hideBusinessBid = false,
      doubleUnitFlag,
      newQuotationFlag,
    } = this.props;
    const { secondarySourceCategory } = header || {};
    let rfxflag = '';
    if (match?.params?.sourceFrom === 'RFX') {
      rfxflag = '_RFX';
    }
    const itemData =
      scoringQuotationList[`${sectionId}#${quotationHeaderId}`] &&
      scoringQuotationList[`${sectionId}#${quotationHeaderId}`].list;
    const pagination =
      scoringQuotationList[`${sectionId}#${quotationHeaderId}`] &&
      scoringQuotationList[`${sectionId}#${quotationHeaderId}`].pagination;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.expertScoring.lineNo.`).d('行号'),
        dataIndex: 'sourceLineItemNum',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
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
        title: intl.get(`${promptCode}.model.expertScoring.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
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
      hideBusinessBid
        ? null
        : doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
            align: 'right',
            dataIndex: 'validQuotationSecPrice',
            width: 100,
            render: (val, record) => {
              return (
                <span style={record.redPrice === 'TAX' ? { color: '#F13131' } : {}}>
                  {numberSeparatorRender(val)}
                </span>
              );
            },
          }
        : null,
      hideBusinessBid
        ? null
        : doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            align: 'right',
            width: 100,
            render: (val, record) => {
              return (
                <span style={record.redPrice === 'NET' ? { color: '#F13131' } : {}}>
                  {numberSeparatorRender(val)}
                </span>
              );
            },
          }
        : null,
      hideBusinessBid
        ? null
        : {
            title: getPriceName(doubleUnitFlag),
            align: 'right',
            dataIndex: 'validQuotationPrice',
            width: 100,
            render: (val, record) => {
              return (
                <span style={record.redPrice === 'TAX' ? { color: '#F13131' } : {}}>
                  {numberSeparatorRender(val)}
                </span>
              );
            },
          },
      hideBusinessBid
        ? null
        : {
            title: getNetPriceName(doubleUnitFlag),
            dataIndex: 'validNetPrice',
            align: 'right',
            width: 100,
            render: (val, record) => {
              return (
                <span style={record.redPrice === 'NET' ? { color: '#F13131' } : {}}>
                  {numberSeparatorRender(val)}
                </span>
              );
            },
          },
      !hideBusinessBid && header.multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
              .d('本币含税单价'),
            dataIndex: 'baseQuotationPrice',
            align: 'right',
            width: 100,
            render: numberSeparatorRender,
          }
        : '',
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.validQtationQuantity`).d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'sourceQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: doubleUnitFlag
          ? intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位')
          : intl.get(`${promptCode}.model.expertScoring.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.currentDeliveryCycle`).d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 100,
      },
      hideBusinessBid
        ? null
        : {
            title: intl.get('ssrc.common.model.quotationDetails').d('报价明细'),
            dataIndex: 'quotationDetailFlag',
            width: 100,
            render: (val, record) => (
              <QuotationDetail
                rowData={record}
                sourceFrom={match.params.sourceFrom}
                sourceHeaderId={match.params.sourceHeaderId}
                allowBuyerViewFlag
                bidFlag={secondarySourceCategory === 'NEW_BID'}
              />
            ),
          },
      hideBusinessBid
        ? null
        : {
            title: intl.get(`${promptCode}.model.expertScoring.LadderLevel`).d('阶梯报价'),
            dataIndex: 'ladderOffer',
            width: 100,
            render: (val, record) =>
              record.ladderInquiryFlag === 1 ? (
                <a onClick={() => viewLadderLevel(record)}>
                  {intl.get(`${promptCode}.model.quoController.LadderLevel`).d('阶梯报价')}
                </a>
              ) : null,
          },
      {
        title: intl.get(`${promptCode}.model.expertScoring.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.currentPromisedDate`).d('承诺交付日期'),
        dataIndex: 'validPromisedDate',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.taxRate(%)`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
        render: (val) =>
          val || intl.get('ssrc.expertScoring.model.expertScoring.excludingTax').d('不含税'),
      },
      hideBusinessBid
        ? null
        : {
            title: intl
              .get('ssrc.supplierBidQuery.model.supplierBidQuery.selfNetPrice')
              .d('本币单价(不含税)'),
            dataIndex: 'baseNetPrice',
            width: 120,
            align: 'right',
            render: (value) =>
              value ? (
                <Popover placement="topLeft" content={numberSeparatorRender(value)}>
                  {numberSeparatorRender(value)}
                </Popover>
              ) : (
                ''
              ),
          },
      hideBusinessBid
        ? null
        : {
            title: intl.get(`${promptCode}.model.expertScoring.netPriceAmount`).d('行金额(不含税)'),
            dataIndex: 'netAmount',
            width: 150,
            align: 'right',
            render: numberSeparatorRender,
          },
      hideBusinessBid
        ? null
        : {
            title: intl.get(`${promptCode}.model.expertScoring.taxAmount`).d('税额'),
            dataIndex: 'taxAmount',
            width: 100,
            align: 'right',
            render: numberSeparatorRender,
          },
      hideBusinessBid
        ? null
        : {
            title: intl.get(`${promptCode}.model.expertScoring.linePrice`).d('行金额'),
            dataIndex: 'totalAmount',
            width: 100,
            align: 'right',
            render: numberSeparatorRender,
          },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
        dataIndex: 'validAttachmentUuid',
        width: 180,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              viewOnly
              filePreview
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationheader"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },

      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    const businessColumns = [
      {
        title: intl.get(`${promptCode}.model.expertScoring.lineNo.`).d('行号'),
        dataIndex: 'sourceLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
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
        title: intl.get(`${promptCode}.model.expertScoring.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
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
      hideBusinessBid
        ? null
        : doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.taxIncludedPrice`).d('单价(含税)'),
            dataIndex: 'validQuotationSecPrice',
            width: 100,
            render: (val, record) => {
              return (
                <span style={record.redPrice === 'TAX' ? { color: '#F13131' } : {}}>
                  {numberSeparatorRender(val)}
                </span>
              );
            },
          }
        : null,
      hideBusinessBid
        ? null
        : doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            align: 'right',
            width: 100,
            render: (val, record) => {
              return (
                <span style={record.redPrice === 'NET' ? { color: '#F13131' } : {}}>
                  {numberSeparatorRender(val)}
                </span>
              );
            },
          }
        : null,
      hideBusinessBid
        ? null
        : {
            title: getPriceName(doubleUnitFlag),
            dataIndex: 'validQuotationPrice',
            width: 100,
            render: (val, record) => {
              return (
                <span style={record.redPrice === 'TAX' ? { color: '#F13131' } : {}}>
                  {numberSeparatorRender(val)}
                </span>
              );
            },
          },
      hideBusinessBid
        ? null
        : {
            title: getNetPriceName(doubleUnitFlag),
            dataIndex: 'validNetPrice',
            align: 'right',
            width: 100,
            render: (val, record) => {
              return (
                <span style={record.redPrice === 'NET' ? { color: '#F13131' } : {}}>
                  {numberSeparatorRender(val)}
                </span>
              );
            },
          },
      header.multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
              .d('本币含税单价'),
            dataIndex: 'baseQuotationPrice',
            align: 'right',
            width: 100,
            render: numberSeparatorRender,
          }
        : '',
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.validQtationQuantity`).d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'sourceQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.currentDeliveryCycle`).d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 100,
      },
      hideBusinessBid
        ? null
        : {
            title: intl.get('ssrc.common.model.quotationDetails').d('报价明细'),
            dataIndex: 'quotationDetailFlag',
            width: 100,
            render: (val, record) => (
              <QuotationDetail
                rowData={record}
                sourceFrom={match.params.sourceFrom}
                sourceHeaderId={match.params.sourceHeaderId}
                allowBuyerViewFlag
              />
            ),
          },
      hideBusinessBid
        ? null
        : {
            title: intl.get(`${promptCode}.model.expertScoring.LadderLevel`).d('阶梯报价'),
            dataIndex: 'ladderOffer',
            width: 100,
            render: (val, record) =>
              record.ladderInquiryFlag === 1 ? (
                <a onClick={() => viewLadderLevel(record)}>
                  {intl.get(`${promptCode}.model.quoController.LadderLevel`).d('阶梯报价')}
                </a>
              ) : null,
          },
      {
        title: intl.get(`${promptCode}.model.expertScoring.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.currentPromisedDate`).d('承诺交付日期'),
        dataIndex: 'validPromisedDate',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.taxRate(%)`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
        render: (val) =>
          val || intl.get('ssrc.expertScoring.model.expertScoring.excludingTax').d('不含税'),
      },
      hideBusinessBid
        ? null
        : {
            title: intl
              .get('ssrc.supplierBidQuery.model.supplierBidQuery.selfNetPrice')
              .d('本币单价(不含税)'),
            dataIndex: 'baseNetPrice',
            width: 120,
            align: 'right',
            render: (value) =>
              value ? (
                <Popover placement="topLeft" content={numberSeparatorRender(value)}>
                  {numberSeparatorRender(value)}
                </Popover>
              ) : (
                ''
              ),
          },
      hideBusinessBid
        ? null
        : {
            title: intl.get(`${promptCode}.model.expertScoring.netPriceAmount`).d('行金额(不含税)'),
            dataIndex: 'netAmount',
            width: 150,
            align: 'right',
            render: numberSeparatorRender,
          },
      hideBusinessBid
        ? null
        : {
            title: intl.get(`${promptCode}.model.expertScoring.taxAmount`).d('税额'),
            dataIndex: 'taxAmount',
            width: 100,
            align: 'right',
            render: numberSeparatorRender,
          },
      hideBusinessBid
        ? null
        : {
            title: intl.get(`${promptCode}.model.expertScoring.linePrice`).d('行金额'),
            dataIndex: 'totalAmount',
            width: 100,
            align: 'right',
            render: numberSeparatorRender,
          },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
        dataIndex: 'validAttachmentUuid',
        width: 180,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              viewOnly
              filePreview
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationheader"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },

      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    const technologyColumns = [
      {
        title: intl.get(`${promptCode}.model.expertScoring.lineNo.`).d('行号'),
        dataIndex: 'sourceLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
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
        title: intl.get(`${promptCode}.model.expertScoring.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.validQtationQuantity`).d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'sourceQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.currentDeliveryCycle`).d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 100,
      },
      hideBusinessBid || header?.currentUserScoreTeam === 'TECHNOLOGY'
        ? null
        : {
            title: intl.get('ssrc.common.model.quotationDetails').d('报价明细'),
            dataIndex: 'quotationDetailFlag',
            width: 100,
            render: (val, record) => (
              <QuotationDetail
                rowData={record}
                sourceFrom={match.params.sourceFrom}
                sourceHeaderId={match.params.sourceHeaderId}
                allowBuyerViewFlag
              />
            ),
          },
      {
        title: intl.get(`${promptCode}.model.expertScoring.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.currentPromisedDate`).d('承诺交付日期'),
        dataIndex: 'validPromisedDate',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.taxRate(%)`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
        render: (val) =>
          val || intl.get('ssrc.expertScoring.model.expertScoring.excludingTax').d('不含税'),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
        dataIndex: 'validAttachmentUuid',
        width: 180,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              viewOnly
              filePreview
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationheader"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },

      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code:
              team === 'TECHNOLOGY'
                ? `SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_TECH${rfxflag}`
                : team === 'BUSINESS'
                ? `SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS${rfxflag}`
                : `SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_TECH${rfxflag}`,
          },
          <Table
            bordered
            rowKey="quotationLineId"
            columns={
              team === 'TECHNOLOGY'
                ? technologyColumns
                : team === 'BUSINESS'
                ? businessColumns
                : columns
            }
            scroll={{ x: scrollX, y: getContentScrollHeight() }}
            loading={
              loadingObj[quotationHeaderId] &&
              loadingObj[quotationHeaderId].queryScoringQuotationLoading
            }
            dataSource={itemData}
            pagination={pagination}
            onChange={(page) => onSearch(page, quotationHeaderId, item)}
          />
        )}
      </React.Fragment>
    );
  }
}
