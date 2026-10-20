/**
 *  中标详情
 * c7n-pro
 */

import React, { Component } from 'react';
import { noop, isNil } from 'lodash';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import { yesOrNoRender } from 'utils/renderer';

import { numberSeparatorRender, useTernaryExpression } from '@/utils/renderer';

import { idValidation } from '@/routes/components/Widget/dataVerification';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import { winBidDetailDataSet } from '../store/TableCommonDataSet';

@observer
export default class WinningBidDetail extends Component {
  constructor(props) {
    super(props);

    const { rfx = {}, doubleUnitFlag, onRef } = props || {};

    if (onRef) {
      onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    const dsProps = {
      ...rfx,
      organizationId: this.organizationId,
      doubleUnitFlag,
    };

    this.winBidDetailDS = new DataSet(winBidDetailDataSet(dsProps));
  }

  componentDidMount() {
    this.fetchList();
  }

  componentWillUnmount() {
    this.winBidDetailDS.reset();
    this.winBidDetailDS.loadData();
  }

  fetchList = () => {
    const { currentStep, rfxHeaderId, getCommonApiParamsObj } = this.props;

    if (currentStep !== 'FINISHED') {
      return;
    }

    idValidation(rfxHeaderId);

    const permanentParams = getCommonApiParamsObj ? getCommonApiParamsObj() || {} : {}; // 固定参数

    const params = {
      organizationId: this.organizationId,
      rfxHeaderId,
      customizeUnitCode: this.getCurrentTableUnitCode(),
      ...permanentParams,
    };

    this.winBidDetailDS.setQueryParameter('commonProps', params);
    this.winBidDetailDS.query();
  };

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

  getColumns = () => {
    const {
      header = {},
      doubleUnitFlag = false,
      // fetchHistoryline,
      // onComparePriceHistory,
      tableCommonFields = noop,
      viewLadderLevel = noop,
      bidFlag,
    } = this.props;
    const { newQuotationFlag } = header || {};

    const columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
        align: 'left',
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'specs',
        width: 120,
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      }),
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryUomName',
        width: 100,
      }),
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'companyNum',
        width: 120,
      },
      {
        name: 'companyName',
        width: 180,
        // renderer: ({ value, record }) => {
        //   const nameValue = value ? roundEliminate(value, record, { uiType: 'c7n-pro' }) : '';
        //   return nameValue;
        // },
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'allottedRatio',
        width: 100,
      },
      {
        name: 'allottedQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'allottedSecondaryQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      }),
      {
        name: 'suggestedRemark',
        width: 140,
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'validQuotationSecPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => this.renderPrice(value, record, 'validQuotationSecPrice'),
      }),
      {
        name: 'validQuotationPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => this.renderPrice(value, record, 'validQuotationPrice'),
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'validNetSecondaryPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => this.renderPrice(value, record, 'validNetSecondaryPrice'),
      }),
      {
        name: 'validNetPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => this.renderPrice(value, record, 'validNetPrice'),
      },
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => {
          const currentQuotationDetailProps = {
            rowData: record,
            uiType: 'c7n-pro',
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
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) => {
          return value === 1 ? (
            <a onClick={() => viewLadderLevel({ record })}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'priceBatchQuantity',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'totalPrice',
        width: 140,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'netAmount',
        width: 140,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'paymentTypeName',
        width: 120,
      },
      {
        name: 'paymentTermName',
        width: 120,
      },
      {
        name: 'validExpiryDateFrom',
        width: 100,
      },
      {
        name: 'validExpiryDateTo',
        width: 100,
      },
      {
        name: 'validDeliveryCycle',
        width: 100,
      },
      {
        name: 'minPurchaseQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'minPackageQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'validQuotationRemark',
        width: 200,
      },
      {
        name: 'attachmentUuid',
        width: 120,
        renderer: ({ value, record }) => {
          return !newQuotationFlag ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              attachmentUUID={value}
              tenantId={this.organizationId}
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
          );
        },
      },
      ...(tableCommonFields({ winBidFlag: 1 }) || []),
    ].filter(Boolean);

    return columns;
  };

  getCurrentTableUnitCode = () => {
    const { getCustomizeUnitCode } = this.props;

    let code = '';

    if (getCustomizeUnitCode) {
      code = getCustomizeUnitCode('winBid');
    }

    return code;
  };

  render() {
    const { customizeTable = noop } = this.props;

    return (
      <div>
        {customizeTable(
          {
            code: this.getCurrentTableUnitCode(),
          },
          <Table
            bordered
            dataSet={this.winBidDetailDS}
            columns={this.getColumns()}
            style={{
              maxHeight: '500px',
            }}
            virtual
            virtualCell
          />
        )}
      </div>
    );
  }
}
