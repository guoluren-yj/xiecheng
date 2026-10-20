import React from 'react';
import { Form, Tag, InputNumber } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';

import { sum } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import UploadModal from '_components/Upload/index';

import SearchDrawer from '../components/SourceComponent'; // 引入抽屉面板
import HistoryList from '../components/SupplierActionHistory';
import { thousandBitSeparator, precisionNum } from '@/routes/utils';

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

    const uploadProps = {
      icon: false,
      viewOnly: true,
      btnText: intl.get('entity.attachment.view').d('附件查看'),
      showFilesNumber: true,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sfin-supplier',
    };
    const sourceRecordProps = {
      dispatch,
      visible: sourceVisible,
      data: sourceData,
      handleChangeVisible: this.handleChangeVisible,
      onRef: this.sourceRef,
      routePrefix: 'supplier-deduction-query', // 扣款查询前缀
      sourcePage: 'purchase', // 采购方
      routeSourceFlag: 'supplier-deduction-query',
      // hideModal: this.hideOperationRecord,
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
          title: intl.get(`${commonPrompt}.syncStatus`).d('导入状态'),
          dataIndex: 'syncStatusMeaning',
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
          title: intl.get(`${commonPrompt}.supplierNum`).d('供应商编码'),
          dataIndex: 'supplierCompanyNum',
          width: 200,
          render: (val, record) => record.erpSupplierName || val,
        },
        {
          title: intl.get(`${commonPrompt}.supplierName`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.companyName`).d('公司'),
          dataIndex: 'companyId',
          width: 150,
          render: (_, record) => record.companyName,
        },
        {
          title: intl.get(`${commonPrompt}.businessEntity`).d('业务实体'),
          dataIndex: 'ouId',
          width: 150,
          render: (_, record) => record.ouName,
        },
        {
          title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 150,
          render: (_, record) => record.currencyCode,
        },
        {
          title: intl.get(`${commonPrompt}.billingDate`).d('记账日期'),
          dataIndex: 'billingDate',
          width: 150,
          sorter: true,
          render: (val) => dateRender(val),
        },
        {
          title: intl.get(`${commonPrompt}.accountSubjectNum`).d('总账科目编码'),
          dataIndex: 'generalLedgerId',
          width: 180,
          render: (_, record) => record.accountSubjectNum,
        },
        {
          title: intl.get(`${commonPrompt}.accountSubjectName`).d('总账科目名称'),
          dataIndex: 'accountSubjectName',
          width: 180,
        },
        {
          title: intl.get(`${commonPrompt}.debitCreditCode`).d('借贷方'),
          dataIndex: 'debitCreditCode',
          width: 150,
          render: (_, record) => record.debitCreditCodeMeaning,
        },
        {
          title: intl.get(`${commonPrompt}.amount`).d('不含税扣款额'),
          dataIndex: 'amount',
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.taxRate`).d('税率(%)'),
          dataIndex: 'taxId',
          width: 150,
          render: (_, record) => record.taxRate,
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
          width: 200,
          render: (val, record) =>
            record.ticketDeductionFlag === 0 && record.statusCode === 'CONFIRMED' ? (
              <FormItem FormItem>
                {record.$form.getFieldDecorator(`relationAmount`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.relationAmount`).d('已扣款额'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => {
                        const { taxIncludedAmount = null } = record;
                        const currentLength = math.dp(value);

                        if (currentLength > record.amountPrecision) {
                          callback(intl.get(`${commonPrompt}.msgError`).d(`精度校验不通过`));
                        }
                        if (
                          (+taxIncludedAmount > 0 &&
                            record.$form.getFieldValue('relationAmount') < 0) ||
                          (+taxIncludedAmount < 0 &&
                            record.$form.getFieldValue('relationAmount') > 0)
                        ) {
                          callback(
                            new Error(
                              intl.get(`${commonPrompt}.same`).d('已扣款额和含税扣款额同号 ')
                            )
                          );
                        } else if (
                          (+taxIncludedAmount > 0 &&
                            +taxIncludedAmount < record.$form.getFieldValue('relationAmount')) ||
                          (+taxIncludedAmount < 0 &&
                            +taxIncludedAmount > record.$form.getFieldValue('relationAmount'))
                        ) {
                          callback(
                            new Error(
                              intl
                                .get(`${commonPrompt}.less`)
                                .d('已扣款额的绝对值需小于含税扣款额的绝对值')
                            )
                          );
                        } else if (record.$form.getFieldValue('relationAmount') === 0) {
                          callback(
                            new Error(intl.get(`${commonPrompt}.notZero`).d('已扣款额的值不能为0'))
                          );
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                  initialValue: record.relationAmount,
                })(
                  <InputNumber
                    precision={precisionNum(val, record, 'relationAmount')}
                    // {...precisionParams(val, true)}
                    allowThousandth
                  />
                )}
              </FormItem>
            ) : (
              // val
              thousandBitSeparator(val, record.amountPrecision) || 0
            ),
        },
        {
          title: intl.get(`${commonPrompt}.taxIncludedAmount`).d('含税扣款额'),
          dataIndex: 'taxIncludedAmount',
          width: 150,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.costDealWayCode`).d('费用处理方式'),
          dataIndex: 'costDealWayCode',
          width: 150,
          render: (_, record) => record.costDealWayCodeMeaning,
        },
        {
          title: intl.get(`${commonPrompt}.ticketDeductionFlag`).d('是否票扣'),
          dataIndex: 'ticketDeductionFlag',
          width: 150,
          render: (val) => yesOrNoRender(val),
        },
        {
          title: intl.get(`${commonPrompt}.erpDeductionNum`).d('扣款凭证'),
          dataIndex: 'erpDeductionNum',
          width: 150,
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
          title: intl.get(`${commonPrompt}.isUseFlag`).d('是否被引用'),
          dataIndex: 'useFlag',
          width: 150,
          render: (_, record) => record.useFlagMeaning,
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
          title: intl.get(`${commonPrompt}.sourceNum`).d('来源单据'),
          dataIndex: 'sourceNum',
          width: 140,
          render: (val, record) =>
            record.deductionsNum ? (
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
                {/* <span style={{ color: 'red' }}>{record.deductionRelationNumber}</span> */}
              </span>
            ) : null,
        },
        {
          title: intl.get(`${commonPrompt}.createByName`).d('创建人'),
          dataIndex: 'createByName',
          width: 100,
        },
        {
          title: intl.get(`${commonPrompt}.sourceCode`).d('数据来源'),
          dataIndex: 'sourceCode',
          width: 100,
          render: (_, record) => record.sourceCodeMeaning,
        },
        {
          title: intl.get(`${commonPrompt}.history`).d('操作记录'),
          dataIndex: 'operating',
          width: 100,
          // fixed: 'right',
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
      onChange: onSearch,
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };

    return (
      <React.Fragment>
        {customizeTable({ code: 'SFIN.SUPPLIER_QUERY.LIST' }, <EditTable {...tableProps} />)}
        {recordModal && <HistoryList {...operationRecordProps} />}
        {sourceVisible && <SearchDrawer {...sourceRecordProps} />}
      </React.Fragment>
    );
  }
}
