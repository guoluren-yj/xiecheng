import type { FunctionComponent } from 'react';
import React from 'react';
import C7NCarousel from 'choerodon-ui/lib/carousel';
import type { CarouselProps } from 'choerodon-ui/lib/carousel';

export type {
  CarouselProps,
};

const Carousel: FunctionComponent<CarouselProps> = function Carousel(props) {
  return <C7NCarousel prefixCls="ant-carousel" {...props} />;
};

Carousel.displayName = 'Carousel<hzeroWithC7n>';

export default Carousel;
