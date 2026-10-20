import React from 'react';
import { Form, Tag } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';

import { sum } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import UploadModal from '_components/Upload/index';

import HistoryList from '../components/SupplierActionHistory';
import SearchDrawer from '../components/SourceComponent'; // 引入抽屉面板
import { thousandBitSeparator } from '@/routes/utils';

const FormItem = Form.Item;

const commonPrompt = 'sfin.supplierChargeEntry.model';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // tenantId: getCurrentOrganizationId(),
      recordModal: false,
      sourceVisible: false,
      sourceData: {},
    };
  }

  @Bind()
  sourceRef(ref) {
    this.sourceForm = ref;
  }

  @Bind()
  handleChangeVisible(flag, record) {
    this.setState({
      sourceVisible: flag,
      sourceData: record,
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState(
      {
        recordModal: true,
        data: record,
      }
      // () => {
      //   this.historyModal.handleSearch();
      // }
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */

  @Bind()
  hideOperationRecord() {
    this.setState({
      recordModal: false,
    });
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      dispatch,
      selectedRows,
      pagination,
      onRowSelectChange = (e) => e,
      customizeTable,
    } = this.props;
    const { recordModal, data, sourceVisible, sourceData } = this.state;
    const selectedRowKeys = selectedRows.map((item) => item.supplierDeductionsId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord,
    };
    const sourceRecordProps = {
      dispatch,
      visible: sourceVisible,
      data: sourceData,
      handleChangeVisible: this.handleChangeVisible,
      onRef: this.sourceRef,
      routePrefix: 'my-received-deduction', // 我收到的扣款单前缀
      sourcePage: 'supplier', // 供应方
      routeSourceFlag: 'my-received-deduction',
      // hideModal: this.hideOperationRecord,
    };
    const uploadProps = {
      icon: false,
      viewOnly: true,
      btnText: intl.get('entity.attachment.view').d('附件查看'),
      showFilesNumber: true,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sfin-supplier',
    };

    const tableProps = {
      columns: [
        {
          title: intl.get(`${commonPrompt}.statusCode`).d('状态'),
          dataIndex: 'statusCodeMeaning',
          width: 100,
          fixed: 'left',
        },
        {
          title: intl.get(`${commonPrompt}.deductionsNum`).d('扣款单号'),
          dataIndex: 'deductionsNum',
          width: 140,
          fixed: 'left',
        },
        {
          title: intl.get(`${commonPrompt}.customCompanyName`).d('客户公司'),
          dataIndex: 'companyName',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.supplierName`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.businessEntity`).d('业务实体'),
          dataIndex: 'ouName',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.amount`).d('不含税扣款额'),
          dataIndex: 'amount',
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.taxIncludedAmount`).d('含税扣款额'),
          dataIndex: 'taxIncludedAmount',
          width: 150,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.taxRate`).d('税率(%)'),
          dataIndex: 'taxRate',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.taxAmount`).d('税额'),
          dataIndex: 'taxAmount',
          width: 150,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.remainingDeductionAmount`).d('剩余可扣款额'),
          dataIndex: 'remainingDeductionAmount',
          width: 150,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.relationAmount`).d('已扣款额'),
          dataIndex: 'relationAmount',
          width: 150,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.costDealWayCode`).d('费用处理方式'),
          dataIndex: 'costDealWayCodeMeaning',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.ticketDeductionFlag`).d('是否票扣'),
          dataIndex: 'ticketDeductionFlag',
          width: 150,
          render: (val) => yesOrNoRender(val),
        },
        {
          title: intl.get(`${commonPrompt}.sourceNum`).d('来源单据'),
          dataIndex: 'sourceNum',
          width: 140,
          render: (val, record) => (
            <span>
              <a onClick={() => this.handleChangeVisible(true, record)}>
                {intl.get(`${commonPrompt}.viewSource`).d('查看来源')}
              </a>
              {record.deductionRelationNumber > 0 && (
                <Tag
                  color="#108ee9"
                  style={{
                    height: 'auto',
                    lineHeight: '15px',
                    marginLeft: '4px',
                  }}
                >
                  {record.deductionRelationNumber}
                </Tag>
              )}
            </span>
          ),
        },
        {
          title: intl.get(`${commonPrompt}.remark`).d('扣款说明'),
          dataIndex: 'remark',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.attachmentUuid`).d('附件'),
          dataIndex: 'attachmentUuid',
          width: 100,
          render: (val, record) => (
            <FormItem>
              {record.$form.getFieldDecorator(`attachmentUuid`, {
                initialValue: record.attachmentUuid,
              })(
                <UploadModal
                  attachmentUUID={record.attachmentUuid}
                  onUploadSuccess={(...args) => this.successUuid(record, ...args)}
                  {...uploadProps}
                />
              )}
            </FormItem>
          ),
        },
        {
          title: intl.get(`${commonPrompt}.useFlag`).d('是否被引用'),
          dataIndex: 'useFlagMeaning',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.billNum`).d('关联开票申请单'),
          dataIndex: 'billNum',
          width: 140,
        },
        {
          title: intl.get(`${commonPrompt}.invoiceNum`).d('关联网上发票'),
          dataIndex: 'invoiceNum',
          width: 140,
        },
        {
          title: intl.get(`${commonPrompt}.createByName`).d('创建人'),
          dataIndex: 'createByName',
          width: 100,
        },
        {
          title: intl.get(`${commonPrompt}.history`).d('操作记录'),
          dataIndex: 'history',
          width: 100,
          render: (_, record) => {
            return (
              record.supplierDeductionsId && (
                <a onClick={() => this.openOperationRecord(record)}>
                  {intl.get(`${commonPrompt}.history`).d('操作记录')}
                </a>
              )
            );
          },
        },
      ],
      loading,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'supplierDeductionsId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };

    return (
      <React.Fragment>
        {customizeTable(
          { code: 'SFIN.RECEIVED_DEDUCTION_LIST.GRID' },
          <EditTable {...tableProps} />
        )}
        {recordModal && <HistoryList {...operationRecordProps} />}
        {sourceVisible && <SearchDrawer {...sourceRecordProps} />}
      </React.Fragment>
    );
  }
}
