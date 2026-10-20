/*
 * 附件上传组件
 * @date: 2019-05-28
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Modal, Spin, Row, Col, Icon, Upload, Tooltip, Tag } from 'hzero-ui';
import { connect } from 'dva';
import Viewer from 'react-viewer';
import { isArray, isEmpty, isString } from 'lodash';
import { Bind } from 'lodash-decorators';

import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getResponse,
  getAttachmentUrl,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryUUID } from 'services/api';

import styles from './index.less';

const DEFAULT_BUCKET_NAME = 'bucket-private';
const viewMessagePrompt = 'spcm.common.view.message';
/**
 * Attachment - 附件上传
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {string} [templateFileUrl] - 协议文本url
 * @reactProps {array} [templateList=array] - 模板列表，遍历来渲染上传信息
 * @reactProps {Object} [purchaserParams={purchaserUploadFlag, purchaserViewFlag}] - 采购方配置属性
 * @reactProps {Object} [supplierParams={supplierUploadFlag, supplierViewFlag}] - 供应方配置属性
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @reactProps {Function} [onRefresh] - 查询配置的模板数组
 * @reactProps {Function} [onUpdateHeader] - 更新头上信息
 * @return React.element
 */
@connect(({ loading, contractCommon }) => ({
  queryAttachmentList: loading.effects['contractCommon/queryFileListOrg'],
  contractCommon,
}))
@formatterCollections({
  code: ['spcm.common', 'entity.attachment'],
})
export default class Attachment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false, // 预览图片
      previewImages: [], // 预览数据
      visible: false, // 上传弹窗
      fileMap: {
        purchaseUploadFileList: [], // 采购方附件列表
        supplierUploadFileList: [], // 供应方附件列表
        templateUploadFileList: [], // 协议文本附件列表
        contractTemplateUploadFileList: [], // 协议模板附件列表
      }, // 上传组件文件列表map
      tenantId: getCurrentOrganizationId(),
      accessToken: getAccessToken(),
      renderFlag: false,
    };
  }

  componentDidMount() {
    this.fetchAttachmentList();
  }

  shouldComponentUpdate(nextProps, { renderFlag }) {
    if (!renderFlag) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * 改变附件弹窗显隐
   * @param {*} field
   * @param {*} value
   */
  @Bind()
  handleModalVisible(field, value) {
    this.setState({ [field]: value });
    if (field === 'visible') {
      if (value === true) {
        this.fetchAttachmentList();
      } else if (value === false) {
        // this.setState({ fileMap: {} });
      }
    }
  }

  @Bind()
  async fetchAttachmentList() {
    const { tenantId } = this.state;
    const {
      dispatch,
      attachmentUUID,
      onFetchHeader,
      supplierAttachmentUuid,
      contractTypeFlag,
      onChangeState,
      bucketDirectory,
      bucketName = DEFAULT_BUCKET_NAME,
      headerInfo = {},
      templateList = [],
      purchaserParams = {},
      supplierParams = {},
    } = this.props;
    const { purchaserUploadFlag } = purchaserParams;
    const { supplierUploadFlag, supplierViewFlag } = supplierParams;
    const newFileMap = {};
    // 将配置的附件列表渲染上去
    templateList.forEach(item => {
      if (item.attachmentUrl) {
        const sourceField = `${item.attachmentId}UploadFileList`;
        newFileMap[sourceField] = [
          {
            response: item.remark,
            uid: item.attachmentId,
            name: item.attachmentUrl.substr(item.attachmentUrl.lastIndexOf('@') + 1),
            status: 'done',
            url: getAttachmentUrl(item.attachmentUrl, bucketName, tenantId, bucketDirectory),
          },
        ];
      }
    });
    this.setState(state => ({
      fileMap: {
        ...state.fileMap,
        ...newFileMap,
      },
    }));
    // 格式化协议文本列表
    if (headerInfo.contractAttachmentUrl && headerInfo.pcKindCode === 'ATTACHMENT') {
      const sourceKey = 'templateUploadFileList';
      const nameKey = 'contractAttachmentUrl';
      this.setState(state => ({
        fileMap: {
          ...state.fileMap,
          [sourceKey]: [
            {
              uid: 1,
              name: headerInfo[nameKey].substr(headerInfo[nameKey].lastIndexOf('@') + 1),
              status: 'done',
              url: getAttachmentUrl(headerInfo[nameKey], bucketName, tenantId, bucketDirectory),
            },
          ],
        },
      }));
    }
    // 格式化模板附件列表
    if (
      headerInfo.templateFileUrl &&
      contractTypeFlag &&
      headerInfo.templateFileUrl !== 'NULL_TEMPLATE'
    ) {
      const sourceKey = 'contractTemplateUploadFileList';
      const nameKey = 'templateFileUrl';
      this.setState(state => ({
        fileMap: {
          ...state.fileMap,
          [sourceKey]: [
            {
              uid: 1,
              name: headerInfo[nameKey].substr(headerInfo[nameKey].lastIndexOf('@') + 1),
              status: 'done',
              url: getAttachmentUrl(headerInfo[nameKey], bucketName, tenantId, bucketDirectory),
            },
          ],
        },
      }));
    }
    // 查询采购方附件
    if (attachmentUUID) {
      await dispatch({
        type: 'contractCommon/queryFileListOrg',
        payload: {
          attachmentUUID,
          bucketName: DEFAULT_BUCKET_NAME,
        },
      }).then(res => {
        if (res) {
          this.setState(state => ({
            fileMap: {
              ...state.fileMap,
              purchaseUploadFileList: this.changeFileList(res),
            },
          }));
        }
      });
    }
    // 查询供应方附件
    if ((supplierUploadFlag || supplierViewFlag) && supplierAttachmentUuid) {
      await dispatch({
        type: 'contractCommon/queryFileListOrg',
        payload: {
          attachmentUUID: supplierAttachmentUuid,
          bucketName: DEFAULT_BUCKET_NAME,
        },
      }).then(res => {
        if (res) {
          this.setState(state => ({
            fileMap: {
              ...state.fileMap,
              supplierUploadFileList: this.changeFileList(res),
            },
          }));
        }
      });
    }
    if (supplierUploadFlag && !supplierAttachmentUuid) {
      // 供应商上传并且没有供应商uuid则去请求并绑定
      queryUUID().then(res => {
        const result = getResponse(res);
        if (result) {
          dispatch({
            type: 'contractCommon/updateSupplierUuid',
            payload: {
              ...headerInfo,
              supplierAttachmentUuid: result.content,
            },
          }).then(updateResult => {
            if (updateResult) {
              onFetchHeader();
            }
          });
        }
      });
    }
    if (purchaserUploadFlag && !attachmentUUID) {
      // 要上传但没uuid则先去请求绑定uuid
      queryUUID().then(res => {
        const result = getResponse(res);
        if (result) {
          dispatch({
            type: 'contractCommon/updatePurchaseUuid',
            payload: {
              ...headerInfo,
              attachmentUuid: result.content,
            },
          }).then(updateResult => {
            if (updateResult) {
              onChangeState({
                headerInfo: {
                  ...headerInfo,
                  attachmentUuid: updateResult.attachmentUuid,
                  objectVersionNumber: updateResult.objectVersionNumber,
                },
              });
            }
          });
        }
      });
    }
    this.setState({ renderFlag: true });
  }

  /**
   * 格式化已经上传的uuid的文件列表
   * @param {*} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   * @memberof UploadModal
   */
  @Bind()
  changeFileList(response) {
    const { bucketDirectory, bucketName = DEFAULT_BUCKET_NAME } = this.props;
    const { tenantId } = this.state;
    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: getAttachmentUrl(res.fileUrl, bucketName, tenantId, bucketDirectory),
      };
    });
  }

  /**
   * 附件变更
   * @param {Object} {info, fileList}
   */
  @Bind()
  onUrlUploadChange({ file }, field, item) {
    const { tenantId, fileMap } = this.state;
    const {
      dispatch,
      onRefresh,
      headerInfo,
      onUpdateHeader,
      bucketDirectory = field === 'contractTemplateUploadFileList'
        ? 'purchase-contract-template'
        : 'purchase-contract-attachment',
      bucketName = DEFAULT_BUCKET_NAME,
      fileSize = 10 * 1024 * 1024,
    } = this.props;
    const { pcHeaderId } = headerInfo;
    const { status } = file;
    let newFile = { ...file };
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl
          .get('hzero.common.upload.error.size', {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      });
    } else {
      if (status === 'done') {
        const url = getAttachmentUrl(file.response, bucketName, tenantId, bucketDirectory);
        newFile = { ...file, url };
        if (field) {
          if (field === 'templateUploadFileList') {
            onUpdateHeader({ ...headerInfo, contractAttachmentUrl: file.response }).then(res => {
              if (res) {
                onRefresh();
                notification.success();
              }
            });
          } else if (field === 'contractTemplateUploadFileList') {
            onUpdateHeader({ ...headerInfo, templateFileUrl: file.response }).then(res => {
              if (res) {
                onRefresh();
                notification.success();
              }
            });
          } else {
            dispatch({
              type: 'contractCommon/updatePcAttachmentList',
              payload: {
                pcHeaderId,
                body: {
                  ...item,
                  attachmentUrl: file.response,
                },
              },
            }).then(res => {
              if (res) {
                onRefresh();
                notification.success();
              }
            });
          }
        }
      } else if (status === 'error') {
        notification.error(
          file.response && file.response.message ? { message: file.response.message } : {} // 上传不同类型时报错
        );
      }
      this.setState({
        fileMap: {
          ...fileMap,
          [field]: [newFile].filter(o => o.status !== 'error'), // 不同类型上传失败后清除失败的上传文件
        },
      });
    }
  }

  /**
   * 附件变更
   * @param {Object} {info, fileList}
   */
  @Bind()
  onUploadChange({ file, fileList }, field) {
    const { tenantId, fileMap } = this.state;
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      bucketDirectory,
      fileSize = 10 * 1024 * 1024,
    } = this.props;
    const { status } = file;
    let list = [...fileList];
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl
          .get('hzero.common.upload.error.size', {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      });
    } else {
      if (status === 'done') {
        if (file.response && file.response.failed === true) {
          notification.error(
            file.response && file.response.message ? { message: file.response.message } : {} // 上传不同类型时报错
          );
          // TODO: 上传失败 清除错误的文件
          list = fileList.filter(f => {
            if (f.uid === file.uid) {
              return false;
            } else {
              return true;
            }
          });
        } else {
          notification.success();
          list = fileList.map(f => {
            if (f.uid === file.uid) {
              // f.url = file.response;
              // eslint-disable-next-line
              f.url = getAttachmentUrl(file.response, bucketName, tenantId, bucketDirectory);
            }
            return f;
          });
        }
      } else if (status === 'error') {
        notification.error();
      }
      this.setState({
        fileMap: {
          ...fileMap,
          [field]: list,
        },
      });
    }
  }

  /**
   * url上传附件查询参数
   * @param {Object} file
   */
  @Bind()
  urlUploadData(file, field) {
    const {
      bucketDirectory = field === 'contractTemplateUploadFileList'
        ? 'purchase-contract-template'
        : 'purchase-contract-attachment',
    } = this.props;
    return {
      fileName: file.name,
      bucketName: DEFAULT_BUCKET_NAME,
      directory: bucketDirectory,
    };
  }

  /**
   * 采购方uuid上传附件查询参数
   * @param {Object} file
   */
  @Bind()
  uuidUploadData(file, target = 'purchaser') {
    const {
      attachmentUUID,
      supplierAttachmentUuid,
      bucketDirectory = 'purchase-contract-attachment',
    } = this.props;
    return {
      bucketDirectory,
      fileName: file.name,
      bucketName: DEFAULT_BUCKET_NAME,
      attachmentUUID: target === 'purchaser' ? attachmentUUID : supplierAttachmentUuid,
    };
  }

  /**
   * 图片预览
   * @param {*} file
   */
  @Bind()
  handlePreview(file) {
    this.setState({
      previewImages: [
        {
          src: file.url || file.thumbUrl,
          alt: '', // 由于下方会显示 alt 所以这里给空字符串 file.name,
        },
      ],
      previewVisible: true,
    });
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  onUploadRemove(file, uuid, field) {
    const { fileMap } = this.state;
    const { dispatch } = this.props;
    if (file.url) {
      return new Promise((resolve, reject) => {
        dispatch({
          type: 'contractCommon/removeFileOrg',
          payload: {
            bucketName: DEFAULT_BUCKET_NAME,
            urls: (isString(file.url) && [file.url.substr(file.url.lastIndexOf('=') + 1)]) || '',
            attachmentUUID: uuid,
          },
        }).then(res => {
          if (res) {
            this.setState({
              fileMap: {
                ...fileMap,
                [field]: fileMap[field].filter(o => o.uid !== file.uid),
              },
            });
            notification.success();
            resolve();
          }
          reject();
        });
      }).catch(e => {});
    } else {
      this.setState({
        fileMap: {
          ...fileMap,
          [field]: fileMap[field].filter(o => o.uid !== file.uid),
        },
      });
    }
  }

  /**
   * 删除文件服务对应的url
   * @param {*} file
   */
  @Bind()
  handleDeleteFilesByUrl(file) {
    const { dispatch } = this.props;
    return new Promise((resolveDelete, rejectDelete) => {
      dispatch({
        type: 'contractCommon/deleteFilesByUrl',
        payload: {
          bucketName: DEFAULT_BUCKET_NAME,
          urls: (isString(file.url) && [file.url.substr(file.url.lastIndexOf('=') + 1)]) || [''],
        },
      }).then(res => {
        if (res) {
          resolveDelete();
        }
        rejectDelete();
      });
    }).catch(e => {});
  }

  /**
   * 删除配置的附件文件
   * @param {*} item
   */
  @Bind()
  handleDeleteConfigFiles(item) {
    const { dispatch, headerInfo } = this.props;
    const { pcHeaderId } = headerInfo;
    return new Promise((resolveUpdate, rejectUpdate) => {
      dispatch({
        type: 'contractCommon/updatePcAttachmentList',
        payload: {
          pcHeaderId,
          body: {
            ...item,
            attachmentUrl: null,
          },
        },
      }).then(res => {
        if (res) {
          resolveUpdate();
        }
        rejectUpdate();
      });
    }).catch(e => {});
  }

  /**
   * 删除模板定义的附件
   * @param {*} item
   */
  @Bind()
  handleDeleteTemplateFiles(item) {
    const { dispatch } = this.props;
    return new Promise((resolveUpdate, rejectUpdate) => {
      dispatch({
        type: 'contractCommon/updateContractTemplateUrl',
        payload: {
          ...item,
          templateFileUrl: 'NULL_TEMPLATE',
        },
      }).then(res => {
        if (res) {
          resolveUpdate();
        }
        rejectUpdate();
      });
    }).catch(e => {});
  }

  /**
   * 删除URL的附件
   * 只有文件服务删除了url，并且更新了对应的头行才清空对应的文件列表
   * 每个附件列表只有一个文件
   * @param {Object} file
   * */
  @Bind()
  onUploadUrlRemove(file, item = {}, field) {
    const { fileMap = {} } = this.state;
    const { onRefresh, onUpdateHeader } = this.props;
    if (file.url) {
      if (field === 'contractTemplateUploadFileList') {
        return new Promise((resolve, reject) => {
          Promise.all([
            this.handleDeleteFilesByUrl(file),
            this.handleDeleteTemplateFiles(item),
          ]).then(
            res => {
              if (res) {
                this.setState({
                  fileMap: {
                    ...fileMap,
                    [field]: [],
                  },
                });
                if (onRefresh) {
                  onRefresh();
                }
                notification.success();
                resolve();
              }
            },
            () => {
              reject();
            }
          );
        }).catch(e => {});
      } else if (field === 'templateUploadFileList') {
        return onUpdateHeader({ ...item, contractAttachmentUrl: '' }).then(() => {
          if (onRefresh) {
            onRefresh();
          }
          notification.success();
          this.setState({ fileMap: { ...fileMap, [field]: [] } });
        });
      } else {
        return new Promise((resolve, reject) => {
          Promise.all([this.handleDeleteFilesByUrl(file), this.handleDeleteConfigFiles(item)]).then(
            res => {
              if (res) {
                const sourceField = `${item.attachmentId}UploadFileList`;
                this.setState({
                  fileMap: {
                    ...fileMap,
                    [sourceField]: [],
                  },
                });
                onRefresh();
                notification.success();
                resolve();
              }
            },
            () => {
              reject();
            }
          );
        }).catch(e => {});
      }
    } else {
      this.setState({ fileMap: { ...fileMap, [field]: [] } });
    }
  }

  /**
   * 上传前置判断
   * @param {*} file
   */
  @Bind()
  beforeUpload(file) {
    const { fileType, accept, fileSize = 10 * 1024 * 1024 } = this.props;
    if (fileType && fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.type', {
            accept,
          })
          .d(`上传文件类型必须是: ${accept}`), // 上传类型错误时报错信息的修改
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (!file.type) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl.get('hzero.common.upload.error.type.null').d('上传文件类型缺失，请检查类型'),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.size', {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  render() {
    const {
      previewVisible,
      previewImages,
      visible,
      tenantId,
      accessToken,
      fileMap = {},
    } = this.state;
    const {
      attachmentUUID,
      supplierAttachmentUuid,
      contractTypeFlag,
      width = 1000,
      showRemoveIcon = true,
      queryAttachmentList = false,
      templateList = [],
      title = intl.get(`entity.attachment.tag`).d('附件'),
      btnProps = {},
      headerInfo = {},
      showFilesNumber = true,
      filesNumber = '',
      purchaserParams = {},
      supplierParams = {},
      ...otherProps
    } = this.props;
    const { purchaserUploadFlag = false } = purchaserParams;
    const { supplierUploadFlag = false, supplierViewFlag = false } = supplierParams;
    const {
      btnText = intl.get(`entity.attachment.tag`).d('附件'),
      isBtn = true,
      icon = 'paper-clip',
      disabled,
    } = btnProps;
    const attachmentModalProps = {
      title,
      visible,
      width,
      bodyStyle: { height: '400px', overflow: 'auto' },
      footer: null,
      onCancel: () => this.handleModalVisible('visible', false),
      ...otherProps,
    };
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const {
      contractTemplateUploadFileList = [],
      templateUploadFileList = [],
      purchaseUploadFileList = [],
      supplierUploadFileList = [],
    } = fileMap;
    const commonUploadProps = {
      headers,
      listType: 'picture-card',
      name: 'file',
      multiple: true,
      onPreview: this.handlePreview,
      beforeUpload: this.beforeUpload,
    };
    const urlAction = `${HZERO_FILE}/v1/${tenantId}/files/multipart`;
    const uuidAction = `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`;
    const templateUploadProps = {
      ...commonUploadProps,
      data: file => this.urlUploadData(file, 'templateUploadFileList'),
      fileList: templateUploadFileList,
      onChange: params => this.onUrlUploadChange(params, 'templateUploadFileList'),
      onRemove: file =>
        this.onUploadUrlRemove(
          file,
          headerInfo.contractAttachmentUrl ? headerInfo : '',
          'templateUploadFileList'
        ),
      action: urlAction,
      showUploadList: {
        showRemoveIcon: !supplierUploadFlag && showRemoveIcon,
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录?'),
      },
    };
    const contractTemplateUploadProps = {
      ...commonUploadProps,
      accept: '.docx',
      data: file => this.urlUploadData(file, 'contractTemplateUploadFileList'),
      fileList: contractTemplateUploadFileList,
      onChange: params => this.onUrlUploadChange(params, 'contractTemplateUploadFileList'),
      onRemove: file =>
        this.onUploadUrlRemove(
          file,
          headerInfo.templateFileUrl ? headerInfo : '',
          'contractTemplateUploadFileList'
        ),
      action: urlAction,
      showUploadList: {
        showRemoveIcon: !supplierUploadFlag && showRemoveIcon,
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录?'),
      },
    };
    const purchaserUploadProps = {
      ...commonUploadProps,
      data: file => this.uuidUploadData(file, 'purchaser'),
      fileList: purchaseUploadFileList,
      onChange: params => this.onUploadChange(params, 'purchaseUploadFileList'),
      onRemove: file => this.onUploadRemove(file, attachmentUUID, 'purchaseUploadFileList'),
      action: uuidAction,
      showUploadList: {
        showRemoveIcon: !supplierUploadFlag && showRemoveIcon,
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录?'),
      },
    };
    const supplierUploadProps = {
      ...commonUploadProps,
      data: file => this.uuidUploadData(file, 'supplier'),
      fileList: supplierUploadFileList,
      onChange: params => this.onUploadChange(params, 'supplierUploadFileList'),
      onRemove: file => this.onUploadRemove(file, supplierAttachmentUuid, 'supplierUploadFileList'),
      action: uuidAction,
      showUploadList: {
        showRemoveIcon: supplierUploadFlag && showRemoveIcon,
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录?'),
      },
    };
    const filesLength = Object.values(fileMap).reduce((total, item) => {
      return total + item.length;
    }, 0);
    const uploadLinkButton = (
      <Fragment>
        {!isBtn ? (
          <div className={styles.fileNumber}>
            <a onClick={() => this.handleModalVisible('visible', true)}>{btnText}</a>
            <Tag>{filesNumber && filesNumber !== 0 ? filesNumber : filesLength}</Tag>
          </div>
        ) : (
          <Button
            className={styles.filesNumber}
            onClick={() => this.handleModalVisible('visible', true)}
            icon={icon}
            {...btnProps}
            disabled={disabled}
          >
            {btnText}
            {showFilesNumber && ((filesNumber && filesNumber !== 0) || filesLength > 0) && (
              <Tag>{filesNumber && filesNumber !== 0 ? filesNumber : filesLength}</Tag>
            )}
          </Button>
        )}
      </Fragment>
    );
    const leftComponent = (
      <Fragment>
        <div style={{ overflow: 'auto' }}>
          {isArray(templateList) &&
            !isEmpty(templateList) &&
            templateList.map(item => {
              const sourceKey = `${item.attachmentId}UploadFileList`;
              const itemFileList = fileMap[sourceKey] || [];
              const itemUploadProps = {
                data: file => this.urlUploadData(file, 'sourceKey'),
                fileList: itemFileList,
                onChange: params =>
                  this.onUrlUploadChange(params, sourceKey, item.attachmentUrl ? '' : item),
                onRemove: file =>
                  this.onUploadUrlRemove(file, item.attachmentUrl ? item : '', sourceKey),
                action: urlAction,
                showUploadList: {
                  showRemoveIcon: !supplierUploadFlag && showRemoveIcon,
                  removePopConfirmTitle: intl
                    .get('hzero.common.message.confirm.delete')
                    .d('是否删除此条记录?'),
                },
              };
              return (
                <div style={{ float: 'left' }}>
                  {(purchaserUploadFlag || (!purchaserUploadFlag && item.attachmentUrl)) && (
                    <Fragment>
                      <p>{item.attachmentTypeName}:</p>
                      <Upload {...commonUploadProps} {...itemUploadProps}>
                        {purchaserUploadFlag && itemFileList.length === 0 && (
                          <Tooltip title={item.remark}>
                            <div>
                              <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                            </div>
                          </Tooltip>
                        )}
                      </Upload>
                    </Fragment>
                  )}
                </div>
              );
            })}
          {headerInfo.pcKindCode === 'ATTACHMENT' && (
            <div style={{ float: 'left' }}>
              <p>{intl.get(`${viewMessagePrompt}.contractAttachment`).d('协议文本')}:</p>
              <Upload {...templateUploadProps}>
                {purchaserUploadFlag && templateUploadFileList.length === 0 && (
                  <div>
                    <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                  </div>
                )}
              </Upload>
            </div>
          )}
          {contractTypeFlag && (
            <div style={{ float: 'left' }}>
              <p>{intl.get(`${viewMessagePrompt}.templateFile`).d('模板文件')}:</p>
              <Upload {...contractTemplateUploadProps}>
                {contractTypeFlag && contractTemplateUploadFileList.length === 0 && (
                  <div>
                    <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                  </div>
                )}
              </Upload>
            </div>
          )}
        </div>
        <div>
          <Upload {...purchaserUploadProps}>
            {purchaserUploadFlag && (
              <div>
                <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
              </div>
            )}
          </Upload>
        </div>
      </Fragment>
    );
    const rightComponent = (
      <Fragment>
        {(supplierUploadFlag || supplierViewFlag) && (
          <div>
            <Upload {...supplierUploadProps}>
              {supplierUploadFlag && (
                <div>
                  <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                </div>
              )}
            </Upload>
          </div>
        )}
      </Fragment>
    );
    const modalContent = (
      <Spin spinning={queryAttachmentList}>
        <Row>
          {(supplierViewFlag || supplierUploadFlag) && (
            <Fragment>
              <Col span={12}>
                <p>{intl.get(`entity.attachment.type.purchaser`).d('采购方附件')}:</p>
                {leftComponent}
              </Col>
              <Col span={12}>
                <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}:</p>
                {rightComponent}
              </Col>
            </Fragment>
          )}
          {(!(supplierViewFlag || supplierUploadFlag) || contractTypeFlag) && leftComponent}
        </Row>
      </Spin>
    );
    return (
      <Fragment>
        {uploadLinkButton}
        <Modal {...attachmentModalProps}>{modalContent}</Modal>
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={() => this.handleModalVisible('previewVisible', false)}
          images={previewImages}
        />
      </Fragment>
    );
  }
}
