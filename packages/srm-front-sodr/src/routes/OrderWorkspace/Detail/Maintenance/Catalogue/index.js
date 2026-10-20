/*
 * Catalogue - 目录化商城
 * @date: 2021/07/08 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { DataSet, Modal, Tabs } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { Spin, Collapse } from 'choerodon-ui';
import { compose, isFunction, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import remotes from 'utils/remote';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
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
  openTermsModalForSubmit,
  handleOpenFundTermIdDetail,
} from '@/routes/components/utils';
import { confirmModal } from '@/routes/components/ConfirmModal';
import DynamicButtons from '_components/DynamicButtons';

import {
  saveWarn,
  fetchSettings,
  saveDetail,
  deleteSheetDelivery,
  submitDetail,
  addNewSubmitDetail,
  getConfigField,
} from '@/services/orderWorkspaceService';
import { aiPreReview, aiPreReviewStatus } from '@/services/commonService';
import {
  basicInfo,
  organizationInfo,
  detailInfo,
  receiptInfo,
  batchMaintenance,
} from './store/catalogueDs';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import BasicInfo from './BasicInfo';
import OrganizationInfo from './OrganizationInfo';
import DetailInfo from './DetailInfo';
import ReceiptInfo from './ReceiptInfo';
import remoteConfig from './remote';
import AlertTooltip from '../../../AlertTooltip';
import styles from '../../index.less';

const IntervalTime = 5_000;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'receiptInfo',
  'paymentTermInfo',
];
const Catalogue = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceId, sourceType, initPoDataList = [] } = {} },
    customizeForm,
    customizeTable,
    toggleLoading,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const { event } = remote;
  const organizationId = getCurrentOrganizationId();
  const intervalTime = useRef(0); // 记录轮询次数
  const aiQueryTimer = useRef(null); // 定时器
  const [loadings, setLoadings] = useState({});
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const [poDataList, setPoDataList] = useState(initPoDataList); // 并单数据
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
  const batchMaintenanceDs = useMemo(
    () => poDsListMap.get(id)?.batchMaintenanceDs || new DataSet(batchMaintenance()),
    [id]
  );
  const paymentTermInfoDs = useMemo(
    () => poDsListMap.get(id)?.paymentTermInfoDs || new DataSet(paymentTermInfo()),
    [id]
  );
  const basicCurrent = basicInfoDs.current;
  const {
    displayPoNum,
    transactionMode,
    multiDealParentPoHeaderId,
    oldTermHideFlag,
  } = basicCurrent.get([
    'displayPoNum',
    'transactionMode',
    'multiDealParentPoHeaderId',
    'oldTermHideFlag',
  ]);
  const backPath = useMemo(() => {
    return source === 'all'
      ? `/sodr/order-workspace/detail/all-orders/${id}`
      : sourceType === 'copy'
      ? `/sodr/order-workspace/detail/all-orders/${sourceId}`
      : `/sodr/order-workspace/list`;
  }, [source, sourceType]);
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [0, 0, 1],
    }),
    []
  );

  useEffect(() => {
    fetchSetting();
    fetchPermissions();
    getConfigFields();
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

  useEffect(() => {
    if (!poDsListMap.get(id)) {
      poDsListMap.set(id, {
        basicInfoDs,
        organizationInfoDs,
        detailInfoDs,
        receiptInfoDs,
        batchMaintenanceDs,
        paymentTermInfoDs,
      });
      fetchDetailHeader(undefined, { initFLag: true });
    }
    useSetstate({
      loading,
      doubleUnitEnabled: 0,
      organizationInfoDs,
      basicInfoDs,
      detailInfoDs,
      receiptInfoDs,
      batchMaintenanceDs,
      getValues,
    });
  }, [id]);

  // 获取业务规则定义个性化字段是否可修改价格库价格
  const getConfigFields = async () => {
    loading({ getConfigFields: true });
    const res = getResponse(await getConfigField());
    loading({ getConfigFields: false });
    if (res) {
      useSetstate({ newPriceLibFields: res });
    }
  };

  // 查询配置中心
  const fetchSetting = () => {
    fetchSettings().then((res) => {
      if (getResponse(res)) {
        useSetstate({ setting: res['000112'] });
      }
    });
  };

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs, batchMaintenanceDs].forEach((i) => {
      i.setState(state);
    });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };
  const createPrefix = 'srm.po-admin.po.order-workspace.ps.button.cataloguerequest';
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

  /**
   * 订单头行查询
   * @param {Boolean} cache 是否缓存修改数据
   * @param {Boolean} initFlag 是否第一次查询
   */
  const fetchDetailHeader = async (cache = false, { initFlag } = { initFlag: false }) => {
    loading({ all: true });
    fetchDoubleUom();
    if (isFunction(toggleLoading)) {
      toggleLoading(true);
    }
    const res = await basicInfoDs.query(undefined, undefined, cache);
    loading({ all: false });
    if (res) {
      organizationInfoDs.loadData(
        [
          {
            ...res,
            displaySupplierName: res.supplierName || res.supplierCompanyName,
          },
        ],
        undefined,
        cache
      );
      receiptInfoDs.loadData([res], undefined, cache);
      paymentTermInfoDs.loadData([res], undefined, cache);
      if (!initFlag) {
        detailInfoDs.query(undefined, undefined, cache);
      }
      setAiReviewParams(res?.poAiApproveResult?.searchDetailParams);
      setReviewStatus(res?.poAiApproveResult?.aiApproveStatus);
    }
    // 判断父组件有无传递toggleLoading
    if (isFunction(toggleLoading)) {
      toggleLoading();
    }
  };

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  const getValues = useCallback(() => {
    const orgCurrent = organizationInfoDs.current;
    const orgData = getRecordData(orgCurrent);
    const paymentData = getRecordData(paymentTermInfoDs.current);
    const poHeaderDetailDTO = {
      ...basicInfoDs.toJSONData()[0],
      ...organizationInfoDs.toJSONData()[0],
      ...orgData,
      ...paymentData,
    };
    const poLineDetailDTOs = detailInfoDs.toJSONData();
    const fieldMap = detailInfoDs.getState('fieldMap');
    const values = {
      poHeaderDetailDTO,
      poLineDetailDTOs,
    };
    if (fieldMap) {
      values.fieldMap = {
        ...fieldMap,
        unitCode: 'SODR.WORKSPACE_CATALOGUE_DETAIL.BATCHEDIT_NEW',
      };
    }
    return values;
  }, [basicInfoDs, organizationInfoDs, detailInfoDs, paymentTermInfoDs]);

  const handleSaveOrSubmit = async (type) => {
    const { poHeaderDetailDTO, poLineDetailDTOs, fieldMap } = getValues();
    if (!validateLineCalculate({ data: detailInfoDs, type: 'c7n' })) return;
    const customizeUnitCode = [
      'SODR.WORKSPACE_CATALOGUE_DETAIL.BASICINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.PAYMENTTERMINFO',
    ].toString();
    const validateList = [
      organizationInfoDs,
      basicInfoDs,
      receiptInfoDs,
      detailInfoDs,
      paymentTermInfoDs,
    ];
    const data = { poHeaderDetailDTO, poLineDetailDTOs };
    if (fieldMap) data.fieldMap = fieldMap;
    const status = await Promise.all(validateList.map((i) => i.validate()));
    if (status.findIndex((i) => !i) === -1) {
      if (type === 'save') {
        const payload = { data, customizeUnitCode };
        const callback = throttle(
          async () => {
            const res = await saveDetail(payload);
            if (getResponse(res)) {
              notification.success();
              basicInfoDs.setState('updatedFlag', 0);
              organizationInfoDs.setState('updatedFlag', 0);
              detailInfoDs.setState('updatedFlag', 0);
              receiptInfoDs.setState('updatedFlag', 0);
              paymentTermInfoDs.setState('updatedFlag', 0);
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
              await fetchDetailHeader();
            }
          },
          THROTTLE_TIME,
          { trailing: false }
        );
        const ras = await saveWarn(payload);
        if (!getResponse(ras)) return false;
        if (getResponse(ras)?.value) {
          const modalRes = await Modal.confirm({
            children: ras?.message,
            className: styles['detail-save-confirm-modal'],
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
          });
          if (modalRes !== 'ok') return;
        }
        await callback();
      } else {
        const termsRes = await openTermsModalForSubmit({
          body: {
            ...poHeaderDetailDTO,
            poLineExpVOList: poLineDetailDTOs,
            fieldMap,
            saveFlag: 1,
          },
        });
        if (!termsRes) return;
        const ras = await addNewSubmitDetail(data);
        if (getResponse(ras)) {
          const budgetVerificationData = [
            {
              ...poHeaderDetailDTO,
              fieldMap,
              saveFlag: 1,
              viewCode: 'PENDING_DETAIL_VIEW',
              poLineExpVOList: poLineDetailDTOs,
            },
          ];
          const handleSubmit = async () => {
            const beforSubmitRes = await event.fireEvent('beforSubmit', {
              basicInfoDs,
              detailInfoDs,
              data,
            });
            if (!beforSubmitRes) return;
            const fundTermIdDetailRes = await handleOpenFundTermIdDetail('maintenance-submit', {
              ds: paymentTermInfoDs,
              body: {
                poHeaderDetailDTO: { ...poHeaderDetailDTO, saveFlag: 1 },
                poLineDetailDTOs,
                fieldMap,
              },
            });
            if (!fundTermIdDetailRes) return;
            const { fundPageParam } = fundTermIdDetailRes;
            const response = await submitDetail({
              data: { ...data, fundPageParam },
              customizeUnitCode,
            });
            if (getResponse(response)) {
              if (poDataList.length > 1) {
                combinedBillChange();
              } else {
                notification.success();
                history.push({
                  pathname: backPath,
                  state: { _back: -1 },
                });
              }
            }
          };
          if (ras.value) {
            const modalRes = await Modal.confirm({
              className: styles['batch-submit-modal'],
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: <div className={styles['submit-tip']}>{ras.message}</div>,
              okText: intl.get('hzero.common.button.sure').d('确定'),
              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            });
            if (modalRes !== 'ok') return;
          }
          const budgetVerificationRes = await handleBudgetVerification(budgetVerificationData);
          if (!budgetVerificationRes) return;
          await handleSubmit();
        }
      }
    } else {
      showLineDsErrors(detailInfoDs);
    }
  };
  // 在做删除相关操作之前先弹框确认
  const handleDeleteConfirm = () => {
    const info = {
      displayPoNum,
    };
    confirmModal(info, handleDelete);
  };
  const handleDelete = () => {
    const { poHeaderDetailDTO } = getValues();
    loading({ handleDelete: true });
    deleteSheetDelivery([poHeaderDetailDTO]).then((res) => {
      loading({ handleDelete: false });
      if (getResponse(res)) {
        if (poDataList.length > 1) {
          combinedBillChange();
        } else {
          notification.success();
          history.push({
            pathname: backPath,
            state: { _back: -1 },
          });
        }
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
      paymentTermInfoDs.getState('updatedFlag')
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
          onClick: async () => {
            basicInfoDs.status = 'submitting';
            await handleSaveOrSubmit('submit');
            basicInfoDs.status = 'ready';
          },
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.cataloguerequest.submit',
              type: 'c7n-pro',
              meaning: '订单工作台-目录化申请明细-提交',
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
          onClick: async () => {
            basicInfoDs.status = 'submitting';
            await handleSaveOrSubmit('save');
            basicInfoDs.status = 'ready';
          },
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.cataloguerequest.save',
              type: 'c7n-pro',
              meaning: '订单工作台-目录化申请明细-保存',
            },
          ],
        },
      },
      {
        name: 'delete',
        btnComp: Button,
        hidden: transactionMode === 'TRIPARTITE' && multiDealParentPoHeaderId,
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          type: 'c7n-pro',
          loading: headerBtnLoading,
          onClick: handleDeleteConfirm,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.cataloguerequest.delete',
              type: 'c7n-pro',
              meaning: '订单工作台-目录化申请明细-删除',
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
      { code: 'SODR.WORKSPACE_CATALOGUE_DETAIL.BUTTONS', pro: true },
      <DynamicButtons buttons={buttons} />
    );
  });

  const renderContent = () => (
    <Fragment>
      {customizeCollapse(
        {
          code: 'SODR.WORKSPACE_CATALOGUE_DETAIL.COLLAPSE',
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
            <BasicInfo
              ds={basicInfoDs}
              customizeForm={customizeForm}
              oldTermHideFlag={oldTermHideFlag}
            />
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
              getValues={getValues}
              poHeaderId={id}
              remote={remote}
              ds={detailInfoDs}
              basicInfoDs={basicInfoDs}
              customizeForm={customizeForm}
              customizeTable={customizeTable}
              batchMaintenanceDs={batchMaintenanceDs}
              displayDocAndDocFlow={displayDocAndDocFlow}
            />
          </Panel>
          <Panel
            hidden={!oldTermHideFlag}
            key="paymentTermInfo"
            id="order-workSpace-detail-content-paymentTermInfo"
            header={intl.get('sodr.workspace.view.panel.paymentTermInfo').d('订单付款条款信息')}
          >
            <PaymentTermInfo
              ds={paymentTermInfoDs}
              source="maintenance"
              customizeForm={customizeForm}
              customizeCode="SODR.WORKSPACE_CATALOGUE_DETAIL.PAYMENTTERMINFO"
              getValues={getValues}
              fetchDetailHeader={fetchDetailHeader}
            />
          </Panel>
          <Panel
            key="receiptInfo"
            id="order-workSpace-detail-content-receiptInfo"
            header={intl.get('sodr.workspace.view.panel.receiptInfo').d('收货/收单信息')}
          >
            <ReceiptInfo ds={receiptInfoDs} customizeForm={customizeForm} />
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
            'SODR.WORKSPACE_CATALOGUE_DETAIL.ATTACHMENTINFO',
            'SODR.WORKSPACE_CATALOGUE_DETAIL.ATTACHMENTINFO_EXTERNAL',
          ]}
        />
      </Content>
    </Fragment>
  );

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

  const combinedBillChange = () => {
    const newPoDataList = poDataList.filter((i) => i.poHeaderId !== id);
    setPoDataList(newPoDataList);
    onTabChange(newPoDataList[0].poHeaderId);
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
      'SODR.WORKSPACE_CATALOGUE_DETAIL.BUTTONS',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.BASICINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.BATCHEDIT_NEW',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_CATALOGUE_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig),
  observer
)(Catalogue);
