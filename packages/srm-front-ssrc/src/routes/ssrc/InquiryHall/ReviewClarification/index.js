/**
 * 澄清通知入口页面
 * @date: 2019-08-14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Spin, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import querystring from 'querystring';
import remote from 'hzero-front/lib/utils/remote';

import { Header, Content } from 'components/Page';
import { getActiveTabKey } from 'utils/menuTab';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchSupplierInfo, rfFetchHeader } from '@/services/expertScoringService';
import { fetchHeaderInfo } from '@/services/inquiryHallService';
import { fetchInquiryHeaderDetail } from '@/services/bidHallService';

import styles from './index.less';
import FilterForm from './FilterForm';
import TableList from './TableList';

/**
 *  SSRC.REPLY_STATUS 值集相关
 */
const organizationId = getCurrentOrganizationId();
class ReviewClarification extends Component {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    const { sourceFrom = '', sourceHeaderId = 0, quotationHeaderId = 0 } = routerParams;
    this.state = {
      sourceFrom,
      sourceHeaderId,
      display: false,
      quotationHeaderId,
      bidHeaderId: sourceHeaderId,
      supplierInfoObj: {}, // 评审澄清供应商信息
      sourceHeaderInfoObj: {}, // 采购方头信息 sourceTitle: '', // 单号name  sourceNum: '', // 单号num
    };
  }

  static getDerivedStateFromProps(nextProps, preState) {
    const routerParam = querystring.parse(nextProps.location.search.substr(1));
    const { sourceFrom = '', sourceHeaderId = 0, quotationHeaderId = 0 } = routerParam;
    if (
      // title !== preState.title ||
      sourceFrom !== preState.sourceFrom ||
      sourceHeaderId !== preState.sourceHeaderId ||
      quotationHeaderId !== preState.quotationHeaderId
    ) {
      return {
        // title,
        sourceFrom,
        sourceHeaderId,
        quotationHeaderId,
      };
    }
    return null;
  }

  componentDidUpdate(_, preState) {
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    const { sourceFrom = '', sourceHeaderId = 0, quotationHeaderId = 0 } = routerParam;
    if (
      // title !== preState.title ||
      sourceFrom !== preState.sourceFrom ||
      sourceHeaderId !== preState.sourceHeaderId ||
      quotationHeaderId !== preState.quotationHeaderId
    ) {
      this.handleSearch();
      this.batchCode();
      this.fetchSupplierInfo();
    }
  }

  componentDidMount() {
    this.handleSearch();
    this.batchCode();
    this.fetchSupplierInfo();
  }

  /**
   * 查询供应商信息
   */
  @Bind()
  fetchSupplierInfo() {
    const { quotationHeaderId, sourceFrom } = this.state;
    if (!quotationHeaderId) {
      this.fetchHeaderInfo();
      return;
    }
    fetchSupplierInfo({
      quotationHeaderId,
      clarifyIssueSourceFrom: sourceFrom,
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          supplierInfoObj: res,
        });
      }
    });
  }

  /**
   * 查询 询价/招标/征询 头信息
   */
  @Bind()
  fetchHeaderInfo() {
    const { sourceHeaderId, sourceFrom } = this.state;
    if (!sourceHeaderId) return;

    // RFP/RFI 暂不需要
    if (sourceFrom === 'RFP' || sourceFrom === 'RFI') {
      rfFetchHeader({
        organizationId,
        rfHeaderId: sourceHeaderId,
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            sourceHeaderInfoObj: {
              sourceNum: res.rfNum,
              sourceTitle: res.rfTitle,
            },
          });
        }
      });
    } else if (sourceFrom === 'RFX') {
      fetchHeaderInfo({
        organizationId,
        rfxHeaderId: sourceHeaderId,
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            sourceHeaderInfoObj: {
              sourceNum: res.rfxNum,
              sourceTitle: res.rfxTitle,
            },
          });
        }
      });
    } else {
      fetchInquiryHeaderDetail({
        organizationId,
        bidHeaderId: sourceHeaderId,
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            sourceHeaderInfoObj: {
              sourceNum: res.bidNum,
              sourceTitle: res.bidTitle,
            },
          });
        }
      });
    }
  }

  /**
   * 获取值集
   */
  @Bind()
  batchCode() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;

    const lovCodes = {
      replayStatus: 'SSRC.REPLY_STATUS', // 回复状态
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['submittedDateFrom', 'replyEndDateFrom'];
    const timeToArray = ['submittedDateTo', 'replyEndDateTo'];
    timeFromArray.forEach((item) => {
      dealFromTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeToArray.forEach((item) => {
      dealToTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    return {
      ...filterValues,
      ...dealFromTime,
      ...dealToTime,
    };
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      location: { search },
      modelName = 'inquiryHall',
    } = this.props;
    const { quotationHeaderId, sourceFrom, sourceHeaderId } = this.state;
    const { clarifyNotifyType = '', issueFrom = '' } = querystring.parse(search);
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);

    dispatch({
      type: `${modelName}/fetchClarifyNotifyDataList`,
      payload: {
        page,
        sourceFrom,
        issueFrom,
        sourceHeaderId,
        organizationId,
        clarifyNotifyType,
        quotationHeaderId: quotationHeaderId || 0,
        ...handleFormValues,
      },
    });
  }

  /**
   * 新建
   */
  @Bind()
  create() {
    const {
      history,
      location: { pathname = '', search: pathParams = '' },
    } = this.props;
    const { quotationHeaderId, bidHeaderId, sourceFrom } = this.state;
    const { clarifyNotifyType = '', issueFrom = '' } = querystring.parse(pathParams);
    const search = querystring.stringify({
      sourceFrom,
      sourceHeaderId: bidHeaderId,
      quotationHeaderId,
      clarifyNotifyType,
      issueFrom,
      backPath: `${pathname}${pathParams}`,
    });
    const routerPrefix = pathname.split('/')[2];
    const activeTabMenu = getActiveTabKey();
    const pathRouterName =
      routerPrefix !== 'inquiry-hall'
        ? `${activeTabMenu}/${
            clarifyNotifyType === 'SOURCE' ? 'source-' : 'rfx-'
          }review-clarification-create`
        : `${activeTabMenu}/${clarifyNotifyType ? 'rfx-' : ''}review-clarification-create`;

    history.push({
      pathname: pathRouterName,
      search,
    });
  }

  render() {
    const {
      modelName = 'inquiryHall',
      [modelName]: {
        code: { replayStatus = [] },
        clarifyNotifyDataListPagination,
        clarifyNotifyDataList: dataSource = [],
      },
      history,
      bidStatus = [],
      isLoading = true,
      sourceMethod = [],
      quotationType = [],
      auctionDirection = [],
      location: { pathname, search = '' },
      remote: clarificationRemote,
    } = this.props;
    const {
      quotationHeaderId,
      sourceHeaderId,
      sourceFrom,
      supplierInfoObj: { supplierCompanyNum, supplierCompanyName } = {},
      sourceHeaderInfoObj: { sourceNum, sourceTitle } = {},
    } = this.state;
    const formProps = {
      bidStatus,
      sourceMethod,
      quotationType,
      auctionDirection,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
      replayStatus,
    };
    const routerParams = querystring.parse(search.substr(1));
    const { backPath = '', issueFrom, clarifyNotifyType, isReadOnly = 'N' } = routerParams;
    const tableProps = {
      search,
      history,
      pathname,
      isLoading,
      sourceFrom,
      issueFrom,
      dataSource,
      isReadOnly,
      sourceHeaderId,
      quotationHeaderId,
      clarifyNotifyType,
      onChange: this.handleSearch,
      pagination: clarifyNotifyDataListPagination,
      remote: clarificationRemote,
    };
    // 若不存在quotationHeaderId，则从采购方进入
    const renderTitle = quotationHeaderId ? (
      <>
        {supplierCompanyNum ? `${supplierCompanyNum}-` : ''}
        {supplierCompanyName && supplierCompanyName.length > 20 ? (
          <Popover content={supplierCompanyName}>
            {`${supplierCompanyName.substr(0, 20)}...`}
          </Popover>
        ) : (
          supplierCompanyName ?? ''
        )}
      </>
    ) : (
      <>
        {sourceNum ? `${sourceNum}-` : ''}
        {sourceTitle && sourceTitle.length > 20 ? (
          <Popover content={sourceTitle}>{`${sourceTitle.substr(0, 20)}...`}</Popover>
        ) : (
          sourceTitle ?? ''
        )}
      </>
    );
    return (
      <div>
        <Header
          title={
            isReadOnly === 'Y'
              ? intl.get(`ssrc.inquiryHall.view.message.button.reviewClarify`).d('评审澄清')
              : clarifyNotifyType !== 'SOURCE'
              ? intl.get(`ssrc.inquiryHall.view.message.title.reviewClarimange`).d('评审澄清管理')
              : intl
                  .get(`ssrc.inquiryHall.view.message.title.sourcing.problem.manage`)
                  .d('寻源问题管理')
          }
          backPath={backPath}
        >
          {isReadOnly === 'Y' ? null : (
            <Button type="primary" icon="plus" onClick={this.create}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
        </Header>
        <Content>
          <h3 className={styles.title}>{renderTitle}</h3>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <Spin spinning={false}>
            <TableList {...tableProps} />
          </Spin>
        </Content>
      </div>
    );
  }
}

const HOCComponent = (Comp) => {
  return formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })(
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      isLoading: loading.effects['inquiryHall/fetchClarifyNotifyDataList'],
      modelName: 'inquiryHall',
    }))(
      remote({
        code: 'SSRC_REVIEW_CLARIFICATION',
      })(Comp)
    )
  );
};

export default HOCComponent(ReviewClarification);
export { HOCComponent, ReviewClarification };
