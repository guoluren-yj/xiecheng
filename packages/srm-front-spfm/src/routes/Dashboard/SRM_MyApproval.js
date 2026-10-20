/**
 * MyApproval -我的审批
 * @date: 2021-04-09
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Spin, Form, DataSet, Output } from 'choerodon-ui/pro';
import { Row } from 'choerodon-ui';
import { withRouter } from 'dva/router';
import { getCurrentOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { SRM_SPRM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import styles from './Cards.less';

const prefix = `spfm.dashboard`;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfm.dashboard', 'hwfm.common'] })
@withRouter
export default class MyApproval extends React.Component {
  formDataDs = new DataSet({
    autoQuery: true,
    autoCreate: false,
    fields: [
      {
        name: 'purchaseRequestCount',
        type: 'number',
        label: intl.get(`${prefix}.model.purchaseRequestCount`).d('采购申请'),
      },
      {
        name: 'purchaseOrderCount',
        type: 'number',
        label: intl.get(`${prefix}.model.purchaseOrderCount`).d('采购订单'),
      },
      {
        name: 'priceLibCount',
        type: 'number',
        label: intl.get(`${prefix}.model.priceLibCount`).d('价格库'),
      },
      {
        name: 'supplierManageCount',
        type: 'number',
        label: intl.get(`${prefix}.model.supplierManageCount`).d('供应商管理'),
      },
      {
        name: 'sourceSeeking',
        type: 'number',
        label: intl.get(`${prefix}.model.sourceSeeking`).d('寻源'),
      },
      {
        name: 'accountStatement',
        type: 'number',
        label: intl.get(`${prefix}.model.accountStatement`).d('对账单'),
      },
    ],

    transport: {
      read: {
        url: `${SRM_SPRM}/v1/${organizationId}/watsons-pr/activiti/task/dashboard_clause/statistics`,
        method: 'GET',
      },
    },
  });

  // 跳转到我的审批页面
  @Bind()
  handleToMyApproval(value) {
    this.props.history.push({
      pathname: '/hwfp/todo-task/list',
      state: { activeKey: value },
    });
  }

  render() {
    return (
      <Row className={styles.commonlyUsed}>
        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
          <a className={styles['card-title']} onClick={() => this.handleToMyApproval('purchase')}>
            {intl.get(`${prefix}.view.message.myApproval`).d('我的审批')}
          </a>
        </div>
        <Spin dataSet={this.formDataDs}>
          <Form dataSet={this.formDataDs} className={styles.formTextPosion}>
            <Output
              name="purchaseRequestCount"
              renderer={({ value }) => (
                <a onClick={() => this.handleToMyApproval('purchase')}>{value}</a>
              )}
            />
            <Output
              name="purchaseOrderCount"
              renderer={({ value }) => (
                <a onClick={() => this.handleToMyApproval('order')}>{value}</a>
              )}
            />
            <Output
              name="priceLibCount"
              renderer={({ value }) => (
                <a onClick={() => this.handleToMyApproval('priceLibrary')}>{value}</a>
              )}
            />
            <Output
              name="supplierManageCount"
              renderer={({ value }) => (
                <a onClick={() => this.handleToMyApproval('supplierManage')}>{value}</a>
              )}
            />
            <Output
              name="sourceSeeking"
              renderer={({ value }) => (
                <a onClick={() => this.handleToMyApproval('source')}>{value}</a>
              )}
            />
            <Output
              name="accountStatement"
              renderer={({ value }) => (
                <a onClick={() => this.handleToMyApproval('bill')}>{value}</a>
              )}
            />
          </Form>
        </Spin>
      </Row>
    );
  }
}
