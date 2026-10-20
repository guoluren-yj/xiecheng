import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'dva/router';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Steps } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { getRoutes, getResponse, isTenantRoleLevel } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { queryCompanyBasic } from '@/services/legalService';
import styles from './ProcessInfo.less';

const { Step } = Steps;

const routerPaths = [
  'legal',
  'business',
  'contact',
  'address',
  'bank',
  'invoice',
  'finance',
  'attachment',
  'preview',
];
@formatterCollections({
  code: [
    'spfm.enterprise',
    'hpfm.enterprise',
    'spfm.approval',
    'spfm.business',
    'hptl.portalAssign',
    'spfm.supplierManage',
  ],
})
@connect(({ enterpriseLegal, approvalPreview, global }) => ({
  enterpriseLegal,
  approvalPreview,
  routerData: global.routerData,
  isTenant: isTenantRoleLevel(),
}))
export default class RouteIndex extends Component {
  state = {
    inited: false,
  };

  componentWillMount() {
    // 加载公司的基本信息, 调用 legalInfoService 的方法
    const { dispatch, isTenant } = this.props;
    if (!isTenant) {
      dispatch({
        type: `enterpriseLegal/queryCompanyBasic`,
      }).then((res = {}) => {
        if (!isEmpty(res) && res.failed) {
          // 出错
          this.setState({
            inited: true,
          });
        } else {
          this.fetchPreviewDetail(res.companyId).then(() => {
            this.setState({
              companyId: res.companyId,
              company: res,
              inited: true,
            });
          });
        }
      });
    } else {
      const routerParam = querystring.parse(this.props.history.location.search.substr(1));
      if (routerParam.companyId && routerParam.companyId !== 'undefined') {
        this.fetchPreviewDetail(routerParam.companyId).then(() => {
          const {
            approvalPreview: { previewDetail },
          } = this.props;
          if (previewDetail && previewDetail.basic) {
            this.setState({
              companyId: previewDetail.basic.companyId,
              company: previewDetail.basic,
              inited: true,
            });
          }
        });
      } else {
        dispatch({
          type: `approvalPreview/updateState`,
          payload: {
            previewDetail: {},
          },
        });
        this.setState({
          companyId: undefined,
          inited: true,
          company: {},
        });
      }
    }
  }

  @Bind()
  fetchPreviewDetail(companyId) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'approvalPreview/fetchPreviewDetail',
      payload: {
        companyId,
        desensitize: false,
      },
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { location, dispatch, isTenant } = nextProps;
    const { companyId } = querystring.parse(location.search.substr(1));
    if (companyId && companyId !== 'undefined' && companyId !== nextState.companyId) {
      this.setState({
        companyId,
      });
      this.updateCompanyInfo();
    } else if (
      (!companyId || companyId === 'undefined') &&
      companyId !== nextState.companyId &&
      isTenant
    ) {
      dispatch({
        type: `approvalPreview/updateState`,
        payload: {
          previewDetail: {},
        },
      });
      this.setState({
        companyId,
        inited: true,
        company: {},
      });
    }
    if (this.state.inited === nextState.inited) {
      if (nextProps.location.pathname !== this.props.location.pathname) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  @Bind()
  updateCompanyInfo() {
    const { isTenant } = this.props;
    this.setState({
      inited: false,
    });
    if (!isTenant) {
      // 加载公司的基本信息, 调用 legalInfoService 的方法
      queryCompanyBasic().then((res) => {
        const r = getResponse(res);
        // 查询成功更新 公司信息
        if (r) {
          this.setState({
            company: res,
          });
        }
        if (r.processStatus === 'REJECT') {
          notification.warning({
            message: r.errorMessage,
          });
        }
        this.setState({
          inited: true,
        });
      });
    } else {
      const routerParam = querystring.parse(this.props.history.location.search.substr(1));
      if (routerParam.companyId && routerParam.companyId !== 'undefined') {
        this.fetchPreviewDetail(routerParam.companyId).then(() => {
          const {
            approvalPreview: { previewDetail },
          } = this.props;
          if (previewDetail && previewDetail.basic) {
            this.setState({
              companyId: routerParam.companyId,
              company: previewDetail.basic,
              inited: true,
            });
          }
        });
      }
    }
  }

  getCurrentStep() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    switch (pathList[pathList.length - 1]) {
      case routerPaths[0]:
        return 0;
      case routerPaths[1]:
        return 1;
      case routerPaths[2]:
        return 2;
      case routerPaths[3]:
        return 3;
      case routerPaths[4]:
        return 4;
      case routerPaths[5]:
        return 5;
      case routerPaths[6]:
        return 6;
      case routerPaths[7]:
        return 7;
      case routerPaths[8]:
        return 8;
      default:
        return 0;
    }
  }

