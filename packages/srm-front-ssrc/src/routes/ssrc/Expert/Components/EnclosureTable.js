/**
 * EnclosureTable - 附件上传
 * @date: 2019-01-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Form, Button, Input, Modal, Upload, Icon } from 'hzero-ui';
import { isEmpty, isString, noop } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getAttachmentUrl, getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import notification from 'utils/notification';
import { HZERO_FILE } from 'utils/config';
import EditTable from 'components/EditTable';
import { PRIVATE_BUCKET } from '_utils/config';
import styles from './index.less';

const { Dragger } = Upload;
const promptCode = 'ssrc.expert';

/**
 * 附件上传
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
class EnclosureTable extends PureComponent {
  constructor(props) {
    super(props);
    const { isReq = true, expertReqId, expertId } = props;
    const dataListName = isReq ? 'enclosureReqList' : 'enclosureList';
    const rowKey = isReq ? 'expertAttachmentReqId' : 'expertAttachmentId';
    const rowKeyValue = isReq ? expertReqId : expertId;
    this.state = {
      selectedRows: [],
      rowKey,
      rowKeyValue,
      dataListName,
      tenantId: getCurrentOrganizationId(),
      uploadVisible: false,
    };
  }

  /**
   * 保存选中的行
   * @param {*} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 删除新建行
   */
  @Bind()
  deleteRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].filter(
      (item) => item[rowKey] !== record[rowKey]
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 取消编辑行
   */
  @Bind()
  cancelRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].map((item) => {
      if (item[rowKey] === record[rowKey]) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 编辑行
   */
  @Bind()
  editRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dispatch, onReload, isReq = true, modelName = 'expert' } = this.props;
    const { selectedRows, rowKey } = this.state;
    const idList = selectedRows.map((o) => o[rowKey]);
    dispatch({
      type: `${modelName}/tableDelete`,
      payload: {
        isReq,
        idList,
        functionName: 'enclosure',
      },
    }).then((res) => {
      if (res) {
        onReload();
        notification.success();
        this.setState({ selectedRows: [] });
      }
    });
  }

  /**
   * 控制 Modal显隐
   */
  @Bind()
  handleModalDisplay() {
    const { uploadVisible } = this.state;
    this.setState({ uploadVisible: !uploadVisible, fileList: [] });
  }

  /**
   * modal确认按钮回调
   */
  @Bind()
  handleUploadOk() {
    const { fileList = [] } = this.state;
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { tenantId, rowKey, dataListName, rowKeyValue } = this.state;
    const fileData = fileList.map((file) => {
      return {
        [rowKey]: uuidv4(),
        uid: file.uid,
        attachmentName: file.name,
        attachmentUrl: file.response,
        remark: '',
        tenantId,
        _status: 'create',
      };
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: [...fileData, ...expert[rowKeyValue][dataListName]],
        },
      },
    });
    this.setState({ uploadVisible: false });
  }

  /**
   * 将上传列表放到state
   * @param {object} file
   */
  @Bind()
  setFileList(file) {
    const { fileList = [] } = this.state;
    this.setState({
      fileList: [...fileList, file],
    });
  }

  /**
   * 上传前的校验
   * @param {Object} file - 上传的文件
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize = 30 * 1024 * 1024 } = this.props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: `${intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)}`)}MB`,
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  @Bind()
  uploadData(file) {
    return {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'srm-source',
      directory: 'srm-source',
      fileName: file.name,
    };
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
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { dispatch, modelName = 'expert' } = this.props;
    const { fileList } = this.state;
    if (isString(file.response)) {
      dispatch({
        type: `${modelName}/removeAttachment`,
        payload: {
          tenantId: getCurrentOrganizationId(),
          bucketName: PRIVATE_BUCKET,
          directory: 'srm-source',
          urls: [file.response],
        },
      }).then((res) => {
        if (res) {
          this.setState({
            fileList: fileList.filter((o) => o.uid !== file.uid),
          });
          notification.success();
        }
      });
    }
  }

  render() {
    const { modelName = 'expert', customizeTable = noop, enclosureTableCode = '' } = this.props;
    const { deleting, isEdit = true, [modelName]: expert = {} } = this.props;
    const { selectedRows, rowKey, tenantId, uploadVisible, dataListName, rowKeyValue } = this.state;
    const dataListIdMap = expert[rowKeyValue] || {};
    const dataList = dataListIdMap[dataListName] || [];
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
      action: `${HZERO_FILE}/v1/${tenantId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      onRemove: this.onDraggerUploadRemove,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.expert.attachmentName`).d('附件名'),
        dataIndex: 'attachmentName',
        width: 150,
        render: (value, record) => (
          <a
            href={getAttachmentUrl(record.attachmentUrl, PRIVATE_BUCKET, tenantId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.expert.attachment.remark`).d('附件说明'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('remark', {
                  initialValue: record.remark,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.realName`).d('上传人'),
        dataIndex: 'realName',
        width: 100,
        render: (_, record) => record.realName || record.loginName,
      },
      {
        title: intl.get(`${promptCode}.model.expert.uploadDate`).d('上传时间'),
        dataIndex: 'uploadDate',
        width: 150,
        // render: dateRender,
      },
    ];
    if (isEdit) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.deleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.cancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.editRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      });
    }
    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };
    return (
      <React.Fragment>
        {isEdit && (
          <div className={styles['item-list-search']}>
            <Form layout="inline">
              <Button
                type="primary"
                icon="plus"
                style={{ marginRight: 8 }}
                onClick={this.handleModalDisplay}
              >
                {intl.get(`${promptCode}.view.supQuo.uploadAttach`).d('上传附件')}
              </Button>
              <Button
                icon="delete"
                style={{ marginRight: 8 }}
                loading={deleting}
                disabled={isEmpty(selectedRows)}
                onClick={this.handleDelete}
              >
                {intl.get(`${promptCode}.view.message.toolTip.enclosure.delete`).d('删除附件')}
              </Button>
            </Form>
          </div>
        )}

        {customizeTable(
          {
            code: enclosureTableCode,
          },
          <EditTable
            bordered
            rowKey={rowKey}
            dataSource={dataList}
            columns={columns}
            pagination={false}
            rowSelection={isEdit ? rowSelection : null}
          />
        )}
        <Modal
          destroyOnClose
          width={520}
          title={intl.get(`hzero.common.upload.text`).d('上传附件')}
          visible={uploadVisible}
          onOk={this.handleUploadOk}
          onCancel={this.handleModalDisplay}
        >
          <Dragger {...draggerUploadProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">
              {intl
                .get(`hzero.common.upload.content`)
                .d('单击或拖动附件(10Mb以下)到此区域进行上传')}
            </p>
            <p className="ant-upload-hint">
              {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
            </p>
          </Dragger>
        </Modal>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return connect(({ expert, loading }) => ({
    expert,
    modelName: 'expert',
    deleting: loading.effects['expert/tableDelete'],
  }))(Comp);
};

export default HOCComponent(EnclosureTable);

export { HOCComponent, EnclosureTable };
