/**
 * List - 需求分配
 * @date: 2019-07-10
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';
import { PRIVATE_BUCKET } from '_utils/config';

import { dateTimeRender, yesOrNoRender, dateRender } from 'utils/renderer';
import { thousandBitSeparator, numberPrecision } from '@/routes/utils.js';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import urgentImg from '@/assets/icon-expedited.svg';
import styles from './index.less';

const commonPrompt = 'sprm.common.model.common';
const hcuzCode = 'SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.GRID';
/**
 * @export
 * @class List - 需求分配查询列表组件
 * @extends {Component} - React.Component
 * @reactProps {object[]} dataSource - 数据源
 * @reactProps {boolean} loading - 数据加载状态
 * @reactProps {object} pagination - 分页数据
 * @reactProps {object} rowSelection - 选择行对象
 */
@withCustomize({
  unitCode: [hcuzCode],
})
export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // erp状态显示
  @Bind()
  showStatus(value) {
    const { erpEditStatusList } = this.props;
    if (erpEditStatusList) {
      for (let i = 0; i < erpEditStatusList.length; i++) {
        if (value === erpEditStatusList[i].value) {
          return <span>{erpEditStatusList[i].meaning}</span>;
        }
      }
      return <span>{value}</span>;
    }
  }

  @Bind()
  handleLadderPrice(record) {
    const { onPriceSet } = this.props;
    const { prLineId } = record;
    onPriceSet({ prLineId, referPriceVisible: true });
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
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
      onShow,
      dataSource,
      onChange,
      prLineStatusCode,
      customizeTable,
      doubleUintFlag,
    } = this.props;
    let columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'prLineStatusCodeMeaning',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.backToUnassignFlag`).d('退回标识'),
        dataIndex: 'backToUnassignFlag',
        width: 100,
        fixed: 'left',
        render: (text) =>
          text === 1
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否'),
      },
      {
        title: intl.get(`${commonPrompt}.backToUnassignReason`).d('退回原因'),
        dataIndex: 'backToUnassignReason',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
        dataIndex: 'displayPrNum',
        width: 150,
        fixed: 'left',
        sorter: true,
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
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        width: 100,
        dataIndex: 'displayLineNum',
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
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 140,
        sorter: true,
      },
      {
        title: intl.get(`${commonPrompt}.sqType`).d('申请类型'),
        dataIndex: 'prTypeName',
        width: 120,
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        onCell: this.onCell,
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
      },
      // {
      //   title: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
      //   dataIndex: 'itemAbcClass',
      //   width: 180,
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
        dataIndex: 'uomName',
        width: 100,
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
        title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
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
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'secondaryTaxInUnitPrice',
        width: 150,
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.secondaryTaxInUnitPrice : val,
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
        title: intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略'),
        dataIndex: 'executionStrategyMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        dataIndex: 'taxIncludedBudgetUnitPrice',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedBudgetUnitPriceMeaning : val,
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.referPrice`).d('参考价格'),
        dataIndex: 'referencePriceDisplayFlag',
        width: 120,
        render: (_, record) => {
          const { itemCode, prSourcePlatform, referencePriceDisplayFlag } = record;
          return itemCode && prSourcePlatform !== 'CATALOGUE' && referencePriceDisplayFlag ? (
            <a onClick={() => this.handleLadderPrice(record)}>
              {intl.get(`sprm.common.model.common.referPrice.referPrice`).d('参考价格')}
            </a>
          ) : null;
        },
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
        sorter: true,
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        dataIndex: 'requestDate',
        width: 120,
        sorter: true,
        render: dateRender,
      },
      {
        title: intl.get(`${commonPrompt}.assignedDate`).d('分配日期'),
        dataIndex: 'assignedDate',
        width: 120,
        sorter: true,
        render: dateTimeRender,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 180,
        sorter: true,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
        sorter: true,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 140,
        sorter: true,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      // {
      //   title: intl.get(`${commonPrompt}.inventoryName`).d('库房'),
      //   dataIndex: 'inventoryName',
      //   width: 120,
      // },
      {
        title: intl.get('entity.roles.proposer').d('申请人'),
        dataIndex: 'prRequestedName', // ${prRequestedName}
        render: (val, record) => (record.prRequestedNum ? `${record.prRequestedNum}-${val}` : val),
        sorter: true,
        width: 120,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 120,
        onCell: this.onCell,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
        dataIndex: 'erpEditStatus',
        width: 120,
        render: (value) => this.showStatus(value),
      },
      {
        title: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
        dataIndex: 'executionStatusMeaning',
        width: 120,
      },
      {
        title: intl
          .get(`sprm.purchaseRequisitionAssign.model.common.executionBillNum`)
          .d('执行单据编号'),
        dataIndex: 'executionHeaderBillNum',
        width: 130,
      },
      {
        title: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
        dataIndex: 'executorName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        dataIndex: 'unitName',
        sorter: true,
        width: 180,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'creatorName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        title: intl.get('entity.attachment.tag').d('附件'),
        dataIndex: 'enclosure',
        width: 100,
        render: (_, { attachmentUuid }) => {
          const uploadProps = {
            bucketName: PRIVATE_BUCKET,
            bucketDirectory: 'sprm-pr',
            btnText: intl.get('entity.attachment.view').d('附件查看'),
            attachmentUUID: attachmentUuid,
            viewOnly: true,
            showFilesNumber: true,
            icon: false,
          };
          return <UploadModal {...uploadProps} />;
        },
      },
      {
        title: intl.get(`${commonPrompt}.projectCategory`).d('项目类别'),
        width: 165,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        width: 165,
        dataIndex: 'wbs',
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
      //   title: intl.get(`${commonPrompt}.companyTeam`).d('公司组织'),
      //   width: 165,
      //   dataIndex: 'parentUnitName',
      //   align: 'left',
      // },
      // {
      //   title: intl.get(`${commonPrompt}.moneyPart`).d('费用挂靠部门'),
      //   width: 165,
      //   dataIndex: 'expenseUnitName',
      //   align: 'left',
      // },
      // {
      //   title: intl.get(`${commonPrompt}.buyType`).d('采购品类'),
      //   width: 165,
      //   dataIndex: 'categoryName',
      //   align: 'left',
      // },
      // {
      //   title: intl.get(`${commonPrompt}.drawingNum`).d('图号'),
      //   width: 165,
      //   dataIndex: 'drawingNum',
      //   align: 'left',
      // },
      {
        title: intl.get(`${commonPrompt}.supplierItemNum`).d('供应商料号'),
        width: 165,
        dataIndex: 'supplierItemCode',
        align: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.supplierItemName`).d('供应商料号描述'),
        width: 180,
        dataIndex: 'supplierItemName',
        align: 'left',
      },
      // {
      //   title: intl.get(`${commonPrompt}.drawVersion`).d('图纸版本'),
      //   width: 165,
      //   dataIndex: 'drawingVersion',
      //   align: 'left',
      // },
      {
        title: intl.get(`${commonPrompt}.itemModel`).d('型号'),
        width: 165,
        dataIndex: 'itemModel',
        align: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
        width: 165,
        dataIndex: 'itemSpecs',
        align: 'left',
      },
      // {
      //   title: intl.get(`${commonPrompt}.quantityStandard`).d('质量标准'),
      //   width: 165,
      //   dataIndex: 'qualityStandard',
      //   align: 'left',
      // },
      {
        title: intl.get(`${commonPrompt}.receiveContactName`).d('收货联系人'),
        width: 150,
        dataIndex: 'receiveContactName',
        render: (val) => (
          <Tooltip title={val}>
            <span>{val}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.receiveTelNum`).d('收货人联系方式'),
        width: 150,
        dataIndex: 'receiveTelNum',
        render: (val, record) => (
          <Tooltip title={val}>
            <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.suspendRemark`).d('暂挂原因'),
        width: 165,
        dataIndex: 'suspendRemark',
        align: 'left',
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        width: 100,
        dataIndex: 'operatorRecord',
        render: (_, record) => (
          <a onClick={() => onShow(record)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </a>
        ),
      },
    ];
    columns = !doubleUintFlag
      ? columns.filter(
          (ele) =>
            !['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'].includes(
              ele.dataIndex
            )
        )
      : columns;
    const tableProps = {
      loading,
      columns:
        prLineStatusCode !== 'APPROVED' && prLineStatusCode !== ''
          ? columns.filter(
              (ele) => !['backToUnassignFlag', 'backToUnassignReason'].includes(ele.dataIndex)
            )
          : prLineStatusCode === 'APPROVED'
          ? columns.filter((ele) => ele.dataIndex !== 'assignedDate')
          : prLineStatusCode === 'SUSPEND'
          ? columns
          : columns.filter((ele) => ele.dataIndex !== 'suspendRemark'),
      dataSource,
      onChange,
      rowSelection,
      pagination,
      rowKey: 'prLineId',
      bordered: true,
      scroll: {
        x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 250,
      }, // y: 'calc(100vh - 320px)', todo页面增加固定头
    };
    return customizeTable({ code: hcuzCode }, <Table {...tableProps} />);
  }
}
