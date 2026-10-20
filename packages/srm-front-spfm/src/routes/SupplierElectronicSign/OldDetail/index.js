/*
 * index.js - CA认证详情页
 * @author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-09 16:09:07
 * @LastEditTime: 2026-05-07 15:51:04
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Spin, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { stringify } from 'querystring';
import { isNumber, isEmpty } from 'lodash';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { HZERO_FILE } from 'utils/config';
import { downloadFile } from 'services/api';
import { Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import {
  getCurrentUserId,
  getCurrentOrganizationId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import {
  DataSet,
  Form,
  Button,
  NumberField,
  Attachment,
  Modal as C7nModal,
} from 'choerodon-ui/pro';
import { Steps, Alert, Icon } from 'choerodon-ui';

import { getParseUrlParam } from '@/utils/utils';
import { fetchConfig } from '@/services/certificateSdatAuthorityService';
import { ReactComponent as DownloadSVG } from '@/assets/download.svg';

import ConstructForm from './ConstructForm';
import certificateDs from './ds';
import PrivacyStatement from '../PrivacyStatement';
import styles from './index.less';
import RealNameAuth from '../AuthStepPanel/RealNameAuth';
import FinishedPanel from '../AuthStepPanel/FinishedPanel';

const { Step } = Steps;
@connect(({ loading = {}, certificateAuthoritySdat }) => ({
  queryDetailLoading: loading.effects['certificateAuthoritySdat/fetchDetailInfo'],
  saving: loading.effects['certificateAuthoritySdat/saveDetail'],
  submitting: loading.effects['certificateAuthoritySdat/submitDetail'],
  approveLoading: loading.effects['certificateAuthoritySdat/approve'],
  reseting: loading.effects['certificateAuthoritySdat/resetProcess'],
  certificateAuthoritySdat,
}))
@formatterCollections({
  code: [
    'spfm.certificateAuthority',
    'spcm.common',
    'entity.company',
    'spfm.supplierElectronicSign',
    'spfm.buyerElectronicSign',
    'spfm.sealmanage',
    'hiam.userInfo',
    'spfm.configServer',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const searchParam = props?.location?.search ?? '';
    const { companyId = '', authInfoId = '', authType = '' } = searchParam
      ? getParseUrlParam(searchParam)
      : {};
    this.state = {
      companyId,
      authInfoId,
      authType,
      detailDataSource: {}, // 明细页信息
      step: 0,
      configFlag: false, // 读取配置表（用于判断是否需要展示下载模版的蓝条和上传委托书的按钮）
      statementVisible: false, // 隐私声明弹窗
      userAuthStatus: false, // 实名认证状态
      detailAutoInfo: {}, // 实名认证信息
    };
    this.ds = new DataSet(certificateDs({ authType }));
  }

  async componentDidMount() {
    const { companyId } = this.state;
    const { dispatch } = this.props;
    await dispatch({
      type: 'certificateAuthoritySdat/fetchDetailEnum',
    });
    // 读取配置表
    fetchConfig({
      functionCode: 'esign_authorization',
      tenantNum: getCurrentTenant().tenantNum,
      enableFlag: 1,
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          configFlag: !isEmpty(res),
        });
      }
    });
    if (companyId && isNumber(+companyId)) {
      this.fetchDetailInfo();
      this.fetchAuthInfo();
    }
  }

  @Bind()
  handleAuth() {
    const { authType } = this.state;
    if (authType === 'ESIGN') {
      this.props.history.push(`/hiam/user/info`);
    }
  }

  /**
   * fetchDetailInfo - 查询明细信息
   */
  @Bind()
  fetchDetailInfo() {
    const { companyId, authInfoId, authType } = this.state;
    this.ds.setQueryParameter('companyId', companyId);
    this.ds.setQueryParameter('authInfoId', authInfoId);
    this.ds.setQueryParameter('authType', authType);
    this.ds.query().then((res) => {
      if (res) {
        // this.ds.create({ ...res, _status: 'update', editFlag: res.certificateResult });
        this.ds.data = [{ ...res, _status: 'update', editFlag: res?.certificateResult }];
        this.setState({
          detailDataSource: { ...res, _status: 'update' },
          step: this.getStep(res),
        });
      }
    });
  }

  @Bind()
  fetchAuthInfo() {
    const { authType } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'certificateAuthoritySdat/fetchAuthInfo',
      payload: {
        authType,
        userId: getCurrentUserId(),
      },
    }).then((res) => {
      if (res) {
        const { userAuthStatus } = res;
        this.setState({
          userAuthStatus,
          // detailAutoInfo: res,
        });
      } else {
        this.setState({ userAuthStatus: false });
      }
    });
  }

  /**
   * save - 保存明细数据
   */
  @Bind()
  save() {
    const { dispatch } = this.props;
    const { authType } = this.state;
    // const newHandlePersonValues = {
    //   agentMobile: detailAutoInfo.bankPhoneNum,
    //   agentIdNum: detailAutoInfo.documentNum,
    //   agentName: detailAutoInfo.authName,
    //   agentMail: null,
    // };

    this.ds.validate().then((aa) => {
      if (!aa) {
        return '';
      }
      const data = this.ds.toData()[0];
      const newDetailDataSource = {
        ...data,
        // ...newHandlePersonValues,
        authType,
      };
      dispatch({
        type: 'certificateAuthoritySdat/saveDetail',
        payload: newDetailDataSource,
      }).then((res) => {
        if (res) {
          this.fetchDetailInfo();
          notification.success();
        }
      });
    });
  }

  /**
   * 改变state
   * @param {*} params
   */
  @Bind()
  handleChangeState(params) {
    this.debounce(() => this.setState(params), 300)();
  }

  /**
   * 防抖，减少渲染频率
   * @param {Function} fun
   * @param {number} delay
   */
  @Bind()
  debounce(fun, delay) {
    /* eslint-disable */
    let timeout = null;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fun.call(this, arguments);
      }, delay);
    };
  }

  /**
   * preSubmit - 提交前置modal弹窗
   */
  @Bind()
  preSubmit() {
    const { detailDataSource = {}, userAuthStatus } = this.state;
    const { authenticateResult = '', authenticateResId = '' } = detailDataSource;
    if (userAuthStatus === 'success') {
      if (detailDataSource) {
        this.ds.validate().then((res) => {
          if (!res) {
            return '';
          }
          C7nModal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <div>
                {intl.get(`spfm.certificateAuthority.view.message.confirmSubmit`).d('是否提交申请')}
              </div>
            ),
            onOk: () => {
              // 仅企业信息验证时弹框
              if (
                (!authenticateResId && !authenticateResult) ||
                authenticateResult === 'INFO_AUTH_FAIL' ||
                authenticateResult === 'OVER_THE_LIMIT'
              ) {
                this.setState({ statementVisible: true });
              } else {
                this.submit();
              }
            },
          });
        });
      } else {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get(`spfm.certificateAuthority.view.message.UnSubmitApplication`)
            .d('无法提交申请'),
        });
      }
    } else {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get(`spfm.certificateAuthority.view.message.unAuthInfo`)
          .d('该账号未进行个人实名认证,请先实名认证'),
      });
    }
  }

  @Bind()
  handleChangeLegalLocale(val) {
    const arrInclueds = ['0', '1', '2', '3', '4', 0, 1, 2, 3, 4];
    const arr = ['I', 'H', 'H', 'T', 'P'];
    this.ds.current.set('legalDocumentType', arrInclueds.includes(val) ? arr[Number(val)] : '');
  }

  /**
   * 模版下载
   */
  @Bind()
  downloadTemplate() {
    const {
      detailDataSource: { entrustFileUrl },
    } = this.state;
    if (entrustFileUrl) {
      const organizationId = getCurrentOrganizationId();
      const api = `${HZERO_FILE}/v1/${organizationId}
      /files/download?bucketName=${PRIVATE_BUCKET}&url=${entrustFileUrl}`;
      downloadFile({
        requestUrl: api,
        queryParams: [
          { name: 'bucketName', value: PRIVATE_BUCKET },
          { name: 'url', value: entrustFileUrl },
        ],
      });
    }
  }

  /**
   * submit - 提交
   */
  @Bind()
  submit() {
    const { dispatch, form, location } = this.props;
    const {
      detailDataSource = {},
      companyId,
      authType,
      // detailAutoInfo = {},
      userAuthStatus,
    } = this.state;
    const { tenantId = '' } = location && location.search ? getParseUrlParam(location.search) : {};
    const { authenticateResult } = detailDataSource;

    this.ds.validate().then((aa) => {
      if (!aa) {
        return '';
      }
      // const companyValue = isNaN(parseInt(companyValues.legalLocale))
      //   ? { ...companyValues, legalLocale: detailDataSource.legalLocale }
      //   : { ...companyValues };
      // const newHandlePersonValues = {
      //   agentMobile: detailAutoInfo.bankPhoneNum,
      //   agentIdNum: detailAutoInfo.documentNum,
      //   agentName: detailAutoInfo.authName,
      //   agentMail: null,
      // };
      const data = this.ds.toData()[0];
      let newDetailDataSource = {
        ...data,
        submitType: 'INFO_AUTH', // 默认企业认证
        // ...newHandlePersonValues,
        authType,
      };
      if (authenticateResult === 'INFO_AUTH_SUCCESS' || authenticateResult === 'TO_PAY_FAIL') {
        // 打款
        newDetailDataSource.submitType = 'TO_PAY';
      } else if (authenticateResult === 'failed' || authenticateResult === 'TO_PAY_SUCCESS') {
        //回款认证
        newDetailDataSource.submitType = 'PAY_AUTH';
      }
      dispatch({
        type: 'certificateAuthoritySdat/submitDetail',
        payload: {
          ...newDetailDataSource,
          tenantId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ statementVisible: false });
          this.fetchDetailInfo();
        } else {
          this.fetchDetailInfo();
        }
      });
    });
  }
  /**
   *  approve - 申请
   */
  @Bind()
  approve() {
    const { dispatch, location } = this.props;
    const { detailDataSource = {}, authType } = this.state;
    const { tenantId = '' } = location && location.search ? getParseUrlParam(location.search) : {};
    dispatch({
      type: 'certificateAuthoritySdat/approve',
      payload: {
        ...detailDataSource,
        authType,
        tenantId,
      },
    }).then(() => {
      this.setState({ statementVisible: false });
      this.fetchDetailInfo();
    });
  }
  /**
   *  handleReset - 重置流程
   */
  @Bind()
  handleReset() {
    const { dispatch } = this.props;
    const { detailDataSource = {}, authType } = this.state;
    dispatch({
      type: 'certificateAuthoritySdat/resetProcess',
      payload: {
        ...detailDataSource,
        authType,
      },
    }).then(() => {
      this.fetchDetailInfo();
    });
  }

  @Bind()
  buttonMsg(authenticateResult) {
    if (
      authenticateResult === 'INFO_AUTH_SUCCESS' ||
      authenticateResult === 'TO_PAY_FAIL' ||
      authenticateResult === 'TO_PAYING'
    ) {
      return intl.get(`spfm.certificateAuthority.view.message.title.toPay`).d('打款验证');
    } else if (authenticateResult === 'TO_PAY_SUCCESS' || authenticateResult === 'failed') {
      return intl.get(`spfm.certificateAuthority.view.message.title.payAuth`).d('回款金额验证');
    } else {
      return intl.get(`spfm.certificateAuthority.view.message.title.infoAuth`).d('企业信息验证');
    }
  }

  @Bind()
  getStep(res) {
    // const { detailDataSource } = this.state;
    const { authenticateResult = '', caAuthStatus = '', personAuthStatus = '' } = res;
    if (personAuthStatus === 'PERSONAL_AUTH_NON') {
      return 0;
    } else if (
      authenticateResult === 'INFO_AUTH_SUCCESS' ||
      authenticateResult === 'TO_PAY_FAIL' ||
      authenticateResult === 'TO_PAYING'
    ) {
      return 2;
    } else if (authenticateResult === 'TO_PAY_SUCCESS' || authenticateResult === 'failed') {
      return 3;
    } else if (authenticateResult === 'success' && caAuthStatus !== 'CA_SUCCESS') {
      return 4;
    } else if (authenticateResult === 'success' && caAuthStatus === 'CA_SUCCESS') {
      return 5;
    } else {
      return 1;
    }
  }

  @Bind()
  onRefreshToManage() {
    const { location } = this.props;
    const { tenantId = '' } = location && location.search ? getParseUrlParam(location.search) : {};
    const searchParams = {
      companyId: this.state.companyId,
      authInfoId: '',
      authType: this.state.authType,
      tenantId,
    };

    this.props.history.push({
      pathname: `/spfm/sup-sign/simple-dtl`,
      search: stringify(searchParams),
    });
  }

  handleRefreshStep = () => {
    this.fetchDetailInfo();
    this.fetchAuthInfo();
  };

  render() {
    const {
      saving,
      submitting,
      approveLoading,
      reseting,
      queryDetailLoading = false,
      certificateAuthority = {},
      form,
      location,
    } = this.props;

    const { scrollH = '', tenantId } =
      location && location.search ? getParseUrlParam(location.search) : {};

    const detailEnumMap =
      certificateAuthority && certificateAuthority.detailEnumMap
        ? certificateAuthority.detailEnumMap
        : {};
    const { certificatesType = [], legalPersonPlace = [] } = detailEnumMap;

    const {
      detailDataSource,
      step,
      configFlag,
      userAuthStatus,
      detailAutoInfo,
      companyId,
    } = this.state;

    const {
      authenticateResult,
      authenticateResId,
      certificateResult,
      certificateResMsg,
      caAuthStatus,
      authenticateResMsg,
      authInfoId,
      entrustAttachmentUuid,
    } = detailDataSource;

    const companyEditable =
      !!authenticateResult === false ||
      authenticateResult === 'OVER_THE_LIMIT' ||
      authenticateResult === 'INFO_AUTH_FAIL' ||
      authenticateResult === 'NEW'
        ? true
        : false;

    const amountDisabled =
      authenticateResult === 'TO_PAY_SUCCESS' ||
      authenticateResult === 'TO_PAYING' ||
      authenticateResult === 'failed'
        ? true
        : false;

    const firstStep =
      (!authenticateResId && !authenticateResult) ||
      authenticateResult === 'INFO_AUTH_FAIL' ||
      authenticateResult === 'OVER_THE_LIMIT';

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
          handleOk={firstStep ? this.submit : this.approve}
          authType={this.state.authType}
          loading={submitting}
        />
      </Modal>
    );

    const companyName = this?.ds?.current?.get('companyName') ?? '';

    const title = intl.get('spfm.supplierElectronicSign.view.title.supplierPageTitle', {
      name: companyName,
    });

    return (
      <div className={styles['old-detail-panel-basic']}>
        <Header
          title={title}
          backPath={`/spfm/sup-sign/list?defaultItem=${companyId}&scrollH=${scrollH}`}
        >
          {step !== 0 && (
            <Button
              loading={submitting || reseting}
              onClick={this.preSubmit}
              icon="published_with_changes"
              color="primary"
              style={{
                display:
                  authenticateResult === 'TO_PAYING' || authenticateResult === 'success'
                    ? 'none'
                    : 'block',
              }}
            >
              {this.buttonMsg(authenticateResult)}
            </Button>
          )}

          {step !== 0 && (
            <Button
              loading={saving || reseting}
              onClick={this.save}
              icon="save"
              funcType="flat"
              style={{
                display:
                  authenticateResult === 'success' || authenticateResult === 'TO_PAYING'
                    ? 'none'
                    : 'block',
              }}
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
          )}

          <Button
            type="primary"
            loading={approveLoading || reseting}
            onClick={() => {
              this.setState({ statementVisible: true });
            }}
            icon="add"
            color="primary"
            style={{
              display:
                authenticateResult === 'success' && certificateResult === 'failed'
                  ? 'block'
                  : 'none',
            }}
          >
            {intl.get(`spfm.certificateAuthority.view.message.title.authApprove`).d('账号创建')}
          </Button>

          <Button
            loading={reseting || saving}
            onClick={this.handleReset}
            icon="replay"
            funcType="flat"
            style={{
              display:
                (authenticateResult === 'success' && caAuthStatus === 'success') ||
                [0, '0', 1, '1'].includes(step)
                  ? 'none'
                  : 'block',
            }}
          >
            {intl.get(`spfm.certificateAuthority.view.message.title.reset`).d('流程重置')}
          </Button>
        </Header>
        <div className={styles.content}>
          <Spin
            spinning={queryDetailLoading}
            wrapperClassName={classnames(styles['panel-list-wrapper'], DETAIL_DEFAULT_CLASSNAME)}
          >
            <div className={styles.card} style={{ padding: '12px 20px' }}>
              <Fragment>
                <Steps size="small" current={step}>
                  <Step
                    title={intl
                      .get('spfm.buyerElectronicSign.view.title.realNameAuth')
                      .d('实名认证')}
                  />
                  <Step
                    title={intl
                      .get(`spfm.certificateAuthority.view.message.title.infoAuth`)
                      .d('企业信息验证')}
                    status={authenticateResult === 'INFO_AUTH_FAIL' ? 'error' : null}
                    description={
                      authenticateResult === 'INFO_AUTH_FAIL' ||
                      authenticateResult === 'OVER_THE_LIMIT'
                        ? authenticateResMsg
                        : null
                    }
                  />
                  <Step
                    title={intl
                      .get(`spfm.certificateAuthority.view.message.title.toPay`)
                      .d('打款验证')}
                    status={authenticateResult === 'TO_PAY_FAIL' ? 'error' : null}
                    description={
                      authenticateResult === 'TO_PAYING'
                        ? intl
                            .get(`spfm.certificateAuthority.view.message.title.toPayIng`)
                            .d('打款中')
                        : authenticateResult === 'TO_PAY_FAIL'
                        ? authenticateResMsg
                        : null
                    }
                  />
                  <Step
                    title={intl
                      .get(`spfm.certificateAuthority.view.message.title.payAuth`)
                      .d('回款金额验证')}
                    status={authenticateResult === 'failed' ? 'error' : null}
                    description={
                      authenticateResult === 'failed' || authenticateResult === 'TO_PAY_SUCCESS'
                        ? authenticateResMsg
                        : null
                    }
                  />
                  <Step
                    title={intl
                      .get(`spfm.certificateAuthority.view.message.title.authApprove`)
                      .d('账号创建')}
                    status={
                      authenticateResult === 'success'
                        ? certificateResult &&
                          (certificateResult === 'success' ? 'finish' : 'error')
                        : null
                    }
                    description={
                      step === 4 &&
                      (!certificateResult
                        ? certificateResMsg ||
                          intl
                            .get(`spfm.certificateAuthority.view.message.title.createAuthIng`)
                            .d('账号创建中')
                        : certificateResMsg)
                    }
                  />
                  <Step
                    title={intl.get('spfm.buyerElectronicSign.view.title.finished').d('完成')}
                  />
                </Steps>
              </Fragment>
            </div>

            {step === 0 && (
              <div style={{ backgroundColor: '#fff', height: 'calc(100vh - 230px)' }}>
                <RealNameAuth
                  history={this.props.history}
                  authType={this.state.authType}
                  tenantId={tenantId}
                  onRefreshStatus={this.handleRefreshStep}
                />
              </div>
            )}

            {step === 5 && (
              <div style={{ backgroundColor: '#fff', height: 'calc(100vh - 230px)' }}>
                <FinishedPanel
                  history={this.props.history}
                  onRefreshToManage={this.onRefreshToManage}
                />
              </div>
            )}

            {![0, '0', 5, '5'].includes(step) && (
              <>
                {configFlag && caAuthStatus !== 'CA_SUCCESS' && (
                  <div
                    style={{
                      background: 'rgba(25,132,247,0.10)',
                      padding: '8px 20px',
                      fontSize: '14px',
                      color: '#0161D5',
                      borderRadius: '2px',
                      display: 'flex',
                      // alignItems: 'center',
                    }}
                  >
                    <Icon type="help" />
                    &nbsp;&nbsp;
                    {intl
                      .get('spfm.certificateAuthority.view.info.attachment')
                      .d(
                        '若需完成CA认证流程，在账号创建时要同步上传《对公打款企业实名认证授权委托书》，可先行下载，完成填写盖章工作，在账号创建环节进行盖章扫描件的上传。'
                      )}
                    <a
                      style={{
                        color: '#0161D5',
                        width: '120px',
                        marginLeft: '8px',
                        display: 'flex',
                        // alignItems: 'center',
                      }}
                      onClick={this.downloadTemplate}
                    >
                      <span style={{ marginRight: '4px' }}>
                        <DownloadSVG style={{ verticalAlign: 'middle', marginBottom: '2px' }} />
                      </span>
                      <span>
                        {intl.get(`spfm.certificateAuthority.view.info.download`).d('模版下载')}
                      </span>
                    </a>
                  </div>
                )}

                <div className={styles.card}>
                  <div className={styles.cardWrapper}>
                    <div className={styles.cardTitle}>
                      {intl
                        .get(`spfm.certificateAuthority.view.message.title.companyInfo`)
                        .d('企业信息')}
                    </div>
                    <Form
                      dataSet={this.ds}
                      columns={3}
                      className={!!certificateResult && 'c7n-pro-vertical-form-display'}
                      labelLayout={!!certificateResult ? 'vertical' : 'float'}
                    >
                      <ConstructForm
                        formType="TextField"
                        name="companyName"
                        disabled
                        isEdit={!!certificateResult}
                      />
                      <ConstructForm
                        formType="TextField"
                        name="unifiedSocialCode"
                        disabled
                        isEdit={!!certificateResult}
                      />
                      <ConstructForm
                        formType="TextField"
                        name="legalName"
                        disabled={!companyEditable || amountDisabled}
                        isEdit={!!certificateResult}
                      />
                      <ConstructForm
                        formType="Select"
                        name="legalLocale"
                        onChange={(value) => this.handleChangeLegalLocale(value)}
                        disabled={!companyEditable || amountDisabled}
                        isEdit={!!certificateResult}
                      />
                      <ConstructForm
                        formType="Select"
                        Select
                        name="legalDocumentType"
                        disabled
                        isEdit={!!certificateResult}
                      />
                      {authInfoId ? (
                        <ConstructForm
                          formType="SecretField"
                          required={!certificateResult}
                          name="legalIdNum"
                          disabled={!companyEditable || amountDisabled}
                          isEdit={!!certificateResult}
                        />
                      ) : (
                        <ConstructForm
                          formType="TextField"
                          name="legalIdNum"
                          disabled={!companyEditable || amountDisabled}
                          isEdit={!!certificateResult}
                        />
                      )}
                    </Form>
                  </div>
                </div>

                <div className={styles.card} style={{ height: step === 1 ? '49vh' : '' }}>
                  <div className={styles.cardWrapper}>
                    <div className={styles.cardTitle}>
                      {intl
                        .get(`spfm.certificateAuthority.view.message.title.bankInfo`)
                        .d('银行信息')}
                    </div>
                    <Form
                      dataSet={this.ds}
                      columns={3}
                      className={!!certificateResult && 'c7n-pro-vertical-form-display'}
                      labelLayout={!!certificateResult ? 'vertical' : 'float'}
                    >
                      <ConstructForm
                        formType="TextField"
                        name="bankName"
                        help={intl
                          .get('spfm.certificateAuthority.view.message.title.corporateBankName')
                          .d('对公银行名称')}
                        isEdit={!!certificateResult}
                      />
                      <ConstructForm
                        formType="Lov"
                        name="bankBranchNameLov"
                        help={intl
                          .get('spfm.certificateAuthority.view.message.title.branchBank')
                          .d('办理开户手续的营业网点，通常为支行')}
                        disabled={amountDisabled || authenticateResult === 'success'}
                        isEdit={!!certificateResult}
                        tableProps={{
                          pagination: false,
                          buttons: [
                            <Alert
                              style={{
                                marginTop: '16px',
                                marginBottom: '16px',
                                border: 'none',
                                color: '#1983F5',
                              }}
                              message={intl
                                .get(`spfm.certificateAuthority.view.bankBranchName.alert`)
                                .d(
                                  '请输入详细的支行名称进行检索，下列将展示匹配度最高的20条记录。'
                                )}
                              iconType="help"
                              showIcon
                              // closable
                              closeText={<Icon type="close" style={{ color: '#1983F5' }} />}
                            />,
                          ],
                        }}
                      />
                      {authInfoId ? (
                        <ConstructForm
                          formType="SecretField"
                          required={!certificateResult}
                          help={intl
                            .get('spfm.certificateAuthority.view.message.title.corporateAccount')
                            .d('对公银行账户')}
                          name="bankAccountNum"
                          disabled={amountDisabled || authenticateResult === 'success'}
                          isEdit={!!certificateResult}
                        />
                      ) : (
                        <ConstructForm
                          formType="TextField"
                          required={!certificateResult}
                          name="bankAccountNum"
                          help={intl
                            .get('spfm.certificateAuthority.view.message.title.corporateAccount')
                            .d('对公银行账户')}
                          isEdit={!!certificateResult}
                          disabled={amountDisabled || authenticateResult === 'success'}
                        />
                      )}
                    </Form>
                  </div>
                </div>

                {configFlag && ![0, '0', 1, '1'].includes(step) && (
                  <div className={styles.card}>
                    <div className={styles.cardWrapper}>
                      <div className={styles.cardTitle}>
                        {intl
                          .get(`spfm.certificateAuthority.view.title.attorneyAttachment`)
                          .d('委托书附件')}
                      </div>
                      <Attachment
                        // viewMode="popup"
                        funcType="flat"
                        color="none"
                        readOnly={caAuthStatus === 'CA_SUCCESS'}
                        value={entrustAttachmentUuid}
                        bucketName={PRIVATE_BUCKET}
                        onChange={() => {}}
                        label={intl
                          .get('spfm.certificateAuthority.view.button.upload')
                          .d('上传委托书')}
                      />
                    </div>
                  </div>
                )}

                {authenticateResult === 'failed' || authenticateResult === 'TO_PAY_SUCCESS' ? (
                  <div className={styles.card}>
                    <div className={styles.cardWrapper}>
                      <div className={styles.cardTitle}>
                        {intl
                          .get(`spfm.certificateAuthority.view.message.title.amountReceived`)
                          .d('回款金额')}
                      </div>
                      <Form dataSet={this.ds} columns={3} labelLayout={'float'}>
                        <NumberField
                          name="receivableAmount"
                          help={intl
                            .get('spfm.certificateAuthority.view.message.title.amountTip')
                            .d('请填写最新收到的打款金额')}
                          label={intl
                            .get(
                              `spfm.certificateAuthority.model.certificateAuthority.receivableAmount`
                            )
                            .d('金额')}
                          // value={receivableAmount}
                          isEdit
                          required={!certificateResult}
                        />
                      </Form>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </Spin>
        </div>
        {statementModal}
      </div>
    );
  }
}
