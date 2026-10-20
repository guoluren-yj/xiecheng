import type { FunctionComponent } from 'react';
import React from 'react';
import Card from 'choerodon-ui/lib/card';
import type { CardMetaProps } from 'choerodon-ui/lib/card';

const { Meta } = Card;

export type {
  CardMetaProps,
};

const CardMeta: FunctionComponent<CardMetaProps> = function CardMeta(props) {
  return <Meta prefixCls="ant-card" {...props} />;
};

CardMeta.displayName = 'CardMeta<hzeroWithC7n>';

export default CardMeta;
