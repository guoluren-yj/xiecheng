/**
 * AttachmentModal - 考评档案填制---考评附件--上传弹框
 * @date: 2021-07-14
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import moment from 'moment';
import { connect } from 'dva';
import Bind from 'lodash-decorators/bind';
import { isEmpty, isString, every, map } from 'lodash';
import React, { Component, Fragment } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Upload, Icon, Modal, Button, Input, Form, Spin } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';
import Table from 'srm-front-boot/lib/components/EditTable';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getEditTableData,
  createPagination,
} from 'utils/utils';
import { isReview, reviewFile, downLoadFile, defaultMaxFileSize } from '@/routes/components/utils';
import { fetchRemoteFileSizeLimit } from '@/services/commonService';

const { Dragger } = Upload;
const FormItem = Form.Item;

const organizationId = getCurrentOrganizationId();
const bucketDirectory = 'sslm-evaluation';
@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common'],
})
@connect(({ evaluationArchivesFilling, user, loading }) => ({
  user,
  evaluationArchivesFilling,
  queryLoading: loading.effects['evaluationArchivesFilling/queryLineAttachment'],
  saveLoading: loading.effects['evaluationArchivesFilling/saveLineAttachment'],
  deleteLoading: loading.effects['evaluationArchivesFilling/deleteLineAttachment'],
}))
export default class AttachmentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [], // 选中项的key
      uploadVisible: false,
      fileList: [],
      dataSource: [],
      pagination: {},
    };
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.queryAttachment();
  }

  /**
   * 上传前的校验
   * @param {*} file
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize = 50 * 1024 * 1024 } = this.props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line

      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: `${fileSize / (1024 * 1024)}`,
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  @Bind()
  async beforeUploadFiles(files) {
    const { fileSize: defaultFileSize = defaultMaxFileSize } = this.props;
    const remoteFileSize = await fetchRemoteFileSizeLimit(PRIVATE_BUCKET, bucketDirectory);
    const fileSize = remoteFileSize || defaultFileSize;
    const fileSizeValidate = every(
      map(files, file => {
        if (fileSize && file.size > fileSize) {
          file.status = 'error'; // eslint-disable-line
          notification.error({
            message: intl.get('hzero.common.upload.status.error').d('上传失败'),
            description: intl
              .get('hzero.common.upload.error.size', {
                fileSize: fileSize / (1024 * 1024),
              })
              .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
          });
          return false;
        }
        return true;
      })
    );
    return fileSizeValidate;
  }

  /**
   * 将上传列表放到state
   * @param {Object} file - 上传的文件
   */
  @Bind()
  setFileList(file) {
    const { fileList = [] } = this.state;
    this.setState({
      fileList: [...fileList, file],
    });
  }

  /**
   * 上传change触发事件
   * @param {Object} info - 上传的文件
   */
  @Bind()
  onDraggerUploadChange(info) {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        this.setFileList(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  }

  /**
   * 删除文件回调函数
   * @param {*} file
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'evaluationArchivesFilling/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: bucketDirectory,
          urls: [file.response],
        },
      }).then(res => {
        if (res) {
          this.setState({
            fileList: fileList.filter(o => o.uid !== file.uid),
          });
          notification.success();
        }
      });
    }
  }

  /**
   * 附件配置
   * @param {object} file
   */
  @Bind()
  uploadData(file) {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: bucketDirectory,
      fileName: file.name,
    };
  }

  /**
   * modal 确认按钮回调
   */
  @Bind()
  onOk() {
    const {
      user: {
        currentUser: { id, loginName, realName },
      },
      evalHeaderId,
    } = this.props;
    const { fileList = [], dataSource } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          evalHeaderId,
          loginName,
          uploadUserId: id,
          uploadUserName: realName,
          attachmentName: file.name,
          attachmentUrl: file.response,
          attachmentLineId: uuidv4(),
          _status: 'create',
        }))
      : [];
    this.setState({ uploadVisible: false, fileList: [], dataSource: [...fileData, ...dataSource] });
  }

  /**
   * 关闭上传附件模态框
   */
  @Bind()
  handleCancel() {
    this.setState({
      uploadVisible: false,
      fileList: [],
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { uploadVisible } = this.state;
    this.setState({ uploadVisible: !uploadVisible });
  }

  /**
   * 查询
   */
  @Bind()
  queryAttachment(page = {}) {
    const { dispatch, evalHeaderId, uploadUserId = '' } = this.props;
    dispatch({
      type: 'evaluationArchivesFilling/queryLineAttachment',
      payload: {
        page,
        evalHeaderId,
        uploadUserId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 确认按钮回调
   */
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const {
      dispatch,
      onCancel = e => e,
      optional = undefined,
      handleRefresh = () => {},
    } = this.props;
    const tableValues = getEditTableData(dataSource, ['_status', 'attachmentLineId']).map(n => {
      const { dueDate, ...others } = n;
      return { ...others, dueDate: dueDate && moment(dueDate).format(DEFAULT_DATETIME_FORMAT) };
    });
    const flag = !isEmpty(dataSource.filter(n => n._status === 'create' || n._status === 'update'));

    if (!isEmpty(tableValues)) {
      dispatch({
        type: 'evaluationArchivesFilling/saveLineAttachment',
        payload: {
          tableValues,
          optional,
        },
      }).then(res => {
        if (res) {
          notification.success();
          handleRefresh();
          onCancel();
        }
      });
    }
    // 无修改直接关闭弹框
    if (!flag) {
      onCancel();
      handleRefresh();
    }
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows, dataSource } = this.state;
    const { dispatch } = this.props;
    Modal.confirm({
      title: intl.get('sslm.common.model.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        if (!isEmpty(selectedRows)) {
          const createRows = selectedRows.filter(n => n._status === 'create');
          const updateRows = selectedRows.filter(n => n._status !== 'create');
          // const attIdList = updateRows.map(n => n);

          if (!isEmpty(createRows)) {
            const newAttachmentList = dataSource.filter(n => createRows.indexOf(n) > -1 === false);
            this.setState({ dataSource: newAttachmentList });
          }
          if (!isEmpty(updateRows)) {
            dispatch({
              type: 'evaluationArchivesFilling/deleteLineAttachment',
              payload: {
                attIdList: updateRows,
              },
            }).then(res => {
              if (res) {
                notification.success();
                this.queryAttachment();
              }
            });
          }
          this.setState({ selectedRows: [], selectedRowKeys: [] });
        }
      },
    });
  }

  /**
   * 编辑／取消编辑
   */
  @Bind()
  handleEdit(flag, record) {
    const { dataSource } = this.state;
    const newDataSource = dataSource.map(n =>
      n.attachmentLineId === record.attachmentLineId ? { ...n, _status: flag ? 'update' : '' } : n
    );
    this.setState({ dataSource: newDataSource });
  }

  /**
   * 关闭附件弹窗
   */
  @Bind()
  handleModalCancel() {
    const { onCancel = () => {}, handleRefresh = () => {} } = this.props;
    onCancel();
    handleRefresh();
  }

  render() {
    const { selectedRowKeys, selectedRows, uploadVisible, dataSource, pagination } = this.state;
    const {
      isVisible,
      queryLoading,
      saveLoading,
      deleteLoading,
      viewOnly = true, // 只读
      isPub = false,
      user: {
        currentUser: { id },
      },
      uploadModalEdit = true,
    } = this.props;
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
        width: 170,
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
          const { tenantId, attachmentUrl, _status, uploadUserId } = record;
          return (
            <Fragment>
              {_status === 'update' && (
                <a onClick={() => this.handleEdit(false, record)} style={{ marginRight: 8 }}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {!viewOnly &&
                !isPub &&
                uploadModalEdit &&
                _status !== 'create' &&
                _status !== 'update' && (
                  <a
                    style={{ marginRight: 8 }}
                    onClick={() => this.handleEdit(true, record)}
                    disabled={uploadUserId !== id}
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                )}
              {attachmentUrl && (
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
      selectedRowKeys,
      selectedRows,
      onChange: this.handleRowSelectChange,
    };

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const draggerUploadProps = {
      name: 'file',
      multiple: true,
      // accept: 'image/*',
      data: this.uploadData,
      headers,
      action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      onRemove: this.onDraggerUploadRemove,
      beforeUploadFiles: this.beforeUploadFiles,
    };

    const allLoading = saveLoading || queryLoading || deleteLoading;

    return (
      <Modal
        width={900}
        visible={isVisible}
        onCancel={this.handleModalCancel}
        title={intl.get('hzero.common.upload.modal.attachment').d('附件')}
        footer={
          !viewOnly && !isPub && uploadModalEdit
            ? [
              <Button onClick={this.handleModalCancel} loading={allLoading}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>,
              <Button type="primary" onClick={this.handleSave} loading={allLoading}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>,
              ]
            : null
        }
      >
        <Spin spinning={allLoading || false}>
          {!viewOnly && !isPub && uploadModalEdit && (
            <div className="table-list-search" style={{ textAlign: 'right' }}>
              <Button
                loading={deleteLoading}
                disabled={isEmpty(selectedRows)}
                onClick={this.handleDelete}
                style={{ marginRight: 8 }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button type="primary" onClick={this.handleAdd}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>
            </div>
          )}
          <Table
            bordered
            rowKey="attachmentLineId"
            columns={columns}
            rowSelection={rowSelection}
            dataSource={dataSource}
            pagination={pagination}
            onChange={this.queryAttachment}
          />
        </Spin>
        <Modal
          title={intl.get('hzero.common.upload.text').d('上传附件')}
          visible={uploadVisible}
          onOk={this.onOk}
          onCancel={this.handleCancel}
          destroyOnClose
          width={520}
        >
          <Dragger {...draggerUploadProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">
              {intl
                .get(`sslm.supplyAbility.view.message.uploadMessage`)
                .d('单击或拖动附件(50MB以下)到此区域进行上传')}
            </p>
            <p className="ant-upload-hint">
              {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
            </p>
          </Dragger>
        </Modal>
      </Modal>
    );
  }
}
