/**
 * @date 2019-03-04
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */
import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { withRouter, Route } from 'dva/router';
import { connect } from 'dva';
import { isNil, startsWith } from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'query-string';
import moment from 'moment';
import 'moment-timezone';

import Exception from 'components/Exception';
import intl from 'utils/intl';
import {
  extractRedirectTenantIdFormHash,
  extractAccessTokenFromHash,
  extractRefreshTokenFromHash,
  extractErrorMessageFromSearch,
  setAccessToken,
  setRefreshToken,
  getCurrentOrganizationId,
  getCurrentRole,
  setSession,
  getResponse,
  getCurrentUser,
  setLanguageStorage,
} from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import { CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE, YQCLOUD_TABMAP, YQCLOUD_COUNT, GMT2ETCMap } from 'utils/constants';
import { cleanMenuTabs, closeTab, getTabData, getIsPubLayout } from 'utils/menuTab';
import { queryCurrentPayment, checkTenantRole } from 'services/user';
import MiniLayout from '../../layouts/MiniLayout';

function checkIsWorkflowPubPage({ pathname, search }) {
  return pathname && /\/hwfp\/(approval\/)?task\/detail(\/)/.test(pathname) && search && search.includes('isPub=true');
}

import PubAuthorizedRoute from './PubAuthorizedRoute';
import PubLayout from '../../layouts/PubLayout';

@withRouter
@connect()
export default class AuthorizedRoute extends React.Component {
  config = getEnvConfig();

  constructor(props) {
    super(props);
    this.state = {
      isAuthorized: false,
      isException: false,
      // isWorkflowPubPage: false,
    };
  }

