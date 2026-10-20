/* eslint-disable eqeqeq */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState, useMemo } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { Spin, Button, Modal, DataSet } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import { connect } from 'dva';
// import uuid from 'uuid/v4';
import { compose } from 'lodash';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';

import { getParseUrlParam } from '@/utils/utils';
import { SRM_AMKT_HOST } from '@/utils/config';
import {
  fetchOrderStatus,
  fetchSealManage,
  fetchSilentSignManage,
  fetchAuthorizedUrl,
  getRealName,
  resetProcess,
  fetchCancelDocusignAuth,
} from '@/services/electronicSignWorkplaceService';
import { fetchQysStep } from '@/services/supplierElecSignWorkplaceService';

import { save } from '@/services/certificateAuthorityService';

import { SlientAuthDS, AuthHistoryDS, BasicFormDS } from './stores/authDoneDS';

import Workplace from './workplace';
import AuthHistoryModal from './AuthHistoryModal';
import SlientSignModal from './SlientSignModal';
import CertificateDs from './OldDetail/ds';
import DocusignComp from './DocusignComp';

const { TabPane } = Tabs;

const guideConfig = () => {
  return [
    {
      enable: true,
      code: 'SPFM.BUYER_ELECTRONIC_SIGN_DONE_BUTTON_GUIDE',
      // 向导组类型
      type: 'strong',
      // 向导组优先级，在多个向导同时满足条件时，数值大的优先显示
      priority: 0,
      // 版本，每次向导配置变更时，版本号+1，约定为数字
      version: 1,
      // 延时，在满足条件后多少毫秒显示弹窗，解决部分页面向导元素有过渡效果的问题
      delay: 1500,
      optionalSteps: false,
      steps: [
        {
          selector: '.spfm-buyer-electronic-sign-auth-done-member-add-btn',
          // 向导气泡标题
          title: intl
            .get('spfm.buyerElectronicSign.view.button.newAddSignMember')
            .d('新增用印成员'),
          // 向导内容提示，html代码
          htmlText: intl
            .get('spfm.buyerElectronicSign.view.guide.buyerSignStepOne')
            .d('新增人员在完成实名认证后可以在印章管理中授权用章'),
        },

        {
          selector: '.spfm-buyer-electronic-sign-auth-done-header-reAuth-btn',
          // 向导气泡标题
          title: intl
            .get('spfm.buyerElectronicSign.view.button.manageBusinessSign')
            .d('管理企业印章'),
          // 向导内容提示，html代码
          htmlText: intl
            .get('spfm.buyerElectronicSign.view.guide.buyerSignStepTwo')
            .d('跳转第三方平台进行印章制作与印章授权等相关管理事项'),
        },
      ],
    },
  ];
};

let selected = {}; // 选择的公司
let queryBuyerParams = '';

