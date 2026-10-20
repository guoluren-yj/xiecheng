/*
 * 需求查询按明细传表格
 * @date: 2019-07-18
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Tooltip, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import { dateRender, yesOrNoRender, dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import { PRIVATE_BUCKET } from '_utils/config';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import styles from './index.less';
import { thousandBitSeparator, numberPrecision } from '@/routes/utils.js';
import CustomSpecModal from '../../components/CustomSpecModal';
import { ItemCustom } from '../../components/ItemCustom';
import PriceListModal from '../../components/PriceListModal';
import ChangeOrderCodeRender from '@/routes/components/ChangeOrderCodeRender';

const commonPrompt = 'sprm.common.model.common';
const modelPrompt = 'sprm.purchaseReqInquiry.model.common';

/**
 * @export
 * @class List - 需求查询按明细传表格
 * @extends {Component} - React.Component
 * @reactProps {object[]} dataSource - 数据源
 * @reactProps {boolean} loading - 数据加载状态
 * @reactProps {object} pagination - 分页数据
 * @reactProps {object} rowSelection - 选择行对象
 */
export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customVisable: false,
      specsJsonType: 'custom',
      customData: [],
      priceListModalVisible: false,
      priceData: [],
    };
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
      loading,
      onDetail,
      pagination,
      onHide,
      onView,
      dataSource,
      onChange,
      selectedRowKeys,
      onSelectRow,
      doubleUintFlag,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'prLineStatusCodeMeaning',
        width: 100,
        // sorter: true,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
        dataIndex: 'displayPrNum',
        width: 160,
        sorter: true,
        fixed: 'left',
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => onDetail(record)} style={{ paddingRight: '8px' }}>
              {val}
            </a>
            {record.incorrectFlag === 1 ? (
              <Tooltip title={record.incorrectMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.headerSyncStatus === 'SYNC_FAILURE' ? (
              <Tooltip title={record.syncResponseMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip
                title={intl.get(`sodr.orderMaintenanceEntry.model.common.urgent`).d('申请加急')}
              >
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.poSyncSuccessFlag === 0 ? (
              <Tooltip title={record.poSyncMessage}>
                <Icon type="warning" style={{ color: 'red' }} />
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
      {
        title: intl.get(`${commonPrompt}.sqType`).d('申请类型'),
        dataIndex: 'prTypeName',
        width: 150,
        fixed: 'left',
      },
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
        render: (text) => (
          <Tooltip title={text} placement="topLeft">
            {text}
          </Tooltip>
        ),
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        render: (text) => (
          <Tooltip title={text} placement="topLeft">
            {text}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
        render: (text) => (
          <Tooltip title={text} placement="topLeft">
            {text}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.customMadeFlag`).d('是否定制'),
        dataIndex: 'customMadeFlag',
        width: 180,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${commonPrompt}.customAttributeList`).d('物料定制属性'),
        dataIndex: 'customAttributeList',
        width: 180,
        render: (value, record) =>
          record.customMadeFlag === 1 && (
            <ItemCustom
              {...{
                customAttributeList: value,
                record,
                disabled: true,
                customMadeFlag: record.$form
                  ? record.$form.getFieldValue('customMadeFlag')
                  : record.customMadeFlag,
              }}
            />
          ),
      },
      {
        title: intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单'),
        dataIndex: 'priceList',
        width: 130,
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                const priceData =
                  (record && record?.productCompareJson && JSON.parse(record.productCompareJson)) ??
                  [];
                this.setState({ priceListModalVisible: true, priceData });
              }}
            >
              {intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单')}
            </a>
          );
        },
      },
      // {
      //   title: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
      //   dataIndex: 'itemAbcClass',
      //   width: 180,
      // },
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseUom`).d('基本单位')
            : intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 120,
        render: (_, record) => record.uomCodeAndName,
      },
      // {
      //   title: intl.get(`${commonPrompt}.quantityStandard`).d('质量标准'),
      //   width: 165,
      //   dataIndex: 'qualityStandard',
      //   align: 'left',
      // },
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseQuantity`).d('基本数量')
            : intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 120,
        render: (_, record) => record.secondaryUomCodeAndName || record.uomCodeAndName,
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
        dataIndex: 'secondaryTaxInUnitPrice',
        title: intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
        width: 180,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
      },
      {
        title: intl.get(`${commonPrompt}.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 80,
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
        width: 180,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
      },
      {
        title: intl.get(`${commonPrompt}.unitPriceBatch`).d('每'),
        width: 80,
        dataIndex: 'unitPriceBatch',
      },
      {
        title: intl.get(`${commonPrompt}.taxExcludedFreightPrice`).d('预估单价(含税不含运费)'),
        dataIndex: 'taxWithoutFreightPrice',
        width: 180,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxWithoutFreightPriceMeaning : val,
      },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedLineAmountMeaning
            : thousandBitSeparator(val, record.financialPrecision),
      },
      {
        title: intl.get(`${commonPrompt}.lineFreight`).d('行运费'),
        dataIndex: 'lineFreight',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.lineFreightMeaning
            : thousandBitSeparator(val, record.financialPrecision),
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        dataIndex: 'taxIncludedBudgetUnitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedBudgetUnitPriceMeaning : val,
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
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        sorter: true,
        onCell: this.onCell,
        width: 180,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        sorter: true,
        width: 140,
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
        render: (text) => (
          <Tooltip title={text} placement="topLeft">
            {text}
          </Tooltip>
        ),
      },
      // {
      //   title: intl.get(`${commonPrompt}.inventoryName`).d('库房'),
      //   dataIndex: 'inventoryName',
      //   width: 120,
      // },
      {
        title: intl.get('entity.roles.proposer').d('申请人'),
        dataIndex: 'prRequestedName',
        sorter: true,
        render: (val, record) => (
          <span>{record.prRequestedNum ? `${record.prRequestedNum}-${val}` : val}</span>
        ),
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'creatorName',
        width: 120,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.projectCategory`).d('项目类别'),
        width: 165,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        dataIndex: 'unitName',
        sorter: true,
        width: 180,
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 120,
        sorter: true,
        render: dateRender,
      },
      {
        title: intl.get('entity.supplier.tag').d('供应商'),
        dataIndex: 'supplierName',
        width: 160,
        render: (_, record) => (
          <Tooltip title={record.supplierName || record.supplierCompanyName}>
            {record.supplierName || record.supplierCompanyName}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
        dataIndex: 'erpEditStatus',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
        dataIndex: 'executionStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.executionBillNum`).d('执行单据编号'),
        dataIndex: 'executionHeaderBillNum',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
        dataIndex: 'executorName',
        width: 120,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.executionBillDetail`).d('执行单据详情'),
        width: 120,
        align: 'center',
        dataIndex: 'executionBillDetail',
        render: (_, record) => (
          <a onClick={() => onView(record)}>{intl.get('hzero.common.button.view').d('查看')}</a>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略'),
        dataIndex: 'executionStrategyMeaning',
        width: 120,
      },
      {
        title: intl.get(`sprm.common.model.autoAssignedFlag`).d('自动分配是否成功'),
        dataIndex: 'autoAssignedFlag',
        width: 150,
        render: (value) => {
          if (value || value === 0) {
            return (
              <Tag className={value === 1 ? 'c7n-tag-green' : 'c7n-tag-red'} style={{ border: 0 }}>
                {value === 1
                  ? intl.get(`sprm.common.model.successStatus`).d('成功')
                  : intl.get(`sprm.common.model.errorStatus`).d('失败')}
              </Tag>
            );
          } else {
            return null;
          }
        },
      },
      {
        title: intl.get(`sprm.common.model.autoOrderStatus`).d('自动创建PO状态'),
        dataIndex: 'changeOrderCode',
        width: 150,
        render: (value, record) =>
          ChangeOrderCodeRender({ record, value, type: 'hzero', showFlag: false }),
      },
      {
        title: intl.get(`${commonPrompt}.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 150,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.catalogName`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 150,
      },
      {
        title: intl.get(`sprm.common.model.common.thirdSkuCode`).d('第三方商品编码'),
        width: 120,
        dataIndex: 'thirdSkuCode',
      },
      {
        title: intl.get(`sprm.common.model.common.thirdSkuName`).d('第三方商品名称'),
        width: 120,
        dataIndex: 'thirdSkuName',
      },
      {
        title: intl.get(`sprm.common.shoppingMall.model.productBrand`).d('商品品牌'),
        dataIndex: 'productBrand',
        width: 120,
      },
      {
        title: intl.get(`sprm.common.shoppingMall.model.productModel`).d('商品型号'),
        dataIndex: 'productModel',
        width: 120,
      },
      {
        title: intl.get(`sprm.common.shoppingMall.model.packingList`).d('商品规格'),
        dataIndex: 'packingList',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.prApplyNum`).d('SRM申请编号'),
        dataIndex: 'prNum',
        width: 120,
        render: (value, record) =>
          record.headerSyncStatus === 'SYNC_SUCCESS' ? <text>{value}</text> : null,
      },
      {
        title: intl.get(`${commonPrompt}.urgentFlag`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 180,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        dataIndex: 'requestDate',
        sorter: true,
        width: 180,
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
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        onCell: this.onCell,
        width: 120,
        render: (text) => (
          <Tooltip title={text} placement="topLeft">
            {text}
          </Tooltip>
        ),
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
        title: intl.get(`${commonPrompt}.changeOrderFailCount`).d('自动转单失败次数'),
        width: 150,
        dataIndex: 'changeOrderFailCount',
      },
      {
        title: intl.get(`${commonPrompt}.skuTypeMark`).d('定制品标识'),
        width: 150,
        dataIndex: 'skuType',
      },
      {
        title: intl.get(`${commonPrompt}.customUomName`).d('定制单位'),
        width: 150,
        dataIndex: 'customUomName',
      },
      {
        title: intl.get(`${commonPrompt}.customQuantity`).d('定制数量'),
        width: 150,
        dataIndex: 'customQuantity',
      },
      {
        title: intl.get(`${commonPrompt}.packageQuantity`).d('份数'),
        width: 150,
        dataIndex: 'packageQuantity',
      },
      {
        title: intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性'),
        width: 150,
        dataIndex: 'customSpecsJson',
        render: (val) => (
          <a
            onClick={() => {
              this.setState({
                customData: val ? JSON.parse(val) : [],
                specsJsonType: 'custom',
                customVisable: true,
              });
            }}
          >
            {intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性')}
          </a>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性'),
        width: 150,
        dataIndex: 'productSpecsJson',
        render: (val) => (
          <a
            onClick={() => {
              this.setState({
                customData: val ? JSON.parse(val) : [],
                specsJsonType: 'product',
                customVisable: true,
              });
            }}
          >
            {intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性')}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        width: 100,
        dataIndex: 'operatorRecord',
        render: (_, record) => (
          <a onClick={() => onHide(record)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </a>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.order.recordFlag`).d('变更记录'),
        dataIndex: 'updateOperatorRecord',
        width: 100,
        render: (_, record) => (
          // record.changedFlag === 1 ? (
          <a onClick={() => onHide(record, true)}>
            {intl.get(`sprm.purchaseRequisitionInquiry.model.common.changeLog`).d('变更日志')}
          </a>
        ),
        // ) : null,
      },
    ];
    const tableProps = {
      loading,
      columns: !doubleUintFlag
        ? columns.filter(
            (ele) => !['uomName', 'quantity', 'taxIncludedUnitPrice'].includes(ele.dataIndex)
          )
        : columns,
      dataSource,
      onChange,
      pagination,
      bordered: true,
      rowSelection: {
        selectedRowKeys,
        onChange: (rowKeys, selectRow) => {
          onSelectRow({ selectedDetailRowKeys: rowKeys, selectRow });
        },
      },
      rowKey: 'prLineId',
      scroll: {
        x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))),
        y: 450,
      }, //  y: 'calc(100vh - 320px)',todo页面增加固定头
    };
    const { customVisable, customData, specsJsonType } = this.state;
    const CustomSpecProps = {
      specsJsonType,
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };
    return (
      <>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH',
          },
          <Table {...tableProps} />
        )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
        {this.state.priceListModalVisible && (
          <PriceListModal
            visible={this.state.priceListModalVisible}
            onClose={() => {
              this.setState({ priceListModalVisible: false });
            }}
            data={this.state.priceData}
          />
        )}
      </>
    );
  }
}
