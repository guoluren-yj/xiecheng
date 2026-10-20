import React from 'react';
import { Form, Tag, Select, InputNumber, Tooltip, DatePicker } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import { sum } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { getDateFormat } from 'utils/utils';
import UploadModal from '_components/Upload/index';
import Lov from 'components/Lov';

import { thousandBitSeparator } from '@/routes/utils';
import SearchDrawer from '../components/SourceComponent'; // 引入抽屉面板
import HistoryList from '../components/SupplierActionHistory';

const FormItem = Form.Item;
const { Option } = Select;

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

  @Bind()
  handleOnChangeCommon(val, list, record, flag) {
    const { setFieldsValue, registerField } = record.$form;
    if (flag === 'supplier') {
      registerField('supplierId');
      if (!val) {
        setFieldsValue({
          companyId: null,
          accountSubjectNum: null,
          ouId: null,
        });
      } else {
        if (!list.erpSupplierNum) {
          setFieldsValue({
            erpSupplierNum: list.supplierNum,
          });
        }
        setFieldsValue({
          supplierId: list.supplierId,
        });
      }
    }
    if (flag === 'company') {
      if (!val) {
        setFieldsValue({
          ouId: null,
          accountSubjectNum: null,
        });
      }
    }
    if (flag === 'ouName') {
      if (!val) {
        setFieldsValue({
          accountSubjectNum: null,
        });
      }
    }
  }

  @Bind()
  // 通过税率计算
  handleTaxRateValue(val, dataList, record) {
    const { amountEditFlag } = this.props;
    const { taxRate = 0 } = dataList; // 获取当前税率
    const initAmount = record.$form.getFieldValue('amount'); // 获取当前不含税扣款金额 amount
    const initIncludedAmount = record.$form.getFieldValue('taxIncludedAmount'); // 获取当前含税金额 taxIncludedAmount
    if (initAmount && initIncludedAmount) {
      // 反算
      // const amount = (
      //   initIncludedAmount /
      //   (1 + (taxRate !== undefined ? taxRate : 0) / 100)
      // ).toFixed(2);
      // const taxIncludedAmount = (initAmount * (1 + taxRate / 100)).toFixed(2); // 含税金额
      // const taxAmount = (
      //   (amountEditFlag ? initAmount : amount) * (taxRate !== undefined ? taxRate / 100 : 0)
      // ).toFixed(2); // 计算出的税额
      // 修复按2位金额计算
      const initIncludedAmountDivRate = math.plus(1, math.div(taxRate, 100));
      const amount = math.div(initIncludedAmount, initIncludedAmountDivRate);
      const taxIncludedAmount = math.multipliedBy(initAmount, initIncludedAmountDivRate); // 含税金额
      const amountEditAmount = amountEditFlag ? initAmount : amount;
      const taxAmount = math.multipliedBy(amountEditAmount, math.div(taxRate, 100)); // 计算出的税额
      record.$form.setFieldsValue({
        taxAmount,
        amount: amountEditFlag ? initAmount : amount,
        taxIncludedAmount: amountEditFlag ? taxIncludedAmount : initIncludedAmount,
      });
    }
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */

  @Bind()
  handleDefault(value, record) {
    const { setFieldsValue } = record.$form;
    if (value === 'INVOICE_DEDUCTION') {
      setFieldsValue({ ticketDeductionFlag: 1 });
    } else {
      setFieldsValue({ ticketDeductionFlag: 0 });
    }
  }

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
      handleRecordChange,
      handerSubjectNum,
      onRowSelectChange = e => e,
      tenantId,
      enumMap,
      customizeTable,
    } = this.props;
    const { bank = [], paymentMethod = [] } = enumMap;
    const { recordModal, data, sourceVisible, sourceData } = this.state;
    const selectedRowKeys = selectedRows.map(item => item.supplierDeductionsId);
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
          title: intl.get(`${commonPrompt}.deductionsNum`).d('扣款单号'),
          dataIndex: 'deductionsNum',
          width: 140,
          fixed: 'left',
        },
        {
          title: intl.get(`${commonPrompt}.syncStatus`).d('导入状态'),
          dataIndex: 'syncStatusMeaning',
          width: 100,
          fixed: 'left',
        },
        {
          title: intl.get(`${commonPrompt}.syncResponseMsg`).d('错误消息'),
          dataIndex: 'syncResponseMsg',
          width: 100,
          fixed: 'left',
        },
        {
          title: intl.get(`${commonPrompt}.erpDeductionNum`).d('扣款凭证'),
          dataIndex: 'erpDeductionNum',
          width: 100,
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
          title: intl.get(`${commonPrompt}.remberDate`).d('记账日期'),
          dataIndex: 'billingDate',
          width: 180,
          render: (val, record) =>
            record.syncStatus === 'SYNC_FAILURE' ? (
              <FormItem>
                {record.$form.getFieldDecorator(`billingDate`, {
                  initialValue:
                    (record.billingDate && moment(record.billingDate)) || moment(new Date()),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.remberDate`).d('记账日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    format={getDateFormat()}
                    onChange={(text, values) => {
                      handleRecordChange(record, values);
                    }}
                    placeholder={null}
                  />
                )}
              </FormItem>
            ) : (
              dateRender(val)
            ),
        },
        {
          title: intl.get(`${commonPrompt}.accountSubjectNum`).d('总账科目编码'),
          dataIndex: 'accountSubjectNum',
          width: 180,
          render: (val, record) =>
            record.syncStatus === 'SYNC_FAILURE' ? (
              <FormItem>
                {record.$form.getFieldDecorator(`accountSubjectNum`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.accountSubjectNum`).d('总账科目编码'),
                      }),
                    },
                  ],
                  initialValue: record.accountSubjectNum,
                })(
                  <Lov
                    code="SPUC.ACCOUNT_SUBJECT"
                    textValue={record.accountSubjectNum}
                    lovOptions={{
                      displayField: 'accountSubjectNum',
                      valueField: 'accountSubjectNum',
                    }}
                    // disabled={!record.$form.getFieldValue('ouId')}
                    queryParams={{
                      tenantId,
                      companyId: record.companyId,
                      ouId: record.ouId,
                    }}
                    onChange={(text, values) => {
                      handleRecordChange(record, values);
                      handerSubjectNum(text, record, values);
                      this.handleOnChangeCommon(text, values, record, 'subject');
                    }}
                  />
                )}
              </FormItem>
            ) : (
              val
            ),
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
          render: (val, record) =>
            record.syncStatus === 'SYNC_FAILURE' ? (
              <FormItem>
                {record.$form.getFieldDecorator(`debitCreditCode`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.debitCreditCode`).d('借贷方'),
                      }),
                    },
                  ],
                  initialValue: record.debitCreditCode,
                })(
                  <Select
                    style={{ width: '100%' }}
                    onChange={() => handleRecordChange(record)}
                    allowClear
                  >
                    {bank.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            ) : (
              record.debitCreditCodeMeaning
            ),
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
          render: (val, record) =>
            record.syncStatus === 'SYNC_FAILURE' ? (
              <React.Fragment>
                <FormItem>
                  {record.$form.getFieldDecorator(`taxId`, {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.taxRate`).d('税率%'),
                        }),
                      },
                    ],
                    initialValue: record.taxId,
                  })(
                    <Lov
                      code="SPCM.TAX"
                      textValue={record.taxRate}
                      queryParams={{ tenantId }}
                      onChange={(value, dataList) => {
                        handleRecordChange(record);
                        this.handleTaxRateValue(value, dataList, record);
                        record.$form.setFieldsValue({
                          taxRate: dataList.taxRate,
                        });
                      }}
                    />
                  )}
                </FormItem>
                <FormItem style={{ display: 'none' }}>
                  {record.$form.getFieldDecorator(`taxRate`, {
                    initialValue: record.taxRate,
                  })(<div />)}
                </FormItem>
              </React.Fragment>
            ) : (
              record.taxRate
            ),
        },
        {
          title: intl.get(`${commonPrompt}.taxAmount`).d('税额'),
          dataIndex: 'taxAmount',
          width: 150,
          render: (val, record) =>
            record.syncStatus === 'SYNC_FAILURE' ? (
              <FormItem>
                {record.$form.getFieldDecorator(`taxAmount`, {
                  initialValue: record.taxAmount,
                })(<InputNumber disabled onChange={() => handleRecordChange(record)} />)}
              </FormItem>
            ) : (
              // val

              thousandBitSeparator(val, record.amountPrecision) || 0
            ),
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
          title: intl.get(`${commonPrompt}.taxIncludedAmount`).d('含税扣款额'),
          dataIndex: 'taxIncludedAmount',
          width: 150,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.costDealWayCode`).d('费用处理方式'),
          dataIndex: 'costDealWayCode',
          width: 150,
          render: (val, record) =>
            record.syncStatus === 'SYNC_FAILURE' ? (
              <FormItem>
                {record.$form.getFieldDecorator(`costDealWayCode`, {
                  initialValue: record.costDealWayCode,
                })(
                  <Select
                    onChange={e => {
                      handleRecordChange(record);
                      this.handleDefault(e, record);
                    }}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {paymentMethod.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            ) : (
              record.costDealWayCodeMeaning
            ),
        },
        {
          title: (
            <Tooltip
              title={intl
                .get(`sfin.supplierChargeEntry.model.tipFlag`)
                .d('是否票扣为是,为空时,扣款单可在对账时被引用')}
              placement="topLeft"
            >
              {intl.get(`${commonPrompt}.tickFlag`).d('是否票扣')}
            </Tooltip>
          ),
          dataIndex: 'ticketDeductionFlag',
          width: 150,
          render: (val, record) =>
            record.syncStatus === 'SYNC_FAILURE' ? (
              <FormItem>
                {record.$form.getFieldDecorator(`ticketDeductionFlag`, {
                  initialValue: record.ticketDeductionFlag,
                })(
                  <Select
                    style={{ width: '100%' }}
                    allowClear
                    onChange={() => handleRecordChange(record)}
                  >
                    <Option value={0}>{intl.get('hzero.common.status.no').d('否')}</Option>
                    <Option value={1}>{intl.get('hzero.common.status.yes').d('是')}</Option>
                  </Select>
                )}
              </FormItem>
            ) : (
              yesOrNoRender(val)
            ),
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
      onChange: page => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) + 300 };

    return (
      <React.Fragment>
        {customizeTable({ code: 'SFIN.SUPPLIER_SYNC.LIST' }, <EditTable {...tableProps} />)}
        {recordModal && <HistoryList {...operationRecordProps} />}
        {sourceVisible && <SearchDrawer {...sourceRecordProps} />}
      </React.Fragment>
    );
  }
}
