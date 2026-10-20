/*
 * AffiliatedEnterprises - 关联企业
 * @Date: 2022-06-15 19:03:08
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
// import querystring from 'querystring';
import React, { Fragment, useMemo, useCallback, useEffect, useState } from 'react';
import { head } from 'lodash';
import { DataSet, Modal, Spin, Button, Tooltip } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';

import { relevanceEnterpriseVerify } from 'srm-front-sslm/lib/services/enterpriseCertificationService';
import Result from './Result';
import styles from '../index.less';
import EmailCheck from './EmailCheck';
import AccountCheck from './AccountCheck';
import ManualCheck from './ManualCheck';
import EnterpriseInfo from './EnterpriseInfo';
import ValidationSteps from '../components/ValidationSteps';
import ValidationMethod from '../components/ValidationMethod';
import {
  useSetState,
  enterpriseCheckMethod,
  ocrRecognition,
  getDomesticForeignRelation,
} from 'srm-front-sslm/lib/routes/EnterpriseCertification/utils';
import { getEnterprisesInfoDS } from 'srm-front-sslm/lib/routes/EnterpriseCertification/stores/getAffiliatedEnterprisesDS';
import { getCuxEnterpriseVerifyDS } from '../stores/getCuxEnterpriseVerifyDS';

// 对公账户打款提示文案（二开）
const REMIT_HELP_TEXT = intl
  .get('sslm.enterpriseCertification.view.title.accountTransferMsgCux')
  .d(
    '请使用对公账户（对公账户名称默认为供应名称）向携程账户打款（打款金额0-1元，打款备注：企业名称+员工姓名），打款完成后输入打款的开户行和金额提交认证，提交后请确保在48小时内完成打款，否则回自动过期。'
  );

// 对公账户打款-认证中状态（查看接口后端暂未提供，先本地 mock）
const REMIT_CERTIFYING_STATUS = ['APPROVING', 'REMITTING', 'TO_PAY_SUCCESS'];
const REMIT_MOCK_STORAGE_KEY = 'SSLM_CUX_REMIT_MOCK';

const getRemitMock = () => {
  try {
    return JSON.parse(localStorage.getItem(REMIT_MOCK_STORAGE_KEY)) || null;
  } catch (e) {
    return null;
  }
};

const Index = ({
  history,
  location,
  stepsObj = {},
  setRefreshPublic,
  remoteHiddenTips = false,
  enterpriseCertificationRemote,
}) => {
  const {
    noRelieve,
    companyFlag,
    strategyCfBasic = {},
    ocrFlag,
    country,
    personalRegisterFlag,
    textSearchFlag,
  } = stepsObj;
  const { emailValidationFlag, moneyValidationFlag, artificialValidationFlag } =
    strategyCfBasic || {};
  const [state, setState] = useSetState({
    attestationStatus: null,
    attestationType: null,
    comBasicReq: {},
    companyAttestation: {},
  });
  const { attestationStatus, comBasicReq, companyAttestation } = state;
  const { changeReqId } = comBasicReq;
  // 对公账户打款 mock 数据（后端暂无查看接口）
  const [remitMock, setRemitMock] = useState(getRemitMock);
  const useRemitMock = !!remitMock && (!attestationStatus || attestationStatus === 'NEW');
  const finalAttestationStatus = useRemitMock ? remitMock.status : attestationStatus;
  const attestationType = useRemitMock ? 'REMIT' : state.attestationType;
  // 对公账户打款认证中：展示认证中状态，其他验证方式不可点击
  const remitCertifying =
    attestationType === 'REMIT' && REMIT_CERTIFYING_STATUS.includes(finalAttestationStatus);
  // 认证中查看数据：优先取接口返回，接口没有时使用 mock
  const remitViewInfo = {
    ...((remitMock && remitMock.info) || {}),
    ...(useRemitMock ? {} : companyAttestation),
  };
  // 企业名称类型更换lov，其他字段禁用
  const changeLovFlag = noRelieve === 1 && companyFlag !== 1; // 不解绑，关联表没有数据;

  // orc按钮隐藏 当ocrFlag=true时changeLovFlag=true隐藏，或者当ocrFlag = false一直隐藏
  const orcBtttonHidden = !ocrFlag || changeLovFlag;

  // 企业信息ds
  const dsProps = getEnterprisesInfoDS();
  const remoteDsProps = enterpriseCertificationRemote
    ? enterpriseCertificationRemote.process(
        'SSLM_ENTERPRISE_CERTIFICATION_ENTERPRISES_INFO_DS_PROPS',
        dsProps
      )
    : dsProps;
  const enterprisesInfoDs = useMemo(() => new DataSet(remoteDsProps), []);
  enterprisesInfoDs.setState('showLovFlag', changeLovFlag);

  const [spinning, setSpinning] = useState(false);

  // 是否展示企业验证方式
  const showCheckMethodFlag = useMemo(() => {
    return enterpriseCertificationRemote
      ? enterpriseCertificationRemote.process(
          'SSLM_ENTERPRISE_CERTIFICATION_ENTERPRISE_CHECK_METHOD',
          changeReqId,
          {}
        )
      : changeReqId;
  }, [changeReqId]);

  useEffect(() => {
    queryEnterprisesInfo();
  }, []);

  // 查询企业信息
  const queryEnterprisesInfo = useCallback(() => {
    setSpinning(true);
    enterprisesInfoDs
      .query()
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const {
            comBasicReq: newComBasicReq = {},
            companyAttestation: newCompanyAttestation = {},
            companyAttestation: {
              attestationStatus: newAttestationStatus,
              attestationType: newAttestationType,
            } = {},
          } = res;
          const { registeredCountryId, idType, internationalTelCode } = newComBasicReq || {};
          const { countryCode, countryId, countryName, quickIndex } = country || {};

          // 个人需默认带值中国 (这里先不区分认证类型都统一设置默认的值，保存给后端传值的时候再把值清空)
          const countryInfo = registeredCountryId
            ? {}
            : {
                registeredCountryId: countryId,
                registeredCountryCode: countryCode,
                registeredCountryIdMeaning: countryName,
                quickIndex,
              };
          const newDefaultObj = {
            ...countryInfo,
            certificationType: '1',
            internationalTelCode: internationalTelCode || '+86',
            idType: idType || 'I',
            domesticForeignRelation: '1',
          };
          const defaultObj = enterpriseCertificationRemote
            ? enterpriseCertificationRemote.process(
                'SSLM_ENTERPRISE_CERTIFICATION_ENTERPRISES_INFO_DEFAULT_OBJ',
                newDefaultObj
              )
            : newDefaultObj;

          enterprisesInfoDs.loadData([{ ...defaultObj, ...newComBasicReq }]);
          setState({
            comBasicReq: { ...defaultObj, ...newComBasicReq },
            companyAttestation: newCompanyAttestation,
            attestationStatus: newAttestationStatus,
            attestationType: newAttestationType,
          });
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  // 获取验证方式
  const checkMethod = useMemo(
    () =>
      enterpriseCheckMethod(
        emailValidationFlag,
        moneyValidationFlag,
        artificialValidationFlag
      )
        .filter(item => item.showFlag)
        .map(item => (item.key === 'REMIT' ? { ...item, help: REMIT_HELP_TEXT } : item)),
    [emailValidationFlag, moneyValidationFlag, artificialValidationFlag]
  );

  // 跳转结果页
  const jumpToResult = useCallback(() => {
    history.push({
      pathname: '/sslm/enterprise-certification/affiliated-result',
    });
  }, []);

  const getModalChildren = useCallback((key, verifyDataSet, params) => {
    switch (key) {
      case 'EMAIL':
        return <EmailCheck dataSet={verifyDataSet} params={params} />;
      case 'REMIT':
        return <AccountCheck dataSet={verifyDataSet} />;
      default:
        return <ManualCheck dataSet={verifyDataSet} />;
    }
  }, []);

  // 查看对公账户打款认证中信息（查看接口后端暂未提供，先使用 mock 数据）
  const handleViewRemit = useCallback(() => {
    const viewDataSet = new DataSet(getCuxEnterpriseVerifyDS('REMIT'));
    viewDataSet.create(remitViewInfo);
    Modal.open({
      key: Modal.key(),
      border: false,
      style: { width: 460 },
      bodyStyle: { padding: '5px 24px 24px' },
      title: intl
        .get('spfm.enterpriseCertification.view.title.accountTransfer')
        .d('对公账户打款'),
      children: <AccountCheck dataSet={viewDataSet} readOnly />,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => cancelBtn,
    });
  }, [remitViewInfo]);

  // 提交认证
  const submitCertification = async (key, verifyDataSet) => {
    // 认证信息
    const verifyInfo = verifyDataSet.current?.toJSONData() || {};
    // 头上企业信息
    const enterpriseInfo = enterprisesInfoDs.current?.toJSONData() || {};
    const newComBasicReq = {
      ...comBasicReq,
      ...enterpriseInfo,
    };
    // 判断进内境内境外
    const domesticForeignRelation = getDomesticForeignRelation(enterprisesInfoDs?.current);
    const {
      unifiedSocialCode,
      dunsCode,
      businessRegistrationNumber,
      organizingInstitutionCode,
      ...others
    } = newComBasicReq;
    let finalComBasicReq = {};
    if (Number(domesticForeignRelation) === 1) {
      finalComBasicReq = {
        ...others,
        domesticForeignRelation,
        unifiedSocialCode,
        organizingInstitutionCode,
      };
    } else {
      finalComBasicReq = {
        ...others,
        domesticForeignRelation,
        dunsCode,
        businessRegistrationNumber,
      };
    }
    const payload = {
      comBasicReq: finalComBasicReq,
      companyAttestation: {
        ...companyAttestation,
        ...verifyInfo,
        attestationType: key,
        submitType: key === 'REMIT' ? 'TO_PAY' : null,
      },
    };
    let submitSuccess = false;
    await relevanceEnterpriseVerify(payload).then(response => {
      const res = getResponse(response);
      if (res) {
        submitSuccess = true;
        notification.success();
        if (key === 'REMIT') {
          // 对公账户打款：后端暂无查看接口，先本地 mock 认证中状态与查看数据
          const remitInfo = {
            ...verifyInfo,
            accountName: verifyInfo.accountName || finalComBasicReq.companyName,
          };
          const mockData = { status: 'APPROVING', info: remitInfo };
          setRemitMock(mockData);
          localStorage.setItem(REMIT_MOCK_STORAGE_KEY, JSON.stringify(mockData));
          setState({
            attestationType: 'REMIT',
            attestationStatus: 'APPROVING',
            companyAttestation: { ...companyAttestation, ...remitInfo },
          });
        } else {
          jumpToResult();
        }
      }
    });
    return submitSuccess;
  };

  // 开始认证回调
  const handleCertification = useCallback(
    async key => {
      // 对公账户打款认证中，点击查看已提交的打款信息
      if (key === 'REMIT' && remitCertifying) {
        handleViewRemit();
        return;
      }
      // 头上企业信息,判断境内、境外
      const domesticForeignRelation = getDomesticForeignRelation(enterprisesInfoDs?.current);
      const params = {
        domesticForeignRelation,
      };
      const currentCheckMethod = head(checkMethod.filter(item => item.key === key)) || {};
      const verifyDataSet = new DataSet(getCuxEnterpriseVerifyDS(key));
      verifyDataSet.create(
        key === 'REMIT'
          ? {
              ...companyAttestation,
              // 账户名称默认为头上的供应商企业名称，不可修改
              accountName:
                enterprisesInfoDs.current?.get('companyNameObj')?.companyName ||
                comBasicReq?.companyName ||
                stepsObj.companyName,
            }
          : companyAttestation
      );
      const enterprisesInfoValidate = await enterprisesInfoDs.validate();
      if (enterprisesInfoValidate) {
        Modal.open({
          key: Modal.key(),
          border: false,
          okFirst: true,
          style: { width: 420 },
          bodyStyle: { padding: '5px 24px 24px' },
          okText: intl.get('hzero.common.button.submit').d('提交'),
          title: currentCheckMethod.title,
          children: getModalChildren(key, verifyDataSet, params),
          onOk: async () => {
            const validateFlag = await verifyDataSet.validate();
            let closeFlag = false;
            if (validateFlag) {
              const captcha = verifyDataSet.current?.get('captcha');
              if (key === 'EMAIL') {
                if (captcha) {
                  closeFlag = await submitCertification(key, verifyDataSet);
                } else {
                  notification.warning({
                    message: intl
                      .get('sslm.common.view.messgae.pleaseEnterVerifyCode')
                      .d('请输入验证码'),
                  });
                }
              } else {
                closeFlag = await submitCertification(key, verifyDataSet);
              }
            }
            return closeFlag;
          },
        });
      } else {
        notification.warning({
          message: intl
            .get('spfm.enterpriseCertification.view.messgae.completeInfo')
            .d('请先完善企业信息'),
        });
      }
    },
    [comBasicReq, companyAttestation, remitCertifying, handleViewRemit, stepsObj]
  );

  // 保存回调
  const handleSave = () => {
    setSpinning(true);
    enterprisesInfoDs
      .submit()
      .then(async res => {
        if (res) {
          // 保存后更新state使入口文件能重新查询handlePublicData，从而拿到关键字段
          setRefreshPublic(true);
          if (enterpriseCertificationRemote) {
            const eventProps = {
              history,
              enterprisesInfo: res,
            };
            const cuxResult = await enterpriseCertificationRemote.event.fireEvent(
              'cuxAffiliatedEnterprisesSave',
              eventProps
            );
            if (!cuxResult) {
              return;
            }
          }
          queryEnterprisesInfo();
        }
      })
      .finally(() => setSpinning(false));
  };

  // orc完成之后重新查询
  const handleRefresh = useCallback(() => {
    queryEnterprisesInfo();
  }, []);

  // ocr识别
  const handleOcrDiscern = useCallback(() => {
    const dataSet = new DataSet(getEnterprisesInfoDS({ isOcr: true }));
    ocrRecognition({ dataSet, handleJumpDetail: handleRefresh });
  }, []);

  const saveFlag = finalAttestationStatus !== 'APPROVING';

  const ContentComponent = (
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
          onClick={handleNext}
          loading={spinning}
          style={{ display: nextFlag ? 'inline-block' : 'none' }}
        >
          {intl.get('sslm.common.view.btn.nextStep').d('下一步')}
        </Button> */}
        <Button
          icon="save"
          color="primary"
          type="primary"
          loading={spinning}
          onClick={handleSave}
          style={{ display: saveFlag ? 'inline-block' : 'none' }}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Tooltip
          placement="bottom"
          title={intl
            .get('spfm.enterpriseCertification.view.message.automaticTips')
            .d(
              '在国家工商管理机构登记过的企业，可以上传营业执照，系统将通过OCR识别自动为您录入企业信息，无需手工填写。'
            )}
        >
          <Button
            icon="center_focus_strong-o"
            onClick={handleOcrDiscern}
            funcType="flat"
            loading={spinning}
            hidden={orcBtttonHidden}
          >
            {intl.get('spfm.supplierRegister.view.btn.automatic').d('营业执照识别')}
          </Button>
        </Tooltip>
      </Header>
      <ValidationSteps location={location} stepsObj={stepsObj} />
      <Content
        wrapperClassName={styles['certification-wrap']}
        className={styles['secondary-index-content']}
      >
        <Content>
          <Spin spinning={spinning}>
            <div className={styles['certification-title']}>
              {intl.get('spfm.enterpriseCertification.view.title.enterpriseInfo').d('企业信息')}
              {!remoteHiddenTips && (
                <>
                  <Tag color="blue">
                    {intl
                      .get('spfm.enterpriseCertification.view.message.licenseTips')
                      .d('推荐使用营业执照识别')}
                  </Tag>
                  <div className={styles['certification-title-tips']}>
                    {intl
                      .get('spfm.enterpriseCertification.view.title.enterpriseInfoTips')
                      .d(
                        '请填写您当前任职的企业信息，我们会将您的账号与您当前任职的企业进行关联，以便您后续可以在系统内与合作伙伴进行业务往来。您需自选合适的验证方式辅助证明关联关系的真实有效性。'
                      )}
                  </div>
                </>
              )}
            </div>
            <EnterpriseInfo
              dataSet={enterprisesInfoDs}
              changeLovFlag={changeLovFlag}
              disabled={changeLovFlag}
              personalRegisterFlag={personalRegisterFlag}
              textSearchFlag={textSearchFlag}
              remote={enterpriseCertificationRemote}
            />
          </Spin>
        </Content>
        {showCheckMethodFlag && (
          <Content>
            <Spin spinning={spinning}>
              <div className={styles['certification-title']}>
                {intl
                  .get('spfm.enterpriseCertification.view.title.anyWay')
                  .d('请选择任一方式完成验证')}
                {!remoteHiddenTips && (
                  <Tag color="blue">
                    {intl
                      .get('spfm.enterpriseCertification.view.message.anyWayTips')
                      .d('验证通过还需继续完善其他企业信息')}
                  </Tag>
                )}
              </div>
              <div className={styles['certification-relname-wrap']} style={{ paddingBottom: 60 }}>
                {checkMethod.map(method => (
                  <ValidationMethod
                    key={method.key}
                    method={method}
                    onHandleClick={handleCertification}
                    disabled={remitCertifying && method.key !== 'REMIT'}
                    statusText={
                      remitCertifying && method.key === 'REMIT'
                        ? intl
                            .get('sslm.enterpriseCertification.view.title.certifying')
                            .d('认证中')
                        : null
                    }
                    buttonText={
                      remitCertifying && method.key === 'REMIT'
                        ? intl.get('hzero.common.button.view').d('查看')
                        : null
                    }
                  />
                ))}
              </div>
            </Spin>
          </Content>
        )}
      </Content>
    </Fragment>
  );

  // 解决点击浏览器回退路由导致页面可以重复填写
  // 对公账户打款认证中时停留在当前页，可点击查看已提交的打款信息
  return attestationStatus && attestationStatus !== 'NEW' && !remitCertifying ? (
    <Result
      history={history}
      location={location}
      stepsObj={stepsObj}
      changeParentState={setState}
    />
  ) : (
    ContentComponent
  );
};

export default Index;
