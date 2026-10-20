/**
 * 即刻3.0助手iframe组合页
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { useState, memo, useEffect } from 'react';
import intl from 'utils/intl';
import CLN from 'classnames';
import styles from './index.less';

const AssistantHistorys = (props) => {
  const { url } = props;
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
  }, [url]);
  return (
    <div className={styles['assistant-historys']}>
      {loading && (
        <div className={styles.loading}>
          {intl.get('smbl.chat.view.message.loading').d('加载中...')}
        </div>
      )}
      <iframe
        className={CLN({ [styles.hidden]: loading })}
        title={url}
        src={url}
        height="100%"
        width="100%"
        style={{ border: 'none' }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default memo(AssistantHistorys);
