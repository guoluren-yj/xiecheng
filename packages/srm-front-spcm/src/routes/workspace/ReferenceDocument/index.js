/**
 * 协议工作台-引用单据创建index
 */
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  compose,
  isEmpty,
  isNumber,
  isNaN,
  cloneDeep,
  isUndefined,
  pickBy,
  isArray,
  isNil,
} from 'lodash';
import { observer } from 'mobx-react-lite';
import { DataSet, Modal, Icon, Tooltip } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { parse } from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getUserOrganizationId, getResponse } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import moment from 'moment';
import hocRemote from 'utils/remote';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import PermissionButton from 'srm-front-boot/lib/components/PermissionButton';
import { getSearchBarCache } from '_components/SearchBarTable/util/cache';
import { dateTimeRender, dateRender, numberRender, yesOrNoRender } from 'utils/renderer';
import DynamicButtons from '_components/DynamicButtons';

import { queryCommonDoubleUomConfig } from '@/utils/util';
import { renderStatus } from '@/utils/renderer';
import ApplicationScope from '@/routes/components/ContractSubject/ApplicationOrganization';
import {
  toSuspend,
  queryNewOrOldLink,
  referenceWhitelist,
  getCommonVariableConfig,
  getSourceResultsAndCheckMerge,
} from '@/services/newContractService';
import { fetchRecommendSupplier } from '@/services/workspaceService';
import { MutlTextFieldSearch } from '@/routes/workspace/Component/MultipleSearch';
import { purchaseOrder, sourcingResults, purchaseNeed } from './store/referenceDocumentDs';
import showLadderQuote from '../Component/Modal/LadderOfferModal';
import showManuallyModal from '../Component/Modal/ManuallyModal';

import styles from '../index.less';

const organizationId = getUserOrganizationId();
const tenantId = getCurrentOrganizationId();
const { TabPane } = Tabs;
function countDecimals(val) {
  const strArray = `${val}`.split('.') || [];
  return !isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
    ? isEmpty((strArray[1] || '').match(/[^0]/g))
      ? 2
      : `${val}`.split('.')[1].length || 0
    : 0;
}

