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
import common from '@/routes/sbid/common.less';
import { Header, Content } from 'components/Page';

import List from './List';
import InforForm from './InforForm';

const { Panel } = Collapse;
class index extends Component {
  constructor(props) {
    super(props);
    const { modelName } = props;
    const routerParams = querystring.parse(this.props.location.search.substr(1));
    const { clarifyNotifyId, backPath } = routerParams;
    this.state = {
      modelName,
      clarifyNotifyId,
      backPath,
      collapseKeys: ['baseInfos', 'list'],
    };
  }

  componentDidMount() {
    this.queryClarifyNotifyHeader();
    this.queryClarifyNotifyList();
  }

  /**
   * 查询澄清单详情头信息
   */
  @Bind()
  queryClarifyNotifyHeader() {
    const { modelName, clarifyNotifyId } = this.state;
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
    const { backPath, modelName, clarifyNotifyId } = this.state;
    const params = querystring.parse(this.props.location.search.substr(1));
    const { sourceFrom = 'BID', sourceHeaderId } = params;
    const { dispatch } = this.props;
    const paramsBackPath = querystring.parse(backPath.split('?')[1]);
    const { quotationHeaderId } = paramsBackPath;
    dispatch({
      type: `${modelName}/queryClarifyNotifyDetailList`,
      payload: {
        quotationHeaderId,
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
    const { backPath, collapseKeys, modelName } = this.state;
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
    } = this.props;
    const baseInfos = {
      clarifyNotifyDetailHeader,
    };
    const tableProps = {
      dataSource: clarifyNotifyDetailList,
      pagination: clarifyNotifyDetailListPagination,
      queryClarifyNotifyList: this.queryClarifyNotifyList,
    };
    return (
      <div>
        <Header
          title={intl
            .get(`ssrc.bidHall.model.common.reviewClarificationDetail`)
            .d('评审问题回复详情')}
          backPath={`${backPath}&clearCache=1`}
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
