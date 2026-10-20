import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { getAliChatbotConfigUrl } from '@/services/PurchaseRobotUrlService';
import styles from './index.less';

const AliChatbotConfig = forwardRef((props, ref) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef({ timer: null });

  // 获取url地址
  const getUrl = () => {
    getAliChatbotConfigUrl().then((res) => {
      setUrl(res);
      startRefreshTimer();
    });
  };

  // 刷新定时器
  const startRefreshTimer = () => {
    clearTimeout(cacheRef.current.timer);
    cacheRef.current.timer = setTimeout(() => {
      getUrl();
    }, 60 * 1000 * 55);
  };

  useImperativeHandle(
    ref,
    () => ({
      refresh() {
        setUrl('');
        setLoading(true);
        getUrl();
      },
      destory() {
        setUrl('');
        clearTimeout(cacheRef.current.timer);
      },
    }),
    []
  );

  useEffect(() => {
    getUrl();
  }, []);

  return (
    <Spin spinning={loading} wrapperClassName={styles['ali-chatbot-config-spin']}>
      {url ? (
        <iframe
          title="aliChatbot"
          frameBorder={0}
          width="100%"
          src={url}
          style={{ flex: 1 }}
          onLoad={() => {
            setLoading(false);
          }}
        />
      ) : (
        <div />
      )}
    </Spin>
  );
});

export default AliChatbotConfig;
