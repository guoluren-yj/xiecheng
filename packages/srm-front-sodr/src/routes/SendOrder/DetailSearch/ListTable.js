/*
 * ListTable - 按明细查询列表
 * @date: 2018/10/09 14:56:50
 * @author: LZH <zhaohui-liu@hand-china.com>, FQL <qilin.feng@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Tooltip } from 'hzero-ui';
import { isNumber, isNaN, sum } from 'lodash';
import intl from 'utils/intl';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { math } from 'choerodon-ui/dataset';
import DocFlow from '_components/DocFlow';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';

import {
  formatAumont,
  redirectToOther,
  formatNumber,
  getDynamicLabel,
} from '@/routes/components/utils';
import urgentImg from '@/assets/icon-expedited.svg';
import yanqiImg from '@/assets/yanqi.svg';
import abnormal from '@/assets/abnormal.svg';
import styles from '../index.less';

// function countDecimals(val) {
//   const strArray = `${val}`.split('.') || [];
//   return !isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? isEmpty((strArray[1] || '').match(/[^0]/g))
//       ? 2
//       : `${val}`.split('.')[1].length || 0
//     : 0;
// }

/**
 * 按明细查询列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleDetailSelectedRows 设置勾选项到model里
 * @return React.element
 */
const modelPrompt = 'sodr.sendOrder.model.common';
@connect(({ sendOrder }) => ({
  sendOrder,
}))
@Form.create({ fieldNameProp: null })
export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // tenantId: getCurrentOrganizationId(),
      customVisable: false,
      customData: [],
      specsJsonType: 'custom',
    };
  }

  @Bind()
  Time(day) {
    const toDay = new Date();
    return moment(toDay).diff(moment(day), 'days');
  }

  /**
   * 跳转到详情页
   * @param {Number} { poHeaderId }
   */
  @Bind()
  handleToDetail({ poHeaderId, poSourcePlatform }) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(poHeaderId, poSourcePlatform);
    }
  }

  render() {
    const {
      loading,
      dataSource,
      searchPaging,
      pagination,
      rowSelection,
      customizeTable,
      amountFinancialPrecision,
      openBOMModal,
      doubleUnitEnabled,
      sendOrder: { detailSort },
    } = this.props;
    const { customVisable, customData, specsJsonType } = this.state;

    const CustomSpecProps = {
      specsJsonType,
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };
    const dataColumns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'displayStatusMeaning',
        fixed: 'left',
        // sorter: true,
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        fixed: 'left',
        sorter: true,
        width: 180,
        sortOrder:
          detailSort?.columnKey === 'displayPoNum' && detailSort?.order === 'asc'
            ? 'ascend'
            : detailSort?.columnKey === 'displayPoNum' && detailSort?.order === 'desc'
            ? 'descend'
            : false,
        render: (value, record) => (
          <div className={styles['row-agent-column']}>
            <span>
              {/* {record.deliveryDateRejectFlag === 1
                ? intl.get(`${modelPrompt}.deliveryDateReject`).d('交期审核退回')
                : value} */}
              <a onClick={() => this.handleToDetail(record)}>{value}</a>
            </span>
            {record.deliverySyncStatus === 'FAIL' ? (
              <Tooltip
                title={
                  intl
                    .get(`sodr.common.view.message.erpDetailFeedbackMsg`)
                    .d('ERP订单承诺交货日期同步失败：失败原因') +
                  (record.deliverySyncResponseMsg || '')
                }
              >
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${modelPrompt}.orderUrgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.beyondQuantity > 0 ? (
              <Tooltip
                title={intl
                  .get(`${modelPrompt}.orderDelayDays`, {
                    num: this.Time(record.promiseDeliveryDate),
                  })
                  .d(`订单超期${this.Time(record.promiseDeliveryDate)}天，请及时安排送货！`)}
              >
                <img src={yanqiImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        fixed: 'left',
        sorter: true,
        width: 120,
        render: (value, record) => record.supplierCode || record.supplierCompanyCode,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        fixed: 'left',
        sorter: true,
        width: 120,
        render: (value, record) => record.supplierName || record.supplierCompanyName,
      },
      {
        title: intl.get(`${modelPrompt}.version`).d('版本'),
        dataIndex: 'versionNum',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
      },
      {
        title: intl.get(`${modelPrompt}.lineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        width: 100,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        sorter: true,
        width: 90,
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemCategory`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 150,
      },
      doubleUnitEnabled && {
        title: intl.get(`${modelPrompt}.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`${modelPrompt}.netReceivedQuantity`).d('净接收'),
        dataIndex: 'netReceivedQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`${modelPrompt}.netDeliverQuantity`).d('净入库'),
        dataIndex: 'netDeliverQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get('sodr.common.model.common.notInStorage').d('未入库'),
        dataIndex: 'notDeliverQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get('sodr.common.model.common.shippedQuantity').d('已发货'),
        dataIndex: 'shippedQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`${modelPrompt}.billMatchedQuantity`).d('已对账'),
        dataIndex: 'billMatchedQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`${modelPrompt}.invoicedQuantity`).d('已开票'),
        dataIndex: 'invoicedQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`${modelPrompt}.afterTaxunitPrice`).d('不含税单价'),
        dataIndex: 'unitPrice',
        align: 'right',
        width: 120,
        render: (val, record) => {
          // const count = countDecimals(val);
          return record.priceSensitiveFlag
            ? '****'
            : (isNumber(val) || math.isBigNumber(val)) && !isNaN(val)
            ? formatNumber(val)
            : '';
        },
      },
      {
        title: intl.get(`${modelPrompt}.enteredTaxIncludedPrice`).d('原币含税单价'),
        dataIndex: 'enteredTaxIncludedPrice',
        align: 'right',
        width: 120,
        render: (val, record) => {
          // const count = countDecimals(val);
          return record.priceSensitiveFlag
            ? '****'
            : (isNumber(val) || math.isBigNumber(val)) && !isNaN(val)
            ? formatNumber(val)
            : '';
        },
        // render: (text, record) => (record.priceSensitiveFlag ? '****' : numberFormat(text)),
        // render: (val, record) => {
        //   if (val) {
        //     const value = `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        //     return record.priceSensitiveFlag ? '****' : value;
        //   }
        //   return record.priceSensitiveFlag ? '****' : '';
        // },
      },
      {
        title: intl.get(`${modelPrompt}.afterTaxlineAmount`).d('不含税行金额'),
        dataIndex: 'lineAmount',
        align: 'right',
        width: 120,
        render: (val, record) => {
          return amountFinancialPrecision(record, val);
        },
      },
      {
        title: intl.get(`${modelPrompt}.taxIncludedLineAmount`).d('含税行金额'),
        dataIndex: 'taxIncludedLineAmount',
        align: 'right',
        width: 100,
        render: (val, record) => {
          return amountFinancialPrecision(record, val);
        },
        // render: (text, record) => (record.priceSensitiveFlag ? '****' : numberFormat(text)),
        // render: (val, record) => {
        //   if (val) {
        //     const value = `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        //     return record.priceSensitiveFlag ? '****' : value;
        //   }
        //   return record.priceSensitiveFlag ? '****' : '';
        // },
      },
      {
        title: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 60,
        render: (value) => formatAumont(value),
      },
      doubleUnitEnabled && {
        title: intl.get(`${modelPrompt}.uomName`).d('单位'),
        dataIndex: 'secondaryUomName',
        width: 60,
        render: (_, { secondaryUomCodeAndName }) => secondaryUomCodeAndName,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'uom'),
        dataIndex: 'uomName',
        width: 60,
        render: (_, { uomCodeAndName }) => uomCodeAndName,
      },
      {
        title: intl.get(`${modelPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        sorter: true,
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${modelPrompt}.promisedDate`).d('承诺日期'),
        dataIndex: 'promiseDeliveryDate',
        sorter: true,
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${modelPrompt}.delayFlagMeaning`).d('交期满足需求'),
        dataIndex: 'delayFlagMeaning',
        sorter: true,
        width: 100,
        // render: dateRender,
      },
      {
        title: intl.get(`sodr.sendOrder.view.title.titleBom`).d('外协BOM'),
        width: 100,
        dataIndex: 'bom',
        render: (text, record) => (
          <a onClick={() => openBOMModal(record)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 80,
        render: (val) => (
          <Tooltip title={val}>
            <span
              style={{
                width: '100%',
                display: 'inline-block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {val}
            </span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.modelNum`).d('型号'),
        dataIndex: 'model',
        width: 80,
      },
      {
        title: intl.get(`${modelPrompt}.manufacturerName`).d('制造商'),
        dataIndex: 'manufacturerName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.erpStatus`).d('ERP状态'),
        dataIndex: 'erpStatusMeaning',
        width: 90,
      },
      {
        title: intl.get(`${modelPrompt}.frozenStatus`).d('是否冻结'),
        dataIndex: 'frozenFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.closedFlag`).d('是否关闭'),
        dataIndex: 'closedFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.cancelledFlag`).d('是否取消'),
        dataIndex: 'cancelledFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.consignedFlag`).d('是否寄售'),
        dataIndex: 'consignedFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      // {
      //   title: intl.get(`${modelPrompt}.projectCategory`).d('是否委外'),
      //   dataIndex: 'projectCategory',
      //   width: 90,

      //   render: val => {
      //     return val === '1'
      //       ? intl.get(`hzero.common.status.yes`).d('是')
      //       : intl.get(`hzero.common.status.no`).d('否');
      //   },
      // },
      {
        title: intl.get(`${modelPrompt}.returnedFlag`).d('是否退回'),
        dataIndex: 'returnedFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.freeFlag`).d('是否免费'),
        dataIndex: 'freeMeaning',
        width: 90,
      },
      {
        title: intl.get(`${modelPrompt}.immedShippedFlag`).d('是否直发'),
        dataIndex: 'isImmedShippedFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val) => (
          <Tooltip title={val}>
            <span
              style={{
                width: '100%',
                display: 'inline-block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {val}
            </span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.feedbackInfo`).d('反馈信息'),
        dataIndex: 'feedback',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
        dataIndex: 'shipToThirdPartyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.shipToLocationAddress`).d('收货方地址'),
        dataIndex: 'shipToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.receiverTelNum`).d('收货联系电话'),
        dataIndex: 'shipToLocTelNum',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.supplierSites`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaseOrgId`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseAgent`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        sorter: true,
        width: 100,
      },
      {
        title: intl.get(`entity.organization.class.receiving`).d('收货组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.inventoryName`).d('收货库房'),
        dataIndex: 'inventoryName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.locationName`).d('收货库位'),
        dataIndex: 'locationName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.billToLocationName`).d('收单方'),
        dataIndex: 'billToLocationName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.priceUomName`).d('价格单位'),
        dataIndex: 'priceUomName',
        width: 90,
        render: (_, { priceUomCodeName }) => priceUomCodeName,
      },
      {
        title: intl.get(`${modelPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
        dataIndex: 'erpCreatedName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.department`).d('部门'),
        dataIndex: 'departmentName',
        width: 130,
      },
      {
        title: intl.get(`${modelPrompt}.releaseTime`).d('发布时间'),
        dataIndex: 'releasedDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.confirmedDate`).d('确认日期'),
        dataIndex: 'confirmedDate',
        sorter: true,
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${modelPrompt}.urgentOrNot`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`${modelPrompt}.costName`).d('成本中心'),
        dataIndex: 'costName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.urgentTime`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.contractNum`).d('合同编号'),
        dataIndex: 'erpContractNum',
        width: 160,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseReqNum`).d('采购申请号'),
        dataIndex: 'displayPrNum',
        sorter: true,
        width: 100,
        render: (val, record) => <a onClick={() => redirectToOther('purchase', record)}>{val}</a>,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseReqLineNum`).d('采购申请行号'),
        dataIndex: 'displayPrLineNum',
        width: 120,
        render: (val, record) => <a onClick={() => redirectToOther('purchase', record)}>{val}</a>,
      },
      {
        title: intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性'),
        width: 150,
        dataIndex: 'customSpecsJson',
        render: (val) => (
          <a
            onClick={() => {
              this.setState({
                customData: val ? JSON.parse(val) : [],
                customVisable: true,
                specsJsonType: 'custom',
              });
            }}
          >
            {intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性')}
          </a>
        ),
      },
      {
        title: intl.get(`${modelPrompt}.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.commodityDirectory`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.sourceSystem`).d('来源系统'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.electricSignFlag`).d('电签标志'),
        dataIndex: 'electricSignFlag',
        width: 100,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sodr.common.model.common.electricSignStatus`).d('电签状态'),
        dataIndex: 'electricSignStatus',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.strategyName`).d('发货策略'),
        dataIndex: 'deliveryStrategyIdMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.receivingStrategy`).d('收货策略'),
        dataIndex: 'strategyHeaderIdMeaning',
        width: 100,
      },
      {
        width: 100,
        dataIndex: 'docFlow',
        title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
        render: (_, record) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
        ),
      },
    ].filter((i) => i);

    const scrollX = sum(dataColumns.map((n) => (isNumber(n.width) ? n.width : 0))) + 800;
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SODR.SEND_ORDER_LIST.FRID_BY_DETAIL',
          },
          <Table
            loading={loading}
            rowKey="poLineLocationId"
            bordered
            scroll={{ x: scrollX, y: 'calc(100vh - 400px)' }}
            columns={dataColumns}
            rowSelection={rowSelection}
            dataSource={dataSource}
            pagination={{ ...pagination, showQuickJumper: true }}
            onChange={(page, _, sorter) => searchPaging(page, {}, false, '', sorter, true)}
          />
        )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
      </Fragment>
    );
  }
}