  @Bind()
  redirect(route) {
    const { location, history, dispatch } = this.props;
    const { company = {} } = this.state;
    const routerParam = querystring.parse(this.props.history.location.search.substr(1));
    const { pathname } = location;
    const pathList = pathname.split('/');
    const companyId = company.companyId || routerParam.companyId;
    const { domesticForeignRelation } = company;
    if (route !== pathList[pathList.length - 1]) {
      if (companyId === undefined || companyId === 'undefined') {
        notification.warning({
          message: intl
            .get(`hpfm.enterprise.register.${routerPaths[0]}.fail`)
            .d('请先完善登记信息页'),
        });
      } else {
        dispatch({
          type: 'approvalPreview/fetchPreviewDetail',
          payload: {
            companyId,
            desensitize: false,
          },
        }).then(() => {
          const {
            approvalPreview: { previewDetail = {} },
          } = this.props;
          switch (route) {
            case routerPaths[8]:
            /* falls through */
            case routerPaths[7]:
            //   if (!+domesticForeignRelation) {
            //     if (previewDetail.attachmentList.length === 0) {
            //       notification.warning({
            //         message: intl
            //           .get(`hpfm.enterprise.register.${routerPaths[7]}.fail`)
            //           .d('请先完善公司附件页'),
            //       });
            //       return;
            //     }
            //   }
            /* falls through */
            case routerPaths[6]:
            /* falls through */
            case routerPaths[5]:
              if (previewDetail.invoice === undefined) {
                notification.warning({
                  message: intl
                    .get(`hpfm.enterprise.register.${routerPaths[5]}.fail`)
                    .d('请先完善开票信息页'),
                });
                return;
              }
            /* falls through */
            case routerPaths[4]:
            // if (previewDetail.bankAccountList.length === 0) {
            //   notification.warning({
            //     message: intl
            //       .get(`hpfm.enterprise.register.${routerPaths[4]}.fail`)
            //       .d('请先完善银行信息页'),
            //   });
            //   return;
            // }
            /* falls through */
            case routerPaths[3]:
            // if (previewDetail.addressList.length === 0) {
            //   notification.warning({
            //     message: intl
            //       .get(`hpfm.enterprise.register.${routerPaths[3]}.fail`)
            //       .d('请先完善地址信息页'),
            //   });
            //   return;
            // }
            /* falls through */
            case routerPaths[2]:
              if (previewDetail.contactList.length === 0) {
                notification.warning({
                  message: intl
                    .get(`hpfm.enterprise.register.${routerPaths[2]}.fail`)
                    .d('请先完善联系人信息页'),
                });
                return;
              }
            /* falls through */
            case routerPaths[1]:
              if (previewDetail.business.companyId === undefined) {
                notification.warning({
                  message: intl
                    .get(`hpfm.enterprise.register.${routerPaths[1]}.fail`)
                    .d('请先完善业务信息页'),
                });
                return;
              }
            /* falls through */
            case routerPaths[0]:
            /* falls through */
            default:
              history.push(
                `${SRM_PLATFORM}/enterprise/register/${route}?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}`
              );
          }
        });
      }
    }
  }

