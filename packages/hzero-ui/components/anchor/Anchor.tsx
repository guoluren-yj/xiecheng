import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import type { AnchorContainer, AnchorDefaultProps, AnchorProps } from 'choerodon-ui/lib/anchor/Anchor';
import C7NAnchor from 'choerodon-ui/lib/anchor';
import AnchorLink from './AnchorLink';

export type {
  AnchorContainer,
  AnchorProps,
  AnchorDefaultProps,
};

const Anchor: ForwardRefExoticComponent<AnchorProps> = forwardRef<C7NAnchor, AnchorProps>((props, ref) => {
  return <C7NAnchor prefixCls="ant-anchor" {...props} ref={ref} />;
});

Anchor.displayName = 'Anchor<hzeroWithC7n>';

export type AnchorType = typeof Anchor & { Link: typeof AnchorLink }
(Anchor as AnchorType).Link = AnchorLink;

export default Anchor as AnchorType;
