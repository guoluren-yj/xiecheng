import React, { ReactElement, ReactNode } from 'react';
import { action as mobxAction, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { Canceler } from 'axios';
import classNames from 'classnames';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';
import { getConfig, Uploader } from 'choerodon-ui/dataset';
import { AttachmentQuery, AttachmentLimitCfg, AttachmentValue } from 'choerodon-ui/dataset/configure';
import { UploaderProps } from 'choerodon-ui/dataset/uploader/Uploader';
import { AttachmentConfig } from 'choerodon-ui/lib/configure';
import { Size } from 'choerodon-ui/lib/_util/enum';
import Trigger from 'choerodon-ui/lib/trigger/Trigger';
import RcUpload from 'choerodon-ui/lib/rc-components/upload';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import Button, { ButtonProps } from '../button/Button';
import { $l } from '../locale-context';
import { ButtonColor, FuncType } from '../button/enum';
import AttachmentList from './AttachmentList';
import AttachmentGroup from './AttachmentGroup';
import { FormField, FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import Modal from '../modal';
import AttachmentFile, { FileLike } from '../data-set/AttachmentFile';
import { sortAttachments } from './utils';
import ObserverSelect from '../select/Select';
import BUILT_IN_PLACEMENTS from '../trigger-field/placements';
import attachmentStore from '../stores/AttachmentStore';
import { FieldType, RecordStatus } from '../data-set/enum';
import { ValidationMessages } from '../validator/Validator';
import ValidationResult from '../validator/ValidationResult';
import { open } from '../modal-container/ModalContainer';
import Icon from '../icon';
import Dragger from './Dragger';
import { ShowHelp } from '../field/enum';
import { FIELD_SUFFIX } from '../form/utils';
import { showValidationMessage } from '../field/utils';
import { ShowValidation } from '../form/enum';
import { getIf } from '../data-set/utils';
import { ATTACHMENT_TARGET } from './Item';
import AttachmentRemark from './AttachmentRemark';

export type AttachmentListType = 'text' | 'picture' | 'picture-card';

export interface AttachmentProps extends FormFieldProps, ButtonProps, UploaderProps {
  listType?: AttachmentListType;
  viewMode?: 'none' | 'list' | 'popup';
  sortable?: boolean;
  pictureWidth?: number;
  count?: number;
  max?: number;
  listLimit?: number;
  showHistory?: boolean;
  showSize?: boolean;
  showValidation?: ShowValidation;
  attachments?: (AttachmentFile | FileLike)[];
  onAttachmentsChange?: (attachments: AttachmentFile[]) => void;
  onRemove?: (attachment: AttachmentFile) => boolean | void;
  getUUID?: () => Promise<string> | string;
  downloadAll?: ButtonProps | boolean;
  previewTarget?: string;
  dragUpload?: boolean;
  dragBoxRender?: ReactNode[];
  template?: AttachmentValue;
  __inGroup?: boolean;
  fileReadOnly?: (file: AttachmentFile) => boolean;
  crossTenant?: boolean;
  afterUpload?: (attachments: (AttachmentFile | FileLike)[]) => void;
  afterDelete?: (attachments: AttachmentFile | FileLike) => void;
  attachmentLimit?: AttachmentConfig["attachmentLimit"];
  queryArgs?: AttachmentQuery;
  getImageContainer?: () => HTMLElement;
}

export type Sort = {
  type: 'time' | 'name';
  order: 'asc' | 'desc';
  custom?: boolean;
};

const defaultSort: Sort = {
  type: 'time',
  order: 'asc',
  custom: true,
};

@observer
export default class Attachment extends FormField<AttachmentProps> {
  static displayName = 'Attachment';

  static Dragger: typeof Dragger;

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'attachment',
    multiple: true,
    sortable: true,
    showSize: true,
    downloadAll: true,
    listType: 'text',
    viewMode: 'list',
    dragUpload: false,
  };

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  // eslint-disable-next-line camelcase
  static __PRO_ATTACHMENT = true;

  static Group = AttachmentGroup;

  @observable sort?: Sort;

  @observable popup?: boolean;

  @observable tplPopup?: boolean;

  @observable dragState?: string;

  @observable newDragState?: boolean;

  onUploadCancel?: Canceler;

  uploader?: Uploader;

  @observable tempAttachmentUUID?: string | undefined;

  get help() {
    return this.getProp('help');
  }

  get bucketName() {
    return this.getProp('bucketName');
  }

  get bucketDirectory() {
    return this.getProp('bucketDirectory');
  }

  get storageCode() {
    return this.getProp('storageCode');
  }

  get fileKey() {
    return this.getProp('fileKey') || this.getContextConfig('attachment').defaultFileKey;
  }

  get isPublic() {
    return this.getProp('isPublic');
  }

  get max() {
    return this.getProp('max');
  }

  get attachments(): AttachmentFile[] | undefined {
    const { field } = this;
    if (field) {
      return field.getAttachments(this.record, this.tempAttachmentUUID);
    }
    if (this.getValue()) {
      return this.observableProps.attachments;
    }
  }

  set attachments(attachments: AttachmentFile[] | undefined) {
    runInAction(() => {
      const { field } = this;
      if (field) {
        field.setAttachments(attachments, this.record, this.tempAttachmentUUID);
      } else {
        this.observableProps.attachments = attachments;
      }
      if (attachments) {
        const { onAttachmentsChange } = this.props;
        if (onAttachmentsChange) {
          onAttachmentsChange(attachments);
        }
      }
    });
  }

  get count(): number | undefined {
    const { attachments, field } = this;
    if (attachments) {
      return attachments.length;
    }
    if (field) {
      const attachmentCount = field.getAttachmentCount(this.record);
      if (attachmentCount !== undefined) {
        return attachmentCount;
      }
    }
    const { count } = this.observableProps;
    return count;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Attachment', label ? 'value_missing' : 'value_missing_no_label', { label }),
    };
  }

  get isAttachmentsInControl(): boolean | undefined {
    const { attachments, dataSet } = this.props;
    return attachments && isNull(dataSet);
  }

  private reaction?: IReactionDisposer;

  componentDidMount() {
    super.componentDidMount();
    this.fetchCount();
    this.reaction = reaction(() => {
      const { record, name } = this;
      if (record && name) {
        return {
          record,
          name,
          value: record.get(name),
        };
      }
    }, () => this.fetchCount(), {
      equals(a = {}, b = {}) {
        return a.record === b.record && a.name === b.name && a.value === b.value;
      },
    });
  }

  componentDidUpdate(prevProps: AttachmentProps) {
    const { value, viewMode } = this.props;
    if (prevProps.value !== value || prevProps.viewMode !== viewMode) {
      this.fetchCount();
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    const { reaction } = this;
    if (reaction) {
      reaction();
      delete this.reaction;
    }
  }

  getFieldType(): FieldType {
    return FieldType.attachment;
  }

  getObservableProps(props, context): any {
    const { count, attachments } = props;
    const { showValidation, observableProps = { count, attachments } } = this;
    return {
      ...super.getObservableProps(props, context),
      showValidation,
      count: count === undefined ? observableProps.count : count,
      attachments: attachments ? attachments.map(attachment => {
        if (attachment instanceof AttachmentFile) {
          return attachment;
        }
        return new AttachmentFile(attachment);
      }) : observableProps.attachments,
    };
  }

  getValidAttachments(): AttachmentFile[] | undefined {
    const { attachments } = this;
    if (attachments) {
      return attachments.filter(({ status }) => !status || ['success', 'done'].includes(status));
    }
  }

  getValidatorProp(key: string) {
    if (key === 'attachmentCount') {
      const attachments = this.getValidAttachments();
      const count = attachments ? attachments.length : this.count;
      return count || 0;
    }
    return super.getValidatorProp(key);
  }

  fetchCount() {
    const { field } = this;
    const { viewMode } = this.props;
    if (viewMode !== 'list' && isNil(this.count)) {
      const value = this.getValue();
      if (value) {
        const { isPublic, isAttachmentsInControl } = this;
        if (field) {
          field.fetchAttachmentCount(value, isPublic, this.record);
        } else {
          const { batchFetchCount } = this.getContextConfig('attachment');
          if (batchFetchCount && !this.attachments) {
            const { bucketName, bucketDirectory, storageCode } = this;
            attachmentStore.fetchCountInBatch({
              attachmentUUID: value,
              bucketName,
              bucketDirectory,
              storageCode,
              isPublic,
              isAttachmentsInControl,
            }).then(mobxAction((count) => {
              this.observableProps.count = count || 0;
            }));
          }
        }
      }
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'value',
      'accept',
      'action',
      'data',
      'previewData',
      'downloadData',
      'headers',
      'withCredentials',
      'sortable',
      'listType',
      'viewMode',
      'fileKey',
      'fileSize',
      'useChunk',
      'chunkSize',
      'chunkThreads',
      'bucketName',
      'bucketDirectory',
      'storageCode',
      'count',
      'max',
      'listLimit',
      'dragBoxRender',
      'dragUpload',
      'showHistory',
      'showSize',
      'isPublic',
      'downloadAll',
      'attachments',
      'onAttachmentsChange',
      'beforeUpload',
      'onUploadProgress',
      'onUploadSuccess',
      'onUploadError',
      'onRemove',
      'fileReadOnly',
      'afterUpload',
      'afterDelete',
    ]);
  }

  isAcceptFile(attachment: AttachmentFile, accept: string[]): boolean {
    const acceptTypes = accept.map(type => (
      new RegExp(type.replace(/\./g, '\\.').replace(/\*/g, '.*'))
    ));
    const { name, type } = attachment;
    return acceptTypes.some(acceptType => acceptType.test(name) || acceptType.test(type));
  }

  async getAttachmentUUID(): Promise<string> {
    this.autoCreate();
    const oldAttachmentUUID = this.tempAttachmentUUID || this.getValue();
    const attachmentUUID = oldAttachmentUUID || (await this.fetchAttachmentUUID());
    if (attachmentUUID !== oldAttachmentUUID) {
      runInAction(() => {
        this.tempAttachmentUUID = attachmentUUID;
        if (this.field) {
          this.field.tempAttachmentUUID = attachmentUUID;
        }
      });
    }
    return attachmentUUID;
  }

  fetchAttachmentUUID(): Promise<string> | string {
    const { getUUID = this.getContextConfig('attachment').getAttachmentUUID } = this.props;
    if (!getUUID) {
      throw new Error('no getAttachmentUUID hook in global configure.');
    }
    return getUUID({ isPublic: this.isPublic });
  }

  @mobxAction
  async uploadAttachments(attachments: AttachmentFile[]): Promise<void> {
    const { max, count } = this;
    if (max > 0 && (count || 0) + attachments.length > max) {
      Modal.error($l('Attachment', 'file_list_max_length', { count: max }));
      return;
    }
    const oldAttachments = this.attachments || [];
    if (this.multiple) {
      this.attachments = [...oldAttachments.slice(), ...attachments];
    } else {
      oldAttachments.forEach(attachment => this.doRemove(attachment));
      this.attachments = [...attachments];
    }
    try {
      const { afterUpload } = this.props;
      const result = await Promise.all(attachments.map((attachment) => this.upload(attachment)));
      if (afterUpload) {
        afterUpload(result.filter(file => file && file.fileUrl));
      }
    } finally {
      this.changeOrder();
    }
  }

  @autobind
  async uploadAttachment(attachment: AttachmentFile) {
    await this.upload(attachment);
    if (attachment.status === 'success') {
      this.changeOrder();
    }
  }

  getUploaderProps(): UploaderProps {
    const { bucketName, bucketDirectory, storageCode, isPublic, fileKey } = this;
    const fileSize = this.getProp('fileSize');
    const chunkSize = this.getProp('chunkSize');
    const chunkThreads = this.getProp('chunkThreads');
    const useChunk = this.getProp('useChunk');
    const saveUploadCancel = this.saveUploadCancel;
    const {
      accept, action, data, previewData, downloadData, headers, withCredentials,
      beforeUpload, onUploadProgress, onUploadSuccess, onUploadError,
    } = this.props;
    return {
      accept, action, data, previewData, downloadData, headers, fileKey, withCredentials, bucketName, bucketDirectory, storageCode, isPublic,
      fileSize, chunkSize, chunkThreads, useChunk, beforeUpload, onUploadProgress, onUploadSuccess, onUploadError, saveUploadCancel,
    };
  }

  async upload(attachment: AttachmentFile) {
    try {
      const uploader = getIf(this, 'uploader', () => {
        return new Uploader(
          {},
          {
            getConfig: this.getContextConfig as typeof getConfig,
          },
        );
      });
      uploader.setProps(this.getUploaderProps());
      if (this.record && this.record.status === RecordStatus.sync) {
        this.record.status = RecordStatus.update;
      }
      const result = await uploader.upload(attachment, this.attachments || [attachment], this.tempAttachmentUUID);
      if (this.record) {
        this.record.clearValidationError(this.name);
      }
      if (result === false) {
        this.removeAttachment(attachment);
      } else {
        runInAction(() => {
          const { tempAttachmentUUID } = this;
          if (tempAttachmentUUID) {
            this.setValue(tempAttachmentUUID);
          }
          if (attachment.status === 'success') {
            if (tempAttachmentUUID) {
              this.tempAttachmentUUID = undefined;
              if (this.field) {
                this.field.tempAttachmentUUID = undefined;
              }
            }
          } else {
            this.checkValidity();
          }
        });
      }
      return result;
    } catch (e) {
      this.removeAttachment(attachment);
      throw e;
    }
  }

  getOtherProps(): any {
    const otherProps = super.getOtherProps();
    otherProps.onClick = this.handleClick;
    return otherProps;
  }

  processFiles(files: File[], attachmentUUID: string): AttachmentFile[] {
    return files.map((file, index: number) => new AttachmentFile({
      uid: this.getUid(index),
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      originFileObj: file,
      creationDate: new Date(),
      attachmentUUID,
    }));
  }

  @autobind
  @mobxAction
  handleChange(e) {
    const { target } = e;
    if (target.value) {
      const files: File[] = [...target.files];
      target.value = '';
      this.getAttachmentUUID().then((uuid) => {
        this.uploadAttachments(this.processFiles(files, uuid));
      });
    }
  }

  doRemove(attachment: AttachmentFile): Promise<any> | undefined {
    const { onRemove: onAttachmentRemove = noop } = this.props;
    return Promise.resolve(onAttachmentRemove(attachment)).then(mobxAction(ret => {
      if (ret !== false) {
        const { onRemove } = this.getContextConfig('attachment');
        if (onRemove) {
          const isUploading = attachment.status === 'uploading';
          if (this.record && this.record.status === RecordStatus.sync) {
            this.record.status = RecordStatus.update;
          }
          if (isUploading) {
            attachment.status = 'deleting';
          }
          if (isUploading || attachment.status === 'error' || attachment.invalid) {
            return this.removeAttachment(attachment);
          }
          const attachmentUUID = this.getValue();
          if (attachmentUUID) {
            const { bucketName, bucketDirectory, storageCode, isPublic, isAttachmentsInControl } = this;
            attachment.status = 'deleting';
            return onRemove({
              attachment,
              attachmentUUID,
              bucketName,
              bucketDirectory,
              storageCode,
              isPublic,
              isAttachmentsInControl,
              crossTenant: this.getProp("crossTenant"),
            })
              .then(mobxAction((result) => {
                if (result !== false) {
                  const { afterDelete } = this.props;
                  if (afterDelete) {
                    afterDelete(attachment);
                  }
                  this.removeAttachment(attachment);
                }
                attachment.status = 'done';
              }))
              .catch(mobxAction(() => {
                attachment.status = 'done';
              }));
          }
        }
      }
    }));
  }

  @autobind
  handleHistory(attachment: AttachmentFile, attachmentUUID: string) {
    const { renderHistory } = this.getContextConfig('attachment') as AttachmentConfig;
    if (renderHistory) {
      const { bucketName, bucketDirectory, storageCode } = this;
      open({
        key: 'attachment-history-modal-drawer',
        title: $l('Attachment', 'operation_records'),
        children: renderHistory({
          attachment,
          attachmentUUID,
          bucketName,
          bucketDirectory,
          storageCode,
        }),
        cancelButton: false,
        okText: $l('Modal', 'close'),
        drawer: true,
      });
    }
  }

  @autobind
  @mobxAction
  saveUploadCancel(onCancel: Canceler) {
    this.onUploadCancel = onCancel;
  }

  @autobind
  handleRemove(attachment: AttachmentFile): Promise<any> | undefined {
    if (attachment.status === 'uploading' && this.onUploadCancel) {
      this.onUploadCancel();
    }
    return this.doRemove(attachment);
  }

  @autobind
  @mobxAction
  handleAttachmentsChange(attachments: AttachmentFile[] | undefined) {
    this.observableProps.attachments = attachments;
  }

  @autobind
  handleFetchAttachment(fetchProps: { bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string; isPublic?: boolean; isAttachmentsInControl?: boolean }) {
    const { field } = this;
    const { query, body } = this.props.queryArgs || {};
    if (field) {
      field.fetchAttachments({ ...fetchProps, query, body }, this.record);
    } else {
      const { fetchList } = this.getContextConfig('attachment');
      if (fetchList) {
        fetchList({ ...fetchProps, query, body }).then((results) => {
          this.attachments = results.map(file => new AttachmentFile(file));
        });
      }
    }
  }

  @autobind
  handlePreview() {
    this.setPopup(false);
  }

  @mobxAction
  removeAttachment(attachment: AttachmentFile): undefined {
    const { attachments } = this;
    if (attachments) {
      const index = attachments.indexOf(attachment);
      if (index !== -1) {
        attachments.splice(index, 1);
        this.attachments = attachments;
        if (attachment.status !== 'uploading') {
          this.checkValidity();
        }
      }
    }
    return undefined;
  }

  handleDragUpload = (file: File, files: File[]) => {
    if (files.indexOf(file) === files.length - 1) {
      this.getAttachmentUUID().then((uuid) => {
        this.uploadAttachments(this.processFiles(files, uuid));
      });
    }
  }

  @autobind
  handleClick(e) {
    const { element } = this;
    if (element) {
      element.click();
    }
    const { onClick } = this.props;
    if (onClick) {
      onClick(e);
    }
  }

  getUid(index: number): string {
    const { prefixCls } = this;
    return `${prefixCls}-${Date.now()}-${index}`;
  }

  renderHeaderLabel() {
    const { viewMode } = this.props;
    if (this.hasFloatLabel || viewMode === 'popup') {
      const label = this.getLabel();
      if (label) {
        const { prefixCls } = this;
        return (
          <span className={classNames(`${prefixCls}-header-label`, { [`${prefixCls}-required`]: this.getProp('required') })}>
            {label}
          </span>
        );
      }
    }
  }

  isDisabled(): boolean {
    if (super.isDisabled()) {
      return true;
    }
    const { max } = this;
    if (max) {
      const { count = 0 } = this;
      return count >= max;
    }
    return false;
  }

  isValid(): boolean {
    const { attachments } = this;
    if (attachments && attachments.some(({ status, invalid }) => invalid || status === 'error')) {
      return false;
    }
    return super.isValid();
  }

  @autobind
  renderAttachmentRemark(withPopupWrapper?: boolean): ReactElement<ButtonProps> | undefined {
    const { previewTarget = ATTACHMENT_TARGET, color } = this.props;

    const remarkNode = (
      <AttachmentRemark
        prefixCls={this.prefixCls}
        tplProps={this.getProp('template')}
        help={this.renderHelp()}
        target={previewTarget}
        color={color}
        readOnly={this.readOnly}
      />
    );
    if (withPopupWrapper) {
      return (
        <div className={`${this.prefixCls}-popup-inner`} ref={this.wrapperReference}>
          {remarkNode}
        </div>
      );
    }
    return remarkNode;
  }

  renderUploadBtn(isCardButton: boolean, label?: ReactNode): ReactElement<ButtonProps> {
    const {
      count = 0,
      multiple,
      prefixCls,
      props: {
        children, viewMode, accept, _inTable,
      },
      max,
    } = this;
    const buttonProps = this.getOtherProps();
    const buttonWrapperProps = this.getWrapperProps();
    const { ref, style, name, onChange, ...rest } = buttonProps;
    const { style: wrapperStyle } = buttonWrapperProps;
    const uploadProps = {
      multiple,
      accept: accept ? accept.join(',') : undefined,
      name: name || this.fileKey,
      type: 'file',
      ref,
      onChange,
    };
    const width = isCardButton ? this.getPictureWidth() : undefined;
    const countText = multiple && (max ? `${count}/${max}` : count) || undefined;
    const input = (<input key="upload" {...uploadProps} style={{ width: 0, fontSize: 0, overflow: 'hidden' }} />);
    const isFloatLabel = this.hasFloatLabel && viewMode === 'popup';
    return (
      <div
        className={classNames(`${prefixCls}-drag-wrapper`, {
          [`${prefixCls}-drag-over`]: this.newDragState,
        })}
        onDragOver={this.draggerOver}
        onDragLeave={this.draggerLeave}
        onDrop={this.draggerDrop}
      >
        {
          isCardButton ? (
            <Button
              funcType={FuncType.link}
              key="upload-btn"
              icon="add"
              {...rest}
              className={classNames(`${prefixCls}-card-button`, this.getClassName())}
              style={{ ...style, width, height: width }}
            >
              <div>{children || $l('Attachment', 'upload_picture')}</div>
              {countText ? <div>{countText}</div> : undefined}
              {input}
            </Button>
          ) : (
            <Button
              funcType={viewMode === 'popup' ? FuncType.flat : FuncType.link}
              key="upload-btn"
              icon="file_upload"
              color={this.valid ? ButtonColor.primary : ButtonColor.red}
              {...rest}
              className={viewMode === 'popup' ? this.getMergedClassNames() : this.getClassName()}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
              style={wrapperStyle}
            >
              {children || $l('Attachment', 'upload_attachment')}{label && <>({label})</>} {countText}
              {input}
            </Button>
          )
        }
        {isCardButton ? (
          <div className={`${prefixCls}-drag-card`} style={{ ...style, width, height: width }}>
            {$l('Attachment', 'drag_here')}
          </div>
        ) : (
          <div
            className={classNames(`${prefixCls}-drag-text`, {
              [`${prefixCls}-drag-text-incell`]: _inTable,
              [`${prefixCls}-drag-float-label`]: isFloatLabel,
            })}
          >
            <div className={`${prefixCls}-drag-hidden-text`} >
              <Icon type="file_upload" />
              {children || $l('Attachment', 'upload_attachment')}{label && <>({label})</>} {countText}
            </div>
            <div className={`${prefixCls}-drag-show-text`}>{$l('Attachment', 'drag_here')}</div>
          </div>
        )}
      </div>
    );
  }

  @autobind
  draggerOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDisabled()) return;
    if (event.dataTransfer && event.dataTransfer.types && event.dataTransfer.types.indexOf("Files") > -1) {
      runInAction(() => {
        this.newDragState = true;
      })
    }
  }

  @autobind
  draggerLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDisabled()) return;
    let target = event.target;
    while (target) {
      if (target.classList && target.classList.contains(`${this.prefixCls}-drag-over`)) {
        break;
      }
      target = target.parentNode;
    }
    if (target === event.target || !target) {
      runInAction(() => {
        this.newDragState = false;
      })
    }
  }

  @autobind
  draggerDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDisabled()) return;
    if (event.target && event.target.classList && event.target.classList.contains(`${this.prefixCls}-drag-over`)) {
      const files: File[] = [];

      if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
        Array.prototype.forEach.call(event.dataTransfer.files, file => files.push(file));
      }
      if (files && files.length) {
        this.getAttachmentUUID().then((uuid) => {
          this.uploadAttachments(this.processFiles(files, uuid));
        });
      }
      runInAction(() => {
        this.newDragState = false;
      })
    }
  }

  showTooltip(e): boolean {
    if (this.showValidation === ShowValidation.tooltip) {
      const message = this.getTooltipValidationMessage();
      if (message) {
        showValidationMessage(e, message, this.context.getTooltipTheme('validation'), this.context.getTooltipPlacement('validation'), this.getContextConfig);
        return true;
      }
    }
    return false;
  }

  renderViewButton(label?: ReactNode): ReactElement<ButtonProps> {
    const { children, multiple, viewMode } = this.props;
    const rest = this.getOtherProps();
    if (!this.count) {
      return <Button icon="attach_file" funcType={FuncType.link} key='view' {...omit(rest, ['ref', 'onClick'])} className={this.getMergedClassNames()}>{$l('Attachment', 'no_attachments')} </Button>;
    }
    return (
      <Button
        funcType={viewMode === 'popup' ? FuncType.flat : FuncType.link}
        key="view-btn"
        icon="attach_file"
        color={ButtonColor.primary}
        {...omit(rest, ['ref'])}
        className={this.getMergedClassNames()}
      >
        {children || $l('Attachment', 'view_attachment')}{label && <>({label})</>} {multiple && this.count || undefined}
      </Button>
    );
  }

  @mobxAction
  handleSort(sort: Sort) {
    this.sort = sort;
    this.attachments = sortAttachments(this.attachments, this.sort || defaultSort);
    if (!this.readOnly) {
      this.changeOrder();
    }
  }

  @autobind
  @mobxAction
  handleOrderChange(props) {
    const { attachments } = props;
    this.attachments = attachments;
    this.changeOrder();
  }

  @mobxAction
  changeOrder() {
    this.sort = {
      ...defaultSort,
      ...this.sort,
      custom: true,
    };
    const { sortable } = this.props;
    if (sortable) {
      const { onOrderChange } = this.getContextConfig('attachment');
      if (onOrderChange) {
        const attachmentUUID = this.getValue();
        if (attachmentUUID) {
          const attachments = this.getValidAttachments();
          if (attachments && attachments.length) {
            const { bucketName, bucketDirectory, storageCode, isPublic, isAttachmentsInControl } = this;
            onOrderChange({
              bucketName,
              bucketDirectory,
              storageCode,
              attachments,
              attachmentUUID,
              isPublic,
              isAttachmentsInControl,
            });
          }
        }
      }
    }
  }

  @autobind
  getSortSelectPopupContainer() {
    return this.wrapper;
  }

  renderSorter(): ReactNode {
    const { sortable, viewMode } = this.props;
    if (sortable) {
      const { prefixCls, attachments } = this;
      if (attachments && attachments.length > 1) {
        const { type, order } = this.sort || defaultSort;
        return (
          <>
            <ObserverSelect
              value={type}
              onChange={(newType) => this.handleSort({ type: newType, order, custom: false })}
              clearButton={false}
              isFlat
              popupPlacement="bottomRight"
              getPopupContainer={viewMode === 'popup' ? this.getSortSelectPopupContainer : undefined}
              size={Size.small}
              border={false}
            >
              <ObserverSelect.Option value="time">{$l('Attachment', 'by_upload_time')}</ObserverSelect.Option>
              <ObserverSelect.Option value="name">{$l('Attachment', 'by_name')}</ObserverSelect.Option>
            </ObserverSelect>
            <Button
              funcType={FuncType.link}
              className={classNames(`${prefixCls}-order-icon`, order)}
              onClick={() => this.handleSort({ type, order: order === 'asc' ? 'desc' : 'asc', custom: false })}
            />
          </>
        );
      }
    }
  }

  renderUploadList(uploadButton?: ReactNode) {
    const {
      listType, sortable, listLimit, showHistory, showSize, previewTarget,
      fileReadOnly, getImageContainer, previewData, downloadData,
    } = this.props;
    const { imageContainer: globalImageContainer } = this.getContextConfig('attachment');
    const imageContainer = getImageContainer || globalImageContainer;
    const { attachments, tempAttachmentUUID, isAttachmentsInControl } = this;
    const attachmentUUID = tempAttachmentUUID || this.getValue();
    if (attachmentUUID || uploadButton || (attachments && attachments.length)) {
      const { bucketName, bucketDirectory, storageCode, readOnly, isPublic } = this;
      const width = this.getPictureWidth();
      return (
        <AttachmentList
          prefixCls={`${this.prefixCls}-list`}
          pictureWidth={width}
          listType={listType}
          attachments={sortAttachments(attachments, this.sort || defaultSort)}
          disabled={super.isDisabled()}
          bucketName={bucketName}
          bucketDirectory={bucketDirectory}
          storageCode={storageCode}
          attachmentUUID={attachmentUUID}
          tempAttachmentUUID={tempAttachmentUUID}
          uploadButton={uploadButton}
          sortable={sortable}
          showSize={showSize}
          readOnly={readOnly}
          isPublic={isPublic}
          limit={readOnly ? listLimit : undefined}
          previewTarget={previewTarget}
          onHistory={showHistory ? this.handleHistory : undefined}
          onRemove={this.handleRemove}
          onUpload={this.uploadAttachment}
          onOrderChange={this.handleOrderChange}
          onFetchAttachments={this.handleFetchAttachment}
          onAttachmentsChange={this.handleAttachmentsChange}
          onPreview={this.handlePreview}
          fileReadOnly={fileReadOnly}
          record={this.record}
          hasAttachmentsProps={isAttachmentsInControl}
          attachmentLimit={this.props.attachmentLimit}
          imageContainer={imageContainer}
          previewData={previewData}
          downloadData={downloadData}
        />
      );
    }
  }

  renderHeader(uploadBtn?: ReactNode) {
    const { prefixCls, count, isAttachmentsInControl, props: { downloadAll, viewMode, __inGroup } } = this;
    const label = (!__inGroup || count) && this.renderHeaderLabel();
    const buttons: ReactNode[] = [];
    if (uploadBtn) {
      buttons.push(
        <Trigger
          prefixCls={prefixCls}
          popupContent={() => this.renderAttachmentRemark(true)}
          action={[Action.hover, Action.focus]}
          builtinPlacements={BUILT_IN_PLACEMENTS}
          popupPlacement="bottomLeft"
          popupHidden={!this.tplPopup || this.newDragState || false}
          onPopupHiddenChange={this.handleTplPopupHiddenChange}
        >
          {uploadBtn}
        </Trigger>,
      );
    }
    if (this.readOnly) {
      if (this.count) {
        if (downloadAll) {
          const { bucketName, bucketDirectory, storageCode, isPublic } = this;
          const { getDownloadAllUrl, attachmentLimit: globalAttachmentLimit } = this.getContextConfig('attachment');
          const attachmentLimit = this.props.attachmentLimit || globalAttachmentLimit;
          const defaultLimitConfig: AttachmentLimitCfg = { preview: true, download: true, remove: true };
          let allowDownloadAll = true;
          if (attachmentLimit && this.attachments && this.attachments.length) {
            allowDownloadAll = !this.attachments.some(attachment => {
              const newLimitConfig = { ...defaultLimitConfig, ...(attachmentLimit({ attachment, isPublic, isAttachmentsInControl }) || {}) };
              return !newLimitConfig.download;
            });
          }
          if (getDownloadAllUrl && allowDownloadAll) {
            const attachmentUUID = this.getValue();
            if (attachmentUUID) {
              const downloadAllUrl = getDownloadAllUrl({
                bucketName,
                bucketDirectory,
                storageCode,
                attachmentUUID,
                isPublic,
                isAttachmentsInControl,
              });
              if (downloadAllUrl) {
                const downProps: ButtonProps = {
                  key: 'download',
                  icon: 'get_app',
                  funcType: FuncType.link,
                  href: isString(downloadAllUrl) ? downloadAllUrl : undefined,
                  onClick: isFunction(downloadAllUrl) ? downloadAllUrl : undefined,
                  target: '_blank',
                  color: ButtonColor.primary,
                  children: $l('Attachment', 'download_all'),
                };
                buttons.push(<Button {...downProps} {...downloadAll} />);
              }
            }
          }
        }
      } else if (viewMode !== 'popup' && !__inGroup) {
        const viewProps: ButtonProps = {
          key: 'view',
          funcType: FuncType.link,
          disabled: true,
          children: $l('Attachment', 'no_attachments'),
        };
        buttons.push(
          <Button {...viewProps} />,
        );
      }
    }
    const hasButton = buttons.length;
    const sorter = this.renderSorter();
    const divider = !__inGroup && label && hasButton ? <span key="divider" className={`${prefixCls}-header-divider`} /> : undefined;
    if (label || divider || hasButton || sorter) {
      return (
        <div className={`${prefixCls}-header`}>
          {label}
          {divider}
          <div className={`${prefixCls}-header-buttons`}>
            {buttons}
          </div>
          {sorter}
        </div>
      );
    }
  }

  @autobind
  renderWrapper(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-popup-inner`} ref={this.wrapperReference}>
        {this.renderWrapperList()}
        {this.renderAttachmentRemark()}
      </div>
    );
  }

  @autobind
  getTooltipValidationMessage(): ReactNode {
    const validationMessage = this.renderValidationResult();
    if (!this.isValidationMessageHidden(validationMessage)) {
      return validationMessage;
    }
  }

  renderValidationResult(validationResult?: ValidationResult): ReactNode {
    const message = super.renderValidationResult(validationResult);
    if (message) {
      return (
        <div className={`${this.prefixCls}-validation-message`}>
          {message}
        </div>
      );
    }
  }

  renderEmpty() {
    const { viewMode } = this.props;
    if (viewMode === 'popup' && !this.count) {
      return (
        <div className={`${this.prefixCls}-empty`}>
          {this.getContextConfig('renderEmpty')('Attachment')}
        </div>
      );
    }
  }

  getWrapperClassNames() {
    const {
      prefixCls,
      props: { className, size },
    } = this;
    return classNames(
      `${prefixCls}-wrapper`,
      className,
      {
        [`${prefixCls}-sm`]: size === Size.small,
        [`${prefixCls}-lg`]: size === Size.large,
      },
    );
  }

  renderWrapperList(uploadBtn?: ReactNode) {
    const { prefixCls, props: { viewMode, listType, __inGroup } } = this;
    const isCard = listType === 'picture-card';
    const classes = [`${prefixCls}-list-wrapper`];
    if (viewMode !== 'popup') {
      const wrapperClassName = this.getWrapperClassNames();
      if (wrapperClassName) {
        classes.push(wrapperClassName);
      }
    }
    return (
      <div className={classes.join(' ')}>
        {this.renderDragUploadArea()}
        {this.renderHeader(!isCard && uploadBtn)}
        {!__inGroup && this.showValidation === ShowValidation.newLine && this.renderValidationResult()}
        {!__inGroup && this.renderEmpty()}
        {viewMode !== 'none' && this.renderUploadList(isCard && uploadBtn)}
      </div>
    );
  }

  getPictureWidth() {
    const { pictureWidth, listType } = this.props;
    return pictureWidth || (listType === 'picture-card' ? 100 : 48);
  }

  renderHelp(): ReactNode {
    const { showHelp } = this.props;
    const help = this.getProp('help');
    if (help === undefined || showHelp === ShowHelp.none) return;
    return (
      <div key="help" className={`${this.getContextProPrefixCls(FIELD_SUFFIX)}-help`}>
        {help}
      </div>
    );
  }

  get showValidation() {
    const { viewMode, showValidation = viewMode === 'popup' ? ShowValidation.tooltip : ShowValidation.newLine } = this.props;
    const { context: { showValidation: ctxShowValidation = showValidation } } = this;
    return ctxShowValidation;
  }

  @autobind
  handlePopupHiddenChange(hidden) {
    if ((this.readOnly && !this.count)) {
      this.setPopup(false);
      return;
    }
    this.setPopup(!hidden);
  }

  @autobind
  handleTplPopupHiddenChange(hidden) {
    this.setTplPopup(!hidden);
  }

  @mobxAction
  setPopup(popup) {
    this.popup = popup;
  }

  @mobxAction
  setTplPopup(popup) {
    this.tplPopup = popup;
  }


  @mobxAction
  setDragState(state) {
    this.dragState = state;
  }

  @autobind
  handleFileDrop(e) {
    this.setDragState(e.type);
  }

  renderDefaultDragBox() {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-drag-box`}>
        <p className={`${prefixCls}-drag-box-icon`}>
          <Icon type="inbox" />
        </p>
        <p className={`${prefixCls}-drag-box-text`}>{$l('Attachment', 'file_type_mismatch')}</p>
        <p className={`${prefixCls}-drag-box-hint`}>
          {this.getProp('help')}
        </p>
      </div>
    );
  }

  renderDragUploadArea() {
    const { dragUpload, dragBoxRender, accept } = this.props;
    const { prefixCls } = this;
    if (dragUpload) {
      const dragCls = classNames(prefixCls, {
        [`${prefixCls}-drag`]: true,
        [`${prefixCls}-drag-hover`]: this.dragState === 'dragover',
      });
      const rcUploadProps = {
        ...this.props,
        accept: accept ? accept.join(',') : undefined,
        beforeUpload: this.handleDragUpload,
        prefixCls,
      };
      return (
        <div
          className={dragCls}
          onDrop={this.handleFileDrop}
          onDragOver={this.handleFileDrop}
          onDragLeave={this.handleFileDrop}
        >
          <RcUpload {...rcUploadProps} className={`${prefixCls}-btn`}>
            {dragBoxRender || this.renderDefaultDragBox()}
          </RcUpload>
        </div>
      );
    }
    return undefined;
  }

  render() {
    const { viewMode, listType, hidden, _inTable } = this.props;
    const { readOnly, prefixCls } = this;
    if (viewMode === 'popup') {
      const label = this.hasFloatLabel && this.getLabel();
      return (
        <>
          <Trigger
            prefixCls={prefixCls}
            popupContent={this.renderWrapper}
            action={[Action.hover, Action.focus]}
            builtinPlacements={BUILT_IN_PLACEMENTS}
            popupPlacement="bottomLeft"
            popupHidden={hidden || !this.popup || this.newDragState || false}
            onPopupHiddenChange={this.handlePopupHiddenChange}
          >
            {this.renderDragUploadArea()}
            {readOnly ? this.renderViewButton(label) : this.renderUploadBtn(false, label)}
          </Trigger>
          {this.showValidation === ShowValidation.newLine && _inTable !== true && this.renderValidationResult()}
        </>
      );
    }
    return this.renderWrapperList(readOnly ? undefined : this.renderUploadBtn(listType === 'picture-card'));
  }
}
