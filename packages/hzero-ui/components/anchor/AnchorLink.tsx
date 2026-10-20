import type { FunctionComponent } from 'react';
import React from 'react';
import C7NAnchor from 'choerodon-ui/lib/anchor';
import type { AnchorLinkProps } from 'choerodon-ui/lib/anchor';

const C7NAnchorLink = C7NAnchor.Link;

export type {
  AnchorLinkProps,
};

const AnchorLink: FunctionComponent<AnchorLinkProps> = function AnchorLink(props) {
  return <C7NAnchorLink prefixCls="ant-anchor" {...props} />;
};

AnchorLink.displayName = 'AnchorLink<hzeroWithC7n>';

export default AnchorLink;
