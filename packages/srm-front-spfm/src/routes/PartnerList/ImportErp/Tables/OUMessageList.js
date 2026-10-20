/**
 * OUMessageList - OU层信息
 * @date: 2019-12-20
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import React, { Component } from 'react';
import { Bind, Debounce } from 'lodash-decorators';
import queryString from 'querystring';
import { isEmpty, isNull, isUndefined, sum, isNumber } from 'lodash';
import { Button, Form, Input, DatePicker, InputNumber, Select, Modal } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  getCurrentOrganizationId,
} from 'utils/utils';

import withCustomize from 'srm-front-cuz/lib/index';
import { Button as PermissionButton } from 'components/Permission';

import styles from '@/routes/PartnerList/index.less';

const { Option } = Select;

@withCustomize({
  unitCode: ['SPFM.PARTNER_LIST_IMPORT_EBS.OU'],
})
@connect(({ importErp, loading }) => ({
  importErp,
  loading: loading.effects['importErp/queryOUMessage'],
  saving: loading.effects['importErp/saveOUMessage'],
}))
@formatterCollections({ code: 'spfm.importErp' })
export default class OUMessageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMsg: undefined,
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    const {
      importErp: { OuMessagePagination = {} },
    } = this.props;
    this.handleSearch(OuMessagePagination);
  }

  componentWillUnmount() {
    this.closeSearch();
  }

  /**
   * 供应商OU信息查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      modalRecord: { supplierSyncEbsAddrId },
      newModalData: { supplierSyncEbsId },
    } = this.props;
    dispatch({
      type: 'importErp/queryOUMessage',
      payload: {
        page,
        supplierSyncEbsAddrId,
        supplierSyncEbsId,
        customizeUnitCode: 'SPFM.PARTNER_LIST_IMPORT_EBS.OU',
      },
    });
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'importErp/updateState',
      payload: {
        OuMessagePagination: {},
        OUMessageList: [], // 缓存的数据要清空
      },
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const {
      dispatch,
      newModalData: { supplierSyncEbsId },
      modalRecord: { supplierSyncEbsAddrId },
      importErp: { OuMessageList = [], OuMessagePagination = {} },
    } = this.props;
    dispatch({
      type: 'importErp/updateState',
      payload: {
        OuMessageList: [
          {
            _status: 'create',
            supplierSyncEbsOuId: uuidv4(),
            addressId: supplierSyncEbsAddrId,
            tenantId: getCurrentOrganizationId(),
            supplierSyncEbsId,
          },
          ...OuMessageList,
        ],
        OuMessagePagination: addItemToPagination(OuMessageList.length, OuMessagePagination),
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
      importErp: { OuMessageList = [], OuMessagePagination = {} },
    } = this.props;
    const newOuMessageList = getEditTableData(OuMessageList, ['_status', 'supplierSyncEbsOuId']);
    if (OuMessageList && OuMessageList.length > 0) {
      // 校验必填信息
      const invalidMessageList = OuMessageList.filter(item => {
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
    if (isEmpty(newOuMessageList)) return;
    const ouMessageList = newOuMessageList.map(item => {
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
      type: 'importErp/saveOUMessage',
      payload: ouMessageList,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(OuMessagePagination);
      }
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleDeleteRow(record) {
    const {
      dispatch,
      importErp: { OuMessageList = [], OuMessagePagination = {} },
    } = this.props;
    const newOuMessageList = OuMessageList.filter(
      n => n.supplierSyncEbsOuId !== record.supplierSyncEbsOuId
    );
    dispatch({
      type: 'importErp/updateState',
      payload: {
        OuMessageList: newOuMessageList,
        OuMessagePagination: delItemToPagination(OuMessageList.length, OuMessagePagination),
      },
    });
  }

  /**
   * 编辑行
   * @param {Object} record 行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      dispatch,
      importErp: { OuMessageList = [] },
    } = this.props;
    const OuMessagePagination = OuMessageList.map(item =>
      item.supplierSyncEbsOuId === record.supplierSyncEbsOuId
        ? { ...item, _status: 'update' }
        : item
    );
    dispatch({
      type: 'importErp/updateState',
      payload: { OuMessageList: OuMessagePagination },
    });
  }

  /**
   * 取消编辑行
   * @param {Object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      dispatch,
      importErp: { OuMessageList = [] },
    } = this.props;
    const OuMessagePagination = OuMessageList.map(item => {
      if (item.supplierSyncEbsOuId === record.supplierSyncEbsOuId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'importErp/updateState',
      payload: { OuMessageList: OuMessagePagination },
    });
  }

  /**
   * 勾选框处理函数
   * @param selectedRowKeys
   * @param selectedRows
   */
  @Bind()
  selectedRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 删除按钮处理逻辑
   */
  @Bind()
  @Debounce(200)
  handleDelete() {
    const { selectedRowKeys, selectedRows } = this.state;
    const createData = selectedRows.filter(item => item._status === 'create');
    if (createData.length) {
      notification.warning({
        message: intl.get('spfm.importErp.view.message.shouldSave').d('请先保存数据后再删除！'),
      });
      return false;
    }
    if (selectedRowKeys.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.deleteChooseRecord').d('是否删除选中记录？'),
        okType: 'danger',
        onOk: () => {
          const { dispatch } = this.props;
          dispatch({
            type: 'importErp/deleteEbsOuId',
            payload: {
              supplierSyncEbsOuId: selectedRowKeys,
            },
          }).then(res => {
            if (!(res && res.failed)) {
              notification.success();
            }
            this.setState({
              selectedRowKeys: [],
              selectedRows: [],
            });
            const {
              importErp: { OuMessagePagination = {} },
            } = this.props;
            this.handleSearch(OuMessagePagination);
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
    }
  }

  /**
   * render查询表单
   */
  render() {
    const {
      loading,
      saving,
      customizeTable = () => {},
      importErp: {
        OuMessageList = [],
        OuMessagePagination = {},
        code: { billPeriodMap = [] },
      },
      newModalData: {
        companyId,
        partnerCompanyId,
        partnerTenantId,
        spfmCompanyId,
        spfmPartnerCompanyId,
        tenantId,
        isDisabled,
      },
    } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    const createDate = moment().format(DEFAULT_DATE_FORMAT);
    const isSave = OuMessageList.filter(o => o._status === 'create' || o._status === 'update');
    const columns = [
      {
        title: intl.get('spfm.importErp.model.importErp.OULayer').d('OU层'),
        width: 160,
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
                        name: intl.get('spfm.importErp.model.importErp.OULayer').d('OU层'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.OU"
                    textValue={val}
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
        title: intl.get('spfm.importErp.model.importErp.billPeriod').d('账期'),
        width: 180,
        dataIndex: 'billPeriodMeaning',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('billPeriod', {
                  initialValue: record.billPeriod,
                })(
                  <Select allowClear style={{ width: '100%' }}>
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
        title: intl.get('spfm.importErp.model.importErp.payMethod').d('付款方式'),
        width: 160,
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
                        name: intl.get('spfm.importErp.model.importErp.payMethod').d('付款方式'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.PAYMENT_TYPE"
                    textValue={val}
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
        title: intl.get('spfm.importErp.model.importErp.ticketDay').d('票据天数'),
        width: 140,
        dataIndex: 'ticketDay',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('ticketDay', {
                  initialValue: record.ticketDay,
                })(<InputNumber min={0} max={500} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.termName').d('付款条件'),
        width: 140,
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
                          name: intl.get(`spfm.importErp.model.importErp.termName`).d('付款条件'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SSLM.PAYMENT.TERM"
                      textValue={val}
                      queryParams={{ tenantId }}
                      lovOptions={{ displayField: 'termName', valueField: 'termCode' }}
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
        title: intl.get('spfm.importErp.model.importErp.bankCode').d('银行代码'),
        width: 160,
        dataIndex: 'bankCode',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue } = record.$form;
            getFieldDecorator('bankCode', { initialValue: val });
            return (
              <Form.Item>
                {getFieldDecorator('id', {
                  initialValue: record.bankCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.importErp.model.importErp.bankCode').d('银行代码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSLM.BANK_ACCOUNT"
                    queryParams={{
                      companyId,
                      partnerCompanyId,
                      partnerTenantId,
                      spfmPartnerCompanyId,
                      tenantId,
                      spfmCompanyId,
                      enableFlag: 1,
                    }}
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
        title: intl.get('spfm.importErp.model.importErp.bankName').d('银行名称'),
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
        title: intl.get('spfm.importErp.model.importErp.bankAccountName').d('联行行号'),
        width: 180,
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
        title: intl.get('spfm.importErp.model.importErp.depositBank').d('开户行名称'),
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
        title: intl.get('spfm.importErp.model.importErp.taxRate').d('税率'),
        width: 160,
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
                        name: intl.get('spfm.importErp.model.importErp.taxRate').d('税率'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPRM.TAX"
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
        title: intl.get('spfm.importErp.model.importErp.currencyName').d('币种'),
        width: 160,
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
                        name: intl.get('spfm.importErp.model.importErp.currencyName').d('币种'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.CURRENCY"
                    textValue={val}
                    queryParams={{ tenantId }}
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
        title: intl.get('spfm.importErp.model.importErp.createDate').d('层创建日期'),
        width: 160,
        dataIndex: 'creationDate',
        render: (val, record) => {
          if (['create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('creationDate', {
                  initialValue: createDate,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return dateRender(val);
          }
        },
      },
      {
        title: intl.get('spfm.importErp.model.importErp.expirationDate').d('层失效日期'),
        width: 160,
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
                          .get('spfm.importErp.model.importErp.expirationDate')
                          .d('层失效日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={DEFAULT_DATE_FORMAT}
                    placeholder={null}
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
        width: 75,
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
                onClick={() => {
                  this.handleEditRow(record);
                }}
                disabled={isDisabled}
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
    const param = queryString.parse(location.search.substr(1));
    const deleteButtonFlag = param.syncStatus === 'PENDING' || param.syncStatus === 'SUCCESSED';

    return (
      <React.Fragment>
        <div
          style={{
            marginTop: -8,
            paddingBottom: 16,
            marginBottom: 16,
            fontSize: 16,
            color: '#333',
            fontWeight: 500,
            borderBottom: 'solid 1px #e5e5e5',
          }}
        >
          {intl.get('spfm.importErp.model.importErp.OUMessage').d('OU层信息')}
        </div>
        <div className={styles['table-list-btn']}>
          <span id="errorMsg" style={{ color: 'red', fontSize: '16px', marginRight: '680px' }}>
            {errMsg}
          </span>
          <PermissionButton
            icon="delete"
            disabled={deleteButtonFlag}
            onClick={this.handleDelete}
            permissionList={[
              {
                code: 'srm.partner.my-partner.my-partner.ps.button.ebs-ou-delete',
                type: 'button',
                meaning: 'OU层信息-删除',
              },
            ]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </PermissionButton>
          <Button disabled={isEmpty(isSave)} loading={saving} onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={this.handleAdd}
            disabled={isDisabled}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SPFM.PARTNER_LIST_IMPORT_EBS.OU',
          },
          <EditTable
            bordered
            loading={loading}
            dataSource={OuMessageList}
            pagination={OuMessagePagination}
            rowKey="supplierSyncEbsOuId"
            onChange={this.handleSearch}
            columns={columns}
            scroll={{ x: scrollX }}
            rowSelection={{
              selectedRowKeys,
              selectedRows,
              onChange: this.selectedRows,
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
