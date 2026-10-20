/* eslint-disable no-new */
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'choerodon-ui/pro';
import Swiper from 'swiper';
import { Player } from 'video-react';
import Image from '@/components/Image';
import VideoPlayer from '../../SkuPreview/SkuImage/Player';

// import intl from 'utils/intl';

import ImgView from './ImgView';

import styles from './index.less';

export default function ProductImg(props) {
  const swiper = useRef();
  const { skuImageList = [], initMediaId, initMediaPath, initLargeImagePath } = props;

  const {
    mediaType = 0,
    mediaId = initMediaId,
    mediaPath = initMediaPath,
    largeImagePath = initLargeImagePath,
  } = (skuImageList || []).find((f) => f.primaryFlag === 1) || {};

  const list =
    !skuImageList.length && initMediaPath
      ? [{ mediaPath: initMediaPath, mediaId: initMediaId, largeImagePath: initLargeImagePath }]
      : skuImageList || [];

  const initSelectId = mediaId;
  const initSelectImg = largeImagePath || mediaPath;
  const initSelectType = mediaType;

  const [selectImgInfo, setSelectImg] = useState({
    selectId: initSelectId,
    selectImg: initSelectImg,
    selectType: initSelectType,
  });

  const { selectId, selectImg, selectType } = selectImgInfo;

  // 预览框展示图片
  const minImg = selectImg;
  const maxImg = selectImg;

  useEffect(() => {
    setSelectImg({
      selectId: initSelectId,
      selectImg: initSelectImg,
      selectType: initSelectType,
    });
  }, [initSelectImg]);

  useEffect(() => {
    swiper.current = new Swiper(`#smpc-detail-images`, {
      navigation: {
        nextEl: `.detail-images-next`,
        prevEl: `.detail-images-prev`,
      },
      slidesPerView: 4,
      slidesPerGroup: 4,
      width: 48,
      height: 216,
      spaceBetween: 8,
      direction: 'vertical',
    });
    return () => {
      if (swiper.current) {
        swiper.current.destroy();
      }
    };
  }, [list]);

  const showDetailImgs = () => {
    return list.map((item) => (
      <div
        onFocus
        className="swiper-slide"
        key={item.id}
        onMouseOver={() => {
          setSelectImg({
            selectId: item.mediaId,
            selectImg: item.largeImagePath || item.mediaPath,
            selectType: item.mediaType,
          });
        }}
      >
        {item.mediaType === 1 ? (
          <div className={selectId === item.mediaId ? 'small-img small-img-box' : 'small-img'}>
            <Player muted src={item.mediaPath} />
            <div className="disabled-video" />
          </div>
        ) : (
          <div className={selectId === item.mediaId ? 'small-img small-img-box' : 'small-img'}>
            <Image value={item.mediaPath} width={48} height={48} />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={styles['new-common-product-img-content']}>
      <div className="new-detail-images-wrapper">
        <div className="detail-images-prev">
          <Icon type="keyboard_arrow_up" />
        </div>
        <div id="smpc-detail-images" className="swiper-container swiper">
          <div className="new-product-detail-imgs swiper-wrapper">{showDetailImgs()}</div>
        </div>
        <div className="detail-images-next">
          <Icon type="keyboard_arrow_down" />
        </div>
      </div>
      <div className="main-img">
        {selectType === 1 ? (
          <VideoPlayer imagePath={selectImg} />
        ) : (
          <ImgView minImg={minImg} maxImg={maxImg} />
        )}
      </div>
    </div>
  );
}
