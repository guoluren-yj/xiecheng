import React, { Component } from 'react';
import { sum, isNumber } from 'lodash';
// import moment from 'moment';
import { connect } from 'dva';
// import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import EditTable from 'components/EditTable';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import Upload from 'srm-front-boot/lib/components/Upload';
import { FIlESIZE } from '@/utils/SsrcRegx';

import intl from 'utils/intl';
import { yesOrNoRender, dateTimeRender, dateRender, } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getAllottedQuantity,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';

const promptCode = 'ssrc.resultsQuery';
@connect(({ inquiryHall }) => ({
  inquiryHall,
}))
export default class DetailLineTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewOnly: true,
    };
  }

  render() {
    const {
      organizationId,
      loading,
      dataSource,
      pagination,
      handleResultsQueryLine,
      viewLadderLevel,
      customizeTable = () => {},
      linktoPrNumDetail,
      doubleUnitFlag,
    } = this.props;
    const { viewOnly } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.resultsQuery.selectionStrategy`).d('选择策略'),
        dataIndex: 'selectionStrategyMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.suggested`).d('选用'),
        dataIndex: 'suggestedFlag',
        width: 60,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.suggestedRemark`).d('选用理由'),
        dataIndex: 'suggestedRemark',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.categoryName`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 80,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.resultsQuery.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.resultsQuery.itemNum`).d('行号'),
        dataIndex: 'itemNum',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.companyNum`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.erpSupplierCompanyNum`)
          .d('ERP供应商编码'),
        dataIndex: 'erpSupplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'taxPrice',
        width: 80,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'unitPrice',
        align: 'right',
        width: 120,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.resultsQuery.unitPrice`).d('单价'),
            dataIndex: 'taxSecondaryPrice',
            width: 80,
            align: 'right',
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'netSecondaryPrice',
            align: 'right',
            width: 120,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.resultsQuery.quotationDetail`).d('报价明细'),
        width: 100,
        dataIndex: 'quotationDetailFlag',
        render: (val, record) => (
          <React.Fragment>
            {
              <QuotationDetail
                rowData={record}
                sourceFrom={record.sourceFrom}
                sourceHeaderId={record.sourceHeaderId}
                allowBuyerViewFlag
                bidFlag={record.secondarySourceCategory === 'NEW_BID'}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.ladderInquiry`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (_, record) =>
          record.ladderInquiryFlag === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`${promptCode}.model.resultsQuery.ladderInquiry`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: <span>{intl.get(`${promptCode}.model.resultsQuery.taxRate`).d('税率')} (%)</span>,
        dataIndex: 'taxRate',
        width: 80,
        align: 'right',
      },
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl
              .get(`${promptCode}.model.resultsQuery.validQuotationQuantity`)
              .d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.resultsQuery.selectLineCost`).d('选用行金额'),
        dataIndex: 'totalCost',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.selectLineAmountWithoutTax`)
          .d('选用行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 140,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.quotedDate`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.validQuotationRemark`).d('报价说明'),
        dataIndex: 'validQuotationRemark',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.lastQuotation`).d('上次报价'),
        dataIndex: 'lastQuotation',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.floatPrice`).d('价格浮动'),
        dataIndex: 'floatPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.totalCostPrice`).d('成本行金额'),
        dataIndex: 'totalCostPrice',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.quotationExpiryDateFrom`)
          .d('报价有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 120,
        render: dateRender,
      },

      {
        title: intl.get(`${promptCode}.model.resultsQuery.quotationExpiryDateTo`).d('报价有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.priceBatchQuantity`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        align: 'right',
      },
      {
        title: getAllottedQuantity(doubleUnitFlag),
        dataIndex: 'quantity',
        width: 100,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.resultsQuery.quantity`).d('分配数量'),
            dataIndex: 'ssrSecondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.resultsQuery.distributionRatio`).d('分配比例'),
        dataIndex: 'distributionRatio',
        width: 100,
      },
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.resultsQuery.rfxQuantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.resultsQuery.purchasapplicationNum`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 150,
        render: (val, record) => <a onClick={() => linktoPrNumDetail(record)}> {val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.purchasappitemNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.controlProtocolFlag`).d('控制协议数量'),
        dataIndex: 'controlProtocolFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.attachmentUuid`).d('供应商附件'),
        dataIndex: 'attachmentUuid',
        width: 110,
        render: (val) =>
          val ? (
            <Upload
              filePreview
              viewOnly={viewOnly}
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
              btnText={intl.get(`${promptCode}.model.resultsQuery.downLoadFile`).d('下载附件')}
              fileSize={FIlESIZE}
            />
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.rfxAttachmentUuid`).d('询价单附件'),
        dataIndex: 'rfxAttachmentUuid',
        width: 110,
        render: (val) =>
          val ? (
            <Upload
              filePreview
              viewOnly={viewOnly}
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-rfxitem"
              attachmentUUID={val}
              tenantId={organizationId}
              btnText={intl.get(`${promptCode}.model.resultsQuery.downLoadFile`).d('下载附件')}
              fileSize={FIlESIZE}
            />
          ) : (
            ''
          ),
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      {
        code: 'SSRC.RESULTS_QUERY.DETAIL',
        readOnly: true,
      },
      <EditTable
        bordered
        rowKey="quotationLineId"
        loading={loading}
        columns={columns}
        scroll={{ x: scrollX, y: 450 }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => handleResultsQueryLine(page)}
      />
    );
  }
}