  componentDidMount() {
    const originHref = window.location.href;
    // 清除pub/public页面创建的tab,防止从pub/public页面跳转到普通页面时，tab仍保留问题
    this.cleanUnAuthorizedTabs();
    const { dispatch, history, location } = this.props;
    if (checkIsWorkflowPubPage(location)) {
      this.setState({ 
        isAuthorized: true,
      })
      return;
    }
    const { TRACE_LOG_ENABLE } = this.config;
    const redirectUrl = (location.pathname || '').concat(location.search || '');
    const redirectTenantId = extractRedirectTenantIdFormHash(window.location.hash);
    const token = extractAccessTokenFromHash(window.location.hash);
    const refreshToken = extractRefreshTokenFromHash(window.location.hash);
    const errorMessage = extractErrorMessageFromSearch(window.location.search);
    if (errorMessage) {
      history.push({
        pathname: '/public/error-message',
        state: {
          message: errorMessage,
        },
      });
      return;
    } else if (token) {
      setAccessToken(token, 60 * 60);
      setRefreshToken(refreshToken, 60 * 60);
      // 保留上次退出时的页面路径和search
      history.push({
        pathname: location.pathname,
        search: location.search,
      });
    }

    let isTraceLog = false;
    try {
      isTraceLog = TRACE_LOG_ENABLE ? JSON.parse(TRACE_LOG_ENABLE) : false;
    } catch (e) {
      isTraceLog = false;
    }
    window.addEventListener('storage', this.handleStorageChange);
    dispatch({
      type: 'user/fetchCurrent',
    }).then(async (res) => {
      if (res) {
        if (!(res instanceof Error)) {
          if (!res.failed) {
            const { tenantId, language, currentRoleId, currentRoleLevel, timeZone } = res;
            moment.tz.setDefault(GMT2ETCMap[timeZone] || timeZone);
            // 请求 self 接口成功
            // 设置当前语言到session
            setLanguageStorage(language);
            // 登陆成功后记录当前登陆租户、角色和语言
            localStorage.setItem(
              CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE,
              `${tenantId}-${currentRoleId}-${language}-${timeZone}`
            );
            // 查询供应商缴费情况
            await this.checkCurrentPayment(res);
            dispatch({
              type: 'global/baseInit',
              payload: {
                language: language, // 加载菜单国际化
                organizationId: getCurrentOrganizationId(),
                // FIXME: 等 菜单接口好后删除
                roleId: getCurrentRole().id,
                roleLevel: currentRoleLevel,
                isPubLayout: this.checkIsPubLayout(),
              },
            }).then(() => {
              this.setState({
                isAuthorized: true,
              });
              // 等多语言查询完再弹窗
              if (!isNil(redirectTenantId) && redirectTenantId != tenantId)  {
                this.checkRedirectTenant({ redirectTenantId, redirectUrl });
              }
            });
            if (isTraceLog) {
              dispatch({
                type: 'global/getTraceStatus',
              });
            }
          } else {
            // 清除首屏loading
            const loader = document.querySelector('#loader-wrapper');
            this.setState({
              isException: true,
            });
            if (loader) {
              loader.parentNode.removeChild(loader);
            }
            history.push({
              pathname: '/public/self-error',
              state: {
                message: res.message,
              },
            });
          }
        } else {
          // 其他错误
          this.setState({
            isException: true,
          });
          // 清除首屏loading
          const loader = document.querySelector('#loader-wrapper');
          if (loader) {
            document.body.removeChild(loader);
          }
          history.push('/exception/500');
        }
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  @Bind()
  async checkRedirectTenant({ redirectTenantId, redirectUrl }) {
    const res = await checkTenantRole({ tenantId: redirectTenantId });
    if (getResponse(res) && res) {
      if (res.hasTenantRole) {
        Modal.open({
          title: intl.get('hzero.common.view.title.tenantSwitch').d('租户切换提示'),
          children: intl.get('hzero.common.view.title.tenantSwitch.tip', { tenantName: res.tenantName }).d(`请切换至【${res.tenantName}】租户下处理该业务`),
          okText: intl.get('hzero.common.view.title.tenantSwitch.button').d('点击切换'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          style: { zIndex: 14000000 },
          closeOnLocationChange: false,
          border: false,
          onOk: () => {
            this.props.dispatch({
              type: 'user/updateCurrentTenant',
              payload: { tenantId: redirectTenantId },
            }).then((res) => {
              if (res) {
                this.props.dispatch(routerRedux.push({ pathname: redirectUrl }));
                window.location.reload();
              }
            });
          },
        });
      } else {
        Modal.open({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl.get('hzero.common.view.title.tenantSwitch.false.tip').d(`您的账号暂无权限访问该消息对应的单据信息，请联系管理员分配相关权限后再进行操作`),
          closeOnLocationChange: false,
          style: { zIndex: 14000000 },
          border: false,
          footer: okBtn => okBtn,
        });
      }
    }
  }

  @Bind()
  handleStorageChange(data) {
    if (!data) {
      return;
    }
    if (data.key === CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE) {
      const { tenantId, currentRoleId, language, timeZone } = getCurrentUser();
      const currentLoginUser = `${tenantId}-${currentRoleId}-${language}-${timeZone}`;
      // 切换租户、角色或退出登陆时刷新所有tab
      if (data.newValue !== currentLoginUser) {
        const { BASE_PATH } = this.config;
        localStorage.removeItem(YQCLOUD_TABMAP);
        localStorage.removeItem(YQCLOUD_COUNT);
        window.location.href = BASE_PATH || '/';
      }
    }
  }

  @Bind()
  cleanUnAuthorizedTabs() {
    const tabs = getTabData();
    if (tabs && tabs.length) {
      tabs.forEach((item) => {
        if (item.path && (startsWith(item.path, '/pub/') || startsWith(item.path, '/public/'))) {
          // closeTab(item.key);
          // closeTab会自动跳转到其他tab, 故此处改成直接调用removeTab
          this.props.dispatch({
            type: 'global/removeTab',
            payload: item.key || item.path,
          });
        }
      });
    }
  }

  @Bind()
  checkIsPubLayout() {
    const { history: { location: { search = '' } = {} } = {} } = this.props;
    const { isPub } = qs.parse(search) || {};
    return getIsPubLayout() || isPub === 'true';
  }

  @Bind()
  async checkCurrentPayment(current) {
    const { additionInfo, currentRoleLevel, organizationId, tenantId, tenantNum } = current;
    const { ownExpense, organizationNum } = additionInfo || {};
    const { location } = this.props;
    const { payBack } = qs.parse(location.search) || {};
    // ownExpense 表示自费，也就是不需要供应商缴费，为0的时候需要供应商缴费
    // payBack ⽀付回调必传，如果⽀付成功回跳⼯作台，需要从url路径取出该字段进⾏传参
    const isSupplier = tenantId !== 0 &&  organizationId !== 0 && currentRoleLevel !== 'site' && organizationId !== tenantId; // 供应商
    const needPayment = (isSupplier && !isNil(ownExpense) && Number(ownExpense) === 0) || payBack;
    if (needPayment) {
      const params = {
        tenantId,
        coreTenantCode: tenantNum,
        supplierTenantCode: organizationNum,
      };
      if (payBack) {
        params.payBack = payBack === 'true';
      }
      const res = await queryCurrentPayment(params);
      if (getResponse(res)) {
        if (!res.data) {
          return;
        }
        this.props.dispatch({
          type: 'global/updateState',
          payload: {
            menuHidden: true,
          },
        });
        this.props.dispatch({
          type: 'user/updateCurrentUser',
          payload: {
            menuLayout: 'inline',
            paymentData: res.data,
          },
        });
        cleanMenuTabs();
      }
    }
  }

  render() {
    const { render, ...rest } = this.props;
    const {
      location: { search },
    } = rest;
    const { isAuthorized, isException } = this.state;
    // eslint-disable-next-line no-nested-ternary
    if (checkIsWorkflowPubPage(this.props.location)) {
      return <MiniLayout {...rest} render={(props) => render(props)} />
    }
    return isAuthorized === true ? (
      <Route {...rest} render={(props) => render(props)} />
    ) : isException === true ? (
      <Exception type="500" />
    ) : null;
  }
}
