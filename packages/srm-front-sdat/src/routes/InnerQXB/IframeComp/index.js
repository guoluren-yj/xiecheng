import React, { useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { fetchInnerUrl } from '@/services/innerQxbService';

export default function IframeComp(props) {
  const { src = '' } = props;

  const [prefix, setPrefix] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchInnerUrl().then((res) => {
      setLoading(false);
      if (res?.success) {
        setPrefix(res?.data);
      } else {
        notification.error({
          message: res?.message ?? res?.msg ?? '',
        });
      }
    });
  }, []);

  const iframeUrl = `${prefix}&returnUrl=${src}`;

  return (
    <Spin spinning={loading}>
      <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        {prefix ? (
          <iframe title={iframeUrl} src={iframeUrl} frameBorder={0} height="100%" width="100%" />
        ) : null}
      </div>
    </Spin>
  );
}
