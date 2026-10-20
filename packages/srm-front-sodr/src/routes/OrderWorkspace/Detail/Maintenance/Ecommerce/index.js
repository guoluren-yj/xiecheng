/*
 * Ecommerce - 电商商城
 * @date: 2021/07/08 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Spin, Collapse, Tabs } from 'choerodon-ui';
import { compose, isFunction, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import remotes from 'utils/remote';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Button } from 'components/Permission';
import { getPermissions } from '@/routes/components/Permission';
import OrderAffix from '@/routes/components/OrderAffix';
import AttachmentInfo from '@/routes/components/AttachmentInfo';
import {
  handleBudgetVerification,
  validateLineCalculate,
  queryCommonDoubleUomConfig,
  getRecordData,
  showLineDsErrors,
  getDisplayDocAndDocFlow,
} from '@/routes/components/utils';
import { confirmModal } from '@/routes/components/ConfirmModal';
import {
  saveWarn,
  saveDetail,
  deleteSheetDelivery,
  submitDetail,
  addNewSubmitDetail,
} from '@/services/orderWorkspaceService';
import { aiPreReview, aiPreReviewStatus } from '@/services/commonService';
import DynamicButtons from '_components/DynamicButtons';
import {
  basicInfo,
  organizationInfo,
  detailInfo,
  receiptInfo,
  billingInfo,
} from './store/ecommerceDs';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import DetailInfo from './DetailInfo';
import ReceiptInfo from './ReceiptInfo';
import BillingInfo from './BillingInfo';
import remoteConfig from './remote';
import AlertTooltip from '../../../AlertTooltip';
import styles from '../../index.less';

const IntervalTime = 5_000;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'receiptInfo',
  'billingInfo',
];
const Ecommerce = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceType, sourceId, initPoDataList = [] } = {} },
    customizeForm,
    customizeTable,
    toggleLoading,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const organizationId = getCurrentOrganizationId();
  const intervalTime = useRef(0); // 记录轮询次数
  const aiQueryTimer = useRef(null); // 定时器
  const [loadings, setLoadings] = useState({});
  const [poDataList, setPoDataList] = useState(initPoDataList); // 并单数据
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const [reviewStatus, setReviewStatus] = useState(''); // 预审结果状态
  const [aiReviewParams, setAiReviewParams] = useState(null); // 预审结果参数
  const [isClickAiBtn, setIsClickAiBtn] = useState(false); // 判断是否需要点击智能预审按钮
  const poDsListMap = useMemo(() => new Map(), []);
  const basicInfoDs = useMemo(
    () =>
      poDsListMap.get(id)?.basicInfoDs ||
      new DataSet({
        ...basicInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${id}/detail`,
              method: 'GET',
            };
          },
        },
      }),
    [id]
  );
  const organizationInfoDs = useMemo(
    () => poDsListMap.get(id)?.organizationInfoDs || new DataSet(organizationInfo()),
    [id]
  );
  const detailInfoDs = useMemo(
    () =>
      poDsListMap.get(id)?.detailInfoDs ||
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
    [id]
  );
  const receiptInfoDs = useMemo(
    () => poDsListMap.get(id)?.receiptInfoDs || new DataSet(receiptInfo()),
    [id]
  );
  const billingInfoDs = useMemo(
    () => poDsListMap.get(id)?.billingInfoDs || new DataSet(billingInfo()),
    []
  );
  const backPath = useMemo(() => {
    return source === 'all'
      ? `/sodr/order-workspace/detail/all-orders/${id}`
      : sourceType === 'copy'
      ? `/sodr/order-workspace/detail/all-orders/${sourceId}`
      : `/sodr/order-workspace/list`;
  }, [source]);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [0, 0, 1],
    }),
    []
  );

  useEffect(() => {
    if (!poDsListMap.get(id)) {
      poDsListMap.set(id, {
        basicInfoDs,
        organizationInfoDs,
        detailInfoDs,
        receiptInfoDs,
        billingInfoDs,
      });
      useSetstate({ organizationInfoDs, basicInfoDs, detailInfoDs, loading, doubleUnitEnabled: 0 });
      fetchDetailHeader({ initFlag: true });
    }
    useSetstate({ organizationInfoDs, basicInfoDs, detailInfoDs, loading, doubleUnitEnabled: 0 });
  }, [id]);

  useEffect(() => {
    fetchPermissions();
    getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);

    return () => {
      setIsClickAiBtn(false);
      clearAiQueryTimer();
    };
  }, []);

  // 智能审核状态查询
  const aiPreReviewStatusQuery = async () => {
    const res = await aiPreReviewStatus({ poHeaderId: id });
    if (getResponse(res)) {
      setAiReviewParams(res?.searchDetailParams);
      setReviewStatus(res?.aiApproveStatus);
      intervalTime.current++;
      if (
        intervalTime.current > 4 ||
        ['REJECTED', 'APPROVED', 'APPROVED_SUGGEST'].includes(res?.aiApproveStatus)
      ) {
        if (isClickAiBtn) {
          setIsClickAiBtn(false);
        }
        intervalTime.current = 0;
        clearAiQueryTimer();
      }
    } else {
      clearAiQueryTimer();
    }
  };

  // 清除轮循计时器
  const clearAiQueryTimer = () => {
    if (aiQueryTimer.current) {
      clearInterval(aiQueryTimer.current);
    }
  };

  useEffect(() => {
    if (isClickAiBtn) {
      rollingQueryAiPreReview();
    }
  }, [isClickAiBtn]);

  const rollingQueryAiPreReview = () => {
    clearAiQueryTimer();
    aiQueryTimer.current = setInterval(() => aiPreReviewStatusQuery(), IntervalTime);
  };

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs].forEach((i) => {
      i.setState(state);
    });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };
  const createPrefix = 'srm.po-admin.po.order-workspace.ps.button.ecommercerequest';
  const [createPermsMap, setCreatePermsMap] = React.useState(props.createPermsMap || new Map());
  /**
   * 手动查询权限集
   */
  const fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        `${createPrefix}.insideattachment`,
        `${createPrefix}.externalattachment`,
      ])
    );
    if (res) {
      setCreatePermsMap(res);
    }
  };
  const emitRef = () => {
    return {
      stateCacheMap: {
        createPermsMap,
      },
    };
  };

  if (props.onRef) {
    props.onRef(emitRef);
  }

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  const fetchDetailHeader = ({ initFlag } = { initFlag: false }) => {
    loading({ all: true });
    fetchDoubleUom();
    if (isFunction(toggleLoading)) {
      toggleLoading(true);
    }
    basicInfoDs.query().then((res) => {
      loading({ all: false });
      if (res) {
        organizationInfoDs.loadData([
          {
            ...res,
            displaySupplierName: res.supplierName || res.supplierCompanyName,
          },
        ]);
        receiptInfoDs.create(res);
        billingInfoDs.loadData([res]);
        if (!initFlag) {
          detailInfoDs.query();
        }
      }
      setAiReviewParams(res?.poAiApproveResult?.searchDetailParams);
      setReviewStatus(res?.poAiApproveResult?.aiApproveStatus);
      // 判断父组件有无传递toggleLoading
      if (isFunction(toggleLoading)) {
        toggleLoading();
      }
    });
  };

  const getValues = useCallback(() => {
    const orgCurrent = organizationInfoDs.current;
    const orgData = getRecordData(orgCurrent);
    const poHeaderDetailDTO = {
      ...basicInfoDs.toJSONData()[0],
      ...organizationInfoDs.toJSONData()[0],
      ...orgData,
    };
    const poLineDetailDTOs = detailInfoDs.toJSONData();
    return {
      poHeaderDetailDTO,
      poLineDetailDTOs,
    };
  }, [basicInfoDs, organizationInfoDs, detailInfoDs]);

  const handleSaveOrSubmit = (type) => {
    const { poHeaderDetailDTO, poLineDetailDTOs } = getValues();
    if (!validateLineCalculate({ data: detailInfoDs, type: 'c7n' })) return;
    const customizeUnitCode = [
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.BASICINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.ATTACHMENTINFO_EXTERNAL',
    ].toString();
    const validateList = [
      organizationInfoDs,
      basicInfoDs,
      receiptInfoDs,
      billingInfoDs,
      detailInfoDs,
    ];
    const data = { poHeaderDetailDTO, poLineDetailDTOs };
    Promise.all(validateList.map((i) => i.validate())).then((status) => {
      if (status.findIndex((i) => !i) === -1) {
        if (type === 'save') {
          const payload = { data, customizeUnitCode };
          const callback = () => {
            loading({ handleSave: true });
            saveDetail(payload).then((res) => {
              loading({ handleSave: false });
              if (getResponse(res)) {
                notification.success();
                basicInfoDs.setState('updatedFlag', 0);
                organizationInfoDs.setState('updatedFlag', 0);
                detailInfoDs.setState('updatedFlag', 0);
                receiptInfoDs.setState('updatedFlag', 0);
                billingInfoDs.setState('updatedFlag', 0);
                fetchDetailHeader();
                if (res.errorMsg) {
                  Modal.info({
                    children: res.errorMsg,
                    className: styles['detail-save-confirm-modal'],
                    title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  });
                }
                if (res.maintainErrorMsg) {
                  Modal.info({
                    children: res.maintainErrorMsg,
                    className: styles['detail-save-confirm-modal'],
                    title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  });
                }
              }
            });
          };
          loading({ handleSaveWarn: true });
          saveWarn(payload).then((ras) => {
            loading({ handleSaveWarn: false });
            if (!getResponse(ras)) return false;
            if (getResponse(ras)?.value) {
              Modal.confirm({
                className: styles['detail-save-confirm-modal'],
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: ras?.message,
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                onOk: throttle(callback, THROTTLE_TIME, { trailing: false }),
              });
            } else {
              callback();
            }
          });
        } else {
          loading({ submitDetail: true });
          addNewSubmitDetail(data).then((ras) => {
            loading({ submitDetail: false });
            if (getResponse(ras)) {
              const budgetVerificationData = [
                {
                  ...poHeaderDetailDTO,
                  saveFlag: 1,
                  viewCode: 'PENDING_DETAIL_VIEW',
                  poLineExpVOList: poLineDetailDTOs,
                },
              ];
              const handleSubmit = () => {
                loading({ submitDetail: true });
                submitDetail({ data, customizeUnitCode }).then((response) => {
                  loading({ submitDetail: false });
                  if (getResponse(response)) {
                    notification.success();
                    if (poDataList.length > 1) {
                      combinedBillChange();
                    } else {
                      history.push({
                        pathname: backPath,
                        state: { _back: -1 },
                      });
                    }
                  }
                });
              };
              if (getResponse(ras).value) {
                Modal.confirm({
                  title: getResponse(ras).message,
                  className: styles['batch-submit-modal'],
                  okText: intl.get('hzero.common.button.sure').d('确定'),
                  cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                  onOk: throttle(
                    () => {
                      handleBudgetVerification(budgetVerificationData, handleSubmit, {
                        loading,
                        key: 'submitDetail',
                      });
                    },
                    THROTTLE_TIME,
                    { trailing: false }
                  ),
                });
              } else {
                handleBudgetVerification(budgetVerificationData, handleSubmit, {
                  loading,
                  key: 'submitDetail',
                });
              }
            }
          });
        }
      } else {
        showLineDsErrors(detailInfoDs);
      }
    });
  };
  // 在做删除相关操作之前先弹框确认
  const handleDeleteConfirm = () => {
    const info = {
      displayPoNum: basicInfoDs.current.get('displayPoNum'),
    };
    confirmModal(info, handleDelete);
  };
  const handleDelete = () => {
    const { poHeaderDetailDTO } = getValues();
    loading({ handleDelete: true });
    deleteSheetDelivery([poHeaderDetailDTO]).then((res) => {
      loading({ handleDelete: false });
      if (getResponse(res)) {
        notification.success();
        history.push({
          pathname: backPath,
          state: { _back: -1 },
        });
      }
    });
  };

  // 智能预审
  const handleAiPreReview = async () => {
    if (
      basicInfoDs.getState('updatedFlag') ||
      organizationInfoDs.getState('updatedFlag') ||
      detailInfoDs.getState('updatedFlag') ||
      receiptInfoDs.getState('updatedFlag') ||
      billingInfoDs.getState('updatedFlag')
    ) {
      notification.error({
        description: intl
          .get('sodr.workspace.view.workspace.updateUnSave')
          .d(
            '操作失败，当前存在已修改但未保存的信息，为确保预审助手获取最新数据，请先保存订单，再重新执行智能预审操作。'
          ),
      });
      return;
    }
    const res = await aiPreReview({ poHeaderId: id });
    if (getResponse(res)) {
      setReviewStatus(res?.aiApproveStatus);
      setIsClickAiBtn(true);
    }
  };

  const HeaderButtons = observer(() => {
    const headerBtnLoading =
      loadings.submitDetail ||
      loadings.handleSave ||
      loadings.handleDelete ||
      loadings.handleSaveWarn ||
      basicInfoDs.status !== 'ready' ||
      detailInfoDs.status !== 'ready';
    const {
      transactionMode,
      multiDealParentPoHeaderId,
      prToPoSourcePlatform,
    } = basicInfoDs.current.get([
      'transactionMode',
      'multiDealParentPoHeaderId',
      'prToPoSourcePlatform',
    ]);
    const buttons = [
      {
        name: 'submit',
        btnComp: Button,
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'done',
          color: 'primary',
          type: 'c7n-pro',
          loading: headerBtnLoading,
          onClick: () => handleSaveOrSubmit('submit'),
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.ecommercerequest.submit',
              type: 'c7n-pro',
              meaning: '订单工作台-电商申请明细-提交',
            },
          ],
        },
      },
      {
        name: 'save',
        btnComp: Button,
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'save',
          funcType: 'flat',
          type: 'c7n-pro',
          loading: headerBtnLoading,
          onClick: () => handleSaveOrSubmit('save'),
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.ecommercerequest.save',
              type: 'c7n-pro',
              meaning: '订单工作台-电商申请明细-保存',
            },
          ],
        },
      },
      {
        name: 'delete',
        btnComp: Button,
        hidden:
          (transactionMode === 'TRIPARTITE' && multiDealParentPoHeaderId) ||
          ['SRM', 'ERP'].includes(prToPoSourcePlatform),
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          type: 'c7n-pro',
          loading: headerBtnLoading,
          onClick: handleDeleteConfirm,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.ecommercerequest.delete',
              type: 'c7n-pro',
              meaning: '订单工作台-电商申请明细-删除',
            },
          ],
        },
      },
      {
        name: 'aiPreReview',
        btnComp: Button,
        child: intl.get('sodr.workspace.view.workspace.aiPreReview').d('智能预审'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'offline_bolt-o',
          funcType: 'flat',
          disabled: ['APPROVING'].includes(reviewStatus),
          onClick: handleAiPreReview,
        },
      },
    ];
    return customizeBtnGroup(
      { code: 'SODR.WORKSPACE_ECOMMERCE_DETAIL.BUTTONS', pro: true },
      <DynamicButtons buttons={buttons} />
    );
  });

  const combinedBillChange = () => {
    const newPoDataList = poDataList.filter((i) => i.poHeaderId !== id);
    setPoDataList(newPoDataList);
    onTabChange(newPoDataList[0].poHeaderId, newPoDataList);
  };
  const renderContent = () => {
    return (
      <Fragment>
        {customizeCollapse(
          {
            code: 'SODR.WORKSPACE_ECOMMERCE_DETAIL.COLLAPSE',
          },
          <Collapse
            trigger="text-icon"
            ghost
            expandIconPosition="text-right"
            defaultActiveKey={defaultActiveKey}
          >
            <Panel
              key="basicInfo"
              id="order-workSpace-detail-content-basicInfo"
              header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
            >
              <BasicInfo ds={basicInfoDs} customizeForm={customizeForm} />
            </Panel>
            <Panel
              key="organizationInfo"
              id="order-workSpace-detail-content-organizationInfo"
              header={intl.get('sodr.workspace.view.panel.organization').d('交易方及采买组织信息')}
            >
              <OrganizationInfo ds={organizationInfoDs} customizeForm={customizeForm} />
            </Panel>
            <Panel
              key="detailInfo"
              id="order-workSpace-detail-content-detailInfo"
              header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
            >
              <DetailInfo
                remote={remote}
                ds={detailInfoDs}
                customizeTable={customizeTable}
                displayDocAndDocFlow={displayDocAndDocFlow}
              />
            </Panel>
            <Panel
              key="receiptInfo"
              id="order-workSpace-detail-content-receiptInfo"
              header={intl.get('sodr.workspace.view.panel.receiptInfo').d('收货/收单信息')}
            >
              <ReceiptInfo ds={receiptInfoDs} customizeForm={customizeForm} />
            </Panel>

            <Panel
              key="billingInfo"
              id="order-workSpace-detail-content-billingInfo"
              header={intl.get('sodr.workspace.view.panel.billingInfo').d('开票信息')}
            >
              <BillingInfo ds={billingInfoDs} customizeForm={customizeForm} />
            </Panel>
          </Collapse>
        )}
        <Content className={styles['order-workspace-detail-content']}>
          <AttachmentInfo
            insideAttachment={createPermsMap.get(`${createPrefix}.insideattachment`)}
            externalAttachment={createPermsMap.get(`${createPrefix}.externalattachment`)}
            poHeaderId={id}
            ds={basicInfoDs}
            attachmentConfig={attachmentConfig}
            customizeForm={customizeForm}
            customizeCode={[
              'SODR.WORKSPACE_ECOMMERCE_DETAIL.ATTACHMENTINFO',
              'SODR.WORKSPACE_ECOMMERCE_DETAIL.ATTACHMENTINFO_EXTERNAL',
            ]}
          />
        </Content>
      </Fragment>
    );
  };

  const onTabChange = (newActiveKey, newPoDataList) => {
    const currentData = poDataList.find((i) => i.poHeaderId === newActiveKey);
    if (currentData) {
      const { poSourcePlatform } = currentData;
      history.replace(
        poSourcePlatform === 'E-COMMERCE'
          ? `/sodr/order-workspace/detail/ecommerce-request/${newActiveKey}`
          : poSourcePlatform !== 'CATALOGUE'
          ? `/sodr/order-workspace/detail/purchase-request/${newActiveKey}`
          : `/sodr/order-workspace/detail/catalogue-request/${newActiveKey}`,
        { ...props.location.state, initPoDataList: newPoDataList || poDataList }
      );
    }
  };

  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={backPath}
        title={intl.get('sodr.workspace.view.title.editOrderMaintenance').d('编辑订单')}
      >
        <HeaderButtons />
      </Header>
      <AlertTooltip reviewStatus={reviewStatus} aiReviewParams={aiReviewParams} />
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={!!loadings.all}>
          {poDataList.length > 1 ? (
            <div className={styles['order-workspace-detail-left']}>
              <div className={styles['order-workspace-detail-describe']}>
                <h3>{intl.get(`sodr.workspace.view.title.orderView`).d('订单预览')}</h3>
                <span>
                  {intl.get(`sodr.workspace.view.title.switchNumberPreview`).d('快速切换单号预览')}
                </span>
              </div>
              <Tabs tabPosition="left" onChange={onTabChange} activeKey={id}>
                {poDataList.map((i) => (
                  <TabPane tab={i.displayPoNum} key={i.poHeaderId}>
                    {renderContent()}
                  </TabPane>
                ))}
              </Tabs>
            </div>
          ) : (
            renderContent()
          )}
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.BASICINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.BUTTONS',
      'SODR.WORKSPACE_ECOMMERCE_DETAIL.COLLAPSE',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig)
)(Ecommerce);
