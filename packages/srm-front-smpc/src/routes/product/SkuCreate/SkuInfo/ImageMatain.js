import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { isNumber } from 'lodash';
import uuidv4 from 'uuid/v4';
import { DraggableArea } from 'react-draggable-tags';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Form, Button, Modal, Icon, TextField } from 'choerodon-ui/pro';
import OverflowTip from '@/routes/components/OverflowTip';

import intl from 'utils/intl';
import ImageNormal from '@/components/Image';
import Image from '../Image';
import CropperUpload from '../CropperUpload';

import styles from './index.less';

const sortImgList = (list) => {
  list.sort((next, current) => {
    const nOrder = next.get('orderSeq');
    const cOrder = current.get('orderSeq');
    if (!isNumber(nOrder) && !isNumber(cOrder)) {
      return 0;
    } else if (!isNumber(nOrder)) return 1;
    else if (!isNumber(cOrder)) return -1;
    else return nOrder - cOrder;
  });
};

const ImageSortContainer = ({ dataSet, disabled }) => {
  const [list, setList] = useState([]);

  const init = () => {
    const images = dataSet.filter((f) => f.get('mediaType') === 0);
    sortImgList(images);
    setList(images);
  };

  /**
   * mediaType 图片-0/视频-1/URL-2
   */
  const uploadSuccess = (images) => {
    if (dataSet) {
      const lastOrderSeq = dataSet.filter((f) => f.get('mediaType') === 0).length + 1;
      images.forEach((f, ind) => {
        dataSet.create({
          mediaType: 0,
          mediaPath: f.imagePath,
          thumbnailPath: f.thumbnailPath,
          _imgUniqKey: uuidv4(),
          orderSeq: lastOrderSeq + ind,
        });
      });
    }
  };

  useEffect(() => {
    init();
  }, [dataSet.length]);

  const tags = [...list];
  if (!disabled) {
    tags.push({ isUploadBtn: true, undraggable: true });
  }

  return (
    <div className="image-upload-container">
      <DraggableArea
        tags={tags}
        tagStyle={{ cursor: disabled ? 'auto' : 'grab' }}
        render={({ tag }) => {
          if (tag.isUploadBtn) {
            return (
              <div className="image-card" key="image-upload">
                <CropperUpload
                  multiple
                  maxSize={{
                    storageSize: 30,
                    storageUnit: 'MB',
                  }}
                  onSuccess={uploadSuccess}
                  title={intl.get('smpc.product.model.productImage').d('商品图片')}
                />
              </div>
            );
          }
          return (
            <div key={tag.get('_imgUniqKey')} className="image-card image-content">
              <ImageNormal value={tag.get('mediaPath')} width={80} height={80} />
              <div className="img-btn">
                <a
                  href={tag.get('largeImagePath') || tag.get('mediaPath')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Icon type="visibility-o" />
                </a>
                {!disabled && (
                  <Icon
                    type="delete"
                    onClick={() => {
                      dataSet.remove(tag);
                    }}
                  />
                )}
              </div>
            </div>
          );
        }}
        onChange={(data) => {
          if (!disabled) {
            const _tags = data.filter((l) => !l.isUploadBtn);
            _tags.forEach((f, ind) => {
              f.set('orderSeq', ind + 1);
            });
            setList(_tags);
          } else {
            init();
          }
        }}
      />
    </div>
  );
};

// 工作台批量上传图片 、 商品编辑图片
export default observer(function ImgDrawer(props) {
  const { dataSet, disabled, imgModal } = props;

  const urlPreview = (url) => {
    if (url) {
      Modal.open({
        movable: false,
        closable: true,
        mask: true,
        maskClosable: true,
        destroyOnClose: true,
        style: { width: 560 },
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('smpc.product.view.imagePreview').d('图片预览'),
        children: <Image src={url} type="load" width={86} height={86} />,
      });
    }
  };

  const urlList = dataSet.filter((r) => r.get('mediaType') === 2);
  sortImgList(urlList);

  return (
    <div className={styles['images-modal']}>
      <div className="images-message-wrapper">
        <div className="images-message">
          <Icon type="help" style={{ marginRight: 4 }} />
          <OverflowTip>
            {intl
              .get('smpc.product.view.message.imgMatain')
              .d('若上传了图片也编辑了图片链接，则优先显示图片链接内容')}
          </OverflowTip>
        </div>
      </div>
      <p className="module-item">{intl.get('smpc.product.view.uploadImage').d('上传图片')}</p>
      <ImageSortContainer disabled={disabled} dataSet={dataSet} imgModal={imgModal} />
      <p className="file-help-info">
        {intl.get('smpc.product.view.helpInfo3').d('图片支持PNG、JPG、JPEG格式，且不能大于30M')}
      </p>
      <div style={{ marginTop: 20 }}>
        <p className="module-item">
          {intl.get('smpc.product.view.uploadImageUrl').d('上传图片链接')}
        </p>
        <DraggableArea
          isList
          tags={urlList}
          tagStyle={{ cursor: disabled ? 'auto' : 'grab' }}
          render={({ tag: record }) => {
            return (
              <div className="img-url-form">
                <Form record={record} labelLayout="float" style={{ maxWidth: 380 }}>
                  <TextField
                    disabled={disabled}
                    name="mediaPath"
                    suffix={
                      <Icon
                        type="photo"
                        style={{
                          fontSize: '14px',
                          marginTop: 2,
                          color: 'initial',
                          cursor: record.get('mediaPath') ? 'pointer' : 'auto',
                        }}
                        onClick={() => urlPreview(record.get('mediaPath'))}
                      />
                    }
                    onChange={() => {
                      // 图片保存取值逻辑： largeImagePath || mediaPath， 防止图片为更新
                      record.set('largeImagePath', '');
                    }}
                  />
                </Form>
                {!disabled && (
                  <Icon
                    type="delete"
                    style={{ marginLeft: 8, cursor: 'pointer', color: '#000' }}
                    onClick={() => dataSet.remove(record)}
                  />
                )}
              </div>
            );
          }}
          onChange={(data) => {
            if (!disabled) {
              data.forEach((f, ind) => {
                f.set('orderSeq', ind + 1);
              });
            }
          }}
        />

        <div style={{ marginTop: 8 }}>
          <Button
            funcType="flat"
            color="primary"
            icon="playlist_add"
            disabled={disabled}
            onClick={() => dataSet.create({ mediaType: 2, orderSeq: urlList.length + 1 })}
          >
            {intl.get('smpc.product.model.add').d('新增')}
          </Button>
        </div>
      </div>
    </div>
  );
});
