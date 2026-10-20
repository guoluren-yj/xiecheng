/*
 * SourcingResults - 订单明细页-寻源结果
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Spin, Tabs, Collapse } from 'choerodon-ui';
import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import { resetSearchBarCache } from '_components/SearchBarTable/util/cache';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import remotes from 'utils/remote';
import AttachmentInfo from '@/routes/components/AttachmentInfo';
import { getPermissions } from '@/routes/components/Permission';
import OrderAffix from '@/routes/components/OrderAffix';
import { aiPreReview, aiPreReviewStatus } from '@/services/commonService';
import {
  handleBudgetVerification,
  validateLineCalculate,
  queryCommonDoubleUomConfig,
  getRecordData,
  // getStageIdList,
  showLineDsErrors,
  previewGift,
  getDisplayDocAndDocFlow,
  openTermsModalForSubmit,
  handleOpenFundTermIdDetail,
} from '@/routes/components/utils';
import { confirmModal } from '@/routes/components/ConfirmModal';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import {
  deleteSheetDelivery,
  submitDetail,
  saveDetail,
  saveWarn,
  addNewSubmitDetail,
  fetchDetailTable,
  fetchConfigSheet,
} from '@/services/orderWorkspaceService';
import DetailInfo from './DetailInfo';
import OrganizationInfo from './OrganizationInfo';
import BasicInfo from './BasicInfo';
import {
  basicInfo,
  organizationInfo,
  detailInfo,
  batchMaintenance,
} from './store/SourcingResultsDs';
import remoteConfig from './remote';
import AlertTooltip from '../../../AlertTooltip';
import styles from '../../index.less';

const IntervalTime = 5_000;

const organizationId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const { Panel } = Collapse;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'giftInfo',
  'paymentTermInfo',
];
const SourcingResults = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceType, sourceId, cacheKey } = {} },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const { event } = remote;
  const intervalTime = useRef(0); // 记录轮询次数
  const aiQueryTimer = useRef(null); // 定时器
  const [loadings, setLoadings] = useState({});
  const [poDataList, setPoDataList] = useState([]);
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const [reviewStatus, setReviewStatus] = useState(''); // 预审结果状态
  const [aiReviewParams, setAiReviewParams] = useState(null); // 预审结果参数
  const [isClickAiBtn, setIsClickAiBtn] = useState(false); // 判断是否需要点击智能预审按钮
  const poDsListMap = useMemo(() => new Map(), []);
  const basicInfoDs = useMemo(
    () =>
      poDsListMap.get(id)?.basicInfoDs ||
      new DataSet({
        ...remote?.process('getBasicInfoDs', basicInfo({ remote })),
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
    () => poDsListMap.get(id)?.organizationInfoDs || new DataSet(organizationInfo({ remote })),
    [id]
  );
  const detailInfoDs = useMemo(
    () =>
      poDsListMap.get(id)?.detailInfoDs ||
      new DataSet({
        ...(remote
          ? remote.process(
              'SODR.WORKSPACE_MAINTENANCE_SOURCINGRESULTS_PROCESS_DETAIL_DS',
              detailInfo()
            )
          : detailInfo()),
        transport: {
          read: ({ dataSet }) => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/detail`,
              method: 'GET',
              transformResponse(res) {
                // 个性化的默认值逻辑导致无法通过 record.getPristineValue 来判断原始值是否有值， 临时使用此方式
                const data = JSON.parse(res)?.content || [];
                const responseMap = new Map();
                data.forEach((i) => {
                  responseMap.set(i.poLineId, i);
                });
                dataSet.setState({ responseMap });
                return JSON.parse(res);
              },
            };
          },
          destroy: ({ data }) => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/delete`,
              method: 'DELETE',
              data: data.map((i) => ({
                ...i,
                versionNum: i.locationVersionNumber,
                canCreateAsnFlag: 0,
                tenantId: organizationId,
              })),
            };
          },
        },
      }),
    [id]
  );
  const batchMaintenanceDs = useMemo(() => new DataSet(batchMaintenance()), [id]);
  const giftInfoDs = useMemo(
    () =>
      poDsListMap.get(id)?.giftInfoDs ||
      new DataSet(
        giftInfoDsConfig({
          poHeaderId: id,
          params: { customizeUnitCode: 'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.GIFTINFO' },
        })
      ),
    [id]
  );
  const paymentTermInfoDs = useMemo(
    () => poDsListMap.get(id)?.paymentTermInfoDs || new DataSet(paymentTermInfo()),
    [id]
  );
  const basicCurrent = basicInfoDs.current;
  const { giftFlag, displayPoNum, statusCode, oldTermHideFlag } = basicCurrent.get([
    'giftFlag',
    'displayPoNum',
    'statusCode',
    'oldTermHideFlag',
  ]);
  // 是否展示赠品行
  const hasGift = useMemo(() => {
    return id && Number(giftFlag);
  }, [id, giftFlag]);
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
  const headerBtnLoading = useMemo(
    () =>
      loadings.submitDetail ||
      loadings.handleSave ||
      loadings.handleDelete ||
      loadings.handleSaveWarn ||
      basicInfoDs.status !== 'ready' ||
      detailInfoDs.status !== 'ready',
    [loadings, basicInfoDs.status, detailInfoDs.status]
  );

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs, batchMaintenanceDs].forEach((i) => {
      i.setState(state);
    });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };
  const createPrefix = 'srm.po-admin.po.order-workspace.ps.button.sourceresult';
  const [createPermsMap, setCreatePermsMap] = React.useState(props.createPermsMap || new Map());
  const [supplierLovFlag, setSupplierLovFlag] = React.useState(false); // 是否使用新的供应商值集，默认老的

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
  /**
   * 查询配置表是否使用新的供应商值集
   */
  const fetchSupplierLovConfig = async () => {
    const res = getResponse(await fetchConfigSheet());
    if (isEmpty(res)) {
      setSupplierLovFlag(true);
      useSetstate({ supplierLovFlag: true });
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
  const fetchDetailHeader = async (cache, { initFlag } = { initFlag: false }) => {
    loading({ all: true });
    fetchDoubleUom();
    const res = await basicInfoDs.query(undefined, undefined, cache);
    loading({ all: false });
    if (res) {
      if (res.giftFlag) {
        giftInfoDs.query();
      }
      setAiReviewParams(res?.poAiApproveResult?.searchDetailParams);
      setReviewStatus(res?.poAiApproveResult?.aiApproveStatus);
      const data = [
        {
          ...res,
          displaySupplierName: res.supplierName || res.supplierCompanyName,
        },
      ];
      paymentTermInfoDs.loadData(data);
      organizationInfoDs.loadData(data, undefined, cache);
      const lineRes = !initFlag && (await detailInfoDs.query(undefined, undefined, cache));
      return [res, lineRes];
    }
  };

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig({ moduleCode: 'RFX' });
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  useEffect(() => {
    fetchPermissions();
    fetchSupplierLovConfig();
    getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
    resetSearchBarCache('SODR.WORKSPACE_SOURCINGRESULTS.SEARCH', 'sourcingResults_detail');
    if (cacheKey) {
      fetchDetailTable({ cacheKey }).then((res) => {
        if (getResponse(res)) {
          setPoDataList(isEmpty(res) ? [] : res);
        }
      });
    }

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
      fetchDetailHeader();
    }
    useSetstate({
      organizationInfoDs,
      basicInfoDs,
      detailInfoDs,
      loading,
      doubleUnitEnabled: 0,
      getValues,
    });
  }, [id]);

  const handleSaveOrSubmit = async (type) => {
    if (event) {
      const beforHandleSaveOrSubmitRes = await event.fireEvent('beforHandleSaveOrSubmit', {
        basicInfoDs,
        organizationInfoDs,
        detailInfoDs,
        paymentTermInfoDs,
        type,
      });
      if (!beforHandleSaveOrSubmitRes) return;
    }
    const values = getValues();
    let { poHeaderDetailDTO, poLineDetailDTOs } = values;
    const { fieldMap } = getValues();
    const customizeUnitCode = String([
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.BASICINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.PAYMENTTERMINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.COSTINFORMATION',
    ]);
    const validateList = [organizationInfoDs, basicInfoDs, detailInfoDs, paymentTermInfoDs];
    if (!validateLineCalculate({ data: detailInfoDs, type: 'c7n' })) return;
    const status = await Promise.all(validateList.map((i) => i.validate()));
    if (status.findIndex((i) => !i) === -1) {
      if (type === 'save') {
        const payload = {
          data: { poHeaderDetailDTO, poLineDetailDTOs, fieldMap },
          customizeUnitCode,
        };
        const callback = async () => {
          const res = await saveDetail(payload);
          if (getResponse(res)) {
            notification.success();
            basicInfoDs.setState('updatedFlag', 0);
            organizationInfoDs.setState('updatedFlag', 0);
            detailInfoDs.setState('updatedFlag', 0);
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
        };
        const ras = await saveWarn(payload);
        if (!getResponse(ras)) return false;
        if (ras.value) {
          const modalRes = await Modal.confirm({
            children: ras.message,
            className: styles['detail-save-confirm-modal'],
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
          });
          if (modalRes !== 'ok') return;
        }
        await callback();
      } else {
        const onSubmit = async () => {
          if (hasGift) {
            const previewGiftRes = await previewGift({
              data: { poHeaderDetailDTO, poLineDetailDTOs, fieldMap },
              query: { customizeUnitCode },
              afterUpdateCallback: fetchDetailHeader,
            });
            if (previewGiftRes) {
              // 预览赠品之后更新头行数据作为后续接口调用的入参
              const newValues = getValues();
              // eslint-disable-next-line prefer-destructuring
              poHeaderDetailDTO = newValues.poHeaderDetailDTO;
              // eslint-disable-next-line prefer-destructuring
              poLineDetailDTOs = newValues.poLineDetailDTOs;
            } else {
              return;
            }
          }
          const termsRes = await openTermsModalForSubmit({
            body: {
              ...poHeaderDetailDTO,
              poLineExpVOList: poLineDetailDTOs,
              fieldMap,
              saveFlag: 1,
            },
          });
          if (!termsRes) return;
          const ras = await addNewSubmitDetail({ poHeaderDetailDTO, poLineDetailDTOs, fieldMap });
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
                data: { poHeaderDetailDTO, poLineDetailDTOs, fieldMap },
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
                data: { poHeaderDetailDTO, poLineDetailDTOs, fieldMap, fundPageParam },
                customizeUnitCode,
              });
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
            };
            if (getResponse(ras).value) {
              const confirmModalProps = remote.process('getConfirmModalProps', {
                data: ras,
                basicInfoDs,
              });
              const modalRes = await Modal.confirm({
                className: styles['batch-submit-modal'],
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: <div className={styles['submit-tip']}>{ras.message}</div>,
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                ...confirmModalProps,
              });
              if (modalRes !== 'ok') return;
            }
            const budgetVerificationRes = await handleBudgetVerification(budgetVerificationData);
            if (!budgetVerificationRes) return;
            await handleSubmit();
          }
        };

        if (remote?.event) {
          await remote?.event.fireEvent('onSubmit', { onSubmit, values, basicInfoDs });
        } else {
          onSubmit();
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

  const getValues = useCallback(() => {
    const orgCurrent = organizationInfoDs.current;
    const orgData = getRecordData(orgCurrent);
    const paymentData = getRecordData(paymentTermInfoDs.current);
    const poHeaderDetailDTO = {
      ...basicInfoDs.toJSONData()[0],
      ...organizationInfoDs.toJSONData()[0],
      ...orgData,
      ...paymentData,
      cacheKey,
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
        unitCode: 'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.BATCHEDIT',
      };
    }
    return values;
  }, [basicInfoDs, organizationInfoDs, detailInfoDs, paymentTermInfoDs]);

  // 智能预审
  const handleAiPreReview = async () => {
    if (
      basicInfoDs.getState('updatedFlag') ||
      organizationInfoDs.getState('updatedFlag') ||
      detailInfoDs.getState('updatedFlag') ||
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

  const renderContent = () => (
    <Fragment>
      {customizeCollapse(
        {
          code: 'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.COLLAPSE',
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
              remote={remote}
              oldTermHideFlag={oldTermHideFlag}
            />
          </Panel>
          <Panel
            key="organizationInfo"
            id="order-workSpace-detail-content-organizationInfo"
            header={intl.get('sodr.workspace.view.panel.organization').d('交易方及采买组织信息')}
          >
            <OrganizationInfo
              supplierLovFlag={supplierLovFlag}
              ds={organizationInfoDs}
              customizeForm={customizeForm}
              remote={remote}
            />
          </Panel>
          <Panel
            key="detailInfo"
            id="order-workSpace-detail-content-detailInfo"
            header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
          >
            <DetailInfo
              customizeForm={customizeForm}
              ds={detailInfoDs}
              remote={remote}
              basicInfoDs={basicInfoDs}
              customizeTable={customizeTable}
              fetchDetailHeader={fetchDetailHeader}
              batchMaintenanceDs={batchMaintenanceDs}
              loading={loadings.handleIncludedPriceFcous || detailInfoDs.status === 'loading'}
              poHeaderId={id}
              customizeBtnGroup={customizeBtnGroup}
              displayDocAndDocFlow={displayDocAndDocFlow}
              getValues={getValues}
            />
          </Panel>
          <Panel
            hidden={!hasGift}
            key="giftInfo"
            id="order-workSpace-detail-content-giftInfo"
            header={intl.get('sodr.workspace.view.panel.giftInfo').d('赠品明细信息')}
          >
            <GiftInfo
              ds={giftInfoDs}
              sourceMaintenance
              customizeTable={customizeTable}
              code="SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.GIFTINFO"
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
              customizeCode="SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.PAYMENTTERMINFO"
              getValues={getValues}
              fetchDetailHeader={fetchDetailHeader}
            />
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
            'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ATTACHMENTINFO',
            'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ATTACHMENTINFO_EXTERNAL',
          ]}
        />
      </Content>
    </Fragment>
  );

  const onTabChange = (newActiveKey) => {
    poDsListMap.set(id, {
      basicInfoDs,
      organizationInfoDs,
      detailInfoDs,
      giftInfoDs,
      paymentTermInfoDs,
    });
    history.push({
      pathname: `/sodr/order-workspace/detail/sourcing-results/${newActiveKey}`,
      state: props.location.state,
    });
  };

  const combinedBillChange = () => {
    const newpoDataList = poDataList.filter((i) => i.poHeaderId !== id);
    onTabChange(newpoDataList[0]?.poHeaderId);
    setPoDataList(newpoDataList);
  };
  const headerPreBtns = [
    statusCode &&
      statusCode !== 'REJECTED' && {
        name: 'delete',
        btnComp: Button,
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: handleDeleteConfirm,
          loading: headerBtnLoading,
          permissionList: [
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.sourceresult.delete',
              type: 'c7n-pro',
              meaning: '订单工作台-寻源结果明细-删除',
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
        onClick: async () => {
          basicInfoDs.status = 'submitting';
          await handleSaveOrSubmit('save');
          basicInfoDs.status = 'ready';
        },
        loading: headerBtnLoading,
        permissionList: [
          {
            code: 'srm.po-admin.po.order-workspace.ps.button.sourceresult.save',
            type: 'c7n-pro',
            meaning: '订单工作台-寻源结果明细-保存',
          },
        ],
      },
    },
    {
      name: 'submit',
      btnComp: Button,
      child: intl.get(`hzero.common.button.submit`).d('提交'),
      btnProps: {
        wait: THROTTLE_TIME,
        icon: 'done',
        color: 'primary',
        type: 'c7n-pro',
        onClick: async () => {
          basicInfoDs.status = 'submitting';
          await handleSaveOrSubmit('submit');
          basicInfoDs.status = 'ready';
        },
        loading: headerBtnLoading,
        permissionList: [
          {
            code: 'srm.po-admin.po.order-workspace.ps.button.sourceresult.submit',
            type: 'c7n-pro',
            meaning: '订单工作台-寻源结果明细-提交',
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

  const headerBtns = remote
    ? remote.process(
        'SODR.WORKSPACE_MAINTENANCE_SOURCINGRESULTS_PROCESS_HEADER_BUTTON',
        headerPreBtns,
        { props, loading, loadings, setLoadings, basicInfoDs, detailInfoDs }
      )
    : headerPreBtns;
  return (
    <Fragment>
      <OrderAffix />
      <Header
        backPath={backPath}
        title={intl.get('sodr.workspace.view.title.editOrderMaintenance').d('编辑订单')}
      >
        {customizeBtnGroup(
          {
            code: 'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.BUTTONS',
            pro: true,
          },
          <DynamicButtons buttons={headerBtns} />
        )}
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
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.BASICINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.BOM',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.BATCHEDIT',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.BUTTONS',
      'SODR.WORKSPACE_SOURCINGRESULTS.LIST',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.LINE_BUTTONS',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.GIFTINFO',
      'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  remotes(...remoteConfig),
  observer
)(SourcingResults);
