import type { FunctionComponent } from 'react';
import React from 'react';
import C7NCard from 'choerodon-ui/lib/card';
import type { CardGridProps, CardMetaProps, CardProps, CardState, CardTabListType, CardType } from 'choerodon-ui/lib/card';
import Grid from './Grid';
import Meta from './Meta';
import C7NTabsOverWriteProps from '../tabs/overwriteProps';

export type { CardType, CardGridProps, CardMetaProps, CardProps, CardTabListType, CardState };


const Card: FunctionComponent<CardProps> = function Card(props) {
  return <C7NCard prefixCls="ant-card" tabsProps={C7NTabsOverWriteProps} {...props} />;
};

Card.displayName = 'Card<hzeroWithC7n>';

type CardTypes = typeof Card & { Grid: typeof Grid, Meta: typeof Meta };

(Card as CardTypes).Grid = Grid;
(Card as CardTypes).Meta = Meta;

export default Card as CardTypes;
