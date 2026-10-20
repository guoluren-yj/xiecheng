import React, { PureComponent } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, isArray } from 'lodash';
import moment from 'moment';
import notification from 'utils/notification';
import intl from 'utils/intl';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import QueryForm from './Form';
import Table from './Table';
import styles from './index.less';

@connect(({ loading, certificationApproval }) => ({
  approveLoading: loading.effects['certificationApproval/approveBatch'],
  queryListLoading: loading.effects['certificationApproval/queryList'],
  certificationApproval,
}))
@formatterCollections({
  code: ['spfm.certificationApproval', 'spfm.registerEnterprise'],
})
@CacheComponent({ cacheKey: '/spfm/certification-approval' })
export default class Role extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    [
      'fetchList',
      'handleOnChange',
      'handleSetSelectedRows',
      'handleRedirectDetail',
      'approve',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.queryIdpValue();
    this.fetchList();
  }

  queryIdpValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'certificationApproval/queryIdpValue',
    });
  }

  fetchList(params = {}) {
    const { dispatch } = this.props;
    const { getFieldsValue = (e) => e } = this.queryForm;
    const newParams = { ...getFieldsValue() };
    newParams.processDateFrom = newParams.processDateFrom
      ? moment(newParams.processDateFrom).format(DEFAULT_DATETIME_FORMAT)
      : null;
    newParams.processDateTo = newParams.processDateTo
      ? moment(newParams.processDateTo).format(DEFAULT_DATETIME_FORMAT)
      : null;

    dispatch({
      type: 'certificationApproval/queryList',
      payload: {
        ...params,
        ...newParams,
      },
    });
  }

  handleSetSelectedRows(selectedRows) {
    const { dispatch } = this.props;
    dispatch({ type: 'certificationApproval/updateListReducer', payload: { selectedRows } });
  }

  approve() {
    const {
      dispatch,
      certificationApproval: { list },
    } = this.props;
    const { selectedRows } = list;
    const { fetchList } = this;
    dispatch({
      type: 'certificationApproval/approveBatch',
      payload: { data: selectedRows },
    }).then((res) => {
      if (isEmpty(res)) {
        notification.success();
      } else {
        notification.error({
          description: isArray(res)
            ? (res[0] || {}).processMsg
            : res && res.failed
            ? res.message
            : null,
        });
      }
      dispatch({ type: 'certificationApproval/updateListReducer', payload: { selectedRows: [] } });
      fetchList();
    });
  }

  handleRedirectDetail(id, processUser) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spfm/certification-approval/detail/${id}`,
        search: querystring.stringify({
          processUser,
        }),
      })
    );
  }

  handleOnChange(pagination) {
    this.fetchList(pagination);
  }

  render() {
    const { certificationApproval = {}, queryListLoading, approveLoading } = this.props;
    const { list = {}, approvalMethod = [] } = certificationApproval;
    const formProps = {
      ref: (node) => {
        this.queryForm = node;
      },
      approvalMethod,
      handleQueryList: this.fetchList,
      processing: {
        loading: queryListLoading,
        approval: approveLoading,
      },
    };
    const tableProps = {
      ...list,
      handleOnChange: this.handleOnChange,
      handleSetSelectedRows: this.handleSetSelectedRows,
      loading: queryListLoading || approveLoading,
      handleRedirectDetail: this.handleRedirectDetail,
    };
    return (
      <div className={styles['spfm-certification-approval-list']}>
        <Header
          title={intl
            .get('spfm.certificationApproval.view.title.certificationApproval')
            .d('企业认证审批')}
        >
          <Button
            type="primary"
            icon="check"
            loading={approveLoading}
            disabled={isEmpty(list.selectedRows) || queryListLoading}
            onClick={this.approve}
          >
            {intl.get('spfm.certificationApproval.view.button.approval').d('审批通过')}
          </Button>
        </Header>
        <Content>
          <QueryForm {...formProps} />
          <br />
          <Table {...tableProps} />
        </Content>
      </div>
    );
  }
}
