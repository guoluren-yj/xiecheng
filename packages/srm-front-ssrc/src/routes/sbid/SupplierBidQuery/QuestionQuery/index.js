/**
 * QuestionQuery - 供应商问题维护
 * @date: 2019-6-13
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { Header, Content } from 'components/Page';
import { Tabs } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import styles from './index.less';
import Question from './Question';
import Clarification from './Clarification';

const { TabPane } = Tabs;

const promptCode = 'ssrc.supplierBidQuery';

@formatterCollections({
  code: ['ssrc.supplierBidQuery'],
})
@cacheComponent({ cacheKey: '/ssrc/supplier-bid-hall/questissson-list' })
export default class QuestionQuery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'question',
    };
  }

  componentDidMount() {
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    if (routerParam.flag === '1') {
      this.setState({
        activeKey: 'question',
      });
    }
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
  }

  render() {
    const { match, history, location } = this.props;
    const { activeKey } = this.state;
    const routerParam = queryString.parse(location.search.substr(1));
    const { subjectMatterRule = '' } = routerParam;

    const questionQueryProps = {
      match,
      location,
      history,
      routerParam,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.answerQuery`).d('澄清答疑查询')}
          backPath={`/ssrc/supplier-bid-query/bid-detail/${match.params.quotationHeaderId}?subjectMatterRule=${subjectMatterRule}`}
        />
        <Content style={{ paddingTop: 0 }}>
          <div className={styles['question-title']}>
            <span>
              {intl.get(`ssrc.supplierBidQuery.view.title.rfqNum`).d('寻源编号')}:
              {routerParam.bidNum}
            </span>
            <span>
              {intl.get(`ssrc.supplierBidQuery.view.title.rfqTitle`).d('寻源标题')}:
              {routerParam.bidTitle}
            </span>
          </div>
          <Tabs
            activeKey={activeKey}
            animated={false}
            className={styles['question-tab']}
            onChange={this.handleTabsChange}
          >
            <TabPane
              key="question"
              tab={intl.get(`${promptCode}.view.message.tab.questionQuery`).d('查看问题')}
            >
              <Question {...questionQueryProps} />
            </TabPane>
            <TabPane
              key="clarification"
              tab={intl.get(`${promptCode}.view.message.tab.clarification`).d('查看澄清函')}
            >
              <Clarification {...questionQueryProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
