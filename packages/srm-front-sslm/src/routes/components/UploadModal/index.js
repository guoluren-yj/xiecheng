import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Icon, Modal, Button, Form, Input, DatePicker, Upload, Spin } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import { dateTimeRender } from 'utils/renderer';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { getCurrentOrganizationId, getAccessToken, getEditTableData } from 'utils/utils';
import { isEmpty, compose, isString, uniqBy, every, map } from 'lodash';
import {
  onDraggerUploadRemove as onDraggerUploadRemoveFields,
  queryAttachment as onQueryAttachment,
  onAttachmentRemove,
  queryAttachmentList,
} from '@/services/attachmentInvestigationServices';
import {
  isReview,
  reviewFile,
  downLoadFile,
  renderAttachmentText,
} from '@/routes/components/utils';

import { fetchRemoteFileSizeLimit } from '@/services/commonService';

const { Dragger } = Upload;
const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId();
const bucketDirectory = 'sslm-investigation';

const UploadModal = props => {
  const {
    fieldCode,
    isViewOnly,
    form,
    attachmentTotal,
    record: {
      investgProserviceId,
      isCreate,
      isUpdate,
      tenantId: purchaserTenantId,
      supplierBasicId,
      supplierProserviceId,
    },
    user: {
      currentUser: { id, loginName, realName },
    },
    fileSize = 500 * 1024 * 1024,
    onUploadData,
    linkColor,
    mandatoryField,
  } = props;
  const mandatoryFieldList = (mandatoryField && mandatoryField.split(',')) || [];
  const [visible, setVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const attchmentList = props.record[fieldCode]?.map(n => {
    const { _status, ...others } = n;
    return others;
  });

  /**
   * 查询
   */
  const queryAttachment = useCallback(
    (list = []) => {
      setSpinning(true);
      if (supplierBasicId) {
        // 360查询
        queryAttachmentList({
          organizationId,
          supplierProserviceId,
        }).then(res => {
          if (res) {
            // const updateDataSource = (form?.getFieldValue(fieldCode) || list || []).map((n) =>
            //   n.investgProserviceAttId ? n : { ...n, investgProserviceAttId: uuidv4() }
            // );
            // const finalyDataSource = uniqBy(
            //   [...updateDataSource, ...res],
            //   'investgProserviceAttId'
            // );

            setDataSource(res);
            setSpinning(false);
          }
        });
      } else {
        onQueryAttachment({
          organizationId,
          investgProserviceId,
        }).then(res => {
          if (res) {
            const updateDataSource = (form?.getFieldValue(fieldCode) || list || []).map(n =>
              n.investgProserviceAttId ? n : { ...n, investgProserviceAttId: uuidv4() }
            );
            const finalyDataSource = uniqBy(
              [...updateDataSource, ...res],
              'investgProserviceAttId'
            );

            setDataSource(finalyDataSource);
            setSpinning(false);
          }
        });
      }
    },
    [investgProserviceId, supplierProserviceId]
  );

  // 打开上传附件弹窗
  const handleOpenUploadModal = () => {
    setVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    if (form) {
      form.setFieldsValue({ fileCount: dataSource.length });
    }
    setDataSource([]);
  };

  const handleRowSelectChange = (newSelectedRowKeys, newSelectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  /**
   * 新建
   */
  const handleAdd = () => {
    setUploadVisible(true);
  };

  /**
   * 附件配置
   * @param {object} file
   */
  const uploadData = file => {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: bucketDirectory,
      fileName: file.name,
    };
  };

  /**
   * 上传前的校验
   * @param {*} file
   */
  const beforeUpload = file => {
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
  };

  const beforeUploadFiles = async files => {
    // const { fileSize: defaultFileSize = defaultMaxFileSize } = this.props;
    const remoteFileSize = await fetchRemoteFileSizeLimit(PRIVATE_BUCKET, bucketDirectory);
    const finallFileSize = remoteFileSize || fileSize;
    const fileSizeValidate = every(
      map(files, file => {
        if (finallFileSize && file.size > finallFileSize) {
          file.status = 'error'; // eslint-disable-line
          notification.error({
            message: intl.get('hzero.common.upload.status.error').d('上传失败'),
            description: intl
              .get('hzero.common.upload.error.size', {
                fileSize: finallFileSize / (1024 * 1024),
              })
              .d(`上传文件大小不能超过: ${finallFileSize / (1024 * 1024)} MB`),
          });
          return false;
        }
        return true;
      })
    );
    return fileSizeValidate;
  };

  /**
   * 上传change触发事件
   * @param {Object} info - 上传的文件
   */
  const onDraggerUploadChange = info => {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        setFileList([...fileList, info.file]);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  };

  /**
   * 删除文件回调函数
   * @param {*} file
   */
  const onDraggerUploadRemove = file => {
    if (isString(file.response)) {
      onDraggerUploadRemoveFields({
        organizationId,
        bucketName: PRIVATE_BUCKET,
        directory: bucketDirectory,
        urls: [file.response],
      }).then(res => {
        if (res) {
          setFileList(fileList.filter(o => o.uid !== file.uid));
          notification.success();
        }
      });
    }
  };

  /**
   * modal 确认按钮回调
   */
  const onOk = () => {
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          loginName,
          uploadUserId: id,
          uploadUserName: realName,
          attachmentDesc: file.name,
          attachmentSize: file.size,
          attachmentUrl: file.response,
          tenantId: purchaserTenantId,
          investgProserviceAttId: uuidv4(),
          investgProserviceId: isCreate || isUpdate ? null : investgProserviceId,
          _status: 'create',
        }))
      : [];
    setUploadVisible(false);
    setFileList([]);
    setDataSource([...fileData, ...dataSource]);
  };

  /**
   * 关闭上传附件模态框
   */
  const handleClose = () => {
    setUploadVisible(false);
    setFileList([]);
  };

  /**
   * 删除
   */
  const handleDelete = () => {
    Modal.confirm({
      title: intl.get('sslm.common.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        setDeleteLoading(true);
        if (!isEmpty(selectedRows)) {
          const createRows = selectedRows.filter(n => n._status === 'create');
          const updateRows = selectedRows.filter(n => n._status !== 'create');
          const attIdList = updateRows.map(n => ({
            investgProserviceAttId: n.investgProserviceAttId,
          }));

          if (!isEmpty(createRows)) {
            const newAttachmentList = dataSource.filter(n => createRows.indexOf(n) > -1 === false);
            setDataSource(newAttachmentList);
            const tableValues = getEditTableData(newAttachmentList, ['investgProserviceAttId']).map(
              n => {
                const { dueDate, ...others } = n;
                return {
                  ...others,
                  dueDate: dueDate && moment(dueDate).format(DEFAULT_DATETIME_FORMAT),
                };
              }
            );
            onUploadData(tableValues);
            setDeleteLoading(false);
          }
          if (!isEmpty(updateRows)) {
            const newFormAttachmentList = (form?.getFieldValue(fieldCode) || []).filter(
              n => updateRows.indexOf(n) > -1 === false
            );
            if (form) {
              form.setFieldsValue({
                [fieldCode]: newFormAttachmentList,
              });
            }
            onAttachmentRemove({ organizationId, attIdList }).then(res => {
              if (res) {
                notification.success();
                setDeleteLoading(false);
                queryAttachment();
              }
            });
          }
          setSelectedRows([]);
          setSelectedRowKeys([]);
        }
      },
    });
  };

  /**
   * 编辑／取消编辑
   */
  const handleEdit = (flag, record) => {
    const newDataSource = dataSource.map(n =>
      n.investgProserviceAttId === record.investgProserviceAttId
        ? { ...n, _status: flag ? 'update' : '' }
        : n
    );
    setDataSource(newDataSource);
  };

  /**
   * 点击确定把数据写回编辑表单
   */
  const handleOk = () => {
    if (isViewOnly) {
      handleCancel(); // 关闭弹窗
    } else {
      const tableValues = getEditTableData(dataSource, ['investgProserviceAttId']).map(n => {
        const { dueDate, ...others } = n;
        return {
          ...others,
          dueDate: dueDate && moment(dueDate).format(DEFAULT_DATETIME_FORMAT),
        };
      });
      const flag = !isEmpty(
        dataSource.filter(n => n._status === 'create' || n._status === 'update')
      );

      // 无修改直接关闭弹框
      if (!flag) {
        handleCancel(tableValues);
        // handleAttrChange();
      } else {
        onUploadData(tableValues);
        handleCancel();
      }
    }
  };

  /**
   * onCell
   * @param {number} maxWidth - 单元格最大宽度
   */
  const onCell = maxWidth => {
    return {
      style: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: maxWidth || 180,
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  };

  // 上传附件弹窗props
  const uploadModalProps = {
    title: isViewOnly
      ? intl.get('hzero.common.upload.viewOnlyText').d('查看附件')
      : intl.get(`hzero.common.upload.text`).d('上传附件'),
    visible,
    onOk: handleOk,
    onCancel: handleCancel,
    width: 900,
  };

  const columns = [
    {
      title: intl.get('sslm.common.view.attachment.name').d('附件名称'),
      dataIndex: 'attachmentDesc',
      width: 150,
      onCell,
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
      onCell,
    },
    {
      title: intl.get(`sslm.common.model.attachment.realName`).d('上传人'),
      dataIndex: 'uploadUserName',
      width: 120,
      onCell,
    },
    {
      title: intl.get(`sslm.common.model.attachment.uploadDate`).d('上传时间'),
      dataIndex: 'uploadDate',
      width: 150,
      onCell,
      render: dateTimeRender,
    },
    {
      title: intl.get(`sslm.common.model.supplyAbility.attachmentType`).d('文件类型'),
      width: 120,
      onCell,
      dataIndex: 'attachmentType',
      render: (val, record) => {
        return ['create', 'update'].includes(record._status) ? (
          <FormItem>
            {record.$form.getFieldDecorator('attachmentType', {
              initialValue: val,
              rules: [
                {
                  required: mandatoryFieldList.includes('fileType'),
                  message: intl.get(`sslm.common.model.supplyAbility.attachmentType`).d('文件类型'),
                },
              ],
            })(<Input />)}
          </FormItem>
        ) : (
          val
        );
      },
    },
    {
      title: intl.get(`sslm.common.model.supplyAbility.maturityDate`).d('文件到期日'),
      width: 150,
      onCell,
      dataIndex: 'dueDate',
      render: (val, record) =>
        ['create', 'update'].includes(record._status) ? (
          <FormItem>
            {record.$form.getFieldDecorator('dueDate', {
              initialValue: val && moment(val),
              rules: [
                {
                  required: mandatoryFieldList.includes('expired'),
                  message: intl.get(`sslm.common.model.supplyAbility.maturityDate`).d('文件到期日'),
                },
              ],
            })(
              <DatePicker
                // placeholder=""
                // showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
                disabledDate={c => c && c < moment().endOf('day')}
              />
            )}
          </FormItem>
        ) : (
          val
        ),
    },
    {
      title: intl.get('hzero.common.remark').d('备注'),
      dataIndex: 'remark',
      width: 150,
      onCell,
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
      onCell,
      render: (_, record) => {
        const { tenantId, attachmentUrl, _status, uploadUserId } = record;
        return (
          <Fragment>
            {_status === 'update' && (
              <a onClick={() => handleEdit(false, record)} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {!isViewOnly && _status !== 'create' && _status !== 'update' && (
              <a
                onClick={() => handleEdit(true, record)}
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
    onChange: handleRowSelectChange,
  };
  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }
  const draggerUploadProps = {
    name: 'file',
    multiple: true,
    data: uploadData,
    headers,
    action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
    beforeUpload,
    onChange: onDraggerUploadChange,
    onRemove: onDraggerUploadRemove,
    beforeUploadFiles,
  };

  useEffect(() => {
    if (visible) {
      if ((investgProserviceId || supplierProserviceId) && !isCreate) {
        queryAttachment(attchmentList);
      } else {
        const updateDataSource = (form?.getFieldValue(fieldCode) || attchmentList || []).map(n =>
          n.investgProserviceAttId
            ? n
            : {
                ...n,
                investgProserviceAttId: uuidv4(),
                _status: isViewOnly ? '' : 'create',
              }
        );
        const finalyDataSource = uniqBy(
          [...updateDataSource, ...dataSource],
          'investgProserviceAttId'
        );

        setDataSource(finalyDataSource);
      }
    }
  }, [investgProserviceId, visible, isCreate, supplierProserviceId]);

  const fileCount = form?.getFieldValue('fileCount') || attachmentTotal;
  return (
    <Fragment>
      <a onClick={handleOpenUploadModal}>
        {isViewOnly ? <Icon type="link" /> : <Icon type="upload" />}
        <span style={{ marginLeft: '4px' }}>
          {renderAttachmentText({
            editable: !isViewOnly,
            fileCount,
            linkColor,
          })}
        </span>
      </a>
      {visible && (
        <Modal {...uploadModalProps}>
          <Spin spinning={spinning}>
            {!isViewOnly && (
              <div className="table-list-search" style={{ textAlign: 'right' }}>
                <Button
                  loading={deleteLoading}
                  disabled={isEmpty(selectedRows)}
                  onClick={handleDelete}
                  style={{ marginRight: 8 }}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
                <Button type="primary" onClick={handleAdd}>
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>
              </div>
            )}
            <EditTable
              bordered
              rowKey="investgProserviceAttId"
              columns={columns}
              rowSelection={isViewOnly ? null : rowSelection}
              dataSource={dataSource}
              pagination={false}
            />
          </Spin>
        </Modal>
      )}
      {uploadVisible && (
        <Modal
          title={intl.get('hzero.common.upload.text').d('上传附件')}
          visible={uploadVisible}
          onOk={onOk}
          onCancel={handleClose}
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
      )}
    </Fragment>
  );
};

export default compose(
  connect(({ user }) => {
    const { currentUser: { themeConfigVO = {} } = {} } = user;
    const {
      enableThemeConfig, // 是否开启了新主题
      colorCode, // 主题色
      fontFileId,
      componentColorList, // 组件主题列表
    } = themeConfigVO;
    let themeConfig = {};
    if (enableThemeConfig) {
      const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
      themeConfig = {
        primaryColor: colorCode,
        linkColor: componentsColor['link-color'],
        anchorColor: componentsColor['anchor-primary-color'],
        fontFamily: `font-${fontFileId}`, // 字体
      };
    }
    return {
      user,
      ...themeConfig,
    };
  })
)(UploadModal);
