/**
 * offlineResultEntry - 线下询价结果录入
 * @date: 2019-03-05
 * @author: Nemo <yingbin.jiang@hand-china.com>
 * @version: 1.0.0
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { getActiveTabKey } from 'utils/menuTab';
import remote from 'hzero-front/lib/utils/remote';

import { INQUIRY, BID, getSourceName } from '@/utils/globalVariable';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { asyncPageFetchList } from '@/utils/utils';
import FilterForm from './FilterForm';
import TableList from './TableList';
import Drawer from './Drawer';

const promptCode = 'ssrc.offlineResultEntry';
class OfflineResultEntry extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false, // 报价响应模态框
    };
  }

  sourceKey = this.props.sourceKey || INQUIRY;

  componentDidMount() {
    const {
      modelName = 'offlineResultEntry',
      dispatch,
      [modelName]: { pagination = {} },
    } = this.props;
    this.handleSearch(pagination);
    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  async handleSearch(page = {}, pageChangeFlag = false) {
    const {
      modelName = 'offlineResultEntry',
      dispatch,
      [modelName]: { oldTotalElements },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    const commonPayload = {
      page,
      ...handleFormValues,
      secondarySourceCategory: this.sourceKey === BID ? 'NEW_BID' : null,
      customizeUnitCode: `SSRC.${
        this.sourceKey === BID ? 'BID_' : ''
      }OFFLINE_RESULT_ENTRY.LIST,SSRC.${
        this.sourceKey === BID ? 'BID_' : ''
      }OFFLINE_RESULT_ENTRY.FILTER`,
    };
    const fetchRFxList = (payload) => {
      return dispatch({
        type: `${modelName}/fetchRFxList`,
        payload,
      });
    };
    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchRFxList,
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const timeFromArray = ['creationDateFrom', 'creationDateTo'];
    timeFromArray.forEach((item) => {
      if (item === 'creationDateFrom') {
        dealFromTime[item] = filterValues[item]
          ? filterValues[item].format(DATETIME_MIN)
          : undefined;
      } else if (item === 'creationDateTo') {
        dealFromTime[item] = filterValues[item]
          ? filterValues[item].format(DATETIME_MAX)
          : undefined;
      }
    });
    return {
      ...filterValues,
      ...dealFromTime,
    };
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
   * 跳转到明细页面
   */
  @Bind()
  redirectToDetail(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `${getActiveTabKey()}/detail/${record.rfxHeaderId}`,
      })
    );
  }

  /**
   * 报价响应
   */
  @Bind()
  quotationFeedBack(record) {
    const { dispatch, organizationId, modelName = 'offlineResultEntry' } = this.props;
    dispatch({
      type: `${modelName}/quotationFeedBack`,
      payload: { organizationId, rfxHeaderId: record.rfxHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({ visible: true });
      }
    });
  }

  /**
   * 报价响应-确定关闭模态框
   */
  @Bind()
  closeFeedBackModal() {
    this.setState({ visible: false });
  }

  render() {
    const {
      modelName = 'offlineResultEntry',
      customizeTable,
      customizeFilterForm,
      fetchRFxListLoading,
      fetchQuotationFeedBackLoading,
      [modelName]: {
        data = [],
        pagination = {},
        quotationFeedBackList = [],
        code: { sourceMethod = [], sourceCategory = [], auctionDirection = [], quotationType = [] },
      },
      offlineResultEntryRemote,
    } = this.props;
    const { visible = false } = this.state;
    const filterProps = {
      customizeFilterForm,
      sourceMethod,
      auctionDirection,
      sourceCategory,
      quotationType,
      sourceKey: this.sourceKey,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      customizeTable,
      sourceMethod,
      sourceCategory,
      auctionDirection,
      dataSource: data,
      pagination,
      sourceKey: this.sourceKey,
      loading: fetchRFxListLoading,
      remote: offlineResultEntryRemote,
      onChange: this.handleSearch,
      handleToDetail: this.redirectToDetail,
    };
    const drawerProps = {
      visible,
      loading: fetchQuotationFeedBackLoading,
      dataSource: quotationFeedBackList,
      onOk: this.closeFeedBackModal,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.title.commonOfflineEntry`, {
              sourceName: getSourceName(this.sourceKey === BID),
            })
            .d('线下{sourceName}结果录入')}
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        <Drawer {...drawerProps} />
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return withCustomize({
    unitCode: [
      'SSRC.OFFLINE_RESULT_ENTRY.LIST', // 线下寻源结果录入列表code
      'SSRC.OFFLINE_RESULT_ENTRY.FILTER', // 线下寻源结果录入查询
    ],
  })(
    connect(({ offlineResultEntryInquiry, loading }) => ({
      modelName: 'offlineResultEntryInquiry',
      offlineResultEntryInquiry,
      offlineResultEntry: offlineResultEntryInquiry, // 保险起见,增加原来的Model对象
      fetchRFxListLoading: loading.effects['offlineResultEntryInquiry/fetchRFxList'],
      fetchQuotationFeedBackLoading: loading.effects['offlineResultEntryInquiry/quotationFeedBack'],
    }))(
      formatterCollections({ code: ['ssrc.offlineResultEntry', 'ssrc.common'] })(
        remote({
          code: 'SSRC_OFFLINE_RESULT_ENTRY',
          name: 'offlineResultEntryRemote',
        })(Comp)
      )
    )
  );
};

export { HOCComponent, OfflineResultEntry };

export default HOCComponent(OfflineResultEntry);
