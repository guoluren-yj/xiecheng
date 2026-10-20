import React, { Component } from 'react';
import { Collapse, Row, Col, Popover, Tag, Pagination, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber, sum } from 'lodash';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
// import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';
import supplierIcon from '@/assets/supplierIcon.svg';
import downIcon from '@/assets/arrow-down-g.svg';
import { phoneRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import LadderLevelModal from '../../FeedbackBargain/LadderLevelModal';
import styles from '../index.less';

const { Panel } = Collapse;

export default class SupplierList extends Component {
  @Bind()
  changePage(page, supplierId) {
    const { onSearch } = this.props;
    onSearch(page, supplierId, 1);
  }

  /**
   * 渲染折叠面板头信息
   */
  @Bind()
  renderCollapseHeader(data) {
    // const { dataSource } = this.props;
    // const proSupplierData =
    //   dataSource && dataSource.filter((item) => item.supplierCompanyId === data.supplierCompanyId);
    // const flag =
    //   proSupplierData &&
    //   proSupplierData.some(
    //     (item) => supplierSelectKeys && supplierSelectKeys.indexOf(item.quotationLineId) !== -1
    //   );

    return (
      <Row>
        <Col span={1}>
          <img src={supplierIcon} alt="icon" />
        </Col>
        <Col span={11}>
          <h3>
            <Popover content={data.supplierCompanyName}>{data.supplierCompanyName}</Popover>
            <img style={{ paddingLeft: '6px' }} src={downIcon} alt="icon" />
          </h3>
          <div>
            <span>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人')}：
              {data.contactName}
            </span>
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话')}：
              {phoneRender(data.internationalTelCodeMeaning, data.contactMobilephone)}
            </span>
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件')}：
              {data.contactMail}
            </span>
          </div>
        </Col>
        <Col span={9} style={{ marginTop: '14px' }}>
          <Tag style={{ backgroundColor: 'rgba(6,135,255,0.1)', color: 'rgb(6,135,255)' }}>
            {data.feedbackStatusMeaning}
            {/* {intl.get(`ssrc.inquiryHall.model.inquiryHall.alreadyInvolved`).d('已参与')} */}
          </Tag>
          <Tag style={{ backgroundColor: 'rgba(243,49,103,0.1)', color: 'rgb(243,49,103)' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.alreadyQuotationAmn`).d('报价金额')}：
            {data.supplierTotalAmount}
          </Tag>
          <Tag style={{ backgroundColor: 'rgba(255,188,0,0.1)', color: 'rgb(255,188,0)' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainQu0tationAmn`).d('还价金额')}：
            {data.bargainTotalAmount}
          </Tag>
        </Col>
        <Col span={3} style={{ marginTop: '14px' }}>
          {/* <Button
            type="primary"
            onClick={(event) => this.openFillCounter(event, data.supplierCompanyId, flag)}
            // disabled={!flag}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.counteroffersInBulk`).d('批量填写还价')}
          </Button> */}
        </Col>
      </Row>
    );
  }

  /**
   * 渲染供应商表格
   */
  @Bind()
  renderSupplierTable(supplierId, data, pagination) {
    const {
      loadingFlag,
      // barSelectSupplierLine,
      organizationId,
      pageSize,
      viewLadderLevel,
      customizeTable,
    } = this.props;
    // 过滤出当前供应商对应的数据
    const proSupplierData = data && data.filter((item) => item.supplierCompanyId === supplierId);
    const proSupplierPagination = pagination[supplierId];
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineStatus`).d('行状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        align: 'right',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        dataIndex: 'preQuotationPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价'),
        dataIndex: 'currentBargainPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        dataIndex: 'currentBargainRemark',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价'),
        dataIndex: 'validBargainPrice',
        width: 120,
        align: 'right',
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
        render: (_, record) => (
          <QuotationDetail rowData={record} sourceFrom="RFX" allowBuyerViewFlag />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDescription`).d('报价说明'),
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 120,
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.priceBatchReference`)
          .d('批量单价（参考）'),
        dataIndex: 'priceBatchQuantity',
        width: 130,
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
        width: 80,
        align: 'right',
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
        width: 110,
        render: (val) =>
          val ? (
            <Upload
              filePreview
              viewOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
              icon="download"
            />
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      {
        code: 'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER',
      },
      <EditTable
        bordered
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={proSupplierData}
        rowKey="quotationLineId"
        loading={loadingFlag[supplierId] && loadingFlag[supplierId].supplierLineBargainLoading}
        pagination={
          (pageSize && pageSize[supplierId] && pageSize[supplierId]) > 10
            ? proSupplierPagination
            : false
        }
        // rowSelection={barSelectSupplierLine}
        onChange={(page) => this.changePage(page, supplierId)}
      />
    );
  }

  render() {
    const {
      headerInfo,
      headerPagination,
      handleCollBack,
      dataSource,
      pagination,
      onChangePagination,
      collapseSupplierActiveKeys,
      fetchSupplierLineBargainLoading,
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
            <Spin spinning={fetchSupplierLineBargainLoading}>
              <Collapse
                className={styles.collapseAll}
                activeKey={collapseSupplierActiveKeys}
                onChange={(key) => handleCollBack(data.supplierCompanyId, key)}
              >
                <Panel
                  header={this.renderCollapseHeader(data)}
                  showArrow={false}
                  key={String(data.rfxLineSupplierId)}
                >
                  {this.renderSupplierTable(data.supplierCompanyId, dataSource, pagination)}
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
