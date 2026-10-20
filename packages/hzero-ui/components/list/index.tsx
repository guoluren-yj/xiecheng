import type { FunctionComponent } from 'react';
import React from 'react';
import { Size } from 'choerodon-ui/lib/_util/enum';
import C7NList from 'choerodon-ui/lib/list';
import type { ColumnCount, ColumnType, ListGridType, ListLocale, ListProps } from 'choerodon-ui/lib/list';
import Item from './Item';
import C7NListProps from './overwriteProps';

import type { ListItemProps, ListItemMetaProps } from './Item';

export {
  Size as ListSize,
}

export type {
  ListItemProps, ListItemMetaProps,
  ColumnCount, ColumnType, ListGridType, ListProps, ListLocale,
};

const List: FunctionComponent<ListProps> = function List(props) {
  return <C7NList {...C7NListProps} {...props} />;
};
List.displayName = 'List<hzeroWithC7n>';

type ListType = typeof List & { Item: typeof Item };

(List as ListType).Item = Item;

export default List as ListType;