  render() {
    const {
      match,
      routerData,
      approvalPreview: { previewDetail = {} },
      isTenant,
    } = this.props;
    const {
      addressList = [],
      attachmentList = [],
      bankAccountList = [],
      business = {},
      contactList = [],
      financeList = [],
      invoice = {},
    } = previewDetail;
    const routes = getRoutes(match.path, routerData);
    const { pathname } = location;
    const pathList = pathname.split('/');
    const path = pathList[pathList.length - 1];
    const { inited, company = {} } = this.state;
    let content;
    const { processStatus = 'NEW', domesticForeignRelation = 1 } = company;
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    const { changFlag = 0, pageSource = '' } = routerParam;
    const companyId = isTenant ? routerParam.companyId : company.companyId;
    const isCreate = isTenant && (!routerParam.companyId || routerParam.companyId === 'undefined');
    if (inited === false) return null;
    const resultRoute = [];
    routes.forEach((item) => {
      if (
        item.path === `${SRM_PLATFORM}/enterprise/register/result` ||
        item.path === `${SRM_PLATFORM}/enterprise/register/preview`
      ) {
        resultRoute.push(item);
      }
    });

    // 注册过程中的 route,
    const regRoutes = routes.filter((r) => r.path !== `${SRM_PLATFORM}/enterprise/register/result`);
    // 注册过程中 可能出现的非法的地址
    // 重定向再次打开tab时路由
    const redirectHomeRoute = (pageSource === 'legal' || isTenant)
    ?
      `${SRM_PLATFORM}/enterprise/register/legal?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}&changFlag=${changFlag}`
    : (
      `${SRM_PLATFORM}/enterprise/register/legal`
    );
    const redirectRoutes = [
      <Redirect
        exact
        key="index"
        from={`${SRM_PLATFORM}/enterprise/register`}
        to={redirectHomeRoute}
      />,
      <Redirect
        exact
        key="result"
        from={`${SRM_PLATFORM}/enterprise/register/result`}
        to={
          isTenant
            ? `${SRM_PLATFORM}/enterprise/register/legal?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}&changFlag=${changFlag}`
            : `${SRM_PLATFORM}/enterprise/register/legal`
        }
      />,
    ];
    if (
      !isCreate &&
      (processStatus === 'SUBMIT' ||
        processStatus === 'COMPLETE' ||
        processStatus === 'APPROVING' ||
        processStatus === 'WFL_REJECT')
    ) {
      return (
        <Switch>
          {resultRoute.map((item) => {
            return (
              <Route
                key={item.path}
                path={item.path}
                render={(props) => (
                  <item.component
                    {...{
                      ...props,
                      company,
                      isTenant,
                      previewDetail,
                      fetchPreviewDetail: this.fetchPreviewDetail,
                      updateCompanyInfo: this.updateCompanyInfo,
                    }}
                  />
                )}
                exact={item.exact}
              />
            );
          })}
          <Redirect
            form={`${SRM_PLATFORM}/enterprise/register`}
            to={
              isTenant
                ? `${SRM_PLATFORM}/enterprise/register/preview?companyId=${companyId}&domesticForeignRelation=${domesticForeignRelation}&changFlag=${changFlag}`
                : `${SRM_PLATFORM}/enterprise/register/result`
            }
          />
        </Switch>
      );
    } else {
      content = (
        <React.Fragment>
          <div
            style={{
              display: 'flex',
              height: '100%',
            }}
          >
            <div
              className="wizard-menu"
              style={{
                flex: '0 0 auto',
                width: '228px',
                borderRight: '1px solid #ebedf2',
                background: '#f8f8f8',
              }}
            >
              <Steps
                className={styles['approval-step']}
                size="small"
                direction="vertical"
                current={this.getCurrentStep()}
                style={{ width: '200px', margin: '20px 24px' }}
              >
                <Step
                  onClick={() => this.redirect(routerPaths[0])}
                  title={intl.get('spfm.enterprise.view.message.page.regInfo').d('登记信息')}
                />
                <Step
                  onClick={() => this.redirect(routerPaths[1])}
                  title={intl.get('spfm.enterprise.view.message.page.businessInfo').d('基础业务信息')}
                  status={
                    business.companyId !== undefined && path !== routerPaths[1] ? 'finish' : null
                  }
                />
                <Step
                  onClick={() => this.redirect(routerPaths[2])}
                  title={intl.get('spfm.enterprise.view.message.page.contactInfo').d('联系人信息')}
                  status={contactList.length !== 0 && path !== routerPaths[2] ? 'finish' : null}
                />
                <Step
                  onClick={() => this.redirect(routerPaths[3])}
                  title={intl.get('spfm.enterprise.view.message.page.addressInfo').d('地址信息')}
                  status={addressList.length !== 0 && path !== routerPaths[3] ? 'finish' : null}
                />
                <Step
                  onClick={() => this.redirect(routerPaths[4])}
                  title={intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息')}
                  status={bankAccountList.length !== 0 && path !== routerPaths[4] ? 'finish' : null}
                />
                <Step
                  onClick={() => this.redirect(routerPaths[5])}
                  title={intl.get('spfm.enterprise.view.message.page.invoiceInfo').d('开票信息')}
                  status={
                    invoice.companyId !== undefined && path !== routerPaths[5] ? 'finish' : null
                  }
                />
                <Step
                  onClick={() => this.redirect(routerPaths[6])}
                  title={intl.get('spfm.enterprise.view.message.page.financeInfo').d('财务信息')}
                  status={financeList.length !== 0 && path !== routerPaths[6] ? 'finish' : null}
                />
                <Step
                  onClick={() => this.redirect(routerPaths[7])}
                  title={intl.get('spfm.enterprise.view.message.page.attachmentInfo').d('公司附件')}
                  status={attachmentList.length !== 0 && path !== routerPaths[7] ? 'finish' : null}
                />
                <Step
                  onClick={() => this.redirect(routerPaths[8])}
                  title={intl.get('spfm.enterprise.view.message.page.preview').d('查看预览')}
                />
              </Steps>
            </div>
            <div
              className="wizard-content"
              style={{
                flex: 'auto',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Switch>
                {regRoutes.map((item) => {
                  return (
                    <Route
                      key={item.key}
                      path={item.path}
                      component={(props) =>
                        React.createElement(item.component, {
                          ...props,
                          companyId,
                          company,
                          isTenant,
                          previewDetail,
                          fetchPreviewDetail: this.fetchPreviewDetail,
                          updateCompanyInfo: this.updateCompanyInfo,
                        })
                      }
                      exact={item.exact}
                    />
                  );
                })}
                {redirectRoutes}
              </Switch>
            </div>
          </div>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Header
          title={
            <div
              className="wizard-menu-title"
              style={{
                height: '48px',
                flex: '0 0 auto',
                backgroundColor: '#fff',
                borderBottom: '1px solid #eee',
              }}
            >
              <div style={{ fontSize: '16px', lineHeight: '48px' }}>
                {intl.get('spfm.enterprise.view.message.companyInfo').d('企业信息')}
              </div>
            </div>
          }
        />
        <Content style={{ height: '100%', padding: 0, backgroundColor: '#fff' }}>{content}</Content>
      </React.Fragment>
    );
  }
}
