/**
 * Details - 问题详情页
 * @date: 2019-6-17
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Fragment } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import queryString from 'querystring';
import Upload from 'srm-front-boot/lib/components/Upload';
import { valueMapMeaning } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import classnames from 'classnames';
import { Collapse, Icon, Table, Spin, Popover } from 'hzero-ui';
import { PRIVATE_BUCKET } from '_utils/config';
import DetailsForm from './DetailsForm';

const organizationId = getCurrentOrganizationId();

const { Panel } = Collapse;

const promptCode = 'ssrc.supplierBidQuery';

@connect(({ supplierBidQuery, loading }) => ({
  supplierBidQuery,
  code: supplierBidQuery.code,
  informationLoading: loading.effects['supplierBidQuery/fetchQuestionHeader'],
  tableLoading: loading.effects['supplierBidQuery/fetchQuestionRows'],
  questionInformationHeader: supplierBidQuery.questionInformationHeader,
  questionRowsList: supplierBidQuery.questionRowsList,
  questionRowsPagination: supplierBidQuery.questionRowsPagination,
}))
export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['questionInformation', 'myQuestion'], // 打开的折叠面板key
    };
  }

  componentDidMount() {
    const { dispatch, match, questionRowsPagination } = this.props;
    // 问题详情头信息
    dispatch({
      type: 'supplierBidQuery/fetchQuestionHeader',
      payload: {
        issueHeaderId: match.params.issueHeaderId,
      },
    });
    this.handleQuestionRows(questionRowsPagination);
    this.fetchStatusvalues();
  }

  /**
   * 查询状态值集
   */
  @Bind()
  fetchStatusvalues() {
    const { dispatch } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE',
      issueStatus: 'SSRC.ISSUE_STATUS',
    };
    dispatch({
      type: 'supplierBidQuery/batchCode',
      payload: {
        lovCodes,
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

  /**
   * 问题行信息
   */
  @Bind()
  handleQuestionRows(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'supplierBidQuery/fetchQuestionRows',
      payload: {
        page,
        issueHeaderId: match.params.issueHeaderId,
      },
    });
  }

  render() {
    const { collapseKeys } = this.state;
    const {
      questionInformationHeader,
      questionRowsList,
      questionRowsPagination,
      informationLoading,
      tableLoading,
      location,
      code: { clarifyType = [], issueStatus = [] },
    } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const detailsFormProps = {
      issueStatus,
      sourceNum: routerParam.bidNum,
      questionInformationHeader,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.clarifyType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 150,
        render: (val) => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.description`).d('描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.attachment`).d('附件'),
        width: 100,
        render: (val, record) => {
          return (
            <Upload
              filePreview
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationheader"
              attachmentUUID={record.attachmentUuid}
              tenantId={organizationId}
              viewOnly
              icon="download"
            />
          );
        },
      },
    ];
    const { bidNum, quotationHeaderId, bidTitle, supplierCompanyId, bidHeaderId } =
      routerParam || {};
    const searchData = queryString.stringify({
      bidNum,
      quotationHeaderId,
      bidTitle,
      supplierCompanyId,
      bidHeaderId,
      flag: 2,
    });
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.questionDetails`).d('问题详情')}
          backPath={`/ssrc/supplier-bid-query/question-answer/${routerParam.quotationHeaderId}?${searchData}`}
        />
        <Content>
          <Spin spinning={informationLoading} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['questionInformation', 'myQuestion']}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                key="questionInformation"
                header={
                  <Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.panel.info`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('questionInformation')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('questionInformation') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <DetailsForm {...detailsFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                key="myQuestion"
                header={
                  <Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.panel.myQue`).d('我的问题')}</h3>
                    <a>
                      {collapseKeys.includes('myQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('myQuestion') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <Table
                  bordered
                  onChange={this.handleQuestionRows}
                  loading={tableLoading}
                  columns={columns}
                  dataSource={questionRowsList.content}
                  pagination={questionRowsPagination}
                />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
