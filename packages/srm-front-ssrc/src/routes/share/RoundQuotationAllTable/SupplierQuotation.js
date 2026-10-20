/**
 * 公用页面组件-多轮报价 物品明细 tabs
 * @date: 2019-11-21
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Table, Collapse, Pagination, Spin, Tooltip } from 'hzero-ui';
import { Attachment } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { noop } from 'lodash';

import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import CPopover from '@/routes/components/CPopover/';
import { roundEliminate, numberSeparatorRender } from '@/utils/renderer';
import { getQuotationName } from '@/utils/globalVariable';
import { getUomName, getQtyName } from '@/utils/utils';

import supplierIcon from '@/assets/supplier-icon.svg';
import downIcon from '@/assets/arrow-down-g.svg';
import eliminateIcon from '@/assets/eliminate.svg';
import { FIlESIZE } from '@/utils/SsrcRegx';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const { Group } = Attachment;

export default class SupplierQuotation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 判断数据是否是数组，长度是否存在
   *
   * @param {*} [data=[]]
   * @returns
   * @memberof SupplierQuotation
   */
  isFullArray(data = []) {
    if (!data || !Array.isArray(data) || !data.length) {
      return false;
    }
    return true;
  }

  renderHeaderQuotationRound(roundQuotation = [], lineData) {
    if (!roundQuotation) {
      return null;
    }

    const {
      currentRound = 1,
      builtRoundQuotation = () => {},
      header = {},
      bidFlag = false,
    } = this.props;

    const data = builtRoundQuotation(roundQuotation).sort((a, b) => {
      return a.quotationRoundNumber - b.quotationRoundNumber;
    });
    const quotationTaxFirstRoundStr = intl
      .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationTaxFirstRound`, {
        quotationName: getQuotationName(bidFlag),
      })
      .d('首轮{quotationName}含税金额');
    const quotationUnitFirstRoundStr = intl
      .get('ssrc.inquiryHall.model.inquiryHall.commonQuotationUnitFirstRound', {
        quotationName: getQuotationName(bidFlag),
      })
      .d('首轮{quotationName}未税金额');

    const currentRoundPrice = (item = {}) => {
      let price =
        lineData.roundQuotationRankRule === 'TAX_PRICE'
          ? item.totalRoundQuotationPrice
          : lineData.roundQuotationRankRule === 'UNIT_PRICE'
          ? item.totalRoundNetPrice
          : header.priceTypeCode === 'NET_PRICE'
          ? item.totalRoundNetPrice
          : item.totalRoundQuotationPrice;

      price = numberSeparatorRender(price) ?? '-';
      return price;
    };

    return (
      <span className={styles['round-quotation']}>
        {data.map((item, index) => (
          <span>
            <span key={item.quotationRoundNumber} style={{ marginRight: '24px' }}>
              <span>
                {item.quotationRoundNumber !== 1 ? (
                  <span>
                    {item.quotationRoundNumber}{' '}
                    {intl.get('ssrc.bidHall.model.bidHall.roundNums').d('轮')}
                  </span>
                ) : (
                  <span>
                    {lineData.roundQuotationRankRule === 'TAX_PRICE'
                      ? quotationTaxFirstRoundStr
                      : lineData.roundQuotationRankRule === 'UNIT_PRICE'
                      ? quotationUnitFirstRoundStr
                      : header.priceTypeCode === 'NET_PRICE'
                      ? quotationUnitFirstRoundStr
                      : quotationTaxFirstRoundStr}
                  </span>
                )}
              </span>
              ：
              <span
                className={classnames(
                  {
                    'ssrc-text-red-color': currentRound === index + 1,
                  },
                  'price-style'
                )}
              >
                <Tooltip title={currentRoundPrice(item)}>{currentRoundPrice(item)}</Tooltip>
              </span>
              {
                // 仅当【报价范围】为全部报价，且【允许供应商修改可供数量】不勾选时显示多轮报价的排名信息。
                header.quotationScope === 'ALL_QUOTATION' && header.quantityChangeFlag !== 1 ? (
                  <Tag
                    color={item.rank === 1 ? 'orange' : 'gray'}
                    style={{ borderColor: '#ffffff', marginLeft: '4px' }}
                  >
                    {intl.get('ssrc.supplierQuotation.model.supplierQuotation.rank').d('排名')}：
                    {item.rank}
                  </Tag>
                ) : null
              }
            </span>
          </span>
        ))}
      </span>
    );
  }

  @Bind()
  showItemDetail(data = {}) {
    const { fetchSupplierRoundQuotationDetail } = this.props;
    if (data.rfxQuotationLineDTO && data.rfxQuotationLineDTO.length) {
      return;
    }
    const { quotationHeaderId, supplierCompanyId } = data || {};
    fetchSupplierRoundQuotationDetail({ supplierCompanyId, quotationHeaderId });
  }

  /**
   * 点击头标签-停止折叠面板冒泡行为
   */
  @Bind()
  handleClickTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  // 渲染多轮附件
  @Bind()
  renderAttachments(data = {}) {
    const { header: { newQuotationFlag } = {} } = this.props;
    const commonProps = {
      readOnly: true,
      fileSize: FIlESIZE,
      labelLayout: 'float',
      bucketName: PRIVATE_BUCKET,
      data: {
        tenantId: organizationId,
      },
    };
    const attachmentNodes = [];
    const attachmentData = data.roundAttachmentMap;
    // eslint-disable-next-line guard-for-in
    for (const key in attachmentData) {
      // eslint-disable-next-line no-unused-expressions
      attachmentData?.[key]?.forEach((item) => {
        if (item?.attrType === 'SOURCE_BUSINESS_ATTACHMENT') {
          attachmentNodes.push(
            <Attachment
              label={`${intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonRoundNumAttach`, {
                  key:
                    key === '1'
                      ? intl.get('ssrc.inquiryHall.model.inquiryHall.first').d('首')
                      : key,
                })
                .d('{key}轮')}
              -
              ${intl.get('ssrc.inquiryHall.model.inquiryHall.businessAttachmentUuid').d('商务附件')}
              `}
              value={item.attachmentUuid}
              {...commonProps}
            />
          );
        } else if (item?.attrType === 'SOURCE_TECHNOLOGY_ATTACHMENT') {
          attachmentNodes.push(
            <Attachment
              label={`${intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonRoundNumAttach`, {
                  key:
                    key === '1'
                      ? intl.get('ssrc.inquiryHall.model.inquiryHall.first').d('首')
                      : key,
                })
                .d('{key}轮')}
                  -
                  ${intl.get('ssrc.inquiryHall.model.inquiryHall.techAttachmentUuid').d('技术附件')}
                  `}
              value={item.attachmentUuid}
              {...commonProps}
            />
          );
        }
      });
    }

    return !newQuotationFlag ? (
      <Group
        funcType="link"
        text={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`).d('供应商附件')}
      >
        {attachmentNodes}
      </Group>
    ) : (
      <FileGroup
        name="attachmentUuid"
        record={data}
        uiType="h0"
        fileType="HEADER"
        queryParams={{ roundScoreQueryFlag: 1 }}
      />
    );
  }

  renderCollapsePanelHeader(data = {}) {
    const {
      viewScoreDetail = () => {},
      header = {},
      remoteFunc = null,
      bidFlag = false,
    } = this.props;
    const scoreView = data.score != null && (
      <div>
        {intl.get('ssrc.inquiryHall.model.inquiryHall.getScore').d('得分')}：
        <a onClick={(e) => viewScoreDetail(e, data)}>{data.score}</a>
      </div>
    );
    return (
      <Row gutter={18} onClick={() => this.showItemDetail(data)}>
        <Col span={1}>
          {data.allEliminate ? (
            <img src={eliminateIcon} alt="icon" />
          ) : (
            <img src={supplierIcon} alt="icon" />
          )}
        </Col>
        <Col span={7} className="ssrc-text-ellipsis">
          <div style={{ display: 'flex' }}>
            <div className="ssrc-text-ellipsis m-b-ms h3">
              <CPopover
                content={
                  data.supplierCompanyNum
                    ? `${data.supplierCompanyNum}-${data.supplierCompanyName}`
                    : data.supplierCompanyName
                }
              >
                {data.supplierCompanyNum
                  ? `${data.supplierCompanyNum}-${data.supplierCompanyName}`
                  : data.supplierCompanyName}
              </CPopover>
            </div>
            <img
              style={{ paddingLeft: '6px', maxWidth: '16px', flex: 1 }}
              src={downIcon}
              alt="icon"
            />
          </div>
          <div
            style={{ color: '#666', display: 'flex', alignItems: 'center' }}
            onClick={(e) => this.handleClickTag(e)}
          >
            <CPopover
              content={`${data.contactName ?? ''} ${data.contactMobilephone ?? ''} ${
                data.contactMail ?? ''
              }`}
            >
              <span style={{ flexShrink: 1 }} className="ssrc-text-ellipsis">
                <span style={{ paddingRight: '4px' }}>{data.contactName}</span>
                <span style={{ paddingRight: '4px' }}>{data.contactMobilephone}</span>
                <span style={{ paddingRight: '16px' }}>{data.contactMail}</span>
              </span>
            </CPopover>
            <span style={{ flexShrink: 0 }}>
              {header.roundQuotationRule === 'SCORE' || header.roundQuotationRule === 'AUTO_SCORE'
                ? this.renderAttachments(data)
                : this.renderAttachments(data)}
            </span>
          </div>
        </Col>
        <Col span={2}>
          {data.minPriceSupplierFlag ? (
            <span style={{ color: '#29BECE' }}>
              {intl.get('ssrc.bidHall.view.table.lowestPrice').d('价格最低')}
            </span>
          ) : (
            ''
          )}
        </Col>
        <Col span={2} className="score">
          {remoteFunc
            ? remoteFunc.render('SSRC_ROUND_QUOTATION_SCORE_RENDER', scoreView, { header, bidFlag })
            : scoreView}
        </Col>
        <Col span={12}>{this.renderHeaderQuotationRound(data.roundQuotation, data)}</Col>
      </Row>
    );
  }

  // 合众能源二开
  renderColumns() {
    const {
      roundColumns = [],
      bidFlag = false,
      doubleUnitFlag = false,
      header = {},
      getUnitPriceTitle = noop,
      getSecPriceTitle = noop,
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        width: 250,
        dataIndex: 'itemName',
        render: (val, record) => roundEliminate(val, record),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
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
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 120,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 120,
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
    ].filter(Boolean);

    return columns;
  }

  renderTableList(data = [], quotationHeaderId) {
    const scrollX = tableScrollWidth(this.renderColumns());
    const {
      quotationSupplierDetailPagination,
      fetchSupplierRoundQuotationDetail,
      fetchSupplierRoundQuotationDetailLoading,
      customizeTable = noop,
      getCustomizeUnitCode = noop,
    } = this.props;

    return customizeTable(
      {
        code: getCustomizeUnitCode('supplierDetail'),
      },
      <Table
        bordered
        rowKey="quotationLineId"
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        pagination={quotationSupplierDetailPagination[quotationHeaderId]}
        onChange={(page) => fetchSupplierRoundQuotationDetail({ quotationHeaderId, page })}
        loading={
          fetchSupplierRoundQuotationDetailLoading &&
          fetchSupplierRoundQuotationDetailLoading[quotationHeaderId]
        }
        dataSource={data}
      />
    );
  }

  renderPagination() {
    const { quotationSupplierListPagination, onChangePagination } = this.props;
    return (
      <Pagination
        className={styles.pagination}
        {...quotationSupplierListPagination}
        onChange={(page, pageSize) => onChangePagination(page, pageSize)}
        onShowSizeChange={(current, size) => onChangePagination(current, size)}
      />
    );
  }

  render() {
    const {
      dataSource = [],
      collapseSupplierActiveKeys = [],
      changeSupplierPanel,
      fetchSupplierLoading,
    } = this.props;

    if (!Array.isArray(dataSource) || !dataSource.length) {
      return null;
    }

    return (
      <div className="ssrc-customer-component">
        <Spin spinning={fetchSupplierLoading}>
          <Collapse
            activeKey={collapseSupplierActiveKeys}
            onChange={(key) => changeSupplierPanel(key)}
          >
            {dataSource.map((item) => (
              <Collapse.Panel
                key={(item.quotationHeaderId || '').toString()}
                header={this.renderCollapsePanelHeader(item)}
                showArrow={false}
                className={styles['supplier-collapse-header']}
              >
                {this.renderTableList(item.rfxQuotationLineDTO, item.quotationHeaderId)}
              </Collapse.Panel>
            ))}
          </Collapse>
        </Spin>
        {this.renderPagination()}
      </div>
    );
  }
}
