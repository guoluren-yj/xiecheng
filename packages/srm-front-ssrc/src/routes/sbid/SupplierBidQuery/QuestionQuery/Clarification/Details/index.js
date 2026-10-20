/**
 * Details - 澄清函详情页
 * @date: 2019-6-19
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Fragment } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { valueMapMeaning } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import classnames from 'classnames';
import { Collapse, Icon, Table, Spin, Popover } from 'hzero-ui';
import queryString from 'querystring';
import { PRIVATE_BUCKET } from '_utils/config';
import { replacePrivateBucket } from '@/utils/utils';
import DetailsForm from './DetailsForm';

const { Panel } = Collapse;

const promptCode = 'ssrc.supplierBidQuery';

@connect(({ supplierBidQuery, loading }) => ({
  supplierBidQuery,
  code: supplierBidQuery.code,
  clarificationDetails: supplierBidQuery.clarificationDetails,
  clarificationQuestionList: supplierBidQuery.clarificationQuestionList,
  clarificationQuestionPagination: supplierBidQuery.clarificationQuestionPagination,
  detailsLoading: loading.effects['supplierBidQuery/fetchClarificationDetails'],
  tableLoading: loading.effects['supplierBidQuery/fetchClarificationQuestion'],
}))
export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['questionInformation', 'clarificationContent'], // 打开的折叠面板key
    };
  }

  componentDidMount() {
    const { clarificationQuestionPagination } = this.props;
    this.handleClarificationDetails();
    this.handleClarificationQuestion(clarificationQuestionPagination);
    this.fetchStatusvalues();
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
   * 查询状态值集
   */
  @Bind()
  fetchStatusvalues() {
    const { dispatch } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE',
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: 'supplierBidQuery/batchCode',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 澄清函详情
   */
  @Bind()
  handleClarificationDetails() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'supplierBidQuery/fetchClarificationDetails',
      payload: {
        clarifyId: match.params.clarifyId,
      },
    });
  }

  /**
   * 澄清函引用问题
   */
  @Bind()
  handleClarificationQuestion(page = {}) {
    const { dispatch, match, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    dispatch({
      type: 'supplierBidQuery/fetchClarificationQuestion',
      payload: {
        page,
        clarifyId: match.params.clarifyId,
        sourceId: routerParam.bidHeaderId,
        sourceType: 'BID',
      },
    });
  }

  render() {
    const { collapseKeys } = this.state;
    const {
      location,
      tableLoading,
      detailsLoading,
      clarificationDetails,
      clarificationQuestionList = {},
      clarificationQuestionPagination = {},
      code: { clarifyType = [], clarifyStatus = [] },
    } = this.props;
    const newContext = replacePrivateBucket(clarificationDetails?.context);
    const routerParam = queryString.parse(location.search.substr(1));
    const detailsFormProps = {
      clarifyStatus,
      clarificationDetails,
    };
    const uploadProps = {
      filePreview: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-bid-header',
      btnText: intl.get('hzero.common.upload.view').d('查看附件'),
      btnProps: { icon: 'paper-clip' },
      attachmentUUID: clarificationDetails && clarificationDetails.attachmentUuid,
      viewOnly: true,
      showFilesNumber: false,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.questionNo`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.questionType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 100,
        render: (val) => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.questionDes`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.submitDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
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
          title={intl.get(`${promptCode}.view.message.title.clarifyDet`).d('澄清函详情')}
          backPath={`/ssrc/supplier-bid-query/question-answer/${routerParam.quotationHeaderId}?${searchData}`}
        >
          <UploadModal {...uploadProps} />
        </Header>
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
                key="questionInformation"
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.clarifyInfo`).d('澄清函基本信息')}
                    </h3>
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
                key="clarificationContent"
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.clarifyCont`).d('澄清函正文')}
                    </h3>
                    <a>
                      {collapseKeys.includes('clarificationContent')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('clarificationContent') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <div
                  style={{ 'min-height': '200px', padding: '16px' }}
                  dangerouslySetInnerHTML={{ __html: newContext }}
                />
              </Panel>
              <Panel
                showArrow={false}
                key="referenceQuestion"
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.lineQuestion`).d('关联问题')}
                    </h3>
                    <a>
                      {collapseKeys.includes('referenceQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('referenceQuestion') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <Table
                  bordered
                  columns={columns}
                  onChange={this.handleClarificationQuestion}
                  pagination={clarificationQuestionPagination}
                  dataSource={clarificationQuestionList.content}
                />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
