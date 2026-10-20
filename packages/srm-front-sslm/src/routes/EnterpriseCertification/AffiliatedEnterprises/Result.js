/*
 * Result - 关联企业结果页
 * @Date: 2022-07-15 11:45:08
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { Fragment, useEffect, useCallback, useMemo, useState } from 'react';
import { Button, Modal, DataSet, Form, Spin, NumberField } from 'choerodon-ui/pro';
import { head, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';

import { getAgreementModal } from '@/routes/components/PrivacyAgreement';
import {
  queryEnterprisesInfo,
  relevanceEnterpriseVerify,
  reassociateEnterprise,
  updateCompanyInfo,
  changeVerification,
  saveCooperateTermsStatus,
  fetchCooperateTerms,
} from '@/services/enterpriseCertificationService';

import styles from '../index.less';
import ManualCheck from './ManualCheck';
import AccountCheck from './AccountCheck';
import ValidationSteps from '../components/ValidationSteps';
import ValidationResult from '../components/ValidationResult';
import { useSetState, enterpriseCheckMethod, enterpriseCheckResult } from '../utils';
import { getEnterpriseVerifyDS, getFillReceivableDS } from '../stores/getAffiliatedEnterprisesDS';

const organizationId = getCurrentOrganizationId();
const isTenantLevel = organizationId !== 0;

const Result = ({ history, location, stepsObj = {}, changeParentState = () => {} }) => {
  const [state, setState] = useSetState({
    comBasicReq: {},
    companyAttestation: {},
    cooperateTermsList: [], // 合作条款
  });
  const [spinning, setSpinning] = useState(false);
  const { comBasicReq, companyAttestation, cooperateTermsList } = state;
  const { companyName } = comBasicReq;
  const { remark, attestationStatus, attestationType, lastUpdateDate } = companyAttestation;
  const {
    noRelieve,
    strategyCfBasic = {},
    existFlag,
    partnerFlag,
    readCooperationFlag,
    inviteCompanyIds,
  } = stepsObj;
  const { agreeTermsFlag, companyNameList = [] } = strategyCfBasic || {};
  const reassociateBtttonHidden = attestationStatus !== 'SUCCESS' || noRelieve === 1;
  // 二级域名注册有合伙伙伴单独提示
  const publicExistFlag = existFlag === 1 && !isTenantLevel; // 公开域名提示
  const subdomainsPartnerFlag = partnerFlag === 1 && isTenantLevel; // 二级域名提示

  const noRelieveFlag = noRelieve === 1; // 不解绑

  const result = useMemo(() => {
    const params = {
      remark,
      noRelieveFlag,
      companyName,
      lastUpdateDate,
      publicExistFlag,
      subdomainsPartnerFlag,
      attestationType,
    };
    return head(enterpriseCheckResult(params).filter(item => item.status === attestationStatus));
  }, [
    attestationStatus,
    noRelieveFlag,
    publicExistFlag,
    companyName,
    companyName,
    remark,
    subdomainsPartnerFlag,
    attestationType,
  ]);

  useEffect(() => {
    handleEnterprisesInfo();
  }, []);

  // 查询企业信息
  const handleEnterprisesInfo = useCallback(() => {
    setSpinning(true);
    queryEnterprisesInfo()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const {
            comBasicReq: newComBasicReq = {},
            companyAttestation: newCompanyAttestation = {},
            companyAttestation: { attestationStatus: newAttestationStatus } = {},
          } = res;
          setState({
            comBasicReq: newComBasicReq,
            companyAttestation: newCompanyAttestation,
          });
          // 如果在认证页面重新关联企业，需要刷新认证页面的状态，不然不能重新渲染
          changeParentState({ attestationStatus: newAttestationStatus });
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  useEffect(() => {
    queryCooperateTerms();
  }, [JSON.stringify(strategyCfBasic)]);

  // 查询采购方合作条款
  const queryCooperateTerms = () => {
    // 二级域名，并且配置了合作条款，查询采购方合作条款
    const policycompanyIdList = isEmpty(companyNameList)
      ? ['0']
      : companyNameList.map(i => i.companyId);
    const companyList = inviteCompanyIds ? inviteCompanyIds.split(',') : policycompanyIdList;
    const companyIdList = companyList.join(',');
    if (isTenantLevel && agreeTermsFlag) {
      const queryParams = {
        companyIdList,
        partnerTenantId: organizationId,
        textCode: 'SSLM.INVITE.PRIVACY_AGREEMENT',
      };
      fetchCooperateTerms(queryParams).then(res => {
        if (getResponse(res)) {
          setState({
            cooperateTermsList: res,
          });
        }
      });
    }
  };

  const getModalChildren = useCallback((key, verifyDataSet) => {
    switch (key) {
      case 'REMIT':
        return <AccountCheck dataSet={verifyDataSet} />;
      default:
        return <ManualCheck dataSet={verifyDataSet} />;
    }
  }, []);

  // 重新填写
  const handleRefill = useCallback(
    key => {
      const checkMethod = enterpriseCheckMethod();
      const currentCheckMethod = head(checkMethod.filter(item => item.key === key)) || {};
      const verifyDataSet = new DataSet(getEnterpriseVerifyDS(key));
      verifyDataSet.create(companyAttestation);
      Modal.open({
        key: Modal.key(),
        border: false,
        okFirst: true,
        style: { width: 420 },
        bodyStyle: { padding: '5px 24px 24px' },
        okText: intl.get('hzero.common.button.submit').d('提交'),
        title: currentCheckMethod.title,
        children: getModalChildren(key, verifyDataSet),
        onOk: async () => {
          const validateFlag = await verifyDataSet.validate();
          let closeFlag = false;
          if (validateFlag) {
            const verifyInfo = verifyDataSet.current?.toJSONData() || {};
            closeFlag = await relevanceEnterpriseVerify({
              comBasicReq,
              companyAttestation: {
                ...companyAttestation,
                ...verifyInfo,
                attestationType: key,
                submitType: key === 'REMIT' ? 'TO_PAY' : null,
              },
            }).then(response => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                handleEnterprisesInfo();
              }
            });
          }
          return closeFlag;
        },
      });
    },
    [comBasicReq, attestationStatus]
  );

  // 更换验证方式
  const changeVerificationMethod = useCallback(() => {
    setSpinning(true);
    if (attestationStatus === 'TO_PAY_SUCCESS') {
      // 打款成功-更换验证方式
      changeVerification()
        .then(response => {
          const res = getResponse(response);
          if (res) {
            handleEnterprisesInfo();
            history.push({
              pathname: '/sslm/enterprise-certification/affiliated',
            });
          }
        })
        .finally(() => setSpinning(false));
    } else {
      reassociateEnterprise()
        .then(response => {
          const res = getResponse(response);
          if (res) {
            handleEnterprisesInfo();
            history.push({
              pathname: '/sslm/enterprise-certification/affiliated',
            });
          }
        })
        .finally(() => setSpinning(false));
    }
  }, [attestationStatus]);

  // 填写回款回调
  const handleFillReceivable = useCallback(() => {
    const fillReceivableDs = new DataSet(getFillReceivableDS());
    Modal.open({
      key: Modal.key(),
      border: false,
      okFirst: true,
      title: intl.get('spfm.enterpriseCertification.view.title.receivable').d('回款'),
      okText: intl.get('hzero.common.button.submit').d('提交'),
      children: (
        <Form dataSet={fillReceivableDs} labelLayout="float">
          <NumberField name="receivableAmount" />
        </Form>
      ),
      onOk: async () => {
        let closeFlag = false;
        const validateFlag = await fillReceivableDs.validate();
        if (validateFlag) {
          const receivableData = fillReceivableDs?.current.toJSONData();
          await relevanceEnterpriseVerify({
            comBasicReq,
            companyAttestation: {
              ...companyAttestation,
              ...receivableData,
              attestationType: 'REMIT',
              submitType: 'PAY_AUTH',
            },
          }).then(response => {
            const res = getResponse(response);
            if (res) {
              closeFlag = true;
              notification.success();
              // 刷新当前页签
              handleEnterprisesInfo();
            }
          });
        }
        return closeFlag;
      },
    });
  }, [comBasicReq, companyAttestation]);

  // 打开单个合作条款
  const handelCooperateTermsModal = terms => {
    getAgreementModal({
      protocolList: [{ ...terms }],
      isEdit: false,
      showWelcomeMsg: false,
    });
  };

  // 保存合作条款已读标识
  const handleCooperateTermsStatus = params => {
    const { hostname } = window.location;
    const { changeReqId } = params || {};
    setSpinning(true);
    saveCooperateTermsStatus({
      webUrl: hostname,
      changeReqId,
    })
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          jumpToMainInfo(params);
        }
      })
      .finally(() => setSpinning(false));
  };

  // 同意合作条款
  const handleCooperateTerms = params => {
    if (isEmpty(cooperateTermsList) || readCooperationFlag) {
      // 直接跳转
      jumpToMainInfo(params);
      return;
    }
    getAgreementModal({
      protocolList: cooperateTermsList,
      showWelcomeMsg: false,
      onAgree: () => {
        // 全部同意之后保存已读标识，下一次不用再弹出
        handleCooperateTermsStatus(params);
      },
    });
  };

  // 完善企业信息
  const handlePerfectInfo = () => {
    setSpinning(true);
    // 调接口更新供应商公司信息，后端通过判断是否带出已存在co编码的供应商信息
    updateCompanyInfo()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { comBasicReq: newComBasicReq = {} } = res;
          // 注册策略开启合作条款配置，同意合作条款
          handleCooperateTerms(newComBasicReq);
        }
      })
      .finally(() => setSpinning(false));
  };

  // 跳转登记信息
  const jumpToMainInfo = (params = {}) => {
    const { changeReqId, domesticForeignRelation } = params || {};
    history.push({
      pathname: '/sslm/enterprise-certification/main-info',
      search: querystring.stringify({
        domesticForeignRelation,
        changeReqId,
      }),
    });
  };

  // const platformFlag = isEmpty(strategyCfBasic) || approveMethod === 'platform';

  // const nextStepFlag =
  //   attestationStatus === 'APPROVING' && attestationType === 'MANPOWER' && !platformFlag;

  const showPerfectInfoBtn = attestationStatus === 'SUCCESS';
  return (
    <Fragment>
      <Header
        title={intl
          .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
          .d('企业认证')}
      >
        {/* <Button
          icon="arrow_forward"
          color="primary"
          type="primary"
          loading={spinning}
          onClick={handlePerfectInfo}
          style={{ display: nextStepFlag ? 'inline-block' : 'none' }}
        >
          {intl.get('sslm.common.view.btn.nextStep').d('下一步')}
        </Button> */}
      </Header>
      <ValidationSteps location={location} stepsObj={stepsObj} />
      <Content wrapperClassName={styles['certification-wrap']}>
        <Spin spinning={spinning}>
          <div className={styles['certification-result']}>
            <div className={styles['certification-result-item']}>
              <ValidationResult result={result} />
              <div className={styles['certification-result-item-btn']}>
                <Button
                  color="primary"
                  hidden={attestationStatus !== 'REJECT' && attestationStatus !== 'TO_PAY_FAIL'}
                  onClick={() => handleRefill(attestationType)}
                >
                  {intl.get('spfm.supplierRegister.view.btn.refill').d('重新填写')}
                </Button>
                <Button
                  hidden={
                    attestationStatus !== 'REJECT' &&
                    attestationStatus !== 'TO_PAY_FAIL' &&
                    attestationStatus !== 'TO_PAY_SUCCESS'
                  }
                  onClick={changeVerificationMethod}
                >
                  {intl
                    .get('spfm.supplierRegister.view.btn.replaceVerificationMethod')
                    .d('更换验证方式')}
                </Button>
                <Button
                  color="primary"
                  hidden={attestationStatus !== 'TO_PAY_SUCCESS'}
                  onClick={handleFillReceivable}
                >
                  {intl.get('spfm.supplierRegister.view.btn.fillReceivable').d('填写回款')}
                </Button>
                <Button
                  color="primary"
                  loading={spinning}
                  hidden={!showPerfectInfoBtn}
                  onClick={handlePerfectInfo}
                >
                  {intl
                    .get('spfm.supplierRegister.view.btn.perfectEnterpriseInfo')
                    .d('完善企业信息')}
                </Button>
                <Button
                  loading={spinning}
                  hidden={reassociateBtttonHidden}
                  onClick={changeVerificationMethod}
                >
                  {intl
                    .get('spfm.supplierRegister.view.btn.reassociateEnterprise')
                    .d('重新关联企业')}
                </Button>
              </div>
              {!isEmpty(cooperateTermsList) && showPerfectInfoBtn && (
                <div className={styles['certification-result-item-terms']}>
                  {intl.get('sslm.common.view.message.readAndAgree').d('请阅读并同意')}
                  {cooperateTermsList.map(n => {
                    return (
                      <span style={{ marginLeft: 8 }}>
                        <a
                          onClick={() => {
                            handelCooperateTermsModal(n);
                          }}
                        >
                          {`《${n.title}》`}
                        </a>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default Result;
