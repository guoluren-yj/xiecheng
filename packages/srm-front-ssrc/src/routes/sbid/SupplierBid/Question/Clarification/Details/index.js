/**
 * Details - 澄清函详情页
 * @date: 2019-6-19
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import formatterCollections from 'utils/intl/formatterCollections';
import { valueMapMeaning } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { Collapse, Icon, Table, Spin } from 'hzero-ui';
import queryString from 'querystring';
import classnames from 'classnames';
import { replacePrivateBucket } from '@/utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import DetailsForm from './DetailsForm';

const { Panel } = Collapse;

const promptCode = 'ssrc.supplierBid';

@connect(({ supplierBid, loading }) => ({
  supplierBid,
  code: supplierBid.code,
  clarificationDetails: supplierBid.clarificationDetails,
  clarificationQuestionList: supplierBid.clarificationQuestionList,
  clarificationQuestionPagination: supplierBid.clarificationQuestionPagination,
  detailsLoading: loading.effects['supplierBid/fetchClarificationDetails'],
  tableLoading: loading.effects['supplierBid/fetchClarificationQuestion'],
}))
@formatterCollections({ code: ['ssrc.supplierBid', 'ssrc.common'] })
export default class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bidHeaderId: null, // 招标头id
      quotationHeaderId: null, // 投标头id
      supplierCompanyId: null, // 供应商公司id
      collapseKeys: ['questionInformation', 'clarificationContent'], // 打开的折叠面板key
    };
  }

  componentDidMount() {
    const { clarificationQuestionPagination, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    this.setState({
      bidHeaderId: routerParam.bidHeaderId,
      quotationHeaderId: routerParam.quotationHeaderId,
      supplierCompanyId: routerParam.supplierCompanyId,
    });
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
      clarifyType: 'SSRC.CLARIFY_TYPE', // 问题澄清类型值集
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: 'supplierBid/batchCode',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 澄清函详情
   */
  @Bind()
  handleClarificationDetails(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'supplierBid/fetchClarificationDetails',
      payload: {
        clarifyId: match.params.clarifyId,
        page,
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
      type: 'supplierBid/fetchClarificationQuestion',
      payload: {
        page,
        clarifyId: match.params.clarifyId,
        sourceId: routerParam.bidHeaderId,
        supplierCompanyId: routerParam.supplierCompanyId,
        sourceType: 'BID',
      },
    });
  }

  render() {
    const {
      tableLoading,
      detailsLoading,
      clarificationDetails,
      clarificationQuestionList = {},
      clarificationQuestionPagination = {},
      code: { clarifyType = [], clarifyStatus = [] },
      location,
    } = this.props;
    const { bidHeaderId, quotationHeaderId, supplierCompanyId, collapseKeys } = this.state;
    const newContext = replacePrivateBucket(clarificationDetails?.context);
    const routerParam = queryString.parse(location.search.substr(1));
    const { tenantId, bidNum } = routerParam || {};

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
    const detailsFormProps = {
      clarifyStatus,
      clarificationDetails,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionNo`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 100,
        render: (val) => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionDescription`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionSubmitDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
    ];
    const searchData = queryString.stringify({
      tenantId,
      quotationHeaderId,
      supplierCompanyId,
      bidHeaderId,
      flag: 2,
      bidNum,
    });
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.clarificationDetails`).d('澄清函详情')}
          backPath={`/ssrc/supplier-bid-hall/question-list/${bidHeaderId}?${searchData}`}
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
                      {intl
                        .get(`${promptCode}.view.message.panel.clarifyHeader`)
                        .d('澄清函基本信息')}
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
                      {intl.get(`${promptCode}.view.message.panel.clarifyMain`).d('澄清函正文')}
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
                    <h3>{intl.get(`${promptCode}.view.message.lineQuestion`).d('关联问题')}</h3>
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
                  rowKey="detailsId"
                  bordered
                  columns={columns}
                  pagination={clarificationQuestionPagination}
                  dataSource={clarificationQuestionList.content}
                  onChange={this.handleClarificationQuestion}
                />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
