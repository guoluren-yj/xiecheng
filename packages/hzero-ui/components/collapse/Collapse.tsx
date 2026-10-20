import type { FunctionComponent } from 'react';
import React from 'react';
import type { CollapseProps, ExpandIconPosition, PanelProps, TriggerMode } from 'choerodon-ui/lib/collapse/Collapse';
import C7NCollapse from 'choerodon-ui/lib/collapse';

const CollapsePanel = C7NCollapse.Panel;

export type {
  PanelProps, CollapseProps, ExpandIconPosition, TriggerMode,
};

const Collapse: FunctionComponent<CollapseProps> = function Collapse(props) {
  return <C7NCollapse prefixCls="ant-collapse" {...props} />;
};

Collapse.displayName = 'Collapse<hzeroWithC7n>';

type CollapseType = typeof Collapse & { Panel: typeof CollapsePanel };

(Collapse as CollapseType).Panel = CollapsePanel;

export default Collapse as CollapseType;
