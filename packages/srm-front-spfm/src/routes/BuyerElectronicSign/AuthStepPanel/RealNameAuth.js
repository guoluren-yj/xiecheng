/* eslint-disable no-unused-vars */
/**
 * 实名认证页面
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import CountDown from 'components/CountDown';
import { getCurrentUser, getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Icon, List, Card, Avatar, Drawer, Modal } from 'hzero-ui';
import {
  DataSet,
  Form as C7nForm,
  TextField,
  Select as C7nSelect,
  Button,
  Radio,
} from 'choerodon-ui/pro';
import { PHONE } from 'utils/regExp'; // 身份证号,手机号,
// import { queryIdpValue } from 'services/api';

// import ESIGN from '@/assets/eqb-logo.png';
// import FDD from '@/assets/fdd-logo.png';
// import QYS from '@/assets/qys.png';
import PHONEIMG from '@/assets/icons/phone.svg';
import CARDIMG from '@/assets/icons/bank-card.svg';

import { ReactComponent as SelfAuth } from '@/assets/sign/selfAuth.svg';
import {
  fetchAuthUrl,
  checkPhoneCode,
  getQYSAuth,
  getFddAuth,
  getCheckCode,
  fetchAuthStatus,
  fetchCancelAuth,
  fetchUnbindAuth,
  dateleAuth,
  fetchAuthentication,
} from '@/services/userInfoService';

import PrivacyStatement from '../components/PrivacyStatement';
import {
  PreFilledDS,
  AuthOneDS,
  AuthTwoDS,
  RealNameAuthDS,
  RealNamePhoneDS,
  QysAuthFormDS,
} from '../stores/userInfoDS';
import styles from './index.less';

@connect((state) => state)
// eslint-disable-next-line no-unused-vars
export default class RealNameAuth extends Component {
  preFilledDS = new DataSet({ ...PreFilledDS() });

  authOneDS = new DataSet({ ...AuthOneDS() });

  authTwoDS = new DataSet({ ...AuthTwoDS() });

  realNameAuthDS = new DataSet({ ...RealNameAuthDS() });

  realPhoneDS = new DataSet({ ...RealNamePhoneDS() });

  qysAuthFormDS = new DataSet({ ...QysAuthFormDS() });

  constructor(props) {
    super(props);
    this.state = {
      toAuthenticate: false,
      eSignVisible: false,
      authMethod: 'phone',
      flowId: undefined,
      authMsg: { serviceId: undefined, userAuthId: undefined },
      detailInfo: {},
      statementVisible: false, // 隐私声明弹窗
      preFilledVisible: false, // 认证信息预填写弹窗
      userAuthId: '',
      showField: '',
      refreshAuthLoading: false,
      cancelAuthLoading: false,
      unbindAuthLoading: false,
      postCaptchaLoading: false,
      dateleAuthLoading: false,
      okLoading: false,
      authLoading: false,
      authenticationList: [],
      // docTypeLevelCode: [],
      authItem: {},
      validCodeLimitTimeEnd: '',
      qysVisible: false,
      qysAuthType: 'INNER',
    };
  }

  componentDidMount() {
    // queryIdpValue('SPFM.ID_TYPE').then((res) => {
    //   if (getResponse(res)) {
    //     this.setState({
    //       docTypeLevelCode: res,
    //     });
    //   }
    // });

    this.handleAuthentication();
  }

  /**
   * 刷新操作
   */
  handleAuthentication = () => {
    const { authType } = this.props;
    fetchAuthentication({
      userId: getCurrentUser().id,
    }).then((res) => {
      if (getResponse(res) && Array.isArray(res) && res.length) {
        // 上上签暂不处理
        const authenticationFilterList = res.filter((item) => {
          return item.authType !== 'SSQ';
        });
        const list = authenticationFilterList.filter((item) => item.authType === authType);
        const obj = list && list.length ? list[0] : {};
        this.setState({
          authenticationList: res,
          authItem: obj,
          userAuthId: obj?.userAuthId,
        });
      }
    });
  };

  getCurrentInfo = (type) => {
    if (type === 'ESIGN') {
      this.setState({
        eSignVisible: true,
      });
    } else if (type === 'QYS') {
      this.qysAuthFormDS.data = [];
      this.qysAuthFormDS.create({ userType: 'INNER' });
      this.setState({ detailInfo: {}, qysVisible: true, authMethod: 'phone' });
    } else {
      this.setState({ statementVisible: true });
    }
  };

  /**
   * 去认证 跳转个人中心
   */
  handleToAuth = () => {
    const { authType } = this.props;
    const { userAuthId, authItem } = this.state;
    this.getCurrentInfo(authType, { serviceId: authItem?.serviceId, userAuthId });
    this.setState({
      authMsg: { serviceId: authItem?.serviceId, userAuthId },
    });
  };

  /**
   * 非SAAS解绑
   * @param {*} userAuthId
   * @param {*} authType
   */
  handleDateleAuth = (userAuthId, authType) => {
    this.setState({ dateleAuthLoading: true });
    dateleAuth({
      userAuthId,
      authType,
      userId: getCurrentUser().id,
    }).then((res) => {
      this.setState({ dateleAuthLoading: false });
      if ((!res || isEmpty(res)) && authType === 'ESIGN') {
        this.setState({ authMsg: {} }, () => {
          notification.success();
        });
        this.handleAuthentication();
      }
    });
  };

  /**
   * 刷新操作
   * @param {*} userAuthId
   * @param {*} authType
   */
  handleRefreshAuth = (userAuthId, authType) => {
    const { onRefreshStatus = () => {}, companyDetail } = this.props;
    this.setState({ refreshAuthLoading: true });
    fetchAuthStatus({
      userAuthId,
      authType,
      orderTenantId: getCurrentOrganizationId(),
      sourceMenu: 'pur',
    }).then((res) => {
      this.setState({ refreshAuthLoading: false });
      if (getResponse(res) || (res && res.code === 'hiam_error.person_auth_is_update')) {
        this.handleAuthentication();
        onRefreshStatus({ ...companyDetail });
      }
    });
  };

  /**
   * 取消认证
   * @param {*} userAuthId
   * @param {*} authType
   */
  handleCancelAuth = (userAuthId, authType) => {
    this.setState({ cancelAuthLoading: true });

    fetchCancelAuth({
      userAuthId,
      authType,
      orderTenantId: getCurrentOrganizationId(),
      sourceMenu: 'pur',
    }).then((res) => {
      this.setState({ cancelAuthLoading: false });
      if (getResponse(res)) {
        this.handleAuthentication();
      }
    });
  };

  /**
   * 解绑操作
   * @param {*} userAuthId
   * @param {*} authType
   */
  handleUnbindAuth = (userAuthId, authType) => {
    this.setState({ unbindAuthLoading: true });

    fetchUnbindAuth({
      userAuthId,
      authType,
      orderTenantId: getCurrentOrganizationId(),
      sourceMenu: 'pur',
    }).then((res) => {
      this.setState({ unbindAuthLoading: false });
      if (getResponse(res)) {
        this.handleAuthentication();
      }
    });
  };

  // 个人实名弹窗
  openSelfAuthModal = (userAuthId) => {
    this.preFilledDS.loadData([{ realName: getCurrentUser().realName }]);
    this.setState({
      preFilledVisible: true,
      userAuthId,
    });
  };

  // 法大大实名认证
  handleFddAuth = () => {
    const { companyDetail, onRefreshStatus = () => {} } = this.props;
    const { authMsg } = this.state;
    getFddAuth({
      userId: getCurrentUser().id,
      ...authMsg,
      orderTenantId: getCurrentOrganizationId(),
      sourceMenu: 'pur',
    }).then((res) => {
      if (res && res.includes('http')) {
        window.open(res);
        this.handleAuthentication();
        this.setState({
          toAuthenticate: false,
          eSignVisible: false,
          authMethod: 'phone',
          statementVisible: false,
          qysVisible: false,
          qysAuthType: 'INNER',
        });
        onRefreshStatus({ ...companyDetail });
      } else {
        const parseStr = JSON.parse(res);
        notification.error({ message: parseStr?.message });
        this.setState({
          statementVisible: false,
        });
      }
    });
  };

  handleOk = async () => {
    const { qysAuthType } = this.state;
    const { authType, onRefreshStatus = () => {}, companyDetail } = this.props;

    const valid1 = await this.realNameAuthDS.validate();
    const valid2 = await this.realPhoneDS.validate();
    const aysData = this.qysAuthFormDS?.toData()[0] ?? {};

    if (!valid1 || !valid2) {
      return false;
    }

    const obj1 = this.realNameAuthDS?.current?.toData() ?? {};
    const obj2 = this.realPhoneDS?.current?.toData() ?? {};

    const formValues = { ...obj1, ...obj2 };

    const {
      authMsg: { serviceId },
      authMsg,
      flowId,
      authMethod,
    } = this.state;
    if (authType === 'QYS') {
      getQYSAuth({
        userId: getCurrentUser().id,
        ...formValues,
        authType,
        ...authMsg,
        serviceId,
        flowId,
        orderTenantId: getCurrentOrganizationId(),
        sourceMenu: 'pur',
        ...aysData,
        authMethod: qysAuthType === 'INNER' ? 'phone' : 'email',
        bankPhoneNum: qysAuthType === 'INNER' ? aysData.bankPhoneNum : aysData.email,
        authName: aysData.realName || '',
      }).then((res) => {
        if (res && (res.includes('http') || res.includes('success'))) {
          if (res.includes('http')) {
            window.open(res);
          }
          this.handleAuthentication();
          this.setState({
            toAuthenticate: false,
            eSignVisible: false,
            statementVisible: false,
            qysVisible: false,
            qysAuthType: 'INNER',
          });
          onRefreshStatus({ ...companyDetail });
          this.realNameAuthDS.data = [];
          this.realPhoneDS.data = [];
        } else {
          const parseStr = JSON.parse(res);
          if (parseStr.code === 'hiam_error.amkt_not_to_authenticate') {
            this.handleAuthentication();
            this.setState({
              toAuthenticate: false,
              eSignVisible: false,
              statementVisible: false,
              qysVisible: false,
              qysAuthType: 'INNER',
            });
            onRefreshStatus({ ...companyDetail });
            this.realNameAuthDS.data = [];
            this.realPhoneDS.data = [];
          } else {
            notification.error({ message: parseStr?.message });
            this.setState({
              statementVisible: false,
            });
          }
        }
      });
    } else {
      if (!formValues.authCode) {
        notification.error({ message: intl.get('hiam.userInfo.view.option.noGetCaptcha') });
        return false;
      }
      checkPhoneCode({
        userId: getCurrentUser().id,
        ...formValues,
        authType,
        ...authMsg,
        serviceId,
        flowId,
        authMethod,
        orderTenantId: getCurrentOrganizationId(),
        sourceMenu: 'pur',
      }).then((res) => {
        // if (this.realNameAuthDS && this.realNameAuthDS.current) {
        //   this.realNameAuthDS.current.set('authCode', '');
        // }
        // if (this.realPhoneDS && this.realPhoneDS.current) {
        //   this.realPhoneDS.current.set('authCode', '');
        // }

        // this.setState({
        //   flowId: undefined,
        //   authMsg: {},
        // });
        if (res && !res.failed) {
          notification.success();
          this.handleAuthentication();
          this.setState({
            toAuthenticate: false,
            eSignVisible: false,
            authMethod: 'phone',
            statementVisible: false,
            qysVisible: false,
            qysAuthType: 'INNER',
          });
          onRefreshStatus({ ...companyDetail });
          this.realNameAuthDS.data = [];
          this.realPhoneDS.data = [];
        } else {
          notification.error({ message: res?.message });
          this.setState({
            statementVisible: false,
          });
        }
      });
    }
  };

  handleCancel = () => {
    this.setState({ preFilledVisible: false });
  };

  handleChangeType = (value) => {
    this.setState({ showField: value });
    if (this.authOneDS && this.authOneDS.current) {
      this.authOneDS.current.set('documentNum', '');
    }
  };

  /**
   * 解除 - 计时限制
   * 倒计时组件 计时完成后 触发, 取消计时状态
   */
  handleValidCodeLimitEnd = () => {
    this.setState({ validCodeLimitTimeEnd: -1 });
  };

  handleGainValidCodeBtnClick = async () => {
    const { authMethod } = this.state;

    let valid1 = false;
    let valid2 = false;

    if (authMethod === 'bankCard') {
      const obj = this.realNameAuthDS?.current?.toData() ?? {};
      valid1 =
        obj &&
        obj.bankCardNum &&
        obj.authName &&
        obj.documentType &&
        obj.documentNum &&
        obj.bankPhoneNum;
    } else {
      const obj = this.realPhoneDS?.current?.toData() ?? {};
      valid2 = obj && obj.authName && obj.documentNum && obj.bankPhoneNum;
    }

    // const valid1 = await this.realNameAuthDS.validate();
    // const valid2 = await this.realPhoneDS.validate();

    if ((authMethod === 'bankCard' && !valid1) || (authMethod !== 'bankCard' && !valid2)) {
      notification.warning({
        message: intl
          .get('spfm.configServer.model.checkField')
          .d('当前信息校验未通过,不能获取验证码'),
      });
      return false;
    }

    const { authType } = this.props;
    const obj1 = this.realNameAuthDS?.current?.toData() ?? {};
    const obj2 = this.realPhoneDS?.current?.toData() ?? {};

    const formDate = obj2?.authName && obj2?.bankPhoneNum ? { ...obj2 } : { ...obj1 };

    const res = await getCheckCode({
      ...formDate,
      authType,
      authMethod,
      userId: getCurrentUser().id,
      orderTenantId: getCurrentOrganizationId(),
      sourceMenu: 'pur',
    });

    if (getResponse(res)) {
      // this.setState({ postCaptchaLoading: false });
      if (res && authMethod === 'bankCard') {
        if (res.serviceId) {
          // const { serviceId, userAuthId } = res;
          const validCodeLimitTimeStart = new Date().getTime();
          const validCodeLimitTimeEnd = validCodeLimitTimeStart + 60000;
          this.setState({ authMsg: res, validCodeLimitTimeEnd, authItem: { ...res } });
          notification.success({
            message: intl.get('spfm.configServer.model.sendCheckCode').d('验证码发送成功'),
          });
        }
      } else if (res && !res.failed) {
        const validCodeLimitTimeStart = new Date().getTime();
        const validCodeLimitTimeEnd = validCodeLimitTimeStart + 60000;
        this.setState({ flowId: res.flowId, validCodeLimitTimeEnd });
        notification.success({
          message: intl.get('spfm.configServer.model.sendCheckCode').d('验证码发送成功'),
        });
      }
    }
  };

  /**
   * 实名认证
   */
  handleRealAuth = async () => {
    const { authType } = this.props;
    const { userAuthId } = this.state;
    const isValid = await this.preFilledDS.validate();

    const { origin, href } = window.location;

    if (isValid) {
      this.setState({ authLoading: true });
      const obj = this.preFilledDS?.toData()[0] ?? {};
      const res = await fetchAuthUrl({
        userAuthId,
        authType,
        accountType: obj?.accountType ?? '',
        personAccount: obj && obj.accountType === 'EMAIL' ? obj.email || '' : obj.phoneNumber || '',
        authName: obj?.realName ?? '',
        bankPhoneNum: obj.phoneNumber || '',
        userId: getCurrentUser().id,
        redirectUrl: href,
        notifyUrl: origin,
        orderTenantId: getCurrentOrganizationId(),
        sourceMenu: 'pur',
      });

      this.setState({
        authLoading: false,
        userAuthId: '',
      });
      if (res && res.includes('http')) {
        window.open(res);
        this.handleCancel();
        this.handleAuthentication();
      } else {
        const parseStr = JSON.parse(res);
        notification.error({ message: parseStr?.message });
      }
    }
  };

  handleChangeDocType = (value) => {
    this.setState({ documentType: value });
  };

  renderForm = () => {
    const {
      detailInfo,
      authItem,
      validCodeLimitTimeEnd,
      documentType = '',
      postCaptchaLoading,
    } = this.state;

    const initialObj = this.realNameAuthDS?.current?.toData() ?? {};

    if (Object.keys(initialObj).length <= 1) {
      // 初始化 默认值
      this.realNameAuthDS.data = [
        {
          ...initialObj,
          ...detailInfo,
        },
      ];
    }

    if (this.realNameAuthDS && this.realNameAuthDS.current) {
      this.realNameAuthDS.current.set('serviceId', authItem?.serviceId);
    }

    return (
      <div className={styles['auth-modal-form-help']}>
        <C7nForm dataSet={this.realNameAuthDS} columns={1} labelLayout="float">
          <>
            <TextField
              name="authName"
              // help={intl
              //   .get('spfm.certificateAuthority.view.message.authorSelfName')
              //   .d('认证人姓名')}
            />
            <div className={styles['modal-form-help-msg']}>
              {intl.get('spfm.certificateAuthority.view.message.authorSelfName').d('认证人姓名')}
            </div>
          </>
          <>
            <C7nSelect name="documentType" onChange={this.handleChangeDocType} />
            <div className={styles['modal-form-help-msg']} style={{ height: 0 }}>
              {null}
            </div>
          </>
          {documentType === 'I' && (
            <>
              <TextField
                name="documentNum"
                label={intl.get('hiam.userInfo.model.user.documentNum').d('身份证号')}
                // help={intl.get('spfm.certificateAuthority.view.message.idTips').d('认证人本人证件号')}
              />
              <div className={styles['modal-form-help-msg']}>
                {intl.get('spfm.certificateAuthority.view.message.idTips').d('认证人本人证件号')}
              </div>
            </>
          )}
          {documentType === 'P' && (
            <>
              <TextField
                name="documentNum"
                label={intl.get('hiam.userInfo.model.user.passportNum').d('护照号')}
                // help={intl
                //   .get('spfm.certificateAuthority.view.message.idTips')
                //   .d('认证人本人证件号')}
              />
              <div className={styles['modal-form-help-msg']}>
                {intl.get('spfm.certificateAuthority.view.message.idTips').d('认证人本人证件号')}
              </div>
            </>
          )}
          {documentType && ['T', 'H'].includes(documentType) && (
            <>
              <TextField
                name="documentNum"
                label={intl.get('hiam.userInfo.model.user.licenseNumber').d('证件号')}
                // help={intl.get('spfm.certificateAuthority.view.message.idTips').d('认证人本人证件号')}
              />
              <div className={styles['modal-form-help-msg']}>
                {intl.get('spfm.certificateAuthority.view.message.idTips').d('认证人本人证件号')}
              </div>
            </>
          )}
          <>
            <TextField
              name="bankCardNum"
              // help={intl
              //   .get('spfm.certificateAuthority.view.message.selfBankNum')
              //   .d('认证人本人办理的银行卡号')}
            />
            <div className={styles['modal-form-help-msg']}>
              {intl
                .get('spfm.certificateAuthority.view.message.selfBankNum')
                .d('认证人本人办理的银行卡号')}
            </div>
          </>
          <>
            <TextField
              name="bankPhoneNum"
              // help={intl
              //   .get('spfm.certificateAuthority.view.message.bankAddPhone')
              //   .d('办卡开户时预留的手机号')}
            />
            <div className={styles['modal-form-help-msg']}>
              {intl
                .get('spfm.certificateAuthority.view.message.bankAddPhone')
                .d('办卡开户时预留的手机号')}
            </div>
          </>
          <div
            style={{ display: 'flex', flexDirection: 'row-reverse' }}
            className={styles['modal-phone-code-basic']}
          >
            <div>
              <Button
                style={{ maxWidth: 164 }}
                disabled={Number(new Date()) <= validCodeLimitTimeEnd}
                loading={postCaptchaLoading}
                onClick={this.handleGainValidCodeBtnClick}
              >
                {Number(new Date()) < validCodeLimitTimeEnd ? (
                  <CountDown target={validCodeLimitTimeEnd} onEnd={this.handleValidCodeLimitEnd} />
                ) : (
                  intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
                )}
              </Button>
            </div>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <C7nForm.Item style={{ marginTop: '-10px' }}>
                <TextField
                  name="authCode"
                  style={{ width: '100%' }}
                  disabled={!authItem?.serviceId}
                />
              </C7nForm.Item>
            </div>
          </div>
        </C7nForm>
      </div>
    );
  };

  phoneAuthentication = () => {
    const {
      postCaptchaLoading,
      validCodeLimitTimeEnd,
      flowId,
      authenticationList,
      detailInfo,
    } = this.state;
    const { authType } = this.props;
    const qysData = authenticationList.filter((item) => item.authType === 'QYS')[0];

    const initialObj = this.realPhoneDS?.current?.toData() ?? {};

    if (!(initialObj && initialObj.authName && initialObj.documentNum && initialObj.bankPhoneNum)) {
      this.realPhoneDS.data = [
        {
          ...initialObj,
          authName: authType === 'QYS' ? qysData?.authName : detailInfo.authName,
          documentNum: authType === 'QYS' ? qysData?.documentNum : detailInfo.documentNum,
          documentType:
            authType === 'QYS' ? qysData?.documentType ?? 'I' : detailInfo?.documentType ?? 'I',
          bankPhoneNum: authType === 'QYS' ? qysData?.bankPhoneNum : detailInfo.bankPhoneNum,
          authType,
        },
      ];
    }

    if (this.realPhoneDS && this.realPhoneDS.current) {
      this.realPhoneDS.current.set('flowId', flowId);
    }

    const renderForm = (
      <div className={styles['auth-modal-form-help']}>
        <C7nForm dataSet={this.realPhoneDS} columns={1} labelLayout="float">
          <TextField
            name="authName"
            // help={intl.get('spfm.certificateAuthority.view.message.authorSelfName').d('认证人姓名')}
          />
          <div className={styles['modal-form-help-msg']}>
            {intl.get('spfm.certificateAuthority.view.message.authorSelfName').d('认证人姓名')}
          </div>
          <TextField
            name="documentNum"
            // help={intl.get('spfm.certificateAuthority.view.message.idTips').d('认证人本人证件号')}
          />
          <div className={styles['modal-form-help-msg']}>
            {intl.get('spfm.certificateAuthority.view.message.idTips').d('认证人本人证件号')}
          </div>
          <TextField
            name="bankPhoneNum"
            // help={intl
            //   .get('spfm.certificateAuthority.view.message.selfPhone')
            //   .d('认证人本人办理的手机号')}
          />
          <div className={styles['modal-form-help-msg']}>
            {intl
              .get('spfm.certificateAuthority.view.message.selfPhone')
              .d('认证人本人办理的手机号')}
          </div>
          {this.props.authType !== 'QYS' && (
            <div
              style={{ display: 'flex', flexDirection: 'row-reverse' }}
              className={styles['modal-phone-code-basic']}
            >
              <div>
                <Button
                  style={{ maxWidth: 164 }}
                  disabled={Number(new Date()) <= validCodeLimitTimeEnd}
                  loading={postCaptchaLoading}
                  onClick={this.handleGainValidCodeBtnClick}
                >
                  {Number(new Date()) < validCodeLimitTimeEnd ? (
                    <CountDown
                      target={validCodeLimitTimeEnd}
                      onEnd={this.handleValidCodeLimitEnd}
                    />
                  ) : (
                    intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
                  )}
                </Button>
              </div>
              <div style={{ flex: 1, marginRight: '16px' }}>
                <C7nForm.Item style={{ marginTop: '-10px' }}>
                  <TextField
                    name="authCode"
                    style={{ width: '100%', marginRight: 10 }}
                    disabled={!flowId}
                  />
                </C7nForm.Item>
              </div>
            </div>
          )}
        </C7nForm>
      </div>
    );
    return renderForm;
  };

  dataTypeArr = () => {
    return [
      {
        key: 'phone',
        title: intl.get('hiam.userInfo.view.option.phoneAuthentication').d('手机认证'),
        type: intl.get('hiam.userInfo.view.option.instantCertification').d('（即时完成认证）'),
        imgSrc: PHONEIMG,
        description: [
          intl
            .get('hiam.userInfo.view.option.usePhoneAuthentication')
            .d('1.使用手机号进行实名认证；'),
          intl
            .get('hiam.userInfo.view.option.fillIdentityInformation')
            .d('2.填写中国大陆居民身份证姓名、证件号。'),
        ],
      },
      {
        key: 'bankCard',
        title: intl.get('hiam.userInfo.view.option.bankCardAuthentication').d('银行卡认证'),
        type: intl.get('hiam.userInfo.view.option.instantCertification').d('（即时完成认证）'),
        imgSrc: CARDIMG,
        description: [
          intl.get('hiam.userInfo.view.option.prepareBankCard').d('1.请提前准备好您的银行卡资料；'),
          intl
            .get('hiam.userInfo.view.option.confirmPhoneStatus')
            .d('2.确保办理该银行卡所预留手机号，可以接受短信验证码。'),
        ],
      },
    ];
  };

  handleModalAuth = (keyVal) => {
    this.setState({ authMethod: keyVal });
  };

  handleConfirmAuth = () => {
    this.setState({ detailInfo: {}, toAuthenticate: true });
  };

  /**
   * 契约锁认证信息保存，含境外
   */
  handleQYSOk = async () => {
    const isValid = await this.qysAuthFormDS.validate();

    if (isValid) {
      this.setState({ statementVisible: true });
    }
  };

  /**
   * 切换境内境外
   */
  changeQysAuthType = (type) => {
    this.setState({ qysAuthType: type });
  };

  render() {
    const { authType, typeMap } = this.props;
    const {
      authItem,
      showField,
      eSignVisible,
      preFilledVisible,
      okLoading,
      userAuthId,
      authMethod,
      toAuthenticate,
      authMsg,
      flowId,
      refreshAuthLoading,
      cancelAuthLoading,
      unbindAuthLoading,
      dateleAuthLoading,
      qysVisible,
      qysAuthType,
    } = this.state;

    const { userAuthStatus = 'undefined', serviceId } = authItem; // 认证类型列表内容

    const renderStatus = userAuthStatus === 'undefined' && serviceId ? 'process' : userAuthStatus;
    const statusStr = ['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(authType)
      ? userAuthStatus
      : renderStatus;

    const typeName = typeMap && Object.keys(typeMap).length && authType ? typeMap[authType] : '';

    return (
      <div
        style={{
          height: 'calc(100vh - 278px)', // 276
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          <div className={styles['real-name-auth-alert-msg']}>
            {intl
              .get('spfm.buyerElectronicSign.view.message.realNameAuthAlertMsg')
              .d('使用电签服务前，请按步骤完成相关认证事项')}
          </div>
          <div className={styles['real-name-auth-basic-row']}>
            <div className={styles['real-name-auth-block']}>
              <div className={styles['real-name-auth-block-panel']}>
                <SelfAuth style={{ width: '130px', height: '85px' }} />
              </div>
              <div className={styles['real-name-auth-first-level-msg']}>
                {intl.get('spfm.buyerElectronicSign.view.message.selfAuth').d('个人认证')}
              </div>

              <div className={styles['real-name-auth-second-level-msg']}>
                {intl.get('spfm.buyerElectronicSign.view.message.selfAuthAlertWithType', {
                  name: typeName,
                })}
              </div>

              <div style={{ textAlign: 'center' }}>
                <>
                  {!['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(authType) ? (
                    <>
                      {statusStr === 'success' && authType !== 'FDD' && (
                        <Button
                          onClick={() => this.handleDateleAuth(userAuthId, authType)}
                          style={{ marginRight: 20, height: '32px', padding: '0 8px' }}
                          color="primary"
                          loading={dateleAuthLoading}
                        >
                          {intl.get('hiam.userInfo.model.user.unbindAuthentication').d('解绑认证')}
                        </Button>
                      )}

                      {['failed', 'undefined', 'process'].includes(statusStr) && (
                        <Button
                          color="primary"
                          style={{ width: '288px' }}
                          onClick={this.handleToAuth}
                        >
                          {intl.get('spfm.buyerElectronicSign.view.button.toAuth').d('去认证')}
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {['failed', 'undefined'].includes(statusStr) && (
                        <Button
                          color="primary"
                          style={{ width: '288px' }}
                          onClick={() => this.openSelfAuthModal(userAuthId)}
                        >
                          {intl.get('spfm.buyerElectronicSign.view.button.toAuth').d('去认证')}
                        </Button>
                      )}

                      {
                        // 认证成功
                        statusStr === 'success' && (
                          <Button
                            onClick={() => this.handleUnbindAuth(userAuthId, authType)}
                            style={{ height: '32px', marginRight: 20, padding: '0 8px' }}
                            loading={unbindAuthLoading}
                          >
                            {intl
                              .get('hiam.userInfo.model.user.unbindAuthentication')
                              .d('解绑认证')}
                          </Button>
                        )
                      }

                      {
                        // 认证中
                        statusStr === 'process' && (
                          <Button
                            onClick={() => this.handleRefreshAuth(userAuthId, authType)}
                            style={{ height: '32px', marginRight: 20, padding: '0 8px' }}
                            icon="sync"
                            loading={refreshAuthLoading || cancelAuthLoading}
                          >
                            {intl.get('hiam.userInfo.model.user.refreshAuthentication').d('刷新')}
                          </Button>
                        )
                      }

                      {
                        // 认证中
                        statusStr === 'process' && (
                          <Button
                            onClick={() => this.handleCancelAuth(userAuthId, authType)}
                            style={{ height: '32px', marginRight: 20, padding: '0 8px' }}
                            icon="cancel"
                            color="primary"
                            loading={cancelAuthLoading || refreshAuthLoading}
                          >
                            {intl
                              .get('hiam.userInfo.model.user.cancelAuthentication')
                              .d('取消认证')}
                          </Button>
                        )
                      }
                    </>
                  )}
                </>
              </div>
            </div>
          </div>
        </div>

        <Drawer
          title={intl
            .get('hiam.userInfo.view.option.certificationTypeSelect')
            .d('个人认证类型选择')}
          visible={eSignVisible}
          onClose={() => {
            this.setState({ eSignVisible: false, authMethod: 'phone' });
          }}
          width={380}
          wrapClassName={styles['modal-drawer-normal']}
          style={{ padding: '0' }}
          destroyOnClose
        >
          <div className={styles['modal-authentication-tip']}>
            <Icon type="exclamation-circle-o" style={{ marginRight: '10px' }} />
            {intl
              .get('hiam.userInfo.view.option.certificationTips')
              .d(
                '个人银行卡信息仅用于进行实名认证，不会绑定您的银行卡产生任何隐形消费，也不会泄露您的银行卡信息。'
              )}
          </div>
          <div className={styles['card-list-panel']}>
            <List
              loading={false}
              itemLayout="horizontal"
              dataSource={this.dataTypeArr()}
              renderItem={(item) => (
                <Card
                  style={{ margin: '16px' }}
                  // onClick={() => this.handleModalAuth(item)}
                >
                  <List.Item actions={[<Icon type="right" />]}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.imgSrc} size="large" />}
                      title={
                        <div>
                          <span>{item.title}</span>
                          <span style={{ marginLeft: '20px', color: 'rgba(0, 0, 0, 0.6)' }}>
                            {item.type}
                          </span>
                          <span style={{ float: 'right' }}>
                            <Radio
                              name="selectType"
                              value={item.key}
                              defaultChecked={item.key === authMethod}
                              onChange={this.handleModalAuth}
                            />
                          </span>
                        </div>
                      }
                      description={
                        <div>
                          {item.description.map((e) => (
                            <div>{e}</div>
                          ))}
                        </div>
                      }
                    />
                  </List.Item>
                </Card>
              )}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button color="primary" onClick={this.handleConfirmAuth}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
            <Button onClick={() => this.setState({ eSignVisible: false, authMethod: 'phone' })}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </Drawer>

        <Drawer
          title={intl.get('hiam.userInfo.view.option.authInfoPreFilled').d('认证信息预填写')}
          visible={preFilledVisible}
          onClose={this.handleCancel}
          wrapClassName={styles['modal-drawer-normal']}
          width={380}
          style={{ padding: '20px' }}
          destroyOnClose
        >
          <C7nForm
            dataSet={this.preFilledDS}
            columns={1}
            // labelWidth={160}
            labelLayout="float"
          >
            <TextField name="realName" />
            <C7nSelect name="accountType" onChange={this.handleChangeType} />
            {showField === 'EMAIL' ? <TextField name="email" /> : null}
            <TextField name="phoneNumber" pattern={PHONE} />
          </C7nForm>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button color="primary" loading={this.state.authLoading} onClick={this.handleRealAuth}>
              {intl.get('hiam.userInfo.model.user.authentication').d('实名认证')}
            </Button>
            <Button onClick={this.handleCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </Drawer>

        <Modal
          key={this.props.authType}
          width={600}
          visible={this.state.statementVisible}
          className={styles['theme-config-protocol']}
          onCancel={() => {
            this.setState({ statementVisible: false });
          }}
          destroyOnClose
          footer={null}
        >
          <PrivacyStatement
            onCancel={() => {
              this.setState({ statementVisible: false });
            }}
            handleOk={this.props.authType === 'FDD' ? this.handleFddAuth : this.handleOk}
            authType={this.props.authType}
            loading={okLoading}
          />
        </Modal>

        <Drawer
          key={this.props.authType}
          destroyOnClose
          width={380}
          wrapClassName={styles['modal-toRenderAuthenticate']}
          title={
            authMethod === 'bankCard'
              ? intl.get('hiam.userInfo.model.user.bankCardWrite').d('银行卡认证信息填写')
              : this.props.authType === 'QYS'
              ? intl.get('hiam.userInfo.model.user.verifiedWrite').d('实名认证信息填写')
              : intl.get('hiam.userInfo.model.user.phoneWrite').d('手机认证信息填写')
          }
          visible={toAuthenticate}
          okText={intl.get('hiam.userInfo.model.user.authentication').d('实名认证')}
          onClose={() => {
            this.realNameAuthDS.data = [];
            this.realPhoneDS.data = [];
            this.setState({
              toAuthenticate: false,
              flowId: '',
              authMsg: {},
              authItem: { ...authItem, serviceId: '' },
              validCodeLimitTimeEnd: -1,
            });
          }}
          okButtonProps={{
            loading: okLoading,
            disabled:
              authMethod === 'bankCard'
                ? !authMsg.serviceId
                : this.props.authType === 'QYS'
                ? false
                : !flowId,
          }}
        >
          {authMethod === 'bankCard' ? this.renderForm() : this.phoneAuthentication()}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              onClick={async () => {
                if (this.props.authType === 'FDD') {
                  this.setState({ statementVisible: true });
                } else {
                  const valid1 = await this.realNameAuthDS.validate();
                  const valid2 = await this.realPhoneDS.validate();

                  if (!valid1 || !valid2) return false;
                  this.setState({ statementVisible: true });
                }
              }}
              color="primary"
            >
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
            <Button
              onClick={() => {
                this.realNameAuthDS.data = [];
                this.realPhoneDS.data = [];
                this.setState({
                  toAuthenticate: false,
                  flowId: '',
                  authMsg: {},
                  authItem: { ...authItem, serviceId: '' },
                  validCodeLimitTimeEnd: -1,
                });
              }}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </Drawer>

        <Drawer
          key={this.state.authType}
          destroyOnClose
          width={372}
          className={styles['modal-toRenderAuthenticate']}
          title={intl.get('hiam.userInfo.model.user.authentication').d('实名认证')}
          visible={qysVisible}
          onOk={this.handleQYSOk}
          okText={intl.get('hzero.common.button.save').d('保存')}
          onClose={() => {
            this.qysAuthFormDS.data = [];
            this.qysAuthFormDS.reset();
            this.setState({
              qysVisible: false,
              flowId: null,
              authMethod: null,
              authMsg: {},
              qysAuthType: 'INNER',
            });
          }}
        >
          <C7nForm dataSet={this.qysAuthFormDS} columns={1} labelLayout="float">
            <C7nSelect name="userType" onChange={this.changeQysAuthType} />
            <TextField name="realName" />
            <TextField
              name="documentNum"
              label={
                qysAuthType !== 'INNER'
                  ? intl.get('hiam.userInfo.model.user.licenseNumber').d('证件号')
                  : intl.get('hiam.userInfo.model.user.documentNum').d('身份证号')
              }
            />
            {qysAuthType !== 'INNER' ? (
              <TextField name="email" />
            ) : (
              <TextField name="bankPhoneNum" pattern={PHONE} />
            )}
          </C7nForm>
          <div style={{ color: '#868D9C' }}>
            {qysAuthType !== 'INNER' ? intl.get('hiam.userInfo.view.option.outerAuthMsg') : null}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button onClick={this.handleQYSOk} color="primary">
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              style={{ marginLeft: '8px' }}
              onClick={() => {
                this.qysAuthFormDS.data = [];
                this.qysAuthFormDS.reset();
                this.setState({
                  qysVisible: false,
                  flowId: null,
                  authMethod: null,
                  authMsg: {},
                  qysAuthType: 'INNER',
                });
              }}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        </Drawer>
      </div>
    );
  }
}
