import React, { Fragment, PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isFunction, isEmpty } from 'lodash';
// import UploadModal from 'components/Upload/index';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentTenant, getResponse } from 'utils/utils';
import { fetchExecutionLink } from '@/services/purchaseRequisitionAssignmentService';
import abnormal from '@/assets/abnormal.svg';
import styles from '@/routes/PurchaseRequisitionInquiry/index.less';
import { thousandBitSeparator, numberPrecision } from '@/routes/utils.js';

// import styles from './index.less';
const commonPrompt = 'sprm.common.model.common';
const modelPrompt = 'sprm.purchaseReqInquiry.model.common';
export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOldUser: false,
    };
  }

  componentDidMount() {
    this.getExecutionLink();
  }

  @Bind()
  hideModal(record) {
    const { hideModal } = this.props;
    hideModal(record);
  }

  @Bind()
  getExecutionLink() {
    fetchExecutionLink({ tenantNum: getCurrentTenant().tenantNum }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result.content)) {
        this.setState({
          isOldUser: true,
        });
      }
    });
  }

  // /**
  //  * 判断是否异常
  //  *
  //  */
  // @Bind()
  // onCell(record = {}) {
  //   if (record.incorrectFlag === 1) {
  //     return {
  //       className: styles['erp-list-bgc'],
  //     };
  //   }
  // }

  @Bind()
  showStatus(value) {
    const { erpEditStatusList } = this.props;
    for (let i = 0; i < erpEditStatusList.length; i++) {
      if (value === erpEditStatusList[i].value) {
        return <span>{erpEditStatusList[i].meaning}</span>;
      }
    }
    return <span>{value}</span>;
  }

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
      'prLineStatusCodeMeaning',
      'displayLineNum',
      'executionBillDetail',
      'enclosure',
      'operatorRecord',
      'secondaryQuantity',
      'secondaryUomName',
      'secondaryUomId',
      'secondaryUomName',
      'secondaryTaxInUnitPrice',
      'erpEditStatus',
      'executorName',
      'prRequestedName',
      'executionHeaderBillNum',
      'occupiedQuantity',
      'changeQuantity',
      'sourceOccupiedQuantity',
      'restSourceQuantity',
      'orderOccupiedQuantity',
      'orderExcessRuleCode',
      'sourceExcessRuleCode',
      'contractExcessRuleCode',
      'sourceDisposableExcessFlag',
      'restPoQuantity',
      'orderExecuteStatus',
      'sourceExecuteStatus',
    ];
    // 有tooltip 提示的字段
    const tipFileds = ['companyName', 'executorName'];
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

      if (Object.keys(changeFiledMap).includes(name)) {
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
  getColumns() {
    const { onView, doubleUintFlag = 0 } = this.props;
    const { isOldUser } = this.state;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'prLineStatusCodeMeaning',
        width: 80,
        fixed: 'left',
        render: (val, { headerSyncStatus, headerSyncResponseMsg } = {}) => (
          <div className={styles['row-agent-column']}>
            {headerSyncStatus === 'SYNC_FAILURE' ? (
              <Tooltip title={headerSyncResponseMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {val}
          </div>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
        fixed: 'left',
        // onCell: this.onCell,
        render: (_, record) => this.popover(record),
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
        width: 150,
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.occupiedQuantity`).d('已执行数量'),
        dataIndex: 'occupiedQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.changeQuantity`).d('变更数量'),
        dataIndex: 'changeQuantity',
        render: (val, record) => {
          return numberPrecision(val, record.uomPrecision);
        },
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
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.orderExcessRuleCode`).d('订单超量规则'),
        dataIndex: 'orderExcessRuleCode',
        render: (val, record) => record.orderExcessRuleCodeMeaning,
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.sourceExcessRuleCode`).d('寻源超量规则'),
        dataIndex: 'sourceExcessRuleCode',
        render: (val, record) => record.sourceExcessRuleCodeMeaning,
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.contractExcessRuleCode`).d('协议超量规则'),
        dataIndex: 'contractExcessRuleCode',
        render: (val, record) => record.contractExcessRuleCodeMeaning,
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.sourceDisposableExcessFlag`).d('寻源新链路一次性超量标识'),
        dataIndex: 'sourceDisposableExcessFlag',
        render: (val, record) => record.sourceDisposableExcessFlagMeaning,
        width: 180,
      },
      {
        title:
          doubleUintFlag === 1
            ? intl.get(`${commonPrompt}.baseUom`).d('基本单位')
            : intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 120,
        render: (val, record) => record.uomCodeAndName || val,
      },
      {
        title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
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
        width: 180,
        align: 'right',
        render: (val, record) =>
          record.linePriceHiddenFlag === 1 ? record.taxIncludedUnitPriceMeaning : val,
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 180,
        // render: (val) => thousandBitSeparator(val),
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedUnitPriceMeaning
            : thousandBitSeparator(val),
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        // render: (val, record) => thousandBitSeparator(val, record.financialPrecision),
        render: (val, record) =>
          record.linePriceHiddenFlag === 1
            ? record.taxIncludedLineAmountMeaning
            : thousandBitSeparator(val, record.financialPrecision),
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 160,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get('entity.supplier.tag').d('供应商'),
        dataIndex: 'supplierName',
        width: 150,
        render: (_, record) => <span>{record.supplierName || record.supplierCompanyName}</span>,
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
        dataIndex: 'prRequestedName',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
        dataIndex: 'executionStatusMeaning',
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
        title: intl.get(`${modelPrompt}.executionBillNum`).d('执行单据编号'),
        dataIndex: 'executionHeaderBillNum',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.assignedDate`).d('分配日期'),
        dataIndex: 'assignedDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
        dataIndex: 'erpEditStatus',
        width: 120,
        render: (value) => this.showStatus(value),
      },
      // {
      //   title: intl.get(`${commonPrompt}.chartNum`).d('图号'),
      //   dataIndex: 'drawingNum',
      //   width: 120,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.drawVersion`).d('图纸版本'),
      //   dataIndex: 'drawingVersion',
      //   width: 120,
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
      {
        title: intl.get(`${commonPrompt}.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemCode',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.supplierItemName`).d('供应商料号描述'),
        width: 180,
        dataIndex: 'supplierItemName',
        align: 'left',
      },
      // {
      //   title: intl.get(`${modelPrompt}.receiveContactName`).d('收货联系人'),
      //   width: 150,
      //   dataIndex: 'receiveContactName',
      //   render: (val) => (
      //     <Tooltip title={val}>
      //       <span>{val}</span>
      //     </Tooltip>
      //   ),
      // },
      // {
      //   title: intl.get(`${modelPrompt}.receiveTelNum`).d('收货人联系方式'),
      //   width: 150,
      //   dataIndex: 'receiveTelNum',
      //   render: (val, record) => (
      //     <Tooltip title={val}>
      //       <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
      //     </Tooltip>
      //   ),
      // },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
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
            icon: 'paper-clip',
          };
          return <UploadModal {...uploadProps} />;
        },
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'operatorRecord',
        width: 100,
        render: (val, record) => {
          return (
            <a onClick={() => this.hideModal(record)}>
              {intl.get('hzero.common.button.operating').d('操作记录')}
            </a>
          );
        },
      },
    ];
    if (!isOldUser) {
      const colorStatus = (value) =>
        value === 'NOT_STARTED'
          ? 'rgba(0,0,0,0.25)'
          : value === 'FINISHED'
          ? '#47B881'
          : value === 'CLOSED'
          ? 'red'
          : '#FCA000';
      columns.push(
        ...[
          {
            title: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源链路占用数量'),
            dataIndex: 'sourceOccupiedQuantity',
            render: (val, record) => {
              return numberPrecision(val, record.uomPrecision);
            },
            width: 100,
          },
          {
            title: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('履约链路占用数量'),
            dataIndex: 'orderOccupiedQuantity',
            render: (val, record) => {
              return numberPrecision(val, record.uomPrecision);
            },
            width: 100,
          },
          {
            title: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源链路可用数量'),
            dataIndex: 'restSourceQuantity',
            render: (val, record) => {
              return numberPrecision(val, record.uomPrecision);
            },
            width: 100,
          },
          {
            title: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('履约链路可用数量'),
            dataIndex: 'restPoQuantity',
            render: (val, record) => {
              return numberPrecision(val, record.uomPrecision);
            },
            width: 100,
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
            dataIndex: 'orderExecuteStatus',
            lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
            title: intl.get(`${commonPrompt}.orderExecuteStatus`).d('订单执行状态'),
            render: (val, record) => {
              return record && record?.orderExecuteStatusMeaning ? (
                <Tag color={colorStatus(val)} style={{ verticalAlign: 'text-top' }}>
                  {record.orderExecuteStatusMeaning}
                </Tag>
              ) : null;
            },
          },
          {
            dataIndex: 'sourceExecuteStatus',
            lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
            title: intl.get(`${commonPrompt}.sourceExecuteStatus`).d('寻源执行状态'),
            render: (val, record) => {
              return record && record.sourceExecuteStatusMeaning ? (
                <Tag color={colorStatus(val)} style={{ verticalAlign: 'text-top' }}>
                  {record.sourceExecuteStatusMeaning}
                </Tag>
              ) : null;
            },
          },
        ]
      );
    }
    /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["ele"] }] */
    columns.forEach((ele) => {
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
      onChange,
      doubleUintFlag = 0,
      customizeTable,
      remote,
    } = this.props;
    const { cuxHandleColumns } = remote?.props?.process || {};
    const baseColumns = this.getColumns();
    const columns = isFunction(cuxHandleColumns) ? cuxHandleColumns(baseColumns) : baseColumns;
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_ERP',
          },
          <Table
            bordered
            columns={
              doubleUintFlag
                ? columns
                : columns.filter(
                    (item) =>
                      !['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'].includes(
                        item.dataIndex
                      )
                  )
            }
            pagination={pagination}
            dataSource={dataSource}
            onChange={(page) => onChange(page)}
            // scroll={{ x: columns.map(item => item.width || 0).reduce((sum, val) => sum + val) }}
            scroll={{
              x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))),
            }} //  y: 'calc(100vh - 320px)',todo页面增加固定头
          />
        )}
      </React.Fragment>
    );
  }
}
