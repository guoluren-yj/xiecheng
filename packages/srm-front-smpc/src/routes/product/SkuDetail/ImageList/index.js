import React, { useState } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Player } from 'video-react';

import Image from '@/components/Image';
import ImageViewer from '@/components/ImageViewer';
import styles from './index.less';

export default function ImageList(props) {
  const { width, height, imgList } = props;
  const isImage = imgList && imgList.filter((f) => f.fileUrl).length > 0;
  const initImgUrl = imgList?.[0]?.minUrl || imgList?.[0]?.fileUrl;
  const initImgType = imgList?.[0]?.type;
  const [viewProps, setViewProps] = useState({
    visible: false,
    index: 0,
    imgList: [],
  });

  return (
    <div className={styles['image-wrapper']} style={{ width, height }}>
      {initImgType === 'video' ? (
        <Player muted className="sku-video" playsInline src={initImgUrl} />
      ) : (
        <Image value={initImgUrl} width={width} height={height} />
      )}
      {isImage && (
        <div className="image-mask">
          <Icon type="visibility-o" onClick={() => setViewProps({ imgList, visible: true })} />
        </div>
      )}
      {viewProps.visible && (
        <ImageViewer
          {...viewProps}
          closeModal={() => setViewProps({ ...viewProps, visible: false })}
        />
      )}
    </div>
  );
}
