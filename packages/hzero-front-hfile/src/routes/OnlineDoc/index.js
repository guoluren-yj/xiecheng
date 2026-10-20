import React, { useState, useEffect, useMemo } from 'react';
import { Spin } from 'choerodon-ui/pro';
import querystring from 'querystring';

import { getResponse } from 'utils/utils';
import OnlineWord from 'components/OnlineWord';
import { fetchOnlineEditorUrl } from '@/services/onlineDocService';
import styles from './index.less';

export default function OnlineDoc(props) {
  const { id, className, style, href, loading: propsLoading, onlineDocProps } = props;
  const [state, setState] = useState({
    url: undefined,
    loading: false,
    permission: { download: false, print: false },
  });

  const { isPreview, previewToken } = useMemo(() => {
    const search =
      href && href.indexOf('?') !== -1 ? href.substr(href.indexOf('?') + 1) : undefined;
    if (!search) {
      return { isPreview: undefined, previewToken: undefined };
    }
    const matchParams = querystring.parse(search);
    return { isPreview: matchParams.isPreview === 'true', previewToken: matchParams.previewToken };
  }, [href]);

  const requestId = useMemo(() => {
    const path = href && href.includes('?') ? href.substr(0, href.indexOf('?')) : href;
    const match = path && path.match(/\/hfile\/online-doc\/(\S+)/);
    return match ? match[1] : undefined;
  }, [href]);

  useEffect(() => {
    if (requestId) {
      getDocUrl();
    }
  }, [requestId]);

  const getDocUrl = async () => {
    if (requestId) {
      setState((preState) => ({ ...preState, loading: true }));
      const res = await fetchOnlineEditorUrl({ requestId });
      if (getResponse(res) && res) {
        const { fileUrl, permissionDownload, permissionPrint } = res;
        setState({
          url: fileUrl,
          loading: false,
          permission: {
            download: permissionDownload === true,
            print: permissionPrint === true,
          },
        });
      } else {
        setState({ url: undefined, loading: false });
      }
    }
  };

  return (
    <div id={id} className={className} style={{ height: '100%', width: '100%', ...(style || {}) }}>
      {(state.loading || propsLoading) && <Spin className={styles.loading} />}
      {!!state.url && (
        <OnlineWord
          url={state.url}
          readOnly={isPreview}
          fileId={requestId}
          fileToken={previewToken}
          permission={state.permission}
          {...(onlineDocProps || {})}
        />
      )}
    </div>
  );
}
