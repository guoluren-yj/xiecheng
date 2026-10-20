/**
 * Audit - 开票申请单审核
 * @date: 2018-12-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isObject } from 'lodash';

import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';
import NoConsignment from './NoConsignment';

/**
 * 开票申请单审核
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@connect(({ bill, loading }) => ({
  bill,
  loading:
    loading.effects['bill/confirmBill'] ||
    loading.effects['bill/rejectBill'] ||
    loading.effects['bill/fetchAuditNoConsignment'],
}))
@formatterCollections({
  code: [
    'sfin.invoiceBill',
    'entity.company',
    'hzero.common',
    'sfin.payableInvoice',
    'sodr.quotePurchase',
    'ssta.ecAutoBill',
  ],
})
@withRouter
export default class Audit extends PureComponent {
  noConsignmentRef;

  state = {
    changeButton: true,
    queryValue: {},
  };

  @Bind()
  @Throttle(1000)
  onECConfirm() {
    this.noConsignmentRef.onConfirm();
  }

  @Bind()
  @Throttle(1000)
  onECBack() {
    this.noConsignmentRef.onGoBack();
  }

  @Bind()
  onECExport() {
    this.noConsignmentRef.onExport();
  }

  @Bind()
  @Throttle(1000)
  searchErrorRecord() {
    this.noConsignmentRef.openErrorRecord();
  }

  /**
   * 获取非寄销ref
   * @param {object} ref - 组件ref
   */
  @Bind()
  getNCRef(ref = {}) {
    this.noConsignmentRef = ref;
  }

  @Bind()
  onSetQueryValue(values = {}) {
    this.setState({
      queryValue: filterNullValueObject(values),
    });
  }

  @Bind()
  onClearQueryValue() {
    this.setState({
      queryValue: {},
    });
  }

  render() {
    const {
      bill: { auditRows = [] },
      loading,
    } = this.props;
    const { changeButton, queryValue } = this.state;
    const noConsignmentProps = {
      onRef: this.getNCRef,
      onSetQueryValue: this.onSetQueryValue,
      onClearQueryValue: this.onClearQueryValue,
    };
    const disabled = auditRows.some((item) => item.sourceCode === 'EC');
    const organizationId = getCurrentOrganizationId();
    return (
      <React.Fragment>
        <Header title={intl.get('sfin.invoiceBill.view.message.title.audit').d('审核开票申请单')}>
          {changeButton ? (
            <React.Fragment>
              <Button
                icon="check"
                type="primary"
                disabled={isEmpty(auditRows) || disabled}
                loading={loading}
                onClick={() => this.onECConfirm(true)}
              >
                {intl.get('sfin.invoiceBill.model.invoiceBill.approve').d('通过')}
              </Button>
              <Button
                icon="close"
                disabled={isEmpty(auditRows) || disabled}
                loading={loading}
                onClick={() => this.onECBack(true)}
              >
                {intl.get('sfin.invoiceBill.model.invoiceBill.return').d('退回')}
              </Button>
              <ExcelExport
                requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/approve-export`}
                queryParams={
                  isObject(queryValue)
                    ? {
                        ...queryValue,
                        customizeUnitCode: 'SFIN.BILL_AUDIT_LIST.GRID,SFIN.BILL_AUDIT_LIST.FILTER',
                      }
                    : queryValue
                }
              />
              <PermissionButton
                permissionList={[
                  {
                    code: `srm.finance.purchase-bill.approve.ps.button.save`,
                    type: 'button',
                  },
                ]}
                loading={loading}
                onClick={() => this.searchErrorRecord()}
              >
                {intl.get('ssta.ecAutoBill.view.message.errors').d('错误记录')}
              </PermissionButton>
            </React.Fragment>
          ) : (
            <div />
          )}
        </Header>
        <Content>
          <NoConsignment {...noConsignmentProps} />
        </Content>
      </React.Fragment>
    );
  }
}
