import React, { createElement } from 'react';
import Header from './Header';
import Content from './Content';

interface wrapperRender {
  (elements: React.ReactElement): React.ReactElement;
}

export interface PageHeaderWrapperProps {
  children?: React.ReactNode | string;
  title: React.ReactNode | string;
  header?: React.ReactNode | string;
  wrapperRender: wrapperRender;
  headerProps?: {
    backPath: any;
    backTooltip: any;
    isChange: any;
  };
  wrapper?: string | React.ComponentType<any>;
  wrapperProps?: any;
  contentProps?: {
    title?: React.ReactNode | string;
    description?: React.ReactNode | string;
    children?: React.ReactNode | string;
    style: React.CSSProperties;
    wrapperStyle: string;
    wrapperClassName?: string; // 包裹的className
    className?: string; // 真正的 Content 的样式
    noCard?: boolean;
  };
}

const PageHeaderWrapper: React.FC<PageHeaderWrapperProps> = ({
  title = '',
  header,
  headerProps,
  contentProps,
  children,
  wrapperRender,
  wrapperProps,
  wrapper = React.Fragment,
}) => {
  const content = (
    <>
      <Header title={title} {...headerProps}>
        {header}
      </Header>
      <Content {...contentProps}>{children}</Content>
    </>
  );
  if (wrapperRender) {
    return wrapperRender(content);
  }
  return createElement(wrapper, wrapperProps, content);
};

export default PageHeaderWrapper;
