/**
 * ExpertScoring/BidHall - 澄清单详情
 * @date: 2019-08-20
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { Collapse, Icon, Spin } from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import common from '@/routes/sbid/common.less';
import { Header, Content } from 'components/Page';
import { isBackPubPage } from '@/utils/utils';

import TableList from './TableList';
import InforForm from './InforForm';

const { Panel } = Collapse;

@formatterCollections({
  code: ['ssrc.bidHall', 'ssrc.common', 'ssrc.question'],
})
class index extends Component {
  constructor(props) {
    super(props);
    const { modelName = 'inquiryHall', location } = props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { backPath } = routerParams;

    this.remotePrefix = 'SSRC_REVIEWCLARIFICATION_COMPONENT';

    this.state = {
      modelName,
      // clarifyNotifyId,
      backPath,
      collapseKeys: ['baseInfos', 'list'],
    };
  }

  componentDidMount() {
    this.initPage();
  }

  @Bind()
  initPage() {
    this.queryClarifyNotifyHeader();
    this.queryClarifyNotifyList();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      location: { search },
    } = prevProps || {};
    const PrevRouterParams = querystring.parse(search.substr(1)) || {};
    const { clarifyNotifyId: prevClarifyNotifyId = null } = PrevRouterParams;
    const clarifyNotifyId = this.getRouterParams('clarifyNotifyId');

    return clarifyNotifyId && clarifyNotifyId !== prevClarifyNotifyId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  // get location
  getLocationSearch(key = null) {
    const { history } = this.props;
    const {
      location: { search = {} },
    } = history || {};
    const RouterParams = querystring.parse(search.substr(1)) || {};
    if (!key || typeof key !== 'string') {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  getRouterParams(key = null) {
    const {
      location: { search },
    } = this.props;

    const RouterParams = querystring.parse(search.substr(1));
    if (!key) {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  /**
   * 查询澄清单详情头信息
   */
  @Bind()
  queryClarifyNotifyHeader() {
    const { modelName = 'inquiryHall' } = this.state;
    const routerParam = this.getRouterParams();
    const { clarifyNotifyId } = routerParam;
    const { dispatch } = this.props;
    dispatch({
      type: `${modelName}/queryClarifyNotifyDetailHeader`,
      payload: {
        clarifyNotifyId,
      },
    });
  }

  /**
   * 查询澄清单详情列表
   */
  @Bind()
  queryClarifyNotifyList(page = {}) {
    const { modelName = 'inquiryHall' } = this.state;
    const { dispatch, location } = this.props;
    const params = querystring.parse(location.search.substr(1));

    const { quotationHeaderId, sourceFrom = 'BID', sourceHeaderId, clarifyNotifyId } = params;
    dispatch({
      type: `${modelName}/queryClarifyNotifyDetailList`,
      payload: {
        page,
        sourceFrom,
        sourceHeaderId,
        clarifyNotifyId,
        quotationHeaderId,
      },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const { backPath, collapseKeys, modelName = 'inquiryHall' } = this.state;
    const {
      location,
      [modelName]: {
        clarifyNotifyDetailHeader = {},
        clarifyNotifyDetailList,
        clarifyNotifyDetailListPagination,
      },
      loading: {
        [`${modelName}/queryClarifyNotifyDetailList`]: loadingList,
        [`${modelName}/queryClarifyNotifyDetailHeader`]: loadingHeader,
      },
      match: { path = null },
      componentRemote,
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { activeKey } = routerParams;
    const baseInfos = {
      clarifyNotifyDetailHeader,
      location,
      path,
      componentRemote,
      remotePrefix: this.remotePrefix,
    };
    const tableProps = {
      dataSource: clarifyNotifyDetailList,
      pagination: clarifyNotifyDetailListPagination,
      onChange: (page) => this.queryClarifyNotifyList(page),
    };

    return (
      <div>
        <Header
          title={intl.get(`ssrc.bidHall.model.clarify.clarifyDetail`).d('澄清通知详情')}
          backPath={isBackPubPage(path, `${backPath}&clearCache=1&activeKey=${activeKey}`)}
        />
        <Content className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}>
          <Collapse
            className="form-collapse"
            onChange={this.onCollapseChange}
            defaultActiveKey={['baseInfos', 'list']}
          >
            <Panel
              showArrow={false}
              header={
                <React.Fragment>
                  <h3>
                    {intl.get(`ssrc.bidHall.view.message.tab.clarifyInfos`).d('澄清通知基本信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('baseInfos')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                </React.Fragment>
              }
              key="baseInfos"
            >
              <div style={{ zIndex: -1 }}>
                <Spin spinning={loadingHeader}>
                  <InforForm {...baseInfos} />
                </Spin>
              </div>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <React.Fragment>
                  <h3>
                    {intl.get(`ssrc.bidHall.view.message.tab.clarifyNoticeQue`).d('澄清通知问题')}
                  </h3>
                  <a>
                    {collapseKeys.includes('list')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('list') ? 'up' : 'down'} />
                </React.Fragment>
              }
              key="list"
            >
              <div style={{ zIndex: -1 }}>
                <Spin spinning={loadingList}>
                  <TableList {...tableProps} />
                </Spin>
              </div>
            </Panel>
          </Collapse>
        </Content>
      </div>
    );
  }
}

export default index;
