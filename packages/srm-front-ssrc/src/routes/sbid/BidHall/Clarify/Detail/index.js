/**
 * 澄清函详情入口
 * @date: 2019-6-19
 * @author: LvShuo <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import queryString from 'querystring';

import { Collapse, Icon, Spin } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import classnames from 'classnames';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import ClarifyContent from './clarifyContent';
import ClarificationTable from './clarifyQuestion';
import ClarifyHeaderFrom from './clarifyHeaderFrom';

const { Panel } = Collapse;

@formatterCollections({
  code: ['ssrc.clarify', 'ssrc.common', 'ssrc.bidHall'],
})
@connect(({ bidHall, loading }) => ({
  bidHall,
  detailsLoading: loading.effects['bidHall/fetchClarifyDetail'],
  tableLoading: loading.effects['bidHall/fetchClarifyReferIssue'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfo', 'clarifyContent'], // 打开的折叠面板key
    };
  }

  componentDidMount() {
    const {
      dispatch,
      bidHall: { clarificationQuestionPagination = {} },
    } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
    this.fetchDetail();
    this.handleClarificationQuestion(clarificationQuestionPagination);
  }

  // 卸载阶段清空数据
  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        clarificationDetails: {},
        clarificationQuestionList: [],
        clarificationQuestionPagination: {},
      },
    });
  }

  /**
   * 查询详情页面行信息
   */
  @Bind()
  fetchDetail() {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'bidHall/fetchClarifyDetail',
      payload: {
        organizationId,
        clarifyId: params.clarifyId,
      },
    });
  }

  /**
   * 澄清函引用问题
   */
  @Bind()
  handleClarificationQuestion(page = {}) {
    const { dispatch, match, organizationId } = this.props;
    dispatch({
      type: 'bidHall/fetchClarifyReferIssue',
      payload: {
        page,
        organizationId,
        clarifyId: match.params.clarifyId,
        sourceId: match.params.sourceId,
        sourceType: 'BID',
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

  getBackPath() {
    const {
      match: { params = {} },
      location: { search = {} },
    } = this.props;
    const {
      quotationEndDateFlag = null,
      createFlag = null,
      isClarificationFlag = null,
    } = queryString.parse(search.substr(1));
    const url = `/ssrc/bid-hall/inter-question/${params.sourceId}/${params.bidNum}/sourceTitle/${params.companyId}/2?quotationEndDateFlag=${quotationEndDateFlag}&createFlag=${createFlag}&isClarificationFlag=${isClarificationFlag}`;
    return url;
  }

  render() {
    const {
      bidHall: {
        code = {},
        clarificationDetails = {},
        clarificationQuestionList = [],
        clarificationQuestionPagination = {},
      },
      detailsLoading,
      tableLoading,
      organizationId,
    } = this.props;

    const { collapseKeys } = this.state;
    const detailFormProps = {
      organizationId,
      dataSource: clarificationDetails,
      clarifyStatusLov: code.clarifyStatus,
    };
    const clarificationTableProps = {
      organizationId,
      Loading: tableLoading,
      fetchClarList: clarificationQuestionList,
      fetchClarListPagination: clarificationQuestionPagination,
      clarifyType: code.clarifyType,
      onChange: this.handleClarificationQuestion,
    };
    return (
      <React.Fragment>
        <Header
          backPath={this.getBackPath()}
          title={intl.get(`ssrc.clarify.view.message.title.detail.clarifyDetail`).d('澄清函详情')}
        />
        <Content>
          <Spin
            spinning={detailsLoading || tableLoading}
            wrapperClassName={classnames('ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                key="baseInfo"
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.clarify.view.message.title.detail.clarifyHeader`)
                        .d('澄清函基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <ClarifyHeaderFrom {...detailFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.clarify.view.message.title.detail.clarifyContent`)
                        .d('澄清函正文')}
                    </h3>
                    <a>
                      {collapseKeys.includes('clarifyContent')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('clarifyContent') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="clarifyContent"
              >
                <ClarifyContent detail={clarificationDetails} />
              </Panel>
              <Panel
                showArrow={false}
                key="clarifyQuestion"
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.clarify.view.message.title.detail.lineQuestion`)
                        .d('关联问题')}
                    </h3>
                    <a>
                      {collapseKeys.includes('clarifyQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('clarifyQuestion') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <ClarificationTable {...clarificationTableProps} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
