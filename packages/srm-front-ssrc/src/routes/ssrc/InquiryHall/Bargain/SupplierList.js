import React, { Component } from 'react';
import {
  Collapse,
  Row,
  Col,
  Popover,
  Tag,
  Button,
  Form,
  Input,
  Pagination,
  Spin,
  Icon,
  // Tooltip as H0Tooltip,
  // Badge,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import moment from 'moment';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { isNumber, sum } from 'lodash';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import { yesOrNoRender, dateTimeRender, dateRender } from 'utils/renderer';
import classnames from 'classnames';
import { Tooltip } from 'choerodon-ui/pro';
import { phoneRender, roundEliminate, numberSeparatorRender } from '@/utils/renderer';
import supplierIcon from '@/assets/supplierIcon.svg';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';

import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  TooltipTitle,
} from '@/utils/utils';
import LadderLevelModal from '../FeedbackBargain/LadderLevelModal';
import styles from './index.less';

const { Panel } = Collapse;
const eliminateIcon = require('@/assets/eliminate.svg');

export default class SupplierList extends Component {
  quotationName = getQuotationName(this.props.sourceKey === BID);

  @Bind()
  openFillCounter(event, supplierId, flag, data) {
    const { bargainFlag } = this.props;
    event.stopPropagation();

    const { supplierCompanyId, supplierId: currentLineSupplierId } = data || {};
    const bargainLocalSupplierFlag = !supplierCompanyId && !currentLineSupplierId && bargainFlag;

    if (!flag || bargainLocalSupplierFlag) {
      event.stopPropagation();
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.bargain.pleaseTickTheLine`)
          .d('请勾选要批量填写还价的行'),
      });
    } else {
      const { fillCounterSupplier } = this.props;
      fillCounterSupplier(event, supplierId);
    }
  }

  @Bind()
  changePage(page, supplierId, otherPayload = {}) {
    const { onSearch } = this.props;
    onSearch(page, supplierId, 1, otherPayload);
  }

  /**
   * 渲染折叠面板头信息
   */
  @Bind()
  renderCollapseHeader(data) {
    const {
      supplierSelectKeys,
      dataSource,
      collapseSupplierActiveKeys,
      viewScoreDetail = () => {},
      remote,
      bargainHeader,
    } = this.props;
    const proSupplierData =
      dataSource && dataSource.filter((item) => item.supplierCompanyId === data.supplierCompanyId);
    const flag =
      proSupplierData &&
      proSupplierData.some(
        (item) => supplierSelectKeys && supplierSelectKeys.indexOf(item.quotationLineId) !== -1
      );

    let bargainAmountDom = (
      <Tooltip
        placement="topLeft"
        title={
          <span>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainQu0tationAmn`).d('还价金额')}：
            {data.bargainTotalAmount}
          </span>
        }
      >
        <Tag
          style={{ backgroundColor: 'rgba(255,188,0,0.1)', color: 'rgb(255,188,0)' }}
          className={classnames(styles['bargin-tag'])}
        >
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainQu0tationAmn`).d('还价金额')}：
          {data.bargainTotalAmount}
        </Tag>
      </Tooltip>
    );

    let supplierTotalAmountText = `${intl
      .get(`ssrc.inquiryHall.model.inquiryHall.commonAlreadyQuotationAmn`, {
        quotationName: this.quotationName,
      })
      .d('{quotationName}金额')}
    ：${data.supplierTotalAmount}`;

    bargainAmountDom = remote
      ? remote.process('SSRC_BARGAIN_PROCESS_BARGAIN_AMOUNT_DOM', bargainAmountDom, {
          header: bargainHeader,
          that: this,
          data,
        })
      : bargainAmountDom;

    supplierTotalAmountText = remote
      ? remote.process(
          'SSRC_BARGAIN_PROCESS_BARGAIN_SUPPLIER_TOTAL_AMOUNT_TEXT',
          supplierTotalAmountText,
          {
            header: bargainHeader,
            that: this,
            data,
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commonAlreadyQuotationAmn`, {
                quotationName: this.quotationName,
              })
              .d('{quotationName}金额'),
          }
        )
      : supplierTotalAmountText;

    const supplierTotalAmountShowFlag = remote
      ? remote.process('SSRC_BARGAIN_PROCESS_SUPPLIER_TO_TOTAL_AMOUNT_SHOW_FLAG', true, {
          header: bargainHeader,
        })
      : true;
    return (
      <Row>
        <Col span={1}>
          {data.allEliminate ? (
            <img src={eliminateIcon} alt="icon" />
          ) : (
            <img src={supplierIcon} alt="icon" />
          )}
        </Col>
        <Col span={11}>
          <h3>
            <Popover content={data.supplierCompanyName}>{data.supplierCompanyName}</Popover>
            <Icon
              className={styles.arrowIcon}
              type={collapseSupplierActiveKeys.includes(data.rfxLineSupplierId) ? 'up' : 'down'}
            />
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
        <Col span={2} className="score">
          {data.score != null && (
            <div>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.getScore').d('得分')}：
              <a onClick={(e) => viewScoreDetail(e, data)}>{data.score}</a>
            </div>
          )}
        </Col>
        <Col span={7} style={{ marginTop: '14px' }}>
          <Tooltip placement="topLeft" title={data.feedbackStatusMeaning}>
            <Tag
              style={{ backgroundColor: 'rgba(6,135,255,0.1)', color: 'rgb(6,135,255)' }}
              className={classnames(styles['bargin-tag'])}
            >
              {data.feedbackStatusMeaning}
              {/* {intl.get(`ssrc.inquiryHall.model.inquiryHall.alreadyInvolved`).d('已参与')} */}
            </Tag>
          </Tooltip>
          {supplierTotalAmountShowFlag && (
            <Tooltip placement="topLeft" title={<span>{supplierTotalAmountText}</span>}>
              <Tag
                style={{ backgroundColor: 'rgba(243,49,103,0.1)', color: 'rgb(243,49,103)' }}
                className={classnames(styles['bargin-tag'])}
              >
                {supplierTotalAmountText}
              </Tag>
            </Tooltip>
          )}
          {bargainAmountDom}
        </Col>
        <Col span={3} style={{ marginTop: '14px' }}>
          <Button
            type="primary"
            onClick={(event) => this.openFillCounter(event, data.supplierCompanyId, flag, data)}
            // disabled={!flag}
          >
            {intl.get('ssrc.inquiryHall.view.message.button.fillCounteroffers').d('批量填写还价')}
          </Button>
        </Col>
      </Row>
    );
  }

  /**
   * 渲染供应商表格
   */
  @Bind()
  renderSupplierTable(supplierId, data, pagination, otherPayload = {}) {
    const { rfxLineSupplierId } = otherPayload || {};
    const {
      sourceKey = INQUIRY,
      loadingFlag,
      barSelectSupplierLine,
      organizationId,
      // pageSize,
      viewLadderLevel,
      customizeTable,
      doubleUnitFlag = false,
      newQuotationFlag = 0,
      bargainFlag = false,
      remote,
      bargainHeader,
    } = this.props;
    // 过滤出当前供应商对应的数据
    const proSupplierData =
      data && data.filter((item) => item.rfxLineSupplierId === rfxLineSupplierId);
    const proSupplierPagination = pagination[rfxLineSupplierId];
    const preColumns = [
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
        width: 250,
        render: (val, record) => roundEliminate(val, record),
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
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validQuotationPrice',
        width: 100,
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
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        align: 'right',
        width: 100,
        render: (val) => numberSeparatorRender(val),
      },
      doubleUnitFlag
        ? {
            title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
            dataIndex: 'validQuotationSecPrice',
            width: 100,
            align: 'right',
            render: (value) =>
              value ? (
                <Popover placement="topLeft" content={numberSeparatorRender(value)}>
                  {numberSeparatorRender(value)}
                </Popover>
              ) : (
                ''
              ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            align: 'right',
            width: 100,
            render: (val) => numberSeparatorRender(val),
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
        align: 'right',
        render: (val) => numberSeparatorRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
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
                <PrecisionInputNumber
                  type="hzero"
                  currency={record.quotationCurrencyCode}
                  disabled={
                    record.quotationLineStatus === 'BARGAINED' ||
                    record.quotationLineStatus === 'ABANDONED' ||
                    (bargainFlag && !record.supplierCompanyId)
                  }
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  omitZeroFlag
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        dataIndex: 'currentBargainRemark',
        width: 100,
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
            bidFlag={sourceKey === BID}
          />
        ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}说明'),
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
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        align: 'right',
        render: (value) => numberSeparatorRender(value),
      },
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        align: 'right',
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            align: 'right',
            render: (value) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
            align: 'right',
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
        align: 'center',
        render: (value) => (value ? dateRender(value) : ''),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 120,
        render: (value) => (value ? dateRender(value) : ''),
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
        width: '',
        align: 'right',
        render: (val) => numberSeparatorRender(val),
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
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
              icon="download"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);

    const columns = remote
      ? remote.process('SSRC_BARGAIN_PROCESS_SUPPLIER_ONLINE_COLUMN', preColumns, {
          supplierId,
          bargainFlag,
          rfxLineSupplierId,
          proSupplierPagination,
          bidFlag: sourceKey === 'BID',
          bargainHeader,
          changePage: this.changePage,
        })
      : preColumns;

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 510; // 固定10行
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_BARGAIN.SUPPLIER`, // 单元编码，必传
        namespace: supplierId,
      },
      <EditTable
        bordered
        columns={columns}
        scroll={{ x: scrollX, y: scrollY }}
        dataSource={proSupplierData}
        rowKey="quotationLineId"
        loading={loadingFlag[supplierId] && loadingFlag[supplierId].supplierLineBargainLoading}
        pagination={proSupplierPagination}
        rowSelection={barSelectSupplierLine}
        onChange={(page) => this.changePage(page, supplierId, { rfxLineSupplierId })}
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
            <Spin spinning={fetchSupplierLineBargainLoading}>
              <Collapse
                className={styles.collapseAll}
                activeKey={collapseSupplierActiveKeys}
                onChange={(key) =>
                  handleCollBack(data.supplierCompanyId, key, {
                    rfxLineSupplierId: data.rfxLineSupplierId,
                  })
                }
              >
                <Panel
                  header={this.renderCollapseHeader(data)}
                  showArrow={false}
                  key={String(data.rfxLineSupplierId)}
                >
                  {this.renderSupplierTable(data.supplierCompanyId, dataSource, pagination, {
                    rfxLineSupplierId: data.rfxLineSupplierId,
                  })}
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
