/**
 * DirectInvoiceModal 直连开票规则定义弹窗
 * @date: 2019-9-25
 * @author MaoJiaqi <jiaqi.mao@hand-china.com >
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal, Form, Button, Select, InputNumber } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { isArray, isEmpty } from 'lodash';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import {
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  addItemToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import Switch from 'components/Switch';
import { isFunction } from 'util';

import Change from '../../../components/ChangeFormItem';
import ClientListModal from './ClientListModal';
import styles from './index.less';

const { Option } = Select;

@connect(({ configServer, loading }) => ({
  directInvoiceRulesLoading: loading.effects['configServer/directInvoiceRules'],
  directInvoiceRulesDetailsLoading: loading.effects['configServer/directInvoiceRulesDetails'],
  saving: loading.effects['configServer/saveDirectInvoiceRules'],
  configServer,
}))
@Form.create({ fieldNameProp: null })
export default class DirectInvoiceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [], // 选中行数组
      clientListVisible: false, // 客户列表弹框
      tenantId: getCurrentOrganizationId(),
      dataSource: [], // 直连开票规则数据
      pagination: {}, // 直连开票规则分页信息
      clientListDataSource: [], // 直连开票规则详情数据
    };
    const Change_ = new Change('rowKey');
    const ChangeDetail_ = new Change('rowKey');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isUpdata = Change_._isUpdate;
    this.ChangeFormItem = Change_.ChangeFormItem;
    this.changeDetailList = ChangeDetail_.changeList;
    this.ChangeDetailFormItem = ChangeDetail_.ChangeFormItem;
  }

  componentDidMount() {
    this.handleQuery();
  }

  /**
   * 直连开票规则查询
   */
  @Bind()
  handleQuery(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/directInvoiceRules',
      payload: { page },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(item => {
            return { ...item, _status: 'update', rowKey: uuid() };
          }),
          pagination: createPagination(res),
        });
        this.setUpdate('reset');
      }
    });
  }

  /**
   * 直连开票规则明细查询
   */
  @Bind()
  handleQueryDetail({ companyId, directInvoiceRuleId }) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/directInvoiceRulesDetails',
      payload: {
        companyId,
        directInvoiceRuleId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          clientListDataSource: res.map(item => ({ ...item, _status: 'update', rowKey: uuid() })),
        });
      }
    });
  }

  /**
   * 直连开票规则保存
   */
  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const { dataSource = [] } = this.state;
    const editTableData = getEditTableData(dataSource, ['rowkey']);
    if (isArray(editTableData) && !isEmpty(editTableData)) {
      dispatch({
        type: 'configServer/saveDirectInvoiceRules',
        payload: editTableData,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleQuery();
        }
      });
    }
  }

  /**
   * 直连开票规则明细保存
   */
  @Bind()
  handleSaveDetail() {
    const { dispatch } = this.props;
    const { clientListDataSource, record } = this.state;
    const { directInvoiceRuleId } = record;
    const editTableData = this.changeDetailList(
      getEditTableData(clientListDataSource, ['rowKey'])
    ).map(item => ({
      directInvoiceRuleId,
      ...item,
    }));
    if (isArray(editTableData) && !isEmpty(editTableData)) {
      dispatch({
        type: 'configServer/saveDirectInvoiceRulesDetails',
        payload: editTableData,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleQueryDetail(record);
        }
      });
    }
  }

  /**
   * 新建开票规则
   */
  @Bind()
  handleCreate() {
    const { dataSource = [], pagination } = this.state;
    this.setState({
      dataSource: [{ _status: 'create', rowKey: uuid(), incluedAllFlag: 0 }, ...dataSource],
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  /**
   * 删除开票规则
   */
  @Bind()
  handleDelete() {
    const { selectedRows, dataSource } = this.state;
    const selectedRowKeys = selectedRows.map(item => item.rowKey);
    const deleteList = [];
    const createList = [];
    dataSource.forEach(item => {
      if (selectedRowKeys.includes(item.rowKey)) {
        if (item._status === 'update') {
          deleteList.push(item);
        } else if (item._status === 'create') {
          createList.push(item.rowKey);
        }
      }
    });
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.remove`).d('确定删除选中数据?'),
      onOk: () => {
        if (!isEmpty(deleteList)) {
          if (this.isUpdata() || dataSource.some(item => item._status === 'create')) {
            Modal.confirm({
              title: intl
                .get(`hzero.common.validation.nowDataNotSave`)
                .d(`当前数据有未保存。继续操作将造成数据丢失，是否继续？`),
              onOk: () => this.deleteData(deleteList),
            });
          } else {
            this.deleteData(deleteList);
          }
        } else if (!isEmpty(createList)) {
          const newdataSource = dataSource.filter(item => {
            return !createList.includes(item.rowKey);
          });
          this.setState({
            dataSource: newdataSource,
            selectedRows: [],
          });
          this.setUpdate('deleteLine', selectedRowKeys);
        }
      },
    });
  }

  /**
   * 执行删除
   */
  @Bind()
  deleteData(payload = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/deleteDirectInvoiceRules',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleQuery();
        this.setState({ selectedRows: [] });
      }
    });
  }

  /**
   * 关闭直连开票弹窗
   */
  @Bind()
  handleModalVisible() {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal('directInvoiceVisible', false);
    }
  }

  /**
   * 设置选中行
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 客户列表弹窗
   */
  @Bind()
  handleClientListVisible(param, flag, record = {}) {
    this.setState({
      [param]: flag,
      record,
    });
    if (param === 'clientListVisible' && flag === true && !isEmpty(record)) {
      this.handleQueryDetail(record);
    } else if (param === 'clientListVisible' && flag === false) {
      this.setState({ clientListDataSource: [] });
    }
  }

  render() {
    const {
      saving,
      dispatch,
      directInvoiceVisible,
      directInvoiceRulesLoading,
      configServer: {
        enumMap: { taxType = [] },
      },
      directInvoiceRulesDetailsLoading,
    } = this.props;
    const {
      selectedRows = [],
      dataSource = [],
      clientListVisible,
      clientListDataSource,
      tenantId,
      pagination,
    } = this.state;
    const { ChangeFormItem, ChangeDetailFormItem } = this;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(item => item.rowKey),
      onChange: this.handleChangeSelectRowKeys,
    };
    const ClientListModalProps = {
      visible: clientListVisible,
      dispatch,
      onCancel: () => this.handleClientListVisible('clientListVisible', false),
      handleSaveDetail: this.handleSaveDetail,
      dataSource: clientListDataSource,
      ChangeDetailFormItem,
      onSearch: this.handleQueryDetail,
      directInvoiceRulesDetailsLoading,
    };
    const columns = [
      {
        title: intl.get('entity.company.companyName').d('公司名称'),
        dataIndex: 'companyName',
        width: 220,
        render: (val, record) => {
          return record._status === 'create' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('companyId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.companyName`).d('公司名称'),
                    }),
                  },
                ],
                initialValue: record.companyId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.COMPANY"
                  queryParams={{ tenantId }}
                  textValue={record.companyName}
                />
              )}
            </ChangeFormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.invoiceTypeFlag`).d('发票类型'),
        dataIndex: 'invoiceTypeCodeMeaning',
        width: 220,
        render: (val, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('invoiceTypeCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.supplier.invoiceTypeFlag`)
                        .d('发票类型'),
                    }),
                  },
                ],
                initialValue: record.invoiceTypeCode,
              })(
                <Select style={{ width: '100%' }} allowClear>
                  {taxType.map(item => (
                    <Option key={item.value}>{item.meaning}</Option>
                  ))}
                </Select>
              )}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.configServer.model.invoice.invoiceLimitAmount`).d('发票限额'),
        dataIndex: 'invoiceLimitAmount',
        width: 120,
        render: (val, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('invoiceLimitAmount', {
                initialValue: val || 0,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfm.configServer.model.invoice.invoiceLimitAmount`).d('发票限额'),
                    }),
                  },
                ],
              })(
                <InputNumber 
                  min={0}
                  defaultValue={0}
                  precision={2}
                  step={1}
                />
              )}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.configServer.model.invoice.enableAllCustomers`).d('启用所有客户'),
        dataIndex: 'incluedAllFlag',
        width: 120,
        render: (val, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('incluedAllFlag', {
                initialValue: val,
              })(<Switch />)}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.configServer.view.invoice.customerList`).d('客户列表'),
        dataIndex: 'directInvoiceRuleId',
        render: (val, record) => {
          const incluedAllFlag = record.$form.getFieldValue('incluedAllFlag');
          return record._status !== 'create' ? (
            <a
              onClick={() => this.handleClientListVisible('clientListVisible', true, record)}
              disabled={incluedAllFlag}
            >
              {intl.get(`spfm.configServer.view.Invoice.customerList`).d('客户列表')}
            </a>
          ) : null;
        },
      },
    ];
    return (
      <Fragment>
        <Modal
          title={intl
            .get(`spfm.configServer.model.invoice.title.InvoiceDefinition`)
            .d('直连开票规则定义')}
          visible={directInvoiceVisible}
          onCancel={this.handleModalVisible}
          footer={null}
          width={800}
          className={styles['direct-invoice']}
        >
          <div className={styles.header}>
            <Button disabled={!selectedRows.length} onClick={this.handleDelete}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button onClick={this.handleSave} loading={saving}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button type="primary" onClick={this.handleCreate}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          <EditTable
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            bordered
            onChange={this.handleQuery}
            rowKey="rowKey"
            loading={directInvoiceRulesLoading}
          />
        </Modal>
        {<ClientListModal {...ClientListModalProps} />}
      </Fragment>
    );
  }
}
