import React, { Component } from 'react';
import classnames from 'classnames';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import ResizeObserver from 'resize-observer-polyfill';

import { isElementOverflowed, isElementTextWrapped } from '@/utils/utils';
import styles from './index.less';

export default class Announcement extends Component {
  constructor(props) {
    super(props);
    if (typeof props.onRef === 'function') {
      props.onRef(this);
    }
    this.state = {
      isOpen: false,
      showButtonFlag: false,
    };
  }

  announcementRef = React.createRef();

  contentRef = React.createRef();

  resizeObserver = null; // 元素监听器

  componentDidMount() {
    const element = this.contentRef.current;
    this.resizeObserver = new ResizeObserver(() => {
      this.onContentChange();
    });
    if (element) {
      this.resizeObserver.observe(element);
    }
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  componentDidUpdate(prevProps) {
    if (this.props.content !== prevProps.content) {
      this.onContentChange();
    }
  }

  openAnnouncement = () => {
    if (this.state.isOpen) return;
    this.setState({
      isOpen: true,
    });

    setTimeout(() => {
      const ref = this.announcementRef.current;
      if (ref) ref.scrollTop = 0;
    });
  };

  foldAnnouncement = () => {
    this.setState({
      isOpen: false,
    });
  };

  switchAnnouncementView = () => {
    if (this.state.isOpen) {
      this.foldAnnouncement();
    } else {
      this.openAnnouncement();
    }
  };

  onContentChange = () => {
    const element = this.contentRef.current;
    if (!element) return;
    const isOverflowed = isElementOverflowed(element);
    const isWrapped = isElementTextWrapped(element);
    this.setState({ showButtonFlag: isOverflowed || isWrapped });
  };

  render() {
    const { isOpen, showButtonFlag } = this.state;
    const { content } = this.props;

    const textCls = classnames({
      [styles['smbl-chat-room-announcement-text']]: !isOpen,
      [styles['smbl-chat-room-announcement-text-open']]: isOpen,
    });

    const announcementCls = classnames(styles['smbl-chat-room-announcement'], {
      [styles['smbl-chat-room-announcement-open']]: isOpen,
    });

    return (
      <div
        ref={this.announcementRef}
        className={classnames(styles['smbl-chat-room-announcement-wrap'], {})}
      >
        <div className={announcementCls}>
          <div
            className={styles['smbl-chat-room-announcement-header']}
            onClick={this.switchAnnouncementView}
          >
            <span className={styles['smbl-chat-room-announcement-title']}>
              {intl.get('smbl.chat.view.message.groupAnounce').d('群公告')}
            </span>
            {!isOpen && showButtonFlag && (
              <Icon
                className={styles['smbl-chat-room-announcement-button']}
                type="keyboard_arrow_down"
              />
            )}
            {isOpen && showButtonFlag && (
              <Icon
                className={styles['smbl-chat-room-announcement-button']}
                type="keyboard_arrow_up"
              />
            )}
          </div>

          <div ref={this.contentRef} className={textCls}>
            {content}
          </div>
        </div>
      </div>
    );
  }
}
