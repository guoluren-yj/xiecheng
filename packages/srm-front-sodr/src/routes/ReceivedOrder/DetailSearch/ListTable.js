/*
 * ListTable - 我收到的调查表数据列表信息
 * @date: 2018/10/09 14:56:50
 * @author: LZH <zhaohui-liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Tooltip } from 'hzero-ui';
import { isNumber, isNaN } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { math } from 'choerodon-ui/dataset';
import styles from './index.less';

import { formatAumont, formatNumber, getDynamicLabel } from '@/routes/components/utils';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import yanqiImg from '@/assets/yanqi.svg';

// function countDecimals(val) {
//   const strArray = `${val}`.split('.') || [];
//   return !isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? isEmpty((strArray[1] || '').match(/[^0]/g))
//       ? 2
//       : `${val}`.split('.')[1].length || 0
//     : 0;
// }

/**
 * 我收到的调查表数据列表信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ListTable extends PureComponent {
  @Bind()
  Time(day) {
    const toDay = new Date();
    return moment(toDay).diff(moment(day), 'days');
  }

  /**
   * 跳转详情
   * @param {number} { poHeaderId }
   */
  @Bind()
  handleToDetail({ poHeaderId }) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(poHeaderId);
    }
  }

  render() {
    const {
      loading,
      dataSource = [],
      searchPaging,
      pagination = {},
      rowSelection,
      customizeTable,
      doubleUnitEnabled,
      amountFinancialPrecision,
      openBOMModal,
    } = this.props;

    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'displayStatusMeaning',
        // sorter: true,
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        sorter: true,
        fixed: 'left',
        width: 180,
        render: (value, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => this.handleToDetail(record)}>{value}</a>
            {record.deliverySyncStatus === 'FAIL' ? (
              <Tooltip
                title={intl
                  .get(`sodr.common.view.message.detailFeedbackMsg`)
                  .d('承诺交期回传失败，请重新同步')}
              >
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`sodr.common.model.common.urgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.beyondQuantity > 0 ? (
              <Tooltip
                title={intl
                  .get(`sodr.common.model.commo.orderDelayDays`, {
                    num: this.Time(record.promiseDeliveryDate),
                  })
                  .d(`订单超期${this.Time(record.promiseDeliveryDate)}天`)}
              >
                <img src={yanqiImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.latestVersion`).d('版本'),
        dataIndex: 'versionNum',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.common.model.common.displayLineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        width: 100,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`sodr.common.model.common.itemCustomerCode`).d('客户物料编码'),
        dataIndex: 'itemCode',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.itemCustomerName`).d('客户物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      doubleUnitEnabled && {
        title: intl.get(`sodr.common.model.common.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 100,
        render: (value) => formatAumont(value),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 100,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`sodr.common.model.common.netReceivedQuantity`).d('净接收'),
        dataIndex: 'netReceivedQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`sodr.common.model.common.deliverQuantity`).d('净入库'),
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
        title: intl.get(`sodr.common.model.common.billMatchedQuantity`).d('已对账'),
        dataIndex: 'billMatchedQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`sodr.common.model.common.billedQuantity`).d('已开票'),
        dataIndex: 'invoicedQuantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
        dataIndex: 'unitPrice',
        width: 140,
        align: 'right',
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
        title: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
        dataIndex: 'enteredTaxIncludedPrice',
        width: 140,
        align: 'right',
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
        title: intl.get(`sodr.common.model.common.lineAmount`).d('不含税行金额'),
        dataIndex: 'lineAmount',
        width: 140,
        align: 'right',
        render: (val, record) => {
          return amountFinancialPrecision(record, val);
        },
      },
      {
        title: intl.get(`sodr.common.model.common.taxIncludedLineAmount`).d('含税行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 140,
        align: 'right',
        render: (val, record) => {
          return amountFinancialPrecision(record, val);
        },
      },
      {
        title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 40,
        render: (value) => formatAumont(value),
      },
      doubleUnitEnabled && {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
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
        title: intl.get(`sodr.common.model.common.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        sorter: true,
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.promisedDate`).d('承诺日期'),
        dataIndex: 'promiseDeliveryDate',
        sorter: true,
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.delayFlagMeaning`).d('交期满足需求'),
        dataIndex: 'delayFlagMeaning',
        sorter: true,
        width: 100,
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
        title: intl.get(`sodr.common.model.common.specifications`).d('规格'),
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
        title: intl.get(`sodr.common.model.common.model`).d('型号'),
        dataIndex: 'model',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.manufacturerName`).d('制造商'),
        dataIndex: 'manufacturerName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.commonName`).d('通用名'),
        dataIndex: 'commonName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.erpStatus`).d('ERP状态'),
        dataIndex: 'erpStatusMeaning',
        width: 90,
      },
      {
        title: intl.get(`sodr.common.model.common.closedFlag`).d('是否关闭'),
        dataIndex: 'closedFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.common.model.common.cancelledFlag`).d('是否取消'),
        dataIndex: 'cancelledFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.common.model.common.consignedFlag`).d('是否寄售'),
        dataIndex: 'consignedFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      // {
      //   title: intl.get(`sodr.common.model.common.projectCategory`).d('是否委外'),
      //   dataIndex: 'projectCategory',
      //   width: 90,
      //   render: val => {
      //     return val === '1'
      //       ? intl.get(`hzero.common.status.yes`).d('是')
      //       : intl.get(`hzero.common.status.no`).d('否');
      //   },
      // },
      {
        title: intl.get(`sodr.common.model.common.returnedFlag`).d('是否退回'),
        dataIndex: 'returnedFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.common.model.common.freeFlag`).d('是否免费'),
        dataIndex: 'freeFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.common.model.common.immedShippedFlag`).d('是否直发'),
        dataIndex: 'isImmedShippedFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.common.model.common.purchaserRemark`).d('采购方行备注'),
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
        title: intl.get(`sodr.common.model.common.feedback`).d('反馈信息'),
        dataIndex: 'feedback',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.shipToThirdPartyName`).d('送达方'),
        dataIndex: 'shipToThirdPartyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
        dataIndex: 'shipToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.shipToThirdPartyContact`).d('联系人信息'),
        dataIndex: 'shipToContactInfo',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierSites`).d('供应商地点'),
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
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.purOrganizationId`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        sorter: true,
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      // {
      //   title: intl.get(`sodr.common.model.common.shipToLocationAddress`).d('收货方地址'),
      //   dataIndex: 'shipToLocationAddress',
      //   width: 150,
      // },
      {
        title: intl.get(`sodr.common.model.common.inventoryName`).d('收货库房'),
        dataIndex: 'inventoryName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.locationName`).d('收货库位'),
        dataIndex: 'locationName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.billToLocationAddress`).d('收单方地址'),
        dataIndex: 'billToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.erpContractNum`).d('合同编号'),
        dataIndex: 'erpContractNum',
        width: 160,
      },
      {
        title: intl.get(`sodr.common.model.common.priceUnit`).d('价格单位'),
        dataIndex: 'priceUomName',
        width: 90,
        render: (_, { priceUomCodeName }) => priceUomCodeName,
      },
      {
        title: intl.get(`hzero.common.date.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'erpCreatedName',
        width: 150,
      },
      {
        title: intl.get('sodr.common.model.common.department').d('部门'),
        dataIndex: 'departmentName',
        width: 130,
      },
      {
        title: intl.get(`sodr.common.model.common.releaseTime`).d('发布时间'),
        dataIndex: 'releasedDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.common.model.common.confirmedDate`).d('确认日期'),
        dataIndex: 'confirmedDate',
        sorter: true,
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.urgentOrder`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 90,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sodr.common.model.common.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.common.model.common.purReqNum`).d('采购申请号'),
        dataIndex: 'displayPrNum',
        sorter: true,
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.displayPrLineNum`).d('采购申请行号'),
        dataIndex: 'displayPrLineNum',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.sourceCode`).d('来源系统'),
        dataIndex: 'poSourcePlatformMeaning',
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
    ].filter((i) => i);
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SODR.RECEIVED_ORDER_LIST.GRID_BY_DETAIL',
          },
          <Table
            loading={loading}
            rowSelection={rowSelection}
            rowKey="poLineLocationId"
            bordered
            scroll={{
              x: columns.map((item) => item.width).reduce((sum, val) => sum + val),
              y: 'calc(100vh - 350px)',
            }}
            columns={columns}
            dataSource={dataSource}
            pagination={{ ...pagination, showQuickJumper: true }}
            onChange={(page, _, sorter) => searchPaging(page, {}, false, '', sorter, true)}
          />
        )}
      </Fragment>
    );
  }
}
