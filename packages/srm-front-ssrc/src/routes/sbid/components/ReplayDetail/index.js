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

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import common from '@/routes/sbid/common.less';
import { Header, Content } from 'components/Page';

import List from './List';
import InforForm from './InforForm';

const { Panel } = Collapse;

@formatterCollections({ code: ['ssrc.bidHall', 'hzero.common', 'ssrc.expertScoring'] })
class index extends Component {
  constructor(props) {
    super(props);
    const { modelName = 'inquiryHall', location } = props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { backPath } = routerParams;
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
    const { backPath, modelName = 'inquiryHall' } = this.state;
    const { dispatch, location } = this.props;
    const params = querystring.parse(location.search.substr(1));
    const {
      sourceFrom = 'BID',
      sourceHeaderId,
      quotationHeaderId: headerId,
      clarifyNotifyId,
    } = params;
    const paramsBackPath = querystring.parse(backPath.split('?')[1]);
    const { quotationHeaderId } = paramsBackPath;

    let currentQuotationHeaderId = headerId;
    // 去除quotationHeaderId === ‘0’逻辑
    currentQuotationHeaderId =
      quotationHeaderId && quotationHeaderId !== '0' ? quotationHeaderId : currentQuotationHeaderId;

    dispatch({
      type: `${modelName}/queryClarifyNotifyDetailList`,
      payload: {
        quotationHeaderId: currentQuotationHeaderId,
        sourceFrom,
        sourceHeaderId,
        page,
        clarifyNotifyId,
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
      [modelName]: {
        clarifyNotifyDetailHeader,
        clarifyNotifyDetailList,
        clarifyNotifyDetailListPagination,
      },
      loading: {
        [`${modelName}/queryClarifyNotifyDetailList`]: loadingList,
        [`${modelName}/queryClarifyNotifyDetailHeader`]: loadingHeader,
      },
      location,
    } = this.props;
    const baseInfos = {
      clarifyNotifyDetailHeader,
    };
    const tableProps = {
      dataSource: clarifyNotifyDetailList,
      pagination: clarifyNotifyDetailListPagination,
      queryClarifyNotifyList: this.queryClarifyNotifyList,
    };
    const params = querystring.parse(location.search.substr(1));
    const { sourceFrom, activeKey } = params;
    return (
      <div>
        <Header
          title={
            sourceFrom === 'RFX' || sourceFrom === 'RFQ' || sourceFrom === 'BID'
              ? intl
                  .get(`ssrc.bidHall.model.common.reviewClarificationDetail`)
                  .d('评审问题回复详情')
              : intl.get(`ssrc.bidHall.model.common.questionAnswerDetail`).d('问题回复详情')
          }
          backPath={`${backPath}&clearCache=1&activeKey=${activeKey}`}
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
                  <h3>{intl.get(`ssrc.bidHall.view.tab.bidMaintain`).d('澄清通知基本信息')}</h3>
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
                  <h3>{intl.get(`ssrc.bidHall.view.message.tab.bidMaintain`).d('澄清通知正文')}</h3>
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
                  <List {...tableProps} />
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
