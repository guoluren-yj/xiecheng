/*
 * @Description: index.js - 印章管理
 * @Author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @Date: 2019-08-7
 * @LastEditTime: 2019-08-26 14:17:17
 */
import React, { Component } from 'react';
import { Select, Form, Modal, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isArray, isEmpty, omit } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { Header, Content } from 'components/Page';
import EditTable from 'components/EditTable';
import {
  addItemToPagination,
  getEditTableData,
  getCurrentOrganizationId,
  delItemsToPagination,
  createPagination,
} from 'utils/utils';
import Lov from 'components/Lov';

import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading = {}, configServer = {} }) => ({
  queryModalListLoading: loading.effects['configServer/queryModalList'],
  configServer,
}))
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      selectedRows: [],
      selectedRowKeys: [],
      modalDataSource: [],
      modalPagination: {},
      tenantId: getCurrentOrganizationId(),
    };
  }

  getSnapshotBeforeUpdate(preProps) {
    const { visible } = preProps;
    if (!visible && visible !== this.props.visible) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    this.fetchList();
  }

  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const { tenantId, selectedRows = [] } = this.state;
    this.setState({ selectedRows });
    dispatch({
      type: 'configServer/queryModalList',
      payload: {
        page,
        tenantId,
      },
    }).then(res => {
      this.setState({
        modalDataSource: res.content.map(n => ({ ...n, _status: 'update' })),
        modalPagination: createPagination(res),
      });
    });
  }

  /**
   * 新建列表
   * @param {String} poCreateRuleId
   */
  @Bind()
  newProject() {
    const { modalDataSource, modalPagination } = this.state;
    const newDataSource = {
      poCreateRuleId: uuid(),
      edited: true,
      _status: 'create',
    };
    this.setState({
      modalDataSource: [newDataSource, ...modalDataSource],
      modalPagination: addItemToPagination(modalDataSource.length, modalPagination),
    });
  }

  /**
   * delete - 删除列表
   */
  @Bind()
  delete() {
    const sourceField = `modalDataSource`;
    const paginationField = `modalPagination`;
    const selectedField = `selectedRows`;
    const rowKey = `poCreateRuleId`;
    const {
      [selectedField]: selectedRows = [],
      [sourceField]: modalDataSource = [],
      [paginationField]: modalPagination = {},
    } = this.state;
    const { dispatch, companyId } = this.props;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spfm.sealmanage.view.message.title.removeTable`).d('请确认是否要删除？'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map(n => n[rowKey]);
        modalDataSource.forEach(item => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          if (this.checkModified(rowKey, selectedRows, modalDataSource)) {
            Modal.confirm({
              title: intl
                .get(`spfm.sealmanage.view.message.title.whetherOrNotToContinue`)
                .d('当前数据有未保存。继续操作将造成数据丢失，是否继续？'),
              onOk: () => {
                dispatch({
                  type: `configServer/deletes`,
                  payload: {
                    companyId,
                    body: deleteList, // 等待修改
                  },
                }).then(res => {
                  if (res) {
                    if (res) {
                      this.setState({ [selectedField]: [] });
                      notification.success();
                      this.fetchList();
                    }
                  }
                });
              },
            });
          } else {
            dispatch({
              type: `configServer/deletes`,
              payload: {
                companyId,
                body: deleteList, // 等待修改
              },
            }).then(res => {
              if (res) {
                if (res) {
                  this.setState({ [selectedField]: [] });
                  notification.success();
                  this.fetchList();
                }
              }
            });
          }
        } else {
          this.setState({
            [selectedField]: [],
            [paginationField]: [],
            [sourceField]: newDataSource,
            [paginationField]: delItemsToPagination(
              selectedRows.length,
              modalDataSource.length,
              modalPagination
            ),
          });
        }
      },
    });
  }

  @Bind()
  checkModified(rowkey, modalDataSource = []) {
    if (modalDataSource.some(i => i.edited)) {
      return 1;
    } else {
      return null;
    }
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Bind()
  save() {
    const { dispatch } = this.props;
    const { tenantId, modalDataSource, modalPagination } = this.state;
    const newDataSource = modalDataSource.filter(item => item.edited || item._status === 'create');
    const lines = getEditTableData(modalDataSource, ['poCreateRuleId', '_status', 'edited'], {
      force: true,
    });
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      const headerData = {
        lines,
        tenantId,
      };
      dispatch({
        type: 'configServer/updateSave',
        payload: { headerData },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchList(modalPagination);
          this.setState({ selectedRows: [] });
          // onHideDrawer(this);
        }
      });
    }
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   *附件删除回调
   *
   * @param {object} record
   */
  @Bind()
  onDeleteUploadFile(record) {
    const { dispatch, companyId } = this.props;
    const { tenantId, selectedRows, modalPagination, modalDataSource } = this.state;
    const createRecord = modalDataSource.filter(item => item._status === 'create');
    const newRecord = Object.assign({}, record, { sealFileUrl: null, edited: true });
    if (record._status !== 'create') {
      const lines = getEditTableData([newRecord], ['poCreateRuleId', '_status'], { force: true });
      const headerData = {
        lines,
        companyId,
        tenantId,
      };
      dispatch({
        type: 'configServer/update',
        payload: { headerData },
      }).then(res => {
        if (res) {
          this.fetchList(modalPagination, selectedRows, createRecord);
        }
      });
    } else {
      const newDataSource = modalDataSource.map(item => {
        if (record.poCreateRuleId === item.poCreateRuleId) {
          return newRecord;
        }
        return item;
      });
      this.setState({
        modalDataSource: newDataSource,
      });
    }
  }

  /**
   * 删除
   */
  @Bind()
  delModal() {
    const { onHideDrawer } = this.props;
    const { modalDataSource = [] } = this.state;
    if (modalDataSource.some(item => item.edited || item._status === 'create')) {
      Modal.confirm({
        title: intl
          .get(`spfm.sealmanage.view.message.title.whetherOrNotToContinue`)
          .d('当前数据有未保存。继续操作将造成数据丢失，是否继续？'),
        onOk: () => {
          this.setState({ selectedRows: [] });
          onHideDrawer(this);
          modalDataSource.forEach(item => {
            if (item.edited) {
              item.$form.resetFields();
            }
            return item;
          });
        },
      });
    } else {
      this.setState({ selectedRows: [] });
      onHideDrawer(this);
    }
  }

  @Bind()
  handleRecordChange(record) {
    const { modalDataSource } = this.state;
    const newDataSource = modalDataSource.map(item => {
      if (item.poCreateRuleId === record.poCreateRuleId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      modalDataSource: newDataSource,
    });
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('enableAutomaticOrderCreationVisible', false);
    }
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId } = this.state;
    const { enumMap = [] } = this.props;
    const { prSourcePlat, typeFlag } = enumMap;
    const columnArray = [
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
        render: (val, record) => (
          // ['create'].includes(record._status) ? (
          <FormItem>
            {record.$form.getFieldDecorator(`companyId`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.company.tag`).d('公司'),
                  }),
                },
              ],
              initialValue: record.companyId,
            })(
              <Lov
                code="SPFM.USER_AUTH.COMPANY"
                queryParams={{
                  tenantId,
                }}
                textField="companyName"
                textValue={record.companyName}
              />
            )}
          </FormItem>
        ),
        // ) : (
        //   val
        // ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.source`).d('单据来源'),
        dataIndex: 'sourceCodeMeaning',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`sourceCode`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.configServer.view.order.modal.source`).d('单据来源'),
                  }),
                },
              ],
              initialValue: record.sourceCode,
            })(
              <Select showSearch style={{ width: '150px' }} allowClear>
                {prSourcePlat.map(item => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.sealmanage.model.autoGenerateStatus`).d('自动生成的状态'),
        dataIndex: 'autoGenerateStatusMeaning',
        width: 140,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`autoGenerateStatus`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.sealmanage.model.autoGenerateStatus`).d('自动生成的状态'),
                  }),
                },
              ],
              initialValue: record.autoGenerateStatus,
            })(
              <Select showSearch style={{ width: '150px' }} allowClear>
                {typeFlag
                  .filter(n => ['PENDING', 'SUBMITTED'].includes(n.value))
                  .map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
              </Select>
            )}
          </FormItem>
        ),
      },
    ];

    return columnArray;
  }

  render() {
    const { queryModalListLoading } = this.props;
    const { selectedRows, modalDataSource, modalPagination } = this.state;
    const selectedRowKeys = selectedRows.map(item => item.poCreateRuleId);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
    };
    const columns = this.getColumns();
    const tableProps = {
      columns,
      rowSelection,
      bordered: true,
      rowKey: 'poCreateRuleId',
      dataSource: modalDataSource,
      pagination: modalPagination,
      loading: queryModalListLoading,
      onChange: page => this.fetchList(page),
    };
    const { visible } = this.props;
    return (
      <Modal visible={visible} footer={false} onCancel={this.hideModal} width={800}>
        <div className={styles['drawer-page']}>
          <Header>
            <Button type="primary" onClick={this.newProject}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button onClick={this.save}>{intl.get('hzero.common.button.save').d('保存')}</Button>
            <Button
              onClick={this.delete}
              disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          </Header>
          <Content>
            <EditTable {...tableProps} />
          </Content>
        </div>
      </Modal>
    );
  }
}