const BuyerElectronicSign = (props) => {
  const {
    customizeBtnGroup,
    saving,
    approveLoading,
    reseting,
    dispatch,
    location,
    history,
  } = props;

  const slientAuthDS = useMemo(() => new DataSet({ ...SlientAuthDS() }), []);
  const authHistoryDS = useMemo(() => new DataSet({ ...AuthHistoryDS() }), []);
  const basicFormDS = useMemo(() => new DataSet({ ...BasicFormDS() }), []);
  const ds = useMemo(() => new DataSet({ ...CertificateDs() }), []);

  const { activeTab = '', authStatus = '' } =
    location && location.search ? getParseUrlParam(location.search) : {};

  const [panelList, setPanelList] = useState([]);
  const [loading, setLoading] = useState([]);
  const [companyDetail, setDetail] = useState({}); // 当前公司详情信息
  const [timeStr, setTimeStr] = useState(new Date().getTime());
  const [refresh, setRefresh] = useState(false);
  const [authInfoId, setAuthInfoId] = useState('');
  const [localPageStep, setPageStep] = useState(''); // 存在当前标记 进入第四步
  const [urlCompanyId, setUrlCompanyId] = useState(''); // 路径回传的companyId
  const [authFinish, setAuthFinish] = useState(false);
  const [detailDataSource, setDetailDataSource] = useState({});
  const [userAuthStatus, setUserAuthStatus] = useState(false); //
  const [statementVisible, setStatementVisible] = useState(false);
  const [step, setStep] = useState(0); // e签宝步骤
  const [current, setCurrent] = useState(null); // 认证状态
  const [isPayment, setIsPayment] = useState(true);
  const [companyList, setCompanyList] = useState([]); // 公司列表
  const [approveFlag, setApproveFlag] = useState('');
  const [activeKey, setActiveTab] = useState();

  const { origin, pathname } = window.location;

  const authType = selected?.partnerCode ?? selected?.authType;

  useEffect(() => {
    injectGuide('/spfm/signature-workplace', guideConfig);

    handleInitPanelList();

    return () => {
      selected = {};
    };
  }, []);

  useEffect(() => {
    if (authStatus) {
      handleInitStatus();
    }

    if (activeTab) {
      setActiveTab(activeTab);
    }
  }, [activeTab, authStatus]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleInitStatus = async () => {
    await fetchCancelDocusignAuth({ authStatus });

    history.replace(`${pathname}?activeTab=${activeTab}`);
  };

  const handleInitPanelList = async () => {
    try {
      setLoading(true);
      const res = await fetchOrderStatus();
      setLoading(false);
      if (getResponse(res)) {
        // 对数据进行排序，将 applicationCode 为 AP_FN_SIGN 的选项排在最后
        const sortedRes = (res || []).sort((a, b) => {
          if (a.applicationCode === 'AP_FN_SIGN' && b.applicationCode !== 'AP_FN_SIGN') {
            return 1; // a 排在后面
          }
          if (a.applicationCode !== 'AP_FN_SIGN' && b.applicationCode === 'AP_FN_SIGN') {
            return -1; // a 排在前面
          }
          return 0; // 保持原有顺序
        });
        setPanelList(sortedRes);
        if (res?.some((item) => item.DOCUSIGN !== 1)?.length) {
          const { pageStep = '', companyId = '' } =
            location && location.search ? getParseUrlParam(location.search) : {};
          setPageStep(pageStep);
          setAuthInfoId('');
          if (pageStep && companyId) {
            setUrlCompanyId(urlCompanyId);
          }
          if (companyId) {
            handleChangeSelected({ companyId });
          }
          setUserAuthStatus(true);
        }

        setActiveTab(activeTab || (sortedRes.length ? sortedRes[0]?.partnerCode : ''));
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleOpenHisModal = () => {
    let modal = null;

    const obj = basicFormDS?.current?.toData() ?? {};

    authHistoryDS.setQueryParameter('signCompanyAuthId', obj?.signCompanyAuthId);
    authHistoryDS.query();

    const handleCloseModal = () => {
      authHistoryDS.data = [];
      authHistoryDS.reset();
      authHistoryDS.queryDataSet.data = [];
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get(`spfm.buyerElectronicSign.model.silentlySignAuthHistory`).d('静默签授权历史'),
      key: Modal.key(),
      children: <AuthHistoryModal dataSet={authHistoryDS} />,
      closable: true,
      drawer: true,
      mask: true,
      destroyOnClose: true,
      style: { width: '1000px' },
      bodyStyle: { padding: '0' },
      onCancel: handleCloseModal,
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 重新授权
   */
  const handleReAuth = async () => {
    if (companyDetail.companyId) {
      const res = await fetchAuthorizedUrl({
        companyId: companyDetail.companyId,
        redirectUrl: `${origin}${pathname}?&companyId=${selected.companyId}`,
      });

      if (getResponse(res) && res.authUrl) {
        history.push(`/spfm/signature-workplace?companyId=${selected.companyId}`);
        handleRefreshStatus(selected);
        window.open(res.authUrl);
      }
    }
  };

  /**
   * 印章管理
   */
  const handleToSignManage = async () => {
    if (selected && selected.companyId) {
      const res = await fetchSealManage({
        companyId: selected.companyId,
      });

      if (!res) return;

      if (res.includes('failed')) {
        // 接口报错
        const result = JSON.parse(res);
        if (result.code === 'amkt.error.external.system.exception.msg') {
          // 无权限
          window.open(`${origin}/app/public/spfm/signature-no-permission`, '_blank');
          return;
        }
        return getResponse(result);
      } else {
        const _DOMAIN = `${SRM_AMKT_HOST}/public`;
        const url = `${_DOMAIN}/amkt/ca-transfer-page?caPath=${res}`;
        window.open(url, '_blank');
      }
    }
  };

  const handleRefreshStatus = (obj) => {
    changeQueryBuyerParams('');
    // setSelectedCompany({ ...obj, uuid: uuid() });
    selected = { ...obj };
    setRefresh(true);
  };

  const cacheCompanyDetail = (record) => {
    setDetail(record);
  };

  const getStep = (res) => {
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
  };

  /**
   * fetchDetailInfo - 查询明细信息
   */
  const fetchDetailInfo = () => {
    const type = authType || selected?.partnerCode || selected?.authType;

    ds.setQueryParameter('companyId', selected?.companyId);
    ds.setQueryParameter('authInfoId', authInfoId);
    ds.setQueryParameter('authType', type);

    if (selected && selected.companyId && type) {
      ds.query().then((res) => {
        if (res) {
          setStep(getStep(res));
          changeDetailDataSource({ ...res, _status: 'update' });
          ds.data = [{ ...res, authType: type, _status: 'update', editFlag: res.certificateResult }];

          fetchQysStep({
            companyId: selected?.companyId ?? '',
            tenantId: getCurrentOrganizationId(),
            authType: type,
          }).then((result) => {
            if (getResponse(result)) {
              setCurrent(result?.currentNode ?? 0);
              setIsPayment(result?.payment ?? true);
            }
          });
        }
      });
    }
  };

  /**
   * submit - 提交
   */
  const submit = () => {
    const { authenticateResult } = detailDataSource;

    ds.validate().then((res) => {
      if (!res) {
        return;
      }

      const arr = ds.toData();
      const data = arr.length ? arr[0] : {};
      const newDetailDataSource = {
        ...data,
        submitType: 'INFO_AUTH', // 默认企业认证
        authType,
      };

      if (authenticateResult === 'INFO_AUTH_SUCCESS' || authenticateResult === 'TO_PAY_FAIL') {
        // 打款
        newDetailDataSource.submitType = 'TO_PAY';
      } else if (authenticateResult === 'failed' || authenticateResult === 'TO_PAY_SUCCESS') {
        // 回款认证
        newDetailDataSource.submitType = 'PAY_AUTH';
      }

      const { companyId } = newDetailDataSource;
      if (!companyId) return;

      return dispatch({
        type: 'certificateAuthorityBuyer/submitDetail',
        payload: {
          ...newDetailDataSource,
          tenantId: selected?.tenantId,
        },
      }).then((rcd) => {
        if (rcd) {
          notification.success();
          setStatementVisible(false);
          fetchDetailInfo();
        } else {
          fetchDetailInfo();
        }
      });
    });
  };

  /**
   * preSubmit - 提交前置modal弹窗
   */
  const preSubmit = () => {
    const { authenticateResult, authenticateResId } = detailDataSource;

    if (userAuthStatus === 'success') {
      if (detailDataSource) {
        ds.validate().then((res) => {
          if (!res) {
            return '';
          }
          Modal.confirm({
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
                setStatementVisible(true);
              } else {
                submit();
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
  };

  const handleReset = () => {
    dispatch({
      type: 'certificateAuthorityBuyer/resetProcess',
      payload: {
        ...detailDataSource,
        authType,
      },
    }).then(() => {
      fetchDetailInfo();
    });
  };

  const buttonMsg = (authenticateResult) => {
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
  };

  /**
   * saveDetail - 保存明细数据
   */
  const saveDetail = () => {
    ds.validate().then((res) => {
      if (!res) {
        return '';
      }
      const data = ds.toData()[0];
      const newDetailDataSource = {
        ...data,
        // ...newHandlePersonValues,
        authType,
      };
      dispatch({
        type: 'certificateAuthorityBuyer/saveDetail',
        payload: newDetailDataSource,
      }).then((rcd) => {
        if (rcd) {
          fetchDetailInfo();
          notification.success();
        }
      });
    });
  };

  /**
   * 流程重置
   */
  const handleResetFlow = () => {
    resetProcess({
      ...companyDetail,
      authType,
    }).then((res) => {
      if (getResponse(res)) {
        // handleStepRefresh(companyDetail);
      }
    });
  };

  const buttons = [
    {
      name: 'silentSignAuth',
      noNest: true,
      btnProps: { onClick: () => handleSilentAuth() },
      child: (text) => (
        <Button icon="vpn_key" funcType="flat" onClick={() => handleSilentAuth()}>
          {text || intl.get(`spfm.buyerElectronicSign.model.silentlySignAuth`).d('静默签授权')}
        </Button>
      ),
    },
  ];

  /**
   * 企业禁用操作
   */
  const handleChangeStatus = async (flag) => {
    if (detailDataSource && Object.keys(detailDataSource).length) {
      await save([
        {
          ...detailDataSource,
          enabledFlag: flag,
        },
      ]).then(() => {
        // refreshToManage(selected);
        setTimeStr(new Date().getTime());
      });
    }
  };

  /**
   * QYS 境外认证 提交授权书
   */
  const handleApprove = () => {
    setApproveFlag(`approve${new Date().getTime()}`);
  };

  /**
   * 静默签授权
   */
  const handleSilentAuth = async () => {
    let modal = null;

    const useObj = await getRealName({
      userId: getCurrentUser()?.id,
      authType: companyDetail?.partnerCode,
    });

    if (slientAuthDS && slientAuthDS.current) {
      slientAuthDS.current.set('authBusiness', companyDetail?.companyName ?? '');
      slientAuthDS.current.set(
        'authedBusiness',
        intl.get(`spfm.buyerElectronicSign.view.title.zhenYunName`).d('上海甄云信息科技有限公司')
      );
      slientAuthDS.current.set('doUser', useObj?.authName);
    } else {
      slientAuthDS.create({
        authBusiness: companyDetail?.companyName ?? '',
        authedBusiness: intl
          .get(`spfm.buyerElectronicSign.view.title.zhenYunName`)
          .d('上海甄云信息科技有限公司'),
        doUser: useObj?.authName,
      });
    }

    const handleCloseModal = () => {
      slientAuthDS.data = [];
      slientAuthDS.reset();
      if (modal) {
        modal.close();
      }
    };

    const confirmSlientAuth = async () => {
      const isValid = await slientAuthDS.validate();

      if (!isValid) return false;

      const obj = slientAuthDS?.toData()[0] ?? {};
      if (selected && selected.companyId) {
        const res = await fetchSilentSignManage({
          companyId: selected.companyId,
          redirectUrl: `${origin}${pathname}`,
          sealId: obj?.sealNumber ?? '',
          orgName: '上海甄云信息科技有限公司',
          orgIDCardNum: '91310118MA1JLY548Q',
          expireTime: obj?.authEndTime ?? '',
        });

        if (getResponse(res) && res.authUrl) {
          window.open(res.authUrl);
          handleCloseModal();
        }
      }
    };

    modal = Modal.open({
      title: intl.get(`spfm.buyerElectronicSign.model.silentlySignAuthConfirm`).d('静默签授权确认'),
      key: Modal.key(),
      children: <SlientSignModal dataSet={slientAuthDS} />,
      closable: true,
      drawer: true,
      mask: true,
      destroyOnClose: true,
      style: { width: '380px' },
      bodyStyle: { padding: '0' },
      onCancel: handleCloseModal,
      footer: (
        <div>
          <Button color="primary" onClick={confirmSlientAuth}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          <Button onClick={handleOpenHisModal}>
            {intl.get(`spfm.buyerElectronicSign.button.authHistory`).d('授权历史')}
          </Button>
        </div>
      ),
    });
  };

  const handleChangeSelected = (obj) => {
    selected = { ...obj };
    setRefresh(true);
  };

  const handleChangeCompanyId = (val) => {
    setUrlCompanyId(val);
  };

  const handleChangePageStep = (val) => {
    setPageStep(val);
  };

  const changeUserAuthStatus = (val) => {
    setUserAuthStatus(val);
  };

  const changeStatementVisible = (val) => {
    setStatementVisible(val);
  };

  const changeStep = (val) => {
    setStep(val);
  };

  const changeQueryBuyerParams = (val) => {
    queryBuyerParams = val;
    setRefresh(true);
  };

  const handleChangeAuthFinish = (val) => {
    setAuthFinish(val);
  };

  const changeDetailDataSource = (data) => {
    setDetailDataSource(data);
  };

  const changeCompanyList = (data) => {
    setCompanyList(data);
  };

  const changeCurrent = (val) => {
    setCurrent(val);
  };

  const changeIsPayment = (val) => {
    setIsPayment(val);
  };

  const changeApproveFlag = (val) => {
    setApproveFlag(val);
  };

  // 只有一家公司 且 未认证通过
  const companyOnlyAuth = companyList && companyList.length === 1 && !queryBuyerParams;

  const companyName =
    companyOnlyAuth && (!authFinish || !(localPageStep && urlCompanyId === selected.companyId))
      ? `${companyList[0].companyName}`
      : '';

  const title =
    companyOnlyAuth && (!authFinish || !(localPageStep && urlCompanyId === selected.companyId))
      ? intl.get('spfm.buyerElectronicSign.view.title.pageTitle', {
          name: companyName || selected.companyName,
        })
      : intl.get('spfm.supplierElectronicSign.view.title.pageTitle').d('采购方电签管理工作台');

  const {
    authenticateResult = {},
    certificateResult,
    enabledFlag,
    personAuthStatus,
  } = detailDataSource;

  const { caAuthStatus } = selected;

  return (
    <Spin spinning={loading}>
      <Header useDefaultTitle={false} title={title}>
        {activeKey === 'DOCUSIGN' ? null : (
          <>
            {['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(authType) ? (
              <>
                {selected &&
                  selected.authorizeStatus === 1 &&
                  authFinish &&
                  !(localPageStep && urlCompanyId === selected.companyId) && (
                    <Button
                      onClick={handleToSignManage}
                      color="primary"
                      icon="approval-o"
                      className="spfm-buyer-electronic-sign-auth-done-header-reAuth-btn"
                    >
                      {intl
                        .get('spfm.buyerElectronicSign.view.button.sealManagement')
                        .d('印章管理')}
                    </Button>
                  )}

                {selected &&
                  [1, '1', 2, '2'].includes(selected.authorizeStatus) &&
                  authFinish &&
                  !(localPageStep && urlCompanyId === selected.companyId) && (
                    <Button onClick={handleReAuth} funcType="flat" icon="vpn_key">
                      {intl
                        .get('spfm.buyerElectronicSign.view.button.reAuthorized')
                        .d('重新企业授权')}
                    </Button>
                  )}

                {selected &&
                  selected.authorizeStatus === 1 &&
                  authFinish &&
                  !(localPageStep && urlCompanyId === selected.companyId) &&
                  customizeBtnGroup(
                    { code: 'SPFM.BUYER_ELECTRONIC_SIGNATURE.BUTTON_GROUP', pro: true },
                    <DynamicButtons buttons={buttons} />
                  )}
              </>
            ) : null}

            {authType === 'ESIGN' &&
            caAuthStatus === 'CA_SUCCESS' &&
            authenticateResult === 'success' &&
            personAuthStatus !== 'PERSONAL_AUTH_NON' ? (
              <Button onClick={handleResetFlow} icon="replay" funcType="flat">
                {intl.get(`spfm.supplierElectronicSign.view.button.authReset`).d('重新认证')}
              </Button>
            ) : null}

            {['ESIGN', 'QYS', 'FDD'].includes(authType) &&
            caAuthStatus === 'CA_SUCCESS' &&
            personAuthStatus !== 'PERSONAL_AUTH_NON' ? (
              <>
                {enabledFlag == 1 ? (
                  <Button onClick={() => handleChangeStatus(0)} funcType="flat">
                    {intl.get('hzero.common.status.disable').d('禁用')}
                  </Button>
                ) : (
                  <Button onClick={() => handleChangeStatus(1)} funcType="flat">
                    {intl.get('hzero.common.status.enable').d('启用')}
                  </Button>
                )}
              </>
            ) : null}

            {authType === 'QYS' &&
            selected?.foreignFlag === 0 &&
            current === 2 &&
            !(caAuthStatus === 'CA_SUCCESS' && personAuthStatus !== 'PERSONAL_AUTH_NON') ? (
              <Button icon="check" color="primary" onClick={handleApprove}>
                {intl.get('hzero.common.button.sumbit').d('提交')}
              </Button>
            ) : null}

            {authType === 'ESIGN' && caAuthStatus !== 'CA_SUCCESS' && (
              <>
                {step !== 0 && (
                  <Button
                    // loading={submitting || reseting}
                    onClick={preSubmit}
                    icon="published_with_changes"
                    color="primary"
                    style={{
                      display:
                        authenticateResult === 'TO_PAYING' || authenticateResult === 'success'
                          ? 'none'
                          : 'block',
                    }}
                  >
                    {buttonMsg(authenticateResult)}
                  </Button>
                )}

                {step !== 0 && (
                  <Button
                    loading={saving || reseting}
                    onClick={saveDetail}
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
                    setStatementVisible(true);
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
                  {intl
                    .get(`spfm.certificateAuthority.view.message.title.authApprove`)
                    .d('账号创建')}
                </Button>

                <Button
                  loading={reseting || saving}
                  onClick={handleReset}
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
              </>
            )}
          </>
        )}
      </Header>
      <div
        style={{
          margin: '0 8px',
          padding: '8px 20px 20px 20px',
          backgroundColor: '#fff',
          height: 'calc(100vh - 138px)',
          overflow: 'hidden',
        }}
      >
        <Tabs
          activeKey={activeKey}
          onChange={(activedKey) => {
            setActiveTab(activedKey);
          }}
        >
          {(panelList || []).map((item) => {
            return (
              <TabPane tab={item.partnerName} key={item.partnerCode}>
                {item.partnerCode === 'DOCUSIGN' ? (
                  <DocusignComp origin={origin} pathname={pathname} tabKey={item.partnerCode} />
                ) : (
                  <Workplace
                    {...props}
                    ds={ds}
                    onCacheCompanyDetail={cacheCompanyDetail}
                    companyDetail={companyDetail}
                    timeStr={timeStr}
                    pathname={pathname}
                    origin={origin}
                    selected={selected}
                    authInfoId={authInfoId}
                    localPageStep={localPageStep}
                    urlCompanyId={urlCompanyId}
                    authFinish={authFinish}
                    detailDataSource={detailDataSource}
                    userAuthStatus={userAuthStatus}
                    statementVisible={statementVisible}
                    authType={authType}
                    step={step}
                    companyList={companyList}
                    current={current}
                    isPayment={isPayment}
                    caAuthStatus={caAuthStatus}
                    approveFlag={approveFlag}
                    basicFormDS={basicFormDS}
                    queryBuyerParams={queryBuyerParams}
                    onChangeStep={changeStep}
                    onSubmit={submit}
                    onChangeStatementVisible={changeStatementVisible}
                    onChangeUserAuthStatus={changeUserAuthStatus}
                    onChangePageStep={handleChangePageStep}
                    onChangeSelected={handleChangeSelected}
                    onChangeCompanyId={handleChangeCompanyId}
                    onChangeAuthFinish={handleChangeAuthFinish}
                    onChangeQueryBuyerParams={changeQueryBuyerParams}
                    onChangeDetailDataSource={changeDetailDataSource}
                    onFetchDetailInfo={fetchDetailInfo}
                    onChangeCompanyList={changeCompanyList}
                    onChangeCurrent={changeCurrent}
                    onChangeIsPayment={changeIsPayment}
                    onChangeApproveFlag={changeApproveFlag}
                  />
                )}
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    </Spin>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SPFM.BUYER_ELECTRONIC_SIGNATURE.BUTTON_GROUP`, // 按钮组
      `SPFM.BUYER_ELECTRONIC_SIGNATURE.FORM`, // 标签页
    ],
  }),
  formatterCollections({
    code: [
      'spfm.buyerElectronicSign',
      'spfm.supplierElectronicSign',
      'hiam.userInfo',
      'spfm.certificateAuthority',
      'spcm.common',
      'entity.company',
      'spfm.sealmanage',
      'spfm.configServer',
    ],
  }),
  connect(({ loading = {}, certificateAuthorityBuyer }) => ({
    queryDetailLoading: loading.effects['certificateAuthorityBuyer/fetchDetailInfo'],
    saving: loading.effects['certificateAuthorityBuyer/saveDetail'],
    submitting: loading.effects['certificateAuthorityBuyer/submitDetail'],
    approveLoading: loading.effects['certificateAuthorityBuyer/approve'],
    reseting: loading.effects['certificateAuthorityBuyer/resetProcess'],
    certificateAuthorityBuyer,
  }))
)(BuyerElectronicSign);
