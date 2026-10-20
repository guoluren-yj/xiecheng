import React, { Component } from 'react';
import { Table, Tooltip, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import urgentImg from '@/assets/icon-expedited.svg';

import { thousandBitSeparator, numberPrecision } from '@/routes/utils.js';
import { dateRender, yesOrNoRender, dateTimeRender } from 'utils/renderer.js';
import OperationRecord from '../components/OperationRecord/OperationRecord';
import styles from '../PurchaseRequisitionCreation/index.less';
// 设置sprm国际化前缀
const commonPrompt = 'sprm.common.model.common';
// const modelPrompt = 'sprm.purchaseRequisitionCancel.model.purchaseRequisitionCancel';

/**
 * 需求取消列表组件
 * @export
 * @class List - 列表组件
 * @extends {Component} -React.Component
 * @reactProps {boolean} loading - table数据加载状态
 * @reactProps {object[]} tableData - table 数据源
 * @reactProps {object} pagination - table 分页信息
 * @reactProps {object} rowSelection - 选择行对象
 * @returns React.element
 */
export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationRecordList: [],
      operationRecordPagination: {},
      operationRecordModalVisible: false,
    };
  }

  @Bind()
  handleOperationRecordSearch() {
    const { handleOperationRecordSearch } = this.props;
    handleOperationRecordSearch();
  }

  @Bind()
  hideModal() {
    const { hideModal } = this.props;
    hideModal();
  }

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 120,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      rowSelection,
      loading,
      pagination,
      tableData,
      onChange,
      onHide,
      fetchOperationRecordListLoading,
      customizeTable,
      isNewTeant,
      doubleUintFlag,
    } = this.props;
    const {
      operationRecordList,
      operationRecordPagination,
      operationRecordModalVisible,
    } = this.state;
    const operationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'prLineStatusCodeMeaning',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
        dataIndex: 'displayPrNum',
        width: 150,
        sorter: true,
        fixed: 'left',
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            {val}
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.title`).d('标题'),
        width: 150,
        dataIndex: 'title',
        render: val => <Tooltip title={val}>{val}</Tooltip>,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
        fixed: 'left',
      },
      // {
      //   title: intl.get(`${commonPrompt}.purchaseLineType`).d('采购行类型'),
      //   dataIndex: 'purchaseLineTypeCode',
      //   width: 150,
      // },
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
        sorter: true,
        width: 120,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        onCell: this.onCell,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      // {
      //   title: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
      //   dataIndex: 'itemAbcClass',
      //   width: 180,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.quantityStandard`).d('质量标准'),
      //   width: 165,
      //   dataIndex: 'qualityStandard',
      //   align: 'left',
      // },
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseQuantity`).d('基础数量')
            : intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 120,
      },
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseUom`).d('基本单位')
            : intl.get(`${commonPrompt}.uomName`).d('单位'),
        width: 120,
        dataIndex: 'uomName',
        render: (val, record) => record.uomCodeAndName || val,
      },
      {
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.secondaryUomPrecision);
        },
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.uomName`).d('单位'),
        width: 120,
        dataIndex: 'secondaryUomId',
        render: (val, record) => record.secondaryUomCodeAndName || record.secondaryUomName,
      },
      {
        title: intl.get(`${commonPrompt}.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'secondaryTaxInUnitPrice',
        width: 150,
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
        align: 'right',
      },
      {
        title: doubleUintFlag
          ? intl.get(`${commonPrompt}.baseTaxIncludedUnitPrice`).d('预估单价(含税)-基本单位')
          : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 150,
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.unitPriceBatch`).d('每'),
        width: 80,
        dataIndex: 'unitPriceBatch',
      },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedLineAmountMeaning
            : thousandBitSeparator(
                val,
                record.financialPrecision,
                record.prSourcePlatform !== 'SRM'
              ),
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        dataIndex: 'taxIncludedBudgetUnitPrice',
        width: 120,
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedBudgetUnitPriceMeaning : val,
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.budgetAccountName`).d('预算科目'),
        dataIndex: 'budgetAccountName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.budgetIoFlag`).d('预算外标识'),
        dataIndex: 'budgetIoFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 120,
        sorter: true,
        render: dateRender,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierName',
        render: (text, record) => (
          <Tooltip title={record.supplierName || record.supplierCompanyName}>
            {record.supplierName ? record.supplierName : record.supplierCompanyName}
          </Tooltip>
        ),
        width: 150,
        onCell: this.onCell,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
        sorter: true,
        onCell: this.onCell,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        sorter: true,
        width: 130,
        onCell: this.onCell,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 140,
        render: val => <Tooltip title={val}>{val}</Tooltip>,
      },
      // {
      //   title: intl.get(`${commonPrompt}.inventoryName`).d('库房'),
      //   dataIndex: 'inventoryName',
      //   width: 120,
      // },
      {
        title: intl.get(`entity.roles.proposer`).d('申请人'),
        dataIndex: 'prRequestedName',
        sorter: true,
        render: (val, record) => (
          <span>{record.prRequestedNum ? `${record.prRequestedNum}-${val}` : val}</span>
        ),
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 120,
        onCell: this.onCell,
      },
      {
        title: intl.get(`${commonPrompt}.catalogName`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 120,
        onCell: this.onCell,
      },
      {
        title: intl.get(`${commonPrompt}.closeQuantity`).d('关闭数量'),
        dataIndex: 'closeQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.sourceCloseQuantity`).d('寻源关闭数量'),
        dataIndex: 'sourceCloseQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.currentCloseQuantity`).d('本次关闭数量'),
        dataIndex: 'currentCloseQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.currentSourceCloseQuantity`).d('本次寻源关闭数量'),
        dataIndex: 'currentSourceCloseQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.downsStreamQuantity`).d('已转下游数量'),
        dataIndex: 'downsStreamQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.sourceDownsStreamQuantity`).d('寻源链路已转下游数量'),
        dataIndex: 'sourceDownsStreamQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
        width: 150,
        onCell: this.onCell,
      },
      {
        title: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        dataIndex: 'unitName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.projectCategory`).d('项目类别'),
        width: 165,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        dataIndex: 'costName',
        width: 180,
      },
      {
        title: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        dataIndex: 'accountSubjectName',
        width: 180,
      },
      {
        title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        dataIndex: 'wbs',
        width: 180,
      },
      {
        title: intl.get(`${commonPrompt}.projectNum`).d('项目号'),
        width: 165,
        dataIndex: 'projectNum',
        align: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
        width: 165,
        dataIndex: 'projectName',
        align: 'left',
      },
      // {
      //   title: intl.get(`${commonPrompt}.projectCarNum`).d('项目号车号'),
      //   width: 165,
      //   dataIndex: 'craneNum',
      //   align: 'left',
      // },
      // {
      //   title: intl.get(`${commonPrompt}.assets`).d('资产'),
      //   width: 165,
      //   dataIndex: 'assets',
      // },
      // {
      //   title: intl.get(`${commonPrompt}.assetChildNum`).d('资产子编号'),
      //   width: 165,
      //   dataIndex: 'assetChildNum',
      // },
      // {
      //   title: intl.get(`${commonPrompt}.inpaperNum`).d('内部订单号'),
      //   width: 165,
      //   dataIndex: 'innerPoNum',
      // },
      // {
      //   title: intl.get(`${commonPrompt}.drawingNum`).d('图号'),
      //   width: 165,
      //   dataIndex: 'drawingNum',
      //   align: 'left',
      // },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        onCell: this.onCell,
        width: 120,
        render: text => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 120,
        dataIndex: 'operatorRecord',
        render: (_, record) => (
          <a onClick={() => onHide(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
    if (isNewTeant) {
      columns.splice(0, 0, {
        title: intl.get(`${commonPrompt}.operable`).d('可操作类型'),
        width: 120,
        dataIndex: 'operable',
        render: (_, record) => {
          const { prLineCancelledFlag, prLineClosedFlag } = record;
          return (
            <span>
              {prLineCancelledFlag === 1 ? (
                <Tag color="blue">{intl.get(`${commonPrompt}.cancellable`).d('可取消')}</Tag>
              ) : null}
              {prLineClosedFlag === 1 ? (
                <Tag color="blue">{intl.get(`${commonPrompt}.closable`).d('可关闭')}</Tag>
              ) : null}
            </span>
          );
        },
      });
    }
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
    const baseUomInfo =
      doubleUintFlag === 1
        ? []
        : ['secondaryUomName', 'secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.DETAIL',
          },
          <Table
            bordered
            loading={loading}
            columns={columns.filter(ele => !baseUomInfo.includes(ele.dataIndex))}
            dataSource={tableData}
            pagination={pagination}
            rowSelection={rowSelection}
            scroll={{ x: scrollX }} //  y: 'calc(100vh - 320px)' todo页面增加固定头
            rowKey="prLineId"
            onChange={onChange}
          />
        )}
        <OperationRecord {...operationRecordProps} />
      </React.Fragment>
    );
  }
}
