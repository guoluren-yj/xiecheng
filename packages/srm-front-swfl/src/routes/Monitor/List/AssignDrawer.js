import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { uniqBy } from 'lodash';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  getResponse,
  createPagination,
  getEditTableData,
} from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from '_components/Upload';

import { fetchProcessRetry, saveProcessRetry } from '@/services/monitorService';

const FormItem = Form.Item;

/**
 * 新建或编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onAdd - 添加确定的回调函数
 * @reactProps {Function} onEdit - 编辑确定的回调函数
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class AssignDrawer extends PureComponent {
  state = {
    dataSource: [],
    pagination: {},
    loading: false,
    confirmLoading: false,
  };

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch(params = {}) {
    const { retryData = {} } = this.props;
    this.setState({ loading: true });
    fetchProcessRetry({
      processInstanceId: retryData.encryptId,
      tenantId: retryData.tenantId,
      ...params,
    }).then((res) => {
      this.setState({ loading: false });
      const result = getResponse(res);
      if (result) {
        this.setState({
          dataSource: (result.content || []).map((item) => ({ ...item, _status: 'create' })),
          pagination: createPagination(result),
        });
      }
    });
  }

  @Bind()
  handleSubmit() {
    const { dataSource = [] } = this.state;
    const { onClose, retryData = {}, afterSubmit = () => {} } = this.props;
    if (dataSource.length === 0) {
      onClose();
      return;
    }
    const editData = getEditTableData(dataSource);
    // 校验不通过
    if (!editData || !editData.length) {
      return;
    }
    // 只传给后端 id 和 assignee 字段
    const newDataSource = editData.map((item) => {
      const { id, assign, comment, attachmentUuid } = item;
      return {
        id,
        assignee: assign,
        comment,
        attachmentUuid,
      };
    });
    // 有指定审批人
    const newDataSourceFilter = newDataSource.filter((item) => item.assignee !== undefined);
    const uniqNewDataSource = uniqBy(newDataSourceFilter, 'assignee');
    if (newDataSourceFilter.length !== uniqNewDataSource.length) {
      notification.warning({
        message: intl.get('hwfp.monitor.view.message.couldNotSameAssign').d('不同指定相同的审批人'),
      });
      return;
    }
    Modal.confirm({
      content: intl.get('hwfp.monitor.view.message.confirmSubmit').d('确定提交吗'),
      onOk: () => {
        this.setState({ loading: true, confirmLoading: true });
        saveProcessRetry({
          processInstanceId: retryData.encryptId,
          data: newDataSource,
          tenantId: retryData.tenantId,
        })
          .then((res) => {
            const result = getResponse(res);
            if (result) {
              notification.success();
              onClose();
              afterSubmit();
            }
          })
          .finally(() => {
            this.clearLoading();
          });
      },
      onCancel: () => {
        this.clearLoading();
      },
      onClose: () => {
        this.clearLoading();
      },
    });
  }

  @Bind()
  clearLoading() {
    this.setState({ loading: false, confirmLoading: false });
  }

  @Bind()
  handleTableChange(pagination) {
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
    };
    this.handleSearch(params);
  }

  @Bind()
  getColumns() {
    return [
      {
        title: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        dataIndex: 'name',
        width: 200,
      },
      {
        title: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
        dataIndex: 'assigneeName',
        width: 150,
        render: (val) => val && <span>{val}</span>,
      },
      {
        title: intl.get('hwfp.common.model.approval.owner').d('审批人'),
        dataIndex: 'assign',
        width: 150,
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('assign', {
                rules: [
                  {
                    required: !record.assignee,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hwfp.common.model.approval.owner').d('审批人'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HWFP.EMPLOYEE"
                  queryParams={{ tenantId: getCurrentOrganizationId(), enabledFlag: 1 }}
                  lovOptions={{
                    displayField: 'name',
                  }}
                  textValue={record.assigneeName}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get('hwfp.common.modal.opinion').d('意见'),
        dataIndex: 'comment',
        width: 250,
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('comment', {
                rules: [
                  {
                    required: !record.assignee || record.$form.getFieldValue('assign'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hwfp.common.modal.opinion').d('意见'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          );
        },
      },
      {
        title: intl.get('hwfp.common.model.approval.file').d('附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('attachmentUuid', {
                initialValue: val,
              })(<Upload bucketName={PRIVATE_BUCKET} attachmentUUID={val} />)}
            </Form.Item>
          );
        },
      },
    ];
  }

  render() {
    const { dataSource = [], pagination = {}, loading, confirmLoading } = this.state;
    const { onClose } = this.props;
    return (
      <Modal
        destroyOnClose
        width={800}
        title={intl.get('hwfp.monitor.view.option.retry').d('指定审批人')}
        visible
        onCancel={onClose}
        onOk={this.handleSubmit}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        confirmLoading={confirmLoading}
      >
        <EditTable
          bordered
          rowKey="id"
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          columns={this.getColumns()}
          onChange={this.handleTableChange}
        />
      </Modal>
    );
  }
}
