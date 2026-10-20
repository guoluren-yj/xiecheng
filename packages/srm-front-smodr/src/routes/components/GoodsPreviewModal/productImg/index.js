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
  const { productImgList: imgList = [], imgType: type, imagePath, id } = props;

  const productImgList = imgList.length === 0 && imagePath ? [{ imagePath }] : [...imgList];
  const initImgType = type || (imgList[0] && imgList[0].type) || 'FILE';
  const initSelectImg = imagePath || (imgList[0] && imgList[0].imagePath);
  const [selectImgInfo, setSelectImg] = useState({
    imgType: initImgType,
    selectImg: initSelectImg,
  });

  const { imgType, selectImg } = selectImgInfo;
  // const minImg = convertImg(selectImg, 1, sourceFrom);
  // const maxImg = convertImg(selectImg, 0, sourceFrom);
  const minImg = selectImg;
  const maxImg = selectImg;
  const swiper = useRef();

  useEffect(() => {
    setSelectImg({
      imgType: initImgType,
      selectImg: initSelectImg,
    });
  }, [initSelectImg]);

  useEffect(() => {
    swiper.current = new Swiper(`#detail-images${id}`, {
      navigation: {
        nextEl: `.detail-images-next`,
        prevEl: `.detail-images-prev`,
      },
      slidesPerView: 4,
      slidesPerGroup: 4,
      width: 180,
      height: 35,
      spaceBetween: 0,
    });
    return () => {
      swiper.current.destroy();
    };
  }, []);

  const showDetailImgs = () => {
    return productImgList.map((item) => (
      <div
        onFocus
        className="swiper-slide"
        key={item.id}
        onMouseOver={() => {
          // setQuoteVisible(false);
          // setFinalPriceVisible(false);
          setSelectImg({ selectImg: item.imagePath, imgType: item.type });
        }}
      >
        {/* value={Hmall.convertImg(item.imagePath, 1, sourceFrom)} */}
        {item.type === 'VIDEO' ? (
          <div className={selectImg === item.imagePath ? 'small-img small-img-box' : 'small-img'}>
            <Player muted src={item.imagePath} />
            <div className="disabled-video" />
          </div>
        ) : (
          <div className={selectImg === item.imagePath ? 'small-img small-img-box' : 'small-img'}>
            <Image value={item.imagePath} width={54} height={54} />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={styles['product-img-content']}>
      {imgType === 'VIDEO' ? (
        <VideoPlayer imagePath={selectImg} />
      ) : (
        <div style={{ width: '200px', height: '200px' }}>
          <ImageMagnifier minImg={minImg} maxImg={maxImg} />
        </div>
      )}
      <div className="detail-images-wrapper">
        <div className="detail-images-prev" />
        <div id={`detail-images${id}`} className="swiper-container swiper">
          <div className="product-detail-imgs swiper-wrapper">{showDetailImgs()}</div>
        </div>
        <div className="detail-images-next" />
      </div>
    </div>
  );
}