const ReferenceDocument = (props) => {
  const {
    dispatch,
    workSpace,
    customizeTable,
    customizeForm,
    // onClose,
    modal: { update, close },
    location,
    remote,
    customizeTabPane,
    extractConfig,
    customizeBtnGroup,
  } = props;

  const { referenceActiveKey: roleActiveKey } =
    (location && parse(location?.search.substr(1))) || {};
  const {
    dsPoFlag, // 采购订单
    dsFrFlag, // 寻源结果
    dsPrFlag, // 采购申请
  } = props?.setting || workSpace?.setting;
  const { enableSmartContract, enableOnlineAttachmentContract } = extractConfig || {};
  const [doubleUnitEnabled, setDoubleUnitEnabled] = useState(0);
  const [_linkFlag, setLinkFlag] = useState(false);
  const [referenceActiveKey, setReferenceActiveKey] = useState(
    dsPoFlag ? 'purchaseOrder' : dsFrFlag ? 'sourcingResults' : dsPrFlag ? 'purchaseNeed' : ''
  );
  const currentDs = useRef();
  const onOk = async (key) => {
    const selectedRows = currentDs.current?.selected.map((item) => item.toData());
    // 建议，不要在这里做判断，把类型传到MODAL里面，请modal里面做判断，请求不同的接口
    if (selectedRows.length === 0) {
      notification.error({
        message: intl
          .get('spcm.workspace.view.title.noSelectReferenceDocument')
          .d('没有勾选相应的引用单据'),
      });
      return false;
    }
    // 并单规则检验
    const dispatchProps = {
      type: 'workSpace/sourceCreate',
      payload: {
        // query: filterValues,
        type: key,
        body: selectedRows,
      },
    };
    let res = {};
    if (remote?.event) {
      const result = await remote.event.fireEvent('handleCuxCreateValid', {
        key,
        props,
        selectedRows,
        changeRes: (newRes) => {
          res = newRes;
        },
      });
      if (result) {
        res = await dispatch(dispatchProps);
      }
    }

    if (res) {
      let payload = {};
      switch (key) {
        case 'purchaseOrder':
          payload = {
            createPurchaseOrderList: selectedRows.map((s) => ({
              ...s,
              purchaseOrgName: s.purOrganizationName,
            })),
          };
          break;
        case 'sourcingResults': {
          // 去除适用范围
          const filterSelectedRows = res.map((i) => {
            const { sourceAppScopeLineDTOs, ...others } = i;
            return {
              ...others,
              sourceAppScopeLineDTOs: null,
            };
          });
          payload = {
            sourceResultDTOs: filterSelectedRows,
          };
          break;
        }
        default:
          break;
      }
      if (key === 'purchaseNeed') {
        // 合并头信息
        let reduceList = [
          'supplierTenantId',
          'supplierCompanyId',
          'supplierCompanyName',
          'supplierId',
          'supplierName',
          'ouId',
          'ouName',
          'purchaseOrgId',
          'purchaseOrgName',
          'purchaseAgentId',
          'purchaseAgentName',
          'companyOrgName',
          'companyOrgId',
          'costAnchDepId',
          'costAnchDepDesc',
          'overseasProcurement',
          'companyId',
          'companyName',
          'attributeVarchar10',
          'attributeVarchar11',
          'agentId',
          'agentName',
          'executionStrategyCode',
          // 'recommendSupplierFlag', // 是否采用推荐供应商标识
          'selectSupplierCompanyId',
          'selectSupplierCompanyName',
          'selectSupplierTenantId',
          'selectLocalSupplierId',
          'selectLocalSupplierName',
          'priceLibId',
          'priceLibraryId',
          'secondLevelStrategyCode',
          'orderSecondLevelStrategyCode',
          'transferredDocumentTypeVOList',
          'exchangeRate',
        ];
        reduceList = remote
          ? remote.process('SPCM_WORKSPACE_REF_DOC_PNEED_REDUCELIST', reduceList, {
              current: props,
            })
          : reduceList;
        const headerInfo = reduceList.reduce((obj, filedNames) => {
          const [filedName, targetFiledName] = [].concat(filedNames);
          const _headerInfo = obj;
          // 当前字段在选择项中不同值集合
          const diffValues = new Set(
            selectedRows.map((purchaseContract) => {
              if (!isUndefined(purchaseContract[filedName])) {
                return purchaseContract[filedName];
              } else {
                return null;
              }
            })
          );
          if (diffValues.size === 1 || diffValues.size > 0 && filedName === 'transferredDocumentTypeVOList') {
            [_headerInfo[targetFiledName || filedName]] = diffValues;
          }
          return _headerInfo;
        }, {});

        headerInfo.pcSourceCodeMeaning = intl
          .get(`spcm.common.sourceCode.purchaseRequisition`)
          .d('采购申请');
        headerInfo.pcSourceCode = 'PURCHASE_NEED';
        headerInfo.prCurrencyCode = selectedRows[0]?.currencyCode;
        // 合并协议标行
        const contractSubjects = cloneDeep(selectedRows).map((_subject) => {
          const subject = _subject;
          subject.neededDate =
            subject.neededDate && moment(subject.neededDate).format(DEFAULT_DATE_FORMAT);
          subject.deliverDate = subject.neededDate;
          subject.address = subject.location;
          subject.sourceCode = subject.prNum;
          subject.sourceLineNum = subject.lineNum;
          subject.prLineNum = subject.lineNum;
          subject.occupiedQuantity = 0;
          // subject.quantity = subject.availableQuantity;
          // subject.secondaryQuantity = subject.secondaryAvailableQuantity;
          subject.specifications = subject.itemSpecs;
          subject.model = subject.itemModel;
          subject.uomCodeAndName = subject.uomName;
          subject.purchaseAgentName = subject.agentName;
          subject.purchaseAgentId = subject.agentId;

          subject.projectTaskId = subject.projectTaskId;
          subject.projectTaskName = subject.projectTaskName;
          subject.projectTaskEditFlag = subject.projectTaskId ? 0 : 1;
          return subject;
        });
        let purchaseNeedDTOs = { headerInfo, pcSubjectDataSource: contractSubjects };
        purchaseNeedDTOs = remote
          ? remote.process('SPCM_WORKSPACE_REF_DOC_PNEEDDTOS', purchaseNeedDTOs, {
              current: props,
            })
          : purchaseNeedDTOs;
        // 采购申请的数据存在本地 避免需求执行工作台跳进来无法带出头信息
        const itemKey = `spcm.workSpace.${Math.random()}`;
        window.sessionStorage.setItem(itemKey, JSON.stringify(purchaseNeedDTOs));

        if (enableSmartContract || enableOnlineAttachmentContract) {
          showManuallyModal({
            remote,
            enableSmartContract,
            dispatch,
            referenceKey: key,
            referenceFlag: true,
            _linkFlag,
            payload: headerInfo,
            docSource: 'purchaseNeed',
            searchParam: `?from=purchaseContract&itemKey=${itemKey}`,
            customizeForm,
          });
        } else {
          dispatch(
            routerRedux.push({
              pathname: `/spcm/contract-workspace/create`,
              search: `?from=purchaseContract&itemKey=${itemKey}`,
            })
          );
        }
      } else {
        if (remote) {
          // 此埋点用于处理引用寻源结果和引用采购订单的数据
          payload = await remote.process('SPCM_WORKSPACE_REF_DOC_SOURCEANDORDER_CREATE', payload, {
            currentProps: props,
            res,
            key,
            selectedRows,
          });
        }
        // 增加前置校验埋点，前置校验不通过，不允许新建
        if (remote) {
          const validateFlag = await remote.process(
            'SPCM_WORKSPACE_REF_DOC_CREATE_VALIDATE',
            true,
            {
              payload,
              currentProps: props,
              res,
              key,
              selectedRows,
            }
          );
          if (!validateFlag) {
            return false;
          }
        }
        if (key === 'sourcingResults') {
          payload = await handleSourceResultDTOs(payload?.sourceResultDTOs || []);
        }
        if (!payload) {
          return false;
        }
        dispatch({
          type: 'workSpace/updateState',
          payload,
        });
        if (enableSmartContract || enableOnlineAttachmentContract) {
          showManuallyModal({
            remote,
            enableSmartContract,
            dispatch,
            referenceKey: key,
            referenceFlag: true,
            _linkFlag,
            payload,
            customizeForm,
          });
        } else {
          dispatch(
            routerRedux.push({
              pathname: `/spcm/contract-workspace/create`,
            })
          );
        }
      }
    } else {
      return false;
    }
  };

  // useMemo 也是缓存，不会因为更新 函数再执行相应的new DataSet
  const purchaseOrderDs = useMemo(() => new DataSet(purchaseOrder()), []);
  const sourcingResultsDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process('SPCM_WORKSPACE_REF_DOC_SOURCE_RESULT_DS', sourcingResults(), {
              props,
              referenceActiveKey,
            })
          : sourcingResults()
      ),
    []
  );
  const purchaseNeedDs = useMemo(() => new DataSet(purchaseNeed()), []);
  const [suspendLoading, setSuspendLoading] = useState(false);
  // const [loadings, setLoadings] = useState({});

  // 这个用URErEF更好
  const dsMap = useMemo(
    () => ({
      purchaseOrderDs,
      sourcingResultsDs,
      purchaseNeedDs,
    }),
    []
  );

  // 这个用来设置请求loading有一些代码被我删除了
  // const loading = (state = {}) => {
  //   setLoadings((preState) => ({ ...preState, ...state }));
  // };

  // const handleQuery = () => {
  //   Object.keys(dsMap).forEach((i) => {
  //     dsMap[i].query();
  //   });
  // };

  useEffect(() => {
    if (roleActiveKey) {
      fetchSetting(); // 获取配置中心配置参数
    }
    fetchCommonVariableConfig();
    onTabChange(roleActiveKey || referenceActiveKey);
    fetchDoubleUnitFlag(); // 获取业务规则配置的双单位数据
  }, []);

  const fetchDoubleUnitFlag = async () => {
    const res = await queryCommonDoubleUomConfig();
    const linkFlag = await queryNewOrOldLink(); // 新链路标识
    setDoubleUnitEnabled(res);
    setLinkFlag(linkFlag);
    Object.keys(dsMap).forEach((i) => {
      dsMap[i].setState({ doubleUnitEnabled: res });
    });
  };

  const fetchSetting = () => {
    dispatch({
      type: 'workSpace/setting',
    });
  };

  /**
   * 查询是否在【引用寻源结果列表个性化字段填充协议头字段】-白名单中，不在白名单则去掉扩展字段
   */
  const handleSourceResultDTOs = async (selectedRows) => {
    const remoteSelectedRows = remote
      ? remote.process('SPCM_WORKSPACE_REF_DOC_SOURCE_RESULT_SELECTED_ROWS', selectedRows)
      : selectedRows;
    const res = getResponse(await referenceWhitelist());
    // Y-在白名单，无需去掉扩展字段，N-不在白名单，需要去掉扩展字段。
    if (res === 'N') {
      // 过滤掉所有扩展字段
      return {
        sourceResultDTOs: remoteSelectedRows.map((row) =>
          pickBy(row, (val, key) => !key.includes('attribute'))
        ),
      };
    } else if (res) {
      return {
        sourceResultDTOs: remoteSelectedRows,
      };
    }
    return false;
  };

  // 查看适用范围
  const viewApplicationOrgModal = (sourceAppScopeLineDTOs) => {
    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScope sourceAppScopeLineDTOs={sourceAppScopeLineDTOs} />,
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => cancelBtn,
      style: { width: '1200px' },
    });
  };

  // 引用寻源结果暂挂/取消暂挂
  const handleHold = (selectedRows) => {
    const one = selectedRows.every((item) => item.contractPendingFlag === '1');
    const zero = selectedRows.every((item) => item.contractPendingFlag === '0');
    if (!one && !zero) {
      return notification.warning({
        message: intl
          .get('sodr.sourceFrom.view.message.checkMark')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    setSuspendLoading(true);
    const resultList = selectedRows.map((n) => {
      return {
        ...n,
        suspendFlag: n.contractPendingFlag === '1' ? '0' : '1',
      };
    });
    return toSuspend(resultList)
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          sourcingResultsDs.query();
          sourcingResultsDs.batchUnSelect(sourcingResultsDs.selected);
        }
      })
      .finally(() => {
        setSuspendLoading(false);
      });
  };

  const getColumns = (key) => {
    switch (key) {
      // 明细-采购订单
      case 'purchaseOrder':
        return [
          {
            label: intl.get(`hzero.common.status`).d('状态'),
            name: 'displayStatusMeaning',
            width: 120,
            renderer: ({ record }) =>
              renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
          },
          {
            label: intl.get('ssta.purchaseSettle.common.poNums').d('采购订单编号-行号'),
            name: 'displayPoNum',
            width: 150,
            renderer: ({ value, record }) => `${value}-${record.get('displayLineNum')}`,
          },
          {
            name: 'projectTaskId',
            width: 150,
            renderer: ({ record }) => record.get('projectTaskName'),
          },
          {
            label: intl.get(`entity.supplier.code`).d('供应商编码'),
            name: 'supplierCode',
            width: 150,
            renderer: ({ record }) =>
              record.get('supplierCode') || record.get('supplierCompanyCode') || '-',
          },
          {
            label: intl.get(`entity.supplier.name`).d('供应商名称'),
            name: 'supplierName',
            fixed: 'left',
            width: 150,
            renderer: ({ record }) =>
              record.get('supplierName') || record.get('supplierCompanyName') || '-',
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.version`).d('版本'),
            name: 'versionNum',
            width: 60,
          },
          {
            label: intl.get('spcm.common.model.common.termId').d('付款条款'),
            name: 'termsName',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.releaseNum`).d('发放号'),
            name: 'releaseNum',
            width: 130,
          },
          // {
          //   label: intl.get(`sodr.sendOrder.model.common.lineNum`).d('行号'),
          //   name: 'displayLineNum',
          //   width: 60,
          // },
          {
            label: intl.get(`sodr.sendOrder.model.common.shipmentNum`).d('发运号'),
            name: 'displayLineLocationNum',
            width: 130,
          },
          {
            label: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
            name: 'itemCode',
            width: 130,
          },
          {
            label: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
            name: 'itemName',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.sendOrder.categoryName`).d('物料分类'),
            name: 'categoryId',
            width: 150,
            renderer: ({ record }) => record.get('categoryName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.oldItemCodeNum`).d('旧物料号'),
            name: 'oldItemCode',
            width: 130,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.quantity`).d('数量'),
            name: 'quantity',
            width: 120,
            align: 'right',
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'secondaryQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.netReceivedQuantity`).d('净接收'),
            name: 'netReceivedQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.netDeliverQuantity`).d('净入库'),
            name: 'netDeliverQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get('sodr.common.model.common.notInStorage').d('未入库'),
            name: 'notDeliverQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.invoicedQuantity`).d('已开票'),
            name: 'invoicedQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.afterTaxunitPrice2`).d('单价(不含税)'),
            name: 'unitPrice',
            align: 'right',
            width: 150,
            renderer: ({ value, record }) => {
              const count = countDecimals(value);
              return record.get('priceSensitiveFlag')
                ? '****'
                : isNumber(value) && !isNaN(value)
                ? numberRender(value, count <= 2 ? 2 : count)
                : '';
            },
          },
          {
            label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
            name: 'enteredTaxIncludedPrice',
            align: 'right',
            width: 150,
            renderer: ({ value, record }) => {
              const count = countDecimals(value);
              return record.get('priceSensitiveFlag')
                ? '****'
                : isNumber(value) && !isNaN(value)
                ? numberRender(value, count <= 2 ? 2 : count)
                : '';
            },
          },
          doubleUnitEnabled && {
            name: 'secondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          doubleUnitEnabled && {
            name: 'taxIncludedSecondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.lineAmount`).d('行金额(不含税)'),
            name: 'lineAmount',
            align: 'right',
            width: 150,
            renderer: ({ value, record }) => {
              const count = countDecimals(value);
              return record.get('priceSensitiveFlag')
                ? '****'
                : isNumber(value) && !isNaN(value)
                ? numberRender(value, count <= 2 ? 2 : count)
                : '';
            },
          },
          {
            label: intl.get(`spcm.common.model.common.taxIncludedLineAmount2`).d('行金额(含税)'),
            name: 'taxIncludedLineAmount',
            align: 'right',
            width: 150,
            renderer: ({ value, record }) => {
              const count = countDecimals(value);
              return record.get('priceSensitiveFlag')
                ? '****'
                : isNumber(value) && !isNaN(value)
                ? numberRender(value, count <= 2 ? 2 : count)
                : '';
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.unitPriceBatch`).d('每'),
            name: 'unitPriceBatch',
            width: 40,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'uomId',
            width: 60,
            renderer: ({ record }) => record.get('uomCodeAndName'),
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'secondaryUomId',
            width: 120,
            renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.taxCode`).d('税种'),
            name: 'taxCode',
            width: 60,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.currencyCode`).d('币种'),
            name: 'currencyCode',
            width: 60,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.needByDate`).d('需求日期'),
            name: 'needByDate',
            width: 150,
            renderer: ({ value }) => dateRender(value),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.promisedDate`).d('承诺日期'),
            name: 'promiseDeliveryDate',
            width: 150,
            renderer: ({ value }) => dateRender(value),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.specifications`).d('规格'),
            name: 'specifications',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.modelNum`).d('型号'),
            name: 'model',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.manufacturerName`).d('制造商'),
            name: 'manufacturerName',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.brand`).d('品牌'),
            name: 'brand',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.erpStatus`).d('ERP状态'),
            name: 'erpStatus',
            width: 130,
            renderer: ({ record }) => record.get('erpStatusMeaning'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.frozenStatus`).d('是否冻结'),
            name: 'frozenFlag',
            width: 130,
            renderer: ({ value }) => {
              return value === 1
                ? intl.get(`hzero.common.status.yes`).d('是')
                : intl.get(`hzero.common.status.no`).d('否');
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.consignedFlag`).d('是否寄售'),
            name: 'consignedFlag',
            width: 130,

            renderer: ({ value }) => {
              return value === 1
                ? intl.get(`hzero.common.status.yes`).d('是')
                : intl.get(`hzero.common.status.no`).d('否');
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.projectCategory`).d('是否委外'),
            name: 'projectCategory',
            width: 130,

            renderer: ({ value }) => {
              return value === 1
                ? intl.get(`hzero.common.status.yes`).d('是')
                : intl.get(`hzero.common.status.no`).d('否');
            },
          },
          // {
          //   label: intl.get(`sodr.sendOrder.model.common.returnedFlag`).d('是否退回'),
          //   name: 'returnedFlag',
          //   width: 130,

          //   renderer: ({ value }) => {
          //     return value === 1
          //       ? intl.get(`hzero.common.status.yes`).d('是')
          //       : intl.get(`hzero.common.status.no`).d('否');
          //   },
          // },
          {
            label: intl.get(`sodr.sendOrder.model.common.freeFlag`).d('是否免费'),
            name: 'freeFlag',
            width: 130,
            renderer: ({ record }) => record.get('freeMeaning'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.immedShippedFlag`).d('是否直发'),
            name: 'isImmedShippedFlag',
            width: 130,

            renderer: ({ value }) => {
              return value === 1
                ? intl.get(`hzero.common.status.yes`).d('是')
                : intl.get(`hzero.common.status.no`).d('否');
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.purchaserRemark`).d('采购方行备注'),
            name: 'remark',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.feedbackInfo`).d('反馈信息'),
            name: 'feedback',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.shipToThirdPartyName`).d('送达方'),
            name: 'shipToThirdPartyName',
            width: 150,
          },
          {
            label: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('地点'),
            name: 'shipToThirdPartyAddress',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.contactPersonInfo`).d('联系人信息'),
            name: 'shipToThirdPartyContact',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.supplierSite`).d('供应商地点'),
            name: 'supplierSiteId',
            width: 150,
            renderer: ({ record }) => record.get('supplierSiteName'),
          },
          {
            label: intl.get(`entity.company.tag`).d('公司'),
            name: 'companyName',
            width: 150,
          },
          {
            label: intl.get('entity.business.tag').d('业务实体'),
            name: 'ouId',
            width: 150,
            renderer: ({ record }) => record.get('ouName'),
          },
          {
            label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
            name: 'purchaseOrgId',
            width: 180,
            renderer: ({ record }) => record.get('purOrganizationName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.purchaseAgent`).d('采购员'),
            name: 'purchaseAgentId',
            width: 120,
            renderer: ({ record }) => record.get('purchaseAgentName'),
          },
          {
            label: intl.get(`entity.organization.class.receiving`).d('收货组织'),
            name: 'invOrganizationId',
            width: 180,
            renderer: ({ record }) => record.get('invOrganizationName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.inventoryName`).d('收货库房'),
            name: 'inventoryId',
            width: 180,
            renderer: ({ record }) => record.get('inventoryName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.locationName`).d('收货库位'),
            name: 'invLocationId',
            width: 120,
            renderer: ({ record }) => record.get('locationName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.billToLocationName`).d('收单方'),
            name: 'billToLocationId',
            width: 180,
            renderer: ({ record }) => record.get('billToLocationName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.creationTime`).d('创建时间'),
            name: 'erpCreationDate',
            width: 150,
            renderer: ({ value }) => dateTimeRender(value),
          },
          {
            label: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
            name: 'erpCreatedName',
            width: 120,
          },
          {
            label: intl.get(`sodr.common.model.common.department`).d('部门'),
            name: 'departmentId',
            width: 130,
            renderer: ({ record }) => record.get('departmentName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.releaseTime`).d('发布时间'),
            name: 'releasedDate',
            width: 150,
            renderer: ({ value }) => dateTimeRender(value),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.confirmedDate`).d('确认日期'),
            name: 'confirmedDate',
            width: 150,
            renderer: ({ value }) => dateRender(value),
          },
          {
            label: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
            name: 'urgentFlag',
            width: 130,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.urgentTime`).d('加急时间'),
            name: 'urgentDate',
            width: 150,
            renderer: ({ value }) => dateTimeRender(value),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.contractNum`).d('合同编号'),
            name: 'erpContractNum',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
            name: 'displayPrNum',
            width: 150,
            renderer: ({ record }) => {
              const displayPrNum = record.get('displayPrNum');
              const displayPrLineNum = record.get('displayPrLineNum');
              if (!displayPrNum && !displayPrLineNum) {
                return null;
              }
              return `${displayPrNum || ''}-${displayPrLineNum || ''}`;
            },
          },
          // {
          //   label: intl.get(`sodr.sendOrder.model.common.purchaseReqLineNum`).d('采购申请行号'),
          //   name: 'displayPrLineNum',
          //   width: 120,
          // },
          {
            label: intl.get(`sodr.sendOrder.model.common.productNum`).d('商品编码'),
            name: 'productNum',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.productName`).d('商品名称'),
            name: 'productName',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.commodityDirectory`).d('商品目录'),
            name: 'catalogName',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.sourceSystem`).d('来源系统'),
            name: 'poSourcePlatform',
            renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
          },
        ];
      case 'sourcingResults': // 寻源结果
        return [
          {
            label: intl.get(`sodr.workspace.model.common.sourceNumAndLines`).d('寻源单号-行号'),
            name: 'sourceNum',
            width: 150,
            renderer: ({ record }) => {
              return `${record.get('sourceNum')}-${record.get('itemNum')}`;
            },
          },
          {
            name: 'projectTaskId',
            width: 150,
            renderer: ({ record }) => record.get('projectTaskName'),
          },
          {
            label: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
            name: 'itemNum',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.companyNum`).d('企业编码'),
            name: 'companyNum',
            width: 150,
            renderer: ({ record }) => record.get('supplierCompanyNum'),
          },
          {
            label: intl.get('entity.company.name').d('公司名称'),
            name: 'supplierCompanyName',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.erpSupplierId`).d('ERP供应商编码'),
            name: 'supplierNum',
            width: 150,
          },
          {
            label: intl.get('spcm.common.model.common.erpSupplierName').d('ERP供应商名称'),
            name: 'supplierName',
            width: 150,
          },
          {
            label: intl.get('spcm.common.model.common.termId').d('付款条款'),
            name: 'termsName',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.stockOrg`).d('库存组织'),
            name: 'organizationName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.goodsNum`).d('物品编码'),
            name: 'itemCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.goodsName`).d('物品名称'),
            name: 'itemName',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.MaterialClassify`).d('物料分类'),
            name: 'categoryName',
            width: 170,
          },
          {
            label: intl.get(`spcm.common.model.common.currencyType`).d('币种'),
            name: 'currencyCode',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'uomName',
            width: 120,
            renderer: ({ record }) => record.get('uomCodeAndName'),
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'secondaryUomId',
            renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'quantity',
            width: 120,
            align: 'right',
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'secondaryQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.occupyQuantity`).d('占用数量'),
            name: 'occupationQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
            name: 'availableQuantity',
            width: 120,
            align: 'right',
            renderer: ({ record }) =>
              doubleUnitEnabled
                ? record.get('secondaryAvailableQuantity')
                : record.get('availableQuantity'),
          },
          {
            label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
            name: 'taxRate',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.noTaxPrice2`).d('单价(不含税)'),
            name: 'unitPrice',
            width: 120,
            align: 'right',
          },
          doubleUnitEnabled && {
            name: 'secondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.noTaxAmount2`).d('金额(不含税)'),
            name: 'amountExcludingTax',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.TaxPrice2`).d('单价(含税)'),
            name: 'taxIncludedUnitPrice',
            width: 120,
            align: 'right',
          },
          doubleUnitEnabled && {
            name: 'taxIncludedSecondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.TaxAmount2`).d('金额(含税)'),
            name: 'taxAmount',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.promiseDate`).d('承诺交货日期'),
            name: 'validPromisedDate',
            width: 120,
            renderer: ({ value }) => dateRender(value),
          },
          {
            label: intl.get(`spcm.common.model.common.ladderOffer`).d('阶梯报价'),
            name: 'ladderOffer',
            width: 120,
            // renderer: ({ record }) => {
            //   return record.get('quotationLineId') ? (
            //     <LadderOfferModal record={record} dispatch={dispatch}>
            //       <a>{intl.get(`spcm.common.model.common.ladderOffer`).d('阶梯报价')}</a>
            //     </LadderOfferModal>
            //   ) : null;
            // },
            renderer: ({ record }) =>
              record.get('quotationLineId') ? (
                <a
                  onClick={() =>
                    showLadderQuote({
                      editable: false,
                      doubleUnitEnabled,
                      sourceInfo: record.toJSONData(),
                    })
                  }
                >
                  {intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格')}
                </a>
              ) : (
                '-'
              ),
          },
          {
            label: intl.get(`entity.company.tag`).d('公司'),
            name: 'companyName',
            width: 120,
          },
          {
            label: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
              .d('适用其他组织'),
            name: 'sourceAppScopeLineDTOs',
            width: 120,
            renderer: ({ value }) => {
              return (
                <a onClick={() => viewApplicationOrgModal(value)} disabled={!value}>
                  {intl
                    .get('ssrc.inquiryHall.model.inquiryHall.applicationOrganization')
                    .d('适用其他组织')}
                </a>
              );
            },
          },
          {
            label: intl.get(`entity.business.tag`).d('业务实体'),
            name: 'ouName',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
            name: 'purchaseOrganizatioName',
            width: 120,
          },
          // {
          //   label: intl.get(`spcm.common.model.common.buyer`).d('采购员'),
          //   name: 'purchaseAgentName',
          //   width: 120,
          // },
          {
            label: intl.get(`entity.roles.creator`).d('创建人'),
            name: 'realName',
            width: 120,
          },
          {
            label: intl.get(`hzero.common.date.creation`).d('创建时间'),
            name: 'creationDate',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
            name: 'prLineNum',
            width: 150,
            renderer: ({ record }) => {
              const prNum = record.get('prNum');
              const prLineNum = record.get('prLineNum');
              if (!prNum && !prLineNum) {
                return null;
              }
              return `${prNum || ''}-${prLineNum || ''}`;
            },
          },
          {
            label: intl
              .get(`spcm.common.model.common.displayPrNumLineNum`)
              .d('采购申请展示单号-行号'),
            name: 'prDisplayLineNum',
            width: 150,
            renderer: ({ record }) => {
              const { prDisplayNum, prDisplayLineNum } =
                record?.get(['prDisplayNum', 'prDisplayLineNum']) || {};
              if (!prDisplayNum && !prDisplayLineNum) {
                return null;
              }
              return `${prDisplayNum || ''}-${prDisplayLineNum || ''}`;
            },
          },
          {
            label: intl.get(`spcm.common.model.common.rfxRoleMan`).d('核价员'),
            name: 'rfxRoleMan',
            width: 120,
          },
          {
            label: intl.get(`hzero.common.remark`).d('备注'),
            name: 'itemRemark',
            width: 120,
          },
          {
            name: 'sourceItemRemark',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.contractPendingFlag`).d('是否暂挂'),
            name: 'contractPendingFlag',
            width: 100,
            renderer: ({ record }) => record.get('contractPendingFlagMeaning'),
          },
          {
            label: intl.get(`spcm.common.model.common.resultStatusSet`).d('寻源结果状态'),
            name: 'resultStatus',
            width: 150,
            renderer: ({ record }) => record.get('resultStatusMeaning'),
          },
          {
            name: 'occupyStatus',
            width: 150,
          },
        ];
      case 'purchaseNeed': // 采购申请
        return [
          {
            label: intl.get(`spcm.common.model.common.prNumAndLine`).d('采购申请编号-行号'),
            name: 'prNum',
            width: 160,
            renderer: ({ value, record }) => (
              <>
                {`${value}-${record.get('displayLineNum')}`}
                {record.get('urgentFlag') && Number(record.get('urgentFlag')) ? (
                  <Tooltip title={intl.get(`sprm.common.model.common.urgent`).d('申请加急')}>
                    <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                  </Tooltip>
                ) : null}
              </>
            ),
          },
          {
            name: 'projectTaskId',
            width: 150,
            renderer: ({ record }) => record.get('projectTaskName'),
          },
          // {
          //   label: intl.get(`spcm.common.model.lineNum`).d('行号'),
          //   name: 'lineNum',
          //   width: 160,
          // },
          _linkFlag && {
            label: intl.get(`spcm.common.model.common.transferredDocumentType`).d('协议执行类型'),
            name: 'transferredDocumentTypeVOList',
            width: 230,
            renderer: ({ record }) => {
              const transferredDocumentTypeVOList = record?.get('transferredDocumentTypeVOList');
              return transferredDocumentTypeVOList?.map((item) => item?.typeCodeMeaning);
            },
          },
          {
            label: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
            name: 'itemCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
            name: 'itemName',
            width: 160,
          },
          {
            name: 'orderSupplierLov',
            width: 160,
            editor: true,
          },
          {
            label: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
            name: 'categoryName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
            name: 'taxIncludedUnitPrice',
            width: 160,
            align: 'right',
            renderer: ({ value }) => numberRender(value, 2),
          },
          doubleUnitEnabled && {
            name: 'taxIncludedSecondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.taxType`).d('税种'),
            name: 'taxCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
            name: 'taxRate',
            width: 160,
            align: 'right',
            renderer: ({ value }) => numberRender(value, 2),
          },
          {
            label: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
            name: 'currencyCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'uomName',
            width: 160,
            renderer: ({ record }) => record.get('uomCodeAndName'),
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'secondaryUomId',
            width: 120,
            renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
          },
          {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'quantity',
            width: 160,
            align: 'right',
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'secondaryQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
            name: 'availableQuantity',
            width: 160,
            align: 'right',
            renderer: ({ record }) =>
              doubleUnitEnabled
                ? record.get('secondaryAvailableQuantity')
                : record.get('availableQuantity'),
          },
          {
            label: intl.get(`spcm.common.model.executionStatusCode`).d('执行状态'),
            name: 'executionStatusCodeMeaning',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.reqTypeCode`).d('申请类型'),
            name: 'reqTypeCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.supplierCode`).d('供应商编码'),
            name: 'supplierCode',
            width: 160,
            renderer: ({ record }) => (
              <span>{record.get('supplierCode') || record.get('supplierCompanyCode') || '-'}</span>
            ),
          },
          {
            label: intl.get(`spcm.common.model.supplierName`).d('供应商名称'),
            name: 'supplierName',
            width: 160,
            renderer: ({ record }) => (
              <span>{record.get('supplierName') || record.get('supplierCompanyName') || '-'}</span>
            ),
          },
          {
            label: intl.get(`spcm.common.model.companyName`).d('公司'),
            name: 'companyName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
            name: 'ouName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织'),
            name: 'purchaseOrgName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.purchaseOrgGroupName`).d('采购员'),
            name: 'agentName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.invOrganizationName`).d('库存组织'),
            name: 'invOrganizationName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.productNum`).d('商品编码'),
            name: 'productNum',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.productName`).d('商品名称'),
            name: 'productName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.catalogName`).d('商品目录'),
            name: 'catalogName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.prRequestedName`).d('申请人'),
            name: 'prRequestedName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.telNum`).d('联系电话'),
            name: 'contactTelNum',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.invoiceAddress`).d('收货方地址'),
            name: 'invoiceAddress',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.neededDate`).d('需求日期'),
            name: 'neededDate',
            width: 160,
            renderer: ({ value }) => dateRender(value, 2),
          },
          {
            label: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
            name: 'companyOrgName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
            name: 'costAnchDepDesc',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.expBearDep`).d('费用承担部门'),
            name: 'expBearDep',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.location`).d('地点'),
            name: 'addressMeaning',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.projectCode`).d('项目编码'),
            name: 'projectNum',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.projectName`).d('项目名称'),
            name: 'projectName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.prSourcePlatformMeaning`).d('来源平台'),
            name: 'prSourcePlatformMeaning',
            width: 160,
          },
          {
            label: intl.get('spcm.common.model.executorName').d('需求执行人'),
            name: 'executorName',
            width: 160,
          },
          // {
          //   label: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
          //   name: 'urgentFlag',
          //   width: 160,
          //   renderer: ({ value }) => yesOrNoRender(value),
          // },
          {
            label: intl.get(`spcm.common.model.urgentDate`).d('加急时间'),
            name: 'urgentDate',
            renderer: ({ value }) => dateTimeRender(value, 2),
          },
          {
            label: intl.get(`hzero.common.date.creation`).d('创建时间'),
            name: 'creationDate',
            width: 160,
            renderer: ({ value }) => dateTimeRender(value, 2),
          },
        ];
      default:
        // 整单-采购申请
        return [];
    }
  };

  const onQuery = ({ filter: { unitCode }, params, dataSet }, ds) => {
    // 获取 searchCode 对应的筛选器缓存
    const queryArr = [
      'needByDateStart',
      'needByDateEnd',
      'releasedDateStart',
      'releasedDateEnd',
      'erpCreationDateStart',
      'erpCreationDateEnd',
      'urgentDateStart',
      'urgentDateEnd',
      'promiseDeliveryDateStart',
      'promiseDeliveryDateEnd',
    ];
    const queryDsData = getSearchBarCache(unitCode)?.queryDsData || {};
    const { supplierId } = queryDsData.supplierCompanyId || {};
    const { supplierCompanyId } = params || {};
    const otherParams = supplierCompanyId ? dataSet.getState('params') : null;
    queryArr.forEach((item) => {
      if (params[item]) {
        // eslint-disable-next-line no-param-reassign
        params[item] = moment(params[item]).format(DATETIME_MIN);
      }
    });
    const allParams = {
      ...params,
      multiSelectHeaderAndLineNums: params?.multiSelectHeaderAndLineNums?.toString(),
    };
    if (!ds?.queryDataSet) return;
    ds.queryDataSet.loadData([{ ...allParams, supplierId, supplierCompanyId, ...otherParams }]);
    ds.query();
  };
  const onQuerySourcing = ({ filter: { unitCode }, params, dataSet }, ds) => {
    // 获取 searchCode 对应的筛选器缓存
    const queryArr = ['createDateFrom', 'createDateTo'];
    const queryDsData = getSearchBarCache(unitCode)?.queryDsData || {};
    const { supplierId } = queryDsData.supplierCompanyId || {};
    const { supplierCompanyId } = params || {};
    const otherParams = supplierCompanyId ? dataSet.getState('params') : null;
    queryArr.forEach((item) => {
      if (params[item]) {
        // eslint-disable-next-line no-param-reassign
        params[item] = moment(params[item]).format(DATETIME_MIN);
      }
    });
    if (!ds?.queryDataSet) return;
    ds.queryDataSet.loadData([{ ...params, supplierId, supplierCompanyId, ...otherParams }]);
    ds.query();
  };

  // 应该是供应商特别的LOV造成的，需要做特别的处理
  const onFieldChange = ({ name, value, dataSet }) => {
    if (name === 'tempKey') {
      const { supplierCompanyId, supplierId, supplierTenantId } = value || {};
      dataSet.setState({ params: { supplierId, supplierCompanyId, supplierTenantId } });
    }
    if (name === 'supplierCompanyId') {
      const { supplierCompanyId, supplierId, supplierTenantId } = value || {};
      dataSet.setState({ params: { supplierId, supplierCompanyId, supplierTenantId } });
    }
  };

  const handleUpdateSupplier = async () => {
    const { selected } = purchaseNeedDs;
    const selectedData = (selected || []).map((i) => i.toData());
    if (!isEmpty(selectedData)) {
      purchaseNeedDs.status = 'loading';
      const res = await fetchRecommendSupplier(selectedData);
      purchaseNeedDs.status = 'ready';
      if (getResponse(res)) {
        if (res && isArray(res)) {
          (selected || []).forEach((i) => {
            const currentLine = res.find((t) => t.prLineId === i.get('prLineId'));
            if (currentLine) {
              const {
                uomId,
                uomName,
                uomCode,
                uomCodeAndName,
                currencyCode,
                taxId,
                taxRate,
                netPrice,
                priceLibId,
                priceLibraryId,
                taxIncludedPrice,
                enteredTaxIncludedPrice,
                unitPriceBatch,
                selectSupplierCompanyId,
                selectSupplierCode,
                selectSupplierCompanyName,
                selectLocalSupplierName,
                selectLocalSupplierCode,
                selectLocalSupplierId,
                selectSupplierTenantId,
              } = currentLine || {};
              const originValues = {
                uomId,
                uomCode,
                uomName,
                uomCodeAndName,
                currencyCode,
                taxId,
                taxRate,
                priceLibraryStatus: 'VALID', // 批量更新价格库状态就是有效的
                selectLocalSupplierCode,
                unitPriceBatch,
                unitPrice: netPrice,
                enteredTaxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
                // 以下是orderSupplierLov lov字段
                selectSupplierCompanyId,
                selectSupplierCode,
                selectSupplierCompanyName: isNil(selectSupplierCompanyName)
                  ? selectLocalSupplierName
                  : selectSupplierCompanyName,
                selectSupplierTenantId,
                selectLocalSupplierId,
                selectLocalSupplierName,
                priceLibraryId,
                priceLibId,
                selectDisplaySupplierCompanyName: isNil(selectSupplierCompanyName)
                  ? selectLocalSupplierName
                  : selectSupplierCompanyName,
              };
              i.set(originValues);
            }
          });
        }
      }
    }
  };

  const getSearchBarTableCuxProps = (key, params) => {
    return remote
      ? remote.process('SPCM_WORKSPACE_REF_DOC_PROCESS_SEARCHBAR_TABLE_CUXPROPS', params, {
          key,
          params,
          props,
        })
      : params;
  };

  // useCallback 是一种缓存 函数的方法，但是里面不能使用STATE
  const getTableRender = useCallback((key) => {
    switch (key) {
      case 'purchaseOrder':
        return customizeTable(
          { code: 'SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER', lovIgnore: false },
          <SearchBarTable
            // cacheState
            searchCode="SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER.FILTER"
            dataSet={purchaseOrderDs}
            columns={getColumns('purchaseOrder')}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchBarConfig={{
              onQuery: (e) => onQuery(e, purchaseOrderDs),
              onFieldChange,
              editorProps: {},
              fieldProps: {
                itemCode: {
                  lovPara: { tenantId },
                },
                tempKey: {
                  lovPara: { tenantId },
                },
                itemCodes: {
                  lovPara: { tenantId, organizationId },
                },
                executedByName: {
                  lovPara: {
                    tenantId,
                  },
                },
                companyId: {
                  lovPara: {
                    tenantId,
                  },
                },
                supplierSiteId: {
                  lovQueryAxiosConfig: (code, config, { data: { supplierId } }) => {
                    return {
                      url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-sites/${supplierId}`,
                      method: 'GET',
                    };
                  },
                  dynamicProps: {
                    lovPara: ({ record }) => ({
                      tenantId,
                      supplierId: record.get('tempKey')?.supplierId,
                    }),
                    disabled: ({ record }) => !record.get('tempKey')?.supplierId,
                  },
                },
              },
            }}
          />
        );
      case 'sourcingResults':
        return customizeTable(
          { code: 'SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS' },
          <SearchBarTable
            // cacheState
            searchCode="SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS.FILTER"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            {...getSearchBarTableCuxProps(key, {
              columns: getColumns('sourcingResults'),
              dataSet: sourcingResultsDs,
              searchBarConfig: {
                onQuery: (e) => onQuerySourcing(e, sourcingResultsDs),
                onFieldChange,
                editorProps: {
                  pendingFlag: {
                    clearButton: false,
                  },
                },
                fieldProps: {
                  supplierCompanyId: {
                    lovPara: { tenantId },
                  },
                  itemCode: {
                    lovPara: { tenantId },
                  },
                },
              },
            })}
          />
        );
      default:
        return customizeTable(
          { code: 'SPCM.WORKSPACE_DOCUMENT.PURCHASENEED2', lovIgnore: false },
          <SearchBarTable
            // cacheState
            searchCode="SPCM.WORKSPACE_DOCUMENT.PURCHASENEED2.FILTER"
            dataSet={purchaseNeedDs}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            columns={getColumns('purchaseNeed')}
            searchBarConfig={{
              onQuery: (e) => onQuery(e, purchaseNeedDs),
              onFieldChange,
              fieldProps: {
                supplierCompanyId: {
                  lovPara: { tenantId },
                },
                itemCode: {
                  lovPara: { tenantId },
                },
              },
              left: {
                render: (_, dataSet) => (
                  <MutlTextFieldSearch
                    name="multiSelectHeaderAndLineNums"
                    dataSet={dataSet}
                    placeholder={intl
                      .get('spcm.common.modal.prNum-lineNum.query')
                      .d('请输入采购申请编号-行号查询')}
                  />
                ),
              },
            }}
          />
        );
    }
  });

  // 这里需要设置一个当前CURRY的ds,
  const onTabChange = async (key) => {
    currentDs.current = dsMap[`${key}Ds`];
    setReferenceActiveKey(key);
    dispatch({
      type: 'workSpace/updateState',
      payload: { referenceActiveKey: key },
    });
    updateFooter(key);
  };

  /**
   * 获取新链路寻源转协议-按筛选条件全选创建按钮是否显示
   * @param {*} key
   */
  const fetchCommonVariableConfig = async () => {
    const res = await getCommonVariableConfig({
      variableCode: 'SPCM_SR_TO_PC_ALL_SELECT',
      enableFlag: 1,
    });
    if (getResponse(res)) {
      sourcingResultsDs.showAllCreateBtn = res?.content?.length > 0;
    }
  };

  /**
   * 全选新建
   */
  const allSelectCreate = async () => {
    const dsParams = sourcingResultsDs?.queryDataSet?.toData()[0];
    const res = await getSourceResultsAndCheckMerge(dsParams);
    if (remote?.event) {
      const cuxRes = await remote.event.fireEvent('cuxAllSelectCreate', {
        currentProps: props,
        res,
      });
      if (!cuxRes) {
        return;
      }
    }
    if (getResponse(res) && res.length > 0) {
      // 去掉适用范围
      const filterRes = res.map((i) => {
        const { sourceAppScopeLineDTOs, ...others } = i;
        return {
          ...others,
          sourceAppScopeLineDTOs: null,
        };
      });
      dispatch({
        type: 'workSpace/updateState',
        payload: {
          sourceResultDTOs: filterRes,
        },
      });
      dispatch(
        routerRedux.push({
          pathname: `/spcm/contract-workspace/create`,
        })
      );
    }
  };

  const getBtns = (key) => {
    let Btns;
    // eslint-disable-next-line prefer-const
    Btns = observer(({ dataSet }) => {
      const selectedRows = currentDs.current?.selected.map((item) => item.toData()) || [];
      let hasDifferent = '';
      if (key === 'sourcingResults') {
        const data = dataSet?.toData();
        hasDifferent = data?.every((i) => i.contractPendingFlag === '0');
      }
      const btnList = [
        {
          name: 'create',
          child: intl.get('spcm.common.button.create').d('新建'),
          btnProps: {
            color: 'primary',
            disabled: isEmpty(selectedRows) && selectedRows.length === 0,
            onClick: () => onOk(key),
            type: 'c7n-pro',
          },
        },
        key === 'sourcingResults' &&
          sourcingResultsDs?.showAllCreateBtn && {
            name: 'allSelectCreate',
            child: intl.get('spcm.common.button.allSelectCreate').d('全选新建'),
            btnProps: {
              onClick: () => allSelectCreate(key),
              disabled: isEmpty(dataSet.data),
              type: 'c7n-pro',
            },
          },
        key === 'sourcingResults' &&
          hasDifferent && {
            name: 'hold',
            btnComp: PermissionButton,
            child: intl.get(`hzero.common.button.hold`).d('暂挂'),
            btnProps: {
              type: 'c7n-pro',
              loading: suspendLoading,
              disabled: selectedRows.length === 0,
              onClick: () => handleHold(selectedRows),
              permissionList: [
                {
                  code: 'srm.pc-admin.pc-purchaser.workspace2.ps.suspend',
                  type: 'button',
                  meaning: '暂挂',
                },
              ],
            },
          },
        key === 'sourcingResults' &&
          !hasDifferent && {
            name: 'cancelHold',
            btnComp: PermissionButton,
            child: intl.get(`hzero.common.button.cancelHold`).d('取消暂挂'),
            btnProps: {
              type: 'c7n-pro',
              loading: suspendLoading,
              disabled: selectedRows.length === 0,
              onClick: () => handleHold(selectedRows),
              permissionList: [
                {
                  code: 'srm.pc-admin.pc-purchaser.workspace2.ps.cancel-suspend',
                  type: 'button',
                  meaning: '取消暂挂',
                },
              ],
            },
          },
        {
          name: 'cancel',
          child: intl.get('hzero.common.button.cancel').d('取消'),
          btnProps: {
            onClick: close,
            type: 'c7n-pro',
          },
        },
        key === 'purchaseNeed' && {
          name: 'recommendSupplier',
          child: intl.get('spcm.common.button.updateRecommendSupplier').d('更新推荐供应商'),
          btnProps: {
            disabled: isEmpty(selectedRows) && selectedRows.length === 0,
            onClick: handleUpdateSupplier,
            type: 'c7n-pro',
          },
        },
      ].filter(Boolean);
      const cuxButtons = remote
        ? remote.process('SPCM_WORKSPACE_REF_DOC_BUTTONS', btnList, {
            props,
            dataSet,
            key,
            selectedRows,
          })
        : btnList;
      return customizeBtnGroup(
        {
          code: key === 'purchaseNeed' ? 'SPCM.WORKSPACE_DOCUMENT.PURCHAS_ENEED_TABLE_BTNS' : '',
          pro: true,
        },
        <DynamicButtons buttons={cuxButtons} defaultBtnType="c7n-pro" />
      );
    });
    return <Btns dataSet={currentDs.current} />;
  };

  const updateFooter = (key) => {
    update({
      footer: <div>{getBtns(key)}</div>,
    });
  };

  const tabsProps = remote
    ? remote.process(
        'SPCM_WORKSPACE_REF_DOC_PROCESS_TABSPROPS',
        {},
        {
          activeKey: referenceActiveKey,
          dataSet: currentDs.current,
          currentProps: props,
        }
      )
    : {};

  return customizeTabPane(
    {
      code: 'SPCM.WORKSPACE_DOCUMENT.TABS',
    },
    <Tabs keyboard={false} activeKey={referenceActiveKey} onChange={onTabChange} {...tabsProps}>
      {dsPoFlag && (
        <TabPane
          key="purchaseOrder"
          count={() => !purchaseOrderDs.counting && purchaseOrderDs.totalCount}
          tab={intl.get(`spcm.common.button.quotePurchaseOrder`).d('引用采购订单')}
        >
          <div style={{ height: 'calc(100vh - 210px)' }}>{getTableRender('purchaseOrder')}</div>
        </TabPane>
      )}
      {dsFrFlag && (
        <TabPane
          key="sourcingResults"
          count={() => !sourcingResultsDs.counting && sourcingResultsDs.totalCount}
          tab={intl.get(`spcm.contractMaintain.view.button.quoteCreateOrder`).d('引用寻源结果')}
        >
          <div style={{ height: 'calc(100vh - 210px)' }}>{getTableRender('sourcingResults')}</div>
        </TabPane>
      )}
      {dsPrFlag && (
        <TabPane
          key="purchaseNeed"
          count={() => !purchaseNeedDs.counting && purchaseNeedDs.totalCount}
          tab={intl.get(`sodr.workspace.view.tabPane.purchaseRequest`).d('引用采购申请')}
        >
          <div style={{ height: 'calc(100vh - 210px)' }}>{getTableRender('purchaseNeed')}</div>
        </TabPane>
      )}
      {remote
        ? remote.process('SPCM_WORKSPACE_DOCUMENT_TABS', null, {
            props,
            referenceActiveKey,
            setReferenceActiveKey,
            dsMap,
            getColumns,
            onFieldChange,
            onQuery,
            tenantId,
            organizationId,
            customizeTable,
          })
        : null}
    </Tabs>
  );
};

export default compose(
  connect(({ workSpace }) => ({
    workSpace,
  })),
  formatterCollections({
    code: [
      'spcm.workspace',
      'spcm.common',
      'ssta.purchaseSettle',
      'sodr.workspace',
      'spcm.contractMaintain',
      'entity.supplier',
      'sodr.sendOrder',
      'sprm.common',
      'entity.business',
    ],
  }),
  withCustomize({
    unitCode: [
      'SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS',
      'SPCM.WORKSPACE_DOCUMENT.PURCHASENEED2',
      'SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER',
      'SPCM.WORKSPACE_DOCUMENT.TABS',
      'SPCM.WORKSPACE_COMMON.CREATE_MODAL', // 智能提取新建侧弹窗
      'SPCM.WORKSPACE_DOCUMENT.PURCHAS_ENEED_TABLE_BTNS', // 采购申请，表格按钮组
    ],
  }),
  hocRemote(
    {
      code: 'SPCM_WORKSPACE_REF_DOC',
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        // 文件上传类型监控
        handleCheckFileType: undefined,
        // 文件上传成功回调
        handleCuxGetExtractResult({ response }) {
          return getResponse(response);
        },
      },
      events: {
        handleCuxCreateValid() {},
        // 全选新建埋点处理
        cuxAllSelectCreate() {},
      },
    }
  ),
  observer
)(ReferenceDocument);
