import React, { Component } from 'react';
import { Collapse, Popover, Row, Col, Tag, Pagination, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import moment from 'moment';
import { isNumber, sum } from 'lodash';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
// import { getDateFormat } from 'utils/utils';
// import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import goodsIcon from '@/assets/goodsIcon.svg';
// import fileIcon from '@/assets/file.svg';
import downIcon from '@/assets/arrow-down-g.svg';
import { PRIVATE_BUCKET } from '_utils/config';

import LadderLevelModal from '../../FeedbackBargain/LadderLevelModal';
import styles from '../index.less';

const { Panel } = Collapse;

export default class ItemDetailsOffline extends Component {
  @Bind()
  changePage(page, itemId) {
    const { onSearch } = this.props;
    onSearch(page, itemId, 2);
  }

  /**
   * 渲染折叠框头
   */
  @Bind()
  renderCollapseHeader(data = {}) {
    return (
      <Row>
        <Col span={1}>
          <img src={goodsIcon} alt="icon" />
        </Col>
        <Col span={5}>
          <h3>
            <Popover
              content={
                <span>
                  {data.itemCode ? `${data.itemCode}-` : null}
                  {data.itemName}
                </span>
              }
            >
              {data.itemCode ? `${data.itemCode}-` : null}
              {data.itemName}
            </Popover>
            <img style={{ paddingLeft: '6px' }} src={downIcon} alt="icon" />
          </h3>
          {/* <a style={{ display: 'inline-flex' }}>
            {intl.get('hzero.common.upload.modal.title').d('附件')}
            <img src={fileIcon} style={{ paddingLeft: '5.4px' }} alt="" />
          </a> */}
        </Col>
        <Col span={15}>
          <Tag style={{ backgroundColor: 'rgba(6,135,255,0.1)', color: 'rgb(6,135,255)' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
            {data.rfxLineItemNum}
          </Tag>
          <Tag style={{ backgroundColor: 'rgba(243,49,103,0.1)', color: 'rgb(243,49,103)' }}>
            {data.rfxQuantity}（{data.uomName}）
          </Tag>
          <Tag style={{ backgroundColor: 'rgba(255,188,0,0.1)', color: 'rgb(255,188,0)' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：{data.taxRate}
          </Tag>
        </Col>
      </Row>
    );
  }

  /**
   * 渲染表格
   */
  @Bind()
  renderItemTable(itemId, data, pagination) {
    const {
      loadingFlag,
      organizationId,
      pageSize,
      viewLadderLevel,
      // bargainHeader = {},
      customizeTable,
    } = this.props;
    // const { priceTypeCode = null } = bargainHeader || {};
    // 过滤出当前供应商对应的数据
    const proItemData = data && data.filter((item) => item.rfxLineItemId === itemId);
    // const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';
    const proItemPagination = pagination[itemId];

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationStatus`).d('报价状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        dataIndex: 'currentQuotationPrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        dataIndex: 'taxId',
        width: 100,
        render: (_, record) => record.taxRate,
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
          <QuotationDetail rowData={record} sourceFrom="RFX" allowBuyerViewFlag />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 100,
        render: (val, record) => (record.hiddenQuotationFlag === 1 ? '***' : val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDescription`).d('报价说明'),
        dataIndex: 'validQuotationRemark',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: (value) => (value !== null ? value : '-'),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'currentExpiryDateFrom',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'currentExpiryDateTo',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'currentPromisedDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.deliveryPeriod`).d('供货周期'),
        dataIndex: 'currentDeliveryCycle',
        width: 100,
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
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return customizeTable(
      {
        code: 'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
      },
      <EditTable
        bordered
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={proItemData}
        pagination={
          (pageSize && pageSize[itemId] && pageSize[itemId]) > 10 ? proItemPagination : false
        }
        loading={loadingFlag[itemId] && loadingFlag[itemId].itemLineBargainLoading}
        rowKey="quotationLineId"
        onChange={(page) => this.changePage(page, itemId)}
      />
    );
  }

  render() {
    const {
      headerInfo,
      headerPagination,
      onChangePagination,
      handleItemCallBack,
      dataSource,
      pagination,
      collapseItemActiveKeys,
      fetchItemDetailsInfoLoading,
      viewLadderLevelVisible,
      hideModal,
      barginLadderLevelData,
      onSaveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading,
      fetchLoading,
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
    };
    return (
      <div className="ssrc-customer-component">
        {headerInfo &&
          headerInfo.map((data) => (
            <Spin spinning={fetchItemDetailsInfoLoading}>
              <Collapse
                className={styles.collapseAll}
                activeKey={collapseItemActiveKeys}
                onChange={(key) => handleItemCallBack(data.rfxLineItemId, key)}
              >
                <Panel
                  header={this.renderCollapseHeader(data)}
                  showArrow={false}
                  key={data.rfxLineItemId}
                >
                  {this.renderItemTable(data.rfxLineItemId, dataSource, pagination)}
                </Panel>
              </Collapse>
            </Spin>
          ))}
        {headerPagination && headerPagination.total > 10 ? (
          <Pagination
            className={styles.pagination}
            {...headerPagination}
            onChange={(page, pageSize) => onChangePagination(page, pageSize)}
            onShowSizeChange={(current, size) => onChangePagination(current, size)}
          />
        ) : (
          ''
        )}
        {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}
      </div>
    );
  }
}
