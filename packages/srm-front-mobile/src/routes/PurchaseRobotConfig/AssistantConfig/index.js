import React, { useState, useEffect, useRef } from 'react';
import intl from 'utils/intl';
import { Spin, Modal } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import { getResponse } from 'utils/utils';
import {
  getAliChatbotConfigUrl,
  getPurchaseHelperService,
} from '@/services/PurchaseRobotUrlService';
import formatterCollections from 'utils/intl/formatterCollections';
import InfoPage from '@/components/Chat/InfoPage';
import withProps from 'utils/withProps';
import styles from './index.less';

const AssistantConfig = () => {
  const [url, setUrl] = useState('');
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef({ timer: null, thirdTipKey: 'third_tip_assistant_config' });

  const authError = () => {
    setAuth(false);
    setLoading(false);
  };

  const showThirdStyleTip = () => {
    const flag = window.localStorage.getItem(cacheRef.current.thirdTipKey) === 'true';
    if (flag) return;
    window.localStorage.setItem(cacheRef.current.thirdTipKey, 'true');
    Modal.confirm({
      title: intl.get('smbl.purchaseRobotConfig.view.title.hint').d('提示'),
      children: intl
        .get('smbl.purchaseRobotConfig.view.title.thirdPageStyle')
        .d('当前功能为第三方嵌入功能，页面风格同标准页面有部分差异.'),
      okText: intl.get('smbl.purchaseRobotConfig.view.title.iKnow').d('我知道了'),
      cancelButton: false,
    });
  };

  // 获取url地址
  const getUrl = async () => {
    const serviceResult = await getPurchaseHelperService();
    const service = getResponse(serviceResult);
    if (!service || !service?.services?.includes('JIKE_NLP_ALI_V1')) {
      return authError();
    }
    const urlResult = await getAliChatbotConfigUrl();
    const _url = getResponse(urlResult);
    if (!_url) {
      return authError();
    }
    setAuth(true);
    setUrl(_url);
    startRefreshTimer();
  };

  // 刷新定时器
  const startRefreshTimer = () => {
    clearTimeout(cacheRef.current.timer);
    cacheRef.current.timer = setTimeout(() => {
      getUrl();
    }, 60 * 1000 * 55);
  };

  const renderContent = () => {
    if (auth === null || (auth && !url)) return null;
    if (!auth) {
      return (
        <InfoPage
          title={intl
            .get('smbl.purchaseRobotConfig.view.infoTitle')
            .d('亲爱的用户，您尚未开通问答助手服务')}
          content={intl
            .get('smbl.purchaseRobotConfig.view.infoContent')
            .d('请在右下角唤起即刻或在应用商店中进行开通，感谢您的使用。')}
        />
      );
    }
    return (
      <iframe
        title="aliChatbot"
        width="100%"
        height="100%"
        src={url}
        style={{ flex: 1, border: 'none' }}
        onLoad={() => {
          setLoading(false);
        }}
      />
    );
  };

  useEffect(() => {
    showThirdStyleTip();
    getUrl();
  }, []);

  return (
    <Spin spinning={loading} wrapperClassName={styles['assistant-config']}>
      {renderContent()}
    </Spin>
  );
};

export default compose(
  formatterCollections({
    code: ['smbl.purchaseRobotConfig'],
  }),
  withProps(
    () => {
      return {};
    },
    { cacheState: true }
  )
)(AssistantConfig);
