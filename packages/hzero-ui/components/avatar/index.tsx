import type { FunctionComponent } from 'react';
import React from 'react';
import C7NAvatar from 'choerodon-ui/lib/avatar';
import type { AvatarProps, AvatarState } from 'choerodon-ui/lib/avatar';
import Icon from '../icon';

function renderIcon(type) {
  return <Icon type={type} />;
}

export type {
  AvatarProps,
  AvatarState,
};

const Avatar: FunctionComponent<AvatarProps> = function Avatar(props) {
  return <C7NAvatar prefixCls="ant-avatar" {...props} renderIcon={renderIcon} />;
};

Avatar.displayName = 'Avatar<hzeroWithC7n>';

export default Avatar;
