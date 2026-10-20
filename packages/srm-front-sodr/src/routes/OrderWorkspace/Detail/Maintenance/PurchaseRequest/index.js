/*
 * PurchaseRequest - 订单明细页-采购申请
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Spin, Tabs, Collapse } from 'choerodon-ui';
import { compose, isEmpty, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import { resetSearchBarCache } from '_components/SearchBarTable/util/cache';

import remotes from 'utils/remote';
import AttachmentInfo from '@/routes/components/AttachmentInfo';
import { getPermissions } from '@/routes/components/Permission';
import {
  handleBudgetVerification,
  validateDoubleUom,
  queryCalcRuleConfig,
  validateLineCalculate,
  queryCommonDoubleUomConfig,
  getRecordData,
  getStageIdList,
  showLineDsErrors,
  previewGift,
  getDisplayDocAndDocFlow,
  associatedPcAndAmountCheck,
  openTermsModalForSubmit,
  handleOpenFundTermIdDetail,
} from '@/routes/components/utils';
import OrderAffix from '@/routes/components/OrderAffix';
import { confirmModal } from '@/routes/components/ConfirmModal';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import {
  // fetchSettings,
  fetchNewPriceLibEnable,
  fetchNewPriceLibData,
  newSave,
  saveWarn,
  deleteSheetDelivery,
  submitValidate,
  submitDetail,
  addNewSubmitDetail,
  fetchPriceUpdateList,
  fetchItemNewPriceLibEnable,
  fetchConfigSheet,
  getConfigField,
  fetchVerifyContract,
} from '@/services/orderWorkspaceService';
import { aiPreReview, aiPreReviewStatus } from '@/services/commonService';
import DetailInfo from './DetailInfo';
import OrganizationInfo from './OrganizationInfo';
import BasicInfo from './BasicInfo';
import {
  basicInfo,
  organizationInfo,
  detailInfo,
  batchMaintenance,
} from './store/purchaseRequestDs';
import remoteConfig from './remote';
import AlertTooltip from '../../../AlertTooltip';
import styles from '../../index.less';

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

const IntervalTime = 5_000;

const PurchaseRequest = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceType, sourceId, initPoDataList = [] } = {} },
    custConfig,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const { event } = remote;
  // 仅埋点二开部分使用 方便与标准交互
  const remoteRef = useRef({});
  const intervalTime = useRef(0); // 记录轮询次数
  const aiQueryTimer = useRef(null); // 定时器
  const [loadings, setLoadings] = useState({});
  const [priceUpdateList, setPriceUpdateList] = useState([]);
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
        ...remote?.process('getBasicInfoDs', basicInfo({ remote, remoteRef })),
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
              'SODR.WORKSPACE_MAINTENANCE_PURCHASEREQUEST_PROCESS_DETAIL_DS',
              detailInfo({ remote })
            )
          : detailInfo({ remote })),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${id}/detail`,
              method: 'GET',
            };
          },
          destroy: ({ data }) => {
            const newData = data.map((i) => ({
              ...i,
              versionNum: i.locationVersionNumber,
              canCreateAsnFlag: 0,
              tenantId: organizationId,
            }));
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/delete`,
              method: 'DELETE',
              data: newData,
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
          params: { customizeUnitCode: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.GIFTINFO' },
        })
      ),
    [id]
  );
  const paymentTermInfoDs = useMemo(
    () => poDsListMap.get(id)?.paymentTermInfoDs || new DataSet(paymentTermInfo()),
    [id]
  );

  const basicCurrent = basicInfoDs.current;
  const {
    giftFlag,
    poTypeId,
    displayPoNum,
    statusCode,
    unSaveEnable,
    fundTermEditFlag,
    oldTermHideFlag,
  } = basicCurrent.get([
    'giftFlag',
    'poTypeId',
    'displayPoNum',
    'statusCode',
    'unSaveEnable',
    'fundTermEditFlag',
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

  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs, batchMaintenanceDs].forEach((i) => {
      i.setState(state);
    });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };
  const createPrefix = 'srm.po-admin.po.order-workspace.ps.button.purchaserequest';
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

  // 获取业务规则定义个性化字段是否可修改价格库价格
  const getConfigFields = async () => {
    loading({ getConfigFields: true });
    const res = getResponse(await getConfigField());
    loading({ getConfigFields: false });
    if (res) {
      useSetstate({ newPriceLibFields: res });
    }
  };

  const getVerifyContract = async () => {
    const res = getResponse(await fetchVerifyContract());
    if (res) {
      const { controlPc } = res;
      useSetstate({ verifyContract: controlPc });
    }
  };

  // 获取业务规则定义订单下单控制
  const fetchStageIdList = async () => {
    loading({ fetchStageIdList: true });
    const res = await getStageIdList({
      poTypeId: poTypeId?.orderTypeId,
      companyId: organizationInfoDs.current.get('companyId')?.companyId,
    });
    if (res) {
      useSetstate({ stageIdList: res });
    }
    loading({ fetchStageIdList: false });
  };

  // 是否开启新价格库
  const fetchNewPriceLib = () => {
    loading({ fetchNewPriceLib: true });
    fetchNewPriceLibEnable({
      poHeaderId: id,
    }).then((res) => {
      loading({ fetchNewPriceLib: false });
      if (getResponse(res)) {
        useSetstate({ newPriceLibFlag: res });
      }
    });
  };

  // 是否通过物料引用新价格库
  const fetchItemNewPriceLib = () => {
    loading({ fetchItemNewPriceLib: true });
    fetchItemNewPriceLibEnable({
      poHeaderId: id,
    }).then((res) => {
      loading({ fetchItemNewPriceLib: false });
      if (getResponse(res)) {
        useSetstate({ itemChangePriceFlag: res });
      }
    });
  };

  const getPriceUpdateList = () => {
    fetchPriceUpdateList({
      poHeaderId: id,
      customizeUnitCode: String([
        'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BASICINFO',
        'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ORGANIZATIONINFO',
        'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO',
      ]),
    }).then((res) => {
      if (getResponse(res)) {
        setPriceUpdateList(res);
      }
    });
  };

  const fetchDetailHeader = async (cache, { initFlag } = { initFlag: false }) => {
    loading({ all: true });
    fetchDoubleUom();
    fetchAmountCalc();
    fetchNewPriceLib();
    getPriceUpdateList();
    fetchItemNewPriceLib();
    fetchSupplierLovConfig();
    const [res, lineRes] = await Promise.all([
      basicInfoDs.query(undefined, undefined, cache),
      initFlag ? Promise.resolve() : detailInfoDs.query(undefined, undefined, cache),
    ]);
    loading({ all: false });
    if (res) {
      if (res.giftFlag) {
        giftInfoDs.query();
      }
      setAiReviewParams(res?.poAiApproveResult?.searchDetailParams);
      setReviewStatus(res?.poAiApproveResult?.aiApproveStatus);
      fetchStageIdList();
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
      paymentTermInfoDs.loadData([res], undefined, cache);
      return [res, lineRes];
    }
  };

  useEffect(() => {
    fetchPermissions();
    resetSearchBarCache('SODR.WORKSPACE_PURCHASEREQUEST.SEARCH', 'purchaseRequest_detail');
    getConfigFields();
    getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
    getVerifyContract();

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

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = async () => {
    loading({ fetchDoubleUom: true });
    const res = await queryCommonDoubleUomConfig();
    useSetstate({ doubleUnitEnabled: Number(res) });
    loading({ fetchDoubleUom: false });
  };

  // 查询业务规则定金额计算配置
  const fetchAmountCalc = async () => {
    loading({ fetchAmountCalc: true });
    const res = await queryCalcRuleConfig();
    useSetstate({ amountCalcRule: res });
    loading({ fetchAmountCalc: false });
  };

  const getValues = useCallback(() => {
    const poHeaderDetailDTO = basicInfoDs.toJSONData()[0];
    const orgCurrent = organizationInfoDs.current;
    const orgData = getRecordData(orgCurrent);
    const paymentData = getRecordData(paymentTermInfoDs.current);
    const fieldMap = detailInfoDs.getState('fieldMap');
    const poLineDetailDTOs = detailInfoDs.toJSONData();
    const values = {
      poHeaderDetailDTO: { ...poHeaderDetailDTO, ...orgData, ...paymentData, poWorkbenchFlag: 1 },
      poLineDetailDTOs,
    };
    if (fieldMap) {
      values.fieldMap = {
        ...fieldMap,
        unitCode: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BATCHEDIT',
      };
    }
    return values;
  }, [basicInfoDs, organizationInfoDs, detailInfoDs, paymentTermInfoDs]);

  useMemo(() => {
    useSetstate({
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      batchMaintenanceDs,
      getValues,
    });
  }, [basicInfoDs, detailInfoDs, organizationInfoDs, batchMaintenanceDs, getValues]);

  useEffect(() => {
    if (!poDsListMap.get(id)) {
      poDsListMap.set(id, {
        basicInfoDs,
        organizationInfoDs,
        detailInfoDs,
        giftInfoDs,
        paymentTermInfoDs,
      });
      fetchDetailHeader(undefined, { initFlag: true });
    }
    useSetstate({
      loading,
      doubleUnitEnabled: 0,
      handleIncludedPriceFcous,
    });
  }, [id]);

  const handleSaveOrSubmit = async (type) => {
    const beforHandleSaveOrSubmitRes = await event.fireEvent('beforHandleSaveOrSubmit', {
      basicInfoDs,
      organizationInfoDs,
      detailInfoDs,
      paymentTermInfoDs,
      remoteRef,
      type,
    });
    if (!beforHandleSaveOrSubmitRes) return;
    const values = getValues();
    const { fieldMap } = values;
    let { poHeaderDetailDTO, poLineDetailDTOs } = getValues();
    const customizeUnitCode = String([
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BASICINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.PAYMENTTERMINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.COSTINFORMATION',
    ]);
    if (!validateLineCalculate({ data: detailInfoDs, type: 'c7n' })) return;
    const validateList = [organizationInfoDs, basicInfoDs, detailInfoDs, paymentTermInfoDs];
    const status = await Promise.all(validateList.map((i) => i.validate()));
    if (status.findIndex((i) => !i) === -1) {
      if (type === 'save') {
        const payload = {
          data: { poHeaderDetailDTO, poLineDetailDTOs, fieldMap },
          customizeUnitCode,
        };
        const callback = async () => {
          loading({ handleSave: true });
          const res = await newSave(payload);
          loading({ handleSave: false });
          if (getResponse(res)) {
            notification.success();
            basicInfoDs.setState('updatedFlag', 0);
            organizationInfoDs.setState('updatedFlag', 0);
            detailInfoDs.setState('updatedFlag', 0);
            paymentTermInfoDs.setState('updatedFlag', 0);
            fetchDetailHeader();
            if (remote?.event) {
              remote.event.fireEvent('afterSaveEvent', {
                remoteRef,
              });
            }
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
        };
        const ras = await saveWarn(payload);
        if (!getResponse(ras)) return false;
        if (getResponse(ras)?.value) {
          Modal.confirm({
            children: ras?.message,
            className: styles['detail-save-confirm-modal'],
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            onOk: throttle(callback, THROTTLE_TIME, { trailing: false }),
          });
        } else {
          await callback();
        }
      } else {
        const associatedPcAndAmountCheckRes = await associatedPcAndAmountCheck(1, [
          { ...poHeaderDetailDTO, poLineExpVOList: poLineDetailDTOs, fieldMap, saveFlag: 1 },
        ]);
        if (!associatedPcAndAmountCheckRes) return;
        const termsRes = await openTermsModalForSubmit({
          body: {
            ...poHeaderDetailDTO,
            poLineExpVOList: poLineDetailDTOs,
            fieldMap,
            saveFlag: 1,
          },
        });
        if (!termsRes) return;
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
        const budgetVerificationData = [
          {
            ...poHeaderDetailDTO,
            fieldMap,
            saveFlag: 1,
            viewCode: 'PENDING_DETAIL_VIEW',
            poLineExpVOList: poLineDetailDTOs,
          },
        ];
        const startSubmitRes = await event.fireEvent('startSubmit', {
          basicInfoDs,
          detailInfoDs,
          budgetVerificationData,
        });
        if (!startSubmitRes) return;
        const res = await submitValidate({ poHeaderDetailDTO, poLineDetailDTOs, fieldMap });
        if (getResponse(res)) {
          const handleSubmit = async () => {
            const beforSubmitRes = await event.fireEvent('beforSubmit', {
              basicInfoDs,
              detailInfoDs,
              budgetVerificationData,
              data: { poHeaderDetailDTO, poLineDetailDTOs, fieldMap },
              customizeUnitCode,
              fetchDetailHeader,
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
          const addNewSubmit = async () => {
            const ras = await addNewSubmitDetail({ poHeaderDetailDTO, poLineDetailDTOs, fieldMap });
            if (getResponse(ras)) {
              if (getResponse(ras).value) {
                const confirmModalProps = remote.process('getConfirmModalProps', {
                  data: ras,
                  basicInfoDs,
                });
                const modalRes = await Modal.confirm({
                  className: styles['batch-submit-modal'],
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: (
                    <div
                      className={styles['submit-tip']}
                      // eslint-disable-next-line
                      dangerouslySetInnerHTML={{ __html: getResponse(ras).message }}
                    />
                  ),
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
          if (getResponse(res).result) {
            const modalRes = await Modal.confirm({
              className: styles['batch-submit-modal'],
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: <div className={styles['submit-tip']}>{getResponse(res).result}</div>,
              okText: intl.get('hzero.common.button.sure').d('确定'),
              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            });
            if (modalRes !== 'ok') return;
          }
          await addNewSubmit();
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

  /**
   * 原币含税单价获取焦点事件
   * @param {object[]} record - 当前行的数据
   * @param {String} action - 触发动作（点击单价: 'price'|选择物料: 'item'）
   */
  const handleIncludedPriceFcous = useCallback(
    (record, action) => {
      const newPriceLibFlag = basicInfoDs.getState('newPriceLibFlag');
      const { poHeaderDetailDTO = {} } = getValues();
      const { summaryFlag } = poHeaderDetailDTO;
      const values = record.toJSONData() || {};
      const { prLineId, ...others } = values;
      const poLineDetailDTOs = [
        {
          ...others,
          poLineId: record.status === 'add' ? -1 : record.get('poLineId'),
        },
      ];
      const canFetchNewPriceLib = remote.process(
        'canFetchNewPriceLib',
        newPriceLibFlag === 1 &&
          values.itemCode &&
          values.freeFlag !== 1 &&
          // 汇总取价不允许点击单价获取价格库价格
          (action !== 'price' || summaryFlag !== 1 || !values.priceLibraryId),
        { newPriceLibFlag, record, action }
      );
      if (canFetchNewPriceLib) {
        loading({ handleIncludedPriceFcous: true });
        fetchNewPriceLibData({
          poHeaderDetailDTO,
          poLineDetailDTOs,
        }).then((res) => {
          loading({ handleIncludedPriceFcous: false });
          if (
            res &&
            !isEmpty(res) &&
            getResponse(res) &&
            (values.priceLibraryId || res.priceLibId)
          ) {
            const {
              uomId,
              uomCode,
              uomName,
              uomCodeAndName,
              currencyCode,
              taxId,
              taxRate,
              netPrice,
              priceLibId,
              taxIncludedPrice,
              unitPriceBatch,
              holdPcHeaderId,
              holdPcLineId,
              contractNum,
              benchmarkPriceType,
              ladderPriceLibId,
              ladderQuotationFlag,
              sourceFromId, // 价格来源单据头id
              sourceFrom, // 价格来源
              sourceFromLnId, // 报价行id
              sourceFromLnNum, // 价格来源单据行号
              sourceFromNum, // 价格来源单据号 | 寻源单号
              defaultPrecision,
              callRecordId, // 取价记录id
            } = res;
            const doubleUnitEnabled = basicInfoDs.getState('doubleUnitEnabled');
            // 启用双单位配置了订单模块开启：如果返回的【单位】和订单行【基本单位】不一致,界面报错
            const uomObj = uomId && { uomId, uomName, uomCode, uomCodeAndName };
            if ([0, 1, 2].includes(doubleUnitEnabled)) {
              const sodrEnabled = doubleUnitEnabled !== 0;
              const lineUomId = record.get('uomId')?.uomId;
              if (
                doubleUnitEnabled &&
                !validateDoubleUom({
                  remote,
                  price: res,
                  record,
                  lineUomId,
                  sodrEnabled,
                  type: 'c7n',
                })
              ) {
                return false;
              }
              if (!sodrEnabled) {
                record.set({ secondaryUomId: uomObj });
              }
            }
            const setFields = {
              uomId: uomObj,
              currencyCode: currencyCode ? { currencyCode, defaultPrecision } : undefined,
              taxId: {
                taxId,
                taxRate,
              },
              unitPrice: netPrice,
              enteredTaxIncludedPrice: taxIncludedPrice,
              unitPriceBatch,
              priceLibraryId: priceLibId,
              priceTaxId: taxId,
              contractNum,
              originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
              holdPcHeaderId,
              holdPcLineId,
              benchmarkPriceType,
              ladderPriceLibId,
              ladderQuotationFlag,
              priceId: sourceFromId,
              priceSource: sourceFrom,
              priceSourceNum: sourceFromNum,
              priceSourceLineNum: sourceFromLnNum,
              priceLineId: sourceFromLnId,
              callRecordId,
            };
            record.set(
              remote
                ? remote.process('setPriceFcousFields', setFields, {
                    newPriceLibFlag,
                    record,
                    data: res,
                  })
                : setFields
            );
          }
        });
      }
    },
    [id, remote, basicInfoDs]
  );

  /**
   * 设置价格
   */
  const setPrice = useCallback(
    (ds) => {
      const { selected } = ds;
      if (isEmpty(selected)) return;
      const val = selected[0].toJSONData();
      const record = detailInfoDs.current;
      const doubleUnitEnabled = detailInfoDs.getState('doubleUnitEnabled');
      if (val && val.priceLibId) {
        const {
          uomId,
          uomCode,
          uomName,
          uomCodeAndName,
          currencyCode,
          taxId,
          taxRate,
          netPrice,
          priceLibId,
          taxIncludedPrice,
          unitPriceBatch,
          holdPcHeaderId,
          holdPcLineId,
          contractNum,
          benchmarkPriceType,
          ladderPriceLibId,
          ladderQuotationFlag,
          ladderPriceLibList = [],
          sourceFromId, // 价格来源单据头id
          sourceFrom, // 价格来源
          sourceFromLnId, // 报价行id
          sourceFromLnNum, // 价格来源单据行号
          sourceFromNum, // 价格来源单据号 | 寻源单号
          defaultPrecision,
          // callRecordId, // 取价记录id
        } = val;
        const quantity = record.get('quantity');
        const ladderPriceRecord = (ladderPriceLibList || []).find(
          (item) =>
            math.gte(new BigNumber(quantity), new BigNumber(item.ladderFrom)) &&
            math.lt(new BigNumber(quantity), new BigNumber(item.ladderTo || Infinity))
        );
        const unitPrice = ladderPriceRecord ? ladderPriceRecord.ladderNetPrice : netPrice;
        const enteredTaxIncludedPrice = ladderPriceRecord
          ? ladderPriceRecord.ladderPrice
          : taxIncludedPrice;
        const uomObj = uomId && { uomId, uomName, uomCode, uomCodeAndName };
        const lineUomId = record.get('uomId')?.uomId;
        if (
          doubleUnitEnabled &&
          !validateDoubleUom({
            remote,
            price: val,
            record,
            lineUomId,
            sodrEnabled: doubleUnitEnabled,
            type: 'c7n',
          })
        ) {
          return false;
        }
        const setFields = {
          uomId: uomObj,
          currencyCode: currencyCode ? { currencyCode, defaultPrecision } : undefined,
          taxId: {
            taxId,
            taxRate,
          },
          unitPrice,
          enteredTaxIncludedPrice,
          unitPriceBatch,
          priceLibraryId: priceLibId,
          priceTaxId: taxId,
          contractNum,
          originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? unitPrice : enteredTaxIncludedPrice,
          holdPcHeaderId,
          holdPcLineId,
          benchmarkPriceType,
          ladderPriceLibId,
          ladderQuotationFlag,
          referencePriceFlag: 1,
          priceId: sourceFromId,
          priceSource: sourceFrom,
          priceSourceNum: sourceFromNum,
          priceSourceLineNum: sourceFromLnNum,
          priceLineId: sourceFromLnId,
          // callRecordId, // 取价记录id
        };
        if (ds.getState('verifyContract')) {
          // 协议价带出关联采购协议优先级高于手工选则
          setFields.pcSubjectId = {
            pcSubjectId: holdPcLineId,
            pcHeaderId: holdPcHeaderId,
            pcNumAndDisplayLineNum: contractNum,
          };
        }
        record.set(
          remote
            ? remote.process('setPriceFields', setFields, { priceLine: val, record })
            : setFields
        );
      }
    },
    [remote]
  );

  const renderContent = () => (
    <Fragment>
      {customizeCollapse(
        {
          code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.COLLAPSE',
        },
        remote.process('processCollapse', {
          Component: Collapse,
          props: {
            trigger: 'text-icon',
            ghost: true,
            expandIconPosition: 'text-right',
            defaultActiveKey,
          },
          children: [
            <Panel
              key="basicInfo"
              id="order-workSpace-detail-content-basicInfo"
              header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
            >
              <BasicInfo
                ds={basicInfoDs}
                organizationInfoDs={organizationInfoDs}
                custConfig={custConfig}
                customizeForm={customizeForm}
                remote={remote}
                oldTermHideFlag={oldTermHideFlag}
              />
            </Panel>,
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
            </Panel>,
            <Panel
              key="detailInfo"
              id="order-workSpace-detail-content-detailInfo"
              header={intl.get('sodr.workspace.view.panel.detailInfo').d('订单明细信息')}
            >
              <DetailInfo
                history={history}
                customizeForm={customizeForm}
                ds={detailInfoDs}
                remote={remote}
                basicInfoDs={basicInfoDs}
                poHeaderId={id}
                loadings={loadings}
                getValues={getValues}
                setPrice={setPrice}
                customizeTable={customizeTable}
                priceUpdateList={priceUpdateList}
                fetchDetailHeader={fetchDetailHeader}
                batchMaintenanceDs={batchMaintenanceDs}
                handleIncludedPriceFcous={handleIncludedPriceFcous}
                loading={loading}
                customizeBtnGroup={customizeBtnGroup}
                organizationInfoDs={organizationInfoDs}
                displayDocAndDocFlow={displayDocAndDocFlow}
              />
            </Panel>,
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
                code="SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.GIFTINFO"
              />
            </Panel>,
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
                customizeCode="SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.PAYMENTTERMINFO"
                getValues={getValues}
                fetchDetailHeader={fetchDetailHeader}
                fundTermEditFlag={fundTermEditFlag}
              />
            </Panel>,
          ],
          otherProps: {
            id,
            basicInfoDs,
            organizationInfoDs,
            detailInfoDs,
            paymentTermInfoDs,
            remoteRef,
          },
        })
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
            'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ATTACHMENTINFO',
            'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ATTACHMENTINFO_EXTERNAL',
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

  const combinedBillChange = () => {
    const newPoDataList = poDataList.filter((i) => i.poHeaderId !== id);
    setPoDataList(newPoDataList);
    onTabChange(newPoDataList[0].poHeaderId, newPoDataList);
  };
  const headerBtnLoading =
    loadings.submitDetail ||
    loadings.handleSave ||
    loadings.handleDelete ||
    loadings.handleSaveWarn ||
    basicInfoDs.status !== 'ready' ||
    detailInfoDs.status !== 'ready';

  const submitVisible = remote
    ? remote.process(
        'SODR.WORKSPACE_MAINTENANCE_PURCHASEREQUEST_PROCESS_SUBMIT_VISIBLE',
        !unSaveEnable,
        { basicInfoDs, props }
      )
    : !unSaveEnable;
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
              code: 'srm.po-admin.po.order-workspace.ps.button.purchaserequest.delete',
              type: 'c7n-pro',
              meaning: '订单工作台-采购申请明细-删除',
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
            code: 'srm.po-admin.po.order-workspace.ps.button.purchaserequest.save',
            type: 'c7n-pro',
            meaning: '订单工作台-采购申请明细-保存',
          },
        ],
      },
    },
    submitVisible && {
      name: 'submit',
      btnComp: Button,
      child: intl.get(`hzero.common.button.submit`).d('提交'),
      btnProps: {
        wait: THROTTLE_TIME,
        icon: 'done',
        type: 'c7n-pro',
        color: 'primary',
        onClick: async () => {
          basicInfoDs.status = 'submitting';
          await handleSaveOrSubmit('submit');
          basicInfoDs.status = 'ready';
        },
        loading: headerBtnLoading,
        permissionList: [
          {
            code: 'srm.po-admin.po.order-workspace.ps.button.purchaserequest.submit',
            type: 'c7n-pro',
            meaning: '订单工作台-采购申请明细-提交',
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
        'SODR.WORKSPACE_MAINTENANCE_PURCHASEREQUEST_PROCESS_HEADER_BUTTON',
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
            code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BUTTONS',
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
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BASICINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BOM',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BATCHEDIT',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.REFERENCE_PRICE',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BUTTONS',
      'SODR.WORKSPACE_PURCHASEREQUEST.LIST',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.LINE_BUTTONS',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.COLLAPSE',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.GIFTINFO',
      'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common', 'hpfm.customize'],
  }),
  remotes(...remoteConfig),
  observer
)(PurchaseRequest);
