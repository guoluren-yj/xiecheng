/*
 * ErpList - ERP采购审批列表
 * @date: 2019-01-23
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { sum, isNumber, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
// import { createPagination } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { thousandBitSeparator, numberPrecision } from '@/routes/utils.js';

import UploadModal from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import abnormal from '@/assets/abnormal.svg';

const commonPrompt = 'sprm.common.model.common';

/**
 * LogisticInfoList - 送货单审批明细物流信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ErpList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  defaultTableRowKey = 'prLineId';

  @Bind()
  hideModal(record) {
    const { hideModal } = this.props;
    hideModal(record);
  }

  /**
   * handleAttachmentView - 查看附件
   * attachmentUuid - 附件的uuid
   * @memberof ErpList
   */
  @Bind()
  handleAttachmentView(attachmentUuid) {
    const { handleAttachmentModal } = this.props;
    if (handleAttachmentModal) {
      handleAttachmentModal(attachmentUuid);
    }
  }

  // @Bind()
  // onCell(record = {}) {
  //   if (record.incorrectFlag === 1) {
  //     return {
  //       className: styles['erp-list-bgc'],
  //     };
  //   }
  // }

  /**
   * 气泡
   *
   */
  @Bind()
  popover(record) {
    const content = (
      <div>
        <p>{record.incorrectDate}</p>
        <p>{record.incorrectMsg}</p>
      </div>
    );
    if (record.incorrectFlag === 1) {
      return (
        <Fragment>
          <Tooltip title={content}>
            <span>{record.displayLineNum}</span>
            <img style={{ width: 13, height: 13 }} src={abnormal} alt="img" />
          </Tooltip>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <span>{record.displayLineNum}</span>
        </Fragment>
      );
    }
  }

  // 渲染改变后的字段
  @Bind()
  renderChangeField(value, record, index, name, renderFun) {
    // console.log(isEmpty({}))
    const { changeFiledMap } = record;
    // 不会改变的字段
    const noChangefields = [
      'customAttributeList',
      'attachmentUuid',
      'customSpecsJson',
      'productSpecsJson',
      'executorName',
      'prRequestedName',
      'executionHeaderBillNum',
      'occupiedQuantity',
      'secondaryQuantity',
      'orderExcessRuleCode',
      'sourceExcessRuleCode',
      'contractExcessRuleCode',
      'sourceDisposableExcessFlag',
      'secondaryUomId',
      'secondaryUomName',
      'secondaryTaxInUnitPrice',
      'changeQuantity',
    ];
    // 有tooltip 提示的字段
    const tipFileds = ['remark'];
    if (noChangefields.includes(name)) {
      if (isFunction(renderFun)) {
        return renderFun(value, record, index);
      } else {
        return value;
      }
    }

    if (!isEmpty(changeFiledMap)) {
      let text;
      let beforeText;
      let ischangeField = false;
      const beforeRecord = { ...record, ...changeFiledMap };

      if (
        Object.keys(changeFiledMap)
          .filter(e => e !== 'uomName')
          .includes(name)
      ) {
        if (tipFileds.includes(name)) {
          text = value;
          beforeText = beforeRecord[name];
        } else {
          text = isFunction(renderFun) ? renderFun(value, record, index) : value;
          beforeText = isFunction(renderFun)
            ? renderFun(beforeRecord[name], beforeRecord, index)
            : beforeRecord[name];
        }
        ischangeField = true;
      }

      if (
        name === 'supplierName' &&
        (Object.keys(changeFiledMap).includes(name) ||
          Object.keys(changeFiledMap).includes('supplierCompanyName'))
      ) {
        text = record.supplierName || record.supplierCompanyName;
        beforeText = beforeRecord.supplierName || beforeRecord.supplierCompanyName;
        ischangeField = true;
      }

      if (name === 'uomName' && Object.keys(changeFiledMap).includes('uomCodeAndName')) {
        text = record.uomCodeAndName;
        beforeText = beforeRecord.uomCodeAndName;
        ischangeField = true;
      }

      if (ischangeField) {
        return (
          <Tooltip
            title={intl
              .get(`${commonPrompt}.beforeChanged`, {
                value: beforeText,
              })
              .d(`变更前：${beforeText}`)}
          >
            <span style={{ color: 'red' }}>{text || '-'}</span>
          </Tooltip>
        );
      }
    }

    if (isFunction(renderFun)) {
      return renderFun(value, record, index);
    } else {
      return value;
    }
  }

  @Bind()
  getColums() {
    const { doubleUintFlag = 0 } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'prLineStatusCodeMeaning',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
        fixed: 'left',
        render: (_, record) => this.popover(record),
      },
      // {
      //   title: intl
      //     .get('sprm.purchaseReqCreation.model.common.accountAssignType')
      //     .d('账户分配类别'),
      //   dataIndex: 'accountAssignTypeCode',
      //   width: 120,
      // },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseQuantity`).d('基础数量')
            : intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 150,
        render: dateRender,
      },
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseUom`).d('基本单位')
            : intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 150,
        render: (val, record) => record.uomCodeAndName || val,
      },
      {
        title: intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 120,
        // 当单位有值的时候取单位，没有值的时候取基础单位的值
        render: (_, record) =>
          record.secondaryUomCodeAndName ||
          record.secondaryUomName ||
          record.uomCodeAndName ||
          record.uomName,
      },
      {
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        render: (val, record) => {
          return (
            numberPrecision(val, record.secondaryUomPrecision) ||
            numberPrecision(record.quantity, record.uomPrecision)
          );
        },
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'secondaryTaxInUnitPrice',
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedUnitPriceMeaning
            : thousandBitSeparator(val),
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
      },
      {
        title: doubleUintFlag
          ? intl.get(`${commonPrompt}.baseTaxIncludedUnitPrice`).d('预估单价(含税)-基本单位')
          : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedUnitPriceMeaning
            : thousandBitSeparator(val),
      },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedLineAmountMeaning
            : thousandBitSeparator(val),
        // render: (val) => numberRender(val, 6),
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierName',
        width: 150,
        render: (_, record) => <span>{record.supplierName || record.supplierCompanyName}</span>,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      // {
      //   title: intl.get(`${commonPrompt}.inventoryName`).d('库房'),
      //   dataIndex: 'inventoryName',
      //   width: 120,
      // },
      {
        title: intl.get(`entity.roles.proposer`).d('申请人'),
        dataIndex: 'prRequestedName',
        width: 150,
      },
      // {
      //   title: intl.get(`sprm.common.model.receiveContactName`).d('收货联系人'),
      //   width: 150,
      //   dataIndex: 'receiveContactName',
      // },
      // {
      //   title: intl.get(`sprm.common.model.receiveTelNum`).d('收货人联系方式'),
      //   width: 150,
      //   dataIndex: 'receiveTelNum',
      //   render: (val, record) => (val ? `${record.internationalTelCode || ''} ${val}` : ''),
      // },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 120,
        render: text => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
        dataIndex: 'erpEditStatus',
        width: 150,
      },
      {
        title: intl.get(`entity.attachment.tag`).d('附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (value, record) => {
          return (
            <UploadModal
              attachmentUUID={record.attachmentUuid}
              viewOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="sodr-order"
            />
          );
        },
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'operationRecord',
        width: 150,
        render: (val, record) => {
          return (
            <a onClick={() => this.hideModal(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          );
        },
      },
    ];

    /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["ele"] }] */
    columns.forEach(ele => {
      const renderFunc = ele.render;
      ele.render = (value, record, index) =>
        this.renderChangeField(value, record, index, ele.dataIndex, renderFunc);
    });

    return columns;
  }

  render() {
    const {
      dataSource,
      pagination,
      onSearchList,
      loading,
      customizeTable,
      doubleUintFlag,
    } = this.props;
    const columns = this.getColums();
    const scrollX = sum(columns?.map(n => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      loading,
      columns: !doubleUintFlag
        ? columns.filter(
            ele =>
              !['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'].includes(
                ele.dataIndex
              )
          )
        : columns,
      dataSource,
      pagination,
      bordered: true,
      onChange: onSearchList,
      rowKey: this.defaultTableRowKey,
      scroll: { x: scrollX >= 1200 ? scrollX : false }, // y: 'calc(100vh - 320px)' todo页面增加固定头
    };
    return (
      <React.Fragment>
        {customizeTable(
          { code: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.LINE_ERP' },
          <Table {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}
