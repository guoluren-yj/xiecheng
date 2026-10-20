import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Button, Modal } from 'hzero-ui';
import intl from 'utils/intl';
import { isArray, isEmpty } from 'lodash';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import notification from 'utils/notification';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

import Search from './Search';
import List from './List';
// import { createPagination } from 'hzero-front/lib/utils/utils';

@formatterCollections({
  code: ['sinv.acceptanceSheetType', 'sinv.acceptanceSheetCreate'],
})
@connect(({ loading, acceptanceSheetCreate }) => ({
  fetchListLoading: loading.effects['acceptanceSheetCreate/submit'],
  listLoading: loading.effects['acceptanceSheetCreate/queryList'],
  submitLoading: loading.effects['acceptanceSheetCreate/submit'],

  acceptanceSheetCreate,
}))
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedRowKeys: [] };
  }

  /**
   *
   * @param {object} ref - Search子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  redirect() {
    const { history } = this.props;
    history.push({
      pathname: '/sinv/acceptance-sheet-create/detail',
    });
  }

  // 查询
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = (this.form && this.form.getFieldsValue()) || {};
    const searchDate = {
      ...filterValues,
      acceptDateStart: filterValues.acceptDateStart
        ? filterValues.acceptDateStart.format(DATETIME_MIN)
        : undefined,
      acceptDateEnd: filterValues.acceptDateEnd
        ? filterValues.acceptDateEnd.format(DATETIME_MAX)
        : undefined,
      acStatusSet: ['PENDING', 'REJECTED'],
    };

    dispatch({
      type: 'acceptanceSheetCreate/queryList',
      payload: { page, ...searchDate },
    });
  }

  componentDidMount() {
    this.handleSearch();
    this.queryValueCode();
  }

  // 勾选按钮
  @Bind()
  handleSelect(value) {
    this.setState({ selectedRowKeys: value });
  }

  // 提交
  @Bind()
  approveAcceptance() {
    const {
      dispatch,
      acceptanceSheetCreate: { orderList = [] },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const submitFlag = selectedRowKeys.some(ele => orderList[ele] && orderList[ele].lineSize === 0);
    const acceptListHeaderCreateDTOList = selectedRowKeys.map(ele => orderList[ele]);
    Modal.confirm({
      title: intl.get('sinv.acceptanceSheetCreate.message.submit').d('确认提交？'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        if (submitFlag === false) {
          dispatch({
            type: 'acceptanceSheetCreate/submit',
            payload: { acceptListHeaderCreateDTOList },
          }).then(res => {
            if (res) {
              notification.success();
              this.handleSearch();
              this.setState({ selectedRowKeys: [] });
            }
          });
        } else {
          notification.warning({
            message: intl
              .get(`sinv.acceptanceSheetType.message.submitWarning`)
              .d('验收单未维护行信息，无法提交，请确认！'),
          });
        }
      },
    });
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetCreate/queryValueCode',
      payload: {
        statusCode: 'SPUC.ACCEPT_SELECT_STATUS',
        orderSource: 'SPUC.ACCEPT_SOURCE_CODE',
      },
    });
  }

  render() {
    const {
      history,
      acceptanceSheetCreate: {
        orderList = [], // 列表
        listPagination = {},
        code: { orderSource = [], statusCode = [] },
      },
      fetchListLoading,
      listLoading,
      submitLoading,
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const SearchProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      orderSource,
      statusCode,
    };
    const ListProps = {
      history,
      loading: listLoading,
      dataSource: orderList,
      pagination: listPagination,
      onSearch: this.handleSearch,
      selectedRowKeys,
      onSelectRow: this.handleSelect,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sinv.acceptanceSheetCreate.title.acceptanceCreate`).d('验收单创建')}
        >
          <Button
            icon="plus"
            type="primary"
            // loading={approveDeliveryOrderLoading}
            // disabled={
            //   (isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)) || fetchListLoading
            // }
            onClick={this.redirect}
          >
            {intl.get(`sinv.acceptanceSheetType.button.create`).d('新建')}
          </Button>
          <Button
            icon="check"
            disabled={(isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) || fetchListLoading}
            onClick={this.approveAcceptance}
            loading={submitLoading}
          >
            {intl.get(`sinv.acceptanceSheetType.button.submit`).d('提交')}
          </Button>
        </Header>
        <Content>
          <Search {...SearchProps} />
          <List {...ListProps} />
        </Content>
      </React.Fragment>
    );
  }
}
