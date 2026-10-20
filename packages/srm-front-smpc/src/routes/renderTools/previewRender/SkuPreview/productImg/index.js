/* eslint-disable no-new */
import React, { useState, useEffect, useRef } from 'react';
import { Player } from 'video-react';
import Swiper from 'swiper';
import Image from '../Image';
import ImageMagnifier from './Img';
import VideoPlayer from './Player';
// import ProductChart from './productChart';

import styles from './index.less';
// import { convertImg } from '../config';

export default function ProductImg(props) {
  const { productImgList: imgList = [], imagePath, id } = props;

  const { mediaPath = imagePath, mediaType = 0, mediaId = id } =
    (imgList || []).find((f) => f.primaryFlag === 1) || {};

  const productImgList =
    imgList.length === 0 && imagePath ? [{ mediaPath: imagePath, mediaId: id }] : imgList;
  const initImgType = mediaType;
  const initSelectId = mediaId;
  const initSelectImg = mediaPath;
  const [selectImgInfo, setSelectImg] = useState({
    imgType: initImgType,
    selectId: initSelectId,
    selectImg: initSelectImg,
  });

  const containerId = `detail-images-${id}`;
  const prevId = `images-prev-${id}`;
  const nextId = `images-next-${id}`;

  const { imgType, selectImg, selectId } = selectImgInfo;
  const minImg = selectImg;
  const maxImg = selectImg;
  const swiper = useRef();

  useEffect(() => {
    setSelectImg({
      imgType: initImgType,
      selectImg: initSelectImg,
      selectId: initSelectId,
    });
  }, [initSelectImg]);

  useEffect(() => {
    swiper.current = new Swiper(`#${containerId}`, {
      navigation: {
        nextEl: `#${nextId}`,
        prevEl: `#${prevId}`,
      },
      slidesPerView: 4,
      slidesPerGroup: 4,
      width: 184,
      height: 40,
      spaceBetween: 8,
    });
    return () => {
      swiper.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (swiper.current) {
      swiper.current.update();
    }
  }, [imgList]);

  const showDetailImgs = () => {
    return productImgList.map((item) => (
      <div
        onFocus
        className="swiper-slide"
        key={item.id}
        onMouseOver={() => {
          setSelectImg({ selectImg: item.mediaPath, imgType: item.type, selectId: item.mediaId });
        }}
      >
        {item.mediaType === 1 ? (
          <div className={selectId === item.mediaId ? 'small-img small-img-box' : 'small-img'}>
            <Player muted src={item.mediaPath} />
            <div className="disabled-video" />
          </div>
        ) : (
          <div className={selectId === item.mediaId ? 'small-img small-img-box' : 'small-img'}>
            <Image value={item.mediaPath} width={38} height={38} />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={styles['product-img-content']}>
      {imgType === 1 ? (
        <VideoPlayer imagePath={selectImg} />
      ) : (
        <div style={{ width: '200px', height: '200px' }}>
          <ImageMagnifier minImg={minImg} maxImg={maxImg} />
        </div>
      )}
      <div className="detail-images-wrapper">
        <div id={containerId} className="swiper-container swiper">
          <div className="product-detail-imgs swiper-wrapper">{showDetailImgs()}</div>
        </div>
        <div className="detail-images-prev" id={prevId} />
        <div className="detail-images-next" id={nextId} />
      </div>
    </div>
  );
}
