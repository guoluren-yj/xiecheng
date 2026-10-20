import React, { Component } from 'react';
import classNames from 'classnames';

import { AnchorContext } from './AnchorComponent';

class AnchorLink extends Component {
  componentDidMount() {
    this.context.registerLink(this.props.href);
  }

  // componentDidUpdate({ href: prevHref }) {
  //   const { href } = this.props;
  //   if (prevHref !== href) {
  //     this.context.unregisterLink(prevHref);
  //     this.context.registerLink(href);
  //   }
  // }

  componentWillUnmount() {
    this.context.unregisterLink(this.props.href);
  }

  handleClick = e => {
    const { scrollTo, onClick } = this.context;
    const { href, title } = this.props;
    if (onClick) {
      onClick(e, { title, href });
    }
    scrollTo(href);
  };

  render() {
    const { wrapperClassName, title, href, children } = this.props;
    const active = this.context.activeLink === href;
    const wrapperAClassName = classNames(wrapperClassName, `ant-anchor-link`, {
      [`ant-anchor-link-active`]: active,
    });
    const titleClassName = classNames(`ant-anchor-link-title`, {
      [`ant-anchor-link-title-active`]: active,
    });
    return (
      <div className={wrapperAClassName}>
        <a
          className={titleClassName}
          href={`#${href}`}
          title={typeof title === 'string' ? title : ''}
          onClick={this.handleClick}
        >
          {title}
        </a>
        {children}
      </div>
    );
  }
}

AnchorLink.contextType = AnchorContext;
export default AnchorLink;
