/*
 * CreatedManually - 订单明细页-手工创建
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Spin, Collapse } from 'choerodon-ui';
import { compose, isEmpty, throttle, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import remotes from 'utils/remote';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Button } from 'components/Permission';
import { math } from 'choerodon-ui/dataset';

import AttachmentInfo from '@/routes/components/AttachmentInfo';
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
import { getPermissions } from '@/routes/components/Permission';
import { confirmModal } from '@/routes/components/ConfirmModal';
import { giftInfoDsConfig, GiftInfo } from '@/routes/components/GiftInfo';
import PaymentTermInfo, { paymentTermInfo } from '@/routes/components/PaymentTermInfo';
import {
  fetchPageOrder,
  // fetchSettings,
  fetchNewPriceLibEnable,
  fetchNewPriceLibData,
  saveWarn,
  saveDetail,
  // newSaveDetail,
  deleteOrder,
  submitDetail,
  addNewSubmitDetail,
  fetchPriceUpdateList,
  fetchItemNewPriceLibEnable,
  fetchDefaultLovValue,
  fetchConfigSheet,
  getConfigField,
  fetchAutoGetCompany,
  fetchVerifyContract,
} from '@/services/orderWorkspaceService';
import { aiPreReview, aiPreReviewStatus } from '@/services/commonService';
import AlertTooltip from '../../../AlertTooltip';
import DetailInfo from './DetailInfo';
import OrganizationInfo from './OrganizationInfo';
import BasicInfo from './BasicInfo';
import {
  basicInfo,
  organizationInfo,
  detailInfo,
  batchMaintenance,
} from './store/createdManuallyDs';
import remoteConfig from './remote';
import styles from '../../index.less';

const organizationId = getCurrentOrganizationId();
const { Panel } = Collapse;
const defaultActiveKey = [
  'basicInfo',
  'organizationInfo',
  'detailInfo',
  'giftInfo',
  'paymentTermInfo',
];

const IntervalTime = 5_000;

const CreatedManually = (props) => {
  const {
    history,
    match: {
      params: { id },
    },
    location: { state: { source, sourceId, sourceType } = {} },
    custConfig,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  } = props;
  const { event } = remote;
  const isCreate = useMemo(() => id === 'new', [id]);
  const backPath = useMemo(() => {
    if (sourceType === 'copy') {
      return `/sodr/order-workspace/detail/all-orders/${sourceId}`;
    } else if (source === 'all') {
      return `/sodr/order-workspace/detail/all-orders/${id}`;
    } else {
      return '/sodr/order-workspace/list';
    }
  }, [source, sourceType, id, sourceId]);
  const createPrefix = 'srm.po-admin.po.order-workspace.ps.button.createdmanually';
  const intervalTime = useRef(0); // 记录轮询次数
  const aiQueryTimer = useRef(null); // 定时器
  const [createPermsMap, setCreatePermsMap] = useState(props.createPermsMap || new Map());
  const [supplierLovFlag, setSupplierLovFlag] = React.useState(false); // 是否使用新的供应商值集，默认老的
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const [reviewStatus, setReviewStatus] = useState(''); // 预审结果状态
  const [aiReviewParams, setAiReviewParams] = useState(null); // 预审结果参数
  const [isClickAiBtn, setIsClickAiBtn] = useState(false); // 判断是否需要点击智能预审按钮

  useEffect(() => {
    getConfigFields();
    fetchPermissions();
    fetchSupplierLovConfig();
    getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
    getVerifyContract();
    remote.process('getDetailDs', {
      isCreate,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      batchMaintenanceDs,
    });

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
  const attachmentConfig = useMemo(
    () => ({
      readOnly: [0, 0, 1],
    }),
    []
  );

  const [loadings, setLoadings] = useState({});
  const [priceUpdateList, setPriceUpdateList] = useState([]);
  const basicInfoDs = useMemo(
    () =>
      new DataSet({
        ...remote?.process('getBasicInfoDs', basicInfo({ remote })),
        transport: {
          read: ({ data }) => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${data.poHeaderId || id}/detail`,
              method: 'GET',
            };
          },
        },
      }),
    []
  );
  const organizationInfoDs = useMemo(() => new DataSet(organizationInfo({ remote })), []);
  const detailInfoDs = useMemo(
    () =>
      new DataSet({
        ...(remote
          ? remote.process(
              'SODR.WORKSPACE_MAINTENANCE_CREATEMANUALLY_PROCESS_DETAIL_DS',
              detailInfo({ remote })
            )
          : detailInfo({ remote })),
        transport: {
          read: ({ data }) => {
            // if ((id && id !== 'new') || data.poHeaderId) {
            //   return {
            //     url: `${SRM_SPUC}/v1/${organizationId}/po-line/${data.poHeaderId || id}/detail`,
            //     method: 'GET',
            //   };
            // }
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${data.poHeaderId || id}/detail`,
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
    []
  );
  const batchMaintenanceDs = useMemo(() => new DataSet(batchMaintenance()), []);
  const giftInfoDs = useMemo(
    () =>
      new DataSet(
        giftInfoDsConfig({
          poHeaderId: id,
          params: { customizeUnitCode: 'SODR.WORKSPACE_CREATEDMANUALLY.GIFTINFO' },
        })
      ),
    [id]
  );
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [id]);
  const basicCurrent = basicInfoDs.current;
  const {
    giftFlag,
    poTypeId,
    displayPoNum,
    statusCode,
    unSaveEnable,
    ouId,
    companyId,
    oldTermHideFlag,
  } = basicCurrent.get([
    'giftFlag',
    'poTypeId',
    'displayPoNum',
    'statusCode',
    'unSaveEnable',
    'ouId',
    'companyId',
    'oldTermHideFlag',
  ]);
  // 是否展示赠品行
  const hasGift = useMemo(() => {
    return id && id !== 'new' && Number(giftFlag);
  }, [id, giftFlag]);
  const useSetstate = (state = {}) => {
    [basicInfoDs, organizationInfoDs, detailInfoDs, batchMaintenanceDs].forEach((i) => {
      i.setState(state);
    });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  const headerLoading = useMemo(
    () =>
      (!isCreate && !basicInfoDs?.current.get('poHeaderId')) ||
      loadings.handleSave ||
      loadings.submitDetail ||
      loadings.handleDelete ||
      loadings.handleSaveWarn ||
      basicInfoDs.status !== 'ready' ||
      detailInfoDs.status !== 'ready',
    [loadings, basicInfoDs.status, detailInfoDs.status, basicInfoDs, isCreate]
  );
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
        basicInfoDs.setState({ newPriceLibFlag: res });
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
        'SODR.WORKSPACE_CREATEDMANUALLY.BASICINFO',
        'SODR.WORKSPACE_CREATEDMANUALLY.ORGANIZATIONINFO',
        'SODR.WORKSPACE_CREATEDMANUALLY.DETAILINFO',
      ]),
    }).then((res) => {
      const response = getResponse(res);
      if (response) {
        setPriceUpdateList(response);
      }
    });
  };
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

  const fetchDetailHeader = useCallback(
    async (cache = false, { initFlag } = { initFlag: false }) => {
      loading({ all: true });
      fetchDoubleUom();
      fetchAmountCalc();
      fetchNewPriceLib();
      fetchItemNewPriceLib();
      getPriceUpdateList();
      const res = await basicInfoDs.query(undefined, undefined, cache);
      loading({ all: false });
      if (res) {
        if (res.giftFlag) {
          giftInfoDs.query();
        }
        setAiReviewParams(res?.poAiApproveResult?.searchDetailParams);
        setReviewStatus(res?.poAiApproveResult?.aiApproveStatus);
        fetchStageIdList();
        fetchDefaultLineOrg();
        organizationInfoDs.loadData(
          [
            {
              ...res,
              displaySupplierName: res.supplierName || res.supplierCompanyName,
              settleDisplaySupplierName: res.settleErpSupplierName || res.settleSupplierName,
            },
          ],
          undefined,
          cache
        );
        paymentTermInfoDs.loadData([res], undefined, cache);
        const lineRes = !initFlag && (await detailInfoDs.query(undefined, undefined, cache));
        return [res, lineRes];
      }
    },
    [id]
  );

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

  useEffect(() => {
    useSetstate({
      loading,
      basicInfoDs,
      detailInfoDs,
      organizationInfoDs,
      doubleUnitEnabled: 0,
      handleIncludedPriceFcous,
      getValues,
    });
  }, []);

  useEffect(() => {
    if ([undefined, 'undefined'].includes(id)) return;
    useSetstate({ isCreate });
    getDefaultprojectCategory();
    if (!isCreate) {
      basicInfoDs.setQueryParameter('poHeaderId', id);
      detailInfoDs.setQueryParameter('poHeaderId', id);
      fetchDetailHeader(undefined, { initFlag: true });
    } else {
      [basicInfoDs, organizationInfoDs, batchMaintenanceDs].forEach((i) => {
        i.loadData([{}]);
      });
      detailInfoDs.loadData([]);
      fetchDoubleUom();
      fetchAmountCalc();
      fetchPageOrder().then((res) => {
        if (getResponse(res)) {
          // 处理接口返回默认值及个性化默认值
          const transformDefaultValue = (ds) => {
            const record = ds.current;
            const defaultValues = {};
            ds.fields.forEach((i) => {
              const value = i.getValue(record);
              if (!isNil(value)) {
                defaultValues[i.name] = value.toJS?.() || value;
              }
            });
            ds.loadData([res]);
            ds.current.init(defaultValues);
          };
          transformDefaultValue(basicInfoDs);
          transformDefaultValue(organizationInfoDs);
          fetchStageIdList();
          // attachmentInfoDs.loadData([res]);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (isClickAiBtn) {
      rollingQueryAiPreReview();
    }
  }, [isClickAiBtn]);

  const rollingQueryAiPreReview = () => {
    clearAiQueryTimer();
    aiQueryTimer.current = setInterval(() => aiPreReviewStatusQuery(), IntervalTime);
  };

  // 获取默认库存组织信息
  const fetchDefaultLineOrg = async () => {
    const res = await fetchAutoGetCompany({
      ouId,
      companyId,
    });
    if (getResponse(res)) {
      const { organizationId: defaultOrgId, organizationName: defaultOrgName } = res;
      detailInfoDs.setState({
        defaultOrgId,
        defaultOrgName,
      });
    }
  };

  const getDefaultprojectCategory = () => {
    fetchDefaultLovValue({ lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY', value: 'L' }).then((res) => {
      if (res && getResponse(res)) {
        const { value, meaning } = res.content[0] || {};
        detailInfoDs.setState({
          defaultProjectCategory: value,
          defaultProjectCategoryMeaning: meaning,
        });
      }
    });
  };

  const getValues = useCallback(() => {
    const orgCurrent = organizationInfoDs.current;
    const orgData = getRecordData(orgCurrent);
    const paymentData = getRecordData(paymentTermInfoDs.current);
    const poHeaderDetailDTO = {
      poWorkbenchFlag: 1,
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
        unitCode: 'SODR.WORKSPACE_CREATEDMANUALLY.BATCHEDIT',
      };
    }
    return values;
  }, [basicInfoDs, organizationInfoDs, detailInfoDs, paymentTermInfoDs]);

  const handleSaveOrSubmit = async (type) => {
    try {
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

      basicInfoDs.status = 'loading';
      const validateList = [organizationInfoDs, basicInfoDs, detailInfoDs, paymentTermInfoDs];
      const customizeUnitCode = String([
        'SODR.WORKSPACE_CREATEDMANUALLY.BASICINFO',
        'SODR.WORKSPACE_CREATEDMANUALLY.ORGANIZATIONINFO',
        'SODR.WORKSPACE_CREATEDMANUALLY.DETAILINFO',
        'SODR.WORKSPACE_CREATEDMANUALLY.ATTACHMENTINFO',
        'SODR.WORKSPACE_CREATEDMANUALLY.ATTACHMENTINFO_EXTERNAL',
        'SODR.WORKSPACE_CREATEDMANUALLY.PAYMENTTERMINFO',
        'SODR.WORKSPACE_CREATEDMANUALLY.COSTINFORMATION',
      ]);
      const values = getValues();
      const { fieldMap } = values;
      let { poHeaderDetailDTO, poLineDetailDTOs } = values;
      if (!validateLineCalculate({ data: detailInfoDs, type: 'c7n' })) return;
      // const newPriceLibFlag = basicInfoDs.getState('newPriceLibFlag');
      const newPoLineDetailDTOs = poLineDetailDTOs.map((i) => {
        return {
          ...i,
          // benchmarkPriceType: newPriceLibFlag
          //   ? i.benchmarkPriceType
          //   : poHeaderDetailDTO.benchmarkPriceType,
          tenantId: organizationId,
          surfaceTreatFlag: i.surfaceTreatFlag ? 1 : 0,
          returnedFlag: i.returnedFlag ? 1 : 0,
        };
      });
      const status = await Promise.all(validateList.map((i) => i.validate()));
      if (status.findIndex((i) => !i) === -1) {
        if (type === 'save') {
          const data = {
            poHeaderDetailDTO: {
              ...poHeaderDetailDTO,
              sourceBillTypeCode: 'PURCHASE_ORDER',
              poSourcePlatform: 'SRM',
            },
            poLineDetailDTOs: newPoLineDetailDTOs,
          };
          if (fieldMap) data.fieldMap = fieldMap;
          const payload = { data, customizeUnitCode };
          const callback = async () => {
            const res = await saveDetail(payload);
            if (getResponse(res)) {
              basicInfoDs.setState('updatedFlag', 0);
              organizationInfoDs.setState('updatedFlag', 0);
              detailInfoDs.setState('updatedFlag', 0);
              paymentTermInfoDs.setState('updatedFlag', 0);
              notification.success();
              if (res.errorMsg) {
                Modal.info({
                  className: styles['detail-save-confirm-modal'],
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: res.errorMsg,
                });
              }
              if (res.maintainErrorMsg) {
                Modal.info({
                  className: styles['detail-save-confirm-modal'],
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: res.maintainErrorMsg,
                });
              }
              if (isCreate) {
                history.push({
                  pathname: `/sodr/order-workspace/detail/created-manually/${res.poHeaderId}`,
                });
              } else {
                await fetchDetailHeader();
              }
            }
          };
          if (isCreate) {
            await callback();
          } else {
            const ras = await saveWarn(payload);
            if (!getResponse(ras)) return false;
            if (ras?.value) {
              const modalRes = await Modal.confirm({
                children: ras?.message,
                className: styles['detail-save-confirm-modal'],
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
              });
              if (modalRes !== 'ok') return;
            }
            await callback();
          }
        } else {
          if (!poLineDetailDTOs.length) {
            notification.error({
              message: intl.get('hzero.common.status.mistake').d('错误'),
              description: intl
                .get(`sodr.workspace.view.message.noPoLine`)
                .d(`订单提交失败，失败原因是不存在订单行，请维护订单行。`),
            });
            return;
          }
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
          const data = {
            poHeaderDetailDTO,
            poLineDetailDTOs,
          };
          if (fieldMap) data.fieldMap = fieldMap;
          const startSubmitRes = await event.fireEvent('startSubmit', {
            data,
            basicInfoDs,
            detailInfoDs,
            budgetVerificationData,
          });
          if (!startSubmitRes) return;
          const ras = await addNewSubmitDetail({
            fieldMap,
            poHeaderDetailDTO,
            poLineDetailDTOs,
          });
          if (getResponse(ras)) {
            const handleSubmit = throttle(
              async () => {
                const beforSubmitRes = await event.fireEvent('beforSubmit', {
                  budgetVerificationData,
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
                  customizeUnitCode,
                  data: { ...data, fundPageParam },
                });
                if (getResponse(response)) {
                  notification.success();
                  history.push({
                    pathname: backPath,
                    state: { _back: -1 },
                  });
                }
              },
              THROTTLE_TIME,
              { trailing: false }
            );
            if (ras.value) {
              const confirmModalProps = remote.process('getConfirmModalProps', {
                data: ras,
                basicInfoDs,
                payload: data,
              });
              const modalRes = await Modal.confirm({
                className: styles['batch-submit-modal'],
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: <div className={styles['submit-tip']}>{getResponse(ras).message}</div>,
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
        }
      } else {
        showLineDsErrors(detailInfoDs);
      }
    } catch (error) {
      throw error;
    } finally {
      basicInfoDs.status = 'ready';
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
    deleteOrder([poHeaderDetailDTO]).then((res) => {
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
    if (isCreate) {
      notification.error({
        description: intl
          .get('sodr.workspace.view.workspace.createUnSave')
          .d('请先保存订单，再重新执行智能预审操作。'),
      });
      return;
    }
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

  const getHeaderButtons = () => {
    const preButtons = [
      unSaveEnable === 0 && (
        <Button
          wait={THROTTLE_TIME}
          data-name="submit"
          color="primary"
          icon="done"
          type="c7n-pro"
          loading={headerLoading}
          onClick={() => handleSaveOrSubmit('submit')}
          permissionList={[
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.createdmanually.submit',
              type: 'c7n-pro',
              meaning: '订单工作台-手工创建明细-提交',
            },
          ]}
        >
          {intl.get(`hzero.common.button.submit`).d('提交')}
        </Button>
      ),
      <Button
        wait={THROTTLE_TIME}
        data-name="save"
        color={unSaveEnable === 0 ? undefined : 'primary'}
        funcType={unSaveEnable === 0 ? 'flat' : undefined}
        icon="save"
        type="c7n-pro"
        onClick={() => handleSaveOrSubmit('save')}
        loading={headerLoading}
        permissionList={[
          {
            code: 'srm.po-admin.po.order-workspace.ps.button.createdmanually.save',
            type: 'c7n-pro',
            meaning: '订单工作台-手工创建明细-保存',
          },
        ]}
      >
        {intl.get(`hzero.common.button.save`).d('保存')}
      </Button>,
      statusCode && statusCode !== 'REJECTED' && (
        <Button
          data-name="delete"
          icon="delete"
          type="c7n-pro"
          funcType="flat"
          onClick={handleDeleteConfirm}
          loading={headerLoading}
          permissionList={[
            {
              code: 'srm.po-admin.po.order-workspace.ps.button.createdmanually.delete',
              type: 'c7n-pro',
              meaning: '订单工作台-手工创建明细-删除',
            },
          ]}
        >
          {intl.get(`hzero.common.button.delete`).d('删除')}
        </Button>
      ),
      <Button
        type="c7n-pro"
        funcType="flat"
        data-name="aiPreReview"
        icon="offline_bolt-o"
        disabled={isCreate || ['APPROVING'].includes(reviewStatus)}
        onClick={handleAiPreReview}
      >
        {intl.get('sodr.workspace.view.workspace.aiPreReview').d('智能预审')}
      </Button>,
    ];

    const buttons = remote
      ? remote.process(
          'SODR.WORKSPACE_MAINTENANCE_CREATEMANUALLY_PROCESS_HEADER_BUTTON',
          preButtons,
          { props, loading, loadings, setLoadings, basicInfoDs, detailInfoDs }
        )
      : preButtons;

    return (
      <Fragment>
        {customizeBtnGroup({ code: 'SODR.WORKSPACE_CREATEDMANUALLY.BUTTONS' }, buttons)}
      </Fragment>
    );
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
        { newPriceLibFlag, record, poHeaderDetailDTO, basicInfoDs, action }
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
            getResponse(res) &&
            !isEmpty(res) &&
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
            const uomObj = uomId && {
              uomId,
              uomName,
              uomCode,
              uomCodeAndName,
            };
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
              // defaultPrecision,
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
        if (!doubleUnitEnabled) {
          record.set({ secondaryUomId: uomObj });
        }
        const setFields = {
          uomId: uomObj,
          currencyCode: currencyCode ? { currencyCode, defaultPrecision } : undefined,
          taxId: {
            taxId,
            taxRate,
          },
          taxRate,
          unitPrice,
          enteredTaxIncludedPrice,
          unitPriceBatch,
          priceLibraryId: priceLibId,
          priceTaxId: taxId,
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

  const contentList = useMemo(() => {
    const list = [
      {
        key: 'basicInfo',
        content: (
          <Panel
            key="basicInfo"
            id="order-workSpace-detail-content-basicInfo"
            header={intl.get('sodr.workspace.view.panel.orderBasicInfo').d('订单基础信息')}
          >
            <BasicInfo
              ds={basicInfoDs}
              organizationInfoDs={organizationInfoDs}
              isCreate={isCreate}
              custConfig={custConfig}
              customizeForm={customizeForm}
              remote={remote}
              oldTermHideFlag={oldTermHideFlag}
              detailInfoDs={detailInfoDs}
            />
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
            <OrganizationInfo
              supplierLovFlag={supplierLovFlag}
              ds={organizationInfoDs}
              isCreate={isCreate}
              customizeForm={customizeForm}
              remote={remote}
            />
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
            <DetailInfo
              customizeForm={customizeForm}
              customizeBtnGroup={customizeBtnGroup}
              history={history}
              poHeaderId={id}
              remote={remote}
              basicInfoDs={basicInfoDs}
              organizationInfoDs={organizationInfoDs}
              ds={detailInfoDs}
              setPrice={setPrice}
              getValues={getValues}
              customizeTable={customizeTable}
              batchMaintenanceDs={batchMaintenanceDs}
              handleIncludedPriceFcous={handleIncludedPriceFcous}
              fetchDetailHeader={fetchDetailHeader}
              loadings={loadings}
              loading={loading}
              priceUpdateList={priceUpdateList}
              isCreate={isCreate}
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
              sourceMaintenance
              customizeTable={customizeTable}
              code="SODR.WORKSPACE_CREATEDMANUALLY.GIFTINFO"
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
              source="maintenance"
              customizeForm={customizeForm}
              customizeCode="SODR.WORKSPACE_CREATEDMANUALLY.PAYMENTTERMINFO"
              getValues={getValues}
              fetchDetailHeader={fetchDetailHeader}
            />
          </Panel>
        ),
      },
    ];
    const panels = remote.process('processPanels', list, { basicInfoDs, id });
    return panels;
  });

  return (
    <Fragment>
      <OrderAffix />
      <Header
        className={styles['page-head.fix']}
        style={{ position: 'absolute', top: 0 }}
        backPath={backPath}
        title={
          isCreate
            ? intl.get('sodr.workspace.view.title.newOrder').d('新建订单')
            : intl.get('sodr.workspace.view.title.editOrderMaintenance').d('编辑订单')
        }
      >
        {getHeaderButtons()}
      </Header>
      <AlertTooltip reviewStatus={reviewStatus} aiReviewParams={aiReviewParams} />
      <div
        className={styles['order-workspace-detail-container']}
        id="order-workspace-detail-container"
      >
        <Spin spinning={!!loadings.all}>
          {customizeCollapse(
            {
              code: 'SODR.WORKSPACE_CREATEDMANUALLY.COLLAPSE',
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
          <Content className={styles['order-workspace-detail-content']}>
            <AttachmentInfo
              insideAttachment={createPermsMap.get(`${createPrefix}.insideattachment`)}
              externalAttachment={createPermsMap.get(`${createPrefix}.externalattachment`)}
              poHeaderId={id}
              ds={basicInfoDs}
              attachmentConfig={attachmentConfig}
              customizeForm={customizeForm}
              customizeCode={[
                'SODR.WORKSPACE_CREATEDMANUALLY.ATTACHMENTINFO',
                'SODR.WORKSPACE_CREATEDMANUALLY.ATTACHMENTINFO_EXTERNAL',
              ]}
            />
          </Content>
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_CREATEDMANUALLY.BASICINFO',
      'SODR.WORKSPACE_CREATEDMANUALLY.ORGANIZATIONINFO',
      'SODR.WORKSPACE_CREATEDMANUALLY.DETAILINFO',
      'SODR.WORKSPACE_CREATEDMANUALLY.BOM',
      'SODR.WORKSPACE_CREATEDMANUALLY.ATTACHMENTINFO',
      'SODR.WORKSPACE_CREATEDMANUALLY.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_CREATEDMANUALLY.BATCHEDIT',
      'SODR.WORKSPACE_CREATEDMANUALLY.REFERENCE_PRICE',
      'SODR.WORKSPACE_CREATEDMANUALLY.BUTTONS',
      'SODR.WORKSPACE_CREATEDMANUALLY.DETAIL_LINE_BUTTONS',
      'SODR.WORKSPACE_CREATEDMANUALLY.COLLAPSE',
      'SODR.WORKSPACE_CREATEDMANUALLY.GIFTINFO',
      'SODR.WORKSPACE_CREATEDMANUALLY.BATCHADDMODAL',
      'SODR.WORKSPACE_CREATEDMANUALLY.PAYMENTTERMINFO',
    ],
  }),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common', 'hpfm.customize'],
  }),
  remotes(...remoteConfig),
  observer
)(CreatedManually);
