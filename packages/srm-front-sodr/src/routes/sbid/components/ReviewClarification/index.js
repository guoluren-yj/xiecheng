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

import TableList from './TableList';
import InforForm from './InforForm';

const { Panel } = Collapse;

@formatterCollections({
  code: ['ssrc.bidHall', 'ssrc.common'],
})
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
    const { modelName, clarifyNotifyId } = this.state;
    const params = querystring.parse(this.props.location.search.substr(1));

    const { quotationHeaderId, sourceFrom = 'BID', sourceHeaderId } = params;
    const { dispatch } = this.props;
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
    const { backPath, collapseKeys, modelName } = this.state;
    const {
      [modelName]: {
        clarifyNotifyDetailHeader = {},
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
      onChange: (page) => this.queryClarifyNotifyList(page),
    };
    return (
      <div>
        <Header
          title={intl.get(`ssrc.bidHall.model.clarify.clarifyDetail`).d('澄清通知详情')}
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
