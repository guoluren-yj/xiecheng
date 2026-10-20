/*
 * 附件上传组件
 * @date: 2019-05-28
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal, Spin, Row, Col, Icon, Upload, Tooltip, List, Popover } from 'hzero-ui';
import { Tag } from 'choerodon-ui';
import querystring from 'querystring';
import { connect } from 'dva';
import Viewer from 'react-viewer';
import { isArray, isEmpty, isString, isFunction } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import classnames from 'classnames';
import { getEnvConfig } from 'utils/iocUtils';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getResponse,
  getAttachmentUrl,
  isTenantRoleLevel,
  filterNullValueObject,
  getSRMAccessCode,
} from 'utils/utils';
import PermissionButton from 'srm-front-boot/lib/components/PermissionButton';
import formatterCollections from 'utils/intl/formatterCollections';
import { downloadFileByAxios, queryUUID } from 'services/api';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { fetchFileByUrl } from '@/services/contractCommonService';
import { textContractFileType, textContractAccept } from '@/utils/util';

import styles from './index.less';

const ListItem = List.Item;
const DEFAULT_BUCKET_NAME = PRIVATE_BUCKET;
const viewMessagePrompt = 'spcm.common.view.message';
const { BASE_PATH, HZERO_HFLE } = getEnvConfig();

const supportPreviewList = [
  '.doc',
  '.docx',
  '.docm',
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  '.pdf',
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
];
const newUrlPreviewList = [
  // ".doc", ".docx", ".docm",
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  // ".pdf",
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
];

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
        purchaseUploadFileListNoPic: [], // 采购方无图片文件
        purchaseUploadFileListPic: [], // 采购方图片附件
        supplierUploadFileList: [], // 供应方附件列表
        supplierUploadFileListNoPic: [], // 供应商方无图片文件
        supplierUploadFileListPic: [], // 供应商图片文件
        templateUploadFileList: [], // 协议文本附件列表
        contractTemplateUploadFileList: [], // 协议模板附件列表
        contractTemplateUploadFileListNoPic: [], // 协议模板附件列表无图片
      }, // 上传组件文件列表map
      tenantId: getCurrentOrganizationId(),
      accessToken: getAccessToken(),
      renderFlag: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
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
  async handleResposeFileList(fileListMap) {
    const { headerInfo, templateList = [], contractTypeFlag } = this.props;
    let fileUrls = templateList.map((item) => item.attachmentUrl);
    if (
      headerInfo.contractAttachmentUrl &&
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
    ) {
      fileUrls.push(headerInfo.contractAttachmentUrl);
    }
    if (
      headerInfo.templateFileUrl &&
      contractTypeFlag &&
      headerInfo.templateFileUrl !== 'NULL_TEMPLATE'
    ) {
      fileUrls.push(headerInfo.templateFileUrl);
    }
    fileUrls = fileUrls.filter((item) => item);
    if (!fileUrls.length) return;
    // 此处主要是为了获取_previewToken，不然无法正常预览
    const res = await fetchFileByUrl({ attachmentUrls: fileUrls });
    if (getResponse(res)) {
      res.forEach((item) => {
        fileListMap.set(item.fileUrl, item);
      });
    }
  }

  @Bind()
  async handleTemplateList(newFileMap, fileListMap) {
    const { tenantId } = this.state;
    const { bucketDirectory, bucketName = DEFAULT_BUCKET_NAME, templateList = [] } = this.props;
    templateList.forEach((item) => {
      if (item.attachmentUrl) {
        const fileInfo = fileListMap.get(item.attachmentUrl);
        const sourceField = `${item.attachmentId}UploadFileList`;
        newFileMap[sourceField] = [
          {
            response: item.remark,
            uid: item.attachmentId,
            name: item.attachmentUrl.substr(item.attachmentUrl.lastIndexOf('@') + 1),
            status: 'done',
            url: getAttachmentUrl(item.attachmentUrl, bucketName, tenantId, bucketDirectory),
            ...fileInfo,
          },
        ];
      }
    });
  }

  @Bind()
  async fetchAttachmentList() {
    const { tenantId } = this.state;
    const {
      dispatch,
      attachmentUUID,
      // onFetchHeader,
      supplierAttachmentUuid,
      contractTypeFlag,
      onChangeState,
      bucketDirectory,
      bucketName = DEFAULT_BUCKET_NAME,
      headerInfo = {},
      // templateList = [],
      purchaserParams = {},
      supplierParams = {},
      remote,
    } = this.props;
    const { purchaserUploadFlag } = purchaserParams;
    const { supplierUploadFlag, supplierViewFlag } = supplierParams;
    const newFileMap = {};
    const fileListMap = new Map();
    await this.handleResposeFileList(fileListMap);
    // 将配置的附件列表渲染上去
    this.handleTemplateList(newFileMap, fileListMap);
    let attachmentProps = {};
    if (remote) {
      attachmentProps = remote.process(
        'SPCM_CONTRACT_COMPONET_UPLOAD_ATTATCHMENT_PROPS',
        attachmentProps,
        {
          current: this,
        }
      );
    }
    // 格式化协议文本列表
    if (
      headerInfo.contractAttachmentUrl &&
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
      !attachmentProps?.hiddenAttachmentUrl
    ) {
      const sourceKey = 'templateUploadFileList';
      const nameKey = 'contractAttachmentUrl';
      const fileInfo = fileListMap.get(headerInfo[nameKey]);
      newFileMap[sourceKey] = [
        {
          uid: 1,
          name: headerInfo[nameKey].substr(headerInfo[nameKey].lastIndexOf('@') + 1),
          status: 'done',
          url: getAttachmentUrl(headerInfo[nameKey], bucketName, tenantId, bucketDirectory),
          ...fileInfo,
        },
      ];
      // this.setState((state) => ({
      //   fileMap: {
      //     ...state.fileMap,
      //     [sourceKey]:
      //   },
      // }));
    }
    // 格式化模板附件列表
    if (
      headerInfo.templateFileUrl &&
      contractTypeFlag &&
      headerInfo.templateFileUrl !== 'NULL_TEMPLATE'
    ) {
      const sourceKey = 'contractTemplateUploadFileList';
      const nameKey = 'templateFileUrl';
      const fileInfo = fileListMap.get(headerInfo[nameKey]);
      newFileMap[sourceKey] = [
        {
          uid: 1,
          name: headerInfo[nameKey].substr(headerInfo[nameKey].lastIndexOf('@') + 1),
          status: 'done',
          url: getAttachmentUrl(headerInfo[nameKey], bucketName, tenantId, bucketDirectory),
          ...fileInfo,
        },
      ];
      newFileMap[`${sourceKey}NoPic`] = [
        {
          uid: 1,
          name: headerInfo[nameKey].substr(headerInfo[nameKey].lastIndexOf('@') + 1),
          status: 'done',
          url: getAttachmentUrl(headerInfo[nameKey], bucketName, tenantId, bucketDirectory),
          ...fileInfo,
        },
      ];
    }
    // 查询采购方附件
    if (attachmentUUID) {
      const purchaseRes = await dispatch({
        type: 'contractCommon/queryFileListOrg',
        payload: {
          attachmentUUID,
          bucketName: DEFAULT_BUCKET_NAME,
        },
      });
      if (purchaseRes && purchaseRes.length > 0) {
        const purchaseUploadFileList = this.changeFileList(purchaseRes);

        newFileMap.purchaseUploadFileList = purchaseUploadFileList;

        newFileMap.purchaseUploadFileListNoPic = purchaseUploadFileList.filter(
          (item) => !this.isImageUrl(item)
        );

        newFileMap.purchaseUploadFileListPic = purchaseUploadFileList
          ? purchaseUploadFileList.filter((item) => this.isImageUrl(item))
          : purchaseUploadFileList;
      }
    }
    // 查询供应方附件
    if ((supplierUploadFlag || supplierViewFlag) && supplierAttachmentUuid) {
      const supplierRes = await dispatch({
        type: 'contractCommon/queryFileListOrg',
        payload: {
          attachmentUUID: supplierAttachmentUuid,
          bucketName: DEFAULT_BUCKET_NAME,
        },
      });
      if (supplierRes && supplierRes.length > 0) {
        const supplierUploadFileList = this.changeFileList(supplierRes);

        newFileMap.supplierUploadFileList = supplierUploadFileList;

        newFileMap.supplierUploadFileListNoPic = supplierUploadFileList.filter(
          (item) => !this.isImageUrl(item)
        );

        newFileMap.supplierUploadFileListPic = supplierUploadFileList
          ? supplierUploadFileList.filter((item) => this.isImageUrl(item))
          : supplierUploadFileList;
      }
    }
    if (supplierUploadFlag && !supplierAttachmentUuid) {
      // 供应商上传并且没有供应商uuid则去请求并绑定
      queryUUID().then((res) => {
        const result = getResponse(res);
        if (result) {
          dispatch({
            type: 'contractCommon/updateSupplierUuid',
            payload: {
              ...headerInfo,
              supplierAttachmentUuid: result.content,
            },
          }).then((updateResult) => {
            if (updateResult && onChangeState) {
              // onFetchHeader();
              onChangeState({
                headerInfo: {
                  ...headerInfo,
                  supplierAttachmentUuid: updateResult.supplierAttachmentUuid,
                  objectVersionNumber: updateResult.objectVersionNumber,
                },
              });
            }
          });
        }
      });
    }
    if (purchaserUploadFlag && !attachmentUUID) {
      // 要上传但没uuid则先去请求绑定uuid
      queryUUID().then((res) => {
        const result = getResponse(res);
        if (result) {
          dispatch({
            type: 'contractCommon/updatePurchaseUuid',
            payload: {
              ...headerInfo,
              attachmentUuid: result.content,
            },
          }).then((updateResult) => {
            if (updateResult && onChangeState) {
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

    this.setState((state) => ({
      fileMap: {
        ...state.fileMap,
        ...newFileMap,
      },
      renderFlag: true,
    }));
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
        ...res,
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
    const NoPic = `${field}NoPic`;
    const {
      dispatch,
      onRefresh,
      headerInfo: { $form, ...headerInfo },
      onUpdateHeader,
      bucketDirectory = field === 'contractTemplateUploadFileList'
        ? 'purchase-contract-template'
        : 'purchase-contract-attachment',
      bucketName = DEFAULT_BUCKET_NAME,
      fileSize = 500 * 1024 * 1024,
      onChangeState,
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
      if (status === 'done' && getResponse(file.response)) {
        const url = getAttachmentUrl(
          file?.response?.fileUrl || file.response,
          bucketName,
          tenantId,
          bucketDirectory
        );
        newFile = { ...(file.response || {}), ...file, url };
        if (field) {
          // 协议文本附件上传
          if (field === 'templateUploadFileList') {
            onUpdateHeader({ ...headerInfo, contractAttachmentUrl: file.response }).then((res) => {
              if (res) {
                if (onRefresh) {
                  onRefresh();
                }
                if (onChangeState) {
                  onChangeState({
                    headerInfo: {
                      ...headerInfo,
                      contractAttachmentUrl: res?.contractAttachmentUrl,
                      objectVersionNumber: res?.objectVersionNumber,
                    },
                  });
                }
                notification.success();
              }
            });
            // 协议模板附件上传
          } else if (field === 'contractTemplateUploadFileList') {
            onUpdateHeader({ ...headerInfo, templateFileUrl: file.response }).then((res) => {
              if (res) {
                if (onRefresh) {
                  onRefresh();
                }
                if (onChangeState) {
                  onChangeState({
                    headerInfo: {
                      ...headerInfo,
                      templateFileUrl: res.templateFileUrl,
                      objectVersionNumber: res.objectVersionNumber,
                    },
                  });
                }
                notification.success();
              } else {
                /**
                 * 由于协议模板需要校验用户上传模板文件为[.docx]格式，且还需要校验用户上传[.docx]文件内容是否符合规则，逻辑为后端处理，前端需要把不合法的文件删除
                 */
                this.onUploadUrlRemove(
                  newFile,
                  headerInfo.templateFileUrl ? headerInfo : '',
                  'contractTemplateUploadFileList'
                );
              }
            });
          } else {
            if (item && !item.attachmentUuid) {
              notification.warning({
                message: intl
                  .get('spcm.common.upload.error.uuidNotNull')
                  .d('附件uuid为空，请重新上传'),
              });
              return false;
            }
            dispatch({
              type: 'contractCommon/updatePcAttachmentList',
              payload: {
                pcHeaderId,
                body: {
                  ...item,
                  attachmentUrl: file?.response?.fileUrl || file?.response,
                },
              },
            }).then((res) => {
              if (res) {
                if (onRefresh) {
                  onRefresh();
                }
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
          [field]: [newFile].filter((o) => o.status !== 'error' && !o?.response?.failed), // 不同类型上传失败后清除失败的上传文件
          [NoPic]: [newFile].filter(
            (o) => o.status !== 'error' && !this.isImageUrl(o) && !o?.response?.failed
          ),
        },
      });
    }
  }

  /**
   * 附件变更，基于uuid地址的附件上传
   * @param {Object} {info, fileList}
   */
  @Bind()
  onUploadChange(params, field) {
    const { file, fileList } = params;
    const NoPic = `${field}NoPic`;
    const Pic = `${field}Pic`;
    const { tenantId, fileMap } = this.state;
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      bucketDirectory,
      fileSize = 500 * 1024 * 1024,
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
          list = fileList.filter((f) => {
            if (f.uid === file.uid) {
              return false;
            } else {
              return true;
            }
          });
        } else {
          notification.success();
          list = fileList.map((f) => {
            if (f.uid === file.uid) {
              // f.url = file.response;
              // eslint-disable-next-line
              f.url = getAttachmentUrl(
                file?.response?.fileUrl || file.response,
                bucketName,
                tenantId,
                bucketDirectory
              );
            }
            return f;
          });
        }
      } else if (status === 'error') {
        notification.error();
      }
      list = list.concat([...fileMap[NoPic]]).map((item) => {
        return {
          ...(item.response || {}),
          ...item,
        };
      });
      this.setState({
        fileMap: {
          ...fileMap,
          [field]: list,
          [NoPic]: list ? list.filter((item) => !this.isImageUrl(item)) : list,
          [Pic]: list ? list.filter((item) => this.isImageUrl(item)) : list,
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
      directory: bucketDirectory,
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
    const basePath = (BASE_PATH || '').replace(/\//g, '');
    window.open(
      `/${basePath}/public/filePreview?url=${encodeURIComponent(file.url || file.thumbUrl)}`
    );
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  onUploadRemove(file, uuid, field) {
    const { fileMap } = this.state;
    const NoPic = `${field}NoPic`;
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
        }).then((res) => {
          if (res) {
            this.setState({
              fileMap: {
                ...fileMap,
                [field]: fileMap[field].filter((o) => o.uid !== file.uid),
                [NoPic]: fileMap[field].filter((o) => o.uid !== file.uid && !this.isImageUrl(o)),
              },
            });
            notification.success();
            resolve();
          }
          reject();
        });
      });
    } else {
      this.setState({
        fileMap: {
          ...fileMap,
          [field]: fileMap[field].filter((o) => o.uid !== file.uid),
          [NoPic]: fileMap[field].filter((o) => o.uid !== file.uid && !this.isImageUrl(o)),
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
      }).then((res) => {
        if (res) {
          resolveDelete();
        }
        rejectDelete();
      });
    });
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
      }).then((res) => {
        if (res) {
          resolveUpdate();
        }
        rejectUpdate();
      });
    });
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
      }).then((res) => {
        if (res) {
          resolveUpdate();
        }
        rejectUpdate();
      });
    });
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
    const { onRefresh, onUpdateHeader, onChangeState, headerInfo } = this.props;
    const { $form, ...itemInfo } = item;
    if (file.url) {
      if (field === 'contractTemplateUploadFileList') {
        return new Promise((resolve, reject) => {
          Promise.all([
            this.handleDeleteFilesByUrl(file),
            this.handleDeleteTemplateFiles(itemInfo),
          ]).then(
            (res) => {
              if (res) {
                this.setState({
                  fileMap: {
                    ...fileMap,
                    [field]: [],
                    [`${field}NoPic`]: [],
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
        });
      } else if (field === 'templateUploadFileList') {
        return onUpdateHeader({ ...itemInfo, contractAttachmentUrl: '' }).then((res) => {
          if (onRefresh) {
            onRefresh();
          }
          if (onChangeState) {
            onChangeState({
              headerInfo: {
                ...headerInfo,
                contractAttachmentUrl: res?.contractAttachmentUrl,
                objectVersionNumber: res?.objectVersionNumber,
              },
            });
          }
          notification.success();
          this.setState({ fileMap: { ...fileMap, [field]: [] } });
        });
      } else {
        return new Promise((resolve, reject) => {
          Promise.all([
            this.handleDeleteFilesByUrl(file),
            this.handleDeleteConfigFiles(itemInfo),
          ]).then(
            (res) => {
              if (res) {
                const sourceField = `${itemInfo.attachmentId}UploadFileList`;
                this.setState({
                  fileMap: {
                    ...fileMap,
                    [sourceField]: [],
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
        });
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
    const {
      fileType,
      accept,
      fileSize = 500 * 1024 * 1024,
      templateFileUrlFlag = false,
    } = this.props;
    const fileNameType = file.name && file.name.split('.')[file.name.split('.').length - 1];
    if (
      accept &&
      (!fileType || templateFileUrlFlag
        ? accept !== `.${fileNameType}`
        : !accept.includes(fileNameType))
    ) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.type', {
            fileType: accept,
          })
          .d(`上传文件类型必须是: ${accept}`), // 上传类型错误时报错信息的修改
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    // if (!file.type) {
    //   file.status = 'error'; // eslint-disable-line
    //   const res = {
    //     message: intl.get('hzero.common.upload.error.type.null').d('上传文件类型缺失，请检查类型'),
    //   };
    //   file.response = res; // eslint-disable-line
    //   return false;
    // }
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

  // 附件文本合同上传前校验
  @Bind()
  handleTextContractBeforeUpload(file) {
    const { isBlacklistTenant = false, headerInfo } = this.props;
    const { signatureType, electricSignFlag, authType } = headerInfo || {};
    const resultFlag = this.beforeUpload(file);
    if (resultFlag) {
      // 进行二次校验
      // 租户不在黑名单中，且签章类型=文本签章or 文本及附件签章，校验文件格式，只能是pdf或word（.doc/.docx）
      if (
        !isBlacklistTenant &&
        ['TEXT_SIGNATURE', 'TEXT_AND_ANNEX_SIGNATURE'].includes(signatureType) &&
        Number(electricSignFlag) === 1 &&
        authType !== 'ESIGN' &&
        textContractAccept.indexOf(file.type) === -1
      ) {
        file.status = 'error'; // eslint-disable-line
        const res = {
          message: intl
            .get('hzero.common.upload.error.type', {
              fileType: textContractFileType,
            })
            .d(`上传文件类型必须是: ${textContractFileType}`), // 上传类型错误时报错信息的修改
        };
        file.response = res; // eslint-disable-line
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  @Bind()
  isImageUrl(file) {
    if (file.status === 'done' || !file.status) {
      const url = file.name || file.thumbUrl || file.url;
      const extension = this.extname(url);
      if (/^data:image\//.test(url) || /(webp|svg|png|gif|jpg|jpeg|bmp)$/i.test(extension)) {
        return true;
      } else if (/^data:/.test(url)) {
        // other file types of base64
        return false;
      } else if (extension) {
        // other file types which have extension
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  // @Bind()
  // handlePreviewFile(item, businessParams = {}) {
  //   const { bucketName = DEFAULT_BUCKET_NAME, storageCode } = this.props;
  //   const fileExtMatch = item.name.match(/(.[^.]+)$/);
  //   const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
  //   const fileUrl = this.getPreviewUrl(item.url);
  //   if (!supportPreviewList.includes(fileExt)) {
  //     notification.error({
  //       message: intl.get('hzero.common.title.noPreview').d('该文件不支持预览'),
  //       description: '',
  //     });
  //     return;
  //   }
  //   const params = querystring.stringify(
  //     filterNullValueObject({
  //       ...(businessParams || {}),
  //     })
  //   );
  //   const url = isTenantRoleLevel()
  //     ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/${
  //         newUrlPreviewList.includes(fileExt) ? 'file/preview' : 'file-preview/by-url'
  //       }`
  //     : `${HZERO_FILE}/v1/${
  //         newUrlPreviewList.includes(fileExt) ? 'file/preview' : 'file-preview/by-url'
  //       }`;
  //   window.open(
  //     `${url}?${params}&url=${fileUrl}&bucketName=${bucketName}${
  //       storageCode ? `&storageCode=${storageCode}` : ''
  //     }&access_token=${getAccessToken()}`
  //   );
  // }

  @Bind()
  handlePreviewFile(item, businessParams = {}) {
    const { bucketName = DEFAULT_BUCKET_NAME, storageCode, bucketDirectory } = this.props;
    const { tenantId } = this.state;
    const fileExtMatch = item.name.match(/(.[^.]+)$/);
    const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
    if (!supportPreviewList.includes(fileExt)) {
      notification.error({
        message: intl.get('hzero.common.title.noPreview').d('该文件不支持预览'),
        description: '',
      });
      return;
    }
    if (item.fileUrl) {
      getSRMAccessCode({ expires: 15 }).then((_sac) => {
        const PREFIX = window.location.hostname === 'localhost' ? HZERO_FILE : HZERO_HFLE;
        const postfix = newUrlPreviewList.includes(fileExt) ? '/preview/pro' : '/preview';
        const prevewUrl = isTenantRoleLevel()
          ? `${PREFIX}/v2/${tenantId}${postfix}`
          : `${PREFIX}/v2${postfix}`;
        const params = querystring.stringify(
          filterNullValueObject({
            url: item.fileUrl,
            bucketName: item.bucketName || bucketName,
            storageCode,
            directory: bucketDirectory,
            _sac,
            _previewToken: item._previewToken,
            ...businessParams,
          })
        );
        window.open(`${prevewUrl}?${params}`);
      });
    } else {
      const fileUrl = this.getPreviewUrl(item.url);
      const url = isTenantRoleLevel()
        ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/${
            newUrlPreviewList.includes(fileExt) ? 'file/preview' : 'file-preview/by-url'
          }`
        : `${HZERO_FILE}/v1/${
            newUrlPreviewList.includes(fileExt) ? 'file/preview' : 'file-preview/by-url'
          }`;
      window.open(
        `${url}?url=${fileUrl}&bucketName=${bucketName}${
          storageCode ? `&storageCode=${storageCode}` : ''
        }&access_token=${getAccessToken()}`
      );
    }
  }

  @Bind()
  getPreviewUrl(url) {
    const vars = url ? url.split('&') : [];
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (pair[0] === 'url') {
        return pair[1];
      }
    }
    return false;
  }

  @Throttle(500)
  @Bind()
  download(item, businessParams = {}) {
    const { bucketDirectory } = this.props;
    const query = item?.url?.split('?');
    const paramStr = query[1];
    const extraParams = {
      directory: bucketDirectory,
      _downloadToken: item?._downloadToken,
    };
    const params = filterNullValueObject(
      paramStr
        ? { ...querystring.parse(paramStr), ...extraParams, ...businessParams }
        : { ...extraParams, ...businessParams }
    );
    const queryParams = paramStr
      ? Object.entries(params).reduce(
          (list, [name, value]) => (name === 'access_token' ? list : list.concat({ name, value })),
          []
        )
      : [];
    return downloadFileByAxios({
      requestUrl: query[0],
      queryParams: queryParams.concat(params),
      method: 'GET',
      version: item.fileUrl ? 'v2' : 'v1',
    });
  }

  @Bind()
  renderItem(item, attachmentUUID, viewOnly, type) {
    // const { viewOnly } = this.props;
    const { headerInfo, remote } = this.props;
    const fA = item.name.split('.');
    const fileExt = fA && fA[fA.length - 1];
    let allowPreview = false;
    switch (fileExt) {
      case 'doc':
      case 'docx':
        allowPreview = true;
        break;
      case 'xls':
        allowPreview = true;
        break;
      case 'xlsx':
        allowPreview = true;
        break;
      case 'pdf':
        allowPreview = true;
        break;
      case 'txt':
        allowPreview = true;
        break;
      default:
        break;
    }
    let businessParams = {};
    if (remote) {
      businessParams = remote.process(
        'SPCM_CONTRACT_COMPONET_UPLOAD_BISINESS_PARAMS',
        businessParams,
        {
          current: this,
          item,
          attachmentUUID,
          viewOnly,
          type,
        }
      );
    }
    return (
      <ListItem key={item.uid} style={{ width: '100%' }}>
        <List.Item.Meta
          title={
            <a
              className={styles['file-list-item-a']}
              onClick={() => this.download(item, businessParams)}
            >
              {item.name}
            </a>
          }
        />
        <div>
          {!viewOnly && (
            <Icon
              title={intl.get('hzero.common.upload.removeFile').d('删除文件')}
              // onClick={() => this.deleteFile(item)}
              onClick={
                type !== 'supplierUploadFileList' && type !== 'purchaseUploadFileList'
                  ? () =>
                      this.onUploadUrlRemove(
                        item,
                        type === 'templateUploadFileList'
                          ? headerInfo[type] || headerInfo
                          : item.url
                          ? item
                          : {},
                        type
                      )
                  : () => this.onUploadRemove(item, attachmentUUID, type)
              }
              className={styles['file-list-item-icon']}
              type="delete"
            />
          )}
          {allowPreview && (
            <Icon
              title={intl.get('hzero.common.upload.previewFile').d('预览附件')}
              onClick={() => {
                this.handlePreviewFile(item, businessParams);
              }}
              className={styles['file-list-item-icon']}
              type="eye-o"
            />
          )}
        </div>
      </ListItem>
    );
  }

  @Bind()
  extname(url) {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    const filename = temp[temp.length - 1];
    // 修复上传组件上传文件名中带#的文件时被当成图片处理的情况
    // const filenameWithoutSuffix = filename.split(/#|\?/)[0];
    return (/\.[^./\\]*$/.exec(filename) || [''])[0];
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
      title = intl.get(`entity.attachment.tag.spcm`).d('附件'),
      btnProps = {},
      headerInfo = {},
      showFilesNumber = true,
      filesNumber = '',
      purchaserParams = {},
      supplierParams = {},
      single,
      purchaserFilePreview = true,
      supplierFilePreview = true,
      // filePreview = true,
      // supplierViewOnly = false,
      // purchaserViewOnly = false,
      isShowTips = false,
      showAddTemplateIcon = true,
      fileViewerClassName, // 文件预览的动态样式名
      custViewContainerId, // 自定义文件预览容器id
      remote,
      ...otherProps
    } = this.props;
    const { purchaserUploadFlag = false } = purchaserParams;
    const { supplierUploadFlag = false, supplierViewFlag = false } = supplierParams;
    const {
      btnText = intl.get(`entity.attachment.tag.spcm`).d('附件'),
      isBtn = true,
      icon = 'paper-clip',
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
      supplierUploadFileListNoPic = [], // 供应方无图片文件
      supplierUploadFileListPic = [], // 供应方图片文件
      purchaseUploadFileListPic = [],
      purchaseUploadFileListNoPic = [],
      contractTemplateUploadFileListNoPic = [], // 协议文本附件
    } = fileMap;
    const typeFlag = templateUploadFileList.some((ele) => !this.isImageUrl(ele));
    const commonUploadProps = {
      headers,
      listType: 'picture-card',
      name: 'file',
      multiple: true,
      onPreview: this.handlePreview,
      beforeUpload: this.beforeUpload,
    };
    const urlAction = `${HZERO_FILE}/v1/${tenantId}/files/multipart`;
    const uuidAction = `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart-with-info`;
    const templateUploadProps = {
      ...commonUploadProps,
      data: (file) => this.urlUploadData(file, 'templateUploadFileList'),
      fileList: typeFlag ? [] : templateUploadFileList,
      onChange: (params) => this.onUrlUploadChange(params, 'templateUploadFileList'),
      onRemove: (file) =>
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
      // 增加上传前校验
      beforeUpload: this.handleTextContractBeforeUpload,
    };
    // 协议模板-模板文件上传所需参数
    const contractTemplateUploadProps = {
      ...commonUploadProps,
      accept: '.docx',
      data: (file) => this.urlUploadData(file, 'contractTemplateUploadFileList'),
      fileList: contractTemplateUploadFileList,
      onChange: (params) => this.onUrlUploadChange(params, 'contractTemplateUploadFileList'),
      onRemove: (file) =>
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
      data: (file) => this.uuidUploadData(file, 'purchaser'),
      fileList: purchaseUploadFileListPic,
      onChange: (params) => this.onUploadChange(params, 'purchaseUploadFileList'),
      onRemove: (file) => this.onUploadRemove(file, attachmentUUID, 'purchaseUploadFileList'),
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
      data: (file) => this.uuidUploadData(file, 'supplier'),
      fileList: supplierUploadFileListPic,
      onChange: (params) => this.onUploadChange(params, 'supplierUploadFileList'),
      onRemove: (file) =>
        this.onUploadRemove(file, supplierAttachmentUuid, 'supplierUploadFileList'),
      action: uuidAction,
      showUploadList: {
        showRemoveIcon: supplierUploadFlag && showRemoveIcon,
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录?'),
      },
    };

    // 基于10-01迭代srm-27043对供方附件的拆分，将协议类型里配置的附件模块列表拆分成：供方列表和采购方列表
    const purchaserTemplateList = [];
    const supplierTemplateList = [];
    if (isArray(templateList) && !isEmpty(templateList)) {
      templateList.forEach((item) => {
        if (item.supAttachmentFlag) {
          supplierTemplateList.push(item);
        } else {
          purchaserTemplateList.push(item);
        }
      });
    }

    let filesLength = 0;
    // 只展示采购方附件（目前只有协议拟制模块以及协议审批模块）
    const isOnlyShowPurchaseFiles = !(
      supplierViewFlag ||
      supplierUploadFlag ||
      purchaserUploadFlag
    );
    for (const key in fileMap) {
      if (!key.match('Pic')) {
        if (
          !isOnlyShowPurchaseFiles ||
          contractTypeFlag ||
          purchaserTemplateList
            .map((it) => it.attachmentId)
            .concat(['purchase'])
            .some((i) => key.match(i))
        ) {
          filesLength += fileMap[key].length;
        }
      }
    }
    // const filesLength = Object.values(fileMap).reduce((total, item) => {
    //   return total + item.length ;
    // }, 0);
    const uploadLinkButton = (
      <Fragment>
        {!isBtn ? (
          <a onClick={() => this.handleModalVisible('visible', true)} className={styles.fileNumber}>
            {isString(icon) ? <Icon type={icon} /> : icon}
            {btnText}
            {showFilesNumber && ((filesNumber && filesNumber !== 0) || filesLength > 0) && (
              <Tag>{filesNumber && filesNumber !== 0 ? filesNumber : filesLength}</Tag>
            )}
          </a>
        ) : isShowTips ? (
          <Popover
            content={intl.get('spcm.common.view.button.bothSupAndPurView').d('供采双方均可见')}
            placement="bottomLeft"
            trigger="hover"
          >
            <PermissionButton
              className={styles.filesNumber}
              onClick={() => this.handleModalVisible('visible', true)}
              icon={icon}
              {...btnProps}
            >
              {btnText}
              {showFilesNumber && ((filesNumber && filesNumber !== 0) || filesLength > 0) && (
                <Tag>{filesNumber && filesNumber !== 0 ? filesNumber : filesLength}</Tag>
              )}
            </PermissionButton>
          </Popover>
        ) : (
          <PermissionButton
            className={styles.filesNumber}
            onClick={() => this.handleModalVisible('visible', true)}
            icon={icon}
            {...btnProps}
          >
            {btnText}
            {showFilesNumber && ((filesNumber && filesNumber !== 0) || filesLength > 0) && (
              <Tag>{filesNumber && filesNumber !== 0 ? filesNumber : filesLength}</Tag>
            )}
          </PermissionButton>
        )}
      </Fragment>
    );

    const templateDate = templateUploadFileList
      .filter((e) => !this.isImageUrl(e))
      .map((ele) => ({ ...ele, sourceKey: 'templateUploadFileList' }));
    const purchaserNotPicData = [].concat(purchaseUploadFileListNoPic, templateDate);
    const supplierNotPicData = [].concat(supplierUploadFileListNoPic);

    let attachmentUrlValidFlag = ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(
      headerInfo.pcKindCode
    );
    let extraProps = {};
    if (remote) {
      attachmentUrlValidFlag = remote.process(
        'SPCM_CONTRACT_COMPONET_ATTACHMENT_URL',
        attachmentUrlValidFlag,
        {
          current: this,
        }
      );
      extraProps = remote.process('SPCM_CONTRACT_COMPONET_UPLOAD_EXTRA_PROPS', extraProps, {
        current: this,
      });
    }
    const { showRightComponentFlag = true } = extraProps;

    const leftComponent = (
      <Fragment>
        <div style={{ overflow: 'auto' }}>
          {purchaserTemplateList.map((item) => {
            const sourceKey = `${item.attachmentId}UploadFileList`;
            let itemFileList = [];
            let itemNoPic = [];
            let itemPic = [];
            let attachmentUuid = '';
            if (fileMap[sourceKey]) {
              itemFileList = fileMap[sourceKey];
              itemNoPic = itemFileList
                .filter((e) => !this.isImageUrl(e))
                .map((e) => ({ ...e, sourceKey, attachmentId: item.attachmentId }));
              itemPic = itemFileList.filter((e) => this.isImageUrl(e));
            }
            purchaserNotPicData.push(...itemNoPic);
            const itemUploadProps = {
              beforeUpload: async () => {
                const result = await queryUUID();
                attachmentUuid = result.content;
                Object.assign(item, { attachmentUuid });
                return true;
              },
              data: (file) => ({
                ...this.urlUploadData(file, 'sourceKey'),
                attachmentUUID: attachmentUuid,
              }),
              fileList: itemPic,
              onChange: (params) =>
                this.onUrlUploadChange(params, sourceKey, item.attachmentUrl ? '' : item),
              onRemove: (file) =>
                this.onUploadUrlRemove(file, item.attachmentUrl ? item : '', sourceKey),
              action: uuidAction,
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
                    {(itemPic.length > 0 || (purchaserUploadFlag && itemFileList.length === 0)) && (
                      <p>{item.attachmentTypeName}:</p>
                    )}
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
          {attachmentUrlValidFlag && (
            <div style={{ float: 'left' }}>
              <p>
                {intl
                  .get(`spcm.common.view.message.contractAttachment`)
                  .d('协议文本（附件合同必传）')}
                :
              </p>
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
                {contractTypeFlag &&
                  contractTemplateUploadFileList.length === 0 &&
                  showAddTemplateIcon && (
                    <div>
                      <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                    </div>
                  )}
              </Upload>
              {contractTemplateUploadFileListNoPic.length > 0 && purchaserFilePreview && (
                <List
                  style={!purchaserUploadFlag ? { float: 'left', width: '100%' } : {}} // 处理未起初浮动导致upload没高度问题
                  header={
                    single ? null : (
                      <div>
                        {intl.get('hzero.common.upload.fileList').d('文档列表（可在线预览）')}
                      </div>
                    )
                  }
                  bordered
                  className={styles['file-list']}
                  dataSource={contractTemplateUploadFileListNoPic}
                  renderItem={(item) =>
                    this.renderItem(
                      item,
                      supplierAttachmentUuid,
                      !purchaserUploadFlag,
                      'contractTemplateUploadFileList'
                    )
                  }
                />
              )}
            </div>
          )}
        </div>
        <div>
          {purchaserUploadFlag && (
            <p>{intl.get(`spcm.common.view.message.comContractAttachment`).d('协议附件')}:</p>
          )}
          <Upload {...purchaserUploadProps}>
            {purchaserUploadFlag && (
              <div>
                <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
              </div>
            )}
          </Upload>
          {purchaserNotPicData.length > 0 && purchaserFilePreview && (
            <List
              style={!purchaserUploadFlag ? { float: 'left', width: '100%' } : {}} // 处理未起初浮动导致upload没高度问题
              header={
                single ? null : (
                  <div>{intl.get('hzero.common.upload.fileList').d('文档列表（可在线预览）')}</div>
                )
              }
              bordered
              className={styles['file-list']}
              dataSource={purchaserNotPicData}
              renderItem={(item) =>
                this.renderItem(
                  item,
                  attachmentUUID,
                  !purchaserUploadFlag,
                  item.sourceKey ? item.sourceKey : 'purchaseUploadFileList'
                )
              }
            />
          )}
        </div>
      </Fragment>
    );
    const rightComponent = (supplierUploadFlag || supplierViewFlag) && (
      <Fragment>
        <div style={{ overflow: 'auto' }}>
          {supplierTemplateList.map((item) => {
            const sourceKey = `${item.attachmentId}UploadFileList`;
            let itemFileList = [];
            let itemNoPic = [];
            let itemPic = [];
            let attachmentUuid = '';
            if (fileMap[sourceKey]) {
              itemFileList = fileMap[sourceKey];
              itemNoPic = itemFileList
                .filter((e) => !this.isImageUrl(e))
                .map((e) => ({ ...e, sourceKey, attachmentId: item.attachmentId }));
              itemPic = itemFileList.filter((e) => this.isImageUrl(e));
            }
            supplierNotPicData.push(...itemNoPic);
            const itemUploadProps = {
              beforeUpload: async () => {
                const result = await queryUUID();
                attachmentUuid = result.content;
                Object.assign(item, { attachmentUuid });
                return true;
              },
              data: (file) => ({
                ...this.urlUploadData(file, 'sourceKey'),
                attachmentUUID: attachmentUuid,
              }),
              fileList: itemPic,
              onChange: (params) =>
                this.onUrlUploadChange(params, sourceKey, item.attachmentUrl ? '' : item),
              onRemove: (file) =>
                this.onUploadUrlRemove(file, item.attachmentUrl ? item : '', sourceKey),
              action: uuidAction, //
              showUploadList: {
                showRemoveIcon: supplierUploadFlag && showRemoveIcon,
                removePopConfirmTitle: intl
                  .get('hzero.common.message.confirm.delete')
                  .d('是否删除此条记录?'),
              },
            };
            return (
              <div style={{ float: 'left' }}>
                <Fragment>
                  {(itemPic.length > 0 || (supplierUploadFlag && itemFileList.length === 0)) && (
                    <p>{item.attachmentTypeName}:</p>
                  )}
                  <Upload {...commonUploadProps} {...itemUploadProps}>
                    {supplierUploadFlag && itemFileList.length === 0 && (
                      <Tooltip title={item.remark}>
                        <div>
                          <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                        </div>
                      </Tooltip>
                    )}
                  </Upload>
                </Fragment>
              </div>
            );
          })}
        </div>
        <div>
          {supplierUploadFlag && (
            <p>{intl.get(`spcm.common.view.message.comContractAttachment`).d('协议附件')}:</p>
          )}
          <Upload {...supplierUploadProps}>
            {supplierUploadFlag && (
              <div>
                <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
              </div>
            )}
          </Upload>
          {supplierNotPicData.length > 0 && supplierFilePreview && (
            <List
              style={supplierFilePreview ? { float: 'left', width: '100%' } : {}} // 处理未起初浮动导致upload没高度问题
              header={
                single ? null : (
                  <div>{intl.get('hzero.common.upload.fileList').d('文档列表（可在线预览）')}</div>
                )
              }
              bordered
              className={styles['file-list']}
              dataSource={supplierNotPicData}
              renderItem={(item) =>
                this.renderItem(
                  item,
                  supplierAttachmentUuid,
                  !supplierUploadFlag,
                  item.sourceKey ? item.sourceKey : 'supplierUploadFileList'
                )
              }
            />
          )}
        </div>
      </Fragment>
    );
    const modalContent = (
      <Spin spinning={queryAttachmentList}>
        <Row>
          {(supplierViewFlag || supplierUploadFlag) && (
            <Fragment>
              <Col span={12}>
                <p>{intl.get(`entity.attachment.type.purchaser.spcm`).d('采购方附件')}:</p>
                {leftComponent}
              </Col>
              {showRightComponentFlag && (
                <Col span={12}>
                  <p>{intl.get(`entity.attachment.type.supplier.spcm`).d('供应商附件')}:</p>
                  {rightComponent}
                </Col>
              )}
            </Fragment>
          )}
          {(!(supplierViewFlag || supplierUploadFlag) || contractTypeFlag) && leftComponent}
        </Row>
      </Spin>
    );

    const viewerContainerCls = classnames(
      styles['viewer-container'],
      { [styles['viewer-container-show']]: previewVisible },
      fileViewerClassName
    );

    return (
      <Fragment>
        {uploadLinkButton}
        <Modal {...attachmentModalProps}>{modalContent}</Modal>
        {custViewContainerId && <div className={viewerContainerCls} id={custViewContainerId} />}
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={() => this.handleModalVisible('previewVisible', false)}
          images={previewImages}
          container={custViewContainerId ? document.getElementById(custViewContainerId) : null}
        />
      </Fragment>
    );
  }
}
