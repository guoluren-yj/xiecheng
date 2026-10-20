import React from 'react';
import { getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';
import Image from '@/routes/components/Image';
import { Modal } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';
import { Tag, Icon } from 'choerodon-ui';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

export const getRealUrl = (url) => {
  return getAttachmentUrl(url, PRIVATE_BUCKET, organizationId);
};

export default function ImageList(props) {
  const { imageDTO = [], isTag = true } = props;

  const handlePreview = (imageList) => {
    const listArr = [];
    imageList
      .map((i) => ({
        fileUrl: getRealUrl(i.fileUrl || i.attachmentUrl),
      }))
      .forEach((j) => {
        listArr.push(j.fileUrl);
      });
    Modal.preview({
      list: listArr,
      defaultIndex: 0,
    });
  };

  return (
    <div className={styles['imgs-wrapper']}>
      {Array.isArray(imageDTO) &&
        imageDTO.length > 0 &&
        imageDTO.slice(0, 1)?.map((i) => (
          <>
            <div
              className="img-content"
              onClick={() => {
                handlePreview(imageDTO);
              }}
            >
              <Image value={getRealUrl(i.fileUrl || i.attachmentUrl)} width={50} height={50} />
              <div className="image-mask">
                <Icon type="visibility-o" />
              </div>
              {isTag && (
                <Tag
                  // color="#108ee9"
                  style={{
                    height: 'auto',
                    lineHeight: '15px',
                    position: 'absolute',
                    right: '-8px',
                  }}
                >
                  {imageDTO.length}
                </Tag>
              )}
            </div>

            {!isTag && (
              <a
                className="downLoad"
                href={getRealUrl(i.fileUrl || i.attachmentUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon type="cloud_download" />
              </a>
            )}
          </>
        ))}
    </div>
  );
}
