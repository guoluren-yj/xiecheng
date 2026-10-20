import type { FunctionComponent, ReactNode} from 'react';
import React, { Fragment, useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import type { DraggableProvided, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import isNumber from 'lodash/isNumber';
import type AttachmentFile from 'choerodon-ui/dataset/data-set/AttachmentFile';
import type Record from 'choerodon-ui/dataset/data-set/Record';
import Animate from 'choerodon-ui/pro/lib/animate';
// @ts-ignore
import { arrayMove } from 'choerodon-ui/dataset/utils';
import { Picture } from 'choerodon-ui/pro';
import type { AttachmentListType } from './UrlAttachment';
import Item from './Item';
import type { AttachmentLimitCfg } from './interface';

const { Provider: PictureProvider } = Picture;

export interface AttachmentListProps {
  prefixCls: string;
  attachments?: AttachmentFile[];
  listType?: AttachmentListType;
  pictureWidth: number;
  limit?: number;
  disabled?: boolean;
  onUpload: (attachment: AttachmentFile) => void;
  onHistory?: (attachment: AttachmentFile) => void;
  onRemove: (attachment: AttachmentFile) => Promise<any> | undefined;
  onFetchAttachments: (isPublic?: boolean) => void;
  onAttachmentsChange: (attachments: AttachmentFile[] | undefined) => void;
  onPreview: () => void;
  previewTarget?: string;
  bucketName?: string;
  bucketDirectory?: string;
  storageCode?: string;
  attachmentUrl?: string | string[];
  uploadButton?: ReactNode;
  sortable?: boolean;
  readOnly?: boolean;
  showHistory?: boolean;
  showSize?: boolean;
  isPublic?: boolean;
  record?: Record;
  fileReadOnly?: (file: AttachmentFile) => boolean;
  attachmentLimit?: (options: {attachment: AttachmentFile, isPublic?: boolean}) => AttachmentLimitCfg;
  previewData?: object | Function | undefined;
  downloadData?: object | Function | undefined;
}

const AttachmentList: FunctionComponent<AttachmentListProps> = function AttachmentList(props) {
  const {
    prefixCls,
    attachments,
    onUpload,
    onRemove,
    listType,
    pictureWidth,
    bucketName,
    bucketDirectory,
    storageCode,
    attachmentUrl,
    uploadButton,
    sortable,
    readOnly,
    onFetchAttachments,
    onAttachmentsChange,
    limit,
    onHistory,
    onPreview,
    previewTarget,
    isPublic,
    record,
    showSize,
    disabled,
    fileReadOnly,
    previewData,
    downloadData,
  } = props;
  const isCard = listType === 'picture-card';
  const classString = classNames(prefixCls, isCard ? `${prefixCls}-card` : `${prefixCls}-no-card`);
  const oldValues = useRef<{
    attachmentUrl?: string | string[];
    record?: Record;
  } | undefined>();
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source } = result;
    if (destination && attachments) {
      const newAttachments = attachments.slice();
      arrayMove<AttachmentFile>(
        newAttachments,
        source.index,
        destination.index,
      );
    }
  }, [attachments]);
  useEffect(() => {
    if (attachmentUrl) {
      const { current } = oldValues;
      if (!current || current.attachmentUrl !== attachmentUrl || current.record !== record) {
        if (attachments) {
          onAttachmentsChange(undefined);
        }
        oldValues.current = { attachmentUrl, record };
        onFetchAttachments(isPublic);
      }
    }
  }, [onFetchAttachments, bucketName, bucketDirectory, storageCode, attachmentUrl, isPublic, record]);

  if (attachments) {
    const { length } = attachments;
    const draggable = sortable && !readOnly && length > 1;
    let previewIndex = 0;
    const list = attachments.map((attachment, index) => {
      const { type, uid } = attachment;
      const restCount = index + 1 === limit ? length - limit : undefined;
      const hidden = isNumber(limit) && index >= limit;
      const itemDraggable = draggable && !restCount;
      const itemIndex = type.startsWith('image') ? previewIndex++ : undefined;
      const isReadOnly = fileReadOnly && fileReadOnly(attachment) || readOnly;
      return (
        <Draggable
          draggableId={uid}
          index={index}
          key={uid}
          isDragDisabled={!itemDraggable}
        >
          {
            (provided: DraggableProvided) => (
              <Item
                key={uid}
                provided={provided}
                prefixCls={`${prefixCls}-item`}
                attachment={attachment}
                pictureWidth={pictureWidth}
                listType={listType}
                bucketName={bucketName}
                bucketDirectory={bucketDirectory}
                storageCode={storageCode}
                showSize={showSize}
                onRemove={onRemove}
                onUpload={onUpload}
                disabled={disabled}
                isCard={isCard}
                readOnly={isReadOnly}
                restCount={restCount}
                draggable={itemDraggable}
                index={itemIndex}
                hidden={hidden}
                onHistory={onHistory}
                onPreview={onPreview}
                previewTarget={previewTarget}
                isPublic={isPublic}
                attachmentLimit={props.attachmentLimit}
                previewData={previewData}
                downloadData={downloadData}
              />
            )
          }
        </Draggable>
      );
    });

    return (
      <PictureProvider>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="list"
            key="list"
            isDropDisabled={!draggable}
            direction={isCard ? 'horizontal' : 'vertical'}
          >
            {
              (droppableProvided: DroppableProvided) => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={classString}
                >
                  <Animate
                    component={Fragment}
                    transitionName="fade"
                    exclusive
                  >
                    {list}
                  </Animate>
                  {droppableProvided.placeholder}
                  {uploadButton}
                </div>
              )
            }
          </Droppable>
        </DragDropContext>
      </PictureProvider>
    );
  }
  if (uploadButton) {
    return (
      <div className={classString}>
        {uploadButton}
      </div>
    );
  }
  return null;
};

AttachmentList.displayName = 'AttachmentList';

export default observer(AttachmentList);
