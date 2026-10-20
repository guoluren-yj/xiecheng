import React, { useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import Swiper from 'swiper';
import { numberRender } from 'utils/renderer';
import Icons from 'components/Icons';
import style from './index.less';

let swiper;
export default function RangePrice(props) {
  const { currentPrice, productLadderPrices, onChangePrice } = props;

  /** 新增的多语言 */
  const pieces = intl.get(`small.productDetail.model.productDetail.pieces`).d('件');

  useEffect(() => {
    swiper = new Swiper('#range-price', {
      prevButton: '.price-prev',
      nextButton: '.price-next',
      slidesPerView: 3,
      slidesPerGroup: 3,
      width: 490,
      height: 75,
      spaceBetween: 22,
      simulateTouch: false,
    });
    return () => {
      swiper.destroy();
    };
  }, []);
  useEffect(() => {
    productLadderPrices.map((item, index) => {
      if (item.unitPrice === currentPrice) {
        swiper.slideTo(index);
      }
      return item;
    });
  }, [currentPrice]);

  const showDetailImgs = useMemo(() => {
    return productLadderPrices.map((item) => {
      return (
        <div
          className={`swiper-slide ${item.unitPrice === currentPrice ? 'price-selected' : ''}`}
          onClick={() => onChangePrice(item.ladderFrom)}
        >
          <div className={`price ${item.unitPrice === currentPrice ? 'price-selected' : ''}`}>
            {numberRender(item.unitPrice, 2)}
          </div>
          <div className="number">
            {item.ladderFrom
              ? item.ladderTo
                ? `${item.ladderFrom}-${item.ladderTo - 1}${pieces}`
                : `>=${item.ladderFrom}`
              : `<=${item.ladderTo}`}
          </div>
        </div>
      );
    });
  }, [currentPrice]);

  return (
    <div className={style['common-range-price-content']}>
      <div className="range-price-type">
        {/* 新增的多语言 */}
        {intl.get(`small.productDetail.model.productDetail.priceType`).d('阶梯价格')}
      </div>
      <div className="range-price-display">
        <div className="price-prev">
          <Icons className="prev-icon" type="left" />
        </div>
        <div id="range-price" className="swiper-container swiper">
          <div className="swiper-wrapper">{showDetailImgs}</div>
        </div>
        <div className="price-next">
          <Icons className="next-icon" type="right" />
        </div>
      </div>
    </div>
  );
}
