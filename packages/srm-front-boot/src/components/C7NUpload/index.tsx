/* eslint-disable no-multi-assign */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-filename-extension */
import type { CSSProperties, ReactNode } from 'react';
import React from 'react';
import { action, computed, runInAction, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Icon, Modal, notification, Spin, Tooltip } from 'choerodon-ui/pro';
import type { FormFieldProps } from 'choerodon-ui/pro/lib/field/FormField';
import { FormField } from 'choerodon-ui/pro/lib/field/FormField';
import { Alert, getConfig, Tag } from 'choerodon-ui';
import { isEmpty, isFunction } from 'lodash';
import noop from 'lodash/noop';
import { Bind } from 'lodash-decorators';
import formatString from 'choerodon-ui/pro/lib/formatter/formatString';
import 'react-viewer/dist/index.css';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import message from 'choerodon-ui/pro/lib/message';
import intl from 'utils/intl';
import { getEnvConfig } from 'utils/iocUtils';
import { getAccessToken, getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'utils/utils';
import { downloadFileByAxios, queryFileList, queryUUID, removeFile } from 'services/api';
import { getConfig as getHzeroBootConfig } from 'hzero-boot';

import autobind from 'choerodon-ui/pro/lib/_util/autobind';
import isIE from 'choerodon-ui/pro/lib/_util/isIE';
import type EventManager from 'choerodon-ui/lib/_util/EventManager';
import UploadBtn from './UploadBtn';
import styles from './upload.less';
import { fetchRemoteFileSizeLimit } from '../../utils/utils';

interface UploadProps {
  bucketName?: string;
  bucketDirectory?: string;
  removeCallback?: Function;
  uploadSuccess?: Function;
  onChange?: Function;
  viewOnly?: boolean;
  hasTemplate?: boolean;
  icon?: string;
  showFilesNumber?: boolean;
  btnText?: string;
  description?: string;
  btnProps?: any;
  title?: string;
  docType?: string;
  storageCode?: string;
  uploadData?: Function;
  fileType?: string;
  fileSize?: number;
  templateUUID?: string;
  isMultiple?: boolean;
  uploadShowFlag?: boolean;
  afterOpenUploadModal?: Function;
  showHistory?: boolean;
  notUseLabel?: boolean;
  fileStatusRenderer?: ({ file }) => ReactNode;
};

interface UploadState {
  visible: boolean;
  loading: boolean;
  tenantId?: number;
  modalLoading: boolean;
  templateList: any[];
  fileList: any[];
}

@observer
export default class Upload extends FormField<UploadProps & FormFieldProps> {
  static displayName = 'BktUpload';

  config: any;

  state: UploadState;

  upload: UploadBtn | undefined;

  tempValue: string | undefined;

  uploadAction: any;

  headers: any;

  previewUrl: string = '';

  currentUuid: string = '';

  finishInitFileList: boolean = false;

  previewUrl2: string = '';

  event?: EventManager;

  changeRecordOrDs: Function;

  constructor(props, context) {
    super(props, context);
    this.state = {
      visible: false,
      loading: false,
      modalLoading: false,
      templateList: [],
      fileList: [],
      tenantId: getCurrentOrganizationId(),
    };
    const { onRef, action: propAction } = props;
    if (onRef) onRef(this);
    this.config = getEnvConfig();
    const { HZERO_FILE } = this.config;
    this.uploadAction = propAction ||
      (isTenantRoleLevel()
        ? `${HZERO_FILE}/v1/${this.state.tenantId}/files/attachment/multipart`
        : `${HZERO_FILE}/v1/files/attachment/multipart`);
    this.previewUrl = isTenantRoleLevel()
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file/preview`
      : `${HZERO_FILE}/v1/file/preview`;
    this.previewUrl2 = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview`;
    const accessToken = getAccessToken();
    this.headers = {
      processData: false, // 不会将 data 参数序列化字符串
      // method: 'POST',
      type: 'FORM',
      responseType: 'text',
      ...this.getRequestHeader(),
    };
    if (accessToken) {
      this.headers.Authorization = `bearer ${accessToken}`;
    }
    this.changeRecordOrDs = reaction(() => this.record, () => {
      this.clearFileList();
      if (this.event) {
        this.event.removeEventListener("fieldChange");
      }
      this.finishInitFileList = false;
    });
  }

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'upload-bkt',
    uploadShowFlag: false,
    isMultiple: true,
  };

  @computed
  get isMultiple() {
    return this.getProp('isMultiple');
  }

  @computed
  get bucketName() {
    return this.getProp('bucketName');
  }

  @computed
  get bucketDirectory() {
    return this.getProp('bucketDirectory');
  }

  @computed
  get storageCode() {
    return this.getProp('storageCode');
  }

  @computed
  get docType() {
    return this.getProp('docType');
  }

  @computed
  get fileType() {
    return this.getProp('fileType');
  }

  @computed
  get fileSize() {
    return this.getProp('fileSize');
  }

  @computed
  get viewOnly() {
    return this.getProp('viewOnly') || this.isDisabled();
  }

  @computed
  get showFilesNumber() {
    return this.getProp('showFilesNumber');
  }

  @computed
  get btnText() {
    return this.getProp('btnText');
  }

  @computed
  get title() {
    return this.getProp('title');
  }

  @computed
  get hasTemplate() {
    return this.getProp('hasTemplate');
  }

  @computed
  get templateUUID() {
    return this.getProp('templateUUID');
  }

  @computed
  get description() {
    return this.getProp('description');
  }

  @computed
  get withCredentials() {
    return this.getProp('withCredentials');
  }

  @computed
  get showPreviewFile() {
    return this.getProp('showPreviewFile');
  }

  @computed
  get help() {
    return this.getProp('help');
  }

  @computed
  get linkText() {
    const propText = this.props.notUseLabel ? undefined : this.getProp('label');
    const innerText = this.viewOnly
      ? intl.get('hzero.common.upload.view').d('查看附件')
      : intl.get('hzero.common.upload.text').d('上传附件');
    return propText || innerText;
  }

  componentDidMount() {
    const uuid = this.getValue();
    if (uuid) {
      this.fetchFileList(uuid, fileList => {
        if (this.upload) {
          this.upload.setFileList(fileList);
        }
      });
      this.finishInitFileList = true;
    }
  }

  // 可能一开始uuid为空就不会走查询，需要在didupdate再次判断
  componentDidUpdate() {
    // 在组件生命周期内，要避免record上的fileList被清除
    if (this.finishInitFileList && this.record && this.name && !this.record.getState(`__${this.name}__`)) {
      this.record.setState(`__${this.name}__`, this.state.fileList);
    }
    if (!this.finishInitFileList && this.getValue()) {
      this.fetchFileList(this.getValue(), fileList => {
        if (this.upload) {
          this.upload.setFileList(fileList);
        }
      });
      this.finishInitFileList = true;
    }

    if (!this.event && this.dataSet && this.name) {
      this.event = this.dataSet.addEventListener("fieldChange", ({ value, oldValue }) => {
        if (!value && value !== oldValue) {
          // eslint-disable-next-line react/no-did-update-set-state
          this.clearFileList();
        }
      });
    }
  }

  clearFileList = () => {
    this.setState({
      modalLoading: false,
      fileList: [],
      templateList: [],
    });
    if (this.upload) {
      this.upload.setFileList([]);
    }
  }

  componentWillUnmount() {
    if (this.event) {
      this.event.removeEventListener("fieldChange");
    }
    this.changeRecordOrDs();
  }

  @autobind
  handleMouseDown(e) {
    if (e.target !== this.element) {
      // e.preventDefault();
      if (!this.isFocused) {
        this.focus();
      }
    }
  }

  interceptOpenUploadModal = async (callback) => {
    if (!this.finishInitFileList) {
      await this.openUploadModal();
    }
    callback();
  };

  // 非业务场景需要，不推荐使用
  directiveRender() {
    const {
      hasTemplate,
      description,
      help,
      props: { showHistory, fileStatusRenderer },
    } = this;
    const {
      modalLoading,
      templateList = [],
      loading = false,
    } = this.state;

    let descriptionBlock: any = null;
    if (hasTemplate || description) {
      const templateLinks = templateList.map((tpl) => (
        <Tag>
          <a
            // eslint-disable-next-line no-script-url
            href="javascript:void(0)"
            onClick={() => {
              let queryParams: any[] = [];
              const paramStr = tpl.url.split("?")[1];
              if (paramStr) {
                queryParams = paramStr.split("&").map(param => {
                  const [name, value] = param.split("=");
                  return { name, value };
                }).filter(item => !["access_token"].includes(item.name));
              }
              downloadFileByAxios({ requestUrl: tpl.url, queryParams, method: "GET" });
            }}
            rel="noopener noreferrer"
          >
            {tpl.fileName}
          </a>
        </Tag>
      ));
      const messaget = (
        <>
          <div>{description}</div>
          <div>
            {hasTemplate && (
              <span>
                {intl.get('hzero.common.upload.template').d('附件模板')}: {templateLinks}
              </span>
            )}
          </div>
        </>
      );

      descriptionBlock = (
        <Alert
          showIcon
          className={styles['c7n-alert-bkt']}
          message={messaget}
          style={{ marginRight: '8px', marginBottom: '15px' }}
          type="info"
        />
      );
    }

    const wrapperProps = this.getWrapperProps();

    // 修复ie下出现多层model导致的输入框遮盖问题
    // fixed the input would shadow each other in ie brower
    const ZIndexOfIEProps: { style: CSSProperties } | {} = isIE() ? { style: { zIndex: 'auto' } } : {};

    const element = (
      <span key="element" {...wrapperProps}>

        <span {...ZIndexOfIEProps} onMouseDown={this.handleMouseDown}>
          <div className={this.prefixCls}>
            <div>
              {descriptionBlock}
              <Spin spinning={modalLoading || loading}>
                <UploadBtn
                  interceptOpenUploadModal={this.interceptOpenUploadModal}
                  currentUuid={this.currentUuid}
                  setRef={this.setUpload}
                  multiple={this.isMultiple}
                  viewOnly={this.viewOnly}
                  headers={this.headers}
                  action={this.uploadAction}
                  data={this.uploadData}
                  beforeUpload={this.beforeUpload}
                  onRemoveFile={this.removeFile}
                  onUploadSuccess={this.onUploadSuccess}
                  initUploadList={this.initUploadList}
                  withCredentials={this.withCredentials}
                  previewProps={{
                    showHistory,
                    showPreviewFile: this.showPreviewFile,
                    previewUrl: this.previewUrl,
                    previewUrl2: this.previewUrl2,
                    tenantId: this.state.tenantId,
                    bucketName: this.bucketName,
                    storageCode: this.storageCode,
                    token: this.headers.Authorization,
                  }}
                  suffix={
                    <span>
                      {this.linkText}
                      {help && (
                        <Tooltip title={help} openClassName={`${getConfig('proPrefixCls')}-tooltip-popup-help`} placement="bottom">
                          <Icon type="help" style={{ fontSize: '15px', verticalAlign: 'text-bottom' }} />
                        </Tooltip>
                      )}
                      : &nbsp;
                    </span>
                  }
                  fileStatusRenderer={fileStatusRenderer}
                />
              </Spin>
            </div>
          </div>
        </span>
      </span>
    );

    return element;
  }

  openModal() {
    // render(){
    const {
      title = intl.get('hzero.common.upload.modal.title').d('附件'),
      hasTemplate,
      description,
      props: {
        showHistory,
        fileStatusRenderer,
      },
      state: {
        modalLoading,
        templateList = [],
        loading = false,
      },
    } = this;
    let descriptionBlock: any = null;
    if (hasTemplate || description) {
      const templateLinks = templateList.map((tpl) => (
        <Tag>
          <a
            href={tpl.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tpl.fileName}
          </a>
        </Tag>
      ));
      const messaget = (
        <>
          <div>{description}</div>
          <div>
            {hasTemplate && (
              <span>
                {intl.get('hzero.common.upload.template').d('附件模板')}: {templateLinks}
              </span>
            )}
          </div>
        </>
      );

      descriptionBlock = (
        <Alert
          showIcon
          className={styles['c7n-alert-bkt']}
          message={messaget}
          style={{ marginRight: '8px', marginBottom: '15px' }}
          type="info"
        />
      );
    }
    Modal.open({
      title,
      width: 720,
      closable: true,
      footer: null,
      movable: false,
      destoryOnClose: true,
      onClose: this.closeUploadModal,
      children: (
        <>
          <div>
            {descriptionBlock}
            <Spin spinning={modalLoading || loading}>
              <UploadBtn
                currentUuid={this.currentUuid}
                setRef={this.setUpload}
                multiple={this.isMultiple}
                viewOnly={this.viewOnly}
                headers={this.headers}
                action={this.uploadAction}
                data={this.uploadData}
                beforeUpload={this.beforeUpload}
                onRemoveFile={this.removeFile}
                onUploadSuccess={this.onUploadSuccess}
                initUploadList={this.initUploadList}
                withCredentials={this.withCredentials}
                previewProps={{
                  showHistory,
                  showPreviewFile: this.showPreviewFile,
                  previewUrl: this.previewUrl,
                  previewUrl2: this.previewUrl2,
                  tenantId: this.state.tenantId,
                  bucketName: this.bucketName,
                  storageCode: this.storageCode,
                  token: this.headers.Authorization,
                }}
                fileStatusRenderer={fileStatusRenderer}
              />
            </Spin>
          </div>
        </>
      ),
    });
  }

  renderWrapper() {
    // render(){
    const {
      showFilesNumber = true,
      linkText,
      help,
      props: {
        icon = 'attachment',
        btnProps = {},
      },
      state: {
        fileList = [],
      },
    } = this;
    const uploadLinkButton = (
      <>
        {isEmpty(btnProps) ? (
          // @ts-ignore
          <a onClick={this.openUploadModal}>
            {icon && <Icon type={icon} style={{ fontSize: '15px', verticalAlign: 'text-top' }} />}
            {linkText}
            {help && (
              <Tooltip title={help} openClassName={`${getConfig('proPrefixCls')}-tooltip-popup-help`} placement="bottom">
                <Icon type="help" style={{ fontSize: '15px', verticalAlign: 'text-bottom' }} />
              </Tooltip>
            )}
          </a>
        ) : (
          <Button onClick={this.openUploadModal} {...btnProps}>
            {linkText}
            {help && (
              <Tooltip title={help} openClassName={`${getConfig('proPrefixCls')}-tooltip-popup-help`} placement="bottom">
                <Icon type="help" style={{ fontSize: '15px', verticalAlign: 'text-bottom' }} />
              </Tooltip>
            )}
          </Button>
        )}
        {showFilesNumber && (fileList.length > 0) && (
          <Tag
            style={{
              height: 'auto',
              lineHeight: '15px',
              marginLeft: '4px',
            }}
          >
            {fileList.length}
          </Tag>
        )}
      </>
    );

    const wrapperProps = this.getWrapperProps();


    // 修复ie下出现多层model导致的输入框遮盖问题
    // fixed the input would shadow each other in ie brower
    const ZIndexOfIEProps: { style: CSSProperties } | {} = isIE() ? { style: { zIndex: 'auto' } } : {};

    const element = (
      <span key="element" {...wrapperProps}>

        <span {...ZIndexOfIEProps} onMouseDown={this.handleMouseDown}>
          <div className={this.prefixCls}>
            {uploadLinkButton}
          </div>
        </span>
      </span>
    );

    return element;
  }

  render() {
    const validationMessage = this.renderValidationResult();
    const wrapper = this.props.uploadShowFlag ? this.directiveRender() : this.renderWrapper();
    const help = this.renderHelpMessage();
    /**
     * 用户自定义校验存在的话说明用户保证校验情况那么多选这些应该存在校验信息
     * If the user-defined verification exists, it means that the user guarantees
     * that the verification situation is so many. These should have verification information
     */
    const customValidator = this.getProp('validator');
    return (
      <Tooltip
        suffixCls={`form-tooltip ${getConfig('proPrefixCls')}-tooltip`}
        title={
          (!!(this.multiple && this.getValues().length) && !customValidator || this.multipleValidateMessageLength > 0) ||
            this.isValidationMessageHidden(validationMessage)
            ? null
            : validationMessage
        }
        theme="light"
        placement="bottomLeft"
      >
        {wrapper}
        {help}
      </Tooltip>
    );
  }

  fetchFileList = (uuid, nextCallBack?: Function) => {
    const { tenantId } = this.state;
    this.setState({ modalLoading: true });
    queryFileList({ tenantId, bucketName: this.bucketName, attachmentUUID: uuid }).then(
      (fileList) => {
        if (getResponse(fileList)) {
          const newFileList = this.changeFileList(fileList).map(i => ({ ...i, status: 'success' }));
          this.setState({
            modalLoading: false,
            fileList: newFileList,
          });
          if (this.record && this.name) {
            this.record.setState(`__${this.name}__`, newFileList);
          }
          this.currentUuid = uuid;
          return newFileList;
        }
        return [];
      },
    ).then(res => {
      if (nextCallBack) {
        nextCallBack(res);
      }
    });
  };

  setUpload = upload => {
    this.upload = upload;
  };

  @action
  setValue(value: any): void {
    let tmpValue = value;
    if (!this.isReadOnly()) {
      const {
        name,
        dataSet,
        trim,
        format,
        observableProps: { dataIndex },
      } = this;
      // 当通过setValue出发查询文件列表接口时亦等同于初始化文件列表
      this.finishInitFileList = true;
      const { onChange = noop } = this.props;
      const { formNode } = this.context;
      const old = this.getOldValue();
      // 转成实际的数据再进行判断
      if (old !== value) {
        onChange(value, old, formNode);
        this.fetchFileList(tmpValue, fileList => {
          if (this.upload) {
            this.upload.updateFileList(fileList);
          }
        });
      }
      if (dataSet && name) {
        // 必须放后面
        (this.record || dataSet.create({}, dataIndex)).set(name, value);
      } else {
        tmpValue = formatString(value, {
          trim,
          format,
        });
        this.validate(value);
      }
      this.value = tmpValue;
    }
  }

  /**
   *格式化已经上传的文件列表
   *
   * @param {*} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   * @memberof UploadModal
   */
  @Bind()
  changeFileList(response) {
    return response.map(res => ({
      ...res,
      name: res.fileName,
      status: 'done',
      type: res.fileType,
      size: res.fileSize,
      filename: res.fileName,
      url: res.fileUrl,
      creationDate: res.creationDate,
    }));
  }

  @Bind()
  closeUploadModal(): any {
    this.setState({
      visible: false,
    });
  }

  /**
   *打开modal后返回方法，可返回UUID
   *
   * @memberof UploadModal
   */
  @Bind()
  handleAfterOpenModal() {
    const { afterOpenUploadModal } = this.props;
    if (isFunction(afterOpenUploadModal)) {
      afterOpenUploadModal(this.getValue() || this.currentUuid);
    }
  }

  @Bind()
  async openUploadModal() {
    const {
      tenantId,
    } = this.state;
    if (!this.props.uploadShowFlag) this.openModal();
    if (!this.getValue() && !this.tempValue) {
      this.setState({
        loading: true,
      });
      const response = await queryUUID({ tenantId });
      if (response) {
        this.currentUuid = this.tempValue = response.content;
      }
    }

    if (this.hasTemplate && this.templateUUID) {
      const templateList = await queryFileList({
        tenantId,
        bucketName: this.bucketName,
        attachmentUUID: this.templateUUID,
      });
      if (getResponse(templateList)) {
        this.setState({ templateList });
      }
    }
    this.setState({
      loading: false,
    }, () => {
      this.handleAfterOpenModal();
    });
  }

  @Bind()
  initUploadList(upload) {
    runInAction(() => {
      // eslint-disable-next-line no-param-reassign
      upload.fileList = this.state.fileList;
    });
  }

  /**
   *上传成功后调用方法
   *
   * @param {*} file 文件信息
   * @param {*} fileList 文件列表
   * @memberof UploadModal
   */
  @Bind()
  onUploadSuccess(response, file) {
    const { uploadSuccess } = this.props;
    if (uploadSuccess) {
      uploadSuccess(response, file);
    }
    const { fileList } = this.state;
    // eslint-disable-next-line no-param-reassign
    const newFileList = fileList.filter(stateFile => stateFile.url !== file.url).concat(file);
    if (this.record && this.name) {
      this.record.setState(`__${this.name}__`, newFileList);
    }
    if (newFileList.length === 1 && fileList.length === 0) this.validate(this.getValue());
    this.setState({
      fileList: newFileList,
    });
    if (!this.getValue()) {
      this.setValue(this.tempValue);
    } else {
      // eslint-disable-next-line no-shadow
      this.fetchFileList(this.getValue(), (list: any) => {
        if (this.upload) {
          this.upload.updateFileList(list);
        }
      });
    }
    message.success($l('Upload', 'upload_success'));
  }

  /**
   *删除文件
   *
   * @param {*} file 文件
   * @memberof UploadModal
   */
  @Bind()
  removeFile(file) {
    const {
      removeCallback,
    } = this.props;
    const { tenantId, fileList } = this.state;
    this.setState({
      modalLoading: true,
    });
    if (file.url) {
      const fileUrl = file.url;

      return removeFile({
        tenantId,
        bucketName: this.bucketName,
        attachmentUUID: this.getValue(),
        urls: [fileUrl],
      }).then((res) => {
        if (getResponse(res)) {
          const newFileList = fileList.filter((list) => list.url !== file.url);
          if (this.record && this.name) {
            this.record.setState(`__${this.name}__`, newFileList);
          }
          if (newFileList.length === 0) this.validate(this.getValue());
          this.setState({
            modalLoading: false,
            fileList: newFileList,
          });
          if (removeCallback) {
            removeCallback();
          }
          notification.success({ duration: 2, placement: 'bottomRight', message: intl.get('hzero.common.notification.success') } as any);

          return true;
        }
        this.setState({
          modalLoading: false,
        });
        notification.error({ duration: 2, placement: 'bottomRight', message: intl.get('hzero.common.notification.error') } as any);

        return false;
      });
    }
    this.setState({
      modalLoading: false,
    });
  }

  @Bind()
  uploadData(file) {
    const {
      uploadData,
    } = this.props;
    const {
      bucketName,
      bucketDirectory,
      docType,
      storageCode, // 存储配置编码
    } = this;
    const data = uploadData ? uploadData(file) : {};
    const uuid = this.getValue() || this.tempValue;
    if (uuid !== undefined) {
      data.attachmentUUID = uuid;
    }
    if (bucketName !== undefined) {
      data.bucketName = bucketName;
    }
    if (docType !== undefined) {
      data.docType = docType;
    }
    if (storageCode !== undefined) {
      data.storageCode = storageCode;
    }
    if (bucketDirectory !== undefined) {
      data.directory = bucketDirectory;
    }
    return data;
  }

  beforeUpload = async (file) => {
    const remoteFileSize = await fetchRemoteFileSizeLimit(this.bucketName, this.bucketDirectory) || 0;
    const { fileType, fileSize = remoteFileSize } = this.props;
    if (fileType && fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.type', {
            fileType,
          })
          .d(`上传文件类型必须是：${fileType}`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (fileSize && file.size > fileSize) {
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
  };

  getRequestHeader = () => {
    // 添加额外的请求头
    const patchRequestHeaderConfig = getHzeroBootConfig('patchRequestHeader');
    let patchRequestHeader;
    if (patchRequestHeaderConfig) {
      if (typeof patchRequestHeaderConfig === 'function') {
        patchRequestHeader = patchRequestHeaderConfig();
      } else {
        patchRequestHeader = patchRequestHeaderConfig;
      }
    }
    return patchRequestHeader;
  };

}
