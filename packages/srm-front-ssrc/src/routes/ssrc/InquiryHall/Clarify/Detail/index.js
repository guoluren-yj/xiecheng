/**
 * Detail - 澄清函详情入口
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Collapse, Icon, Spin, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { compose } from 'lodash';
import classnames from 'classnames';
import querystring from 'querystring';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { getActiveTabKey, openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';

import { INQUIRY } from '@/utils/globalVariable';
import { updateCollapseActiveKeys } from '@/utils/handleCustomize.js';
import { getClarifyDetailCode } from '../utils/util';
import ClarifyContent from './clarifyContent';
import ClarificationTable from './clarifyQuestion';
import ClarifyHeaderFrom from './clarifyHeaderFrom';

const { Panel } = Collapse;

class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfo', 'clarifyContent'], // 打开的折叠面板key
    };
    this.sourceKey = props.sourceKey; //  招标标识

    this.delayTimer = null;
  }

  routerActiveTabKey = getActiveTabKey().includes('/pub')
    ? getActiveTabKey().split('/').slice(0, 4).join('/')
    : getActiveTabKey().split('/').slice(0, 3).join('/');

  componentDidMount() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      [modelName]: { clarificationQuestionPagination = {} },
    } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
    this.fetchDetail();
    this.handleClarificationQuestion(clarificationQuestionPagination);
    this.delayHandleCustom();
  }

  // 卸载阶段清空数据
  componentWillUnmount() {
    const { modelName = 'inquiryHall', dispatch } = this.props;

    this.cancelTimer();
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        clarificationDetails: {},
        clarificationQuestionList: [],
        clarificationQuestionPagination: {},
      },
    });
  }

  cancelTimer = () => {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  };

  delayHandleCustom = () => {
    this.delayTimer = setTimeout(() => {
      this.handleCollapseActiveKeys();
    }, 500);
  };

  // collapse
  handleCollapseActiveKeys = () => {
    const { custConfig } = this.props;
    const { collapseKeys } = this.state;

    const { tenantChangeFlag, newKeys = [] } =
      updateCollapseActiveKeys({
        custConfig,
        oldKeys: collapseKeys,
        code: getClarifyDetailCode(this.sourceKey)?.collapseCode,
      }) || {};

    if (tenantChangeFlag) {
      this.setState({
        collapseKeys: newKeys,
      });
    }
  };

  /**
   * 查询详情页面行信息
   */
  @Bind()
  fetchDetail() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;

    dispatch({
      type: `${modelName}/fetchClarifyDetail`,
      payload: {
        organizationId,
        clarifyId: params.clarifyId,
        customizeUnitCode: getClarifyDetailCode(this.sourceKey)?.baseFormCode,
      },
    });
  }

  /**
   * 澄清函引用问题
   */
  @Bind()
  handleClarificationQuestion(page = {}) {
    const { dispatch, match, organizationId, location, modelName = 'inquiryHall' } = this.props;
    const { sourceCategory } = querystring.parse(location.search.substr(1));
    dispatch({
      type: `${modelName}/fetchClarifyReferIssue`,
      payload: {
        page,
        organizationId,
        clarifyId: match.params.clarifyId,
        sourceId: match.params.sourceId,
        sourceType: ['RFQ', 'RFA'].includes(sourceCategory) ? 'RFX' : sourceCategory,
        customizeUnitCode: getClarifyDetailCode(this.sourceKey)?.tableCode,
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

  @Bind()
  getBackPath() {
    const {
      location: { search = {} },
      match: { params },
    } = this.props;
    const {
      current,
      createFlag,
      sourceCategory,
      isReadOnly,
      externalBackPath = '',
    } = querystring.parse(search.substr(1));
    const back = `${this.routerActiveTabKey}/inter-question/${params.sourceId}/${params.rfxNum}/sourceTitle/${params.companyId}/2?current=${current}&createFlag=${createFlag}&sourceCategory=${sourceCategory}&isReadOnly=${isReadOnly}&externalBackPath=${externalBackPath}`;
    return back;
  }

  @Bind()
  goBack() {
    const {
      location: { search = {} },
      match: { params },
    } = this.props;
    const {
      current,
      createFlag,
      sourceCategory,
      isReadOnly,
      externalBackPath = '',
    } = querystring.parse(search.substr(1));
    const searchProps = querystring.stringify({
      createFlag,
      current,
      sourceCategory,
      isReadOnly,
      externalBackPath,
    });
    openTab(
      {
        key: `${this.routerActiveTabKey}/inter-question/${params.sourceId}/${params.rfxNum}/sourceTitle/${params.companyId}/2`,
        path: `${this.routerActiveTabKey}/inter-question/${params.sourceId}/${params.rfxNum}/sourceTitle/${params.companyId}/2`,
        // title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionAnswer`).d('澄清答疑'),
        title: 'srm.common.tab.title.ssrc.questionAnswer',
        closable: true,
        search: searchProps,
      },
      {
        closeCurrent: true,
      }
    );
  }

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: {
        code: { clarifyStatus = [], clarifyType = [] },
        clarificationDetails = {},
        clarificationQuestionList = [],
        clarificationQuestionPagination = {},
      },
      form,
      detailsLoading,
      tableLoading,
      organizationId,
      location,
      customizeTable,
      customizeForm,
      customizeCollapse,
    } = this.props;
    const { sourceCategory, isReadOnly } = querystring.parse(location.search.substr(1));

    const { collapseKeys } = this.state;
    const detailFormProps = {
      form,
      organizationId,
      customizeForm,
      unitCode: getClarifyDetailCode(this.sourceKey)?.baseFormCode,
      dataSource: clarificationDetails,
      clarifyStatusLov: clarifyStatus,
    };
    const clarificationTableProps = {
      customizeTable,
      organizationId,
      Loading: tableLoading,
      fetchClarList: clarificationQuestionList,
      fetchClarListPagination: clarificationQuestionPagination,
      clarifyType,
      sourceCategory,
      sourceKey: this.sourceKey,
      onChange: this.handleClarificationQuestion,
    };

    const contentCollapseDom = (
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
                {intl.get(`ssrc.clarify.view.message.title.detail.clarifyContent`).d('澄清函正文')}
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
                {isReadOnly === 'Y'
                  ? intl
                      .get(`ssrc.inquiryHall.view.message.title.detail.viewLineQuestion`)
                      .d('供应商问题')
                  : intl.get(`ssrc.clarify.view.message.title.detail.lineQuestion`).d('关联问题')}
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
    );

    return (
      <React.Fragment>
        <Header
          backPath={this.getBackPath()}
          title={
            isReadOnly === 'Y'
              ? intl.get(`ssrc.inquiryHall.view.message.title.viewClarifyDetail`).d('澄清函')
              : intl.get(`ssrc.clarify.view.message.title.detail.clarifyDetail`).d('澄清函详情')
          }
          customBack={getActiveTabKey().indexOf('clarification-letter') > -1 ? this.goBack : null}
        />
        <Content>
          <Spin
            spinning={detailsLoading || tableLoading}
            wrapperClassName={classnames('ued-detail-wrapper')}
          >
            {customizeCollapse(
              {
                code: getClarifyDetailCode(this.sourceKey)?.collapseCode,
              },
              contentCollapseDom
            )}
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

const Hooc = (Com, pageSymbol = INQUIRY) => {
  return compose(
    withCustomize({
      unitCode: Object.values(getClarifyDetailCode(pageSymbol)),
    }),
    formatterCollections({
      code: ['ssrc.clarify', 'ssrc.common', 'ssrc.inquiryHall'],
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      detailsLoading: loading.effects['inquiryHall/fetchClarifyDetail'],
      tableLoading: loading.effects['inquiryHall/fetchClarifyReferIssue'],
      organizationId: getCurrentOrganizationId(),
    })),
    Form.create({ fieldNameProp: null })
  )(Com);
};

export default Hooc(Detail);
export { Detail, Hooc };
