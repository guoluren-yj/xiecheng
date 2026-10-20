import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { DataSet, Modal, Attachment, Row, Col } from 'choerodon-ui/pro';
import { Spin, Collapse, Icon } from 'hzero-ui';
import { compose, isEmpty, throttle } from 'lodash';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';
import { math } from 'choerodon-ui/dataset';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getUserOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SPUC } from '_utils/config';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import qs from 'querystring';
import remote from 'hzero-front/lib/utils/remote';

import { headerInfo, lineInfo, batchMaintenance } from './store';
import LineQuoteDs from '../../NewPurchasingRequisition/stores/LineQuoteDs';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import PurchaseLineInfo from './PurchaseLineInfo';
import {
  formatAumont,
  getStageIdList,
  validateDoubleUom,
  queryCalcRuleConfig,
  validateLineCalculate,
  handleBudgetVerification,
  showLineDsErrors,
} from '@/routes/components/utils';
import {
  fetchSettings,
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
  queryDoubleUomConfig,
} from '@/services/orderWorkspaceService';
import styles from './header.less';

const organizationId = getCurrentOrganizationId();
const { Panel } = Collapse;
const C7nPurchasingRequisition = (props) => {
  const {
    history,
    location: { search },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    cuxRemote,
  } = props;
  const { poHeaderId, sourcePage, entrance, poSourcePlatform } = qs.parse(search.substr(1));
  const [allState, setAllState] = useState({
    collapseKeys: ['orderHeaderInfo', 'orderLineInfo'], // 打开的折叠面板key
  });
  const [loadings, setLoadings] = useState({});
  const [isValidId, setValid] = useState(false);
  const [priceUpdateList, setPriceUpdateList] = useState([]);

  const setState = (curr = {}) => setAllState((prev) => ({ ...prev, ...curr }));

  const useSetstate = (state = {}) => {
    [headerInfoDs, lineInfoDs, batchMaintenanceDs].forEach((i) => {
      i.setState(state);
    });
  };

  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  const customizeCode = useMemo(() => {
    let code;
    // const { poSourcePlatform } = headerInfoDs.toJSONData()[0];
    switch (poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
        break;
      case 'E-COMMERCE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
        break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'CATALOGUE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
        break;
      default:
        code = null;
        break;
    }
    return code;
  }, [poSourcePlatform]);

  const headerInfoDs = useMemo(
    () =>
      new DataSet({
        ...headerInfo(),
        transport: {
          read: ({ dataSet }) => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/detail`,
              method: 'GET',
              transformResponse(res) {
                const data = JSON.parse(res);
                // 个性化的默认值逻辑导致无法通过 record.getPristineValue 来判断原始值是否有值， 临时使用此方式
                dataSet.setState('response', data);
                return data;
              },
            };
          },
        },
      }),
    []
  );
  const lineInfoDs = useMemo(
    () =>
      new DataSet({
        ...lineInfo(),
        queryParameter: {
          poEntryPoint: 'PO_MAINTAIN_DETAIL',
          camp: 2,
          sortType: 0,
          customizeUnitCode: customizeCode,
        },
        transport: {
          read: ({ dataSet }) => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`,
              method: 'GET',
              transformResponse(res) {
                const data = JSON.parse(res);
                // 个性化的默认值逻辑导致无法通过 record.getPristineValue 来判断原始值是否有值， 临时使用此方式
                dataSet.setState('response', data);
                return data;
              },
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
  const batchMaintenanceDs = useMemo(
    () =>
      new DataSet({
        ...batchMaintenance(headerInfoDs, lineInfoDs),
      }),
    [poHeaderId, headerInfoDs, lineInfoDs]
  );
  const purchasingRequisitionDs = useMemo(
    () =>
      new DataSet(
        LineQuoteDs({
          sourceDs: new DataSet({}),
          flagDs: new DataSet({}),
          organizationId: getUserOrganizationId(),
          tenantId: getCurrentOrganizationId(),
        })
      ),
    []
  );

  useEffect(() => {
    useSetstate({
      loading,
      lineInfoDs,
      headerInfoDs,
      batchMaintenanceDs,
      doubleUnitEnabled: 0,
      handleIncludedPriceFcous,
    });
    fetchDetailHeader();
  }, []);

  const fetchDetailHeader = (cache) => {
    loading({ all: true });
    fetchNewPriceLib();
    fetchItemNewPriceLib();
    getPriceUpdateList();
    fetchSettingsInfo();
    fetchDoubleUom();
    fetchAmountCalc();
    headerInfoDs.query(undefined, undefined, cache).then((res) => {
      loading({ all: false });
      if (getResponse(res)) {
        fetchStageIdList();
        setValid(Boolean(res?.poHeaderId));
        lineInfoDs.query(undefined, undefined, cache);
        // formatQueryData(res.mergeField);
      }
    });
  };

  const onCollapseChange = (collapseKeys) => {
    setState({
      collapseKeys,
    });
  };

  const handleBackParent = () => {
    let router; // 默认返回订单维护
    if (entrance === 'maintain') {
      router = '/sodr/purchase-order-maintain/list';
    } else {
      switch (sourcePage) {
        case 'pageRequest': // 采购申请
          router = '/sodr/purchase-order-maintain/quote-purchase-requisition/list';
          break;
        case 'pageOrder': // 手工创建订单
          router = '/sodr/purchase-order-maintain/list';
          break;
        case 'pageSource': // 寻源
          router = '/sodr/purchase-order-maintain/source-from-requisition/list';
          break;
        case 'pageConract': // 协议
          router = '/sodr/purchase-order-maintain/purchase/list';
          break;
        default:
          router = '/sodr/purchase-order-maintain/list';
          break;
      }
    }
    return router;
  };

  // 获取业务中心配置
  const fetchSettingsInfo = () => {
    loading({ fetchSetting: true });
    fetchSettings().then((item) => {
      loading({
        fetchSetting: false,
      });
      if (getResponse(item)) {
        // 订单创建启用多种来源单据数量校验
        if (item['010224'] && item['010224'].includes('CONTRACT')) {
          useSetstate({ conractFlag: true });
        }
        useSetstate({
          setting: item['000112'],
        });
      }
    });
  };

  // 获取业务规则定义订单下单控制
  const fetchStageIdList = async () => {
    loading({ fetchStageIdList: true });
    const res = await getStageIdList({
      poTypeId: headerInfoDs?.current?.get('poTypeId')?.orderTypeId,
      companyId: headerInfoDs?.current?.get('companyId')?.companyId,
    });
    if (res) {
      useSetstate({ stageIdList: res });
    }
    loading({ fetchStageIdList: false });
  };

  // 查询业务规则定金额计算配置
  const fetchAmountCalc = async () => {
    loading({ fetchAmountCalc: true });
    const res = await queryCalcRuleConfig();
    useSetstate({ amountCalcRule: res });
    loading({ fetchAmountCalc: false });
  };

  // 是否开启新价格库
  const fetchNewPriceLib = () => {
    loading({ fetchNewPriceLib: true });
    fetchNewPriceLibEnable({
      poHeaderId,
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
      poHeaderId,
    }).then((res) => {
      loading({ fetchItemNewPriceLib: false });
      if (getResponse(res)) {
        useSetstate({ itemChangePriceFlag: res });
      }
    });
  };

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = () => {
    loading({ fetchDoubleUom: true });
    queryDoubleUomConfig({
      moduleCode: 'SPRM',
    })
      .then((res) => {
        if (getResponse(res)) {
          useSetstate({ doubleUnitEnabled: Number(res) });
        }
      })
      .finally(() => {
        loading({ fetchDoubleUom: false });
      });
  };

  const getPriceUpdateList = () => {
    fetchPriceUpdateList({ poHeaderId }).then((res) => {
      if (getResponse(res)) {
        setPriceUpdateList(res);
      }
    });
  };

  /**
   * 原币含税单价获取焦点事件
   * @param {object[]} record - 当前行的数据
   * @param {object[]} dataList - 选中物料带出的数据
   */
  const handleIncludedPriceFcous = useCallback((record, action) => {
    const newPriceLibFlag = headerInfoDs.getState('newPriceLibFlag');
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
    if (
      newPriceLibFlag === 1 &&
      values.itemCode &&
      values.freeFlag !== 1 &&
      (summaryFlag !== 1 || !record.get('priceLibraryId') || action !== 'price')
    ) {
      loading({ handleIncludedPriceFcous: true });
      fetchNewPriceLibData({
        poHeaderDetailDTO,
        poLineDetailDTOs,
      }).then((res) => {
        loading({ handleIncludedPriceFcous: false });
        if (getResponse(res) && !isEmpty(res) && (values.priceLibraryId || res.priceLibId)) {
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
          const doubleUnitEnabled = headerInfoDs.getState('doubleUnitEnabled');
          // 启用双单位配置了订单模块开启：如果返回的【单位】和订单行【基本单位】不一致,界面报错
          const uomObj = uomId && {
            uomId,
            uomName,
            uomCode,
            uomCodeAndName,
          };
          const sodrEnabled = doubleUnitEnabled !== 0;
          const lineUomId = record.get('uomId')?.uomId;
          if (
            doubleUnitEnabled &&
            !validateDoubleUom({ price: res, record, lineUomId, sodrEnabled, type: 'c7n' })
          ) {
            return false;
          }
          if (!sodrEnabled) {
            record.set({ secondaryUomId: uomObj });
          }
          record.set({
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
            contractNum: { contractNum },
            defaultPrecision,
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
          });
        }
      });
    }
  }, []);

  /**
   * 设置价格
   */
  const setPrice = useCallback((ds) => {
    const { selected } = ds;
    if (isEmpty(selected)) return;
    const val = selected[0].toJSONData();
    const record = lineInfoDs.current;
    const doubleUnitEnabled = lineInfoDs.getState('doubleUnitEnabled');
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
      } = val;
      const uomObj = uomId && {
        uomId,
        uomName,
        uomCode,
        uomCodeAndName,
      };
      const lineUomId = record.get('uomId')?.uomId;
      if (
        doubleUnitEnabled &&
        !validateDoubleUom({
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
      const quantity = record.get('quantity');
      const ladderPriceRecord = ladderPriceLibList.find(
        (item) =>
          math.gte(new BigNumber(quantity), new BigNumber(item.ladderFrom)) &&
          (math.lt(new BigNumber(quantity, new BigNumber(item.ladderTo))) ||
            math.lt(new BigNumber(quantity, new BigNumber(Infinity))))
      );
      const unitPrice = formatAumont(
        ladderPriceRecord ? ladderPriceRecord.ladderNetPrice : netPrice,
        defaultPrecision
      );
      const enteredTaxIncludedPrice = formatAumont(
        ladderPriceRecord ? ladderPriceRecord.ladderPrice : taxIncludedPrice,
        defaultPrecision
      );
      record.set({
        uomId: uomId
          ? {
              uomId,
              uomName,
              uomCodeAndName,
            }
          : null,
        currencyCode: currencyCode ? { currencyCode, defaultPrecision } : undefined,
        defaultPrecision,
        taxId: {
          taxId,
          taxRate,
        },
        unitPrice,
        enteredTaxIncludedPrice,
        unitPriceBatch,
        priceLibraryId: priceLibId,
        priceTaxId: taxId,
        // contractNum,
        contractNum: { contractNum },
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
      });
    }
  }, []);

  const getValues = useCallback(() => {
    const poHeaderDetailDTO = {
      ...headerInfoDs.toJSONData()[0],
    };
    const poLineDetailDTOs = lineInfoDs.toJSONData();
    const values = {
      poHeaderDetailDTO,
      poLineDetailDTOs,
    };
    return values;
  }, []);

  const btnLoading = useMemo(
    () =>
      loadings.all ||
      loadings.handleSave ||
      loadings.submitDetail ||
      loadings.handleDelete ||
      lineInfoDs.status !== 'ready' ||
      headerInfoDs.status !== 'ready',
    [loadings, lineInfoDs.status, headerInfoDs.status]
  );

  const headerBtnsRender = useMemo(() => {
    const { unSaveEnable, statusCode } = headerInfoDs.toJSONData()[0] || {};
    const btns = [
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.save1`).d('保存'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'save',
          color: 'primary',
          disabled: !poHeaderId,
          onClick: () => handleSaveOrSubmit('save'),
          loading: btnLoading,
        },
      },
      unSaveEnable === 0 && {
        name: 'check',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          wait: THROTTLE_TIME,
          icon: 'check',
          onClick: () => handleSaveOrSubmit('submit'),
          loading: btnLoading,
        },
      },
      {
        name: 'outUuid',
        btnComp: Attachment,
        child: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
        btnProps: {
          dataSet: headerInfoDs,
          disabled: btnLoading || !poHeaderId || !isValidId,
          name: 'attachmentUuid',
          viewMode: 'popup',
          color: 'default',
          icon: 'attach_file',
          funcType: 'raised',
        },
      },
      {
        name: 'innerUuid',
        btnComp: Attachment,
        child: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
        btnProps: {
          dataSet: headerInfoDs,
          disabled: btnLoading || !poHeaderId || !isValidId,
          name: 'purchaserInnerAttachmentUuid',
          viewMode: 'popup',
          color: 'default',
          icon: 'attach_file',
          funcType: 'raised',
        },
      },
      statusCode !== 'REJECTED' && {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          onClick: () => handleDelete(),
          loading: btnLoading,
        },
      },
    ];
    return btns.reverse();
  }, [isValidId, btnLoading, allState.attachmentUuid, allState.purchaserInnerAttachmentUuid]);

  const handleDelete = () => {
    const { poHeaderDetailDTO } = getValues();
    Modal.confirm({
      children: intl.get(`sodr.workspace.view.message.confirmDestroy`).d('是否确认删除订单'),
      onOk: throttle(
        () => {
          loading({ handleDelete: true });
          deleteSheetDelivery([poHeaderDetailDTO]).then((res) => {
            loading({ handleDelete: false });
            if (getResponse(res)) {
              notification.success();
              history.push({
                pathname: handleBackParent(),
              });
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const handleSaveOrSubmit = (type) => {
    const { unSaveEnable } = headerInfoDs.toJSONData()[0] || {};
    const { poHeaderDetailDTO, poLineDetailDTOs } = getValues();
    const customizeUnitCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const validateList = unSaveEnable ? [headerInfoDs] : [headerInfoDs, lineInfoDs];
    const data = unSaveEnable ? { poHeaderDetailDTO } : { poHeaderDetailDTO, poLineDetailDTOs };
    if (!validateLineCalculate({ data: lineInfoDs, type: 'c7n' })) return;
    Promise.all(validateList.map((i) => i.validate())).then(async (status) => {
      if (status.findIndex((i) => !i) === -1) {
        if (type === 'save') {
          loading({ handleSave: true });
          const payload = { data, customizeUnitCode };
          const callback = () => {
            newSave(payload).then((res) => {
              loading({ handleSave: false });
              if (getResponse(res)) {
                notification.success();
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
          saveWarn(payload).then((ras) => {
            if (!getResponse(ras)) {
              loading({ handleSave: false });
              return false;
            }
            if (getResponse(ras)?.value) {
              Modal.confirm({
                children: ras?.message,
                className: styles['detail-save-confirm-modal'],
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                onOk: throttle(callback, THROTTLE_TIME, { trailing: false }),
              });
            } else {
              callback();
            }
          });
        } else {
          const beforeSubmit = await (cuxRemote
            ? cuxRemote.process('SODR_PURCHASE_REQUISITION_C7N_PROCESS_BEFORE_SUBMIT', true, {
                poHeaderDetailDTO,
                poLineDetailDTOs,
              })
            : true);
          if (!beforeSubmit) return;
          loading({ submitDetail: true });
          submitValidate(data).then((res) => {
            loading({ submitDetail: false });
            if (getResponse(res)) {
              const budgetVerificationData = [
                {
                  ...data.poHeaderDetailDTO,
                  saveFlag: 1,
                  viewCode: 'PENDING_DETAIL_VIEW',
                  poLineExpVOList: poLineDetailDTOs,
                },
              ];
              const submit = () => {
                loading({ submitDetail: true });
                submitDetail({
                  data,
                  customizeUnitCode,
                }).then((response) => {
                  loading({ submitDetail: false });
                  if (getResponse(response)) {
                    notification.success();
                    history.push({
                      pathname: handleBackParent(),
                    });
                  }
                });
              };
              if (getResponse(res).result) {
                Modal.confirm({
                  title: getResponse(res).result,
                  okText: intl.get('hzero.common.button.sure').d('确定'),
                  cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                  onOk: throttle(
                    () => {
                      loading({ submitDetail: true });
                      addNewSubmitDetail(data).then((ras) => {
                        loading({ submitDetail: false });
                        if (getResponse(ras)) {
                          if (getResponse(ras).value) {
                            Modal.confirm({
                              className: styles['batch-submit-modal'],
                              title: getResponse(ras).message,
                              okText: intl.get('hzero.common.button.sure').d('确定'),
                              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                              onOk: () => {
                                handleBudgetVerification(budgetVerificationData, submit, {
                                  loading,
                                  key: 'submitDetail',
                                });
                              },
                            });
                          } else {
                            handleBudgetVerification(budgetVerificationData, submit, {
                              loading,
                              key: 'submitDetail',
                            });
                          }
                        }
                      });
                    },
                    THROTTLE_TIME,
                    { trailing: false }
                  ),
                });
              } else {
                loading({ submitDetail: true });
                addNewSubmitDetail(data).then((ras) => {
                  loading({ submitDetail: false });
                  if (getResponse(ras)) {
                    if (getResponse(ras).value) {
                      Modal.confirm({
                        className: styles['batch-submit-modal'],
                        title: getResponse(ras).message,
                        okText: intl.get('hzero.common.button.sure').d('确定'),
                        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                        onOk: throttle(
                          () => {
                            handleBudgetVerification(budgetVerificationData, submit, {
                              loading,
                              key: 'submitDetail',
                            });
                          },
                          THROTTLE_TIME,
                          { trailing: false }
                        ),
                      });
                    } else {
                      handleBudgetVerification(budgetVerificationData, submit, {
                        loading,
                        key: 'submitDetail',
                      });
                    }
                  }
                });
              }
            }
          });
        }
      } else {
        showLineDsErrors(lineInfoDs);
      }
    });
  };

  const { collapseKeys } = allState;
  const { sourceBillTypeCode, unSaveEnable } = headerInfoDs.toJSONData()[0] || {};
  return (
    <Fragment>
      <Header
        backPath={handleBackParent()}
        title={intl.get('sodr.quotePurchase.view.message.purchaseOrderMaintain').d('订单维护')}
      >
        {customizeBtnGroup(
          { code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BTNS', pro: true },
          <DynamicButtons buttons={headerBtnsRender} />
        )}
      </Header>
      <Content>
        {sourceBillTypeCode === 'PURCHASE_REQUEST' && [1, 2].includes(unSaveEnable) && (
          <p className={styles['order-top-title']}>
            <span />
            {intl
              .get(`sodr.quotePurchase.view.message.saveBeforeOperation`)
              .d('请先保存订单头信息，再操作订单行信息')}
          </p>
        )}
        <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          <Collapse
            className="form-collapse"
            defaultActiveKey={collapseKeys}
            onChange={onCollapseChange}
          >
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  <h3>
                    {intl.get(`sodr.quotePurchase.view.message.orderHeaderInfo`).d('订单头信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('orderHeaderInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                </Fragment>
              }
              key="orderHeaderInfo"
            >
              <Row>
                <Col span={18}>
                  <PurchaseRequestHeader ds={headerInfoDs} customizeForm={customizeForm} />
                </Col>
              </Row>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <Fragment>
                  <h3>
                    {intl
                      .get(`sodr.quotePurchaseRequisition.view.message.orderLineInfo`)
                      .d('订单行信息')}
                  </h3>
                  <a>
                    {collapseKeys.includes('orderLineInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderLineInfo') ? 'up' : 'down'} />
                </Fragment>
              }
              key="orderLineInfo"
            >
              <PurchaseLineInfo
                ds={lineInfoDs}
                poHeaderId={poHeaderId}
                loadings={loadings}
                getValues={getValues}
                setPrice={setPrice}
                customizeForm={customizeForm}
                customizeTable={customizeTable}
                priceUpdateList={priceUpdateList}
                fetchDetailHeader={fetchDetailHeader}
                batchMaintenanceDs={batchMaintenanceDs}
                handleIncludedPriceFcous={handleIncludedPriceFcous}
                loading={loading}
                cuxRemote={cuxRemote}
                purchasingRequisitionDs={purchasingRequisitionDs}
              />
            </Panel>
          </Collapse>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  withRouter,
  withCustomize({
    unitCode: [
      'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP',
      // 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC',
      // 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE',
      'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
      'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
      'SODR.ORDER_CREATE_LINE_LIST.PROPOSED.PRICE',
      'SODR.PURCHASE_REQUISITION_LIST.BUTTONS',
      'SODR.ORDER_CREATE_LINE_LIST.HEADER_BTNS',
      'SODR.PURCHASE_REQUISITION_LIST.FILTER_LINE',
      'SODR.PURCHASE_REQUISITION_LIST.LINE',
      'SODR.ORDER_CREATE_LINE_LIST.BATCH_ERP',
      'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
    ],
  }),
  remote({
    code: 'SODR_PURCHASE_REQUISITION_C7N',
    name: 'cuxRemote',
  }),
  formatterCollections({
    code: [
      'sodr.quotePurchaseRequisition',
      'sprm.purchaseReqCreation',
      'sodr.quotePurchase',
      'ssrc.priceLibrary',
      'entity.attachment',
      'sodr.workspace',
      'hpfm.employee',
      'srm.common',
      'entity.tenant',
      'sodr.common',
      'sprm.common',
      'sodr.view',
      'sodr.orderMaintain',
    ],
  }),
  observer
)(C7nPurchasingRequisition);
