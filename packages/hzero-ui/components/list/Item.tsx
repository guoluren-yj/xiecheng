import type { FunctionComponent} from 'react';
import React, { memo } from 'react';
import type { ListItemMetaProps, ListItemProps } from 'choerodon-ui/lib/list/Item';
import List from 'choerodon-ui/lib/list';

const C7NListItem = List.Item;
const C7NListMeta = C7NListItem.Meta;

export type {
  ListItemProps, ListItemMetaProps,
};

const ListMeta: FunctionComponent<ListItemMetaProps> = function ListMeta(props) {
  return <C7NListMeta prefixCls="ant-list" {...props} />;
};

ListMeta.displayName = 'ListMeta<hzeroWithC7n>';

export const Meta = memo(ListMeta);

const ListItem: FunctionComponent<ListItemProps> = function ListItem(props) {
  return <C7NListItem prefixCls="ant-list" {...props} />;
};

ListItem.displayName = 'ListItem<hzeroWithC7n>';

type ListItemType = typeof ListItem & { Meta: typeof Meta };

(ListItem as ListItemType).Meta = Meta;

export default ListItem as ListItemType;
