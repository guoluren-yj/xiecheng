import type { FunctionComponent } from 'react';
import React from 'react';
import type { BasicProps } from 'choerodon-ui/lib/layout/layout';
import C7NLayout from 'choerodon-ui/lib/layout';
import Sider from './Sider';

export type {
  BasicProps,
};

const Layout: FunctionComponent<BasicProps> = function Layout(props) {
  return <C7NLayout prefixCls="ant-layout" {...props} />;
};

Layout.displayName = 'Layout<hzeroWithC7n>';

const { Header: C7NHeader, Footer: C7NFooter, Content: C7NContent } = C7NLayout;

const Header: FunctionComponent<BasicProps> = function Header(props) {
  return <C7NHeader prefixCls="ant-layout-header" {...props} />;
};

Header.displayName = 'Header<hzeroWithC7n>';

const Footer: FunctionComponent<BasicProps> = function Footer(props) {
  return <C7NFooter prefixCls="ant-layout-footer" {...props} />;
};

Footer.displayName = 'Footer<hzeroWithC7n>';

const Content: FunctionComponent<BasicProps> = function Content(props) {
  return <C7NContent prefixCls="ant-layout-content" {...props} />;
};

Content.displayName = 'Content<hzeroWithC7n>';

type LayoutType = typeof Layout & {
  Header: typeof Header;
  Footer: typeof Footer;
  Content: typeof Content;
  Sider: typeof Sider;
}

(Layout as LayoutType).Header = Header;
(Layout as LayoutType).Footer = Footer;
(Layout as LayoutType).Content = Content;
(Layout as LayoutType).Sider = Sider;

export default Layout as LayoutType;
