import React, { Fragment, Component } from 'react';
import { getUrlWithCodeApi } from '@/services/PurchaseRobotUrlService';
import { Spin, Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { getCurrentUser } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

@formatterCollections({ code: ['smbl.thirdPageTip'] })
export default class PurchaseRobotKnowledge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
      loading: false,
    };
  }

  thirdTipKey = 'third_tip_customer';

  iframeRef = null;

  componentDidMount() {
    const userInfo = getCurrentUser();
    this.setState({ loading: true });
    getUrlWithCodeApi('customer', userInfo.language)
      .then((res) => {
        if (getResponse(res)) {
          // 请求接口，获取iframe地址
          this.setState({ url: res });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });

    window.addEventListener('message', this.iframeMessageHandle);
    this.showCustomerStyleTip();
  }

  iframeMessageHandle = (event) => {
    if (event?.data?.type === 'THEME_CONFIG') {
      const userInfo = getCurrentUser();
      if (this.iframeRef && this.iframeRef.contentWindow) {
        this.iframeRef.contentWindow.postMessage(
          {
            type: 'THEME_CONFIG',
            themeConfig: userInfo?.themeConfigVO,
          },
          '*'
        );
      }
    } else if (event?.data?.type === 'GET_HOST') {
      const host = window.location.origin;
      if (this.iframeRef && this.iframeRef.contentWindow) {
        this.iframeRef.contentWindow.postMessage(
          {
            type: 'SET_HOST',
            parentHost: host,
          },
          '*'
        );
      }
    }
  };

  componentWillUnmount() {
    window.removeEventListener('message', this.iframeMessageHandle);
  }

  showCustomerStyleTip = () => {
    const flag = window.localStorage.getItem(this.thirdTipKey) === 'true';
    if (flag) {
      return;
    }
    window.localStorage.setItem(this.thirdTipKey, 'true');
    Modal.confirm({
      title: intl.get('smbl.thirdPageTip.view.title.hint').d('提示'),
      style: { top: 185 },
      autoCenter: false,
      children: intl
        .get('smbl.thirdPageTip.view.title.thirdPageStyle')
        .d('当前功能为第三方嵌入功能，页面风格同标准页面有部分差异.'),
      okText: intl.get('smbl.thirdPageTip.view.title.iKnow').d('我知道了'),
      cancelButton: false,
    });
  };

  render() {
    const { url, loading } = this.state;
    return (
      <Fragment>
        {url ? (
          <iframe
            ref={(e) => {
              this.iframeRef = e;
            }}
            title={url}
            src={url}
            frameBorder={0}
            height="100%"
            width="100%"
          />
        ) : (
          <Spin spinning={loading} />
        )}
      </Fragment>
    );
  }
}
