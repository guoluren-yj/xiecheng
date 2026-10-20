/**
 * OUMessage - OU层信息详细数据
 * @date: 2019-12-11
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import Lov from 'components/Lov';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Button, Form, Input, DatePicker, InputNumber, Select } from 'hzero-ui';
import { isEmpty, isUndefined, isNull, sum, isNumber } from 'lodash';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
// import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
} from 'utils/utils';

import styles from '@/routes/index.less';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.supplierInform', 'spfm.importErp'],
})
@connect(({ supplierInform, loading }) => ({
  supplierInform,
  ouloading:
    loading.effects['supplierInform/fetchOUMessage'] ||
    loading.effects['supplierInform/saveOUMessage'],
  tenantId: getCurrentOrganizationId(),
}))
export default class OUMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMsg: undefined,
    };
  }

  componentDidMount() {
    this.fetchOUMessage();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        isShowOrderPage: false,
      },
    });
  }

  // OU信息查询
  @Bind()
  fetchOUMessage(page = {}) {
    const { modalRecord } = this.props;
    const { supChangeAddId } = modalRecord;
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierInform/fetchOUMessage',
      payload: {
        page,
        supChangeAddId,
      },
    });
  }

  /**
   * 新增OUMessage
   */
  @Bind()
  handleOUMessage() {
    const {
      dispatch,
      modalRecord,
      newModalData,
      supplierInform: { ouMessageList = [], ouMessagePagination = {} },
    } = this.props;
    const { supChangeAddId } = modalRecord;
    const { changeReqId } = newModalData;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        ouMessageList: [
          {
            _status: 'create',
            supChangeOuId: uuidv4(),
            supChangeAddId,
            changeReqId,
          },
          ...ouMessageList,
        ],
        ouMessagePagination: addItemToPagination(ouMessageList.length, ouMessagePagination),
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      supplierInform: { ouMessageList = [], ouMessagePagination = {} },
    } = this.props;
    const newOuMessageList = getEditTableData(ouMessageList, ['supChangeOuId']);
    if (ouMessageList && ouMessageList.length > 0) {
      // 校验必填信息
      const invalidMessageList = ouMessageList.filter(item => {
        return item._status === 'create' || item._status === 'update';
      });
      if (
        invalidMessageList &&
        invalidMessageList.length > 0 &&
        (!newOuMessageList || newOuMessageList.length === 0)
      ) {
        this.setState({
          errorMsg: intl
            .get(`spfm.importErp.view.message.validation.warning`)
            .d('必输字段不能为空!'),
        });
      } else {
        this.setState({
          errorMsg: undefined,
        });
      }
    }
    if (newOuMessageList && newOuMessageList.length > 0) {
      const OuMessageList = newOuMessageList.map(item => {
        const { expirationDate } = item;
        const newExpirationDate =
          isUndefined(expirationDate) || isNull(expirationDate) || isEmpty(expirationDate)
            ? ''
            : expirationDate.format(DEFAULT_DATETIME_FORMAT);
        return {
          ...item,
          expirationDate: newExpirationDate,
        };
      });
      dispatch({
        type: 'supplierInform/saveOUMessage',
        payload: OuMessageList,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchOUMessage(ouMessagePagination);
        }
      });
    }
  }

  /**
   * 清除
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      supplierInform: { ouMessageList = [], ouMessagePagination },
    } = this.props;
    const newOuMessageList = ouMessageList.filter(n => n.supChangeOuId !== record.supChangeOuId);
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        ouMessageList: newOuMessageList,
        ouMessagePagination: delItemToPagination(ouMessageList.length, ouMessagePagination),
      },
    });
  }

  /**
   * 批量编辑行
   * @param {object} record 每行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      supplierInform: { ouMessageList = [] },
      dispatch,
    } = this.props;
    const newOuMessageList = ouMessageList.map(item =>
      record.supChangeOuId === item.supChangeOuId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: 'supplierInform/updateState',
      payload: { ouMessageList: newOuMessageList },
    });
  }

  /**
   * 取消编辑行
   * @param {object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      supplierInform: { ouMessageList = [] },
      dispatch,
    } = this.props;
    const newOuMessageList = ouMessageList.map(item => {
      if (item.supChangeOuId === record.supChangeOuId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'supplierInform/updateState',
      payload: { ouMessageList: newOuMessageList },
    });
  }

  render() {
    const {
      ouloading,
      supplierInform: {
        detailHeader = {},
        ouMessageList = [],
        ouMessagePagination = {},
        billPeriodMap = [],
      },
      newModalData: { changFlag, pubEdit, savePermissionFlag },
    } = this.props;
    const {
      tenantId,
      companyId,
      spfmCompanyId,
      supplierCompanyId,
      spfmSupplierCompanyId,
      supplierTenantId,
    } = detailHeader;
    const createDate = moment().format(DEFAULT_DATE_FORMAT);
    const columns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.OULayer').d('OU层'),
        width: 140,
        dataIndex: 'ouName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('ouId', {
                  initialValue: record.ouId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.OULayer`)
                          .d('OU层'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.OU"
                    textValue={val}
                    disabled={changFlag}
                    lovOptions={{ displayField: 'ouName', valueField: 'ouId' }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.billPeriod').d('账期'),
        width: 200,
        dataIndex: 'billPeriodMeaning',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('billPeriod', {
                  initialValue: record.billPeriod,
                })(
                  <Select allowClear disabled={changFlag} style={{ width: '100%' }}>
                    {billPeriodMap.map(n => (
                      <Option value={n.value} key={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
        width: 120,
        dataIndex: 'typeName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('typeCode', {
                  initialValue: record.typeCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.payMethod`)
                          .d('付款方式'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.PAYMENT_TYPE"
                    textValue={val}
                    disabled={changFlag}
                    lovOptions={{ displayField: 'typeName', valueField: 'typeCode' }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.ticketDay').d('票据天数'),
        width: 120,
        dataIndex: 'ticketDay',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('ticketDay', {
                  initialValue: record.ticketDay,
                })(<InputNumber min={0} max={500} disabled={changFlag} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条件'),
        width: 160,
        dataIndex: 'termName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <React.Fragment>
                <Form.Item style={{ display: 'none' }}>
                  {record.$form.getFieldDecorator('termId', {
                    initialValue: record.termId,
                  })(<div />)}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator('termCode', {
                    initialValue: record.termCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.supplierInform.model.supplierInform.termName`)
                            .d('付款条件'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SSLM.PAYMENT.TERM"
                      textValue={val}
                      disabled={changFlag}
                      lovOptions={{ displayField: 'termName', valueField: 'termCode' }}
                      queryParams={{ tenantId }}
                      onChange={(_, lovRecord) => {
                        if (isUndefined(_)) {
                          record.$form.setFieldsValue({
                            termId: '',
                            termName: '',
                          });
                        } else {
                          record.$form.setFieldsValue({
                            termId: lovRecord.termId,
                            termName: lovRecord.termName,
                          });
                        }
                      }}
                    />
                  )}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankCode').d('银行代码'),
        width: 120,
        dataIndex: 'bankCode',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            getFieldDecorator('bankCode', { initialValue: val });
            return (
              <Form.Item>
                {getFieldDecorator('id', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierInform.model.supplierInform.bankCode')
                          .d('银行代码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.BANK_ACCOUNT"
                    queryParams={{
                      companyId,
                      partnerCompanyId: supplierCompanyId,
                      partnerTenantId: supplierTenantId,
                      spfmPartnerCompanyId: spfmSupplierCompanyId,
                      tenantId,
                      spfmCompanyId,
                      enableFlag: 1,
                    }}
                    disabled={changFlag}
                    lovOptions={{ displayField: 'bankCode', valueField: 'id' }}
                    textValue={val}
                    onChange={(value, lovRecord) => {
                      setFieldsValue({
                        bankCode: lovRecord.bankCode,
                        bankName: lovRecord.bankName,
                        bankAccountNum: lovRecord.bankAccountNum,
                        bankBranchName: lovRecord.bankBranchName,
                        bankAccountName: lovRecord.bankAccountName,
                        bankFirm: lovRecord.bankFirm,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankName').d('银行名称'),
        width: 160,
        dataIndex: 'bankName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('bankName', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.bankFirm').d('联行行号'),
        width: 160,
        dataIndex: 'bankFirm',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('bankFirm', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.depositBank').d('开户行名称'),
        width: 160,
        dataIndex: 'bankBranchName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('bankBranchName', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.accountkName`).d('账户名称'),
        width: 160,
        dataIndex: 'bankAccountName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('bankAccountName', {
                initialValue: val,
              })(<Input disabled dbc2sbc={false} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spfm.importErp.model.importErp.bankAccountNum').d('银行账户'),
        width: 160,
        dataIndex: 'bankAccountNum',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('bankAccountNum', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.taxRate').d('税率'),
        width: 120,
        dataIndex: 'taxRate',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('taxId', {
                  initialValue: record.taxId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.taxRate`)
                          .d('税率'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPRM.TAX"
                    disabled={changFlag}
                    tenantId={getCurrentOrganizationId()}
                    textValue={
                      record._status === 'update' ? val : record.$form.getFieldValue('taxRate')
                    }
                    lovOptions={{ displayField: 'taxRate', valueField: 'taxId' }}
                    onChange={(lovVal, lovRecord) => {
                      setFieldsValue({
                        taxRate: lovRecord.taxRate,
                        taxId: lovVal,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.currencyName').d('币种'),
        width: 120,
        dataIndex: 'currencyName',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('currencyCode', {
                  initialValue: record.currencyCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sslm.supplierInform.model.supplierInform.currencyName`)
                          .d('币种'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.CURRENCY"
                    queryParams={{ tenantId }}
                    textValue={val}
                    disabled={changFlag}
                    lovOptions={{ displayField: 'currencyName', valueField: 'currencyCode' }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.layerCreationDate')
          .d('层创建日期'),
        width: 120,
        dataIndex: 'creationDate',
        render: (val, record) => {
          if (['create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('creationDate', {
                  initialValue: createDate ? moment(createDate, DEFAULT_DATE_FORMAT) : null,
                })(<DatePicker disabled />)}
              </Form.Item>
            );
          } else {
            return dateRender(val);
          }
        },
      },
      {
        title: intl
          .get('sslm.supplierInform.model.supplierInform.layerExpirationDate')
          .d('层失效日期'),
        width: 130,
        dataIndex: 'expirationDate',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('expirationDate', {
                  initialValue: !isUndefined(record.expirationDate)
                    ? moment(record.expirationDate)
                    : moment('9999-12-31'),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierInform.model.supplierInform.layerExpirationDate')
                          .d('层失效日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    allowClear
                    style={{ width: '100%' }}
                    format={DEFAULT_DATE_FORMAT}
                    placeholder={null}
                    disabled={changFlag}
                    disabledDate={currentDate =>
                      getFieldValue('createDate')
                        ? getFieldValue('createDate') &&
                          moment(getFieldValue('createDate')).isAfter(currentDate, 'day')
                        : moment() && moment().isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return dateRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 80,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.handleDeleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                disabled={pubEdit ? !pubEdit : changFlag || !savePermissionFlag}
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    const errMsg = this.state.errorMsg;
    return (
      <React.Fragment>
        <div className={styles['table-list-btn']}>
          <span id="errorMsg" style={{ color: 'red', fontSize: '16px', marginRight: '680px' }}>
            {errMsg}
          </span>
          <Button
            loading={ouloading}
            onClick={this.handleSave}
            style={{
              display: pubEdit
                ? !pubEdit
                : changFlag || !savePermissionFlag
                ? 'none'
                : 'inline-block',
            }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            loading={ouloading}
            style={{ display: changFlag || !savePermissionFlag ? 'none' : 'inline-block' }}
            onClick={this.handleOUMessage}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable
          bordered
          loading={ouloading}
          rowKey="supChangeOuId"
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={ouMessageList}
          pagination={ouMessagePagination}
          onChange={this.fetchOUMessage}
        />
      </React.Fragment>
    );
  }
}
