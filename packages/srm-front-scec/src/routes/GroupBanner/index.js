/**
 * GroupBanner - 集团Banner管理
 * @date: 2019-12-30
 * @author: zz <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';

import { Header, Content } from 'components/Page';
import cacheComponent, { deleteCache } from 'components/CacheComponent';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';

import TableList from './TableList';
import HistoryRecord from './HistoryModal';
import FilterForm from './FilterForm';

@connect(({ groupBanner, loading }) => ({
  groupBanner,
  fetchCurrentCompanyLoading: loading.effects['groupBanner/fetchCurrentCompanyValue'],
  fetchGroupBannerListLoading: loading.effects['groupBanner/fetchGroupBannerList'],
  fetchHistoryRecordLoading: loading.effects['groupBanner/fetchHistoryRecord'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['scec.groupBanner', 'scec.customBar', 'scec.common', 'scec.shopBasket'],
})
@cacheComponent({ cacheKey: '/scec/group-banner/list' })
export default class GroupBanner extends Component {
  state = {
    historyRecordVisible: false, // 历史纪录模态框
  };

  componentDidMount() {
    const {
      dispatch,
      groupBanner: { pagination },
    } = this.props;
    dispatch({
      type: 'groupBanner/updateState',
      payload: {
        header: {},
        line: [],
        linePagination: {},
        goodsLineChange: false,
      },
    });
    this.fetchBannerList(pagination);
    this.fetchBannerStatus();
    deleteCache('/scec/group-banner/Detail');
  }

  /**
   * 查询-banner列表数据
   * 租户级传organizationId 和companyId
   */
  @Bind()
  fetchBannerList(page = {}) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    let payload = {};
    payload = {
      page,
      ...fieldValues,
      startDate: fieldValues.startDate ? fieldValues.startDate.format(DATETIME_MIN) : undefined,
      endDate: fieldValues.endDate ? fieldValues.endDate.format(DATETIME_MAX) : undefined,
      companyId: 0,
      organizationId,
    };
    dispatch({
      type: 'groupBanner/fetchGroupBannerList',
      payload,
    });
  }

  /**
   * 获取banner状态
   */
  @Bind()
  fetchBannerStatus() {
    const { dispatch } = this.props;
    dispatch({
      type: 'groupBanner/fetchBannerStatus',
    });
  }

  /**
   * 查询-当前公司值集
   */
  @Bind()
  fetchCurrentCompanyValue(page = {}) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'groupBanner/fetchCurrentCompanyValue',
      payload: {
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        tenantId: organizationId,
      },
    }).then(res => {
      if (res) {
        this.fetchBannerList(page);
      }
    });
  }

  /**
   * 新建-公司Banner
   */
  @Bind()
  createGroupBanner() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/scec/group-banner/create`,
      })
    );
  }

  /**
   * 编辑-跳转明细
   */
  @Bind()
  handleEdit(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/scec/group-banner/detail/${record.bannerId}/0`,
      })
    );
  }

  /**
   * 查看-跳转明细
   */
  @Bind()
  handleCheck(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/scec/group-banner/check-detail/${record.bannerId}/0`,
      })
    );
  }

  /**
   * 上架/下架Banner
   * 租户级传organizationId
   */
  @Bind()
  operatingBanner(action, bannerId) {
    const {
      dispatch,
      organizationId,
      groupBanner: { pagination },
    } = this.props;
    let payload = {};
    payload = {
      idForShelf: bannerId,
      organizationId,
      action,
    };
    dispatch({
      type: 'groupBanner/operatingBanner',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchBannerList(pagination);
      }
    });
  }

  /**
   * 打开-历史纪录
   */
  @Bind()
  showHistoryRecord(record) {
    this.setState({
      historyRecordVisible: true,
    });
    this.showHistoryBanner(record);
  }

  /**
   * 历史纪录
   */
  @Bind()
  showHistoryBanner(record, page = {}) {
    const { dispatch, organizationId } = this.props;
    let payload = {};
    payload = {
      bannerId: record.bannerId,
      page,
      organizationId,
    };
    dispatch({
      type: 'groupBanner/fetchHistoryRecord',
      payload,
    });
  }

  /**
   * 历史纪录-改变分页
   */
  @Bind()
  changeHistoryPagination(page) {
    const {
      groupBanner: { history = [] },
    } = this.props;
    this.showHistoryBanner(history && history[0], page);
  }

  /**
   * 取消历史记录
   */
  @Bind()
  cancelHistoryRecord() {
    const { dispatch } = this.props;
    this.setState({
      historyRecordVisible: false,
    });
    dispatch({
      type: 'groupBanner/updateState',
      payload: {
        history: [],
        historyPagination: {},
      },
    });
  }

  form;

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      fetchGroupBannerListLoading,
      fetchHistoryRecordLoading,
      fetchCurrentCompanyLoading,
      groupBanner: {
        list = [],
        pagination = {},
        history = [],
        historyPagination = {},
        bannerStatus = [],
      },
    } = this.props;
    const { historyRecordVisible = false } = this.state;
    const formProps = {
      bannerStatus,
      onSearch: this.fetchBannerList,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      pagination,
      loading: fetchGroupBannerListLoading,
      dataSource: list,
      onHandleEdit: this.handleEdit,
      onHandleCheck: this.handleCheck,
      onChange: this.fetchBannerList,
      onHandleOperatingBanner: this.operatingBanner,
      onShowHistoryRecord: this.showHistoryRecord,
    };
    const historyRecordProps = {
      loading: fetchHistoryRecordLoading,
      visible: historyRecordVisible,
      dataSource: history,
      pagination: historyPagination,
      onChange: this.changeHistoryPagination,
      onCancel: this.cancelHistoryRecord,
    };
    return (
      <React.Fragment>
        <Header title="集团banner管理">
          <Button
            loading={fetchCurrentCompanyLoading}
            type="primary"
            onClick={this.createGroupBanner}
            icon="plus"
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        <HistoryRecord {...historyRecordProps} />
      </React.Fragment>
    );
  }
}
