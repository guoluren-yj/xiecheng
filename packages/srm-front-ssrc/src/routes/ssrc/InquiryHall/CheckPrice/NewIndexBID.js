import React, { Component } from 'react';
import { Spin } from 'choerodon-ui/pro';

import { queryCheckPriceUiDisplayConfig } from '@/services/commonService';
import NewCheckPrice from '@/routes/ssrc/InquiryHall/CheckPriceNewC7N/indexBid';
import { getResponse } from 'hzero-front/lib/utils/utils';

import OldCheckPrice from './indexBid';

export default class NewIndex extends Component {
  state = {
    spinning: true,
    checkPriceUiIsNew: false,
  };

  componentDidMount() {
    this.checkPriceUiDisplayConfig();
  }

  /**
   * 查询核价配置表
   */
  async checkPriceUiDisplayConfig() {
    const result = getResponse(await queryCheckPriceUiDisplayConfig());
    if (result) {
      this.setState({
        spinning: false,
        checkPriceUiIsNew: Boolean(result?.length), // 临时取反，上线还得改回
      });
    } else {
      this.setState({
        spinning: false,
        checkPriceUiIsNew: false, // 临时取反，上线还得改回
      });
    }
  }

  render() {
    const { checkPriceUiIsNew, spinning } = this.state;
    return (
      <Spin spinning={spinning}>
        {spinning ? null : checkPriceUiIsNew ? (
          <NewCheckPrice {...this.props} />
        ) : (
          <OldCheckPrice {...this.props} />
        )}
      </Spin>
    );
  }
}
