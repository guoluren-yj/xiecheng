import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { DataSet, Modal, Attachment, Row, Col } from 'choerodon-ui/pro';
import { Spin, Collapse, Icon } from 'hzero-ui';
import { compose, isEmpty, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

import qs from 'querystring';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
// import { queryMapIdpValue } from 'services/api';
import { headerInfo, lineInfo, batchMaintenance } from './store';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import PurchaseLineInfo from './PurchaseLineInfo';
import {
  formatUom,
  getStageIdList,
  queryCalcRuleConfig,
  handleBudgetVerification,
  validateDoubleUom,
  validateLineCalculate,
  showLineDsErrors,
} from '@/routes/components/utils';
import {
  saveWarn,
  fetchPageOrder,
  fetchSettings,
  fetchNewPriceLibEnable,
  fetchNewPriceLibData,
  fetchDefaultLovValue,
  saveDetail,
  newSaveDetail,
  deleteSheetDelivery,
  // submitValidate,
  submitDetail,
  addNewSubmitDetail,
  fetchPriceUpdateList,
  queryDoubleUomConfig,
  fetchAutoGetCompany,
  fetchItemNewPriceLibEnable,
} from '@/services/orderWorkspaceService';
import styles from './header.less';

const organizationId = getCurrentOrganizationId();

const { Panel } = Collapse;
const C7nDetail = (props) => {
  const {
    history,
    cuxRemote,
    location: { search },
    customizeForm,
    customizeTable,
    customizeBtnGroup,
  } = props;
  const { poHeaderId, sourcePage, entrance } = qs.parse(search.substr(1));
  const [allState, setAllState] = useState({
    collapseKeys: ['orderHeaderInfo', 'orderLineInfo'],
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
    [poHeaderId]
  );
  const lineInfoDs = useMemo(
    () =>
      new DataSet({
        ...lineInfo(),
        transport: {
          read: () => {
            return {
              url: `${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`,
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
    [poHeaderId]
  );

  const batchMaintenanceDs = useMemo(
    () =>
      new DataSet({
        ...batchMaintenance(headerInfoDs, lineInfoDs),
      }),
    [poHeaderId, headerInfoDs, lineInfoDs]
  );

  // DidMount
  useEffect(() => {
    useSetstate({
      loading,
      poHeaderId,
      headerInfoDs,
      lineInfoDs,
      batchMaintenanceDs,
      doubleUnitEnabled: 0,
      handleIncludedPriceFcous,
    });
  }, [poHeaderId]);

  useEffect(() => {
    if (poHeaderId) {
      headerInfoDs.setQueryParameter('poHeaderId', poHeaderId);
      lineInfoDs.setQueryParameter('poHeaderId', poHeaderId);
      fetchDetailHeader();
    } else {
      fetchDoubleUom();
      fetchAmountCalc();
      fetchPageOrder().then((res) => {
        if (res) {
          fetchStageIdList();
          // 字段优先级个性化默认值大于接口值,
          const customizeData = headerInfoDs.toJSONData()[0];
          headerInfoDs.loadData([{ ...res, ...customizeData }]);
          lineInfoDs.loadData([res]);
        }
      });
    }
  }, [poHeaderId]);

  const fetchDetailHeader = (cache) => {
    if (!poHeaderId) return;
    loading({ all: true });
    fetchNewPriceLib();
    fetchItemNewPriceLib();
    getPriceUpdateList();
    fetchSettingsInfo();
    fetchDoubleUom();
    fetchAmountCalc();
    // fetchBatchLov();
    headerInfoDs.query(undefined, undefined, cache).then((res) => {
      loading({ all: false });
      if (getResponse(res)) {
        fetchStageIdList();
        const { outsourceOrderFlag } = res || {};
        setValid(Boolean(res?.poHeaderId));
        if (outsourceOrderFlag === 1) {
          getDefaultProjectCategory();
        }
        headerInfoDs.loadData(
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
        fetchDefaultLineOrg();
        lineInfoDs.query(undefined, undefined, cache);
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

  // 查询业务规则定义双单位配置
  const fetchDoubleUom = () => {
    loading({ fetchDoubleUom: true });
    queryDoubleUomConfig()
      .then((res) => {
        if (getResponse(res)) {
          useSetstate({ doubleUnitEnabled: Number(res) });
        }
      })
      .finally(() => {
        loading({ fetchDoubleUom: false });
      });
  };

  // 查询业务规则定金额计算配置
  const fetchAmountCalc = async () => {
    loading({ fetchAmountCalc: true });
    const res = await queryCalcRuleConfig();
    useSetstate({ amountCalcRule: res });
    loading({ fetchAmountCalc: false });
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
        if (item) {
          useSetstate({
            setting: item['000112'],
          });
        }
      }
    });
  };

  // 获取默认库存组织信息
  const fetchDefaultLineOrg = async () => {
    const basicCurrent = headerInfoDs?.current;
    const res = await fetchAutoGetCompany({
      ouId: basicCurrent?.get('ouId')?.ouId,
      companyId: basicCurrent?.get('companyId')?.companyId,
    });
    if (getResponse(res)) {
      const { organizationId: defaultOrgId, organizationName: defaultOrgName } = res;
      lineInfoDs.setState({
        defaultOrgId,
        defaultOrgName,
      });
    }
  };

  const getDefaultProjectCategory = () => {
    fetchDefaultLovValue({ lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY', value: 'L' }).then((res) => {
      if (res && getResponse(res)) {
        const { value, meaning } = res.content[0] || {};
        headerInfoDs.setState({
          defaultProjectCategory: value,
          defaultProjectCategoryMeaning: meaning,
        });
      }
    });
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
  const handleIncludedPriceFcous = useCallback(
    (record, action) => {
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
            const doubleUnitEnabled = headerInfoDs.getState('doubleUnitEnabled');
            // 启用双单位配置了订单模块开启：如果返回的【单位】和订单行【基本单位】不一致,界面报错
            const uomObj = uomId && {
              uomId,
              uomName,
              uomCode,
              uomCodeAndName: uomCodeAndName || formatUom(uomCode, uomName),
            };
            if ([0, 1, 2].includes(doubleUnitEnabled)) {
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
              contractNum,
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
    },
    [poHeaderId]
  );

  // 设置价格
  const setPrice = useCallback(
    (ds) => {
      const { selected } = ds;
      if (isEmpty(selected)) return;
      const val = selected[0].toJSONData();
      const record = lineInfoDs?.current || {};
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
        const quantity = record.get('quantity');
        const ladderPriceRecord = ladderPriceLibList.find(
          (item) =>
            math.gte(new BigNumber(quantity), new BigNumber(item.ladderFrom)) &&
            (math.lt(new BigNumber(quantity, new BigNumber(item.ladderTo))) ||
              math.lt(new BigNumber(quantity, new BigNumber(Infinity))))
        );
        const unitPrice = ladderPriceRecord ? ladderPriceRecord.ladderNetPrice : netPrice;
        const enteredTaxIncludedPrice = ladderPriceRecord
          ? ladderPriceRecord.ladderPrice
          : taxIncludedPrice;
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
        record.set({
          uomId: uomObj,
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
        });
      }
    },
    [poHeaderId]
  );

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
  }, [poHeaderId]);

  // const handleImport = () => {
  //   const option = {
  //     pathname: '/sodr/purchase-order-maintain/line-creation/data-import/SPUC.PO_LINE_IMPORT',
  //     search: stringify({
  //       action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
  //       backPath: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-manuall-create?poHeaderId=${poHeaderId}&source=newRequisition&entrance=maintain`,
  //       args: JSON.stringify({
  //         poHeaderId,
  //       }),
  //     }),
  //   };
  //   history.push(option);
  // };

  const btnLoading = useMemo(
    () =>
      loadings.all ||
      loadings.handleSave ||
      loadings.submitDetail ||
      loadings.handleDelete ||
      headerInfoDs.status !== 'ready' ||
      lineInfoDs.status !== 'ready',
    [loadings, lineInfoDs.status, headerInfoDs.status]
  );

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

  const getCustomizeCode = () => {
    let code;
    const { poSourcePlatform } = headerInfoDs.toJSONData()[0];
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
  };

  /**
   * getAmount - 将字符串的逗号分隔符去掉
   */
  const getAmount = (amount) => {
    if (!amount) {
      return amount;
    }
    const arr = `${amount}`.split(',');
    const newAmount = !arr.length ? arr[0] : arr.reduce((pre, cur) => `${pre}${cur}`);
    return new BigNumber(newAmount);
  };

  const handleSaveOrSubmit = (type) => {
    const { poHeaderDetailDTO, poLineDetailDTOs } = getValues();
    const customizeUnitCode = getCustomizeCode();
    const customizeUnitCodeHeader = 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST';
    const validateList = !poHeaderId ? [headerInfoDs] : [headerInfoDs, lineInfoDs];
    const data = { poHeaderDetailDTO, poLineDetailDTOs };
    if (!validateLineCalculate({ data: lineInfoDs, type: 'c7n' })) return;
    //  const newPriceLibFlag = lineInfoDs.getState('newPriceLibFlag');
    const initPoLineDetailDTOs = poLineDetailDTOs.map((item) => {
      return {
        ...item,
        originUnitPrice: getAmount(item.originUnitPrice),
        unitPrice: getAmount(item.unitPrice),
        enteredTaxIncludedPrice: getAmount(item.enteredTaxIncludedPrice),
      };
    });
    const newPoLineDetailDTOs = initPoLineDetailDTOs.map((i) => {
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
    Promise.all(validateList.map((i) => i.validate())).then(async (status) => {
      if (status.findIndex((i) => !i) === -1) {
        if (!poHeaderId) {
          loading({ handleSave: true });
          newSaveDetail({
            customizeUnitCode: customizeUnitCodeHeader,
            data: poHeaderDetailDTO,
          }).then((res) => {
            loading({ handleSave: false });
            if (getResponse(res)) {
              notification.success();
              history.push({
                pathname:
                  '/sodr/purchase-order-maintain/quote-purchase-requisition/line-manuall-create',
                search: `?poHeaderId=${res.poHeaderId}&source=newRequisition&sourcePage=pageOrder&entrance=maintain`,
              });
            }
          });
        } else if (type === 'save') {
          loading({ handleSave: true });
          const saveData = {
            poHeaderDetailDTO: {
              ...poHeaderDetailDTO,
              sourceBillTypeCode: 'PURCHASE_ORDER',
              poSourcePlatform: 'SRM',
            },
            poLineDetailDTOs: newPoLineDetailDTOs,
          };
          const payload = {
            data: saveData,
            customizeUnitCode: `${customizeUnitCode},${customizeUnitCodeHeader}`,
          };
          const callback = () => {
            saveDetail(payload).then((res) => {
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
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                onOk: throttle(callback, THROTTLE_TIME, { trailing: false }),
              });
            } else {
              callback();
            }
          });
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
          const beforeSubmit = await (cuxRemote
            ? cuxRemote.process('SODR_MANUALCREATEION_C7N_PROCESS_BEFORE_SUBMIT', true, {
                poHeaderDetailDTO,
                poLineDetailDTOs,
              })
            : true);
          if (!beforeSubmit) return;
          loading({ submitDetail: true });
          addNewSubmitDetail(data).then((ras) => {
            loading({ submitDetail: false });
            if (getResponse(ras)) {
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
                // if (fieldMap) data.fieldMap = fieldMap;
                submitDetail({
                  data,
                  customizeUnitCode: `${customizeUnitCode},${customizeUnitCodeHeader}`,
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
      } else {
        showLineDsErrors(lineInfoDs);
      }
    });
  };

  const getButtons = () => {
    const { unSaveEnable, statusCode } = headerInfoDs.toJSONData()[0] || {};
    const headerBtnsRender = [
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          wait: THROTTLE_TIME,
          onClick: () => handleSaveOrSubmit('save'),
          loading: btnLoading,
          color: 'primary',
          icon: 'save',
        },
      },
      {
        name: 'submit',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        hidden: unSaveEnable !== 0,
        btnProps: {
          wait: THROTTLE_TIME,
          disabled: !poHeaderId || !isValidId,
          icon: 'check',
          loading: btnLoading,
          onClick: () => handleSaveOrSubmit('submit'),
        },
      },
      {
        name: 'outUuid',
        btnComp: Attachment,
        // childFor: 'label',
        child: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
        btnProps: {
          name: 'attachmentUuid',
          dataSet: headerInfoDs,
          disabled: btnLoading || !poHeaderId || !isValidId,
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
          name: 'purchaserInnerAttachmentUuid',
          dataSet: headerInfoDs,
          disabled: btnLoading || !poHeaderId || !isValidId,
          viewMode: 'popup',
          color: 'default',
          icon: 'attach_file',
          funcType: 'raised',
        },
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        hidden: statusCode === 'REJECTED',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          disabled: !poHeaderId || !isValidId,
          onClick: () => handleDelete(),
          loading: btnLoading,
          icon: 'delete',
        },
      },
      // {
      //   name: 'newBatchImport',
      //   btnComp: CommonImport,
      //   child: intl.get(`hzero.common.button.newBatchImport`).d('(新)批量导入'),
      //   childFor: 'buttonText',
      //   btnType: 'c7n-pro',
      //   btnProps: {
      //     businessObjectTemplateCode: 'SPUC.PO_LINE_IMPORT',
      //     prefixPatch: SRM_SPUC,
      //     refreshButton: true,
      //     // buttonText: intl.get(`hzero.common.button.newBatchImport`).d('(新)批量导入'),
      //     args: { poHeaderId }, // 上传参数
      //     successCallBack: () => {
      //       lineInfoDs.query();
      //       fetchDetailHeader();
      //     },
      //     buttonProps: {
      //       type: 'c7n-pro',
      //       loading: btnLoading,
      //     }, // 导入按钮属性
      //   },
      // },
      // {
      //   name: 'batchImport',
      //   btnType: 'c7n-pro',
      //   child: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
      //   btnProps: {
      //     icon: 'archive',
      //     loading: btnLoading,
      //     onClick: () => handleImport(),
      //   },
      // },
    ];
    return customizeBtnGroup(
      { code: 'SODR.ORDER_CREATE_LINE_LIST.MANUALLY_BTNS', pro: true },
      <DynamicButtons buttons={headerBtnsRender} />
    );
  };

  const { collapseKeys } = allState;
  const { sourceBillTypeCode, unSaveEnable } = headerInfoDs.toJSONData()[0] || {};
  return (
    <Fragment>
      <Header
        backPath={handleBackParent()}
        title={intl.get('sodr.quotePurchase.view.message.purchaseOrderMaintain').d('订单维护')}
      >
        {getButtons()}
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
            {poHeaderId && (
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
                  history={history}
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
                />
              </Panel>
            )}
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
      'SODR.ORDER_CREATE_LINE_LIST.MANUALLY_BTNS',
      'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
    ],
  }),
  remote({
    code: 'SODR_MANUALCREATEION_C7N',
    name: 'cuxRemote',
  }),
  formatterCollections({
    code: [
      'sodr.quotePurchaseRequisition',
      'entity.attachment',
      'sodr.quotePurchase',
      'sodr.workspace',
      'hpfm.employee',
      'sodr.common',
      'srm.common',
      'entity.tenant',
      'ssrc.priceLibrary',
      'sodr.view',
      'sodr.orderMaintain',
    ],
  }),
  observer
)(C7nDetail);
