/**
 * UserInfo.js
 * @date 2018/11/23
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import queryString from 'query-string';
import { Bind } from 'lodash-decorators';
import { Button, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { Content as PageContent, Header } from 'components/Page';

import { isUndefined, isEmpty } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getCurrentUserId, getUserOrganizationId } from 'utils/utils';
import { BKT_PUBLIC, HZERO_IAM } from 'utils/config';
import { downloadFileByAxios } from 'services/api';

import showRefreshNotification from '@/components/RefreshNotification';
import UserReceiveConfig from './UserReceiveConfig';
import styles from './index.less';
import AccountInfo from './AccountInfo';
import SafeInfo from './SafeInfo';
import PreferenceInfo from './PreferenceInfo';
import DefaultValueConfig from './DefaultValueConfig';
import AccessLoginDrawer from './AccessLoginDrawer';

@connect(({ userInfo, loading, user, personalLoginRecord, login }) => ({
  user,
  userInfo,
  personalLoginRecord,
  login,
  avatarLoading: loading.effects['userInfo/saveAvatar'],
  authenticationLoading: loading.effects['userInfo/fetchauthentication'],
  editModalLoading:
    loading.effects['userInfo/validatePrePassword'] ||
    loading.effects['userInfo/validatePreValidate'] ||
    loading.effects['userInfo/validateNewEmail'] ||
    loading.effects['userInfo/validateNewPhone'] ||
    loading.effects['userInfo/updatePassword'],
  postCaptchaLoading: loading.effects['userInfo/postCaptcha'],
  updateRoleLoading: loading.effects['userInfo/updateRole'],
  updateCompanyLoading: loading.effects['userInfo/updateCompany'],
  updateRealNameLoading: loading.effects['userInfo/updateRealName'],
  updateTimeZoneLoading: loading.effects['userInfo/updateTimeZone'],
  updateLanguageLoading: loading.effects['userInfo/updateLanguage'],
  updateMenuLoading: loading.effects['userInfo/updateMenu'],
  updateRoleMergeLoading: loading.effects['userInfo/updateRoleMerge'],
  updateDateFormatLoading: loading.effects['userInfo/updateDateFormat'],
  updateTimeFormatLoading: loading.effects['userInfo/updateTimeFormat'],
  updateReminderFlagLoading: loading.effects['userInfo/updateReminderFlag'],
  updatePrintModalFlagLoading: loading.effects['userInfo/updatePrintModalFlag'],
  updateWebReminderFlagLoading: loading.effects['userInfo/updateWebReminderFlag'],
  applicantManagerLoading: loading.effects['userInfo/submitApplicantManager'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'hiam.userInfo',
    'hiam.userReceiveConfig',
    'hiam.login',
    'spfm.configServer',
    'hpfm.userInfo',
    'srm.common',
    'hiam.subAccount',
    'spfm.certificateAuthority',
  ],
})
@cuxRemote(
  {
    code: 'HIAM_USER_INFO',
    name: 'remote',
  },
)
export default class UserInfo extends React.Component {
  state = {
    headerButton: null,
  };

  componentDidMount() {
    this.init();
    // 检查绑定三方登陆的错误
    this.checkBindError();
    this.fetchDetailEnum();
    this.getDefaultValue();
  }

  updateHeaderButton = (node) => {
    this.setState({ headerButton: node });
  };

  checkBindError() {
    const {
      location: { hash = '' },
    } = this.props;
    const { social_error_message: bindErrorMessage } = queryString.parse(hash.slice(1));
    if (bindErrorMessage) {
      notification.warning({ message: decodeURIComponent(bindErrorMessage) });
    }
  }

  @Bind
  init() {
    const { organizationId, dispatch } = this.props;
    dispatch({
      type: 'userInfo/init',
      payload: { organizationId },
    });
  }

  @Bind()
  fetchDetailEnum() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'userInfo/fetchDetailEnum',
    });
  }

  @Bind()
  getDefaultValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userInfo/getDefaultValue',
      payload: {
        userId: getCurrentUserId(),
      },
    });
  }

  @Bind()
  handleChangeTab(val) {
    if (val === 'defaultValue') {
      this.getDefaultValue();
    }
    const { history } = this.props;
    history.push({
      search: `key=${val}`,
    });
  }

  state = {};

  static getDerivedStateFromProps(nextProps, prevState = {}) {
    const { activeKey } = prevState;
    const { location } = nextProps;
    const { key = 'account' } = queryString.parse(location.search) || {};
    const { _back } = location.state || {};
    const newActiveKey = isUndefined(_back) ? key : 'safe';
    if (activeKey !== newActiveKey) {
      return {
        ...prevState,
        activeKey: newActiveKey,
      };
    }
    return prevState;
  }

  @Bind()
  renderHeaderButton() {
    const { activeKey } = this.state;
    if (activeKey === 'account') {
      return [
        <Button key="accessLogin" color="primary" icon="lock" onClick={this.openAccessLogin}>
          {intl.get('hiam.userInfo.model.user.accessLogin').d('登录授权')}
        </Button>,
      ];
    }
    if (activeKey === 'safe') {
      return [
        <Button key="exportLoginLog" funcType="flat" icon="export" onClick={this.exportLoginLog}>
          {intl.get('hiam.userInfo.view.button.accountInfoExport').d('账户信息导出')}
        </Button>,
        <Button key="viewLoginLog" funcType="flat" icon="work_log" onClick={this.viewLoginLog}>
          {intl.get('hiam.userInfo.view.loginLog').d('查看登录日志')}
        </Button>,
      ];
    }
    return null;
  }

  render() {
    const {
      dispatch,
      organizationId,
      userInfo: {
        publicKey,
        passwordTipMsg,
        userInfo,
        roleDataSource,
        companyDataSource,
        imgFormData, // 图片表单数据
        uploadImgName, // 图片名称
        uploadImgPreviewUrl, // 图片上传预览
        imgUploadStatus, // 图片上传状态
        modalProps = {}, // modalForm 的额外数据
        openAccountList = [], // 第三方应用
        languageMap = {}, // 语言
        menuMap = {}, // 菜单
        roleMergeMap = {}, // 角色合并
        dateMap = {}, // 日期格式
        timeMap = {}, // 时间格式
        reminderFlagMap = {}, // 首页消息弹窗提醒
        printModalFlagMap = {}, // 打印
        detailEnumMap = {},
        applicantStatusMap,
      },
      user: { currentUser },
      updateCompanyLoading = false,
      updateRoleLoading = false,
      updateRealNameLoading = false,
      applicantManagerLoading = false,
      avatarLoading = false,
      editModalLoading = false,
      updateTimeZoneLoading = false,
      updateLanguageLoading = false,
      updateMenuLoading = false,
      updateRoleMergeLoading = false,
      updateReminderFlagLoading = false,
      updatePrintModalFlagLoading = false,
      updateWebReminderFlagLoading = false,
      updateDateFormatLoading = false,
      updateTimeFormatLoading = false,
      postCaptchaLoading = false,
      authenticationLoading = false,
      personalLoginRecord: { dataSource = [] } = {},
      remote,
    } = this.props;

    const { activeKey } = this.state;
    const { status } = applicantStatusMap;
    return (
      <>
        <Header title={intl.get('hiam.userInfo.view.title').d('个人中心')}>
          {this.state.headerButton}
          {this.renderHeaderButton()}
        </Header>
        <PageContent className={styles['user-info-content']}>
          <Tabs
            className={styles.tabs}
            animated={false}
            tabPosition="left"
            activeKey={activeKey}
            onChange={(val) => this.handleChangeTab(val)}
          >
            <Tabs.TabPane
              tab={intl.get('hiam.userInfo.view.title.main.accountInfo').d('账号信息')}
              key="account"
            >
              <AccountInfo
                userInfo={userInfo}
                roleDataSource={roleDataSource}
                companyDataSource={companyDataSource}
                initRoleDataSource={this.initRoleDataSource}
                initCompanyDataSource={this.initCompanyDataSource}
                onSaveRealName={this.handleRealNameSave}
                updateRealNameLoading={updateRealNameLoading}
                onDefaultCompanySave={this.handleCompanySave}
                onDefaultRoleSave={this.handleRoleSave}
                updateRoleLoading={updateRoleLoading}
                updateCompanyLoading={updateCompanyLoading}
                onHandleApplicantManagerSubmit={this.handleApplicantManagerSubmit}
                applicantManagerLoading={applicantManagerLoading}
                onFetchApplicantManagerStatus={this.fetchApplicantManagerStatus}
                applicantManagerStatus={status}
                // 头像
                getEnabledFile={this.getEnabledFile}
                imgFormData={imgFormData}
                uploadImgName={uploadImgName}
                uploadImgPreviewUrl={uploadImgPreviewUrl}
                imgUploadStatus={imgUploadStatus}
                avatarLoading={avatarLoading}
                organizationId={organizationId}
                dispatch={dispatch}
                // 埋点
                remote={remote}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hiam.userInfo.view.title.main.safeSetting').d('安全设置')}
              key="safe"
            >
              <SafeInfo
                publicKey={publicKey}
                authenticationLoading={authenticationLoading}
                loginData={dataSource}
                passwordTipMsg={passwordTipMsg}
                userInfo={userInfo}
                modalProps={modalProps}
                onPasswordUpdate={this.handlePasswordUpdate}
                dispatch={dispatch}
                openAccountList={openAccountList}
                editModalLoading={editModalLoading}
                postCaptchaLoading={postCaptchaLoading}
                detailEnumMap={detailEnumMap}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hiam.userInfo.view.title.main.preferenceSetting').d('偏好设置')}
              key="preference"
            >
              <PreferenceInfo
                userInfo={userInfo}
                currentUser={currentUser}
                onTimeZoneUpdate={this.handleTimeZoneUpdate}
                initPreference={this.initPreference}
                initLanguageMap={this.initLanguageMap}
                dateMap={dateMap}
                timeMap={timeMap}
                languageMap={languageMap}
                menuMap={menuMap}
                roleMergeMap={roleMergeMap}
                reminderFlagMap={reminderFlagMap}
                printModalFlagMap={printModalFlagMap}
                onTimeFormatUpdate={this.handleTimeFormatUpdate}
                onDateFormatUpdate={this.handleDateFormatUpdate}
                onLanguageUpdate={this.handleLanguageUpdate}
                onRefreshMenu={this.handleRefresh}
                onMenuUpdate={this.handleMenuUpdate}
                onRoleMergeUpdate={this.handleRoleMergeUpdate}
                onReminderFlagUpdate={this.handleReminderFlagUpdate}
                onPrintModalFlagUpdate={this.onPrintModalFlagUpdate}
                updateTimeZoneLoading={updateTimeZoneLoading}
                updateLanguageLoading={updateLanguageLoading}
                updateMenuLoading={updateMenuLoading}
                updateRoleMergeLoading={updateRoleMergeLoading}
                updateDateFormatLoading={updateDateFormatLoading}
                updateTimeFormatLoading={updateTimeFormatLoading}
                updateReminderFlagLoading={updateReminderFlagLoading}
                updatePrintModalFlagLoading={updatePrintModalFlagLoading}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hiam.userInfo.view.title.main.receiveSetting').d('消息接收设置')}
              key="receive"
            >
              <UserReceiveConfig
                activeKey={activeKey}
                updateHeaderButton={this.updateHeaderButton}
                webReminderFlag={userInfo.webReminderFlag === 0}
                onWebReminderFlagUpdate={this.handleWebReminderFlagUpdate}
                updateWebReminderFlagLoading={updateWebReminderFlagLoading}
              />
            </Tabs.TabPane>
            {organizationId !== 0 ? (
              <Tabs.TabPane
                tab={intl.get('hiam.userInfo.view.title.main.defaultValueSetting').d('默认值设置')}
                key="defaultValue"
              >
                <DefaultValueConfig />
              </Tabs.TabPane>
            ) : null}
          </Tabs>
        </PageContent>
      </>
    );
  }

  @Bind()
  initRoleDataSource() {
    const { dispatch } = this.props;
    // 获取当前登陆用户所拥有的角色
    dispatch({
      type: 'userInfo/initRoleDataSource',
    });
  }

  @Bind()
  initCompanyDataSource() {
    // 获取当前登陆用户所拥有的角色
    const { organizationId, dispatch } = this.props;
    dispatch({
      type: 'userInfo/initCompanyDataSource',
      payload: { organizationId },
    });
  }

  @Bind()
  handleRealNameSave(realName) {
    const {
      dispatch,
      userInfo: { userInfo = {} },
    } = this.props;
    return dispatch({
      type: 'userInfo/updateRealName',
      payload: {
        realName,
        userInfo,
      },
    });
  }

  @Bind()
  handleCompanySave(defaultCompanyId) {
    const {
      userInfo: { companyMap = {}, userInfo = {} },
      dispatch,
      organizationId,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateCompany',
      payload: {
        defaultCompanyId,
        defaultCompanyName:
          companyMap[defaultCompanyId] && companyMap[defaultCompanyId].companyName,
        userInfo,
        organizationId,
      },
    });
  }

  @Bind()
  handleRoleSave(defaultRoleId) {
    const {
      userInfo: { roleMap = {}, userInfo = {} },
      dispatch,
      organizationId,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateRole',
      payload: {
        defaultRoleId,
        defaultRoleName: roleMap[defaultRoleId] && roleMap[defaultRoleId].name,
        userInfo,
        organizationId,
      },
    });
  }

  @Bind()
  getEnabledFile() {
    const { dispatch, organizationId } = this.props;
    return dispatch({
      type: 'userInfo/fetchEnabledFile',
      payload: {
        tenantId: organizationId,
        bucketName: BKT_PUBLIC,
        directory: 'person-profile-picture',
      },
    });
  }

  // safe-info

  /**
   * 更新密码
   * @param {*} payload
   */
  @Bind()
  handlePasswordUpdate(payload) {
    const {
      dispatch,
      userInfo: { userInfo = {} },
    } = this.props;
    return dispatch({
      type: 'userInfo/updatePassword',
      payload: {
        userInfo,
        ...payload,
      },
    });
  }

  // preference-info

  @Bind()
  handleTimeZoneUpdate({ timeZone, timeZoneMeaning }) {
    const {
      dispatch,
      userInfo: { userInfo = {} },
    } = this.props;
    return dispatch({
      type: 'userInfo/updateTimeZone',
      payload: {
        timeZone,
        timeZoneMeaning,
        userInfo,
      },
    });
  }

  // todo 之前切换到输入模式都会查询，现在只会查询一次
  @Bind()
  initLanguageMap() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userInfo/initLanguageDataSource',
      payload: {},
    });
  }

  @Bind()
  handleLanguageUpdate(language) {
    const {
      userInfo: { languageMap = {}, userInfo },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateLanguage',
      payload: {
        language,
        languageName: languageMap[language]?.name,
        userInfo,
      },
    });
  }

  @Bind()
  handleMenuUpdate(menuLayout) {
    const {
      userInfo: { userInfo = {} },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateMenuType',
      payload: {
        menuLayout,
        roleMergeFlag: userInfo.roleMergeFlag,
        userInfo,
      },
    });
  }

  @Bind()
  handleRefresh(menuLayout) {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/updateCurrentUser',
      payload: { menuLayout },
    });
  }

  @Bind()
  handleRoleMergeUpdate(roleMergeFlag) {
    const {
      userInfo: { userInfo },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateRoleMerge',
      payload: {
        // eslint-disable-next-line no-nested-ternary
        roleMergeFlag: roleMergeFlag === '1' ? 1 : roleMergeFlag === '0' ? 0 : undefined,
        menuLayout: userInfo.menuLayout,
        userInfo,
      },
    });
  }

  @Bind()
  initPreference() {
    const { dispatch } = this.props;
    const lovCodes = {
      menuMap: 'HPFM.MENU_LAYOUT',
      roleMergeMap: 'HPFM.ENABLED_FLAG',
      dateMap: 'HIAM.DATE_FORMAT',
      timeMap: 'HIAM.TIME_FORMAT',
      reminderFlagMap: 'HPFM.ENABLED_FLAG',
      printModalFlagMap: 'HPFM.ENABLED_FLAG',
    };
    dispatch({
      type: 'userInfo/initLovCode',
      payload: { lovCodes },
    });
  }

  /**
   * 变更当前用户的默认时间格式
   * @param {String} dateFormat
   * @memberof UserInfo
   */
  @Bind()
  handleDateFormatUpdate(dateFormat) {
    const {
      userInfo: { dateMap = {}, userInfo = {} },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateDateFormat',
      payload: {
        dateFormat,
        dateFormatMeaning: dateMap[dateFormat].meaning,
        userInfo,
      },
    });
  }

  /**
   * 变更当前用户的默认语言
   * @param {Object} timeFormat
   * @memberof UserInfo
   */
  @Bind()
  handleTimeFormatUpdate(timeFormat) {
    const {
      userInfo: { timeMap = {}, userInfo = {} },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateTimeFormat',
      payload: {
        timeFormat,
        timeFormatMeaning: timeMap[timeFormat].meaning,
        userInfo,
      },
    });
  }

  /**
   * 变更首页消息弹窗提醒设置
   * @param {Object} reminderFlag
   * @memberof UserInfo
   */
  @Bind()
  handleReminderFlagUpdate(reminderFlag) {
    const {
      userInfo: { userInfo },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateReminderFlag',
      payload: {
        popoutReminderFlag: reminderFlag === '1' ? 1 : 0,
        userInfo,
      },
    });
  }

  onPrintModalFlagUpdate = (printOutputConfigFlag) => {
    const {
      userInfo: { userInfo },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updatePrintModalFlag',
      payload: {
        printOutputConfigFlag: printOutputConfigFlag === '1' ? 1 : 0,
        userInfo,
      },
    }).then(() => {
      const { currentUser } = (window.dvaApp._store.getState().user || {});
      dispatch({
        type: 'user/updateState',
        payload: {
          currentUser: {
            ...currentUser,
            printOutputConfigFlag: printOutputConfigFlag === '1' ? 1 : 0,
          },
        },
      });
    });
  }

  /**
   * 变更是否屏蔽消息弹窗
   * @param {Object} webReminderFlag
   * @memberof UserInfo
   */
  @Bind()
  handleWebReminderFlagUpdate(flag) {
    const {
      userInfo: { userInfo },
      dispatch,
    } = this.props;
    return dispatch({
      type: 'userInfo/updateWebReminderFlag',
      payload: {
        webReminderFlag: flag ? 0 : 1,
        userInfo,
      },
    }).then((res) => {
      if (isEmpty(res)) {
        // 设置成功
        showRefreshNotification();
      }
    });
  }

  /**
   * 管理员申请提交
   */
  @Bind()
  handleApplicantManagerSubmit(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'userInfo/submitApplicantManager',
      payload: params,
    });
  }

  /**
   * 获取管理员申请状态
   */
  @Bind()
  fetchApplicantManagerStatus() {
    const params = {
      userId: getCurrentUserId(),
      tenantId: getUserOrganizationId(),
    };
    const { dispatch } = this.props;
    return dispatch({
      type: 'userInfo/submitApplicantManagerStatus',
      payload: params,
    });
  }

  @Bind()
  openAccessLogin() {
    Modal.open({
      children: <AccessLoginDrawer />,
      closable: true,
      drawer: true,
      title: intl.get('hiam.userInfo.model.user.accessLogin').d('登录授权'),
      footer: null,
      style: { width: '450px' },
    });
  }

  @Bind()
  viewLoginLog() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hiam/user/login-log`,
      })
    );
  }

  @Bind()
  exportLoginLog() {
    downloadFileByAxios({
      requestUrl: `${HZERO_IAM}/hzero/v1/users/self/export`,
      method: 'GET',
    });
  }
}
