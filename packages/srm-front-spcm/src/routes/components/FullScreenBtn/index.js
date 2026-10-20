import React, { useState, useEffect } from 'react';
import { Button } from 'hzero-ui';
import intl from 'utils/intl';
import { requestFullScreen, isFullscreenElement } from './utils';

export default function FullScreenBtn(props) {
  const [fullScreen, setFullScreen] = useState(false);
  const { getFullScreenDom = () => document.body } = props;
  const [originResizeFunc, setOriginResizeFunc] = useState(null);
  console.log('fullScreen', fullScreen);
  useEffect(() => {
    // 监听 键盘ESC 退出全屏(可以使用屏幕大小监听，触发对应的事件)
    if (window.addEventListener) {
      window.addEventListener('resize', onEscCancelFull, false);
    } else {
      setOriginResizeFunc(window.onresize);
      window.onresize = onEscCancelFull;
    }
    // 销毁清除事件
    return () => {
      if (window.removeEventListener) {
        window.removeEventListener('resize', onEscCancelFull, false);
      } else {
        window.onresize = originResizeFunc;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onEscCancelFull = () => {
    // 用于反显状态
    setFullScreen(isFullscreenElement());
  };

  const handleFullScreen = () => {
    requestFullScreen(getFullScreenDom() || document.body);
  };

  // Node部分
  return (
    <Button icon="arrows-alt" onClick={handleFullScreen}>
      {intl.get('spcm.purchaseContactType.view.message.fullScreenMode').d('全屏模式')}
    </Button>
  );
}
