/*
 * MergeSourceSetModal - 申请转寻源并单规则弹框
 * @date: 2020--29
 * @author: LS <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isInteger } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import Lov from 'components/Lov';
import Switch from 'components/Switch';
import EditTable from 'components/EditTable';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemsToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
@connect(({ loading, configServer }) => ({
  configServer,
  loading: loading.effects['configServer/fetchSourceMatter'],
  saving: loading.effects['configServer/saveSourceMatter'],
}))
export default class SourceMatterModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
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
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchSourceMatter',
      payload: {
        page,
      },
    });
  }

  /**
   * 改变选中主键
   * @param {[String]} selectedRowKeys
   * @param {[String]} selectedRows
   */
  @Bind()
  handleSelectedRows(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 删除并单规则
   */
  @Bind()
  handleDelete() {
    const that = this;
    const { selectedRows } = this.state;
    const selectedRowKeys = selectedRows.map(item => item.matterConfId);
    const {
      dispatch,
      configServer: { sourceMatterList = [], sourceMatterPagination = {} },
    } = this.props;
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        content: intl.get(`spfm.configServer.view.deliver.modal.delete.sure`).d('确定删除吗?'),
        onOk() {
          const newDataSource = [];
          sourceMatterList.forEach(item => {
            if (selectedRowKeys.indexOf(item.matterConfId) < 0) {
              newDataSource.push(item);
            }
          });
          const curSize = sourceMatterList.length - newDataSource.length;
          that.handleSelectedRows([], []);
          notification.success();
          const newPagination = delItemsToPagination(
            curSize,
            sourceMatterList.length,
            sourceMatterPagination
          );
          dispatch({
            type: 'configServer/updateState',
            payload: {
              sourceMatterList: newDataSource,
              sourceMatterPagination: newPagination,
            },
          });
        },
      });
    }
  }

  /**
   * 新建审批规则
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate() {
    const {
      dispatch,
      configServer: { sourceMatterList = [], sourceMatterPagination = {} },
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        sourceMatterList: [
          {
            matterConfId: uuid(),
            _status: 'create',
            rfxRequireFlag: 1,
            bidRequireFlag: 1,
          },
          ...sourceMatterList,
        ],
        sourceMatterPagination: addItemToPagination(
          sourceMatterList.length,
          sourceMatterPagination
        ),
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { tenantId } = this.state;
    const {
      dispatch,
      configServer: { sourceMatterList = [] },
    } = this.props;
    const editTable = getEditTableData(sourceMatterList, ['matterConfId']).map(item => ({
      tenantId,
      ...item,
    }));
    if (isArray(editTable) && !isEmpty(editTable)) {
      dispatch({
        type: 'configServer/saveSourceMatter',
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
      handleModal('sourceMatterVisible', false);
    }
  }

  /**
   * 打开明细弹窗
   */
  @Bind()
  openMatterDetailModal(sourceMatterRecrd) {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('matterDetailVisible', true, { sourceMatterRecrd });
    }
  }

  render() {
    const {
      loading,
      saving,
      sourceMatterVisible = false,
      configServer: { sourceMatterList = [], sourceMatterPagination = {} },
    } = this.props;
    const { tenantId, selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.matterConfId),
      onChange: this.handleSelectedRows,
      getCheckboxProps: record => ({
        disabled: isInteger(record.matterConfId),
        defaultFlag: isInteger(record.matterConfId),
      }),
    };
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.sourceMatter.companyName`).d('公司'),
        dataIndex: 'companyId',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`companyId`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.configServer.model.sourceMatter.companyName`).d('公司'),
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
      },
      {
        title: intl.get(`spfm.configServer.model.sourceMatter.rfxRequireFlag`).d('报价前必须已读'),
        dataIndex: 'rfxRequireFlag',
        align: 'center',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`rfxRequireFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Switch />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.sourceMatter.bidRequireFlag`).d('投标前必须已读'),
        dataIndex: 'bidRequireFlag',
        align: 'center',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`bidRequireFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Switch />)}
          </FormItem>
        ),
      },
    ];
    const editTableProps = {
      loading,
      columns,
      dataSource: sourceMatterList,
      pagination: sourceMatterPagination,
      onChange: this.handleSearch,
      bordered: true,
      rowKey: 'matterConfId',
      rowSelection,
    };
    return (
      <Modal
        title={
          <div>
            {intl.get(`spfm.configServer.view.message.modal.sourceMatter`).d('寻源事项说明')}
          </div>
        }
        visible={sourceMatterVisible}
        onCancel={this.hideModal}
        width={1100}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          <Button
            type="default"
            onClick={this.handleDelete}
            style={{ marginRight: '8px' }}
            disabled={isArray(selectedRows) && isEmpty(selectedRows)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button onClick={this.handleSave} loading={saving} style={{ marginRight: '8px' }}>
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
