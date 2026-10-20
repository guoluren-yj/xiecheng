import React from 'react';
import { isEmpty } from 'lodash';
import { Button, Modal, Radio } from 'choerodon-ui';
import { Button as ButtonPro } from 'choerodon-ui/pro';
import loadScript from 'load-script';
import moment from 'moment';
import { connect } from 'dva';
import Cookies from 'universal-cookie';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import remote from 'utils/remote';
import {
  getResponse,
  getAccessToken,
  getCurrentLanguage,
  getCurrentTenant,
  getCurrentUser,
  getCurrentUserId,
  getCurrentOrganizationId,
  getUserOrganizationId,
  encryptPwd,
} from 'utils/utils';
import { HZERO_IAM, LOGIN_URL } from 'utils/config';
import { getDvaApp, getEnvConfig } from 'utils/iocUtils';
import request from 'utils/request';
import {
  SRM_MALL,
  SRM_MALL_HOST,
  SRM_PLATFORM,
  SRM_SSLM,
  SRM_SWBH,
  SRM_INTERFACE,
} from '@/utils/config';
import notification from 'utils/notification';
import SystemNotification from '@/components/SystemNotification';
import HelpRobot from '@/components/HelpRobot';
import PrivacyPolicies from '@/components/PrivacyPolicies';
import SuperQuery from '../SuperQuery';
import AliyunPing from '../AliyunPing';
import UserStatusContext from './UserStatusContext';
import UserSurvey from '../UserSurvey';
// import ERModal from '../EnterpriseRecoveryModal';
import styles from './index.less';
import hjllogo from './hjllogo.png';
import supplierVip from './supplierVip.jpg';

const cookies = new Cookies();
const UserStatusProvider = UserStatusContext.Provider;
const { PUBLIC_URL, HSCF_HOST, APP_NAME } = getEnvConfig();

const screenResources = [
  `${PUBLIC_URL}/lib/screenPrint/html2canvas.min.js`,
  `${PUBLIC_URL}/lib/screenPrint/watermark.js`,
  `${PUBLIC_URL}/lib/screenPrint/index.js`,
];
const isSeed = APP_NAME === 'seed';
@connect(({ global }) => {
  const { workbenchPermission } = global;
  const { docDataSearchFlag } = workbenchPermission || {};
  return {
    docDataSearchFlag,
  };
})
@remote({
  code: 'SRM_COMMON_LEAD_LINK',
  name: 'processRemote',
})
@formatterCollections({ code: ['srm.common'] })
export default class LeadLink extends React.Component {
  constructor(props) {
    super(props);
    const { additionInfo } = getCurrentUser();
    const { originUserLanguageHash } = additionInfo || {};
    let languageChangeConfirmFlag = true;
    if (
      originUserLanguageHash &&
      originUserLanguageHash === cookies.get('originUserLanguageHash')
    ) {
      languageChangeConfirmFlag = false;
    } else {
      cookies.set('originUserLanguageHash', originUserLanguageHash || '');
    }
    this.state = {
      isNewPortal: false,
      navList: [],
      mallHost: undefined,
      mallLink: false,
      financialLink: false,
      financialMarketAgreed: {},
      visible: false,
      isAgreed: 1,
      showPortal: false,
      workbenchHide: false,
      languageChangeConfirmFlag,
      /**
       * @type {Promise | undefined}
       */
      userStatus: undefined,
      supplierVipInfo: {
        attributeTinyint1: 0,
        attributeDate1: '',
        attributeDate2: '',
      },
      singleLoginFlag: false,
    };
    this.finishPrivacyPolicies = {
      resolve: () => {},
      promise: undefined,
    };
    this.finishPrivacyPolicies.promise = new Promise((res) => {
      this.finishPrivacyPolicies.resolve = res;
    });
  }

