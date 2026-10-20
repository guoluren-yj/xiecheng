/*
 * ReferenceDocument - 引用单据创建
 * @date: 2021/05/08 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useEffect, useCallback, useState, useMemo } from 'react';
import { compose, isEmpty, isArray, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { DataSet, Lov, Modal, Icon, Tooltip } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { connect } from 'dva';
import { parse } from 'querystring';
import remotes from 'utils/remote';
import DocFlow from '_components/DocFlow';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { Button } from 'components/Permission';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { MutlTextFieldSearch } from '@/routes/components/MultipleSearch';
import C7nPriceModal from '@/routes/components/C7nPriceModal';
import { PermissionDoubleTabs } from '@/routes/components/Permission';
import { formatAumont, getDisplayDocAndDocFlow } from '@/routes/components/utils';
import { useAmountRender, usePriceRender } from '@/routes/OrderWorkspace/hooks';
import {
  check,
  pendingFlag,
  sourePending,
  soureCancelPending,
  createCombineOrder,
  queryDoubleUomConfig,
  createCombineProtocol,
  getSupplier,
  poFromPrLineNewCheck,
} from '@/services/orderWorkspaceService';
import PurchaseRequest from './PurchaseRequest';
import SourcingResults from './SourcingResults';
import PurchaseAgreement from './PurchaseAgreement';
import {
  wholePurchaseRequest,
  purchaseRequest,
  sourcingResults,
  purchaseAgreement,
} from './store/referenceDocumentDs';
import remoteConfig from './remote';
import styles from './index.less';

const { TabPane, TabGroup } = Tabs;
const ReferenceDocument = (props) => {
  const {
    history,
    dispatch,
    referKey,
    orderWorkSpace,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    modal: { update, close },
    location,
    remote,
  } = props;
  const {
    referenceRedioKey,
    referenceActiveKey,
    referenceDetailActiveKey,
    // referenceInitFlag, 废弃
  } = orderWorkSpace;
  const { roleWorkbenchTable } = location ? parse(location?.search.substr(1)) : false;

  const wholePurchaseRequestDs = useMemo(() => new DataSet(wholePurchaseRequest()), []);
  const purchaseRequestDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process('purchaseRequestDsProps', purchaseRequest({ remote }))
          : purchaseRequest()
      ),
    []
  );
  const sourcingResultsDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SODR.WORKSPACE_REFERENCEDOCUMENT_PROCESS_SOURCING_RESULT_DS',
              sourcingResults({ remote })
            )
          : sourcingResults({ remote })
      ),
    []
  );
  const purchaseAgreementDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SODR.WORKSPACE_REFERENCEDOCUMENT_PROCESS_PURCHASE_AGREEMENT_DS',
              purchaseAgreement()
            )
          : purchaseAgreement()
      ),
    []
  );
  const [loadings, setLoadings] = useState({});
  const [doubleUnitEnabled, setDoubleUnit] = useState(0);
  const [displayDocAndDocFlow, setDisplayDocAndDocFlow] = useState({}); // 单据流与关联单据显示配置
  const searchBarRefs = useMemo(() => new Map(), []);
  const loading = (state = {}) => {
    setLoadings((preState) => ({ ...preState, ...state }));
  };

  useEffect(() => {
    queryDoubleUom();
    getDisplayDocAndDocFlow(setDisplayDocAndDocFlow);
    sourcingResultsDs.setState('sortRecords', []); // 用户手动勾选的依次排序记录
  }, []);

  useEffect(() => {
    updateFooter(referenceRedioKey === 'detail' ? referenceDetailActiveKey : referenceActiveKey);
  }, [referenceRedioKey, referenceDetailActiveKey, referenceActiveKey]);

  // 查询业务规则定义双单位配置
  const queryDoubleUom = () => {
    loading({ queryDoubleUom: true });
    queryDoubleUomConfig().then((res) => {
      loading({ queryDoubleUom: false });
      if (getResponse(res)) {
        setDoubleUnit(Number(res));
      }
    });
  };

  const updateFooter = (key) => {
    // 非标准页签底部留白
    const standardTabKeys = Object.keys(wholeDetails);
    const footer = standardTabKeys.includes(key) ? (
      <div>
        {getBtns(key)}
        {key !== 'purchaseRequest' && (
          <Button type="c7n-pro" onClick={close}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        )}
      </div>
    ) : (
      remote?.process('updateFooter', null, { key })
    );
    update({
      footer,
    });
  };

  const loadingDs = (_ds, flag) => {
    // eslint-disable-next-line no-param-reassign
    _ds.status = !!flag === true ? 'submitting' : 'ready';
  };

  const openC7nPriceModal = (params) => {
    Modal.open({
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
      children: (
        <C7nPriceModal
          params={params}
          customizeTable={customizeTable}
          code="SODR.WORKSPACE_PURCHASEREQUEST.REFERENCE_PRICE"
        />
      ),
      closable: true,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const getColumns = (key) => {
    switch (key) {
      // 明细-采购申请
      case 'purchaseRequest':
        return [
          {
            name: 'prNum',
            width: 200,
          },
          {
            name: 'displayLineNum',
            width: 80,
          },
          {
            name: 'itemCode',
            width: 120,
          },
          {
            name: 'itemName',
            width: 120,
          },
          {
            name: 'referencePrice',
            width: 120,
            renderer: ({ record }) => {
              const itemCode = record.get('itemCode');
              const prSourcePlatform = record.get('prSourcePlatform');
              const referencePriceDisplayFlag = record.get('referencePriceDisplayFlag');
              const params = {};
              [
                'companyId',
                'itemId',
                'ouId',
                'invOrganizationId',
                'purchaseOrgId',
                'uomId',
                'prLineId',
                'orderTypeId',
                'orderTypeCode',
                'categoryId',
              ].forEach((i) => {
                params[i] = record.get(i);
              });
              if (itemCode && prSourcePlatform !== 'CATALOGUE' && referencePriceDisplayFlag) {
                // return <C7nPriceModal params={params} />;
                return (
                  <a onClick={() => openC7nPriceModal(params)}>
                    {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
                  </a>
                );
              }
            },
          },
          {
            name: 'orderSupplierLov',
            width: 200,
            editor: (record) =>
              ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform')) ? <Lov /> : false,
            renderer: ({ record }) =>
              ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))
                ? record.get('selectDisplaySupplierCompanyName')
                : record.get('supplierName'),
          },
          doubleUnitEnabled && {
            name: 'secondaryQuantity',
            width: 150,
          },
          {
            name: 'quantity',
            width: 150,
          },
          {
            name: 'thisOrderQuantity',
            width: 120,
            editor: (record) => record.isSelected,
          },
          {
            name: 'restPoQuantity',
            width: 120,
          },
          doubleUnitEnabled && {
            name: 'secondaryUomName',
            width: 130,
            renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
          },
          {
            name: 'uomName',
            width: 130,
            renderer: ({ record }) => record.get('uomCodeAndName'),
          },
          {
            name: 'neededDate',
            width: 150,
          },
          {
            name: 'noUnitPrice',
            width: 110,
            renderer: ({ value, record }) =>
              ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))
                ? formatAumont(value, record.get('defaultPrecision'))
                : formatAumont(record.get('unitPrice'), record.get('defaultPrecision')),
          },
          {
            name: 'currencyCode',
            width: 150,
          },
          {
            name: 'taxIncludedUnitPrice',
            width: 120,
            renderer: usePriceRender(),
          },
          {
            name: 'supplierCode',
            width: 110,
          },
          {
            name: 'supplierName',
            width: 150,
          },
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'ouName',
            width: 200,
          },
          {
            name: 'purchaseOrgName',
            width: 200,
          },
          {
            name: 'invOrganizationName',
            width: 200,
          },
          {
            name: 'prTypeName',
            width: 150,
          },
          {
            name: 'categoryName',
            width: 200,
          },
          {
            name: 'productNum',
            width: 200,
          },
          {
            name: 'productName',
            width: 200,
          },
          {
            name: 'catalogName',
            width: 200,
          },
          {
            name: 'prRequestedName',
            width: 200,
          },
          {
            name: 'remark',
            width: 150,
          },
          {
            name: 'prSourcePlatform',
            width: 200,
            renderer: ({ record }) => record.get('prSourcePlatformMeaning'),
          },
          {
            name: 'urgentFlag',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'urgentDate',
            width: 200,
          },
          {
            name: 'occupiedQuantity',
            width: 150,
          },
          {
            name: 'itemSpecs',
            width: 100,
          },
          {
            name: 'itemModel',
            width: 100,
          },
          {
            name: 'projectCategory',
            width: 150,
          },
          {
            name: 'accountAssignTypeCode',
            width: 150,
          },
          {
            name: 'commonName',
            width: 150,
          },
          // {
          //   name: 'enteredTaxIncludedPrice',
          //   width: 110,
          // },
          // {
          //   name: 'priceSourceNumber', // 待定
          //   width: 200,
          // },
          {
            name: 'contactTelNum',
            width: 200,
          },
          {
            name: 'receiverAddress',
            width: 200,
          },
          {
            name: 'docFlow',
            width: 100,
            renderer: ({ record }) => (
              <DocFlow tableName="sprm_pr_line" tablePk={record.get('prLineId')} />
            ),
          },
        ];
      case 'sourcingResults': // 明细-寻源结果
        return [
          {
            name: 'sourceNum',
            width: 150,
          },
          {
            name: 'itemNum',
            width: 80,
          },
          {
            name: 'supplierCompanyName',
            width: 150,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('erpSupplierCompanyName'),
          },
          {
            name: 'itemCode',
            width: 150,
          },
          {
            name: 'itemName',
            width: 150,
          },
          doubleUnitEnabled && {
            name: 'secondaryQuantity',
            width: 150,
          },
          {
            name: 'quantity',
            width: 150,
          },
          {
            name: 'receiptsOrderQuantity',
            width: 150,
            editor: (record) => record.isSelected,
          },
          {
            name: 'remainQuantity',
            width: 150,
          },
          doubleUnitEnabled && {
            name: 'secondaryUomCodeAndName',
            width: 130,
          },
          {
            name: 'uomCodeAndName',
            width: 130,
          },
          {
            name: 'unitPrice',
            width: 150,
            renderer: usePriceRender(),
          },
          {
            name: 'netAmount',
            width: 150,
            renderer: useAmountRender(),
          },
          {
            name: 'taxprice',
            width: 150,
          },
          {
            name: 'taxAmount',
            width: 150,
            renderer: useAmountRender(),
          },
          {
            name: 'taxRate',
            width: 80,
          },
          {
            name: 'currencyCode',
            width: 150,
          },
          {
            name: 'priceBatchQuantity',
            width: 150,
          },
          {
            name: 'ladderInquiryFlag',
            width: 150,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'companyName',
            width: 150,
          },
          {
            name: 'ouName',
            width: 150,
          },
          {
            name: 'purOrganizationName',
            width: 150,
          },
          {
            name: 'purchaseAgentName',
            width: 150,
          },
          {
            name: 'invOrganizationName',
            width: 200,
          },
          {
            name: 'categoryName',
            width: 200,
          },
          {
            name: 'realName',
            width: 150,
          },
          {
            name: 'creationDate',
            width: 150,
          },
          {
            name: 'prNumAndLineNum',
            width: 150,
            renderer: ({ value }) => value !== '|' && value,
          },
          {
            name: 'itemRemark',
            width: 150,
          },
          {
            name: 'occupationQuantity',
            width: 150,
          },
          {
            name: 'validPromisedDate',
            width: 150,
          },
          {
            name: 'supplierCompanyNum',
            width: 150,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('erpSupplierCompanyNum'),
          },
          {
            name: 'docFlow',
            width: 100,
            renderer: ({ record }) => {
              return (
                <DocFlow tableName="ssrc_rfx_line_item" tablePk={record.get('sourceLineItemId')} />
              );
            },
          },
        ];
      case 'purchaseAgreement': // 明细-采购协议
        return [
          {
            name: 'pcNum',
            width: 150,
          },
          {
            name: 'lineNum',
            width: 80,
          },
          {
            name: 'pcName',
            width: 150,
          },
          // {
          //   name: 'supplierCompanyNum',
          //   width: 150,
          // },
          {
            name: 'supplierCompanyName',
            width: 150,
            renderer: ({ record }) =>
              record.get('supplierCompanyName') || record.get('supplierName'),
          },
          {
            name: 'itemCode',
            width: 150,
          },
          {
            name: 'itemName',
            width: 150,
          },
          doubleUnitEnabled && {
            name: 'secondaryQuantity',
            width: 150,
          },
          {
            name: 'quantity',
            width: 150,
          },
          {
            name: 'receiptsOrderQuantity',
            width: 150,
            editor: (record) => record.isSelected,
          },
          {
            name: 'residueOrderQuantity',
            width: 150,
          },
          doubleUnitEnabled && {
            name: 'secondaryUomCodeAndName',
            width: 150,
          },
          {
            name: 'uomCodeAndName',
            width: 150,
          },
          {
            name: 'deliverDate',
            width: 150,
          },
          // {
          //   name: 'neededDate',
          //   width: 150,
          // },
          {
            name: 'unitPrice',
            width: 150,
            renderer: usePriceRender(),
          },
          {
            name: 'lineAmount',
            width: 150,
            renderer: useAmountRender(),
          },
          {
            name: 'enteredTaxIncludedPrice',
            width: 150,
            renderer: usePriceRender(),
          },
          {
            name: 'taxIncludedLineAmount',
            width: 150,
            renderer: useAmountRender(),
          },
          {
            name: 'taxRate',
            width: 80,
          },
          {
            name: 'currencyCode',
            width: 150,
          },
          {
            name: 'unitPriceBatch',
            width: 150,
          },
          // {
          //   name: 'ladderInquiry',
          //   width: 150,
          // },
          {
            name: 'companyName',
            width: 150,
          },
          {
            name: 'ouName',
            width: 150,
          },
          {
            name: 'purchaseOrgName',
            width: 150,
          },
          {
            name: 'agentName',
            width: 150,
          },
          {
            name: 'categoryName',
            width: 150,
          },
          {
            name: 'createdByName',
            width: 150,
          },
          {
            name: 'creationDate',
            width: 150,
          },
          // {
          //   name: 'prNumAndLineNum', // 待定
          //   width: 150,
          // },
          // {
          //   name: 'prNumAndLineNum1', // 待定
          //   width: 150,
          // },
          {
            name: 'remark',
            width: 150,
          },
          {
            name: 'chanageOrderQuantity',
            width: 150,
          },
          {
            name: 'supplierCompanyNum',
            width: 150,
            renderer: ({ record }) => record.get('supplierCompanyNum') || record.get('supplierNum'),
          },
          {
            name: 'docFlow',
            width: 100,
            renderer: ({ record }) => (
              <DocFlow tableName="spcm_pc_subject" tablePk={record.get('pcSubjectId')} />
            ),
          },
        ];
      default:
        // 整单-采购申请
        return [
          {
            name: 'prNum',
            width: 200,
            renderer: ({ value, record }) => (
              <Fragment>
                {value}
                {record.get('urgentFlag') && Number(record.get('urgentFlag')) ? (
                  <Tooltip title={intl.get(`sodr.workspace.view.tooltip.urgent`).d('订单加急')}>
                    <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                  </Tooltip>
                ) : null}
              </Fragment>
            ),
          },
          {
            name: 'title',
            width: 200,
          },
          {
            name: 'companyName',
            width: 200,
          },
          {
            name: 'ouName',
            width: 200,
          },
          {
            name: 'organizationName',
            width: 200,
          },
          {
            name: 'purchaseAgentName',
            width: 200,
          },
          {
            name: 'requestedName',
            width: 150,
          },
          {
            name: 'requestDate',
            width: 150,
          },
          {
            name: 'urgentFlag',
            width: 120,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            name: 'ecSupplierCompanyName',
            width: 120,
          },
          {
            name: 'urgentDate',
            width: 200,
          },
        ];
    }
  };

  const goDetail = (poHeaderId, poSourcePlatform, sourceBillTypeCode, state = {}) => {
    const options = {
      state,
      // search: stringify(search),
    };
    const pathConfig = [
      {
        source: 'PURCHASE_ORDER',
        path: `/sodr/order-workspace/detail/created-manually/${poHeaderId}`,
      },
      {
        source: 'PURCHASE_REQUEST',
        path: `/sodr/order-workspace/detail/purchase-request/${poHeaderId}`,
      },
      {
        source: 'SOURCE',
        path: `/sodr/order-workspace/detail/sourcing-results/${poHeaderId}`,
      },
      {
        source: 'CONTRACT_ORDER',
        path: `/sodr/order-workspace/detail/purchase-agreement/${poHeaderId}`,
      },
    ];
    switch (poSourcePlatform) {
      case 'E-COMMERCE':
        options.pathname = `/sodr/order-workspace/detail/ecommerce-request/${poHeaderId}`;
        break;
      case 'CATALOGUE':
        options.pathname = `/sodr/order-workspace/detail/catalogue-request/${poHeaderId}`;
        break;
      default:
        // SRM || SHOP || ERP
        options.pathname = (pathConfig.find((i) => i.source === sourceBillTypeCode) || {}).path;
    }
    if (!options.pathname) return;
    history.push(options);
  };
  // 引用采购申请创建（明细）
  const handleCreate = async () => {
    const data = purchaseRequestDs.toJSONData();
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
    }
    const status = await Promise.all(purchaseRequestDs.selected.map((i) => i.validate(true)));
    if (status.findIndex((i) => !i) === -1) {
      const beforHandleCreateRes = await remote.event.fireEvent('beforHandleCreate', {
        purchaseRequestDs,
      });
      if (beforHandleCreateRes === false) return;
      const checkResponse = getResponse(await check({ sourceCode: 'PURCHASE_REQUEST' }));
      const validateRes = getResponse(await poFromPrLineNewCheck(data));
      if (!validateRes) return;
      const { poCreatePopUpFlag, poCreateErrorMsg } = validateRes;
      if (poCreatePopUpFlag === 1) {
        const validateModalRes = await Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: poCreateErrorMsg,
          okText: intl.get('sodr.workspace.view.button.createPO').d('新建订单'),
        });
        if (validateModalRes !== 'ok') return;
      }
      const resLineCreate = await purchaseRequestDs.setState('submitType', 'create').submit();
      if (resLineCreate && !resLineCreate.failed) {
        const { content } = resLineCreate;
        const { poHeaderId, poSourcePlatform, sourceBillTypeCode } = isArray(content)
          ? content[0]
          : content;
        notification.success();
        const afterCreate = remote
          ? remote.process('SODR.WORKSPACE_REFERENCEDOCUMENT_PROCESS_AFTER_CREATE', true, { props })
          : true;
        if (afterCreate === false) return;
        if (checkResponse === 0 || (checkResponse === 1 && content.length === 1)) {
          goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode);
        } else if (checkResponse === 1 && content.length > 1) {
          goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode, {
            initPoDataList: content,
          });
        }
      }
    }
  };
  // 引用采购申请创建（整单电商）
  const handleWholeorderCreate = async () => {
    const data = wholePurchaseRequestDs.toJSONData();
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    const wholePurchaseValidate = wholePurchaseRequestDs.validate();
    if (wholePurchaseValidate) {
      const response = await wholePurchaseRequestDs.submit();
      if (response && !response.failed) {
        const { content } = response;
        const { poHeaderId, poSourcePlatform, sourceBillTypeCode } = content[0];
        goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode);
      }
    }
  };

  // 引用寻源结果创建
  const handleSourcing = async () => {
    Promise.all(sourcingResultsDs.selected.map((i) => i.validate(true))).then(async (status) => {
      if (status.findIndex((i) => !i) === -1) {
        const res = await remote.process('sourceCreate', { sourcingResultsDs });
        if (!res) return false;
        const checkResponse = getResponse(await check({ sourceCode: 'SOURCE' }));
        if (checkResponse === 1) {
          const data = sourcingResultsDs.toJSONData();
          loadingDs(sourcingResultsDs, true);
          const response = getResponse(await createCombineOrder(data, { poWorkbenchFlag: 1 }));
          loadingDs(sourcingResultsDs, false);
          if (response && !response.failed) {
            const { poHeaderId, poSourcePlatform, sourceBillTypeCode, cacheKey } = response[0];
            goDetail(
              poHeaderId,
              poSourcePlatform,
              sourceBillTypeCode,
              response.length > 1
                ? {
                    cacheKey,
                  }
                : undefined
            );
          }
        } else if (checkResponse === 0) {
          const response = await sourcingResultsDs.submit();
          if (response && response.success) {
            const { poHeaderId, poSourcePlatform, sourceBillTypeCode } = response.content[0];
            goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode);
          }
        }
      }
    });
  };

  // 引用采购协议创建
  const handleAgreement = async () => {
    loadingDs(purchaseAgreementDs, true);
    await new Promise((resolve) => setTimeout(resolve, 10));
    Promise.all(purchaseAgreementDs.selected.map((i) => i.validate(true))).then(async (status) => {
      loadingDs(purchaseAgreementDs, false);
      if (status.findIndex((i) => !i) === -1) {
        const res = await (remote
          ? remote.process('agreementCreate', true, { purchaseAgreementDs })
          : true);
        if (!res) return false;
        loadingDs(purchaseAgreementDs, true);
        const checkResponse = getResponse(await check({ sourceCode: 'CONTRACT_ORDER' }));
        loadingDs(purchaseAgreementDs, false);
        if (checkResponse === 1) {
          const data = purchaseAgreementDs.toJSONData();
          loadingDs(purchaseAgreementDs, true);
          const response = getResponse(await createCombineProtocol(data, { poWorkbenchFlag: 1 }));
          loadingDs(purchaseAgreementDs, false);
          if (response && !response.failed) {
            const { poHeaderId, poSourcePlatform, sourceBillTypeCode, cacheKey } =
              response[0] || response;
            goDetail(
              poHeaderId,
              poSourcePlatform,
              sourceBillTypeCode,
              response.length > 1
                ? {
                    cacheKey,
                  }
                : undefined
            );
          }
        } else if (checkResponse === 0) {
          const response = await purchaseAgreementDs.submit();
          if (response && response.success) {
            const { poHeaderId, poSourcePlatform, sourceBillTypeCode } = response.content[0];
            goDetail(poHeaderId, poSourcePlatform, sourceBillTypeCode);
          }
        }
      }
    });
  };

  const clearSupplier = () => {
    const { selected } = purchaseRequestDs;
    selected.forEach((i) => {
      i.set({ orderSupplierLov: null });
    });
  };

  // 获取推荐供应商
  const getOrderSupplier = async () => {
    const { selected } = purchaseRequestDs;
    const selectedData = selected.map((i) => i.toData());
    purchaseRequestDs.status = 'submitting';
    // 使用DataSet.submit必然会让接口返回的数据回写 所以需要自己调
    const getSuppliers = getResponse(await getSupplier(selectedData));
    purchaseRequestDs.status = 'ready';
    if (getSuppliers && isArray(getSuppliers)) {
      selected.forEach((i) => {
        const currentLine = getSuppliers.find((t) => t.prLineId === i.get('prLineId'));
        const {
          uomId,
          uomName,
          uomCode,
          currencyCode,
          taxId,
          taxRate,
          netPrice,
          priceLibId,
          priceLibraryId,
          taxIncludedPrice,
          enteredTaxIncludedPrice,
          unitPriceBatch,
          holdPcHeaderId,
          holdPcLineId,
          contractNum,
          benchmarkPriceType,
          ladderPriceLibId,
          ladderQuotationFlag,
          selectSupplierCompanyId,
          selectSupplierCode,
          selectSupplierCompanyName,
          selectLocalSupplierName,
          selectLocalSupplierCode,
          selectLocalSupplierId,
          selectSupplierTenantId,
        } = currentLine || {};
        if (currentLine) {
          const originValues = {
            uomId,
            uomName,
            uomCode,
            currencyCode,
            taxId,
            taxRate,
            noUnitPrice: netPrice,
            unitPrice: netPrice,
            priceLibId,
            priceLibraryId,
            taxIncludedPrice,
            unitPriceBatch,
            holdPcHeaderId,
            holdPcLineId,
            contractNum,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
            enteredTaxIncludedPrice,
            selectSupplierCompanyId,
            selectSupplierCode,
            selectSupplierCompanyName: isNil(selectSupplierCompanyName)
              ? selectLocalSupplierName
              : selectSupplierCompanyName,
            selectDisplaySupplierCompanyName: isNil(selectSupplierCompanyName)
              ? selectLocalSupplierName
              : selectSupplierCompanyName,
            selectLocalSupplierCode,
            selectLocalSupplierId,
            selectLocalSupplierName,
            selectSupplierTenantId,
          };
          const newValues = remote.process('transformOrderSupplierFields', originValues, {
            currentLine,
            source: 'button',
            record: i,
            dataSet: purchaseRequestDs,
          });
          i.set(newValues);
          remote.event.fireEvent('handleGetOrderSupplier', { selected, currentLine, record: i });
        }
      });
    }
  };

  // 引用寻源结果暂挂/取消暂挂
  const handleSourceHold = async () => {
    const data = sourcingResultsDs.toJSONData();
    const zero = data.every((i) => i.pendingFlag === 0);
    const one = data.every((i) => i.pendingFlag === 1);
    if (!zero && !one) {
      return notification.warning({
        message: intl
          .get('sodr.workspace.view.message.checkHold')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    loading({ handleSourceHold: true });
    loadingDs(sourcingResultsDs, true);
    const formatData = data.map((n) => ({
      tenantId: n.tenantId,
      pendingFlag: n.pendingFlag === 1 ? 0 : 1,
      type: 'SOURCE',
      executeType: 'PO',
      resultId: n.resultId,
      sourceContractConfigId: n.sourceContractConfigId,
      poSourceContractConfigObjectVersionNumber: n.poSourceContractConfigObjectVersionNumber,
    }));
    const result = getResponse(await (zero ? sourePending : soureCancelPending)(formatData));
    loading({ handleSourceHold: false });
    loadingDs(sourcingResultsDs, false);
    if (result) {
      notification.success();
      sourcingResultsDs.query();
      sourcingResultsDs.batchUnSelect(sourcingResultsDs.selected);
    }
  };

  // 引用采购协议暂挂/取消暂挂
  const handleAgreementHold = async () => {
    const data = purchaseAgreementDs.toJSONData();
    const zero = data.every((i) => i.pendingFlag === 0);
    const one = data.every((i) => i.pendingFlag === 1);
    if (!zero && !one) {
      return notification.warning({
        message: intl
          .get('sodr.workspace.view.message.checkHold')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    loading({ handleAgreementHold: true });
    loadingDs(purchaseAgreementDs, true);
    const formatData = data.map((n) => ({
      tenantId: n.tenantId,
      pendingFlag: n.pendingFlag === 1 ? 0 : 1,
      type: 'CONTRACT',
      pcSubjectId: n.pcSubjectId,
      sourceContractConfigId: n.sourceContractConfigId,
      poSourceContractConfigObjectVersionNumber: n.poSourceContractConfigObjectVersionNumber,
    }));
    const result = getResponse(await pendingFlag(formatData));
    loading({ handleAgreementHold: false });
    loadingDs(purchaseAgreementDs, false);
    if (result) {
      notification.success();
      purchaseAgreementDs.query();
      purchaseAgreementDs.batchUnSelect(purchaseAgreementDs.selected);
    }
  };

  const getBtns = (key) => {
    let Buttons;
    const closeBtn = {
      name: 'close',
      btnComp: Button,
      type: 'c7n-pro',
      child: intl.get('hzero.common.button.cancel').d('取消'),
      btnProps: {
        type: 'c7n-pro',
        onClick: close,
      },
    };
    switch (key) {
      case 'purchaseRequest':
        Buttons = observer(({ dataSet }) => {
          const buttons = [
            closeBtn,
            {
              name: 'clearSupplier',
              btnComp: Button,
              child: intl.get('sodr.workspace.view.button.clearSupplier').d('清空推荐供应商'),
              btnProps: {
                wait: THROTTLE_TIME,
                disabled: !dataSet.selected.length,
                type: 'c7n-pro',
                onClick: clearSupplier,
                permissionList: [
                  {
                    code: 'srm.po-admin.po.order-workspace.button.clearSupplier',
                    meaning: '订单工作台-引用单据明细-采购申请-清空推荐供应商',
                  },
                ],
              },
            },
            {
              name: 'update',
              btnComp: Button,
              type: 'c7n-pro',
              child: intl.get('sodr.workspace.view.button.updateOrderSupplier').d('更新推荐供应商'),
              btnProps: {
                wait: THROTTLE_TIME,
                disabled: !dataSet.selected.length,
                type: 'c7n-pro',
                onClick: getOrderSupplier,
                loading: purchaseRequestDs.status === 'submitting',
                permissionList: [
                  {
                    code: 'srm.po-admin.po.order-workspace.ps.button.refbilldetailspurrqs.supplier',
                    type: 'c7n-pro',
                    meaning: '订单工作台-引用单据明细-采购申请-获取推荐供应商',
                  },
                ],
              },
            },
            {
              name: 'create',
              btnComp: Button,
              type: 'c7n-pro',
              child: intl.get('hzero.common.button.create').d('新建'),
              btnProps: {
                wait: THROTTLE_TIME,
                type: 'c7n-pro',
                color: 'primary',
                disabled: !dataSet.selected.length,
                loading: purchaseRequestDs.status !== 'ready',
                onClick: handleCreate,
                permissionList: [
                  {
                    code: 'srm.po-admin.po.order-workspace.ps.button.refbilldetailspurrqs.create',
                    type: 'c7n-pro',
                    meaning: '订单工作台-引用单据明细-采购申请-新建',
                  },
                ],
              },
            },
          ];
          return (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SODR.WORKSPACE_PURCHASEREQUEST.BUTTONS', pro: true },
                <DynamicButtons
                  buttons={
                    remote
                      ? remote.process(
                          'SODR.WORKSPACE_REFERENCEDOCUMENT_PROCESS_PURCHASE_BTN',
                          buttons,
                          {
                            history,
                            purchaseRequestDs,
                          }
                        )
                      : buttons
                  }
                />
              )}
            </Fragment>
          );
        });
        return <Buttons dataSet={purchaseRequestDs} />;
      case 'sourcingResults':
        Buttons = observer(({ dataSet }) => {
          const data = dataSet.toJSONData();
          const hasDifferent = data.every((i) => i.pendingFlag === 0);
          return [
            <Button
              wait={THROTTLE_TIME}
              color="primary"
              // icon="add"
              type="c7n-pro"
              disabled={!dataSet.selected.length}
              loading={sourcingResultsDs.status === 'submitting' || loadings.handleSourceHold}
              onClick={handleSourcing}
              permissionList={[
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.refbilldetailssource.create',
                  type: 'c7n-pro',
                  meaning: '订单工作台-引用单据明细-寻源申请-新建',
                },
              ]}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
            hasDifferent ? (
              <Button
                wait={THROTTLE_TIME}
                type="c7n-pro"
                disabled={!dataSet.selected.length}
                loading={loadings.handleSourceHold || sourcingResultsDs.status === 'submitting'}
                onClick={handleSourceHold}
              >
                {intl.get('sodr.workspace.view.button.hold').d('暂挂')}
              </Button>
            ) : (
              <Button
                wait={THROTTLE_TIME}
                type="c7n-pro"
                disabled={!dataSet.selected.length}
                loading={loadings.handleSourceHold || sourcingResultsDs.status === 'submitting'}
                onClick={handleSourceHold}
              >
                {intl.get('sodr.workspace.view.button.cancelHold').d('取消暂挂')}
              </Button>
            ),
          ];
        });
        return <Buttons dataSet={sourcingResultsDs} />;
      case 'purchaseAgreement':
        Buttons = observer(({ dataSet }) => {
          const data = dataSet.toJSONData();
          const hasDifferent = data.every((i) => i.pendingFlag === 0);
          return [
            <Button
              wait={THROTTLE_TIME}
              color="primary"
              type="c7n-pro"
              disabled={!dataSet.selected.length}
              loading={purchaseAgreementDs.status === 'submitting' || loadings.handleAgreementHold}
              onClick={handleAgreement}
              permissionList={[
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.refbilldetailsagree.create',
                  type: 'c7n-pro',
                  meaning: '订单工作台-引用单据明细-采购协议-新建',
                },
              ]}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
            hasDifferent ? (
              <Button
                wait={THROTTLE_TIME}
                type="c7n-pro"
                disabled={!dataSet.selected.length}
                loading={
                  loadings.handleAgreementHold || purchaseAgreementDs.status === 'submitting'
                }
                onClick={handleAgreementHold}
              >
                {intl.get('sodr.workspace.view.button.hold').d('暂挂')}
              </Button>
            ) : (
              <Button
                wait={THROTTLE_TIME}
                type="c7n-pro"
                disabled={!dataSet.selected.length}
                loading={
                  loadings.handleAgreementHold || purchaseAgreementDs.status === 'submitting'
                }
                onClick={handleAgreementHold}
              >
                {intl.get('sodr.workspace.view.button.cancelHold').d('取消暂挂')}
              </Button>
            ),
          ];
        });
        return <Buttons dataSet={purchaseAgreementDs} />;
      default:
        Buttons = observer(({ dataSet }) => {
          return [
            <Button
              wait={THROTTLE_TIME}
              color="primary"
              type="c7n-pro"
              disabled={!dataSet.selected.length}
              loading={wholePurchaseRequestDs.status === 'submitting'}
              onClick={handleWholeorderCreate}
              permissionList={[
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.refbillall.create',
                  type: 'c7n-pro',
                  meaning: '订单工作台-引用单据-整单-新建',
                },
              ]}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
          ];
        });
        return <Buttons dataSet={wholePurchaseRequestDs} />;
    }
  };

  const onQuery = ({ params }, ds) => {
    const { tempKeys = '' } = params;
    const platformSupplierIds = tempKeys
      .split(',')
      .map((i) => (i || '').split('-')[0].split(':')[1])
      .filter((i) => i && i !== 'null');
    ds.queryDataSet.loadData([
      {
        ...params,
        ecSupplierCompanyIds: isEmpty(platformSupplierIds)
          ? undefined
          : platformSupplierIds.toString(),
        multiSourceNum: params.multiSourceNum?.toString(),
        multiPcNum: params.multiPcNum?.toString(),
        multiSelectHeaderAndLineNums: params.multiSelectHeaderAndLineNums?.toString(),
        multiSelectHeaderNums: params.multiSelectHeaderNums?.toString(),
      },
    ]);

    ds.query();
  };

  const getTableRender = useCallback((key) => {
    let tableRender;
    const searchBarRef = (node) => {
      if (!searchBarRefs.get(key)) {
        searchBarRefs.set(key, node);
      }
    };
    switch (key) {
      case 'wholePurchaseRequest':
        tableRender = customizeTable(
          { code: 'SODR.WORKSPACE_WHOLEPURCHASEREQUEST.LIST' },
          <SearchBarTable
            searchBarRef={searchBarRef}
            cacheState
            searchCode="SODR.WORKSPACE_WHOLEPURCHASEREQUEST.SEARCH"
            dataSet={wholePurchaseRequestDs}
            columns={getColumns('wholePurchaseRequest')}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            virtual
            virtualCell
            searchBarConfig={{
              onQuery: (e) => onQuery(e, wholePurchaseRequestDs),
              left: {
                render: (_, ds) => (
                  <MutlTextFieldSearch
                    name="multiSelectHeaderNums"
                    dataSet={ds}
                    placeholder={intl
                      .get('sodr.common.model.common.enterPrNum')
                      .d('请输入采购申请编号查询')}
                    tabType="wholePurchaseRequest"
                  />
                ),
              },
            }}
          />
        );
        break;
      case 'purchaseRequest':
        tableRender = (
          <PurchaseRequest
            remote={remote}
            customizeTable={customizeTable}
            ds={purchaseRequestDs}
            cacheKey="purchaseRequest"
            searchBarRef={searchBarRef}
            displayDocAndDocFlow={displayDocAndDocFlow}
          />
        );
        break;
      case 'sourcingResults':
        tableRender = (
          <SourcingResults
            remote={remote}
            customizeTable={customizeTable}
            ds={sourcingResultsDs}
            cacheKey="sourcingResults"
            searchBarRef={searchBarRef}
            displayDocAndDocFlow={displayDocAndDocFlow}
          />
        );
        break;
      default:
        tableRender = (
          <PurchaseAgreement
            remote={remote}
            customizeTable={customizeTable}
            ds={purchaseAgreementDs}
            cacheKey="purchaseAgreement"
            searchBarRef={searchBarRef}
            displayDocAndDocFlow={displayDocAndDocFlow}
          />
        );
        break;
    }
    return <div style={{ height: 'calc(100vh - 230px)' }}>{tableRender}</div>;
  });

  const wholeDetails = {
    wholePurchaseRequest: 'wholeorder',
    purchaseRequest: 'detail',
    sourcingResults: 'detail',
    purchaseAgreement: 'detail',
  };
  const init = (keyList, cuzActiveKey) => {
    const defaultKey = roleWorkbenchTable || referKey;
    // if (defaultKey) {
    //   onTabChange(defaultKey, true);
    // } else if (!referenceInitFlag) {
    //   dispatch({
    //     type: 'orderWorkSpace/updateState',
    //     payload: { referenceInitFlag: true },
    //   });
    //   onTabChange(cuzActiveKey, true);
    // }
    onTabChange(defaultKey || cuzActiveKey, true);
  };
  const dsList = useMemo(
    () => [
      { key: 'wholePurchaseRequest', ds: wholePurchaseRequestDs },
      { key: 'purchaseRequest', ds: purchaseRequestDs },
      { key: 'sourcingResults', ds: sourcingResultsDs },
      { key: 'purchaseAgreement', ds: purchaseAgreementDs },
    ],
    []
  );
  const activeKeys = useMemo(() => {
    if (referenceRedioKey === 'detail') {
      return referenceDetailActiveKey;
    } else {
      return referenceActiveKey;
    }
  }, [referenceDetailActiveKey, referenceActiveKey, referenceRedioKey]);

  // 获取非标准Tab的对应聚合组
  const getCuzGroup = (tabKey) => {
    const standardTabKeys = Object.keys(wholeDetails);
    const cuzTabs = (props?.custConfig['SODR.WORKSPACE_REFERENCE.TABS']?.fields || []).filter(
      (i) => !standardTabKeys.includes(i.fieldCode)
    );
    const tabGroup = cuzTabs.find((i) => i?.fieldCode === tabKey)?.aggregationCode;
    return tabGroup;
  };

  const onTabChange = (key, initFlag) => {
    const currentSearchBarRef = searchBarRefs.get(key);
    const searchBarHandleQuery = currentSearchBarRef?.handleQuery;
    const tabGroup = wholeDetails[key] || getCuzGroup(key);
    const currentKey =
      tabGroup === 'wholeorder' ? 'referenceActiveKey' : 'referenceDetailActiveKey';
    const wholeDetail = wholeDetails[key] || tabGroup;
    dispatch({
      type: 'orderWorkSpace/updateState',
      payload: {
        [currentKey]: key,
        referenceRedioKey: wholeDetail,
      },
    });
    if (searchBarHandleQuery) {
      searchBarHandleQuery(true);
    }
    if (initFlag) {
      dsList.forEach((i) => {
        if (i.key !== key) {
          i.ds.query();
        }
      });
    }
  };
  return (
    <Fragment>
      <PermissionDoubleTabs onCallback={init}>
        {customizeTabPane(
          { code: 'SODR.WORKSPACE_REFERENCE.TABS', cascade: true },
          <Tabs keyboard={false} activeKey={activeKeys} onChange={onTabChange}>
            <TabGroup
              tab={intl.get('sodr.workspace.view.button.wholeorder').d('整单')}
              key="wholeorder"
              defaultActiveKey={referenceActiveKey}
            >
              <TabPane
                key="wholePurchaseRequest"
                count={() => !wholePurchaseRequestDs.counting && wholePurchaseRequestDs.totalCount}
                tab={intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请')}
              >
                {getTableRender('wholePurchaseRequest')}
              </TabPane>
            </TabGroup>
            <TabGroup
              tab={intl.get('sodr.workspace.view.button.detail').d('明细')}
              key="detail"
              defaultActiveKey={referenceDetailActiveKey}
            >
              <TabPane
                key="purchaseRequest"
                count={() => !purchaseRequestDs.counting && purchaseRequestDs.totalCount}
                tab={intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请')}
              >
                {getTableRender('purchaseRequest')}
              </TabPane>
              <TabPane
                key="sourcingResults"
                count={() => !sourcingResultsDs.counting && sourcingResultsDs.totalCount}
                tab={intl.get('sodr.workspace.view.tabPane.sourcingResults').d('引用寻源结果')}
              >
                {getTableRender('sourcingResults')}
              </TabPane>
              <TabPane
                key="purchaseAgreement"
                count={() => !purchaseAgreementDs.counting && purchaseAgreementDs.totalCount}
                tab={intl.get('sodr.workspace.view.tabPane.purchaseAgreement').d('引用采购协议')}
              >
                {getTableRender('purchaseAgreement')}
              </TabPane>
            </TabGroup>
          </Tabs>
        )}
      </PermissionDoubleTabs>
    </Fragment>
  );
};

export default compose(
  connect(({ orderWorkSpace }) => ({ orderWorkSpace })),
  formatterCollections({
    code: ['sodr.workspace', 'sodr.common'],
  }),
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_PURCHASEREQUEST.LIST',
      'SODR.WORKSPACE_SOURCINGRESULTS.LIST',
      'SODR.WORKSPACE_PURCHASEAGREEMENT.LIST',
      'SODR.WORKSPACE_WHOLEPURCHASEREQUEST.LIST',
      'SODR.WORKSPACE_REFERENCE.TABS',
      'SODR.WORKSPACE_PURCHASEREQUEST.BUTTONS',
      'SODR.WORKSPACE_PURCHASEREQUEST.REFERENCE_PRICE',
    ],
  }),
  observer,
  remotes(...remoteConfig)
)(ReferenceDocument);
