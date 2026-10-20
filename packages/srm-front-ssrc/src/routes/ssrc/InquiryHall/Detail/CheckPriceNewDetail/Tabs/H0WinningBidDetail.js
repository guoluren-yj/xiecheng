/**
 *  中标详情
 * hzero
 */

import React, { Component } from 'react';
import { Popover, Table } from 'hzero-ui';
import moment from 'moment';
import { noop, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import {
  getUomName,
  getQtyName,
  getAllottedQuantity,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import {
  getResponse,
  createPagination,
  getCurrentOrganizationId,
  tableScrollWidth,
} from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender, useTernaryExpression } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from 'srm-front-boot/lib/components/Upload';

import { fetchWinBidLine } from '@/services/inquiryHallService';

import { idValidation } from '@/routes/components/Widget/dataVerification';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

@observer
export default class H0WinningBidDetail extends Component {
  constructor(props) {
    super(props);

    const { onRef } = props || {};

    if (onRef) {
      onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      tableData: [],
      tablePagination: {},
      loading: false,
    };
  }

  componentDidMount() {
    this.fetchList();
  }

  componentWillUnmount() {}

  @Bind()
  async fetchList(page = {}, otherParams = {}) {
    const { rfxHeaderId, pubRouterAddParams = () => {}, currentStep } = this.props;

    if (currentStep !== 'FINISHED') {
      return;
    }

    idValidation(rfxHeaderId);

    const permanentParams = pubRouterAddParams ? pubRouterAddParams() || {} : {}; // 固定参数

    const params = {
      organizationId: this.organizationId,
      rfxHeaderId,
      customizeUnitCode: this.getCurrentTableUnitCode(),
      page,
      ...otherParams,
      ...permanentParams,
    };

    try {
      this.setState({
        loading: true,
      });
      let data = await fetchWinBidLine(params);
      data = getResponse(data);
      if (!data) {
        return;
      }

      const { content = [] } = data || {};
      const pagination = createPagination(data);

      this.setState({
        tableData: content,
        tablePagination: pagination,
      });
    } catch (e) {
      throw e;
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  /**
   * 渲染价格
   */
  renderPrice = (value = null) => {
    if (isNil(value)) {
      return '-';
    }

    const mean = numberSeparatorRender(value);

    return mean;
  };

  renderLongText = (value) => {
    return value ? (
      <Popover placement="topLeft" content={value}>
        {value}
      </Popover>
    ) : (
      ''
    );
  };

  getColumns = () => {
    const { header = {}, doubleUnitFlag = false, rfx, viewLadderLevel = noop } = this.props;
    const { newQuotationFlag } = header || {};
    const { quotationName = '', bidFlag } = rfx || {};

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
        render: this.renderLongText,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
        render: this.renderLongText,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: this.renderLongText,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: '',
        render: this.renderLongText,
      },
      {
        title: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        dataIndex: 'specs',
        width: 120,
        render: this.renderLongText,
      },
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'secondaryQuantity',
        width: 100,
        render: (value) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      }),
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: (value) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'secondaryUomName',
        width: 100,
      }),
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        dataIndex: 'companyName',
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        width: 180,
        render: this.renderLongText,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        dataIndex: 'allottedRatio',
        width: 100,
      },
      {
        title: getAllottedQuantity(doubleUnitFlag),
        dataIndex: 'allottedQuantity',
        width: 100,
        render: (value) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        dataIndex: 'allottedSecondaryQuantity',
        width: 100,
        render: (value) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      }),
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        dataIndex: 'suggestedRemark',
        width: 140,
        render: this.renderLongText,
      },
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        dataIndex: 'validQuotationSecPrice',
        width: 120,
        align: 'right',
        render: (value) => this.renderPrice(value),
      }),
      {
        dataIndex: 'validQuotationPrice',
        title: getPriceName(doubleUnitFlag),
        width: 120,
        align: 'right',
        render: (value) => this.renderPrice(value),
      },
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetSecondaryPrice',
        width: 120,
        align: 'right',
        render: (value) => this.renderPrice(value),
      }),
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        width: 120,
        align: 'right',
        render: (value) => this.renderPrice(value),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (_, record) => {
          const currentQuotationDetailProps = {
            rowData: record,
          };

          return (
            <QuotationDetail
              rowData={record}
              sourceFrom="RFX"
              allowBuyerViewFlag
              pageFrom="checkPriceDetail"
              bidFlag={bidFlag}
              {...currentQuotationDetailProps}
            />
          );
        },
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 140,
        align: 'right',
        render: (value) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 140,
        align: 'right',
        render: (value) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
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
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
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
        render: (value) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 120,
        render: (value) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
        dataIndex: 'validQuotationRemark',
        width: 120,
        render: this.renderLongText,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={this.organizationId}
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);

    return columns;
  };

  getCurrentTableUnitCode = () => {
    const { rfx } = this.props;
    const { bidFlag } = rfx || {};

    let code = 'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE.WIN_BID_DETAIL';
    if (bidFlag) {
      code = 'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE.WIN_BID_DETAIL';
    }

    return code;
  };

  render() {
    const { customizeTable = noop } = this.props;
    const { tableData, tablePagination, loading } = this.state;

    const columns = this.getColumns();
    const scrollX = tableScrollWidth(columns) || 0;

    const tableProps = {
      bordered: true,
      rowKey: 'quotationLineId',
      loading,
      columns,
      scroll: { x: scrollX, y: 360 },
      dataSource: tableData,
      pagination: tablePagination,
      onChange: (page) => this.fetchList(page),
    };

    return (
      <div>
        {customizeTable(
          {
            code: this.getCurrentTableUnitCode(),
          },
          <Table {...tableProps} />
        )}
      </div>
    );
  }
}
