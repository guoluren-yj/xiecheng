import React, { Component } from 'react';
import {
  Collapse,
  Popover,
  Row,
  Col,
  Tag,
  Button,
  Pagination,
  Form,
  InputNumber,
  Input,
  Spin,
  Icon,
  // Badge,
} from 'hzero-ui';
import { Attachment } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
// import moment from 'moment';
import { isNumber, sum, isNil } from 'lodash';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import goodsIcon from '@/assets/goodsIcon.svg';
// import fileIcon from '@/assets/file.svg';
import { roundEliminate, numberSeparatorRender } from '@/utils/renderer';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
// import SvgIcon from '@/routes/components/SvgIcon';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  TooltipTitle,
} from '@/utils/utils';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import LadderLevelModal from '../FeedbackBargain/LadderLevelModal';
import styles from './index.less';

const { Panel } = Collapse;
const eliminateIcon = require('@/assets/eliminate.svg');

export default class ItemDetails extends Component {
  @Bind()
  openItemCounter(event, lineId, flag) {
    event.stopPropagation();

    if (!lineId) {
      return;
    }

    if (!flag) {
      event.stopPropagation();
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.bargain.pleaseTickTheLine`)
          .d('请勾选要批量填写还价的行'),
      });
    } else {
      const { fillCounterItem } = this.props;
      fillCounterItem(event, lineId);
    }
  }

  @Bind()
  changePage(page, itemId) {
    const { onSearch } = this.props;
    onSearch(page, itemId, 2);
  }

  quotationName = getQuotationName(this.props.sourceKey === BID);

  /**
   * 渲染折叠框头
   */
  @Bind()
  renderCollapseHeader(data) {
    const { itemSelectKeys, dataSource, collapseItemActiveKeys } = this.props;
    const proSupplierData =
      dataSource && dataSource.filter((item) => item.rfxLineItemId === data.rfxLineItemId);
    const flag =
      proSupplierData &&
      proSupplierData.some(
        (item) => itemSelectKeys && itemSelectKeys.indexOf(item.quotationLineId) !== -1
      );
    return (
      <Row>
        <Col span={1}>
          {data.allEliminate ? (
            <img src={eliminateIcon} alt="icon" />
          ) : (
            <img src={goodsIcon} alt="icon" />
          )}
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
            <Icon
              className={styles.arrowIcon}
              type={collapseItemActiveKeys.includes(data.rfxLineItemId) ? 'up' : 'down'}
            />
          </h3>
          <div onClick={(e) => e.stopPropagation()}>
            <Attachment
              viewMode="popup"
              funcType="link"
              value={data.attachmentUuid}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-rfxitem"
              readOnly
            >
              {intl.get('hzero.common.upload.modal.title').d('附件')}
            </Attachment>
          </div>
        </Col>
        <Col span={15}>
          <Tag style={{ backgroundColor: 'rgba(6,135,255,0.1)', color: 'rgb(6,135,255)' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
            {data.rfxLineItemNum}
          </Tag>
          <Tag style={{ backgroundColor: 'rgba(243,49,103,0.1)', color: 'rgb(243,49,103)' }}>
            {data.secondaryQuantity}（{data.secondaryUomName}）
          </Tag>
          <Tag style={{ backgroundColor: 'rgba(255,188,0,0.1)', color: 'rgb(255,188,0)' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：{data.taxRate}
          </Tag>
        </Col>
        <Col span={3}>
          <Button
            type="primary"
            // disabled={!flag}
            onClick={(event) => this.openItemCounter(event, data.rfxLineItemId, flag)}
          >
            {intl.get('ssrc.inquiryHall.view.message.button.fillCounteroffers').d('批量填写还价')}
          </Button>
        </Col>
      </Row>
    );
  }

  // 永祥二开
  @Bind()
  renderRowSelect(barSelectItemLine) {
    return barSelectItemLine;
  }

  @Bind()
  renderRedMinPrice({ value, record, name, isNeedSeparator = true }) {
    const { remote } = this.props;
    const formatValue = isNeedSeparator ? numberSeparatorRender(value) : value;
    if (isNil(value)) return value;
    const { redField = '' } = record;
    const colorRemote = remote
      ? remote?.process('SSRC_BARGAIN_PROCESS_BARGAIN_ITEM_TABLE_COLOR', 'red')
      : 'red';
    return redField === name ? (
      <span style={{ color: colorRemote }}>{formatValue}</span>
    ) : (
      formatValue
    );
  }

  /**
   * 渲染表格
   */
  @Bind()
  renderItemTable(itemId, data, pagination) {
    const {
      loadingFlag,
      sourceKey = INQUIRY,
      barSelectItemLine,
      organizationId,
      viewLadderLevel,
      customizeTable,
      doubleUnitFlag = false,
      newQuotationFlag = false,
      bargainFlag = false,
      remote,
      bargainHeader,
    } = this.props;
    // 过滤出当前供应商对应的数据
    const proItemData = data && data.filter((item) => item.rfxLineItemId === itemId);
    const proItemPagination = pagination[itemId];
    const preColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 380,
        render: (val, record) => roundEliminate(val, record, { invalidSupplierLogoFlag: 1 }),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 120,
      },
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
        render: (val, record) =>
          record.redField === 'validQuotationPrice' ? (
            <Popover placement="topLeft" content={val}>
              <span
                style={{
                  color: remote
                    ? remote?.process('SSRC_BARGAIN_PROCESS_BARGAIN_ITEM_TABLE_COLOR', 'red')
                    : 'red',
                }}
              >
                {val}
              </span>
            </Popover>
          ) : (
            <Popover placement="topLeft" content={val}>
              {val}
            </Popover>
          ),
      },
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        align: 'right',
        width: 100,
        render: (value, record) =>
          this.renderRedMinPrice({ value, record, name: 'validNetPrice', isNeedSeparator: false }),
      },
      doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
            dataIndex: 'validQuotationSecPrice',
            width: 100,
            align: 'right',
            render: (val) => (
              <Popover placement="topLeft" content={val}>
                {val}
              </Popover>
            ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            align: 'right',
            width: 100,
          }
        : null,
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
        render: (val) => numberSeparatorRender(val),
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
        textForTitle: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`)
          .d('还价单价'),
        dataIndex: 'currentBargainPrice',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentBargainPrice', {
                initialValue: val,
              })(
                <InputNumber
                  disabled={
                    record.quotationLineStatus === 'BARGAINED' ||
                    record.quotationLineStatus === 'ABANDONED' ||
                    record.supplierStatus === 'QUOTATION_INVALID' ||
                    record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
                    (bargainFlag && !record.supplierCompanyId)
                  }
                  max={9999999999999999}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentOfferReason`).d('当前还价理由'),
        dataIndex: 'currentBargainRemark',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentBargainRemark', {
                initialValue: val,
              })(
                <Input
                  style={{ width: '100%' }}
                  disabled={
                    record.quotationLineStatus === 'BARGAINED' ||
                    record.quotationLineStatus === 'ABANDONED' ||
                    record.supplierStatus === 'QUOTATION_INVALID' ||
                    record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
                    (bargainFlag && !record.supplierCompanyId)
                  }
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
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
            <>
              <a onClick={() => viewLadderLevel(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
              {/* {record.ladderInquiryRequire === 1 && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )} */}
            </>
          ) : null,
      },
      // 此列二开，禁止修改字段名
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (_, record) => (
          <QuotationDetail
            rowData={record}
            sourceFrom="RFX"
            allowBuyerViewFlag
            bidFlag={sourceKey === 'BID'}
          />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 100,
        render: (val, record) =>
          record.hiddenQuotationFlag === 1
            ? '***'
            : bargainHeader.benchmarkPriceType === 'TAX_INCLUDED_PRICE'
            ? numberSeparatorRender(val)
            : numberSeparatorRender(record.netAmount),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}说明'),
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
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: (value) => numberSeparatorRender(value),
      },
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 100,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: (value) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`)
              .d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 120,
        render: (value) => (value ? dateRender(value) : ''),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 120,
        render: (value) => (value ? dateRender(value) : ''),
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
        width: '',
      },
      {
        width: 120,
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationTime`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}时间'),
        dataIndex: 'quotedDate',
        width: 150,
        render: (val) => dateTimeRender(val),
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
        width: 180,
        render: (val, record) => {
          return !newQuotationFlag ? (
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
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);

    const columns = remote
      ? remote.process('SSRC_BARGAIN_PROCESS_ITEM_ONLINE_COLUMN', preColumns, {
          itemId,
          bargainFlag,
          proItemPagination,
          bidFlag: sourceKey === 'BID',
          bargainHeader,
          changePage: this.changePage,
        })
      : preColumns;

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 510; // 固定10行
    return customizeTable(
      {
        code: `SSRC.${this.props.sourceKey}_HALL_BARGAIN.ITEMDETAILS`, // 单元编码，必传
        namespace: itemId,
      },
      <EditTable
        bordered
        columns={columns}
        scroll={{ x: scrollX, y: scrollY }}
        dataSource={proItemData}
        pagination={proItemPagination}
        loading={loadingFlag[itemId] && loadingFlag[itemId].itemLineBargainLoading}
        rowKey="quotationLineId"
        rowSelection={this.renderRowSelect(barSelectItemLine)}
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
      doubleUnitFlag,
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
