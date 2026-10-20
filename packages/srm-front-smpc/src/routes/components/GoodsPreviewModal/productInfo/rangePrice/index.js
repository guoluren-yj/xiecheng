import React, { useEffect, useMemo, useRef } from 'react';
import intl from 'utils/intl';
import Swiper from 'swiper';
import { math } from 'choerodon-ui/dataset';
import { numberRender } from 'utils/renderer';
import Icons from '@/routes/components/Icons';
import style from './index.less';

export default function RangePrice(props) {
  const { productLadderPrices, setQuantity, quantity, id } = props;

  const swiper = useRef();
  const symbol = '￥';
  /** 新增的多语言 */
  const pieces = intl.get(`small.productDetail.model.pieces`).d('件');

  useEffect(() => {
    swiper.current = new Swiper(`#range-price${id}`, {
      prevButton: '.price-prev',
      nextButton: '.price-next',
      slidesPerView: 2,
      slidesPerGroup: 2,
      width: 204,
      height: 75,
      spaceBetween: 10,
      simulateTouch: false,
    });
    return () => {
      swiper.current.destroy();
    };
  }, []);

  const showDetailImgs = useMemo(() => {
    return productLadderPrices.map((item) => {
      const { ladderFrom, ladderTo, taxPrice } = item;
      const isSelected = ladderTo
        ? math.gte(quantity, ladderFrom) && math.lt(quantity, ladderTo)
        : math.gte(quantity, ladderFrom);
      return (
        <div
          className={`swiper-slide ${isSelected ? 'price-selected' : ''}`}
          onClick={() => setQuantity(ladderFrom)}
        >
          <div className={`price ${isSelected ? 'price-selected' : ''}`}>
            {`${symbol}${numberRender(taxPrice, 2)}`}
          </div>
          <div className="number">
            {ladderFrom
              ? ladderTo
                ? `${ladderFrom}-${math.minus(ladderTo, 1)}${pieces}`
                : `>=${ladderFrom}`
              : `<=${ladderTo}`}
          </div>
        </div>
      );
    });
  }, [productLadderPrices, quantity]);

  useEffect(() => {
    productLadderPrices.forEach((item, index) => {
      const { ladderFrom, ladderTo } = item;
      if (
        !ladderTo
          ? math.gte(quantity, ladderFrom)
          : math.gte(quantity, ladderFrom) && math.lt(quantity, ladderTo)
      ) {
        if (swiper.current) {
          swiper.current.slideTo(index);
        }
      }
    });
  }, [quantity]);

  return (
    <div className={style['range-price-content']}>
      <div className="range-price-type">
        {/* 新增的多语言 */}
        {intl.get(`small.productDetail.model.ladderPrice`).d('阶梯价格')}
      </div>
      <div className="range-price-display">
        <div className="price-prev">
          {productLadderPrices.length > 3 ? <Icons className="prev-icon" type="left" /> : ''}
        </div>
        <div id={`range-price${id}`} className="swiper-container swiper">
          <div className="swiper-wrapper">{showDetailImgs}</div>
        </div>
        <div className="price-next">
          {productLadderPrices.length > 3 ? <Icons className="next-icon" type="right" /> : ''}
        </div>
      </div>
    </div>
  );
}
