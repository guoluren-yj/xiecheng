/**
 * 物料行表 - 初步评审_供应商维度(暂不包含招投标)
 * @date: 2020-12-28
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Popover, Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import moment from 'moment';

import Upload from 'srm-front-boot/lib/components/Upload';
import { yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';
import {
  getPriceName,
  getNetPriceName,
  getAvailableQtyName,
  getUomName,
  getQtyName,
} from '@/utils/utils';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { PRIVATE_BUCKET } from '_utils/config';

const promptCode = 'ssrc.expertScoring';

export default class ItemLineTable extends Component {
  render() {
    const {
      header = {},
      organizationId,
      item,
      onSearch,
      scoringQuotationList = [],
      loadingObj = {},
      quotationHeaderId,
      sectionId,
      match,
      viewLadderLevel,
      doubleUnitFlag,
      customizeTable,
      newQuotationFlag = false,
    } = this.props;
    const { secondarySourceCategory } = header || {};
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
      doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
            align: 'right',
            dataIndex: 'validQuotationSecPrice',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: getPriceName(doubleUnitFlag),
        align: 'right',
        dataIndex: 'validQuotationPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            align: 'right',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        align: 'right',
        width: 120,
        render: numberSeparatorRender,
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
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'sourceQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.expertScoring.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
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
      {
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
      {
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
      {
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
      {
        title: intl.get(`${promptCode}.model.expertScoring.netPriceAmount`).d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 150,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
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

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return customizeTable(
      {
        code: 'SSRC.EXPERT_SCORE_REVIEW.QUOTATION_LINE',
      },
      <Table
        bordered
        rowKey="quotationLineId"
        columns={columns}
        scroll={{ x: scrollX }}
        loading={
          loadingObj[quotationHeaderId] &&
          loadingObj[quotationHeaderId].queryScoringQuotationLoading
        }
        dataSource={itemData}
        pagination={pagination}
        onChange={(page) => onSearch(page, quotationHeaderId, item)}
      />
    );
  }
}
