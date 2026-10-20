/*
 * index.js - CA认证详情页
 * @author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-09 16:09:07
 * @LastEditTime: 2023-03-27 11:45:12
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
// import { connect } from 'dva';
import { Spin, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
// import { stringify } from 'querystring';
import { isEmpty } from 'lodash';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { HZERO_FILE } from 'utils/config';
import { downloadFile, queryIdpValue } from 'services/api';
// import { Header } from 'components/Page';
import intl from 'utils/intl';
// import formatterCollections from 'utils/intl/formatterCollections';
// import notification from 'utils/notification';
import {
  getCurrentUserId,
  getCurrentOrganizationId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import { Form, NumberField, Attachment } from 'choerodon-ui/pro'; // Modal as C7nModal
import { Steps, Alert, Icon } from 'choerodon-ui';

import { fetchConfig } from '@/services/certificateSdatAuthorityService';
import { ReactComponent as DownloadSVG } from '@/assets/download.svg';

import ConstructForm from './ConstructForm';
// import certificateDs from './ds';
import PrivacyStatement from '../PrivacyStatement';
import styles from './index.less';
import RealNameAuth from '../AuthStepPanel/RealNameAuth';
import FinishedPanel from '../AuthStepPanel/FinishedPanel';

const { Step } = Steps;

export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configFlag: false, // 读取配置表（用于判断是否需要展示下载模版的蓝条和上传委托书的按钮）
      detailAutoInfo: {}, // 实名认证信息
      typeMap: {},
    };
    // this.ds = new DataSet(certificateDs());
  }

  async componentDidMount() {
    const { dispatch } = this.props;

    queryIdpValue('SPFM.PERSON_AUTH_PRODUCT_VERSION').then(res => {
      if (getResponse(res) && Array.isArray(res) && res.length) {
        const obj = {};
        res.forEach(item => {
          obj[item.value] = item.meaning;
        });
        this.setState({
          typeMap: obj,
        });
      }
    });

    await dispatch({
      type: 'certificateAuthorityBuyer/fetchDetailEnum',
    });

    // 读取配置表
    fetchConfig({
      functionCode: 'esign_authorization',
      tenantNum: getCurrentTenant().tenantNum,
      enableFlag: 1,
    }).then(res => {
      if (getResponse(res)) {
        this.setState({
          configFlag: !isEmpty(res),
        });
      }
    });
    this.fetchAuthInfo();
  }

  componentWillReceiveProps(nextProps) {
    const { onFetchDetailInfo = () => {} } = this.props;
    const { companyId, detailDataSource = {} } = nextProps;

    const nextCompanyId = detailDataSource?.companyId ?? '';

    if (
      companyId &&
      this.props.companyId !== companyId &&
      (nextCompanyId === companyId || !nextCompanyId)
    ) {
      onFetchDetailInfo();
      this.fetchAuthInfo();
    }
  }

  @Bind()
  handleAuth() {
    const { authType, history } = this.props;
    if (authType === 'ESIGN') {
      history.push(`/hiam/user/info`);
    }
  }

  @Bind()
  fetchAuthInfo() {
    const { dispatch, authType, onChangeUserAuthStatus = () => {} } = this.props;
    dispatch({
      type: 'certificateAuthorityBuyer/fetchAuthInfo',
      payload: {
        authType,
        userId: getCurrentUserId(),
      },
    }).then(res => {
      if (res) {
        const { userAuthStatus } = res;
        onChangeUserAuthStatus(userAuthStatus);
      } else {
        onChangeUserAuthStatus(false);
      }
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
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fun.call(this, arguments);
      }, delay);
    };
  }

  @Bind()
  handleChangeLegalLocale(val) {
    const arrInclueds = ['0', '1', '2', '3', '4', 0, 1, 2, 3, 4];
    const arr = ['I', 'H', 'H', 'T', 'P'];
    this.props.ds.current.set(
      'legalDocumentType',
      arrInclueds.includes(val) ? arr[Number(val)] : ''
    );
  }

  /**
   * 模版下载
   */
  @Bind()
  downloadTemplate() {
    const {
      detailDataSource: { entrustFileUrl },
    } = this.props;

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
   *  approve - 申请
   */
  @Bind()
  approve() {
    const {
      dispatch,
      authType,
      detailDataSource = {},
      onChangeStatVisible = () => {},
      onFetchDetailInfo = () => {},
    } = this.props;
    dispatch({
      type: 'certificateAuthorityBuyer/approve',
      payload: {
        ...detailDataSource,
        authType,
        tenantId: getCurrentOrganizationId(),
      },
    }).then(() => {
      // this.setState({ statementVisible: false });
      onChangeStatVisible(false);
      onFetchDetailInfo();
    });
  }

  @Bind()
  handleRefreshToManage() {
    const { companyId, onRefreshToManage = () => {} } = this.props;
    onRefreshToManage({ companyId });
  }

  render() {
    const {
      saving,
      submitting,
      approveLoading,
      reseting,
      queryDetailLoading = false,
      certificateAuthority = {},
      form,
      step,
      authType,
      // companyId,
      // userAuthStatus,
      detailDataSource = {},
      onSubmit = () => {},
      onChangeStatVisible = () => {},
      onRefreshStatus = () => {},
    } = this.props;
    const { typeMap } = this.state;

    const detailEnumMap =
      certificateAuthority && certificateAuthority.detailEnumMap
        ? certificateAuthority.detailEnumMap
        : {};
    const { certificatesType = [], legalPersonPlace = [] } = detailEnumMap;

    const { configFlag, detailAutoInfo } = this.state;

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
        key={authType}
        width={600}
        visible={this.props.statementVisible}
        className={styles['theme-config-protocol']}
        onCancel={() => {
          onChangeStatVisible(false);
        }}
        destroyOnClose
        footer={null}
      >
        <PrivacyStatement
          onCancel={() => {
            onChangeStatVisible(false);
          }}
          handleOk={firstStep ? onSubmit : this.approve}
          authType={authType}
          loading={submitting}
        />
      </Modal>
    );

    const companyName = this.props?.ds?.current?.get('companyName') ?? '';

    const title = intl.get('spfm.supplierElectronicSign.view.title.supplierPageTitle', {
      name: companyName,
    });

    return (
      <div className={styles['old-detail-panel-basic']}>
        <div className={styles.content}>
          <Spin
            spinning={queryDetailLoading}
            wrapperClassName={classnames(styles['panel-list-wrapper'], DETAIL_DEFAULT_CLASSNAME)}
          >
            <div className={styles.card} style={{ padding: '12px 20px' }}>
              <Fragment>
                <Steps current={step} size="small">
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
                  authType={authType}
                  typeMap={typeMap}
                  companyDetail={detailDataSource}
                  onRefreshStatus={onRefreshStatus}
                />
              </div>
            )}

            {step === 5 && (
              <div style={{ backgroundColor: '#fff', height: 'calc(100vh - 230px)' }}>
                <FinishedPanel
                  history={this.props.history}
                  onRefreshToManage={this.handleRefreshToManage}
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
                      dataSet={this.props.ds}
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
                        onChange={value => this.handleChangeLegalLocale(value)}
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
                      dataSet={this.props.ds}
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
                        disabled={amountDisabled || authenticateResult === 'success'}
                        isEdit={!!certificateResult}
                        help={intl
                          .get('spfm.certificateAuthority.view.message.title.branchBank')
                          .d('办理开户手续的营业网点，通常为支行')}
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
                          name="bankAccountNum"
                          help={intl
                            .get('spfm.certificateAuthority.view.message.title.corporateAccount')
                            .d('对公银行账户')}
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
                      <Form dataSet={this.props.ds} columns={3} labelLayout={'float'}>
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
