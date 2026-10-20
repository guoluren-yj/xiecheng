/**
 * AttachmentInfo - 附件信息
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import Bind from 'lodash-decorators/bind';
import { isEmpty, isString, isFunction, isNumber, sum } from 'lodash';
import { Upload, Icon, Modal, Button, Input, Form, Spin, Select } from 'hzero-ui';

import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';
import Table from 'srm-front-boot/lib/components/EditTable';
import Checkbox from 'components/Checkbox';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getEditTableData,
  createPagination,
  addItemsToPagination,
  delItemsToPagination,
} from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';

const { Dragger } = Upload;
const FormItem = Form.Item;
const { Option } = Select;

const organizationId = getCurrentOrganizationId();
@connect(({ siteInvestigateReport, user, loading }) => ({
  user,
  siteInvestigateReport,
  queryLoading: loading.effects['siteInvestigateReport/queryAttachment'],
  saveLoading: loading.effects['siteInvestigateReport/saveAttachment'],
  deleteLoading: loading.effects['siteInvestigateReport/deleteAttachment'],
}))
export default class AttachmentInfo extends Component {
  constructor(props) {
    super(props);
    const { onRef = e => e } = props;
    onRef(this);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [], // 选中项的key
      uploadVisible: false,
      fileList: [],
      dataSource: [],
      pagination: {},
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { evalHeaderId: prevEvalHeaderId } = prevProps;
    const { evalHeaderId } = this.props;
    return evalHeaderId !== prevEvalHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.queryAttachment();
    }
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.init();
    this.queryAttachment();
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    const lovCodes = {
      attachmentlTypeList: 'SSLM.SITE_EVALATT_LN_TYPE',
      tenantId: organizationId,
    };

    dispatch({
      type: 'siteInvestigateReport/queryAttMapIdpValue',
      payload: lovCodes,
    });
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
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
        type: 'siteInvestigateReport/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: 'sslm-report',
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
      directory: 'sslm-report',
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
      basicInfo = {},
      evalHeaderId,
    } = this.props;
    const { evalStatus, evalStatusMeaning } = basicInfo;
    const { fileList = [], dataSource, pagination } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          loginName,
          evalHeaderId,
          uploadUserId: id,
          createdBy: id,
          lnEvalStatus: evalStatus,
          lnEvalStatusMeaning: evalStatusMeaning,
          uploadUserName: realName,
          attachmentDesc: file.name,
          attachmentSize: file.size,
          attachmentUrl: file.response,
          tenantId: organizationId,
          attId: uuidv4(),
          _status: 'create',
        }))
      : [];
    this.setState({
      uploadVisible: false,
      fileList: [],
      dataSource: [...fileData, ...dataSource],
      pagination: addItemsToPagination(fileData.length, dataSource.length, pagination),
    });
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
    const {
      dispatch,
      evalHeaderId,
      entrance = '',
      isAlreadyFeedback,
      customizeCode: customizeUnitCode,
      user: {
        currentUser: { id },
      },
      updateFileNum = () => {},
    } = this.props;
    const payload = {
      isAlreadyFeedback,
      customizeUnitCode,
      evalHeaderId,
      page,
    };
    if (entrance === 'filling') {
      payload.uploadUserId = id;
    }
    dispatch({
      type: 'siteInvestigateReport/queryAttachment',
      payload,
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(n => ({ ...n, _status: 'update' })),
          pagination: createPagination(res),
        });
        // 获取附件数量
        const { totalElements } = res;
        updateFileNum(totalElements);
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dispatch, customizeCode: customizeUnitCode } = this.props;
    const { dataSource } = this.state;
    const tableValues = getEditTableData(dataSource, ['attId', '_status']);
    dispatch({
      type: 'siteInvestigateReport/saveAttachment',
      payload: {
        tableValues,
        customizeUnitCode,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.queryAttachment();
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows, dataSource, pagination } = this.state;
    const { dispatch } = this.props;
    Modal.confirm({
      title: intl.get('sslm.siteInvestigateReport.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        if (!isEmpty(selectedRows)) {
          const createRows = selectedRows.filter(n => n._status === 'create').map(n => n.attId);
          const updateRows = selectedRows.filter(n => n._status === 'update').map(n => n.attId);

          if (!isEmpty(createRows)) {
            const newAttachmentList = dataSource.filter(
              n => createRows.indexOf(n.attId) > -1 === false
            );
            this.setState({
              dataSource: newAttachmentList,
              pagination: delItemsToPagination(createRows.length, dataSource.length, pagination),
            });
          }
          if (!isEmpty(updateRows)) {
            dispatch({
              type: 'siteInvestigateReport/deleteAttachment',
              payload: updateRows,
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

  render() {
    const { selectedRowKeys, selectedRows, uploadVisible, dataSource, pagination } = this.state;
    const {
      remote,
      evalStatus = '',
      queryLoading,
      saveLoading,
      deleteLoading,
      isView = false,
      isPub = false,
      customizeTable,
      custLoading,
      customizeCode = '',
      entrance = '',
      user,
      user: {
        currentUser: { id },
      },
      basicInfo,
      customizeBtnGroup,
      customizeBtnGroupCode,
      basicInfo: { evalStatus: feedBackEvalStatus } = {},
      siteInvestigateReport: { attCode: { attachmentlTypeList = [] } = {} } = {},
    } = this.props;
    const newEdit =
      !isView &&
      !isPub &&
      (evalStatus === 'NEW' ||
        (entrance === 'filling' && evalStatus === 'MANUAL_EVALUATING') ||
        entrance === 'feedBack' ||
        evalStatus === 'FEEDBACK' ||
        evalStatus === 'FEEDBACK_APPROVALED' ||
        evalStatus === 'NEW_APPROVALED');
    const isEdit = remote
      ? remote.process('SSLM_SUPPLIER_SITE_REPORT_DETAIL_ATT_EDIT_FLAG', newEdit, {
          evalStatus,
          basicInfo,
          dataSource,
        })
      : newEdit;

    const columns = [
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.lnEvalStatusMeaning').d('上传节点'),
        dataIndex: 'lnEvalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.common.view.attachment.type').d('附件类型'),
        dataIndex: 'attachmentlTypeMeaning',
        width: 140,
        render: (val, record) =>
          record.createdBy !== id || record.lnEvalStatus !== feedBackEvalStatus ? (
            val
          ) : isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('attachmentlType', {
                initialValue: record.attachmentlType,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {attachmentlTypeList.map(n => (
                    <Option value={n.value} key={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.attachmentName').d('附件名称'),
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
        title: intl.get('sslm.siteInvestigateReport.modal.mange.attachmentSize').d('附件大小(MB)'),
        dataIndex: 'attachmentSize',
        width: 120,
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
        title: intl.get('sslm.siteInvestigateReport.modal.mange.uploadedBy').d('上传人'),
        dataIndex: 'uploadUserName',
        width: 150,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.uploadedTime').d('上传时间'),
        dataIndex: 'uploadDate',
        width: 180,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) =>
          record.createdBy !== id || record.lnEvalStatus !== feedBackEvalStatus ? (
            val
          ) : isEdit && ['create', 'update'].includes(record._status) ? (
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
        dataIndex: 'operate',
        width: 80,
        render: (val, record) => {
          const { tenantId, attachmentUrl } = record;
          return (
            <Fragment>
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
    if (entrance !== 'feedBack' && entrance !== 'receive') {
      columns.splice(6, 0, {
        title: intl
          .get('sslm.siteInvestigateReport.modal.mange.inside')
          .d('内部附件（供应商不可见）'),
        dataIndex: 'insideFlagMeaning',
        width: 180,
        render: (val, record) =>
          record.createdBy !== id || record.lnEvalStatus !== feedBackEvalStatus ? (
            val
          ) : isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('insideFlag', {
                initialValue: record.insideFlag || 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
            </FormItem>
          ) : (
            val
          ),
      });
    }
    const remoteCols = remote
      ? remote.process('SSLM_SUPPLIER_SITE_REPORT_DETAIL_ATT_COLUMNS', columns, {
          user,
          isEdit,
          basicInfo,
        })
      : columns;

    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => {
        return {
          disabled:
            entrance === 'feedBack'
              ? record.createdBy !== id
              : record.createdBy !== id || record.lnEvalStatus !== feedBackEvalStatus,
        };
      },
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

    const scrollX = sum(remoteCols.map(n => (isNumber(n.width) ? n.width : 150)));
    const buttons = [
      <Button
        data-name="delete"
        loading={deleteLoading}
        disabled={isEmpty(selectedRows)}
        onClick={this.handleDelete}
        style={{ marginRight: 8 }}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>,
      <Button
        data-name="save"
        loading={saveLoading}
        onClick={this.handleSave}
        style={{ marginRight: 8 }}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <Button type="primary" data-name="create" onClick={this.handleAdd} style={{ marginRight: 8 }}>
        {intl.get(`hzero.common.button.create`).d('新建')}
      </Button>,
    ];
    return (
      <Spin spinning={queryLoading}>
        {isEdit && (
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            {customizeBtnGroup
              ? customizeBtnGroup({ code: customizeBtnGroupCode }, buttons)
              : buttons}
          </div>
        )}
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeCode,
            },
            <Table
              bordered
              custLoading={custLoading}
              rowKey="attId"
              columns={remoteCols}
              dataSource={dataSource}
              pagination={pagination}
              scroll={{ x: scrollX, y: 350 }}
              rowSelection={isEdit ? rowSelection : null}
              onChange={this.queryAttachment}
            />
          )
        ) : (
          <Table
            bordered
            rowKey="attId"
            columns={remoteCols}
            dataSource={dataSource}
            pagination={pagination}
            scroll={{ x: scrollX, y: 350 }}
            rowSelection={isEdit ? rowSelection : null}
            onChange={this.queryAttachment}
          />
        )}
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
      </Spin>
    );
  }
}
