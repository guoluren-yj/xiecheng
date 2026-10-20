import type { FunctionComponent } from 'react';
import React from 'react';
import type { TabsProps as C7NTabsProps, TabPaneProps, TabGroupProps } from 'choerodon-ui/lib/tabs';
import C7NTabs from 'choerodon-ui/lib/tabs';
import C7NTabsOverWriteProps from './overwriteProps';

const { TabPane, TabGroup } = C7NTabs;

export { TabPane, TabGroup };

export { TabsType, TabsPosition } from 'choerodon-ui/lib/tabs/enum';

export type { TabPaneProps, TabGroupProps };

export interface TabsProps extends C7NTabsProps {
  enableNavigation?: boolean;
}

const Tabs: FunctionComponent<TabsProps> = function Tabs(props) {
  const { enableNavigation, ...rest } = props;
  if (enableNavigation === false) {
    rest.keyboard = false;
  }
  return (
    <C7NTabs {...C7NTabsOverWriteProps} {...rest} />
  );
};

Tabs.displayName = 'Tabs<hzeroWithC7n>';

export type ForwardTabsType = typeof Tabs & { TabPane: typeof TabPane; TabGroup: typeof TabGroup }
(Tabs as ForwardTabsType).TabPane = TabPane;
(Tabs as ForwardTabsType).TabGroup = TabGroup;

export default Tabs as ForwardTabsType;