  /**
   * 查询角色是否开启超级查询配置
   */
  queryWorkbenchHide = () => {
    return request(`${SRM_SWBH}/v1/${getCurrentOrganizationId()}/card-setting/doc-search-setting`);
  };

  /**
   * 查询是否能跳转门户
   */
  queryPortal = () => {
    return request(`${SRM_PLATFORM}/v1/portal-layouts/layout-show-middle-pub`);
  };

  /**
   * 获取吗模板中的导航配置项
   */
  getLayoutNavConfig = (params) => {
    return request(`${SRM_PLATFORM}/v1/portal-layouts/layout-nav`, {
      method: 'GET',
      query: params,
    });
  };

  /**
   * 查询二级地址商城域名配置
   */
  queryMallHost = () => {
    const srmUrl = window.location.origin;
    return request(`${SRM_MALL}/v1/mall-page-configs/mall-config`, {
      method: 'GET',
      query: { srmUrl },
    });
  };

  queryLinkConfig = () => {
    const url = window.location.host;
    return request(`${SRM_PLATFORM}/v1/portal-assigns-cache`, {
      method: 'GET',
      query: { url },
    });
  };

  /**
   * 查询供应商VIP信息
   */
  querySupplierVipConfig = () => {
    return request(
      `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/supplier-pool/query-with-tenant-id`,
      {
        method: 'GET',
        query: { supplierTenantId: getUserOrganizationId() },
      }
    );
  };

