import React, { Component } from 'react';
import { withRouter } from 'dva/router';
import { Button, Dropdown, Menu, Tooltip } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { verifyPriceClarificationButton } from '@/services/expertScoringService';
import { Button as PermissionButton } from 'components/Permission';
import { openTab, refreshTab } from 'utils/menuTab';
import { getQuotationName } from '@/utils/globalVariable';

import Styles from './index.less';

@formatterCollections({
  code: ['ssrc.expertScoring', 'ssrc.supplierBidQuery', 'ssrc.inquiryHall', 'ssrc.common'],
})
@withRouter
export default class PriceClarificationButtons extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clarifyNotifyId: null, // 跳转维护页面的ID
      allowCreate: null,
      allowViewResponseDetail: null,
    };
  }

  componentDidMount() {}

  getRouterParams() {
    const {
      location: { search = {} },
    } = this.props;
    return querystring.parse(search.substr(1)) || {};
  }

  // verify buttons through api
  @Bind()
  async validateButtons() {
    const { sourceHeaderId, sourceFrom, organizationId, remote, remotePrefix } = this.props;
    try {
      let result = await verifyPriceClarificationButton({
        sourceFrom,
        sourceHeaderId,
        organizationId,
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      const {
        clarifyNotifyId, // 跳转维护页面的ID
        create = null,
        allowViewResponseDetail = true, // HACK, SHOW ALWAYS, NEED clarifyIssueId TO DIRECTION
      } = result || {};

      const allowCreateCurrent =
        remote && remotePrefix
          ? remote.process(`${remotePrefix}_PROCESS_CREATE_BUTTON_VISIBLE`, create, { that: this })
          : create;

      this.setState({
        clarifyNotifyId,
        allowCreate: allowCreateCurrent,
        allowViewResponseDetail,
      });
    } catch (e) {
      throw e;
    }
  }

  // direction 发起价格澄清
  @Bind()
  sponsorPriceClarification() {
    const {
      location: { pathname = null, search },
      sourceHeaderId,
      sourceFrom,
      bidFlag,
    } = this.props;
    const { clarifyNotifyId = null } = this.state;

    const params = {
      sourceHeaderId,
      sourceFrom,
      clarifyNotifyId,
      originBackPath: `${pathname}${search}`,
    };
    const searchParams = querystring.stringify(params);

    const path = bidFlag
      ? '/ssrc/new-bid-hall/price-clarification-update'
      : '/ssrc/price-clarification/update';
    openTab({
      key: path,
      path,
      title: 'srm.common.tab.title.ssrc.priceClarification',
      closable: true,
      search: searchParams,
    });
    refreshTab(path);
  }

  // direction 查看回复详情
  @Bind()
  viewResponseDetail() {
    const optionParams = {
      viewOnlyPage: 0,
    };

    this.historyPriceClarification(optionParams);
  }

  // direction 历史价格澄清
  @Bind()
  historyPriceClarification(optionParams = {}) {
    const {
      location: { pathname = null, search = null },
      sourceHeaderId,
      sourceFrom,
      bidFlag,
    } = this.props;

    const params = {
      sourceHeaderId,
      sourceFrom,
      viewOnlyPage: 1,
      ...optionParams,
      originBackPath: `${pathname}${search}`,
    };
    const searchParams = querystring.stringify(params);
    const path = bidFlag
      ? '/ssrc/new-bid-hall/price-clarification-list'
      : '/ssrc/price-clarification/list';
    openTab({
      key: path,
      path,
      // title: 'ssrc.inquiryHall.view.title.priceClarification',
      title: 'srm.common.tab.title.ssrc.priceClarification',
      closable: true,
      search: searchParams,
    });
    refreshTab(path);
  }

  render() {
    const {
      sourceFrom = 'RFX',
      disabled = false,
      buttonPermission = true,
      bidFlag = false,
      ...others
    } = this.props;
    const { allowCreate = null, allowViewResponseDetail = null } = this.state;

    if (sourceFrom === 'BID') {
      return null;
    }

    return (
      <Dropdown
        overlay={
          <Menu>
            {allowCreate ? (
              <Menu.Item>
                <a type="default" onClick={this.sponsorPriceClarification}>
                  {intl
                    .get('ssrc.inquiryHall.view.button.sponsorPriceClarification')
                    .d('发起价格澄清')}
                </a>
              </Menu.Item>
            ) : null}
            {allowViewResponseDetail ? (
              <Menu.Item>
                <a onClick={this.viewResponseDetail}>
                  <Badge
                    count={others.priceRepliedCount}
                    offset={[0, 5]}
                    className={Styles['badge-item-c7n']}
                  >
                    <span>
                      {intl
                        .get('ssrc.inquiryHall.view.button.viewResponseDetail')
                        .d('查看回复详情')}
                    </span>
                  </Badge>
                </a>
              </Menu.Item>
            ) : null}
          </Menu>
        }
        trigger={['click']}
      >
        <Badge
          count={others.priceRepliedCount}
          offset={[12, -12]}
          className={Styles['badge-item-c7n']}
        >
          <Tooltip
            placement="left"
            title={intl
              .get('ssrc.inquiryHall.view.message.button.commonPriceClarificationDes', {
                quotationName: getQuotationName(bidFlag),
              })
              .d(
                '适用于供应商{quotationName}存在明显计算性误差，需供应商重新{quotationName}的情况'
              )}
          >
            {buttonPermission ? (
              <Button
                {...others}
                disabled={disabled}
                style={{ marginLeft: '8px' }}
                onClick={this.validateButtons}
                icon="contact_support"
                funcType="flat"
              >
                {intl.get('ssrc.inquiryHall.view.message.button.priceClarification').d('价格澄清')}
              </Button>
            ) : (
              <PermissionButton
                {...others}
                funcType="flat"
                icon="contact_support"
                type="c7n-pro"
                onClick={this.validateButtons}
                permissionList={[
                  {
                    code: `${this.props?.match?.path}.button.priceclarification`.toLowerCase(),
                    type: 'button',
                    meaning:
                      intl.get(`ssrc.inquiryHall.view.message.title.checkPrice`).d('核价') -
                      intl
                        .get('ssrc.inquiryHall.view.message.button.priceClarification')
                        .d('价格澄清'),
                  },
                ]}
              >
                {intl.get('ssrc.inquiryHall.view.message.button.priceClarification').d('价格澄清')}
              </PermissionButton>
            )}
          </Tooltip>
        </Badge>
      </Dropdown>
    );
  }
}
