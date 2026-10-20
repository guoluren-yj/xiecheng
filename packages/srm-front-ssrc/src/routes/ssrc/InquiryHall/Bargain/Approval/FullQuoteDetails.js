import React, { Component, Fragment } from 'react';
import { Popover } from 'hzero-ui';
import moment from 'moment';
import { isNumber, sum } from 'lodash';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  getPriceName,
  getNetPriceName,
  getAvailableQtyName,
  getUomName,
  getQtyName,
  TooltipTitle,
} from '@/utils/utils';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import { numberSeparatorRender, renderRedMinPrice } from '@/utils/renderer';
import LadderLevelModal from '../../FeedbackBargain/LadderLevelModal';

export default class FullQuoteDetails extends Component {
  // 单位
  renderUom = (_, record = {}) => {
    const { uomCode: code = '', uomName: name = '' } = record;

    return code && name ? `${code}/${name}` : `${code || name || ''}`;
  };

  render() {
    const {
      fullDetailsLoading,
      onSearch,
      dataSource,
      pagination,
      sourceKey = INQUIRY,
      // bargainFullDetLine,
      organizationId,
      viewLadderLevel,
      viewLadderLevelVisible,
      hideModal,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading,
      fetchLoading,
      customizeTable,
      match,
      doubleUnitFlag,
    } = this.props;
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading,
      fetchLoading,
      backPath: 'bargain',
      readOnlyFlag: 1,
    };
    const columns = [
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemNum`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        sorter: true,
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.categoryName`).d('物料分类'),
        dataIndex: 'itemCategoryName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        sorter: true,
        width: 120,
      },
      doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
            dataIndex: 'validQuotationSecPrice',
            width: 100,
            align: 'right',
          }
        : null,
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validQuotationPrice',
        width: 120,
        align: 'right',
        render: (value, record) =>
          renderRedMinPrice({ value, record, name: 'validQuotationPrice', isNeedSeparator: false }),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            align: 'right',
            width: 100,
          }
        : null,
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        align: 'right',
        width: 120,
        render: (value, record) =>
          renderRedMinPrice({ value, record, name: 'validNetPrice', isNeedSeparator: false }),
      },
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
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
        align: 'right',
      },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价')}
            tipValue={intl
              .get(`ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary`)
              .d('辅助单位对应的还价单价')}
          />
        ),
        dataIndex: 'currentBargainPrice',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentBargainRemark`).d('还价理由'),
        dataIndex: 'currentBargainRemark',
        width: 100,
        align: 'right',
      },
      {
        title: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`)
              .d('有效还价单价')}
            tipValue={intl
              .get(`ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary`)
              .d('辅助单位对应的有效还价单价')}
          />
        ),
        dataIndex: 'validBargainPrice',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
        dataIndex: 'validBargainRemark',
        width: 120,
        render: (val) => (
          <Popover placement="topLeft" content={val}>
            {val}
          </Popover>
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
        render: (_, record) => (
          <QuotationDetail
            rowData={record}
            sourceFrom={match?.url?.includes('RFQ') ? 'RFX' : 'BID'}
            allowBuyerViewFlag
            pageFrom="bargainApprove"
            bidFlag={sourceKey === BID}
          />
        ),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: (value) => numberSeparatorRender(value),
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 120,
        render: (value) => numberSeparatorRender(value),
      },
      doubleUnitFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`)
              .d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
          }
        : null,
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 120,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 120,
          }
        : null,
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
        render: this.renderUom,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.companyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 120,
        render: (value) => dateRender(value),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 120,
        render: (value) => dateRender(value),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
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
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (val) =>
          val ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Fragment>
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL_BARGAIN.ALLQUOTATION`,
          },
          <EditTable
            bordered
            loading={fullDetailsLoading}
            columns={columns}
            rowKey="quotationLineId"
            dataSource={dataSource}
            scroll={{ x: scrollX }}
            // rowSelection={bargainFullDetLine}
            pagination={pagination}
            onChange={(page, _, sorter) => onSearch(page, _, sorter)}
          />
        )}
        {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}
      </Fragment>
    );
  }
}
