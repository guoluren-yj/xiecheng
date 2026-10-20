/*
 * PurchaseRequisitionApprovalConfig - 采购申请引用单据创建预算金额阶梯校验设置
 * @date: 2019-11-29
 * @author: WT <ting.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, omit } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
@connect(({ loading, configServer }) => ({
  configServer,
  loading: loading.effects['configServer/fetchAutoDeductNote'],
  saving: loading.effects['configServer/saveAutoDeductNote'],
  deleting: loading.effects['configServer/deleteAutoDeductNote'],
}))
export default class AutoDeductNoteModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchAutoDeductNote',
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(item => ({ ...item, _status: 'update' })),
        });
      }
    });
  }

  /**
   * 新建审批规则
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate() {
    const { dataSource } = this.state;
    const newLine = {
      paymentConfigId: uuid(),
      _status: 'create',
    };
    this.setState({
      dataSource: [newLine, ...dataSource],
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource, tenantId } = this.state;
    const { dispatch } = this.props;
    const editTable = getEditTableData(dataSource, ['paymentConfigId']).map(item => ({
      tenantId,
      ...item,
    }));
    if (isArray(editTable) && !isEmpty(editTable)) {
      dispatch({
        type: 'configServer/saveAutoDeductNote',
        payload: editTable,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('autoDeductNoteVisible', false);
    }
  }

  /**
   * 改变主键
   * @param {Array} selectedRows 选中数据数组
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows, dataSource } = this.state;
    const { dispatch } = this.props;
    const selectedRowKeys = selectedRows.map(item => item.paymentConfigId);
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spfm.configServer.view.message.ifClean`).d('确认删除？'),
      onOk: () => {
        dataSource.forEach(item => {
          if (!selectedRowKeys.includes(item.paymentConfigId)) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'configServer/deleteAutoDeductNote',
            payload: deleteList,
          }).then(res => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
        this.setState({ selectedRows: [], dataSource: newDataSource });
      },
    });
  }

  render() {
    const {
      loading,
      saving,
      deleting,
      autoDeductNoteVisible = false,
      configServer: { enumMap = {} },
    } = this.props;
    const { dataSource = [], selectedRows, tenantId } = this.state;
    const { freeHandleType = [], defaultLender = [] } = enumMap;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(item => item.paymentConfigId),
      onChange: this.handleChangeSelectRowKeys,
    };
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.configServer.processNode`).d('费用处理方式'),
        dataIndex: 'expenseProcessTypeCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`expenseProcessTypeCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.processNode`)
                        .d('费用处理方式'),
                    }),
                  },
                ],
                initialValue: record.expenseProcessTypeCode,
              })(
                <Select showSearch style={{ width: '100%' }} allowClear>
                  {freeHandleType.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl
          .get(`spfm.configServer.model.configServer.defaultGLAccount`)
          .d('总账科目默认值'),
        dataIndex: 'generalLedgerId',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`generalLedgerId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.defaultGLAccount`)
                        .d('总账科目默认值'),
                    }),
                  },
                ],
                initialValue: record.generalLedgerId,
              })(
                <Lov
                  code="SQAM.ACCOUNT_SUBJECT"
                  textField="generalLedgerName"
                  textValue={record.generalLedgerName}
                  queryParams={{ tenantId }}
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue({ lendersCode: null, autoCommitFlag: 0 });
                    const newDataSource = dataSource.map(item => {
                      return item.paymentConfigId === record.paymentConfigId
                        ? {
                            ...item,
                            companyName: lovRecord.companyName,
                            ouName: lovRecord.ouName,
                          }
                        : item;
                    });
                    this.setState({ dataSource: newDataSource });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.defaultLender`).d('借贷方默认值'),
        dataIndex: 'lendersCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`lendersCode`, {
                initialValue: record.lendersCode,
              })(
                <Select
                  disabled={!record.$form.getFieldValue('generalLedgerId')}
                  showSearch
                  style={{ width: '100%' }}
                  allowClear
                  onChange={() => {
                    record.$form.setFieldsValue({ autoCommitFlag: 0 });
                  }}
                >
                  {defaultLender.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.autoSubmit`).d('自动提交'),
        dataIndex: 'autoCommitFlag',
        width: 80,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`autoCommitFlag`, {
                initialValue: record.autoCommitFlag,
              })(
                <Checkbox
                  disabled={
                    !record.$form.getFieldValue('generalLedgerId') ||
                    !record.$form.getFieldValue('lendersCode')
                  }
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const editTableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      pagination: false,
      bordered: true,
      rowKey: 'paymentConfigId',
    };
    return (
      <Modal
        title={
          <div>
            {intl
              .get(`spfm.configServer.view.message.modal.createDeductValue`)
              .d('新建扣款单默认值定义')}
          </div>
        }
        visible={autoDeductNoteVisible}
        onCancel={this.hideModal}
        width={1100}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          <Button
            onClick={this.handleDelete}
            loading={deleting}
            disabled={isArray(selectedRows) && isEmpty(selectedRows)}
            style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            onClick={this.handleSave}
            loading={saving}
            disabled={!dataSource.some(item => ['update', 'create'].includes(item._status))}
            // style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable {...editTableProps} />
      </Modal>
    );
  }
}
