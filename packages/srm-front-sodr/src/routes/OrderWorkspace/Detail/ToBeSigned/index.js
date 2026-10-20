/*
 * ToBeSigned - 订单明细页-订单签署
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Spin, Collapse } from 'choerodon-ui';
import { compose, isEmpty, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { SRM_SPUC } from '_utils/config';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, getUserOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { getFileList, signRetry } from '@/services/orderReleaseService';
import { Button } from 'components/Permission';
import remotes from 'utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import { THROTTLE_TIME, SAAS_SIGN } from '@/routes/components/utils/constant';
import AttachmentInfo from '@/routes/components/AttachmentInfo';
import OrderAffix from '@/routes/components/OrderAffix';
import { queryCommonDoubleUomConfig, getDisplayDocAndDocFlow } from '@/routes/components/utils';
import C7nOperationApprove from '@/routes/components/C7nOperationApprove';
import MessageVerification from '@/routes/components/MessageVerification';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import { basicInfo, organizationInfo, receiptInfo, billingInfo } from './store/toBeBesignedDs';
import { detailInfo } from './store/OrderDetailLineDs';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import OrderDetailLine from './OrderDetailLine';
import SealModal from './SealModal';
import PreviewModal from './PreviewModal';
// import useSyncCallback from './utils';
import remoteConfig from './remote';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const prefix = 'sodr.workspace';
const { Panel } = Collapse;
const defaultActiveKey = ['basicInfo', 'organizationInfo', 'detailInfo', 'paymentTermInfo'];
const ToBeReleased = (props) => {
  const {
    match: {
      params: { id },
    },
    location: { state: { source } = {} },
    customizeForm,
    customizeTable,
    // customizeTabPane,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const [loadings, setLoadings] = useState({});
  const [sealState, setSealState] = useState({
    currentPic: 0,
    focusStatus: '',
    picDataSource: [],
    sealMenuFlag: false,
    confirmChapterLoading: false,
    fetchVerifyPhoneNumLoading: false,
    chapterFlag: false,
    headerInfo: {},
  });
  const [mobileState, setMobileState] = useState({
    phoneNum: null, // 手机号码
    smsVerifyVisible: false, // 短信验证Modal可视
  });
  const [previewState, setPreviewState] = useState({
    fileList: [],
    visible: false,
  });
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs].forEach((i) => {
      i.setState(state);
    });
  };

  const smsVerifyForm = useRef({});
  const sealRef = useRef({
    focusStatus: '',
    picDataSource: [],
  });
  /**
   * 获取印章图片
   */
  const fetchSealPictures = (header) => {
    const { dispatch } = props;
    const { companyId, authType, supplierCompanyId } = header;
    const _companyId =
      getUserOrganizationId() === getCurrentOrganizationId() ? companyId : supplierCompanyId;
    dispatch({
      type: 'orderSign/fetchSealPictures',
      payload: {
        lovCode: 'SPFM.COMPANY_SEAL',
        companyId: _companyId,
        tenantId: getUserOrganizationId(),
        sealType: authType,
      },
    }).then((res) => {
      if (res) {
        const picDataSource = res.filter((item) => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        setSeal({
          picDataSource,
        });
      }
    });
  };
  /**
   * 点击按钮图片移动
   */
  const goToPictureSign = (type) => {
    const { currentPic, imgWeight } = sealState;
    setSeal({
      currentPic: type === 'right' ? currentPic - (imgWeight + 16) : currentPic + (imgWeight + 16),
    });
  };

  /**
   * handleClickImg 印章点击样式改变
   * @param {string} index
   */
  const handleClickImg = (index) => {
    const { focusStatus, picDataSource } = sealState;
    setSeal({
      focusStatus: focusStatus === index + 1 ? '' : index + 1,
      sealPictureUrl: picDataSource[index].sealPictureUrl,
      sealId: focusStatus === index + 1 ? null : picDataSource[index].sealId,
    });
    sealRef.current.sealId = focusStatus === index + 1 ? null : picDataSource[index].sealId;
    sealRef.current.sealPictureUrl = picDataSource[index].sealPictureUrl;
    sealRef.current.focusStatus = focusStatus === index + 1 ? '' : index + 1;
  };

  /**
   * 跳转到印章管理
   */
  const skipToSealManage = () => {
    openTab({
      key: '/spfm/seal-mange',
      title: 'srm.bg.manager.seal.manage',
    });
  };

  /**
   * FDD签章重试确认
   */
  const handleRetryConfirmModal = async (data) => {
    await Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <>
          <p>
            {intl
              .get('sodr.common.modal.sign.retry.tip')
              .d('当前订单已在法大大签署完成，本次签章仅更新SRM订单签署状态')}
          </p>
          <p>{intl.get('sodr.common.modal.sign.retry.confirm').d('是否确认签章？')}</p>
        </>
      ),
      onOk: async () => {
        const ras = getResponse(await signRetry(JSON.parse(data.compensationData || null)));
        if (!ras) return false;
        if (ras) {
          notification.success();
          if (getResponse(await basicInfoDs.query())) {
            detailInfoDs.query();
          }
        }
      },
    });
  };

  /**
   * authType FDD来源直接跳转
   * handleClickSeal 无手机验证签章
   */
  const handleClickSeal = useCallback(async () => {
    const { dispatch } = props;
    const { sealId, sealPictureUrl } = sealRef.current || {};
    const {
      headerInfo: {
        supplierCompanyId,
        mobileVerifyFlag,
        authType,
        companyId,
        pcHeaderId,
        certificateResId,
        terminateSignStatus,
      },
    } = sealState;
    const _companyId =
      getUserOrganizationId() === getCurrentOrganizationId() ? companyId : supplierCompanyId;
    const _supplierCompanyId =
      getUserOrganizationId() === getCurrentOrganizationId() ? supplierCompanyId : companyId;
    const signTypeEstimateFlag = remote?.process('signTypeEstimateFn', null, {
      dispatch,
      authType,
      pcHeaderId,
      certificateResId,
      companyId: _companyId,
      type: 'orderSign/confirmChapter',
    });
    if (signTypeEstimateFlag) return;
    if (mobileVerifyFlag && authType !== 'FDD' && !SAAS_SIGN.test(authType)) {
      if (!sealId) {
        notification.warning({
          message: intl
            .get('sodr.common.button.selectedSignInfoTip')
            .d('请选择一个您需要签署的盖章信息'),
        });
        return false;
      }
      loading({ seal: true });
      const res = await dispatch({
        type: 'orderSign/fetchVerifyPhoneNum',
        payload: {
          authType,
          companyId: _companyId,
          supplierCompanyId: _supplierCompanyId,
        },
      });
      if (res) {
        setMobile({
          smsVerifyVisible: true,
          phoneNum: res.phone,
        });
      } else {
        return false;
      }
      loading({ seal: false });
    } else if (authType === 'FDD') {
      loading({ confirmChapterLoading: true });
      const res = await dispatch({
        type: 'orderSign/confirmChapter',
        payload: {
          authType,
          pcHeaderId,
          certificateResId,
          companyId: _companyId,
        },
      });
      loading({ confirmChapterLoading: false });
      if (!res) return false;
      if (res) {
        if (res.compensationFlag === 1) {
          handleRetryConfirmModal(res);
        } else {
          notification.success();
          window.open(res.signUrl);
          return res;
        }
      }
    } else if (SAAS_SIGN.test(authType)) {
      loading({ confirmChapterLoading: true });
      const res = await dispatch({
        type: 'orderSign/confirmChapter',
        payload: {
          authType,
          pcHeaderId,
          companyId: _companyId,
        },
      });
      loading({ confirmChapterLoading: false });
      if (res) {
        notification.success();
        // 优先考虑 解约签署，再考虑静默签标识
        if (terminateSignStatus && terminateSignStatus === 'WAIT_PURCHASER_SIGN' && res.signUrl) {
          window.open(res.signUrl);
        } else if (res.silentSealFlag === 1) {
          dispatch(
            routerRedux.push({
              pathname: '/sodr/order-workspace/list',
            })
          );
        } else if (!res.silentSealFlag && res.signUrl) {
          window.open(res.signUrl);
        }
        return res;
      } else {
        return false;
      }
    } else {
      if (!sealId) {
        notification.warning({
          message: intl
            .get('sodr.common.button.selectedSignInfoTip')
            .d('请选择一个您需要签署的盖章信息'),
        });
        return false;
      }
      if (!authType || !sealId) return false;
      loading({ seal: true });
      const res = await dispatch({
        type: 'orderSign/confirmChapter',
        payload: {
          authType,
          companyId: _companyId,
          pcHeaderId,
          sealId,
          sealPictureUrl,
          certificateResId,
        },
      });
      loading({ seal: false });
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: '/sodr/order-workspace/list',
          })
        );
        return res;
      } else {
        return false;
      }
    }
  }, [sealState, sealState.sealId]);

  /**
   * 获取手机验证码
   */
  const getVerifyCode = () => {
    const { dispatch } = props;
    const {
      headerInfo: { certificateResId, pcHeaderId, companyId },
    } = sealState;
    const phoneNum = smsVerifyForm.current.getFieldValue('phoneNum');
    smsVerifyForm.current.validateFields(['phoneNum'], (err) => {
      if (!err) {
        dispatch({
          type: 'orderSign/getVerifyCode',
          payload: {
            companyId,
            mobile: phoneNum,
            certificateResId,
            pcHeaderId,
          },
        });
      }
    });
  };

  /**
   * handleSmsVerifyOk - 手机验证签章
   */
  const handleSmsVerifyOk = throttle(
    () => {
      const { validateFields, getFieldsValue } = smsVerifyForm.current;
      const { dispatch } = props;
      const smsVerifyData = getFieldsValue();
      const {
        sealId,
        sealPictureUrl,
        headerInfo: { authType, companyId, pcHeaderId, certificateResId, supplierCompanyId },
      } = sealState;
      const _companyId =
        getUserOrganizationId() === getCurrentOrganizationId() ? companyId : supplierCompanyId;
      validateFields((err) => {
        if (isEmpty(err)) {
          // 获取当前用户手机号 带验证码签章 调用签章接口
          const { phoneNum, verifyCode } = smsVerifyData;
          loading({ mobile: true });
          dispatch({
            type: 'orderSign/confirmMobileChapter',
            payload: {
              authType,
              companyId: _companyId,
              pcHeaderId,
              sealId,
              sealPictureUrl,
              certificateResId,
              verifiCode: verifyCode,
              mobile: phoneNum,
            },
          }).then((res) => {
            loading({ mobile: false });
            if (res) {
              handleSmsVerifyCancel();
              dispatch(
                routerRedux.push({
                  pathname: '/sodr/order-workspace/list',
                })
              );
            }
          });
        }
      });
    },
    THROTTLE_TIME,
    { trailing: false }
  );

  /**
   * handleSmsVerifyCancel - 短信验证取消
   */
  const handleSmsVerifyCancel = () => {
    setMobile({ smsVerifyVisible: false });
    if (smsVerifyForm?.current && smsVerifyForm.current.resetFields) {
      smsVerifyForm.current.resetFields();
    }
  };

  const sealModalProps = {
    ...sealState,
    onSkipToSealManage: skipToSealManage,
    onHandleClickImg: handleClickImg,
    onGoToPictureSign: goToPictureSign,
  };

  const previewModalProps = {
    fileList: previewState.fileList,
    visible: previewState.visible,
    handleCancel: () => {
      setPreview({ visible: false });
    },
    title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
  };

  const messageVerifyProps = {
    ...mobileState,
    ref: smsVerifyForm,
    confirmMobileChapterLoading: loadings.mobile,
    handleOk: handleSmsVerifyOk,
    getVerifyCode,
    handleCancel: handleSmsVerifyCancel,
    headerInfo: sealState.headerInfo,
  };

  const backPath = useMemo(
    () =>
      source === 'all'
        ? `/sodr/order-workspace/detail/all-orders/${id}`
        : '/sodr/order-workspace/list',
    [source]
  );
  const basicInfoDs = useMemo(
    () =>
      new DataSet({
        ...basicInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/detail`,
              method: 'GET',
            };
          },
          submit: ({ dataSet }) => {
            const lineDs = dataSet.getState('detailInfoDs');
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/detail-approve`,
              method: 'POST',
              data: [
                {
                  poHeaderDetailDTO: dataSet.toJSONData()[0],
                  poLineDetailDTOs: lineDs.toJSONData(),
                },
              ],
            };
          },
        },
      }),
    []
  );
  const organizationInfoDs = useMemo(() => new DataSet(organizationInfo()), []);
  const detailInfoDs = useMemo(
    () =>
      new DataSet({
        ...detailInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/detail`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const giftInfoDs = useMemo(
    () =>
      new DataSet(
        giftInfoDsConfig({
          poHeaderId: id,
          params: { customizeUnitCode: 'SODR.WORKSPACE_TOBESIGNED_DETAIL.GIFTINFO' },
        })
      ),
    [id]
  );
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [id]);
  const basicCurrent = basicInfoDs.current;
  const { giftFlag, oldTermHideFlag } = basicCurrent.get(['giftFlag', 'oldTermHideFlag']);
  // 是否展示赠品行
  const hasGift = useMemo(() => {
    return id && giftFlag;
  }, [id, giftFlag]);
  const receiptInfoDs = useMemo(() => new DataSet(receiptInfo()), []);
  const billingInfoDs = useMemo(() => new DataSet(billingInfo()), []);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [1, 0, 1],
    }),
    []
  );

  const getValues = useCallback(() => {
    const poHeaderDetailDTO = basicInfoDs.toJSONData()[0];
    const poLineDetailDTOs = detailInfoDs.toJSONData();
    const values = {
      poHeaderDetailDTO: { ...poHeaderDetailDTO, poWorkbenchFlag: 1 },
      poLineDetailDTOs,
    };
    return values;
  }, [basicInfoDs, detailInfoDs]);

  const contentList = useMemo(() => {
    const { authType, poSourcePlatform, electricSignFlag } = basicInfoDs?.current?.get([
      'authType',
      'poSourcePlatform',
      'electricSignFlag',
    ]);

    const list = [
      {
        key: 'basicInfo',
        content: (
          <Panel
            key="basicInfo"
            id="order-workSpace-detail-content-basicInfo"
            header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
          >
            <BasicInfo ds={basicInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'organizationInfo',
        content: (
          <Panel
            key="organizationInfo"
            id="order-workSpace-detail-content-organizationInfo"
            header={intl.get('sodr.workspace.view.panel.organization').d('交易方及采买组织信息')}
          >
            <OrganizationInfo ds={organizationInfoDs} customizeForm={customizeForm} />
          </Panel>
        ),
      },
      {
        key: 'detailInfo',
        content: (
          <Panel
            key="detailInfo"
            id="order-workSpace-detail-content-detailInfo"
            header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
          >
            <OrderDetailLine
              remote={remote}
              ds={detailInfoDs}
              basicInfoDs={basicInfoDs}
              customizeTable={customizeTable}
              displayDocAndDocFlow={displayDocAndDocFlow}
            />
          </Panel>
        ),
      },
      {
        key: 'giftInfo',
        content: (
          <Panel
            hidden={!hasGift}
            key="giftInfo"
            id="order-workSpace-detail-content-giftInfo"
            header={intl.get('sodr.workspace.view.panel.giftInfo').d('赠品明细信息')}
          >
            <GiftInfo
              ds={giftInfoDs}
              customizeTable={customizeTable}
              code="SODR.WORKSPACE_TOBESIGNED_DETAIL.GIFTINFO"
            />
          </Panel>
        ),
      },
      {
        key: 'paymentTermInfo',
        content: (
          <Panel
            hidden={!oldTermHideFlag}
            key="paymentTermInfo"
            id="order-workSpace-detail-content-paymentTermInfo"
            header={intl.get('sodr.workspace.view.panel.paymentTermInfo').d('订单付款条款信息')}
          >
            <PaymentTermInfo
              ds={paymentTermInfoDs}
              customizeForm={customizeForm}
              customizeCode="SODR.WORKSPACE_TOBESIGNED_DETAIL.PAYMENTTERMINFO"
              getValues={getValues}
            />
          </Panel>
        ),
      },
      {
        key: 'attachmentInfo',
        content: (
          <Content className={styles['order-workspace-detail-content']}>
            <AttachmentInfo
              eSignShow
              ds={basicInfoDs}
              poHeaderId={id}
              terminateSignShow={electricSignFlag && SAAS_SIGN.test(authType)}
              eSignfileList={previewState?.fileList || []}
              attachmentConfig={attachmentConfig}
              customizeForm={customizeForm}
              customizeCode={[
                'SODR.WORKSPACE_TOBESIGNED_DETAIL.ATTACHMENTINFO',
                'SODR.WORKSPACE_TOBESIGNED_DETAIL.ATTACHMENTINFO_EXTERNAL',
              ]}
            />
          </Content>
        ),
      },
    ];
    if (poSourcePlatform === 'CATALOGUE') {
      return list.filter((i) => i.key !== 'billingInfo');
    } else if (poSourcePlatform === 'E-COMMERCE') {
      return list;
    } else {
      return list.filter((i) => !['receiptInfo', 'billingInfo'].includes(i.key));
    }
  });

  const setSeal = (state = {}) => {
    setSealState((preState) => ({ ...preState, ...state }));
  };

  const setMobile = (state = {}) => {
    setMobileState((preState) => ({ ...preState, ...state }));
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };
  const setPreview = (state = {}) => {
    setPreviewState((preState) => ({ ...preState, ...state }));
  };

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  const refresh = ({ initFlag = false }) => {
    loading({ all: true });
    fetchDoubleUom();
    basicInfoDs.query().then((res) => {
      loading({ all: false });
      if (res && !res.failed) {
        if (res.giftFlag) {
          giftInfoDs.query();
        }
        organizationInfoDs.loadData([res]);
        paymentTermInfoDs.loadData([res]);
        receiptInfoDs.create(res);
        billingInfoDs.create(res);
        setSeal({
          headerInfo: res,
        });
        if (res.authType) {
          fetchSealPictures(res);
        }
        if (res.electricSignUrl) {
          getFileList([res.electricSignUrl]).then((v) => {
            if (getResponse(v)) {
              setPreview({ fileList: v });
            }
          });
        }
      }
    });
    if (!initFlag) {
      detailInfoDs.query();
    }
  };

  useEffect(() => {
    useSetstate({
      loading,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      doubleUnitEnabled: 0,
    });
    if (id) {
      refresh({ initFlag: true });
      getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
    }
  }, []);

  const { focusStatus, currentPic, sealId, sealPictureUrl, picDataSource } = sealState;
  useEffect(() => {
    const { sealModal } = sealState;
    if (sealModal) {
      sealModal.update({ children: <SealModal {...sealModalProps} /> });
    }
  }, [focusStatus, currentPic, sealId, sealPictureUrl, picDataSource]);

  useEffect(() => {
    sealRef.current = {};
  }, [sealState.sealModal]);

  const handleSign = () => {
    const sealModal = Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get(`spcm.contractChapter.view.common.title.sealPicture`).d('印章图片'),
      destroyOnClose: true,
      style: { width: 380 },
      children: <SealModal {...sealModalProps} />,
      onOk: throttle(handleClickSeal, THROTTLE_TIME, { trailing: false }),
      okProps: { loading: loadings.seal },
      footer: (okBtn) => okBtn,
      closable: true,
    });
    setSeal({ sealModal });
  };

  const handleRecord = () => {
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 800 },
      children: <C7nOperationApprove poHeaderId={id} modal={modal} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };
  const {
    headerInfo: { authType },
  } = sealState;

  const buttons = [
    {
      btnComp: Button,
      name: 'sign',
      child: intl.get(`hzero.common.button.sign`).d('签章'),
      btnProps: {
        wait: THROTTLE_TIME,
        type: 'c7n-pro',
        color: 'primary',
        icon: 'authorize',
        onClick: () =>
          (
            remote
              ? remote.process(
                  'SODR.WORKSPACE_TOBESIGNED_DETAIL_PROCESS_SIGN',
                  authType && (authType === 'FDD' || SAAS_SIGN.test(authType)),
                  { authType }
                )
              : authType && (authType === 'FDD' || SAAS_SIGN.test(authType))
          )
            ? handleClickSeal()
            : handleSign(),
        loading: loadings.confirmChapterLoading || loadings.all,
      },
    },
    {
      name: 'operationRecord',
      btnComp: Button,
      child: intl.get('sodr.workspace.view.button.operationRecord').d('操作记录'),
      btnProps: {
        funcType: 'flat',
        type: 'c7n-pro',
        icon: 'operation_service_request',
        onClick: handleRecord,
        permissionList: [
          {
            code: 'srm.po-admin.po.order-workspace.ps.button.tobereleased.record',
            type: 'c7n-pro',
            meaning: '订单工作台-待发布明细-操作记录',
          },
        ],
      },
    },
  ];
  const newBtns = remote
    ? remote.process('processHeaderBtns', buttons, {
        basicInfoDs,
        props,
        loading,
        loadings,
        setLoadings,
        detailInfoDs,
      })
    : buttons;
  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={backPath}
        title={intl.get('sodr.workspace.view.title.orderDetails').d('订单明细')}
      >
        {customizeBtnGroup(
          { code: 'SODR.WORKSPACE_TOBESIGNED_DETAIL.BUTTONS', pro: true },
          <DynamicButtons buttons={newBtns} />
        )}
      </Header>
      <div className={styles['order-workspace-detail-container']}>
        <Spin spinning={loadings.all}>
          {customizeCollapse(
            {
              code: 'SODR.WORKSPACE_TOBESIGNED_DETAIL.COLLAPSE',
            },
            <Collapse
              trigger="text-icon"
              ghost
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {contentList.map((i) => i.content)}
            </Collapse>
          )}
        </Spin>
      </div>
      <PreviewModal {...previewModalProps} />
      <MessageVerification {...messageVerifyProps} />
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.BASICINFO',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.DETAILINFO',
      // 'SODR.WORKSPACE_TOBESIGNED_DETAIL.RECEIPTINFO',
      // 'SODR.WORKSPACE_TOBESIGNED_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.BOM',
      'SODR.WORKSPACE_TOBERELEASED_DETAIL.TABS',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.BUTTONS',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.GIFTINFO',
      'SODR.WORKSPACE_TOBESIGNED_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'spcm.common', 'spcm.contractChapter', 'sodr.common'],
  }),
  observer,
  remotes(...remoteConfig)
)(ToBeReleased);
