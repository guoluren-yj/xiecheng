/**
 * Role - 企业认证租户审批
 * @date: 2020-5-15
 * @author: 杨林 <yang.lin05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty } from 'lodash';
import moment from 'moment';
import notification from 'utils/notification';
import intl from 'utils/intl';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { openTab } from 'utils/menuTab';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getResponse, filterNullValueObject } from 'utils/utils';

import { fetchOpenNewRegister } from '@/services/companySearchService';

import QueryForm from './Form';
import Table from './Table';
import styles from './index.less';


@connect(({ loading, certificationApproval }) => ({
  approveLoading: loading.effects['certificationApproval/approveBatch'],
  queryListLoading: loading.effects['certificationApproval/queryTenantList'],
  certificationApproval,
}))
@formatterCollections({ code: 'spfm.certificationApproval' })
@withCustomize({
  unitCode: [
    'SPFM.CERTIFICATION_TENANT_APPROVAL.LIST',
    'SPFM.CERTIFICATION_TENANT_APPROVAL.LIST_BTN',
  ],
})
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
      'handleImport',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const lovCodes = {
      registrationSource: 'SPFM.SUP_REGISTERED_SOURCE',
    };
    // 初始化 值集
    dispatch({
      type: 'certificationApproval/batchCode',
      payload: {
        lovCodes,
      },
    });
    this.fetchList();
    // 查询是否开启新注册
    fetchOpenNewRegister().then((res) => {
      if (getResponse(res)) {
        const { NewRegisterFlag } = res;
        if(NewRegisterFlag === '1'){
          notification.warning({
            message: intl
              .get(`spfm.certificationApproval.view.message.oldMenuTips`)
              .d('当前功能为旧版本，请前往【供应商邀约】使用最新版本的功能'),
          });
        }
      }
    });
  }

  /**
   *
   */

  handleImport() {
    openTab({
      key: `/spfm/certification-approval/import-component/SPFM.COMPANY_REGISTER.IMPORT`,
      title: intl
        .get('spfm.certificationApproval.view.message.certificationImport')
        .d('认证企业导入'),
      search: querystring.stringify({
        action: intl
          .get('spfm.certificationApproval.view.message.certificationImport')
          .d('认证企业导入'),
      }),
    });
  }

  fetchList(page = {}) {
    const { dispatch } = this.props;
    const { getFieldsValue = (e) => e } = this.queryForm || {};
    const newParams = { ...getFieldsValue() };
    newParams.processDateFrom = newParams.processDateFrom
      ? moment(newParams.processDateFrom).format(DEFAULT_DATETIME_FORMAT)
      : null;
    newParams.processDateTo = newParams.processDateTo
      ? moment(newParams.processDateTo).format(DEFAULT_DATETIME_FORMAT)
      : null;

      // 分页改造参数
    const pageFilterParams = {
      asyncCountFlag: 'DEFAULT',
      oldTotalElements: page.total ? page.total : '',
    };
    dispatch({
      type: 'certificationApproval/queryTenantList',
      payload: {
        ...newParams,
        page,
        customizeUnitCode: 'SPFM.CERTIFICATION_TENANT_APPROVAL.LIST',
        ...filterNullValueObject(pageFilterParams),
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
      payload: {
        data: selectedRows,
        tenant: true,
        customizeUnitCode: 'SPFM.CERTIFICATION_TENANT_APPROVAL.LIST',
      },
    }).then((res) => {
      if (res) {
        notification.success();
      }
      dispatch({ type: 'certificationApproval/updateListReducer', payload: { selectedRows: [] } });
      fetchList();
    });
  }

  handleRedirectDetail(id, processUser) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spfm/certification-tenant-approval/detail/${id}`,
        search: `?processUser=${processUser}`,
      })
    );
  }

  handleOnChange(pagination) {
    this.fetchList(pagination);
  }

  render() {
    const {
      certificationApproval = {},
      queryListLoading,
      approveLoading,
      customizeTable,
      custLoading,
      customizeBtnGroup = () => {},
    } = this.props;
    const { list = {}, source = {} } = certificationApproval;
    const formProps = {
      ...source,
      ref: (node) => {
        this.queryForm = node;
      },
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
      customizeTable,
      custLoading,
    };
    return (
      <div className={styles['spfm-certification-approval-list']}>
        <Header
          title={intl
            .get('spfm.certificationApproval.view.title.certificationApproval')
            .d('企业认证审批')}
        >
          {customizeBtnGroup(
            {
              code: 'SPFM.CERTIFICATION_TENANT_APPROVAL.LIST_BTN',
            },
            [
              <Button
                data-name="approval"
                type="primary"
                icon="check"
                loading={approveLoading}
                disabled={isEmpty(list.selectedRows) || queryListLoading}
                onClick={this.approve}
              >
                {intl.get('spfm.certificationApproval.view.button.approval').d('审批通过')}
              </Button>,
            ]
          )}
          {/* <Button icon="to-top" onClick={this.handleImport}>
            {intl.get('hzero.common.button.import').d('导入')}
          </Button> */}
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
