/**
 * DirectInvoiceModal 直连开票规则定义弹窗
 * @date: 2019-9-25
 * @author MaoJiaqi <jiaqi.mao@hand-china.com >
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal, Form, Button, Input } from 'hzero-ui';
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
import { isFunction } from 'util';

import Change from '../../../components/ChangeFormItem';

import styles from './index.less';

@connect(({ configServer, loading }) => ({
  directInvoiceInfo: loading.effects['configServer/directInvoiceInfo'],
  saving: loading.effects['configServer/saveDirectInvoiceInfo'],
  deleteDirectInvoiceInfo: loading.effects['configServer/deleteDirectInvoiceInfo'],
  configServer,
}))
@Form.create({ fieldNameProp: null })
export default class DirectInvoiceBaseInfoModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [], // 选中行数组
      tenantId: getCurrentOrganizationId(),
      dataSource: [], // 直连开票基础信息数据
      pagination: {}, // 直连开票基础信息分页信息
    };
    const Change_ = new Change('rowKey');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isUpdata = Change_._isUpdate;
    this.ChangeFormItem = Change_.ChangeFormItem;
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
      type: 'configServer/directInvoiceInfo',
      payload: { page },
    }).then(res => {
      if (res) {
        const content = res.content || [];
        const dataSource = content.map(item => {
          return { ...item, _status: 'update', rowKey: uuid() };
        });
        this.setState({
          dataSource,
          pagination: createPagination(res),
        });
        this.setUpdate('reset');
      }
    });
  }

  /**
   * 直连开票规则保存
   */
  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const { dataSource = [], pagination = {} } = this.state;
    const editTableData = getEditTableData(dataSource, ['rowkey']);
    if (isArray(editTableData) && !isEmpty(editTableData)) {
      dispatch({
        type: 'configServer/saveDirectInvoiceInfo',
        payload: this.changeList(editTableData),
      }).then(res => {
        if (res) {
          notification.success();
          this.handleQuery(pagination);
        }
      });
    }
  }

  /**
   * 新建开票规则
   */
  @Bind()
  handleCreate() {
    const { dataSource = [], pagination = {} } = this.state;
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
    const { pagination } = this.state;
    dispatch({
      type: 'configServer/deleteDirectInvoiceInfo',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleQuery(pagination);
        this.setState({ selectedRows: [] });
      }
    });
  }

  /**
   * 关闭直连开票基础信息定义弹窗
   */
  @Bind()
  handleModalVisible() {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal('directInvoiceBaseInfoVisible', false);
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
   * Ok的函数
   */
  @Bind()
  handleOk() {
    const { dispatch } = this.props;
    const { dataSource = [], pagination = {} } = this.state;
    const editTableData = getEditTableData(dataSource, ['rowkey']);
    if (isEmpty(dataSource)) {
      this.handleModalVisible();
    }
    if (!isEmpty(editTableData)) {
      if (isArray(this.changeList(editTableData)) && !isEmpty(this.changeList(editTableData))) {
        Modal.confirm({
          title: intl
            .get(`hzero.common.validation.nowDataWillSave`)
            .d(`当前数据有未保存。数据即将保存是否继续？`),
          onOk: () => {
            dispatch({
              type: 'configServer/saveDirectInvoiceInfo',
              payload: editTableData,
            }).then(res => {
              if (res) {
                notification.success();
                this.handleQuery(pagination);
                this.handleModalVisible();
              }
            });
          },
        });
      } else {
        this.handleModalVisible();
      }
    }
  }

  render() {
    const {
      saving,
      directInvoiceBaseInfoVisible,
      directInvoiceInfo,
      deleteDirectInvoiceInfo,
    } = this.props;
    const { selectedRows = [], dataSource = [], tenantId, pagination = {} } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(item => item.rowKey),
      onChange: this.handleChangeSelectRowKeys,
    };
    const { ChangeFormItem } = this;
    const columns = [
      {
        title: intl.get('entity.company.companyName').d('公司名称'),
        dataIndex: 'companyName',
        width: 220,
        render: (val, record) => {
          return record._status === 'create' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('supplierCompanyId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.companyName`).d('公司名称'),
                    }),
                  },
                ],
                initialValue: record.supplierCompanyId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.COMPANY"
                  queryParams={{ tenantId }}
                  textValue={record.companyName}
                  lovOption={{ valueField: record.supplierCompanyId }}
                />
              )}
            </ChangeFormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.taxInvoiceCode`).d('税控设备编号'),
        dataIndex: 'taxControlEquipmentNum',
        width: 220,
        render: (_, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('taxControlEquipmentNum', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.supplier.taxInvoiceCode`)
                        .d('税控设备编号'),
                    }),
                  },
                ],
                initialValue: record.taxControlEquipmentNum,
              })(<Input style={{ width: '100%' }} />)}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.taxPanelControlPassword`).d('税控盘口令'),
        dataIndex: 'taxControlPassword',
        width: 120,
        render: (_, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`taxControlPassword`, {
                initialValue: record.taxControlPassword,
              })(<Input style={{ width: '100%' }} />)}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl
          .get(`spfm.configServer.model.supplier.taxCertificatePassword`)
          .d('税务数字证书密码'),
        dataIndex: 'taxCertificatePassword',
        width: 200,
        render: (_, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`taxCertificatePassword`, {
                initialValue: record.taxCertificatePassword,
              })(<Input style={{ width: '100%' }} />)}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.toReview`).d('复核'),
        dataIndex: 'reviewer',
        width: 120,
        render: (_, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`reviewer`, { initialValue: record.reviewer })(
                <Input style={{ width: '100%' }} />
              )}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.Payee`).d('收款人'),
        dataIndex: 'payee',
        width: 120,
        render: (_, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`payee`, { initialValue: record.payee })(
                <Input style={{ width: '100%' }} />
              )}
            </ChangeFormItem>
          );
        },
      },
    ];
    return (
      <Fragment>
        <Modal
          title={intl
            .get(`spfm.configServer.title.directInvoiceDefinition`)
            .d('直连开票基础信息定义')}
          visible={directInvoiceBaseInfoVisible}
          onCancel={this.handleModalVisible}
          onOk={this.handleOk}
          width={800}
          className={styles['direct-invoice']}
        >
          <div className={styles.header}>
            <Button
              disabled={!selectedRows.length}
              onClick={this.handleDelete}
              loading={deleteDirectInvoiceInfo}
            >
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
            loading={directInvoiceInfo}
          />
        </Modal>
      </Fragment>
    );
  }
}
