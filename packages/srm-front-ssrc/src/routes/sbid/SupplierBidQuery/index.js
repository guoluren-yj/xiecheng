/**
 * Recommend - 投标查询-列表
 * @date: 2019-05-18
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Table, Popover } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';
import querystring from 'querystring';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { asyncPageFetchList } from '@/utils/utils';
import FilterForm from './FilterForm';
import PretrialApplicationModal from '../SupplierBid/PretrialApplicationModal';

const promptCode = 'ssrc.supplierBidQuery';

@connect(({ supplierBidQuery, loading }) => ({
  supplierBidQuery,
  Loading: loading.effects['supplierBidQuery/fetchBidQueryList'],
  selectPreApplyLoading: loading.effects['supplierBidQuery/fetchPretrialApplication'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['ssrc.supplierBidQuery'],
})
@Form.create({ fieldNameProp: null })
export default class Supplierquotation extends Component {
  form;

  state = {
    preApplyModalVisible: false,
    prequalOnlyRead: false,
  };

  componentDidMount() {
    this.querySupplier();
  }

  /**
   * 供应商投标查询
   */
  @Bind()
  querySupplier() {
    const {
      dispatch,
      supplierBidQuery: { bidQueryPagination = {} },
    } = this.props;
    this.handleSearch(bidQueryPagination);
    const lovCodes = {
      inquiryMethod: 'SSRC.SOURCE_METHOD', // 询价方式
      biddingDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 投标方向
      bidStatus: 'SSRC.BID_STATUS', // 招标单状态
      reviewMethod: 'SSRC.REVIEW_METHOD', // 审查方式
      bidType: 'SSRC.BID_TYPE', // 招标类别
    };
    dispatch({
      type: 'supplierBidQuery/batchCode',
      payload: { lovCodes },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 点击投标单号
   */
  @Bind()
  onBidNum(record) {
    const { dispatch } = this.props;
    const { quotationHeaderId, subjectMatterRule = '' } = record;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/supplier-bid-query/bid-detail/${quotationHeaderId}`,
        search: querystring.stringify({
          subjectMatterRule,
        }),
      })
    );
  }

  /**
   * 点击招标单号
   */
  @Bind()
  onTenderNum(record) {
    const { dispatch } = this.props;
    const { bidHeaderId, quotationHeaderId, subjectMatterRule = '', supplierCompanyId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/supplier-bid-query/tender-detail/${bidHeaderId}/${supplierCompanyId}`,
        search: querystring.stringify({
          quotationHeaderId,
          subjectMatterRule,
        }),
      })
    );
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['quotationEndDateFrom', 'quotationDateFrom'];
    const timeToArray = ['quotationEndDateTo', 'quotationDateTo'];
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
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  async handleSearch(page = {}, pageChangeFlag = false) {
    const {
      dispatch,
      organizationId,
      supplierBidQuery: { bidQueryOldTotalElements: oldTotalElements },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    const commonPayload = {
      page,
      ...handleFormValues,
      organizationId,
    };
    const fetchBidQueryList = (payload) => {
      return dispatch({
        type: 'supplierBidQuery/fetchBidQueryList',
        payload,
      });
    };

    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchBidQueryList,
    });
  }

  /**
   * 预审申请数据获取
   * @param {String} bidHeaderId -招标单头id
   */
  @Bind()
  fetchPretrialApplicationData(bidHeaderId) {
    const { organizationId, dispatch } = this.props;
    dispatch({
      type: 'supplierBidQuery/fetchPretrialApplication',
      payload: {
        organizationId,
        bidHeaderId,
      },
    });
  }

  /**
   * 打开资格预审弹框
   * @param {obj} record - table的行记录
   */
  @Bind()
  openPretrialApplicationModal(record) {
    this.fetchPretrialApplicationData(record.bidHeaderId);
    this.setState({
      prequalOnlyRead: false,
      bidHeaderId: record.bidHeaderId,
      supplierCompanyId: record.supplierCompanyId,
      preApplyModalVisible: true,
    });
  }

  /** 关闭模态框时清楚model中的数据 */
  @Bind()
  clearPretrialApplicationData() {
    this.props.dispatch({
      type: 'supplierBidQuery/updateState',
      payload: {
        fetchPretrialApplicationData: {},
      },
    });
  }

  /**
   * 跳转查看中标公告
   *
   * @param {*} record
   */
  @Bind()
  viewAcceptBidNotice(record) {
    // const { dispatch } = this.props;
    const search = querystring.stringify({
      sourceHeaderId: record.bidHeaderId,
      backRecommend: 'recommend',
    });
    // dispatch(
    //   routerRedux.push({
    //     pathname: `/ssrc/supplier-bid-query/accept-bid-notice`,
    //     search,
    //   })
    // );
    parent.openTab({
      key: `/ssrc/bid-hall/accept-bid-notice-detail`,
      path: `/ssrc/bid-hall/accept-bid-notice-detail`,
      // title: intl.get(`ssrc.acceptBidNotice.view.message.title.acceptNotice`).d('中标公告'),
      title: 'srm.common.tab.title.ssrc.acceptNotice',
      closable: true,
      search,
    });
  }

  render() {
    const {
      Loading,
      organizationId,
      supplierBidQuery: {
        code,
        dispatch,
        selectPreApplyLoading,
        bidQueryList = [],
        bidQueryPagination = {},
        fetchPretrialApplicationData,
      },
    } = this.props;
    const { preApplyModalVisible, supplierCompanyId, bidHeaderId, prequalOnlyRead } = this.state;
    const pretrialApplicationModalProps = {
      bidHeaderId,
      supplierCompanyId,
      organizationId,
      selectPreApplyLoading,
      visible: preApplyModalVisible,
      onlyRead: prequalOnlyRead,
      reviewMethodValues: code.reviewMethod,
      onClear: this.clearPretrialApplicationData,
      onClose: () => this.setState({ preApplyModalVisible: false }),
      formData: fetchPretrialApplicationData,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.quotationStatus`).d('投标状态'),
        dataIndex: 'quotationStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.RFxNo.`).d('投标编号'),
        dataIndex: 'quotationNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.onBidNum(record)}>{val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.resultPublic`).d('结果公示'),
        dataIndex: 'bidStatus',
        width: 100,
        render: (_, record) => {
          return (
            <div>
              {record.bidStatus === 'FINISHED' &&
                record.noticeStatus === 'RELEASE' &&
                record.visibleRangeType === 'WINNER' &&
                record.suggestedFlag === '1' && (
                  <a onClick={() => this.viewAcceptBidNotice(record)}>
                    {intl
                      .get(`ssrc.supplierBidQuery.model.supplierBidQuery.acceptBidNotice`)
                      .d('中标公告')}
                  </a>
                )}
              {record.bidStatus === 'FINISHED' &&
                record.noticeStatus === 'RELEASE' &&
                record.visibleRangeType === 'PARTICIPATE' && (
                  <a onClick={() => this.viewAcceptBidNotice(record)}>
                    {intl
                      .get(`ssrc.supplierBidQuery.model.supplierBidQuery.acceptBidNotice`)
                      .d('中标公告')}
                  </a>
                )}
              {record.bidStatus === 'FINISHED' &&
                record.noticeStatus === 'RELEASE' &&
                record.visibleRangeType === 'ALL' && (
                  <a onClick={() => this.viewAcceptBidNotice(record)}>
                    {intl
                      .get(`ssrc.supplierBidQuery.model.supplierBidQuery.acceptBidNotice`)
                      .d('中标公告')}
                  </a>
                )}
            </div>
          );
        },
        // record.bidStatus === 'FINISHED' && record.noticeStatus === 'RELEASE' ? (
        // <a onClick={() => this.viewAcceptBidNotice(record)}>
        //   {intl
        //     .get(`ssrc.supplierBidQuery.model.supplierBidQuery.acceptBidNotice`)
        //     .d('中标公告')}
        // </a>
        // ) : (
        //   ''
        // ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.bidTitle`).d('招标事项'),
        dataIndex: 'bidTitle',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.customer`).d('客户'),
        dataIndex: 'companyName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.company`).d('公司'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.tenderType`).d('招标类型'),
        dataIndex: 'bidTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.tenderMethod`).d('招标方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.EndDate`).d('投标截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.bidNum`).d('招标编号'),
        dataIndex: 'bidNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.onTenderNum(record)}>{val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.releasedDate`).d('发布时间'),
        dataIndex: 'releasedDate',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.quotedDate`).d('投标时间'),
        dataIndex: 'quotedDate',
        width: 150,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 400);
    const filterProps = {
      dispatch,
      code,
      onRef: this.handleRef,
      onConditional: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.tenderInquiry`).d('投标查询')} />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            scroll={{ x: scrollWidth }}
            dataSource={bidQueryList}
            pagination={bidQueryPagination}
            rowKey="recordId"
            loading={Loading}
            columns={columns}
            bordered
            onChange={(page) => this.handleSearch(page, true)}
          />
          <PretrialApplicationModal {...pretrialApplicationModalProps} />
        </Content>
      </React.Fragment>
    );
  }
}
