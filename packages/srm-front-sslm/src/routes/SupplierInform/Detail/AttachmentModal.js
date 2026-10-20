/**
 * AttachmentModal - 供货能力清单附件上传弹框
 * @date: 2020-06-01
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import moment from 'moment';
import { connect } from 'dva';
import Bind from 'lodash-decorators/bind';
import { isEmpty, isString } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Upload, Icon, Modal, Button, Input, Form, DatePicker, Spin } from 'hzero-ui';

import uuidv4 from 'uuid/v4';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { dateTimeRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import Table from 'srm-front-boot/lib/components/EditTable';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getEditTableData,
  createPagination,
} from 'utils/utils';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';

const { Dragger } = Upload;
const FormItem = Form.Item;

const organizationId = getCurrentOrganizationId();
@withCustomize({
  unitCode: ['SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ABILITY_LINE_ATTACHMENT'],
})
@connect(({ supplierInform, user, loading }) => ({
  user,
  supplierInform,
  queryLoading: loading.effects['supplierInform/queryLineAttachment'],
  saveLoading: loading.effects['supplierInform/saveLineAttachment'],
  deleteLoading: loading.effects['supplierInform/deleteLineAttachment'],
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
    const { fileSize = 500 * 1024 * 1024 } = this.props;
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
        type: 'supplierInform/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: 'sslm-supplyAbility',
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
      directory: 'sslm-supplyAbility',
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
      abilityLineId,
      changeReqId,
    } = this.props;
    const { fileList = [], dataSource } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          changeReqId,
          abilityLineId,
          loginName,
          uploadUserId: id,
          uploadUserName: realName,
          attachmentDesc: file.name,
          attachmentSize: file.size,
          attachmentUrl: file.response,
          tenantId: organizationId,
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
    const { dispatch, abilityLineId, attCustomizeCode } = this.props;
    dispatch({
      type: 'supplierInform/queryLineAttachment',
      payload: {
        abilityLineId,
        page,
        customizeUnitCode: attCustomizeCode,
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
    const { dispatch, onCancel = e => e, attCustomizeCode } = this.props;
    const tableValues = getEditTableData(dataSource, ['_status', 'attachmentLineId']).map(n => {
      const { dueDate, ...others } = n;
      return { ...others, dueDate: dueDate && moment(dueDate).format(DEFAULT_DATETIME_FORMAT) };
    });

    const flag = !isEmpty(dataSource.filter(n => n._status === 'create' || n._status === 'update'));

    if (!isEmpty(tableValues)) {
      dispatch({
        type: 'supplierInform/saveLineAttachment',
        payload: {
          tableValues,
          customizeUnitCode: attCustomizeCode,
        },
      }).then(res => {
        if (res) {
          notification.success();
          onCancel();
        }
      });
    }

    // 无修改直接关闭弹框
    if (!flag) {
      onCancel();
    }
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows, dataSource } = this.state;
    const { dispatch, attCustomizeCode } = this.props;
    Modal.confirm({
      title: intl.get('sslm.supplyAbility.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        if (!isEmpty(selectedRows)) {
          const createRows = selectedRows.filter(n => n._status === 'create');
          const updateRows = selectedRows.filter(n => n._status !== 'create');
          const attIdList = updateRows.map(n => n.attachmentLineId);

          if (!isEmpty(createRows)) {
            const newAttachmentList = dataSource.filter(n => createRows.indexOf(n) > -1 === false);
            this.setState({ dataSource: newAttachmentList });
          }
          if (!isEmpty(updateRows)) {
            dispatch({
              type: 'supplierInform/deleteLineAttachment',
              payload: {
                attIdList,
                customizeUnitCode: attCustomizeCode,
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

  render() {
    const { selectedRowKeys, selectedRows, uploadVisible, dataSource, pagination } = this.state;
    const {
      isVisible,
      onCancel,
      queryLoading,
      saveLoading,
      deleteLoading,
      viewOnly = false, // 只读
      user: {
        currentUser: { id },
      },
      attCustomizeCode = '',
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get('sslm.common.view.attachment.name').d('附件名称'),
        dataIndex: 'attachmentDesc',
        width: 200,
        render: (val, record) => {
          return isReview(record.attachmentDesc) && record.attachmentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reviewFile(record.attachmentDesc, record.attachmentUrl)}
            >
              {val}
            </a>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
        dataIndex: 'attachmentSize',
        width: 130,
        render: value => {
          if (value) {
            const size = `${value / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.realName`).d('上传人'),
        dataIndex: 'uploadUserName',
        width: 120,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.uploadDate`).d('上传时间'),
        dataIndex: 'uploadDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.attachmentType`).d('文件类型'),
        width: 150,
        dataIndex: 'attachmentType',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('attachmentType', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.maturityDate`).d('文件到期日'),
        width: 200,
        dataIndex: 'dueDate',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('dueDate', {
                initialValue: val && moment(val),
              })(<DatePicker placeholder="" showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
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
              {viewOnly && _status !== 'create' && _status !== 'update' && (
                <a
                  onClick={() => this.handleEdit(true, record)}
                  disabled={uploadUserId !== id}
                  style={{ marginRight: 8 }}
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
    };

    return (
      <Modal
        width={900}
        visible={isVisible}
        onCancel={onCancel}
        confirmLoading={saveLoading}
        title={intl.get('hzero.common.upload.modal.title').d('附件')}
        footer={
          viewOnly
            ? [
              <Button onClick={onCancel}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>,
              <Button type="primary" onClick={this.handleSave}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>,
              ]
            : null
        }
      >
        <Spin spinning={queryLoading}>
          {viewOnly && (
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
          {customizeTable(
            {
              code: attCustomizeCode,
            },
            <Table
              bordered
              rowKey="attachmentLineId"
              columns={columns}
              rowSelection={rowSelection}
              dataSource={dataSource}
              pagination={pagination}
              onChange={this.queryAttachment}
            />
          )}
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
                .get(`sslm.common.upload.content`)
                .d('单击或拖动附件(500MB以下)到此区域进行上传')}
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
