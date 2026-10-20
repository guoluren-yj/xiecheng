/**
 * Recommend - 供应商生命周期配置 - 申请单附件表
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Form, Input, Modal, Upload, Icon } from 'hzero-ui';
import { isEmpty, isString, every, map } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { getAccessToken, getCurrentOrganizationId } from 'utils/utils';
import { isReview, reviewFile, downLoadFile, defaultMaxFileSize } from '@/routes/components/utils';
import { fetchRemoteFileSizeLimit } from '@/services/commonService';

const FormItem = Form.Item;
const { Dragger } = Upload;
const organizationId = getCurrentOrganizationId();
const bucketDirectory = 'sslm-lifecycle';

/**
 * 申请单附件表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.commonApplication', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
export default class EnclosureTable extends PureComponent {
  state = {
    selectedRows: [],
    attachmentLineIdList: [],
    uploadVisible: false, // 控制附件上传弹框显隐
  };

  componentDidMount() {
    const { onClearRows } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [], attachmentLineIdList: [] });
  }

  /**
   * 保存选择行的数据
   * @param {Array} selectedRowKeys - 选中行主键
   * @param {Array} selectedRows - 选中行信息
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const attachmentLineIdList = [];
    selectedRows.forEach(item => {
      if (item._status !== 'create') {
        attachmentLineIdList.push(item.attachmentLineId);
      }
    });
    this.setState({ selectedRows, attachmentLineIdList });
  }

  /**
   * 上传附件弹框控制
   */
  @Bind()
  handleUploadModal() {
    const { uploadVisible } = this.state;
    this.setState({ uploadVisible: !uploadVisible });
    if (uploadVisible) {
      const { clearFileList } = this.props;
      clearFileList();
    }
  }

  /**
   * 上传附件弹框确认按钮回调
   */
  @Bind()
  hadnleOnOk() {
    const { onOk } = this.props;
    onOk();
    this.setState({ uploadVisible: false });
  }

  /**
   * 删除选中行
   */
  @Bind()
  handleDelete() {
    const { dataSource, onDeleteRows, remote } = this.props;
    const { selectedRows, attachmentLineIdList } = this.state;

    const newSelectedRows = selectedRows.map(item => {
      return item.attachmentLineId;
    });
    const newDataSource = dataSource.filter(item => {
      return newSelectedRows.indexOf(item.attachmentLineId) > -1 === false;
    });
    // 针对【大族】二开逻辑处理
    const newDataSourceList = remote
      ? remote.process('SSLM_SUPPlIERLIFE_STAGE_ENCLOSURE_DELETE_LIST', newDataSource, {
          dataSource,
          selectedRows,
        })
      : newDataSource;
    this.setState({ selectedRows: [] });
    // 返回true则不继续执行删除逻辑
    const beforeDeleteFlag = remote
      ? remote.process('SSLM_SUPPlIERLIFE_STAGE_ENCLOSURE_BEFORE_DELETE', '', { selectedRows })
      : false;
    if (beforeDeleteFlag) return;
    onDeleteRows(newDataSourceList, attachmentLineIdList);
  }

  // 编辑／取消编辑
  @Bind()
  handleEdit(flag, record) {
    const { dataSource = [], onUpdateRow } = this.props;
    const newDataSource = dataSource.map(n =>
      n.attachmentLineId === record.attachmentLineId ? { ...n, _status: flag ? 'update' : '' } : n
    );
    // 取消编辑时，重置个性化字段
    if (!flag && record.$form) {
      record.$form.resetFields();
    }
    onUpdateRow(newDataSource);
  }

  // 附件配置
  @Bind()
  uploadData(file) {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: bucketDirectory,
      fileName: file.name,
    };
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
   * 上传change触发事件
   * @param {*} info
   */
  @Bind()
  onDraggerUploadChange(info) {
    const { status, response } = info.file;
    const { setFileList } = this.props;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        setFileList(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
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

  render() {
    const {
      isEdit,
      remote,
      onUpdateRow,
      dataSource = [],
      customizeTable,
      custLoading,
      customizeUnitCode = '',
      onDraggerUploadRemove,
      customizeBtnGroup,
      customizeBtnGroupCode,
      otherProps,
    } = this.props;
    const { selectedRows, uploadVisible } = this.state;
    const columns = [
      {
        title: intl.get('sslm.common.view.attachment.name').d('附件名称'),
        width: 200,
        dataIndex: 'attachmentDesc',
        render: (value, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('attachmentDesc', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sslm.common.view.attachment.name').d('附件名称'),
                      }),
                    },
                  ],
                  initialValue: value,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('sslm.common.view.attachment.size').d('附件大小(MB)'),
        width: 150,
        dataIndex: 'attachmentSize',
        render: text => {
          if (text) {
            const size = `${text / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.uploadUserName').d('上传人'),
        width: 150,
        dataIndex: 'realName',
        render: (text, record) => {
          if (isEmpty(text)) {
            return record.loginName;
          } else {
            return text;
          }
        },
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.uploadDate').d('上传时间'),
        width: 150,
        dataIndex: 'uploadDate',
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
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
        width: 150,
        dataIndex: 'options',
        render: (val, record) => {
          const { tenantId, attachmentUrl } = record;
          return (
            <span className="action-link">
              {record.attachmentUrl && (
                <a
                  href={downLoadFile({ tenantId, attachmentUrl })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {intl.get('hzero.common.button.download').d('下载')}
                </a>
              )}
              {isReview(record.attachmentDesc) && record.attachmentUrl && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => reviewFile(record.attachmentDesc, record.attachmentUrl)}
                >
                  {intl.get('hzero.common.button.review').d('预览')}
                </a>
              )}
              {isEdit && record._status !== 'update' && record._status !== 'create' && (
                <a onClick={() => this.handleEdit(true, record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              {isEdit && record._status === 'update' && record._status !== 'create' && (
                <a onClick={() => this.handleEdit(false, record)}>
                  {intl.get(`hzero.common.button.cancel`).d('取消')}
                </a>
              )}
            </span>
          );
        },
      },
    ];
    const newColumns = remote
      ? remote.process('SSLM_SUPPlIERLIFE_STAGE_ENCLOSURE', columns, {
          onUpdateRow,
          dataSource,
          otherProps,
        })
      : columns;
    const rowSelection = {
      onChange: this.onSelectChange,
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
      onRemove: onDraggerUploadRemove,
      beforeUploadFiles: this.beforeUploadFiles,
    };

    return (
      <Fragment>
        {isEdit &&
          (customizeBtnGroup ? (
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row-reverse',
              }}
            >
              {customizeBtnGroup(
                {
                  code: customizeBtnGroupCode,
                },
                [
                  <Button
                    data-name="delete"
                    disabled={isEmpty(selectedRows)}
                    onClick={this.handleDelete}
                    style={{ marginRight: 8 }}
                  >
                    {intl.get('sslm.commonApplication.view.enclosure.delete').d('删除附件')}
                  </Button>,
                  <Button data-name="create" onClick={this.handleUploadModal} type="primary">
                    {intl.get('sslm.commonApplication.view.enclosure.create').d('新建附件')}
                  </Button>,
                ]
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Button
                disabled={isEmpty(selectedRows)}
                onClick={this.handleDelete}
                style={{ marginRight: 8 }}
              >
                {intl.get('sslm.commonApplication.view.enclosure.delete').d('删除附件')}
              </Button>
              <Button onClick={this.handleUploadModal} type="primary">
                {intl.get('sslm.commonApplication.view.enclosure.create').d('新建附件')}
              </Button>
            </div>
          ))}
        {customizeTable ? (
          customizeTable(
            {
              code: customizeUnitCode,
            },
            <EditTable
              rowKey="attachmentLineId"
              bordered
              columns={newColumns}
              dataSource={dataSource}
              rowSelection={isEdit ? rowSelection : null}
              pagination={false}
              custLoading={custLoading}
            />
          )
        ) : (
          <EditTable
            rowKey="attachmentLineId"
            bordered
            columns={newColumns}
            dataSource={dataSource}
            rowSelection={isEdit ? rowSelection : null}
            pagination={false}
          />
        )}

        <Modal
          title={intl.get('hzero.common.upload.text').d('上传附件')}
          visible={uploadVisible}
          onOk={this.hadnleOnOk}
          onCancel={this.handleUploadModal}
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
      </Fragment>
    );
  }
}
