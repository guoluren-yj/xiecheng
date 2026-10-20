/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import { isUndefined, isArray, isEmpty } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject } from 'utils/utils';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import { Button as PermissionButton } from 'components/Permission';

import Search from './Search';
import List from './List';
import ActionHistory from './ActionHistory';

@connect(({ loading = {}, createPaymentRequest = {} }) => ({
  createPaymentRequest,
  loading:
    loading.effects['createPaymentRequest/searchList'] ||
    loading.effects['createPaymentRequest/submit'],
}))
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.invoiceBill',
    'sfin.common',
    'entity.company',
    'entity.supplier',
    'sprm.payment',
    'sfin.supplierChargeEntry',
  ],
})
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      visible: false,
      data: {},
    };
  }

  componentDidMount() {
    this.searchList(); // 查询数据
    this.fetchEnum(); // 查询值集
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'createPaymentRequest/init',
    });
  }

  /**
   * searchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  searchList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows: [] });
    dispatch({
      type: 'createPaymentRequest/searchList',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode:
          'SFIN.PAYMENT_REQUEST_CREATE_LIST.FILTER,SFIN.PAYMENT_REQUEST_CREATE_LIST.GRID',
        creationDateStart:
          filterValues.creationDateStart && filterValues.creationDateStart.format(DATETIME_MIN),
        creationDateEnd:
          filterValues.creationDateEnd && filterValues.creationDateEnd.format(DATETIME_MAX),
        paymentTypeCode: 'GENERAL_PAYMENT',
      },
    });
  }

  // 新建
  @Bind()
  newProject() {
    const { history } = this.props;
    history.push({
      pathname: '/sfin/create-payment-request/opyion-to-payinvoice/list',
    });
  }

  // 选择的数据
  @Bind()
  onSelectedRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 跳转到明细页
   * @param {String} paymentHeaderId
   */
  @Bind()
  redirectDetail(paymentHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sfin/create-payment-request/detail/${paymentHeaderId}`,
        // search: pcTypeId ? stringify({ pcTypeId }) : stringify({}),
      })
    );
  }

  /**
   * 提交
   */
  @Bind()
  @Throttle(1000)
  submit() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    Modal.confirm({
      title: intl.get(`sfin.payment.view.confirmSubmit`).d('是否提交'),
      onOk: () => {
        dispatch({
          type: 'createPaymentRequest/batchValidateSubmit',
          payload: selectedRows,
        }).then((r) => {
          if (r) {
            if (r.validatedCode === 'SUCCESS') {
              dispatch({
                type: 'createPaymentRequest/submit',
                payload: [...selectedRows],
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.searchList();
                }
              });
            }
            if (r.validatedCode === 'WIATING_CONFIRM') {
              const { msg } = r;
              Modal.confirm({
                content: intl
                  .get(`sfin.payment.view.message.verifyError`, { msg })
                  .d(`校验资金计划失败,${msg},您是否继续提交？`),
                onOk: () => {
                  dispatch({
                    type: 'createPaymentRequest/submit',
                    payload: [...selectedRows],
                  }).then((res) => {
                    if (res) {
                      notification.success();
                      this.searchList();
                    }
                  });
                },
              });
            }
          }
        });
      },
    });
  }

  @Bind()
  openActionHistory(record) {
    this.setState({
      visible: true,
      data: record,
    });
  }

  @Bind()
  hideModal(type, status) {
    this.setState({ [type]: status });
  }

  render() {
    const {
      createPaymentRequest,
      loading,
      createPaymentRequest: { enumMap = {} },
    } = this.props;
    const { selectedRows = [], visible, data = {} } = this.state;
    const selectedRowKeys = selectedRows.map((n) => n.paymentHeaderId);
    const { dataSource = [], pagination = {} } = createPaymentRequest;
    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      searchList: this.searchList,
    };
    const listProps = {
      dataSource,
      pagination,
      selectedRows,
      onSearch: this.searchList,
      loading,
      redirectDetail: this.redirectDetail,
      openActionHistory: this.openActionHistory,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    const actionHistory = {
      data, // 传入的数据,打开操作记录的行
      visible,
      hideModal: this.hideModal,
      // openActionHistory: this.openActionHistory,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sfin.invoiceBill.view.message.createPaymentRequest')
            .d('创建到票付款申请')}
        >
          <Button icon="plus" type="primary" onClick={this.newProject} loading={loading}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>

          <PermissionButton
            permissionList={[
              {
                code: `srm.finance.payment.ordinary.ps.button.submit`,
                type: 'button',
              },
            ]}
            onClick={this.submit}
            loading={loading}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
            icon="check"
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </PermissionButton>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        {visible && <ActionHistory {...actionHistory} />}
      </React.Fragment>
    );
  }
}
