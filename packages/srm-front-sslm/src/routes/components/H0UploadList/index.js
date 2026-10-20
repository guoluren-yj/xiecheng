/*
 * @Date: 2021-11-17 11:20:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import Bind from 'lodash-decorators/bind';
import { isEmpty } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Modal, Button, Input, Form } from 'hzero-ui';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import Table from 'srm-front-boot/lib/components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { getEditTableData, delItemsToPagination } from 'utils/utils';

import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import DragUpload from './DragUpload';

const FormItem = Form.Item;

@formatterCollections({ code: ['sslm.common'] })
export default class AttachmentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadVisible: false,
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.dataSource !== prevState.prevDataSource) {
      return {
        dataSource: nextProps.dataSource,
        pagination: nextProps.pagination,
        prevDataSource: nextProps.dataSource,
      };
    }
    return null;
  }

  // 选中项发生改变的回调
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  // 新建
  @Bind()
  handleUploadModal() {
    const { uploadVisible } = this.state;
    this.setState({ uploadVisible: !uploadVisible });
  }

  // 保存
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { rowKey, onSave } = this.props;
    const newList = getEditTableData(dataSource, ['_status', rowKey]);
    onSave(newList);
  }

  // 删除
  @Bind()
  handleDelete() {
    const { dataSource, pagination, selectedRows, selectedRowKeys } = this.state;
    const { rowKey, onDelete } = this.props;
    Modal.confirm({
      title: intl.get('sslm.common.model.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        if (!isEmpty(selectedRows)) {
          const newList = dataSource.filter(item => !selectedRowKeys.includes(item[rowKey]));
          const updateRows = selectedRows.filter(n => n._status !== 'create');
          if (!isEmpty(updateRows)) {
            onDelete(updateRows);
          }
          this.setState({
            selectedRows: [],
            selectedRowKeys: [],
            dataSource: newList,
            pagination: delItemsToPagination(selectedRows.length, dataSource.length, pagination),
          });
        }
      },
    });
  }

  // 编辑／取消编辑
  @Bind()
  handleEdit(flag, record) {
    const { dataSource } = this.state;
    const { rowKey } = this.props;
    const newDataSource = dataSource.map(n =>
      n[rowKey] === record[rowKey] ? { ...n, _status: flag ? 'update' : '' } : n
    );
    this.setState({ dataSource: newDataSource });
  }

  render() {
    const { dataSource, pagination, selectedRows, selectedRowKeys, uploadVisible } = this.state;
    const { isEdit = false, visible, onCancel, onOk, rowKey, onChange, allLoading } = this.props;
    const columns = [
      {
        title: intl.get('sslm.common.model.attachment.name').d('附件名称'),
        dataIndex: 'attachmentName',
        width: 200,
        render: (val, record) => {
          return isReview(record.attachmentName) && record.attachmentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reviewFile(record.attachmentName, record.attachmentUrl)}
            >
              {val}
            </a>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`sslm.common.model.attachment.uploadName`).d('上传人'),
        dataIndex: 'uploadUserName',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.attachment.uploadDate`).d('上传时间'),
        dataIndex: 'uploadTime',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 100,
        render: (_, record) => {
          const { tenantId, attachmentUrl } = record;
          return (
            <Fragment>
              {record._status === 'update' && (
                <a style={{ marginRight: 8 }} onClick={() => this.handleEdit(false, record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {isEdit && record._status !== 'create' && record._status !== 'update' && (
                <a style={{ marginRight: 8 }} onClick={() => this.handleEdit(true, record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              {record.attachmentUrl && (
                <a
                  href={downLoadFile({ tenantId, attachmentUrl })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {intl.get('hzero.common.button.download').d('下载')}
                </a>
              )}
            </Fragment>
          );
        },
      },
    ];
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    const isSave = dataSource.filter(n => ['create', 'update'].includes(n._status));
    return (
      <Modal
        width={1000}
        visible={visible}
        onCancel={onCancel}
        title={intl.get('hzero.common.upload.modal.attachment').d('附件')}
        footer={null}
      >
        <div
          className="table-list-search"
          style={{ textAlign: 'right', display: isEdit ? 'block' : 'none' }}
        >
          <Button
            loading={allLoading}
            style={{ marginRight: 8 }}
            disabled={isEmpty(isSave)}
            onClick={this.handleSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            loading={allLoading}
            disabled={isEmpty(selectedRows)}
            onClick={this.handleDelete}
            style={{ marginRight: 8 }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button loading={allLoading} type="primary" onClick={this.handleUploadModal}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        <Table
          bordered
          rowKey={rowKey}
          columns={columns}
          loading={allLoading}
          rowSelection={isEdit ? rowSelection : null}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
        />
        <DragUpload onOk={onOk} visible={uploadVisible} onCancel={this.handleUploadModal} />
      </Modal>
    );
  }
}
