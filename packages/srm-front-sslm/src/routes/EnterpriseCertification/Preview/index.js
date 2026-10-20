/*
 * Preview - 预览页
 * @Date: 2022-07-02 09:57:53
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, notification, Modal, DataSet } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import querystring from 'querystring';
import { isEmpty, isBoolean } from 'lodash';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';

import Investigation from '@/routes/components/Investigation';
import { checkBankAccountCommon } from '@/services/commonService';
import {
  submitApplyManager,
  submitInvestigation,
  submitSecondaryInfoData,
  fetchPublicData,
  queryTabDataConfig,
} from '@/services/enterpriseCertificationService';
import { getBankAccountTips, BANK_ACCOUNT_CONSTANT } from '@/routes/components/utils';

import ValidationSteps from '../components/ValidationSteps';
import MainInfo from '../MainInfo';
import SecondaryInfo from '../SecondaryInfo';
import AppealInfo from '../components/AppealInfo';
import { getAppealInfoDS } from '../stores/getAppealInfoDS';

import styles from '../index.less';

const organizationId = getCurrentOrganizationId();

/**
 * 预览页
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

export default class Preview extends Component {
  constructor(props) {
    super(props);
    // 是否是预览结果页
    const isResult = props.location?.pathname?.includes('result');
    const routerParam = querystring.parse(props.location.search.substr(1));
    const { domesticForeignRelation, changeReqId, source = '' } = routerParam;
    this.state = {
      domesticForeignRelation,
      changeReqId,
      source,
      loading: false,
      isResult,
      investgHeaderId: '',
      investigateTemplateId: '',
      showAppealFlag: false,
      configNameList: [],
      firmAttestationStatus: '',
      appealFlag: 0,
      submitLoading: false,
    };
  }

  appealInfoDS = new DataSet({
    ...getAppealInfoDS(),
  });

  componentDidMount() {
    const { hostname } = window.location;
    this.setState({
      loading: true,
    });
    fetchPublicData(hostname)
      .then(res => {
        if (getResponse(res)) {
          const {
            investigateTemplateId,
            investgHeaderId = '',
            assignId,
            firmAttestationStatus,
            appealFlag,
          } = res;
          this.handleQueryTabConfig(assignId);
          this.setState({
            investigateTemplateId,
            investgHeaderId,
            // assignId,
            firmAttestationStatus,
            appealFlag,
          });
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  // 查询表格配置
  @Bind()
  handleQueryTabConfig(assignId = '') {
    const { changeReqId } = this.state;
    // assignId为空后端查询默认平台配置
    queryTabDataConfig({
      changeReqId,
      assignId,
      visualFlag: 1,
    }).then(res => {
      if (getResponse(res)) {
        // this.handleCreateDataSet(res);
        const configNameList = res.map(item => {
          const { configName } = item;
          return configName;
        });
        this.setState({
          configNameList,
        });
      }
    });
  }

  @Bind()
  handlePrevious() {
    const { history } = this.props;
    const {
      changeReqId,
      source,
      investgHeaderId,
      investigateTemplateId,
      domesticForeignRelation,
    } = this.state;
    let pathname = '/sslm/enterprise-certification/secondary-info';
    let search = querystring.stringify({
      changeReqId,
    });
    if (source === 'ApplyManager') {
      pathname = '/sslm/enterprise-certification/apply-manager';
      search = querystring.stringify({
        changeReqId,
      });
    } else if (source === 'investigation') {
      pathname = '/sslm/enterprise-certification/investigation';
      search = querystring.stringify({
        changeReqId,
        investgHeaderId,
        investigateTemplateId,
        organizationId,
      });
    } else if (source === 'main-info') {
      pathname = '/sslm/enterprise-certification/main-info';
      search = querystring.stringify({
        domesticForeignRelation,
        changeReqId,
      });
    }
    history.push({
      pathname,
      search,
    });
  }

  @Bind()
  handleSumbit() {
    const { source } = this.state;
    if (source === 'ApplyManager') {
      // 管理员申请
      return this.handleCheckBankAccount(false, 'applyManager');
    } else if (source === 'investigation') {
      // 调查表
      return this.handleInvestigationSubmit();
    } else {
      // 次要信息
      return this.submitAndCheck();
    }
  }

  /**
   *  管理员申请提交
   * @param {*} appealFlag 申诉按钮标识
   */
  @Bind()
  handleApplicationSubmit(appealFlag = false) {
    const { changeReqId } = this.state;
    const { setStepsObj = () => {}, history } = this.props;
    this.setState({
      loading: true,
    });
    let payload = {
      changeReqId,
    };
    if (appealFlag) {
      const appealInfoData = this.appealInfoDS.current.toJSONData() || {};
      const { appealReason } = appealInfoData;
      payload = {
        changeReqId,
        appealReason,
      };
    }
    return submitApplyManager(payload)
      .then(response => {
        if (response && response.failed) {
          // 报错了显示出申诉按钮
          if (response.code === 'authentication.failed.notknown.firm') {
            this.setState({ showAppealFlag: true });
            notification.warning({
              placement: 'bottomRight',
              message: response.message,
            });
          } else {
            getResponse(response);
          }
        } else {
          const res = getResponse(response);
          if (res) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            // 跳转
            const { reqStatus } = res;
            setStepsObj(perState => {
              return {
                ...perState,
                firmAttestationStatus: reqStatus,
              };
            });
            history.push({
              pathname: '/sslm/enterprise-certification/result',
            });
          }
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  /**
   * 调查表提交校验
   * @param {*} appealFlag 申诉按钮标识
   */
  @Bind()
  handleInvestigationSubmit(appealFlag = false) {
    return this.handleCheckBankAccount(appealFlag, 'investigation');
  }

  /**
   * 银行账号名称弱校验
   * @param {*} appealFlag 申诉标识
   * @param {*} type 当前提交节点
   */
  @Bind()
  handleCheckBankAccount(appealFlag = false, type = 'platform') {
    const { changeReqId } = this.state;
    this.setState({
      loading: true,
    });
    return checkBankAccountCommon({
      bankAccountList: [],
      documentId: changeReqId,
      documentSource: 'REGISTER',
    })
      .then(response => {
        const res = getResponse(response);
        if (getResponse(response)) {
          const { bankDataFlag = true, bankNameFlag = true } = res || {};
          const checkRepeat = isBoolean(bankDataFlag) && !bankDataFlag;
          // 银行名称不一致需要前端弹窗
          const checkDifferent = isBoolean(bankNameFlag) && !bankNameFlag;

          if (checkRepeat || checkDifferent) {
            const bankRepeatMsg = checkRepeat
              ? getBankAccountTips(BANK_ACCOUNT_CONSTANT.DUPLICATE)
              : '';
            const bankAccountDifferentMsg = checkDifferent ? getBankAccountTips() : '';
            Modal.confirm({
              children: (
                <Fragment>
                  <div>{bankRepeatMsg}</div>
                  <div>{bankAccountDifferentMsg}</div>
                </Fragment>
              ),
              onOk: () => {
                if (['investigation'].includes(type)) {
                  this.handleInvestigationSubmitData(appealFlag);
                } else if (['platform'].includes(type)) {
                  this.handleSecondaryInfoSubmit(appealFlag);
                } else {
                  this.handleApplicationSubmit(appealFlag);
                }
              },
            });
          } // 校验通过
          else if (['investigation'].includes(type)) {
            return this.handleInvestigationSubmitData(appealFlag);
          } else if (['platform'].includes(type)) {
            return this.handleSecondaryInfoSubmit(appealFlag);
          } else {
            return this.handleApplicationSubmit(appealFlag);
          }
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  // 调查表提交
  @Bind()
  handleInvestigationSubmitData(appealFlag = false) {
    const { changeReqId, investgHeaderId } = this.state;
    const { setStepsObj = () => {}, history } = this.props;
    this.setState({
      submitLoading: true,
    });
    let payload = {
      changeReqId,
      investgHeaderId,
    };
    if (appealFlag) {
      const appealInfoData = this.appealInfoDS.current.toJSONData() || {};
      const { appealReason } = appealInfoData;
      payload = {
        ...payload,
        appealReason,
      };
    }
    return submitInvestigation(payload)
      .then(response => {
        if (response && response.failed) {
          // 报错了显示出申诉按钮
          if (response.code === 'authentication.failed.notknown.firm') {
            this.setState({ showAppealFlag: true });
            notification.warning({
              placement: 'bottomRight',
              message: response.message,
            });
          } else {
            getResponse(response);
          }
        } else {
          const res = getResponse(response);
          if (res) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            const { reqStatus } = res || {};
            setStepsObj(perState => {
              return {
                ...perState,
                firmAttestationStatus: reqStatus,
              };
            });
            history.push({
              pathname: '/sslm/enterprise-certification/result',
            });
          }
        }
      })
      .finally(() => {
        this.setState({
          submitLoading: false,
        });
      });
  }

  // 次要信息提交
  @Bind()
  handleSecondaryInfoSubmit(appealFlag = false) {
    const { history, setStepsObj = () => {} } = this.props;
    const { changeReqId } = this.state;
    this.setState({
      submitLoading: true,
    });
    let payload = {
      dataSource: 4,
      sourceKey: 1,
      changeReqId,
    };
    if (appealFlag) {
      const appealInfoData = this.appealInfoDS.current.toJSONData() || {};
      const { appealReason } = appealInfoData;
      payload = {
        ...payload,
        appealReason,
      };
    }
    return submitSecondaryInfoData(payload)
      .then(res => {
        if (res && res.failed) {
          // 报错了显示出申诉按钮
          if (res.code === 'authentication.failed.notknown.firm') {
            this.setState({ showAppealFlag: true });
            notification.warning({
              placement: 'bottomRight',
              message: res.message,
            });
          } else {
            getResponse(res);
          }
        } else if (getResponse(res)) {
          // 跳转
          const { reqStatus } = res;
          setStepsObj(perState => {
            return {
              ...perState,
              firmAttestationStatus: reqStatus,
            };
          });
          history.push({
            pathname: `/sslm/enterprise-certification/result`,
          });
        }
      })
      .finally(() => {
        this.setState({
          submitLoading: false,
        });
      });
  }

  // 不带调查表提交校验
  @Bind()
  submitAndCheck(appealFlag = false) {
    const { configNameList = [] } = this.state;
    if (!isEmpty(configNameList) && configNameList.includes('spfm_company_bank_account')) {
      // 提交前校验银行信息账户名称
      return this.handleCheckBankAccount(appealFlag, 'platform');
    } else {
      return this.handleSecondaryInfoSubmit(appealFlag);
    }
  }

  // 申诉回调
  @Bind()
  handleAppeal = () => {
    this.appealInfoDS.create({});
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: {
        width: 380,
      },
      className: styles['create-modal'],
      title: intl.get('spfm.supplierRegister.button.appealReason').d('申诉理由'),
      okText: intl.get('hzero.common.button.confirm').d('确认'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      okFirst: true,
      destroyOnClose: true,
      children: (
        <Fragment>
          <Alert
            banner
            showIcon
            closable
            type="info"
            iconType="help"
            className={styles['sup-entry-alert']}
            message={intl
              .get('spfm.enterpriseCertification.view.alert.appealWarning')
              .d(
                '如您对审批拒绝的原因有疑义可提出申诉，提交后转至人工审批，将在1个工作日内给您反馈。'
              )}
          />
          <AppealInfo dataSet={this.appealInfoDS} />
        </Fragment>
      ),
      onOk: () => this.handleAppealOk(),
    });
  };

  @Bind()
  async handleAppealOk() {
    const { source } = this.state;
    const appealValidateFlag = await this.appealInfoDS.current.validate();
    if (appealValidateFlag) {
      // 申诉
      if (source === 'ApplyManager') {
        // 管理员申请
        this.handleCheckBankAccount(true, 'applyManager');
      } else if (source === 'investigation') {
        // 调查表
        this.handleInvestigationSubmit(true);
      } else {
        // 次要信息
        this.submitAndCheck(true);
      }
    } else {
      return false;
    }
  }

  render() {
    const {
      location,
      stepsObj = {},
      history,
      remoteHiddenTips,
      enterpriseCertificationRemote,
    } = this.props;
    const {
      domesticForeignRelation,
      changeReqId,
      isResult,
      loading,
      showAppealFlag,
      firmAttestationStatus,
      appealFlag,
      submitLoading,
      investgHeaderId,
      investigateTemplateId,
    } = this.state;
    // 申诉按钮(当 firmAttestationStatus："REJECT" 或者 appealFlag === 1 时显示)
    const showBtn = firmAttestationStatus === 'REJECT' || appealFlag === 1 || showAppealFlag;

    const allLoading = loading || submitLoading;

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
            .d('企业认证')}
        >
          {!isResult && (
            <React.Fragment>
              <Button
                icon="save"
                color="primary"
                type="primary"
                onClick={() => this.handleSumbit()}
                loading={allLoading}
                wait={200}
                waitType="debounce"
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
              <Button
                icon="question_answer"
                funcType="flat"
                onClick={() => this.handleAppeal()}
                hidden={!showBtn}
                loading={allLoading}
                wait={200}
                waitType="debounce"
              >
                {intl.get('spfm.supplierRegister.button.appeal').d('申诉')}
              </Button>
              <Button
                icon="arrow_back"
                funcType="flat"
                onClick={this.handlePrevious}
                loading={allLoading}
                wait={200}
                waitType="debounce"
              >
                {intl.get('sslm.common.view.btn.lastStep').d('上一步')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        {!isResult && <ValidationSteps location={location} stepsObj={stepsObj} />}
        <Content className={styles['result-index-content']}>
          <MainInfo
            domesticFlag={domesticForeignRelation}
            location={location}
            history={history}
            stepsObj={stepsObj}
            enterpriseCertificationRemote={enterpriseCertificationRemote}
          />
          <SecondaryInfo
            changeReqId={changeReqId}
            location={location}
            history={history}
            stepsObj={stepsObj}
          />
          {investigateTemplateId && (
            <Content style={{ marginTop: 0 }}>
              <div id="investigationInfo">
                <Investigation
                  editable={false}
                  remoteHiddenTips={remoteHiddenTips}
                  investgHeaderId={investgHeaderId}
                  investigateTemplateId={investigateTemplateId}
                  organizationId={organizationId}
                />
              </div>
            </Content>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
