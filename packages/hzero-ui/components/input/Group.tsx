import type { FunctionComponent } from 'react';
import React from 'react';
import type { GroupProps } from 'choerodon-ui/lib/input/Group';
import Input from 'choerodon-ui/lib/input';

const C7NGroup = Input.Group;

export type {
  GroupProps,
};

const Group: FunctionComponent<GroupProps> = function Group(props) {
  return <C7NGroup prefixCls="ant-input-group" {...props} />;
};

Group.displayName = 'Group<hzeroWithC7n>';

export default Group;
