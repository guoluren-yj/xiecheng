import React, { Fragment, Component } from 'react';
import { getUrlWithCodeApi } from '@/services/PurchaseRobotUrlService';
import { Spin } from 'choerodon-ui/pro';
import { getResponse, getCurrentUser } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({ code: ['smbl.thirdPageTip'] })
export default class PurchaseRobotCustomerConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
      loading: false,
    };
  }

  componentDidMount() {
    const userInfo = getCurrentUser();
    this.setState({ loading: true });
    getUrlWithCodeApi('customer_config', userInfo.language)
      .then((res) => {
        if (getResponse(res)) {
          // 请求接口，获取iframe地址
          this.setState({ url: res });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const { url, loading } = this.state;
    return (
      <Fragment>
        {url ? (
          <iframe title={url} src={url} frameBorder={0} height="100%" width="100%" />
        ) : (
          <Spin spinning={loading} />
        )}
      </Fragment>
    );
  }
}
