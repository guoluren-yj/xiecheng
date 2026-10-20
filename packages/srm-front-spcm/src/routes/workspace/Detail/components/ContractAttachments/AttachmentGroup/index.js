/*
 * 附件上传组件
 * @date: 2019-05-28
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Attachment as C7nAttachment, Form } from 'choerodon-ui/pro';
import UrlAttachment from 'srm-front-boot/lib/components/UrlAttachment';
import { connect } from 'dva';
import { isArray, isEmpty, isString, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getAccessToken, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryUUID } from 'services/api';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { textContractFileType, textContractAccept } from '@/utils/util';
import styles from '../index.less';

const DEFAULT_BUCKET_NAME = PRIVATE_BUCKET;

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
export default class AttachmentGroup extends Component {
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
      customAttachmentDs: props?.customAttachmentDs,
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

  @Bind()
  batchGetTemlateUUid() {
    const { dispatch, templateList = [], headerInfo, onRefresh } = this.props;
    const { pcHeaderId } = headerInfo;
    // 没有附件id的集合
    const noUuidList = templateList.filter((item) => !item.attachmentUuid);
    if (!noUuidList.length) {
      return false;
    }
    const promiseArr = noUuidList.map((item) => {
      return new Promise(async (resolve, reject) => {
        const result = getResponse(await queryUUID());
        if (result) {
          dispatch({
            type: 'contractCommon/updatePcAttachmentList',
            payload: {
              pcHeaderId,
              body: {
                ...item,
                attachmentUuid: result.content,
              },
            },
          }).then((res) => {
            if (res) {
              resolve(res);
            }
            reject();
          });
        }
      });
    });
    Promise.all(promiseArr).then((res) => {
      if (res && onRefresh) {
        onRefresh();
      }
    });
  }

  @Bind()
  fetchAttachmentList() {
    const {
      dispatch,
      attachmentUUID,
      // onFetchHeader,
      supplierAttachmentUuid,
      onChangeState,
      headerInfo = {},
      // templateList = [],
      purchaserParams = {},
      supplierParams = {},
      // onRefresh,
    } = this.props;
    const { purchaserUploadFlag } = purchaserParams;
    const { supplierUploadFlag } = supplierParams;
    const { customAttachmentDs } = this.state;
    // 将配置的附件列表渲染上去
    // templateList.forEach((item) => {
    //   if (!item.attachmentUuid) {
    //     queryUUID().then((res) => {
    //       const result = getResponse(res);
    //       if (result) {
    //         dispatch({
    //           type: 'contractCommon/updatePcAttachmentList',
    //           payload: {
    //             pcHeaderId,
    //             body: {
    //               ...item,
    //               attachmentUuid: result.content,
    //             },
    //           },
    //         }).then(() => {
    //           if (onRefresh) {
    //             onRefresh();
    //           }
    //         });
    //       }
    //     });
    //   }
    // });
    this.batchGetTemlateUUid();

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
              customAttachmentDs.current.set(
                'supplierAttachmentUuid',
                updateResult.supplierAttachmentUuid
              );
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
              customAttachmentDs.current.set('attachmentUuid', updateResult.attachmentUuid);
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

    this.setState(() => ({
      renderFlag: true,
    }));
  }

  @Bind()
  onUploadChange(file, field, item) {
    const {
      dispatch,
      onRefresh,
      headerInfo,
      onUpdateHeader,
      onChangeState,
      headerFormDs,
    } = this.props;
    const { pcHeaderId } = headerInfo;
    const { fileUrl } = file;
    // 协议文本附件上传
    if (field === 'templateUploadFileList') {
      // urlAttachment返回的file就是url地址
      onUpdateHeader({ ...headerInfo, contractAttachmentUrl: fileUrl || file }).then((res) => {
        if (res) {
          // if (onRefresh) {
          //   onRefresh();
          // }
          if (onChangeState) {
            onChangeState({
              headerInfo: {
                ...headerInfo,
                contractAttachmentUrl: res?.contractAttachmentUrl,
                objectVersionNumber: res?.objectVersionNumber,
              },
            });
            headerFormDs.getField('contractAttachmentUrl').set('required', false);
          }
          // notification.success();
        }
      });
    } else {
      dispatch({
        type: 'contractCommon/updatePcAttachmentList',
        payload: {
          pcHeaderId,
          body: {
            ...item,
            attachmentUrl: fileUrl,
          },
        },
      }).then((res) => {
        if (res) {
          if (onRefresh) {
            onRefresh();
          }
          // notification.success();
        }
      });
    }
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  onUploadRemove(file, uuid) {
    const { dispatch } = this.props;
    if (file.url && ['success', 'done'].includes(file.status)) {
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
            // notification.success();
            resolve();
          }
          reject();
        });
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
   * 删除URL的附件
   * 只有文件服务删除了url，并且更新了对应的头行才清空对应的文件列表
   * 每个附件列表只有一个文件
   * @param {Object} file
   * */
  @Bind()
  onUploadUrlRemove(file, item = {}, field) {
    const { onRefresh, onUpdateHeader, onChangeState, headerInfo } = this.props;
    const { $form, ...itemInfo } = item;
    if (file.url && ['success', 'done'].includes(file.status)) {
      if (field === 'templateUploadFileList') {
        return onUpdateHeader({ ...itemInfo, contractAttachmentUrl: '' }).then((res) => {
          // if (onRefresh) {
          //   onRefresh();
          // }
          if (onChangeState) {
            onChangeState({
              headerInfo: {
                ...headerInfo,
                contractAttachmentUrl: res?.contractAttachmentUrl,
                objectVersionNumber: res?.objectVersionNumber,
              },
            });
          }
          // notification.success();
        });
      } else {
        return new Promise((resolve, reject) => {
          Promise.all([
            this.handleDeleteFilesByUrl(file),
            this.handleDeleteConfigFiles(itemInfo),
          ]).then(
            (res) => {
              if (res) {
                if (onRefresh) {
                  onRefresh();
                }
                // notification.success();
                resolve();
              }
            },
            () => {
              reject();
            }
          );
        });
      }
    }
  }

  // 动态渲染配置附件列表
  renderDynamicAttachments(attachments, uploadFlag) {
    const {
      bucketName,
      bucketDirectory,
      fileSize = 500 * 1024 * 1024,
      showHistory,
      onRemove,
      businessParams = {},
    } = this.props;
    const commonProps = {
      bucketName,
      bucketDirectory,
    };
    return attachments.map((item) => {
      const { attachmentId, attachmentTypeCode, attachmentUrl, remark } = item;
      const sourceKey = `${attachmentId}UploadFileList`;
      const itemUploadProps = {
        readOnly: !uploadFlag,
        name: `template-${attachmentTypeCode}`,
        // value: item.attachmentUuid,
        max: 1,
        fileSize,
        showHistory,
        onUploadSuccess: (file) => {
          this.onUploadChange(file, sourceKey, item);
        },
        onRemove: isFunction(onRemove)
          ? onRemove
          : (file) => {
              this.onUploadUrlRemove(file, item, sourceKey);
            },
        ...businessParams,
      };
      return (
        (uploadFlag || (!uploadFlag && attachmentUrl)) && (
          <C7nAttachment help={remark} {...commonProps} {...itemUploadProps} />
        )
      );
    });
  }

  @Bind()
  renderUrlAttachment(attachmentProps, otherProps) {
    const { headerInfo, remoteWorkDetail, showTextMode = false } = this.props;
    let showFlag =
      (['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && !showTextMode)
      || Number(headerInfo.showAttachmentFlag) === 1;
    if (remoteWorkDetail) {
      showFlag = remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_ATTACHMENT_URL', showFlag, {
        current: this,
      });
    }
    return (
      showFlag && (
        <UrlAttachment
          {...otherProps}
          {...attachmentProps}
          label={intl
            .get(`spcm.common.view.message.contractAttachment`)
            .d('协议文本（附件合同必传）')}
        />
      )
    );
  }

  render() {
    const {
      customizeForm,
      headerFormDs,
      attachmentUUID,
      supplierAttachmentUuid,
      templateList = [],
      purchaserParams = {},
      supplierParams = {},
      headerInfo,
      fileSize = 500 * 1024 * 1024,
      remoteWorkDetail,
      custCode,
      isBlacklistTenant,
      ...otherProps
    } = this.props;
    const { customAttachmentDs } = this.state;
    const { purchaserUploadFlag = false } = purchaserParams;
    const { supplierUploadFlag = false, supplierViewFlag = false } = supplierParams;
    const { signatureType, electricSignFlag, authType } = headerInfo || {};
    let cuxProps = {};
    if (remoteWorkDetail) {
      cuxProps = remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_ATTACHMENT_CUXPROPS', cuxProps, {
        current: this,
      });
    }
    const purchaserUploadProps = {
      fileSize,
      name: 'attachmentUuid',
      readOnly: !purchaserUploadFlag,
      label: intl.get(`spcm.common.view.message.comContractAttachment`).d('协议附件'),
      onRemove: (file) => this.onUploadRemove(file, attachmentUUID),
      ...(cuxProps?.purchaserUploadProps || {}),
    };

    // 协议文本附件
    const attachmentProps = {
      name: 'contractAttachmentUrl',
      max: 1,
      readOnly: !purchaserUploadFlag,
      onUploadSuccess: (file) => {
        this.onUploadChange(file, 'templateUploadFileList');
      },
      onRemove: (file) => this.onUploadUrlRemove(file, headerInfo, 'templateUploadFileList'),
      ...(cuxProps?.attachmentProps || {}),
      beforeUpload: (file) => {
        // 租户不在黑名单中，且签章类型=文本签章or 文本及附件签章，校验文件格式，只能是pdf或word（.doc/.docx）
        if (
          !isBlacklistTenant &&
          ['TEXT_SIGNATURE', 'TEXT_AND_ANNEX_SIGNATURE'].includes(signatureType) &&
          Number(electricSignFlag) === 1 &&
          authType !== 'ESIGN' &&
          textContractAccept.indexOf(file.type) === -1
        ) {
          file.status = 'error'; // eslint-disable-line
          notification.error({
            description: intl
              .get('hzero.common.upload.error.type', {
                fileType: textContractFileType,
              })
              .d(`上传文件类型必须是: ${textContractFileType}`),
          });
          return false;
        }
        return true;
      },
    };

    const supplierUploadProps = {
      fileSize,
      name: 'supplierAttachmentUuid',
      readOnly: !supplierUploadFlag || supplierViewFlag,
      label: intl.get(`entity.attachment.type.supplier.spcm`).d('供应商附件'),
      onRemove: (file) => this.onUploadRemove(file, supplierAttachmentUuid),
      ...(cuxProps?.supplierUploadProps || {}),
    };

    // 基于10-01迭代srm-27043对供方附件的拆分，将协议类型里配置的附件模块列表拆分成：供方列表和采购方列表
    const purchaserTemplateList = [];
    const supplierTemplateList = [];
    if (isArray(templateList) && !isEmpty(templateList)) {
      templateList.forEach((item) => {
        const { attachmentTypeCode, attachmentTypeName, attachmentUuid } = item;
        const fieldName = `template-${attachmentTypeCode}`;
        if (!customAttachmentDs.getField(fieldName)) {
          customAttachmentDs.addField(fieldName, {
            label: attachmentTypeName,
            type: 'attachment',
            // required: item.nullableFlag === 0 && !item.supAttachmentFlag && !item.attachmentUrl,
          });
        }
        customAttachmentDs.current.set(fieldName, attachmentUuid);
        if (item.supAttachmentFlag) {
          supplierTemplateList.push(item);
        } else {
          purchaserTemplateList.push(item);
        }
      });
    }
    return (
      <>
        {customizeForm(
          {
            code: custCode?.CUSTOM_ATTACHMENT,
          },
          <Form
            dataSet={customAttachmentDs}
            labelLayout="float"
            columns={1}
            className={styles.formWrapper}
          >
            <C7nAttachment {...purchaserUploadProps} {...otherProps} />
            {this.renderUrlAttachment(attachmentProps, otherProps)}
            {(supplierUploadFlag || supplierViewFlag) && (
              <C7nAttachment {...supplierUploadProps} {...otherProps} />
            )}
          </Form>
        )}
        <Form
          dataSet={customAttachmentDs}
          labelLayout="float"
          columns={1}
          className={styles.formWrapper2}
        >
          {this.renderDynamicAttachments(purchaserTemplateList, purchaserUploadFlag)}
          {(supplierUploadFlag || supplierViewFlag) &&
            this.renderDynamicAttachments(supplierTemplateList, supplierUploadFlag)}
        </Form>
      </>
    );
  }
}
