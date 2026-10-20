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

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchSupplierInfo } from '@/services/expertScoringService';

import styles from './index.less';
import FilterForm from './FilterForm';
import TableList from './TableList';

/**
 *  SSRC.REPLY_STATUS 值集相关
 */
const organizationId = getCurrentOrganizationId();
@formatterCollections({ code: ['ssrc.bidHall'] })
@connect(({ bidHall, loading }) => ({
  bidHall,
  isLoading: loading.effects['bidHall/fetchClarifyNotifyDataList'],
}))
export default class ReviewClarification extends Component {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1)) || {};
    this.state = {
      display: false,
      supplierInfoObj: {}, // 评审澄清供应商信息
      routerParams,
    };
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
    const { routerParams: { quotationHeaderId, sourceFrom } = {} } = this.state;
    if (!quotationHeaderId) return;
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
   * 获取值集
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;

    const lovCodes = {
      replayStatus: 'SSRC.REPLY_STATUS', // 回复状态
    };
    dispatch({
      type: 'bidHall/batchCode',
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
    const { dispatch, location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceFrom = '', sourceHeaderId = 0, quotationHeaderId = 0 } = routerParams;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);

    dispatch({
      type: 'bidHall/fetchClarifyNotifyDataList',
      payload: {
        page,
        sourceFrom,
        sourceHeaderId,
        organizationId,
        quotationHeaderId,
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
    const routerParams = querystring.parse(pathParams.substr(1));
    const { sourceFrom = 'BID', sourceHeaderId = 0, quotationHeaderId = 0 } = routerParams;
    const search = querystring.stringify({
      sourceFrom,
      sourceHeaderId,
      quotationHeaderId,
      backPath: `${pathname}${pathParams}`,
    });

    const routerPrefix = pathname.split('/')[2];
    const pathRouterName =
      routerPrefix === 'expert-scoring'
        ? '/ssrc/expert-scoring/bid-review-clarification-create'
        : '/ssrc/bid-hall/review-create';

    history.push({
      pathname: pathRouterName,
      search,
    });
  }

  render() {
    const {
      bidHall: {
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
    } = this.props;
    const { supplierInfoObj: { supplierCompanyNum, supplierCompanyName } = {} } = this.state;
    const routerParams = querystring.parse(search.substr(1));
    const {
      fromFlag = true,
      // title = '',
      sourceFrom = 'BID',
      sourceHeaderId = 0,
      quotationHeaderId = 0,
      backPath = '',
    } = routerParams;
    const formProps = {
      bidStatus,
      sourceMethod,
      quotationType,
      auctionDirection,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
      replayStatus,
    };
    const tableProps = {
      search,
      history,
      pathname,
      isLoading,
      sourceFrom,
      dataSource,
      sourceHeaderId,
      quotationHeaderId,
      onChange: this.handleSearch,
      pagination: clarifyNotifyDataListPagination,
    };
    const backData =
      Number(fromFlag) === 0
        ? `/ssrc/bid-hall/bid-evaluation/${sourceHeaderId}?sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}`
        : `/ssrc/bid-hall/bid-evaluation-proc-manage/${sourceHeaderId}?sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}`;
    const routerPrefix = pathname.split('/')[2];
    const backPage = routerPrefix === 'expert-scoring' ? backPath : backData;
    return (
      <div>
        <Header
          title={intl.get(`ssrc.bidHall.model.title.reviewClarificationManager`).d('评审澄清管理')}
          backPath={backPage}
        >
          <Button type="primary" icon="plus" onClick={this.create}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <h3 className={styles.title}>
            {supplierCompanyNum ? `${supplierCompanyNum}-` : ''}
            {supplierCompanyName && supplierCompanyName.length > 20 ? (
              <Popover content={supplierCompanyName}>
                {`${supplierCompanyName.substr(0, 20)}...`}
              </Popover>
            ) : (
              supplierCompanyName ?? ''
            )}
          </h3>

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
