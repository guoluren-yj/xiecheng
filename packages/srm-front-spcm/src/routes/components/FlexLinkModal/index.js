/**
 * @author biao.zhu@going-link.com
 * @since 2021-10-22 09:56:32
 * @lastTime 2021-10-22 10:00:12
 * @description 在弹框中展示对应路由组件
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component, Fragment } from 'react';
import { Drawer } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';

export default class FlexLinkModal extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  showModal = (uiType, children) => {
    if (uiType === 'h0') {
      this.setState({ visible: true });
    } else if (uiType === 'c7n') {
      const { modalProps } = this.props;
      Modal.open({
        size: 'large',
        drawer: true,
        children,
        resizable: true,
        style: {
          width: 1090,
        },
        bodyStyle: {
          padding: 0,
          // width: 1090,
        },
        footer: null,
        closable: true,
        maskClosable: true,
        ...modalProps,
        // drawerTransitionName: 'slide-left',
        // onOk: resolve,
      });
    }
  };

  render() {
    const { text, path, type, ...flexProps } = this.props;
    const { visible } = this.state;
    const modalProps = {
      visible,
      width: 1000,
      closable: true,
      maskClosable: true,
      onClose: () => {
        this.setState({ visible: false });
      },
    };
    const modalContent = <EmbedPage href={path} {...flexProps} />;
    if (!path) return text;
    return (
      <Fragment>
        <a
          onClick={() => {
            this.showModal(type, modalContent);
          }}
        >
          {text}
        </a>
        {visible && <Drawer {...modalProps}>{modalContent}</Drawer>}
      </Fragment>
    );
  }
}
