import type { FunctionComponent } from 'react';
import React from 'react';
import Card from 'choerodon-ui/lib/card';
import type { CardGridProps } from 'choerodon-ui/lib/card';

const CardGrid = Card.Grid;

export type {
  CardGridProps,
};

const Grid: FunctionComponent<CardGridProps> = function Grid(props) {
  return <CardGrid prefixCls="ant-card" {...props} />;
};

Grid.displayName = 'CardGrid<hzeroWithC7n>';

export default Grid;
