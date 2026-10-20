/**
 * FullScreenBtn - 全屏按钮
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useState, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal } from 'hzero-ui';
import intl from 'utils/intl';

import styles from './index.less';

export default function FullScreenBtn(props) {
  const { children, getBtnContainer = () => document.body } = props;
  const [fullScreenFlag, setFullScreenFlag] = useState(false);

  useEffect(() => {
    renderBtn();
  }, [fullScreenFlag]);

  const ModalProps = {
    width: '100%',
    height: document?.body?.clientHeight || '100vh',
    visible: fullScreenFlag,
    onCancel: () => setFullScreenFlag(false),
    footer: null,
    closable: false,
    destroyOnClose: true,
  };

  const getBtn = () => {
    return (
      <Button icon="arrows-alt" onClick={() => getreqfullscreen.call(getBtnContainer())}>
        {intl.get('spcm.purchaseContactType.view.message.fullScreenMode').d('全屏模式')}
      </Button>
    );
  };

  const getreqfullscreen = () => {
    const root = document.documentElement;
    return (
      root.requestFullscreen ||
      root.webkitRequestFullscreen ||
      root.mozRequestFullScreen ||
      root.msRequestFullscreen
    );
  };

  const renderBtn = () => {
    ReactDOM.render(getBtn(), getBtnContainer() || document.body);
  };

  return (
    <Fragment>
      {children}
      {fullScreenFlag && (
        <Modal
          wrapClassName={styles['full-modal-wrapper']}
          bodyStyle={{ height: `${document?.body?.clientHeight - 39}px` }}
          {...ModalProps}
          title={
            <Button
              icon="shrink"
              style={{ float: 'right' }}
              onClick={() => setFullScreenFlag(false)}
            >
              {intl.get('spcm.purchaseContactType.view.message.exitFullScreen').d('退出全屏')}
            </Button>
          }
        >
          {children}
        </Modal>
      )}
    </Fragment>
  );
}
