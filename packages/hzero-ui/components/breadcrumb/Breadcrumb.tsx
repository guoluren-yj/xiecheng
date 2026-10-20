import type { FunctionComponent } from 'react';
import React from 'react';
import type { BreadcrumbProps, Route } from 'choerodon-ui/lib/breadcrumb/Breadcrumb';
import C7NBreadcrumb from 'choerodon-ui/lib/breadcrumb';
import C7NDropdownProps from '../dropdown/overwriteProps';
import C7NListProps from '../list/overwriteProps';

const BreadcrumbItem = C7NBreadcrumb.Item;

export {
  Route,
  BreadcrumbProps,
};

const Breadcrumb: FunctionComponent<BreadcrumbProps> = function Breadcrumb(props) {
  return <C7NBreadcrumb prefixCls="ant-breadcrumb" dropdownProps={C7NDropdownProps} listProps={C7NListProps} {...props} />;
};

Breadcrumb.displayName = 'Breadcrumb<hzeroWithC7n>';

type BreadcrumbType = typeof Breadcrumb & { Item: typeof BreadcrumbItem };

(Breadcrumb as BreadcrumbType).Item = BreadcrumbItem;

export default Breadcrumb as BreadcrumbType;
