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
import queryString from 'querystring';
import Upload from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import { Collapse, Icon, Table, Spin, Popover } from 'hzero-ui';
import classnames from 'classnames';
import { PRIVATE_BUCKET } from '_utils/config';
import { noop } from 'lodash';

import { isPubPage, getTabKey } from '@/utils/utils';
import { BID, INQUIRY } from '@/utils/globalVariable';

import { getQueUpdateDetailCode } from '../../utils/util';
import DetailsForm from './DetailsForm';

const organizationId = getCurrentOrganizationId();

const { Panel } = Collapse;

const promptCode = 'ssrc.supplierQuotation';

class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['questionInformation', 'myQuestion'], // 打开的折叠面板key
    };
    this.activeTabKey = getTabKey();
    this.bidFlag = props.sourceKey === BID; // 招标标识
  }

  componentDidMount() {
    const { dispatch, questionRowsPagination, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    // 问题头信息查询
    dispatch({
      type: 'supplierQuotation/fetchQuestionHeader',
      payload: {
        issueHeaderId: routerParam.issueHeaderId,
      },
    });
    this.handleTableChange(questionRowsPagination);
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
      issueStatus: 'SSRC.ISSUE_STATUS',
    };
    dispatch({
      type: 'supplierQuotation/batchCode',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 问题行信息查询
   */
  @Bind()
  handleTableChange(page = {}) {
    const { dispatch, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    dispatch({
      type: 'supplierQuotation/fetchQuestionRows',
      payload: {
        page,
        issueHeaderId: routerParam.issueHeaderId,
        customizeUnitCode: getQueUpdateDetailCode(this.bidFlag)?.tableCode,
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
      match: { path = null },
      customizeTable = noop,
    } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { tenantId } = routerParam || {};
    const { sourceFrom } = routerParam;
    const detailsFormProps = {
      questionInformationHeader,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supQuo.lineNo`).d('行号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.clarificationType`).d('澄清类型'),
        dataIndex: 'clarifyTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.description`).d('描述'),
        dataIndex: 'description',
        width: 400,
        render: (val) => (
          <Popover overlayStyle={{ maxWidth: 600 }} placement="topLeft" content={val}>
            {val}
          </Popover>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.attachment`).d('附件'),
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
    const searchData = queryString.stringify({
      title: routerParam.title,
      quotationHeaderId: routerParam.quotationHeaderId,
      supplierCompanyId: routerParam.supplierCompanyId,
      sourceFrom: routerParam.sourceFrom,
      sourceHeaderId: routerParam.rfxHeaderId,
      tenantId,
      flag: 2,
    });
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.questionDetails`).d('问题详情')}
          backPath={isPubPage(path, `${this.activeTabKey}/review-clarification?${searchData}`)}
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
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.basicInfoHeader`).d('基本信息')}
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
                key="myQuestion"
                header={
                  <Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.panel.myQuestion`).d('我的问题')}</h3>
                    <a>
                      {collapseKeys.includes('myQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('myQuestion') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                {customizeTable(
                  {
                    code: getQueUpdateDetailCode(this.bidFlag)?.tableCode,
                  },
                  <Table
                    bordered
                    loading={tableLoading}
                    columns={
                      sourceFrom === 'RFX'
                        ? columns
                        : columns.filter((ele) => ele.dataIndex !== 'clarifyTypeMeaning')
                    }
                    dataSource={questionRowsList}
                    pagination={questionRowsPagination}
                    onChange={this.handleTableChange}
                  />
                )}
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

const hocComponent = (Comp, pageSymbol = INQUIRY) => {
  return withCustomize({
    unitCode: Object.values(getQueUpdateDetailCode(pageSymbol === BID)),
  })(
    connect(({ supplierQuotation, loading }) => ({
      supplierQuotation,
      code: supplierQuotation.code,
      informationLoading: loading.effects['supplierQuotation/fetchQuestionHeader'],
      tableLoading: loading.effects['supplierQuotation/fetchQuestionRows'],
      questionInformationHeader: supplierQuotation.questionInformationHeader,
      questionRowsList: supplierQuotation.questionRowsList,
      questionRowsPagination: supplierQuotation.questionRowsPagination,
      sourceKey: pageSymbol,
    }))(Comp)
  );
};

export default hocComponent(Details);

export { Details, hocComponent };
