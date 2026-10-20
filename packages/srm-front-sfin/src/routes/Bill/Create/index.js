/**
 * CreateIndex - 非寄销开票单创建
 * @date: 2018-12-3
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import qs from 'querystring';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Button as PermissionButton } from 'components/Permission';
import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import './index.less';

import NoConsignmentSale from './NoConsignmentSale/index';

const { confirm } = Modal;
const promptCode = 'sfin.invoiceBill';

/**
 * 非寄销开票单维护
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} CreateIndex - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'entity.company',
    'entity.supplier',
    'entity.roles',
    'entity.item',
    'entity.business',
    'sfin.invoiceBill',
    'sodr.common',
  ],
})
@withCustomize({
  unitCode: [
    'SFIN.BILL_CREATE_LIST.GRID',
    'SFIN.BILL_CREATE_LIST.FILTER',
    'SFIN.BILL_CREATE_LIST.HEAD_BUTTON',
  ],
})
@connect(({ bill, loading }) => ({
  bill,
  organizationId: getCurrentOrganizationId(),
  loading:
    loading.effects['bill/createBillAll'] ||
    loading.effects['bill/createBill'] ||
    loading.effects['bill/fetchAcceptanceForm'] ||
    loading.effects['bill/fetchWork'],
}))
export default class CreateIndex extends PureComponent {
  constructor(props) {
    super(props);
    // const { match: { params: { billHeaderId } } } = props;
    this.state = {
      activeKey: 'noSale',
    };
  }

  componentDidMount() {
    // const thisForm = this.filterForm;
    // const formValues = isUndefined(thisForm)
    //   ? {}
    //   : filterNullValueObject(thisForm.getFieldsValue());
    // console.log(formValues);
    // Didmount的查询需在个性化配置之后
  }

  /**
   * tabs切换执行
   * @param {String} activeKey 激活面板的key
   */
  @Bind()
  handleTabsChange(activeKey) {
    if (activeKey === 'noSale') {
      this.handleSearchNoSale();
    }
    this.setState({ activeKey });
  }

  /**
   *
   * @param {*} ref 子组件对象
   */
  @Bind()
  handleBindRef(ref) {
    this.handleSearchNoSale = ref.handleSearchWork;
    this.filterForm = ref.filterForm.props.form;
    // this.chooseInterface = ref.chooseInterface;
    // this.ref = ref;
  }

  /**
   * 创建开票申请单
   */
  @Bind()
  @Throttle(1000)
  handleCreateBill() {
    const {
      dispatch,
      history,
      organizationId,
      bill: { createRowKeys, createRows },
    } = this.props;
    const { displayReverseFlag, businessType } = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const acceptListLineIds = createRows.map((item) => item.acceptListLineId);
    confirm({
      title: intl.get(`${promptCode}.view.message.confirm.create`).d('是否生成开票申请单?'),
      // content: '',
      onOk: () => {
        return dispatch({
          type: 'bill/createValidateBill',
          payload: { organizationId, trxLineIds: createRowKeys },
        }).then((response) => {
          if (!response) return;
          if (response.validatedCode === 'INFO') {
            confirm({
              title: response.msg,
              // content: '',
              onOk: () => {
                return dispatch({
                  type:
                    businessType === 'ACCEPT'
                      ? 'bill/createAcceptanceCreateBill'
                      : 'bill/createBill',
                  payload:
                    businessType === 'ACCEPT'
                      ? { organizationId, acceptListLineIds, displayReverseFlag }
                      : {
                          organizationId,
                          trxLineIds: createRowKeys,
                          displayReverseFlag,
                          businessType,
                        },
                }).then((res) => {
                  if (!isEmpty(res)) {
                    if (res.length === 1 || businessType === 'ACCEPT') {
                      let billHeaderId = null;
                      if (businessType === 'ACCEPT') {
                        billHeaderId = res.billHeader ? res.billHeader.billHeaderId : null;
                      } else {
                        const { failed = 0, message = '' } = res[0];
                        if (Number(failed) === 1) {
                          return notification.warning({
                            message: intl.get('hzero.common.notification.error').d('操作失败'),
                            description: message,
                            style: {
                              maxHeight: '600px',
                              wordBreak: 'break-all',
                              overflow: 'auto',
                            },
                          });
                        }
                        billHeaderId = res[0].billHeader ? res[0].billHeader.billHeaderId : null;
                      }

                      dispatch({
                        type: 'bill/updateState',
                        payload: { createRowKeys: [], createRows: [], billList: [] },
                      });
                      notification.success();
                      history.push({
                        pathname: `/sfin/bill-create/detail/${billHeaderId}`,
                        search: qs.stringify({ status: 'create' }),
                      });
                    } else {
                      dispatch({
                        type: 'bill/updateState',
                        payload: {
                          createRowKeys: [],
                          createRows: [],
                          billList: res.map((item) => item.billHeader || {}),
                        },
                      });
                      history.push({
                        pathname: `/sfin/bill-create/detail-list`,
                      });
                    }
                  } else {
                    // 清空勾选存下的 row
                    dispatch({
                      type: 'bill/updateState',
                      payload: { createRowKeys: [], createRows: [], billList: [] },
                    });
                    this.handleSearchNoSale();
                  }
                });
              },
            });
          }
          if (response.validatedCode === 'SUCCESS') {
            return dispatch({
              type:
                businessType === 'ACCEPT' ? 'bill/createAcceptanceCreateBill' : 'bill/createBill',
              payload:
                businessType === 'ACCEPT'
                  ? { organizationId, acceptListLineIds, displayReverseFlag }
                  : { organizationId, trxLineIds: createRowKeys, displayReverseFlag, businessType },
            }).then((res) => {
              if (res && !isEmpty(res)) {
                if (res.length === 1 || businessType === 'ACCEPT') {
                  let billHeaderId = null;
                  if (businessType === 'ACCEPT') {
                    billHeaderId = res.billHeader ? res.billHeader.billHeaderId : null;
                  } else {
                    const { failed = 0, message = '' } = res[0];
                    if (Number(failed) === 1) {
                      return notification.warning({
                        message: intl.get('hzero.common.notification.error').d('操作失败'),
                        description: message,
                        style: {
                          maxHeight: '600px',
                          wordBreak: 'break-all',
                          overflow: 'auto',
                        },
                      });
                    }
                    billHeaderId = res[0].billHeader ? res[0].billHeader.billHeaderId : null;
                  }
                  // 清空勾选存下的 row
                  dispatch({
                    type: 'bill/updateState',
                    payload: { createRowKeys: [], createRows: [], billList: [] },
                  });
                  notification.success();
                  history.push({
                    pathname: `/sfin/bill-create/detail/${billHeaderId}`,
                    search: qs.stringify({ status: 'create' }),
                  });
                } else {
                  dispatch({
                    type: 'bill/updateState',
                    payload: {
                      createRowKeys: [],
                      createRows: [],
                      billList: res.map((item) => item.billHeader || {}),
                    },
                  });
                  history.push({
                    pathname: `/sfin/bill-create/detail-list`,
                  });
                }
              } else {
                // 清空勾选存下的 row
                dispatch({
                  type: 'bill/updateState',
                  payload: { createRowKeys: [], createRows: [], billList: [] },
                });
                this.handleSearchNoSale();
              }
            });
          }
          if (response.validatedCode === 'WIATING_CONFIRM') {
            confirm({
              title: response.msg,
              onOk: () => {
                return dispatch({
                  type:
                    businessType === 'ACCEPT'
                      ? 'bill/createAcceptanceCreateBill'
                      : 'bill/createBill',
                  payload:
                    businessType === 'ACCEPT'
                      ? { organizationId, acceptListLineIds, displayReverseFlag }
                      : {
                          organizationId,
                          trxLineIds: createRowKeys,
                          displayReverseFlag,
                          businessType,
                        },
                }).then((res) => {
                  if (!isEmpty(res)) {
                    if (res.length === 1 || businessType === 'ACCEPT') {
                      let billHeaderId = null;
                      if (businessType === 'ACCEPT') {
                        billHeaderId = res.billHeader ? res.billHeader.billHeaderId : null;
                      } else {
                        const { failed = 0, message = '' } = res[0];
                        if (Number(failed) === 1) {
                          return notification.warning({
                            message: intl.get('hzero.common.notification.error').d('操作失败'),
                            description: message,
                            style: {
                              maxHeight: '600px',
                              wordBreak: 'break-all',
                              overflow: 'auto',
                            },
                          });
                        }
                        billHeaderId = res[0].billHeader ? res[0].billHeader.billHeaderId : null;
                      }
                      // 清空勾选存下的 row
                      dispatch({
                        type: 'bill/updateState',
                        payload: { createRowKeys: [], createRows: [], billList: [] },
                      });
                      notification.success();
                      history.push({
                        pathname: `/sfin/bill-create/detail/${billHeaderId}`,
                        search: qs.stringify({ status: 'create' }),
                      });
                    } else {
                      dispatch({
                        type: 'bill/updateState',
                        payload: {
                          createRowKeys: [],
                          createRows: [],
                          billList: res.map((item) => item.billHeader || {}),
                        },
                      });
                      history.push({
                        pathname: `/sfin/bill-create/detail-list`,
                      });
                    }
                  } else {
                    // 清空勾选存下的 row
                    dispatch({
                      type: 'bill/updateState',
                      payload: { createRowKeys: [], createRows: [], billList: [] },
                    });
                    this.handleSearchNoSale();
                  }
                });
              },
            });
          }
        });
      },
    });
  }

  /**
   * 移除或撤销事务行
   * @param {Boolean} flag true 移除
   */
  @Bind()
  @Throttle(1000)
  handleRemoveOrNot(flag, needInvoiceFlag, notNeedInvoiceFlag) {
    const {
      dispatch,
      organizationId,
      bill: { createRowKeys, createRows },
    } = this.props;
    const { businessType } = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const acceptListLineIds = createRows.map((item) => item.acceptListLineId);
    if (!isEmpty(needInvoiceFlag) && !isEmpty(notNeedInvoiceFlag)) {
      if (flag) {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.notification.needInvoice`)
            .d('勾选的数据中存在已移除数据'),
        });
      } else {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.notification.notNeedInvoice`)
            .d('勾选的数据中存在未移除数据'),
        });
      }
    } else {
      const interfaceName = flag ? 'un-need-invoice' : 'need-invoice';
      const confirmTitle = flag
        ? intl.get(`${promptCode}.view.message.confirm.unInvoice`).d('是否确认移除?')
        : intl.get(`${promptCode}.view.message.confirm.invoice`).d('是否确认撤销移除?');
      confirm({
        title: confirmTitle,
        // content: '',
        onOk: () => {
          if (businessType === 'ACCEPT') {
            if (flag) {
              dispatch({
                type: 'bill/removeAcceptance',
                payload: { interfaceName, acceptListLineIds, organizationId },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.handleSearchNoSale();
                  dispatch({
                    type: 'bill/updateState',
                    payload: { createRowKeys: [], createRows: [] },
                  });
                }
              });
            } else {
              dispatch({
                type: 'bill/returnAcceptance',
                payload: { interfaceName, acceptListLineIds, organizationId },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.handleSearchNoSale();
                  dispatch({
                    type: 'bill/updateState',
                    payload: { createRowKeys: [], createRows: [] },
                  });
                }
              });
            }
          } else {
            dispatch({
              type: 'bill/removeInvoiceOrNot',
              payload: { interfaceName, createRowKeys, organizationId },
            }).then((res) => {
              if (res) {
                notification.success();
                this.handleSearchNoSale();
                dispatch({
                  type: 'bill/updateState',
                  payload: { createRowKeys: [], createRows: [] },
                });
              }
            });
          }
        },
      });
    }
  }

  /**
   * 全选创建
   *
   */
  @Bind()
  @Throttle(1000)
  handleCheckAll() {
    const { dispatch, history, organizationId } = this.props;
    const formValues = this.handleGetFormValue();
    const { businessType } = formValues;
    confirm({
      title: intl.get(`${promptCode}.view.message.confirm.checkAll`).d('是否全部勾选创建?'),
      onOk: () => {
        dispatch({
          type: 'bill/createBillAll',
          payload: {
            organizationId,
            trxLineIds: [],
            ...formValues,
            trxDateFrom:
              formValues.trxDateFrom && moment(formValues.trxDateFrom).format(DATETIME_MIN),
            trxDateTo: formValues.trxDateTo && moment(formValues.trxDateTo).format(DATETIME_MAX),
            customizeUnitCode: 'SFIN.BILL_CREATE_LIST.GRID,SFIN.BILL_CREATE_LIST.FILTER',
          },
        }).then((response) => {
          if (!isEmpty(response)) {
            if (response.length === 1 || businessType === 'ACCEPT') {
              let billHeaderId = null;
              if (businessType === 'ACCEPT') {
                billHeaderId = response.billHeader ? response.billHeader.billHeaderId : null;
              } else {
                const { failed = 0, message = '' } = response[0];
                if (Number(failed) === 1) {
                  return notification.warning({
                    message: intl.get('hzero.common.notification.error').d('操作失败'),
                    description: message,
                    style: {
                      maxHeight: '600px',
                      wordBreak: 'break-all',
                      overflow: 'auto',
                    },
                  });
                }
                billHeaderId = response[0].billHeader ? response[0].billHeader.billHeaderId : null;
              }
              // let billHeaderId = null;
              // billHeaderId = response[0].billHeader ? response[0].billHeader.billHeaderId : null;
              notification.success();
              history.push({
                pathname: `/sfin/bill-create/detail/${billHeaderId}`,
                search: qs.stringify({ status: 'create' }),
              });
            } else {
              dispatch({
                type: 'bill/updateState',
                payload: {
                  billList: response.map((item) => item.billHeader || {}),
                },
              });
              history.push({
                pathname: `/sfin/bill-create/detail-list`,
              });
            }
          } else {
            this.handleSearchNoSale();
          }
        });
      },
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const thisForm = this.filterForm;
    const formValues = isUndefined(thisForm)
      ? {}
      : filterNullValueObject(thisForm.getFieldsValue());
    const filterValues = {
      ...formValues,
      trxDateFrom: formValues.trxDateFrom && moment(formValues.trxDateFrom).format(DATETIME_MIN),
      trxDateTo: formValues.trxDateTo && moment(formValues.trxDateTo).format(DATETIME_MAX),
      customizeUnitCode: 'SFIN.BILL_CREATE_LIST.GRID,SFIN.BILL_CREATE_LIST.FILTER',
    };
    return filterValues;
  }

  render() {
    const {
      organizationId,
      loading,
      bill: { createRowKeys = [], createRows = [] },
      customizeBtnGroup,
    } = this.props;
    const { activeKey } = this.state;
    const needInvoiceFlag = createRows.filter((o) => o.needInvoiceFlag === 1);
    const notNeedInvoiceFlag = createRows.filter((o) => o.needInvoiceFlag === 0);
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.bill.create`).d('创建开票申请单')}
        >
          {activeKey === 'noSale' && (
            <React.Fragment>
              {customizeBtnGroup(
                {
                  code: 'SFIN.BILL_CREATE_LIST.HEAD_BUTTON',
                },
                [
                  <Button
                    icon="plus"
                    type="primary"
                    disabled={isEmpty(createRowKeys)}
                    loading={loading}
                    name="create"
                    onClick={this.handleCreateBill}
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>,
                  <ExcelExport
                    name="export"
                    requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/trx-line/export`}
                    queryParams={this.handleGetFormValue()}
                    otherButtonProps={{ icon: 'export', type: 'default' }}
                  />,
                  <Button
                    icon="close-square-o"
                    name="remove"
                    loading={loading}
                    disabled={isEmpty(createRowKeys) || isEmpty(needInvoiceFlag)}
                    onClick={() =>
                      this.handleRemoveOrNot(true, needInvoiceFlag, notNeedInvoiceFlag)
                    }
                  >
                    {intl.get(`${promptCode}.view.option.remove`).d('移除')}
                  </Button>,
                  <Button
                    icon="close-square-o"
                    name="notRemove"
                    loading={loading}
                    disabled={isEmpty(createRowKeys) || isEmpty(notNeedInvoiceFlag)}
                    onClick={() =>
                      this.handleRemoveOrNot(false, needInvoiceFlag, notNeedInvoiceFlag)
                    }
                  >
                    {intl.get(`${promptCode}.view.option.notRemove`).d('撤销移除')}
                  </Button>,
                  <PermissionButton
                    loading={loading}
                    name="checkAll"
                    onClick={this.handleCheckAll}
                    permissionList={[
                      {
                        code: `srm.finance.sales-bill.create.ps.create.checkall`,
                        type: 'button',
                      },
                    ]}
                  >
                    {intl.get(`${promptCode}.view.option.checkAll`).d('全选创建')}
                  </PermissionButton>,
                ]
              )}
            </React.Fragment>
          )}
        </Header>
        <Content>
          <NoConsignmentSale onRef={this.handleBindRef} {...this.props} />
        </Content>
      </React.Fragment>
    );
  }
}