  /**
   * 记录金融超市点击次数
   * @returns
   */
  handleSaveFinancialMarketClick = () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      // 获取当前环境
      const currentEnv = window.$$env.ENV_FLAG;
      const urlPath = ['dev', 'test'].includes(currentEnv)
        ? 'U0FQX1pIRU5ZVU58c2N1eC1jb21tb243'
        : 'WkhFTllVTl9LRDkzU1o5MUpTfHNjdXgtY29tbW9uNw==';
      const currentTime = new Date().getTime();
      const plainText = `CLICK|${currentTime}`;
      const secret = encryptPwd(
        plainText,
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCZB5Z9Ye6i8Hsy5K0wXqg079z79ty8Tz1D5CDbsZCb2h7Y1iBu98wVTEgFEsIMezQIl99OUTyWbxgxAi5nmkcXxecZZroERHjMbGV6Pp1C+Uy5koQGae4Z5N5Sy3YCE/mHhl6UgsH4ryGnKi/SgNFB6leAIipRw1e6Ov7Mj9mhEQIDAQAB'
      );
      // 用户所属租户信息
      const { id, realName, additionInfo = {} } = getCurrentUser();
      const { organizationName, organizationNum } = additionInfo;
      // 当前租户信息
      const { tenantId } = getCurrentTenant();
      return request(`${SRM_INTERFACE}/v1/public/generic-task/execute/${urlPath}`, {
        method: 'POST',
        body: {
          tenant: organizationNum,
          supplier: organizationName,
          purTenantId: tenantId,
          userId: id,
          userName: realName,
          clickTime: moment().format(DEFAULT_DATETIME_FORMAT),
          secret,
        },
      });
    }
  };

  componentDidMount() {
    // PC 端多端登陆校验
    this.fetchSingleLoginStatus();
    this.queryPortal().then((res) => {
      if (res) {
        this.setState({
          showPortal: true,
        });
      }
    });
    this.getLayoutNavConfig({
      userId: getCurrentUserId(),
      language: getCurrentLanguage(),
    }).then((res = {}) => {
      const { cardContent, failed } = res;
      const isNewPortal = !isEmpty(res) && !failed && !!cardContent;
      this.setState({
        isNewPortal,
      });
      if (isNewPortal && !isEmpty(cardContent.navList)) {
        let { navList = [] } = cardContent;
        const { domainTenantId } = res;
        if (domainTenantId === getCurrentOrganizationId()) {
          const { prefix = '' } = res;
          navList = navList.map((item) => {
            if (item.link) {
              const link = item.link.replace(/\{prefix\}/g, prefix);
              return { ...item, link };
            }
            return item;
          });

          this.setState({
            navList: navList.sort((a, b) => {
              return a.position - b.position;
            }),
          });
        }
      }
    });

    if (!isSeed) {
      if (getUserOrganizationId() === getCurrentOrganizationId() && this.props.docDataSearchFlag) {
        this.queryWorkbenchHide().then((res) => {
          if (res && !res.failed) {
            const { displayTypeList = [] } = res;
            this.setState({
              workbenchHide: displayTypeList.includes('PORTAL'),
            });
          }
        });
      }
      this.queryMallHost().then((res) => {
        if (!isEmpty(res)) {
          this.setState({
            mallHost: res.webUrl,
          });
        }
      });
    }
    this.queryLinkConfig().then((res) => {
      if (!isEmpty(res) && !res.failed && res.navbar) {
        const configs = JSON.parse(res.navbar);
        if (configs.length > 0) {
          const jsonConfig = configs.map((c) => JSON.parse(c));
          this.setState({
            mallLink: jsonConfig.find((r) => r.content === 'mallLink')?.description || true,
            financialLink:
              jsonConfig.find((r) => r.content === 'financialLink')?.description || true,
          });
        }
      } else {
        this.setState({
          mallLink: true,
          financialLink: true,
        });
      }
    });
    this.fetchIsFinancialMarketAgreed();
    this.initScreenPrint();
    this.initSupplierVip();
    this.queryUserStatus();
  }

  componentWillReceiveProps(nextProps) {
    if (
      !isSeed &&
      nextProps.docDataSearchFlag &&
      !this.props.docDataSearchFlag &&
      nextProps.docDataSearchFlag !== this.props.docDataSearchFlag &&
      getUserOrganizationId() === getCurrentOrganizationId()
    ) {
      this.queryWorkbenchHide().then((res) => {
        if (res && !res.failed) {
          const { displayTypeList = [] } = res;
          this.setState({
            workbenchHide: displayTypeList.includes('PORTAL'),
          });
        }
      });
    }
  }

  fetchSingleLoginStatus = () => {
    request(`${HZERO_IAM}/hzero/v1/users/single-login/status`, {
      method: 'GET',
    }).then((res) => {
      if (getResponse(res) && res === true) {
        this.setState({ singleLoginFlag: true });
      }
    });
  };

  queryUserStatus(setUserStatus) {
    // 如果是不是供应商则弹出隐私政策
    const isNotSupplier = getUserOrganizationId() === getCurrentOrganizationId();
    if (isNotSupplier) {
      this.setState({
        userStatus: request(
          `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/user-status?userEnd=SRM-PC`
        ).then((res) => getResponse(res)),
      });
    }
  }

  fetchIsFinancialMarketAgreed = () => {
    request(`${HZERO_IAM}/v1/usermktagreements`, {
      method: 'GET',
    }).then((res) => {
      if (res) {
        this.setState({ financialMarketAgreed: res });
      }
    });
  };

  initScreenPrint = () => {
    if (getCurrentTenant() && getCurrentTenant().tenantNum === 'SRM-AUX') {
      const promises = [];
      screenResources.forEach((item) => {
        loadScript(item, (error) => {
          if (error) {
            console.warn(error);
          } else {
            promises.push(true);
            if (window.screenPrint && promises.length === screenResources.length) {
              window.screenPrint.init('.hzero-normal-header-right-item');
            }
          }
        });
      });
    }
  };

  initSupplierVip = () => {
    if (getCurrentTenant() && getCurrentTenant().tenantNum === 'SRM-WATSONS') {
      this.querySupplierVipConfig().then((res) => {
        if (res && res.attributeTinyint1) {
          this.setState({
            supplierVipInfo: {
              ...res,
              attributeDate1: moment(res.attributeDate1).format('YYYY/MM/DD'),
              attributeDate2: moment(res.attributeDate2).format('YYYY/MM/DD'),
            },
          });
        }
      });
    }
  };

  handleModalOC = (bool) => {
    this.setState({ visible: bool }, () => {
      const { visible } = this.state;
      if (visible) {
        this.setState({ isAgreed: 1 });
      }
    });
  };

  handleFinancialMarketClick = (bool, link) => {
    const href = link || window.$$env.SUPPLY_CHAIN_FINANCE_URL;
    this.handleWindowOpen(href);
  };

  handleWindowOpen = (str) => {
    if (str) {
      window.open(str);
      this.handleSaveFinancialMarketClick();
    }
  };

  handleModalOk = () => {
    const { financialMarketAgreed, isAgreed = 0 } = this.state;
    // const { loginName } = getCurrentUser();
    if (isAgreed === 1) {
      request(`${HZERO_IAM}/v1/usermktagreements`, {
        method: 'POST',
        body: { ...financialMarketAgreed, mktAgreementFlag: isAgreed },
      }).then((res) => {
        if (res) {
          const { mktAgreementFlag = 1 } = res;
          notification.success();
          this.setState({
            financialMarketAgreed: { ...financialMarketAgreed, mktAgreementFlag },
          });
          this.handleModalOC(false);
          this.handleWindowOpen(window.$$env.SUPPLY_CHAIN_FINANCE_URL);
        }
      });
    } else {
      this.handleWindowOpen(window.$$env.SUPPLY_CHAIN_FINANCE_URL);
    }
  };

  handleViewed = ({ target = {} } = {}) => {
    const { value } = target;
    this.setState({
      isAgreed: value,
    });
  };

  handleSingleLoginOk = () => {
    request(`${HZERO_IAM}/hzero/v1/users/single-login/kick-out`, {
      method: 'POST',
    });
    this.setState({ singleLoginFlag: false });
  };

  handleSingleLoginCancel = () => {
    const { dvaApp } = window;
    if (dvaApp && dvaApp._store && dvaApp._store.dispatch) {
      dvaApp._store.dispatch({
        type: 'login/logout',
      });
    }
  };

  closeLanguageChangeConfirmModal = () => {
    this.setState({
      languageChangeConfirmFlag: false,
    });
  };

  render() {
    //  eslint-disable-next-line
    const {
      mallHost,
      mallLink,
      financialLink,
      isAgreed = 1,
      showPortal,
      navList: stateNavList = [],
      isNewPortal,
      supplierVipInfo,
      workbenchHide,
      singleLoginFlag,
      languageChangeConfirmFlag,
    } = this.state;
    const { processRemote } = this.props;
    const isPurchaser = getUserOrganizationId() === getCurrentOrganizationId();
    const isUBRAS = getCurrentTenant().tenantNum === 'SRM-UBRAS';
    const accessToken = getAccessToken();
    const { logo, menuLayout, tenantName, languageName, additionInfo } = getCurrentUser();
    const { originUserLanguage } = additionInfo || {};
    const language = getCurrentLanguage();
    const showFlag = !getDvaApp()._store.getState().global.menuHidden;
    const { attributeTinyint1, attributeDate1, attributeDate2 } = supplierVipInfo;
    const vipFlag = attributeTinyint1 && attributeDate1 && attributeDate2;
    const isSiderAllLayout = menuLayout === 'side-all';
    const navList = processRemote.process('SRM_COMMON_LEAD_LINK_NAV_BUTTON', stateNavList, {
      buttons: stateNavList,
    });
    return (
      <React.Fragment>
        {vipFlag ? (
          <div className={styles['header-vip']}>
            <img src={supplierVip} alt="vip" />
            <span>
              {attributeDate1} —— {attributeDate2}
            </span>
          </div>
        ) : null}
        {isPurchaser && workbenchHide && !isSiderAllLayout && <SuperQuery />}
        {!!+mallLink && !isNewPortal && (
          <a
            className={styles['header-link']}
            target="_blank"
            rel="noopener noreferrer"
            //  eslint-disable-next-line
            href={`${mallHost || SRM_MALL_HOST}#access_token=${accessToken}`}
          >
            <span>{intl.get('srm.common.view.title.enterpriseMall').d('企业商城')}</span>
          </a>
        )}
        {!!+financialLink && !isNewPortal && (
          <a
            className={styles['header-link']}
            target="_blank"
            rel="noopener noreferrer"
            // href="${HSCF_HOST}/mkt/index"
            onClick={() => this.handleFinancialMarketClick(true)}
          >
            <span>{intl.get('srm.common.view.title.financialMarket').d('供应链金融')}</span>
          </a>
        )}
        {isNewPortal &&
          navList.map((item) => {
            let isBuy;
            let isHjl;
            let { link } = item;
            if (link) {
              isBuy =
                link.includes('going-buy.com') || link.includes('-buy') || link.includes('mall');
              isHjl = link.includes('scf.going-link.com/PC/index');
            }
            if (isBuy) {
              link = `${link}#access_token=${accessToken}`;
            } else if (isHjl) {
              /* eslint-disable-next-line no-script-url */
              link = 'javascript:void(0)';
            }
            return (
              <a
                className={styles['header-link']}
                target={isHjl ? '' : '_blank'}
                rel="noopener noreferrer"
                href={link}
                key={item.position}
                onClick={() => isHjl && this.handleFinancialMarketClick(true, item.link)}
              >
                <span>{(item._tls && item._tls.name[language]) || item.name}</span>
              </a>
            );
          })}
        {showPortal && !isUBRAS && (
          <a
            className={styles['header-link']}
            target="_blank"
            rel="noopener noreferrer"
            href={LOGIN_URL}
          >
            <span>{intl.get('srm.common.view.title.SRMPortal').d('SRM门户')}</span>
          </a>
        )}
        {isPurchaser && workbenchHide && isSiderAllLayout && <SuperQuery />}
        {showFlag && (
          <>
            <SystemNotification />
            <UserStatusProvider value={this.state.userStatus}>
              <PrivacyPolicies lock={this.finishPrivacyPolicies} />
              <UserSurvey lock={this.finishPrivacyPolicies} />
              <AliyunPing lock={this.finishPrivacyPolicies} />
            </UserStatusProvider>
            <Modal
              width={600}
              visible={this.state.visible}
              // onOk={this.handleOk}
              onCancel={() => this.handleModalOC(false)}
              className={styles['c7n-modal']}
              footer={null}
              center
            >
              <div className="modalTop">
                <span className="logoSelf">
                  <img src={logo} alt="logo" />
                </span>
                <span className="lineTo">
                  {intl.get('srm.common.view.message.authorizeSupplyChain').d('授权供应链')}
                  <span className="lineToIcon" />
                </span>
                <span className="logoF">
                  <img src={hjllogo} alt="logo" />
                </span>
              </div>
              <div className="modalBottom">
                <div>
                  <p>{intl.get('srm.common.view.message.helloUser').d('尊敬的用户，您好！')}</p>
                  <p style={{ marginBottom: '22px' }}>
                    {intl.get('srm.common.view.message.authorizeTip1').d(`即将跳转至`)}
                    <strong>
                      {' '}
                      {intl.get('srm.common.view.title.financialMarket').d('供应链金融')}{' '}
                    </strong>
                    {intl
                      .get('srm.common.view.message.authorizeTip2')
                      .d(
                        `界面，系统将获取您的一些关键信息，如子账户、手机号、邮箱、企业名称、统一社会信用代码、合作伙伴关系等，详情见`
                      )}
                    <strong>
                      {' '}
                      {intl
                        .get('srm.common.view.message.SRMLicenseAgreement')
                        .d('SRM授权协议')}{' '}
                    </strong>
                    {intl
                      .get('srm.common.view.message.authorizeTip3')
                      .d('！，点击取消返回SRM工作台主界面！')}
                  </p>
                </div>
                <Radio.Group
                  onChange={this.handleViewed}
                  value={isAgreed}
                  style={{ marginBottom: '25px' }}
                >
                  <Radio style={{ display: 'block', marginBottom: '8px' }} value={1}>
                    {intl.get('srm.common.view.message.agreed').d('我已阅读，并同意授权')}
                    <a
                      href={
                        window.location.pathname.split('/')[1] === 'app'
                          ? '/app/pub/spfm/srm-authorize-HJL'
                          : '/pub/spfm/srm-authorize-HJL'
                      }
                      style={{ fontSize: '12px', marginLeft: '10px' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {intl.get('srm.common.view.message.SRMLicenseAgreement').d('SRM授权协议')}
                    </a>
                  </Radio>
                  <Radio style={{ display: 'block', marginBottom: '8px' }} value={0}>
                    {intl.get('srm.common.view.message.noAgreed').d('不授权，直接进入金融超市')}
                  </Radio>
                </Radio.Group>
                <div>
                  <Button
                    funcType="raised"
                    type="primary"
                    style={{ marginRight: '15px' }}
                    onClick={this.handleModalOk}
                  >
                    {intl.get('hzero.common.button.ok').d('确定')}
                  </Button>
                  <Button funcType="raised" onClick={() => this.handleModalOC(false)}>
                    {intl.get('hzero.common.button.cancel').d('取消')}
                  </Button>
                </div>
              </div>
            </Modal>
            {/* <ERModal /> */}
            <HelpRobot />
          </>
        )}
        {singleLoginFlag && (
          <Modal
            visible
            zIndex={1200000}
            closable={false}
            maskClosable={false}
            className={styles['login-modal']}
            title={intl.get('srm.common.view.title.multipleDeviceLoginReminder').d('多处登录提醒')}
            okText={intl.get('srm.common.view.button.continueLogin').d('继续登录')}
            cancelText={intl.get('srm.common.view.button.backToLogin').d('返回登录页')}
            onOk={this.handleSingleLoginOk}
            onCancel={this.handleSingleLoginCancel}
            okButtonProps={{ funcType: 'raised', style: { borderStyle: 'solid' } }}
            cancelButtonProps={{ funcType: 'raised', style: { borderStyle: 'solid' } }}
          >
            <div style={{ padding: '0.16rem 0 0.32rem' }}>
              {intl
                .get('srm.common.view.message.alreadyLoggedOtherPC')
                .d(
                  '您的账户已在PC端中登录，继续登录将会下线本账号在系统其它处的登录状态，是否继续登录？'
                )}
            </div>
          </Modal>
        )}
        {languageChangeConfirmFlag && originUserLanguage && (
          <Modal
            visible
            // 权重比隐私协议小
            zIndex={1100000 - 1}
            closable
            autoCenter
            className={styles['language-modal']}
            maskClosable={false}
            title={intl.get('srm.common.view.title.languageChangeConfirmTitle').d('语言切换提示')}
            onCancel={this.closeLanguageChangeConfirmModal}
            footer={
              <ButtonPro
                funcType="raised"
                color="primary"
                onClick={this.closeLanguageChangeConfirmModal}
              >
                {intl.get('srm.common.button.ok').d('好的')}
              </ButtonPro>
            }
          >
            <div>
              {intl.get('srm.common.view.message.languageChangeConfirmMessage', {
                tenantName,
                originLanguage: originUserLanguage,
                language: languageName,
              })
                .d(`当前租户(${tenantName})无语言【${originUserLanguage}】，已为您自动切换成默认语言【${languageName}】，您可在顶部导航或个人中心调整。
                `)}
            </div>
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
