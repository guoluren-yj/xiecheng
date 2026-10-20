import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { IReactionDisposer } from 'mobx';
import { action as mobxAction, observable, reaction, runInAction, get, set, action, isArrayLike } from 'mobx';
import { observer } from 'mobx-react';
import type { Canceler } from 'axios';
import classNames from 'classnames';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import type { Field, getConfig } from 'choerodon-ui/dataset';
import { ValidationResult } from 'choerodon-ui/dataset';
import type { AttachmentOption } from 'choerodon-ui/dataset/configure';
import type { UploaderProps } from 'choerodon-ui/dataset/uploader/Uploader';
import { Size } from 'choerodon-ui/lib/_util/enum';
// @ts-ignore
import { Trigger, Button, Modal, Icon, Tooltip, Select as ObserverSelect } from 'choerodon-ui/pro';
import RcUpload from 'choerodon-ui/lib/rc-components/upload';
import { $l as _$l } from 'choerodon-ui/pro/lib/locale-context';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import type { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { FormFieldProps } from 'choerodon-ui/pro/lib/field/FormField';
import { FormField } from 'choerodon-ui/pro/lib/field/FormField';
import autobind from 'choerodon-ui/pro/lib/_util/autobind';
import type { FileLike } from 'choerodon-ui/pro/lib/data-set/AttachmentFile';
import AttachmentFile from 'choerodon-ui/dataset/data-set/AttachmentFile';
import { FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import type { ValidationMessages } from 'choerodon-ui/pro/lib/validator/Validator';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { FIELD_SUFFIX } from 'choerodon-ui/pro/lib/form/utils';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { getIf } from 'choerodon-ui/pro/lib/data-set/utils';
import Uploader from './Uploader';
import type Dragger from './Dragger';
import AttachmentGroup from './AttachmentGroup';
import AttachmentList from './AttachmentList';
import { ATTACHMENT_TARGET } from './Item';
import AttachmentRemark from './AttachmentRemark';
import attachmentConfig from "./attachmentConfig";
import { BUILT_IN_PLACEMENTS, showValidationMessage } from './utils';
import 'choerodon-ui/pro/lib/attachment/style';
import type { AttachmentLimitCfg } from './interface';

const FIELD_CACHE_UID = "url-attachment-uid";
const $l: any = _$l;
export type AttachmentListType = 'text' | 'picture' | 'picture-card';

export interface UrlAttachmentProps extends FormFieldProps, ButtonProps, UploaderProps {
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
  template?: AttachmentOption & { attachmentUrl: string };
  __inGroup?: boolean;
  fileReadOnly?: (file: AttachmentFile) => boolean;
  crossTenant?: boolean;
  attachmentLimit?: (options: {attachment: AttachmentFile, isPublic?: boolean}) => AttachmentLimitCfg;
  queryArgs?: { query?: any, body?: any };
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
export default class UrlAttachment extends FormField<UrlAttachmentProps> {
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

  @observable tempAttachmentUrls?: string[] | undefined;

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

  get attachments(): AttachmentFile[] {
    const { field, record } = this;
    if (record && field) {
      const key = `${this.name}@${field.get(FIELD_CACHE_UID)}#${field.get("bucketName") || "default"}#${field.get("bucketDirectory") || "default"}`;
      const { attachmentCaches } = record;
      if (attachmentCaches) {
        const cache = attachmentCaches.get(key);
        if (cache) {
          return get(cache, 'attachments');
        }
      }
    } else if (field) {
      return field.get('attachments') || [];
    }
    return this.observableProps.attachments || [];
  }

  set attachments(attachments: AttachmentFile[]) {
    runInAction(() => {
      const { field, record } = this;
      if (field && record) {
        const key = `${this.name}@${field.get(FIELD_CACHE_UID)}#${field.get("bucketName") || "default"}#${field.get("bucketDirectory") || "default"}`;
        const attachmentCaches = getIf(record, 'attachmentCaches', () => observable.map());
        const cache = attachmentCaches.get(key);
        if (cache) {
          set(cache, 'attachments', attachments);
        } else {
          attachmentCaches.set(key, { attachments });
        }
      } else if (field) {
        field.set('attachments', attachments);
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
    if (this.attachments && this.attachments.length) return this.attachments.length;
    const value = this.getValue();
    if (isArrayLike(value)) return value.length;
    else if (value) return 1;
    else return 0;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Attachment', label ? 'value_missing' : 'value_missing_no_label', { label }),
    };
  }

  private reaction?: IReactionDisposer[];

  componentDidMount() {
    super.componentDidMount();
    this.updateCount();
    this.reaction = [
      reaction(() => {
        const { record, name } = this;
        if (record && name) {
          return {
            record,
            name,
            value: record.get(name),
          };
        }
      }, () => this.updateCount(), {
        equals(a = {}, b = {}) {
          return a.record === b.record && a.name === b.name && a.value === b.value;
        },
      }),
      reaction(() => {
        const { dataSet, name } = this;
        if (dataSet && name) {
          return {
            field: dataSet.getField(name),
          };
        }
      }, (opts: { field?: Field } = {}) => {
        const { field } = opts;
        if (field && !field.get("__url_attachment_validator_mark__")) {
          field.dataSet.addField(this.name || "__no_field_name__", {
            ...field.pristineProps,
            // @ts-ignore
            attachmentValidHook: () => {
              const uploadErrorFiles = this.attachments.filter(({ status }) => status === 'uploading');
              if (uploadErrorFiles.length) {
                return new ValidationResult({
                  validationProps: field && this.record ? {
                    dataSet: field.dataSet,
                    record: this.record,
                    name: this.name,
                  } : this.getValidatorProps(),
                  // @ts-ignore
                  validationMessage: $l('Validator', 'uploading'),
                  injectionOptions: uploadErrorFiles,
                  value: this.attachments,
                  // @ts-ignore
                  ruleName: "attachmentError",
                });
              }
              return true;
            },
          });
          field.set("__url_attachment_validator_mark__", true);
        }
      }, {
        equals(a = {}, b = {}) {
          return a.field === b.field;
        },
        fireImmediately: true,
      }),
    ];
    /**
     * 组件挂载时，向field写入UID缓存，以代替UUID实现其它逻辑
     */
    const { field } = this;
    if (field && !field.get(FIELD_CACHE_UID)) {
      field.set(FIELD_CACHE_UID, new Date().valueOf());
    }
  }

  componentDidUpdate(prevProps: UrlAttachmentProps) {
    const { value, viewMode } = this.props;
    if (prevProps.value !== value || prevProps.viewMode !== viewMode) {
      this.updateCount();
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    const { reaction } = this;
    if (reaction && reaction.length) {
      reaction.forEach(r => r());
      delete this.reaction;
    }
  }

  getFieldType(): FieldType {
    return FieldType.string;
  }

  getObservableProps(props, context): any {
    const { count, attachments } = props;
    const { observableProps = { count, attachments } } = this;
    return {
      ...super.getObservableProps(props, context),
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

  updateCount() {
    const { viewMode } = this.props;
    if (viewMode !== 'list' && isNil(this.count)) {
      const value = this.getValue();
      if (typeof value === "string") this.observableProps.count = 1;
      else if (value && value.length) this.observableProps.count = value.length;
      else this.observableProps.count = 0;
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'value',
      'accept',
      'action',
      'data',
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
    ]);
  }

  isAcceptFile(attachment: AttachmentFile, accept: string[]): boolean {
    const acceptTypes = accept.map(type => (
      new RegExp(type.replace(/\./g, '\\.').replace(/\*/g, '.*'))
    ));
    const { name, type } = attachment;
    return acceptTypes.some(acceptType => acceptType.test(name) || acceptType.test(type));
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
    await Promise.all(attachments.map((attachment) => this.upload(attachment)));
  }

  @autobind
  async uploadAttachment(attachment: AttachmentFile) {
    await this.upload(attachment);
  }

  /**
   * 根据attachments刷新有效url
   */
  @autobind
  @action
  syncAttachmentUrl() {
    const { field, name, dataIndex, dataSet, record } = this;
    if (!record && field && name) dataSet!.create({}, dataIndex);
    let value: string | string[] | undefined = this.getValue();
    const validUrlsSet = new Set<string>();
    this.attachments.forEach(attachment => validUrlsSet.add(attachment.url!));
    const multiple = this.getProp('multiple');
    if (multiple) {
      value = !value ? [] : (isArrayLike(value) && value || [value]);
      value = value.filter(url => validUrlsSet.has(url));
    } else if (!validUrlsSet.has(value as string)) {
      value = undefined;
    }
    this.setValue(value);
  }

  /**
   * 更新dataset中url附件的value
   * @param resp 新上传文件的桶地址
   */
  @autobind
  @action
  addAttachmentUrl(resp: string) {
    const { field, name, dataIndex, dataSet, record } = this;
    if (!resp) return;
    if (!record && field && name) dataSet!.create({}, dataIndex);
    let value: string | string[] | undefined = this.getValue();
    const multiple = this.getProp('multiple');
    if (multiple) {
      const max = this.getProp("max");
      value = !value ? [] : (isArrayLike(value) && value || [value]);
      // 插入新上传url
      value.splice(0, value.length - Math.min(value.length, max || Infinity), resp);
      value = [...value];
    } else {
      value = resp;
    }
    this.setValue(value);
  }

  @autobind
  @action
  removeAttachmentUrl(resp: string) {
    const { field, name, dataIndex, dataSet, record } = this;
    if (!resp) return;
    if (!record && field && name) dataSet!.create({}, dataIndex);
    let value: string | string[] | undefined = this.getValue();
    const multiple = this.getProp('multiple');
    if (multiple) {
      const max = this.getProp("max");
      value = !value ? [] : (isArrayLike(value) && value || [value]);
      value = value.filter(url => url !== resp);
    } else {
      value = undefined;
    }
    this.setValue(value);
  }

  getUploaderProps(): UploaderProps & { saveUploadCancel: UrlAttachment["saveUploadCancel"] } {
    const { bucketName, bucketDirectory, storageCode, isPublic, fileKey } = this;
    const fileSize = this.getProp('fileSize');
    const chunkSize = this.getProp('chunkSize');
    const chunkThreads = this.getProp('chunkThreads');
    const useChunk = this.getProp('useChunk');
    // eslint-disable-next-line prefer-destructuring
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
      const result = await uploader.upload(attachment, this.attachments || [attachment]);
      if (this.record) {
        this.record.clearValidationError(this.name);
      }
      if (result === false) {
        this.removeAttachment(attachment);
      } else {
        runInAction(() => {
          if (attachment.status === 'success') {
            this.addAttachmentUrl(result);
          } else {
            this.checkValidity();
          }
        });
      }
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

  processFiles(files: File[]): AttachmentFile[] {
    return files.map((file, index: number) => new AttachmentFile({
      uid: this.getUid(index),
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      originFileObj: file,
      creationDate: new Date(),
    }));
  }

  @autobind
  @mobxAction
  handleChange(e) {
    const { target } = e;
    if (target.value) {
      const files: File[] = [...target.files];
      target.value = '';
      this.uploadAttachments(this.processFiles(files));
    }
  }

  doRemove(attachment: AttachmentFile): Promise<any> | undefined {
    const { onRemove: onAttachmentRemove = noop } = this.props;
    return Promise.resolve(onAttachmentRemove(attachment)).then(mobxAction(ret => {
      if (ret !== false) {
        const { onRemove } = attachmentConfig;
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
          if (attachment) {
            const { bucketName, bucketDirectory, storageCode, isPublic } = this;
            attachment.status = 'deleting';
            return onRemove({ attachment, bucketName, bucketDirectory, storageCode, isPublic, crossTenant: this.getProp("crossTenant") })
              .then(mobxAction((result) => {
                if (result !== false) {
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
  handleHistory(attachment: AttachmentFile) {
    const { renderHistory } = attachmentConfig;
    if (renderHistory) {
      const { bucketName, bucketDirectory, storageCode } = this;
      Modal.open({
        title: $l('Attachment', 'operation_records'),
        // TODO: 待修正逻辑
        children: renderHistory({
          attachment,
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
  handleFetchAttachment(isPublic?: boolean) {
    const value = this.getValue();
    const { fetchList } = attachmentConfig;
    const { query, body } = this.props.queryArgs || {};
    if (fetchList) {
      fetchList({ query, body, isPublic, attachmentUrls: !value ? [] : (isArrayLike(value) && value || [value]) }).then(action((results: FileLike[]) => {
        this.attachments = results.map(file => new AttachmentFile(file));
        this.syncAttachmentUrl();
      }));
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
        this.removeAttachmentUrl(attachment.url!);
        if (attachment.status !== 'uploading') {
          this.checkValidity();
        }
      }
    }
    return undefined;
  }

  handleDragUpload = (file: File) => {
    const { field } = this;
    const uid = field && field.get(FIELD_CACHE_UID);
    if (uid) {
      this.uploadAttachments(this.processFiles([file]));
    }
    return false;
  };

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

  /**
   * 单个文件的UID，与field.get(FIELD_CACHE_UID)不是一个概念
   */
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
    const { ref, style, name, onChange, ...rest } = buttonProps;
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
              <span><input key="upload" {...uploadProps} style={{ width: 0, height: 0, display: 'block' }} /></span>
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
              >
                {children || $l('Attachment', 'upload_attachment')}{label && <>({label})</>} {countText}
                <span><input key="upload" {...uploadProps} style={{ width: 0, height: 0, display: 'block' }} /></span>
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
            <div className={`${prefixCls}-drag-hidden-text`}>
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
      });
    }
  }

  @autobind
  draggerLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDisabled()) return;
    // eslint-disable-next-line prefer-destructuring
    let target = event.target;
    while(target) {
      if (target.classList && target.classList.contains(`${this.prefixCls}-drag-over`)) {
        break;
      }
      target = target.parentNode;
    }
    if (target === event.target || !target) {
      runInAction(() => {
        this.newDragState = false;
      });
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
        this.uploadAttachments(this.processFiles(files));
      }
      runInAction(() => {
        this.newDragState = false;
      });
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
      fileReadOnly, previewData, downloadData,
    } = this.props;
    const { attachments } = this;
    const attachmentUrl = this.getValue();
    if (attachmentUrl || uploadButton || (attachments && attachments.length)) {
      const { bucketName, bucketDirectory, storageCode, readOnly, isPublic } = this;
      const width = this.getPictureWidth();
      return (
        <AttachmentList
          prefixCls={`${this.prefixCls}-list`}
          pictureWidth={width}
          listType={listType}
          attachments={attachments}
          disabled={super.isDisabled()}
          bucketName={bucketName}
          bucketDirectory={bucketDirectory}
          storageCode={storageCode}
          attachmentUrl={attachmentUrl}
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
          onFetchAttachments={this.handleFetchAttachment}
          onAttachmentsChange={this.handleAttachmentsChange}
          onPreview={this.handlePreview}
          fileReadOnly={fileReadOnly}
          record={this.record}
          attachmentLimit={this.props.attachmentLimit}
          previewData={previewData}
          downloadData={downloadData}

        />
      );
    }
  }

  renderHeader(uploadBtn?: ReactNode) {
    const { prefixCls, count, props: { downloadAll, viewMode, __inGroup } } = this;
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
          popupHidden={!this.tplPopup}
          onPopupHiddenChange={this.handleTplPopupHiddenChange}
        >
          {uploadBtn}
        </Trigger>,
      );
    }
    if (this.readOnly) {
      if (!this.count && viewMode !== 'popup' && !__inGroup) {
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
    const { viewMode, listType, hidden } = this.props;
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
            popupHidden={hidden || !this.popup}
            onPopupHiddenChange={this.handlePopupHiddenChange}
          >
            {this.renderDragUploadArea()}
            {readOnly ? this.renderViewButton(label) : this.renderUploadBtn(false, label)}
          </Trigger>
          {this.showValidation === ShowValidation.newLine && this.renderValidationResult()}
        </>
      );
    }
    return this.renderWrapperList(readOnly ? undefined : this.renderUploadBtn(listType === 'picture-card'));
  }
}
