/**
 * AuthenticationInfo - 修改分组
 * @date: 2020-10-26
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Modal, Drawer, Form, Button, Avatar, List, Icon, Card } from 'hzero-ui';
import {
  DataSet,
  Form as C7nForm,
  TextField,
  Select as C7nSelect,
  Button as C7nButton,
  Radio,
} from 'choerodon-ui/pro';
// import { Tag } from 'choerodon-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import CountDown from 'components/CountDown';
import intl from 'utils/intl';
import { getCurrentUser, getResponse } from 'utils/utils';
// import { TagRender } from 'utils/renderer';
import notification from 'utils/notification';
import { PHONE } from 'utils/regExp'; // 身份证号,手机号,
import { queryIdpValue } from 'services/api';

// import Item from './components/Item';
import ESIGN from '@/assets/eqb-logo.png';
import FDD from '@/assets/fdd-logo.png';
import FDDSAAS from '@/assets/fdd_saas.png';
import QYS from '@/assets/qys.png';
import PHONEIMG from '@/assets/icons/phone.svg';
import CARDIMG from '@/assets/icons/bank-card.svg';
import {
  fetchCancelAuth,
  fetchUnbindAuth,
  fetchAuthUrl,
  fetchAuthStatus,
} from '@/services/userInfoService';
import PrivacyStatement from './components/PrivacyStatement';
import {
  PreFilledDS,
  AuthOneDS,
  AuthTwoDS,
  QysAuthFormDS,
  RealNameAuthDS,
  RealNamePhoneDS,
} from './stores/userInfoDS';
import styles from './index.less';

// const FormItem = Form.Item;
// const formItemLayout = {
//   labelCol: { span: 6 },
//   wrapperCol: { span: 18 },
// };

@Form.create({ fieldNameProp: null })
@connect(({ loading, userInfo }) => ({
  postCaptchaLoading: loading.effects['userInfo/getCheckCode'],
  dateleAuthLoading: loading.effects['userInfo/dateleAuth'],
  okLoading: loading.effects['userInfo/checkPhoneCode'] || loading.effects['userInfo/getQYSAuth'],
  userInfo,
}))
export default class TagList extends Component {
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
      authMethod: null,
      authType: '',
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
      authLoading: false,
      productMap: {},
      qysVisible: false,
      qysAuthType: 'INNER',
      qysTypeVisible: false,
      documentType: 'I',
      authItem: {},
    };
  }

  componentDidMount() {
    // 产品版本
    queryIdpValue('SPFM.PERSON_AUTH_PRODUCT_VERSION').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        this.setState({ productMap: obj });
      }
    });
  }

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

    const { authType, getCheckCode } = this.props;
    const obj1 = this.realNameAuthDS?.current?.toData() ?? {};
    const obj2 = this.realPhoneDS?.current?.toData() ?? {};

    const formDate = obj2?.authName && obj2?.bankPhoneNum ? { ...obj2 } : { ...obj1 };

    const res = await getCheckCode({
      ...formDate,
      authType,
      authMethod,
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
   * 解除 - 计时限制
   * 倒计时组件 计时完成后 触发, 取消计时状态
   */
  handleValidCodeLimitEnd = () => {
    this.setState({ validCodeLimitTimeEnd: -1 });
  };

  // eslint-disable-next-line no-unused-vars
  handleChangeType = (e) => {
    // this.setState({documentType: e});
    if (this.authOneDS && this.authOneDS.current) {
      this.authOneDS.current.set('documentNum', '');
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
              <C7nButton
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
              </C7nButton>
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
      // authenticationList,
      detailInfo,
    } = this.state;
    const { authType, authenticationList } = this.props;
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

  handleOk = async () => {
    const { onCheckPhone, handleAuthentication, getQYSAuth } = this.props;
    // const formValues = form.getFieldsValue();
    // const aysData = this.qysAuthFormDS?.toData()[0] ?? {};

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
      authType,
      authMsg: { serviceId },
      authMsg,
      flowId,
      authMethod,
      qysAuthType,
    } = this.state;
    if (authType === 'QYS') {
      getQYSAuth({
        ...formValues,
        ...aysData,
        authType,
        ...authMsg,
        serviceId,
        flowId,
        authMethod: qysAuthType === 'INNER' ? 'phone' : 'email',
        bankPhoneNum: qysAuthType === 'INNER' ? aysData.bankPhoneNum : aysData.email,
      }).then((res) => {
        if (res && (res.includes('http') || res.includes('success'))) {
          if (res.includes('http')) {
            window.open(res);
          }
          handleAuthentication('recall');
          this.setState({
            toAuthenticate: false,
            eSignVisible: false,
            statementVisible: false,
            qysVisible: false,
            qysAuthType: 'INNER',
          });
          this.realNameAuthDS.data = [];
          this.realPhoneDS.data = [];
        } else {
          const parseStr = JSON.parse(res);
          if (parseStr.code === 'hiam_error.amkt_not_to_authenticate') {
            handleAuthentication('recall');
            this.setState({
              toAuthenticate: false,
              eSignVisible: false,
              statementVisible: false,
              qysVisible: false,
              qysAuthType: 'INNER',
            });
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
      onCheckPhone({
        ...formValues,
        authType,
        ...authMsg,
        serviceId,
        flowId,
        authMethod,
      }).then((res) => {
        // form.setFieldsValue({ authCode: null });
        this.setState({
          flowId: undefined,
          authMsg: {},
        });
        if (res && !res.failed) {
          notification.success();
          handleAuthentication();
          this.setState({
            toAuthenticate: false,
            eSignVisible: false,
            authMethod: null,
            statementVisible: false,
          });
        }
      });
    }
  };

  handleDateleAuth = (userAuthId, authType) => {
    const { onDateleAuth, handleAuthentication } = this.props;
    onDateleAuth({ userAuthId, authType }).then((res) => {
      if ((!res || isEmpty(res)) && authType === 'ESIGN') {
        this.setState({ authMsg: {}, authType: 'ESIGN' }, () => {
          notification.success();
        });
        handleAuthentication();
      }
    });
  };

  getCurrentInfo = (authType) => {
    if (authType === 'ESIGN') {
      this.setState({
        authType,
        eSignVisible: true,
      });
    } else if (authType === 'QYS') {
      // this.qysAuthFormDS.data = [];
      // this.qysAuthFormDS.create({ authType: 'INNER' });
      this.setState({ detailInfo: {}, qysTypeVisible: true, authType, authMethod: 'phone' });
    } else {
      this.setState({ statementVisible: true, authType });
    }
  };

  // 法大大实名认证
  handleFddAuth = () => {
    const { getFddAuth, handleAuthentication } = this.props;
    const { authMsg } = this.state;
    getFddAuth(authMsg).then((res) => {
      if (res && res.includes('http')) {
        window.open(res);
        handleAuthentication('recall');
        this.setState({
          toAuthenticate: false,
          eSignVisible: false,
          authMethod: 'phone',
          statementVisible: false,
          qysVisible: false,
          qysAuthType: 'INNER',
        });
      } else {
        const parseStr = JSON.parse(res);
        notification.error({ message: parseStr?.message });
        this.setState({
          statementVisible: false,
        });
      }
    });
  };

  handleModalAuth = (keyVal) => {
    this.setState({ authMethod: keyVal });
  };

  handleConfirmAuth = () => {
    this.setState({ detailInfo: {}, toAuthenticate: true });
  };

  handleSelectQys = ({ key = '' }) => {
    this.qysAuthFormDS.data = [];
    this.qysAuthFormDS.create({ authType: key });
    this.setState({ qysAuthType: key, qysVisible: true, qysTypeVisible: false });
  };

  // 法大大修改手机号
  revisePhoneNum = (otherProps) => {
    const { getFddPhone } = this.props;
    getFddPhone(otherProps).then((res) => {
      if (res && res.includes('http')) {
        window.open(res);
      } else {
        const parseStr = JSON.parse(res);
        notification.error({ message: parseStr.message });
      }
    });
  };

  getTypeName = (type) => {
    const typeObj = {
      ESIGN: intl.get('hiam.userInfo.model.user.esign').d('E签宝'),
      QYS: intl.get('hiam.userInfo.model.user.qys').d('契约锁'),
      FDD: intl.get('hiam.userInfo.model.user.fadada').d('法大大'),
      FDD_SAAS: intl.get('hiam.userInfo.model.user.fadadaSaas').d('法大大SAAS'),
      QYS_SAAS: intl.get('hiam.userInfo.model.user.qysSaas').d('契约锁SAAS'),
      ESIGN_SAAS: intl.get('hiam.userInfo.model.user.esignSaas').d('E签宝SAAS'),
    };

    return typeObj[type] || '';
  };

  getTypeSrc = (type) => {
    const typeObj = {
      ESIGN,
      QYS,
      FDD,
      QYS_SAAS: QYS,
      FDD_SAAS: FDDSAAS,
      ESIGN_SAAS: ESIGN,
    };

    return typeObj[type] || '';
  };

  /**
   * 刷新操作
   * @param {*} userAuthId
   * @param {*} authType
   */
  handleRefreshAuth = (userAuthId, authType) => {
    const { handleAuthentication } = this.props;
    this.setState({ refreshAuthLoading: true });
    fetchAuthStatus({
      userAuthId,
      authType,
    }).then((res) => {
      this.setState({ refreshAuthLoading: false });
      if (getResponse(res) || (res && res.code === 'hiam_error.person_auth_is_update')) {
        handleAuthentication();
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
    const { handleAuthentication } = this.props;

    fetchCancelAuth({
      userAuthId,
      authType,
    }).then((res) => {
      this.setState({ cancelAuthLoading: false });
      if (getResponse(res)) {
        handleAuthentication();
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
    const { handleAuthentication } = this.props;

    fetchUnbindAuth({
      userAuthId,
      authType,
    }).then((res) => {
      this.setState({ unbindAuthLoading: false });
      if (getResponse(res)) {
        handleAuthentication();
      }
    });
  };

  // 个人实名弹窗
  openSelfAuthModal = (userAuthId, authType) => {
    if (this.preFilledDS && this.preFilledDS.current) {
      this.preFilledDS.current.set('realName', getCurrentUser().realName);
    } else {
      this.preFilledDS.data = [];
      this.preFilledDS.create({ realName: getCurrentUser().realName });
    }
    this.setState({
      preFilledVisible: true,
      userAuthId,
      authType,
    });
  };

  handleCancel = () => {
    this.setState({ preFilledVisible: false });
  };

  /**
   * 实名认证
   */
  handleRealAuth = async () => {
    const { userAuthId, authType } = this.state;
    const { handleAuthentication } = this.props;
    const isValid = await this.preFilledDS.validate();

    const { origin, href } = window.location;

    if (isValid) {
      this.setState({ authLoading: true });
      const obj = this.preFilledDS?.toData()[0] ?? {};
      fetchAuthUrl({
        userAuthId,
        authType,
        accountType: obj?.accountType ?? '',
        personAccount: obj && obj.accountType === 'EMAIL' ? obj.email || '' : obj.phoneNumber || '',
        authName: obj?.realName ?? '',
        bankPhoneNum: obj.phoneNumber || '',
        userId: getCurrentUser().id,
        redirectUrl: href,
        notifyUrl: origin,
      }).then((res) => {
        this.setState({
          authLoading: false,
          userAuthId: '',
        });
        if (res && res.includes('http')) {
          window.open(res);
          this.handleCancel();
          handleAuthentication('recall');
        } else {
          const parseStr = JSON.parse(res);
          notification.error({ message: parseStr.message });
        }
      });
    }
  };

  handleChangeType = (value) => {
    this.setState({ showField: value });
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
  // changeQysAuthType = type => {
  //   this.setState({ qysAuthType: type });
  // };

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

  render() {
    const {
      authenticationList = [],
      visible,
      onCancel,
      dateleAuthLoading,
      okLoading,
      // form,
    } = this.props;
    const {
      toAuthenticate,
      eSignVisible,
      authMethod,
      authMsg,
      flowId,
      preFilledVisible,
      showField,
      refreshAuthLoading,
      cancelAuthLoading,
      unbindAuthLoading,
      productMap,
      qysVisible,
      qysAuthType,
      qysTypeVisible,
      authItem,
    } = this.state;

    // 上上签暂不处理
    const authenticationFilterList = authenticationList.filter((item) => {
      return item.authType !== 'SSQ';
    });
    const renderDate = authenticationFilterList.map((ele) => {
      const {
        authName,
        // documentType,
        // documentNum,
        bankPhoneNum,
        userAuthStatus = 'undefined',
        // userAvatar,
        authType,
        userAuthId,
        serviceId,
      } = ele;
      const renderStatus = userAuthStatus === 'undefined' && serviceId ? 'process' : userAuthStatus;

      const statusMap = {
        failed: intl.get('spfm.configServer.model.authorizationFailed').d('认证失败'),
        success: intl.get('spfm.configServer.model.authorizationSuccess').d('认证成功'),
        process: intl.get('spfm.configServer.model.authorizationProcess').d('认证中'),
        undefined: intl.get('spfm.configServer.model.noAuthorization').d('未认证'),
      };

      const colorMap = {
        failed: ['#F06200', 'rgb(240, 98, 0, 0.15)'],
        success: ['#179454', 'rgba(71,184,131,0.15)'],
        process: ['#0161D5', 'rgba(10,125,245,0.15)'],
        undefined: ['#F06200', 'rgb(240, 98, 0, 0.15)'],
      };

      const currentSrc = this.getTypeSrc(authType);

      const statusStr = ['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(authType)
        ? userAuthStatus
        : renderStatus;

      return (
        <>
          <div className={styles.sign}>
            <div className={styles['sign-left']}>
              <Avatar src={currentSrc} shape="square" size="large">
                {this.getTypeName(authType)}
              </Avatar>
            </div>
            <div className={styles['sign-right']}>
              <div className={styles['auth-Name']}>
                <span
                  style={{
                    color: '#1D2129',
                    marginRight: '8px',
                    lineHeight: '22px',
                    fontWeight: '500',
                    fontSize: '14px',
                  }}
                >
                  {productMap[authType]}
                </span>
                {statusStr ? (
                  <span
                    style={{
                      padding: '1px 2px',
                      borderRadius: '2px',
                      fontSize: '12px',
                      color: colorMap[statusStr][0],
                      backgroundColor: colorMap[statusStr][1],
                    }}
                  >
                    {statusMap[statusStr]}
                  </span>
                ) : null}
              </div>
              <div>
                {statusStr !== 'undefined' &&
                ['ESIGN', 'QYS', 'QYS_SAAS', 'ESIGN_SAAS', 'FDD', 'FDD_SAAS'].includes(authType) ? (
                  <>
                    {authName}/{bankPhoneNum}
                  </>
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div className={styles['sign-name-btn']}>
              {
                // 非 saas 类型 展示原来逻辑 不做改动
                !['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(authType) ? (
                  <>
                    {statusStr === 'success' ? (
                      authType !== 'FDD' && (
                        <Button
                          onClick={() => this.handleDateleAuth(userAuthId, authType)}
                          style={{ marginRight: 20, height: '32px', padding: '0 8px' }}
                          loading={dateleAuthLoading}
                          type="primary"
                        >
                          {/* {intl.get('hiam.userInfo.model.user.notAuthentication').d('注销认证')} */}
                          {intl.get('hiam.userInfo.model.user.unbindAuthentication').d('解绑认证')}
                        </Button>
                      )
                    ) : (
                      <Button
                        onClick={() => {
                          this.getCurrentInfo(authType, { serviceId: ele.serviceId, userAuthId });
                          this.setState({
                            authMsg: { serviceId: ele.serviceId, userAuthId },
                          });
                        }}
                        style={{ marginRight: 20, height: '32px', padding: '0 8px' }}
                        type="primary"
                      >
                        {/* {intl.get('hiam.userInfo.model.user.authentication').d('实名认证')} */}
                        {intl.get('hiam.userInfo.model.user.selfAuth').d('去认证')}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {
                      // 未认证
                      ['failed', 'undefined'].includes(statusStr) && (
                        <Button
                          onClick={() => this.openSelfAuthModal(userAuthId, authType)}
                          style={{ height: '32px', marginRight: 20, padding: '0 8px' }}
                          type="primary"
                        >
                          {intl.get('hiam.userInfo.model.user.selfAuth').d('去认证')}
                        </Button>
                      )
                    }
                    {
                      // 认证中
                      statusStr === 'process' && (
                        <Button
                          onClick={() => this.handleRefreshAuth(userAuthId, authType)}
                          style={{ height: '32px', marginRight: 20, padding: '0 8px' }}
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
                          loading={cancelAuthLoading || refreshAuthLoading}
                        >
                          {intl.get('hiam.userInfo.model.user.cancelAuthentication').d('取消认证')}
                        </Button>
                      )
                    }
                    {
                      // 认证成功
                      statusStr === 'success' && (
                        <Button
                          onClick={() => this.handleUnbindAuth(userAuthId, authType)}
                          style={{ height: '32px', marginRight: 20, padding: '0 8px' }}
                          loading={unbindAuthLoading}
                          type="primary"
                        >
                          {intl.get('hiam.userInfo.model.user.unbindAuthentication').d('解绑认证')}
                        </Button>
                      )
                    }
                  </>
                )
              }

              {authType === 'FDD' && statusStr === 'success' && (
                <Button
                  onClick={() => {
                    this.revisePhoneNum(authType, { serviceId: ele.serviceId, userAuthId });
                  }}
                  style={{ marginRight: 20, marginTop: 8, height: '32px', padding: '0 8px' }}
                  type="primary"
                >
                  {intl.get('hiam.userInfo.model.user.revisePhoneNum').d('修改手机号')}
                </Button>
              )}
            </div>
          </div>
        </>
      );
    });
    const toRenderAuthenticate = (
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
          <C7nButton
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
          </C7nButton>
          <C7nButton
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
          </C7nButton>
        </div>
      </Drawer>
    );
    const statementModal = (
      <Modal
        key={this.state.authType}
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
          handleOk={this.state.authType === 'FDD' ? this.handleFddAuth : this.handleOk}
          authType={this.state.authType}
          loading={okLoading}
        />
      </Modal>
    );

    const data2 = [
      {
        key: 'INNER',
        title: intl.get('hiam.userInfo.view.option.innerUser').d('大陆用户'),
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
        key: 'OUTER',
        title: intl.get('hiam.userInfo.view.option.outerUser').d('非大陆用户'),
        type: intl.get('hiam.userInfo.view.option.instantCertification').d('（即时完成认证）'),
        imgSrc: CARDIMG,
        description: [
          intl
            .get('hiam.userInfo.view.option.prepareEmailIdCard')
            .d('1.请提前准备好个人证件号、邮箱资料；'),
          intl
            .get('hiam.userInfo.view.option.confirmEmailCanGetMsg')
            .d('2.确保填写的邮箱真实有效可接收到第三方个人认证链接。'),
        ],
      },
    ];

    return (
      <Drawer
        title={intl.get('hiam.userInfo.view.title.elecAuth').d('电签实名认证')}
        width={742}
        visible={visible}
        footer={null}
        onClose={onCancel}
        bodyStyle={{ padding: '20px' }}
      >
        <Fragment>
          {renderDate}
          {toRenderAuthenticate}
          {statementModal}

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
              <C7nButton color="primary" onClick={this.handleConfirmAuth}>
                {intl.get(`hzero.common.button.ok`).d('确定')}
              </C7nButton>
              <C7nButton
                onClick={() => this.setState({ eSignVisible: false, authMethod: 'phone' })}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </C7nButton>
            </div>
          </Drawer>

          <Modal
            title={intl.get('hiam.userInfo.view.option.authInfoPreFilled').d('认证信息预填写')}
            visible={preFilledVisible}
            footer={
              <div>
                <Button onClick={this.handleCancel}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>
                <Button
                  type="primary"
                  loading={this.state.authLoading}
                  onClick={this.handleRealAuth}
                >
                  {intl.get('hiam.userInfo.model.user.authentication').d('实名认证')}
                </Button>
              </div>
            }
            onCancel={this.handleCancel}
            width={520}
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
          </Modal>

          <Modal
            title={intl
              .get('hiam.userInfo.view.option.certificationTypeSelect')
              .d('个人认证类型选择')}
            visible={qysTypeVisible}
            footer={null}
            onCancel={() => {
              this.setState({ qysTypeVisible: false });
            }}
            width={700}
          >
            <div className={styles['modal-authentication-tip']}>
              <Icon
                type="exclamation-circle-o"
                style={{ marginLeft: '20px', marginRight: '10px' }}
              />
              {intl
                .get('hiam.userInfo.view.option.outerAuthMsg')
                .d(
                  '港澳台及海外用户认证请在提交完认证信息后点击邮箱内个人认证链接跳转至第三方进行个人认证'
                )}
            </div>
            <List
              loading={false}
              itemLayout="horizontal"
              dataSource={data2}
              renderItem={(item) => (
                <Card style={{ marginTop: '20px' }} onClick={() => this.handleSelectQys(item)}>
                  <List.Item actions={[<Icon type="right" />]}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.imgSrc} size="large" />}
                      title={
                        <div>
                          <span>{item.title}</span>
                          <span style={{ marginLeft: '20px', color: 'rgba(0, 0, 0, 0.6)' }}>
                            {item.type}
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
          </Modal>

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
              this.setState({ qysVisible: false, flowId: null, authMethod: null, authMsg: {} });
            }}
          >
            <C7nForm dataSet={this.qysAuthFormDS} columns={1} labelLayout="float">
              {/* <C7nSelect name="authType" onChange={this.changeQysAuthType} /> */}
              <TextField name="authName" />
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
              <C7nButton onClick={this.handleQYSOk} color="primary">
                {intl.get('hzero.common.button.save').d('保存')}
              </C7nButton>
              <C7nButton
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  this.qysAuthFormDS.data = [];
                  this.qysAuthFormDS.reset();
                  this.setState({ qysVisible: false, flowId: null, authMethod: null, authMsg: {} });
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </C7nButton>
            </div>
          </Drawer>
        </Fragment>
      </Drawer>
    );
  }
}
