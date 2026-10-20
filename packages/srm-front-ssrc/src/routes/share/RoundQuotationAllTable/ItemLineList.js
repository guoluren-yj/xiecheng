/**
 * 公用页面组件-多轮报价 供应商报价 tabs
 * @date: 2019-11-21
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Table, Collapse, Pagination, Spin } from 'hzero-ui';
import classnames from 'classnames';
import { noop, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Tooltip } from 'choerodon-ui/pro';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import { getQuotationName } from '@/utils/globalVariable';

import { roundEliminate, numberSeparatorRender } from '@/utils/renderer';
import { getUomName, getAvailableQtyName, getApplicationWord } from '@/utils/utils';
import CPopover from '@/routes/components/CPopover/';

import goodsIcon from '@/assets/goodsIcon.svg';
import downIcon from '@/assets/arrow-down-g.svg';
import { PRIVATE_BUCKET } from '_utils/config';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';

import styles from './index.less';

export default class ItemLineList extends Component {
  // 合众能源二开
  renderColumns() {
    const {
      roundColumns = [],
      organizationId,
      bidFlag,
      doubleUnitFlag = false,
      newQuotationFlag = false,
      header = {},
      getUnitPriceTitle = noop,
      getSecPriceTitle = noop,
    } = this.props;

    const columns = [
      {
        title: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
      },
      {
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 250,
        render: (val, record) => roundEliminate(val, record),
      },
      ...roundColumns,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.common.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 120,
      },
      doubleUnitFlag
        ? {
            title: getSecPriceTitle(),
            dataIndex: 'validQuotationSecPrice',
            width: 80,
            align: 'right',
            render: (val, record) => {
              const validValue =
                header.roundQuotationRankRule === 'TAX_PRICE'
                  ? val
                  : header.roundQuotationRankRule === 'UNIT_PRICE'
                  ? record.validNetSecondaryPrice
                  : header.priceTypeCode === 'NET_PRICE'
                  ? record.validNetSecondaryPrice
                  : val;
              return validValue !== null ? numberSeparatorRender(validValue) : '-';
            },
          }
        : null,
      {
        title: getUnitPriceTitle({ doubleUnitFlag, header }),
        dataIndex: 'validQuotationPrice',
        width: 120,
        align: 'right',
        render: (val, record) => {
          const validValue =
            header.roundQuotationRankRule === 'TAX_PRICE'
              ? val
              : header.roundQuotationRankRule === 'UNIT_PRICE'
              ? record.validNetPrice
              : header.priceTypeCode === 'NET_PRICE'
              ? record.validNetPrice
              : val;
          return validValue !== null ? numberSeparatorRender(validValue) : '-';
        },
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
            render: (val) => (val !== null ? val : '-'),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 120,
        render: (val) => (val !== null ? val : '-'),
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: yesOrNoRender,
        // render: (val, record) =>
        //   val === 1 ? (
        //     <a onClick={() => viewLadderLevel(record)}>
        //       {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
        //     </a>
        //   ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 150,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 150,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 150,
        render: (val) => {
          return dateTimeRender(val);
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.deliveryPeriod`).d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 100,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 120,
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
        render: (val) => {
          return dateTimeRender(val);
        },
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              viewOnly
              filePreview
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            <FileGroup
              name="attachmentUuid"
              record={record}
              uiType="h0"
              fileType="LINE"
              queryParams={{ roundScoreQueryFlag: 1 }}
            />
          );
        },
      },
    ].filter(Boolean);

    return columns;
  }

  renderTableList(data = [], rfxLineItemId) {
    const {
      quotationItemDetailPagination,
      fetchItemRoundQuotationDetail,
      fetchItemRoundQuotationDetailLoading,
      customizeTable = noop,
      getCustomizeUnitCode = noop,
    } = this.props;
    const scrollX = tableScrollWidth(this.renderColumns());

    return customizeTable(
      {
        code: getCustomizeUnitCode('itemDetail'),
      },
      <Table
        bordered
        rowKey="quotationLineId"
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        pagination={quotationItemDetailPagination[rfxLineItemId]}
        onChange={(page) => fetchItemRoundQuotationDetail({ rfxLineItemId, page })}
        loading={
          fetchItemRoundQuotationDetailLoading &&
          fetchItemRoundQuotationDetailLoading[rfxLineItemId]
        }
        dataSource={data}
      />
    );
  }

  @Bind()
  showItemDetail(data) {
    const { fetchItemRoundQuotationDetail } = this.props;
    if (data.rfxQuotationLineDTO && data.rfxQuotationLineDTO.length) {
      return;
    }
    fetchItemRoundQuotationDetail({ rfxLineItemId: data.rfxLineItemId });
  }

  // 报价供应商数 合众能源二开
  @Bind()
  quotationSupplier() {
    return null;
  }

  getPriceValue = (item) => {
    const { totalRoundQuotationPrice = null } = item || {};
    const price = !isNil(totalRoundQuotationPrice)
      ? numberSeparatorRender(totalRoundQuotationPrice)
      : '-';

    return price;
  };

  // 物品报价头多轮报价轮次
  renderRoundQuotationPrice(roundQuotation = [], obj = {}) {
    if (!roundQuotation) {
      return null;
    }

    const { currentRound = 1, builtRoundQuotation = () => {} } = this.props;

    const data = builtRoundQuotation(roundQuotation).sort((a, b) => {
      return a.quotationRoundNumber - b.quotationRoundNumber;
    });

    return (
      <>
        <span style={{ lineHeight: '24px' }}>
          {data.map((item, index) => (
            <span key={item.quotationRoundNumber} style={{ marginRight: '24px' }}>
              <span>
                {item.quotationRoundNumber !== 1 ? (
                  <span>
                    {item.quotationRoundNumber}{' '}
                    {intl.get('ssrc.bidHall.model.bidHall.roundNums').d('轮')}
                  </span>
                ) : (
                  <span>
                    {intl.get('ssrc.bidHall.model.bidHall.lowPriceFirstRound').d('首轮最低金额')}
                  </span>
                )}
              </span>
              ：
              <span
                className={classnames({
                  'ssrc-text-red-color': currentRound === index + 1,
                })}
              >
                {this.getPriceValue(item)}
              </span>
            </span>
          ))}
        </span>
        {this.quotationSupplier(obj?.attributeVarchar20)}
      </>
    );
  }

  renderCollapsePanelHeader(data = {}) {
    const { doubleUnitFlag = false } = this.props;
    return (
      <Row gutter={18} onClick={() => this.showItemDetail(data)}>
        <Col span={1}>
          <img src={goodsIcon} alt="goods" />
        </Col>
        <Col span={5}>
          <h3 className="ssrc-text-ellipsis m-b-ms">
            <CPopover
              content={data.itemCode ? `${data.itemCode}-${data.itemName}` : `${data.itemName}`}
            >
              {data.itemCode ? `${data.itemCode}-${data.itemName}` : `${data.itemName}`}
            </CPopover>
            <img style={{ paddingLeft: '6px' }} src={downIcon} alt="down" />
          </h3>
          <div className="ssrc-text-ellipsis" style={{ color: '#666' }}>
            <CPopover content={data.description}>{data.description}</CPopover>
          </div>
        </Col>
        <Col span={3}>
          <Tooltip
            placement="topLeft"
            title={
              data[getApplicationWord(doubleUnitFlag, 'rfxQuantity', 'secondaryQuantity')] || 0
            }
          >
            <div className="ssrc-round-quotation-number ssrc-text-ellipsis">
              {intl.get('ssrc.common.number').d('数量')}:
              {data[getApplicationWord(doubleUnitFlag, 'rfxQuantity', 'secondaryQuantity')] || 0}
            </div>
          </Tooltip>
        </Col>
        <Col span={12}>{this.renderRoundQuotationPrice(data.roundQuotation, data)}</Col>
        <Col span={3} className="ssrc-text-ellipsis m-b-ms">
          {data.minPriceSuppliers ? (
            <CPopover content={data.minPriceSuppliers}>
              {intl.get('ssrc.common.supplier').d('供应商')}
              {`: `}
              {data.minPriceSuppliers || ''}
            </CPopover>
          ) : (
            ''
          )}
        </Col>
      </Row>
    );
  }

  render() {
    const {
      dataSource = [],
      collapseItemLineActiveKeys = [],
      changeItemLinePanel,
      quotationItemListPagination,
      onChangePagination,
      fetchItemLineLoading,
    } = this.props;

    if (!Array.isArray(dataSource) || !dataSource.length) {
      return null;
    }

    return (
      <div className="ssrc-customer-component">
        <Spin spinning={fetchItemLineLoading}>
          <Collapse
            activeKey={collapseItemLineActiveKeys}
            onChange={(key) => changeItemLinePanel(key)}
          >
            {dataSource.map((item) => (
              <Collapse.Panel
                key={(item.rfxLineItemId || '').toString()}
                header={this.renderCollapsePanelHeader(item)}
                showArrow={false}
              >
                {this.renderTableList(item.rfxQuotationLineDTO, item.rfxLineItemId)}
              </Collapse.Panel>
            ))}
          </Collapse>
        </Spin>

        <Pagination
          className={styles.pagination}
          {...quotationItemListPagination}
          onChange={(page, pageSize) => onChangePagination(page, pageSize)}
          onShowSizeChange={(current, size) => onChangePagination(current, size)}
        />
      </div>
    );
  }
}
