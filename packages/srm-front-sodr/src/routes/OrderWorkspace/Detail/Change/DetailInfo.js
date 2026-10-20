/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useMemo, cloneElement, useCallback } from 'react';
import {
  Form,
  Modal,
  Lov,
  NumberField,
  DatePicker,
  Icon,
  DataSet,
  TextField,
  Select,
  TextArea,
  Attachment,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { isEmpty, isArray, throttle, omit } from 'lodash';

import uuid from 'uuid/v4';
import { Button } from 'components/Permission';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { isNewLine, isDisabledFields } from './store/changeDs';
import {
  usePriceRender,
  useAmountRender,
  useQuantityRender,
  useLocalAmountRender,
  useLocalPriceRender,
} from '@/routes/OrderWorkspace/hooks';
import {
  handleBatchOk,
  renderStatus,
  handleBatchSplit,
  handleBatchAdd,
  getMaxPoLineNum,
} from '@/routes/components/utils';
import CategoryLov from '@/routes/components/CategoryLov';
import ProjectTaskLov from '@/routes/components/ProjectTaskLov';
import C7nPriceModal from '@/routes/components/C7nPriceModal';
import Bom from '@/routes/components/Bom';
import TooltipButton from '@/routes/components/TooltipButton';
import {
  orderChangePrToLine,
  orderChangeRfxToLine,
  orderChangeContractToLine,
  queryChangePoItemBOM,
  addDelete,
} from '@/services/orderWorkspaceService';
import PurchaseRequest from '../../ReferenceDocument/PurchaseRequest';
import SourcingResults from '../../ReferenceDocument/SourcingResults';
import PurchaseAgreement from '../../ReferenceDocument/PurchaseAgreement';
import {
  purchaseRequest,
  sourcingResults,
  purchaseAgreement,
} from '../../ReferenceDocument/store/referenceDocumentDs';
import styles from '../index.less';

const DetailInfo = (props) => {
  const {
    ds,
    remote,
    basicInfoDs,
    customizeTable,
    batchMaintenanceDs,
    customizeForm,
    poHeaderId,
    customizeBtnGroup,
    loadings,
    handleIncludedPriceFcous,
    handleUpdatePrice = () => {},
    setChangeFlag = () => {},
    displayDocAndDocFlow = {},
    setPrice = (e) => e,
    getValues = (e) => e,
    fundTermDimension,
  } = props;
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
  const changeFieldsList = ds.getState('changeFieldsList') || [];
  const bomChangeFieldsList = ds.getState('bomChangeFieldsList') || [];
  const basicCurrent = basicInfoDs?.current;
  const {
    poSourcePlatform,
    sourceBillTypeCode,
    summaryFlag,
    modifyablePriceFlag,
  } = basicInfoDs?.current?.get([
    'poSourcePlatform',
    'sourceBillTypeCode',
    'summaryFlag',
    'modifyablePriceFlag',
  ]);
  const newPriceLibFlag = basicInfoDs.getState('newPriceLibFlag');
  const purchaseRequestDs = useMemo(() => new DataSet(purchaseRequest({ remote })), []);
  const sourcingResultsDs = useMemo(() => new DataSet(sourcingResults({ remote })), []);
  const purchaseAgreementDs = useMemo(() => new DataSet(purchaseAgreement()), []);
  const isShop = useMemo(
    () => poSourcePlatform === 'SHOP' && sourceBillTypeCode === 'PURCHASE_REQUEST',
    [poSourcePlatform, sourceBillTypeCode]
  );
  const currentConfig = useMemo(() => {
    const config = [
      {
        type: 'PURCHASE_REQUEST',
        title: intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请'),
        customizeUnitCode: 'SODR.WORKSPACE_PURCHASEREQUEST.LIST',
        method: orderChangePrToLine,
        dataSet: purchaseRequestDs,
        dataPrimaryKey: 'prLineId',
        paramKey: 'prLineIdStr',
        Component: PurchaseRequest,
      },
      {
        type: 'SOURCE',
        title: intl.get('sodr.workspace.view.tabPane.sourcingResults').d('引用寻源结果'),
        customizeUnitCode: 'SODR.WORKSPACE_SOURCINGRESULTS.LIST',
        method: orderChangeRfxToLine,
        dataSet: sourcingResultsDs,
        dataPrimaryKey: 'sourceResultId',
        paramKey: 'sourceResultIds',
        Component: SourcingResults,
      },
      {
        type: 'CONTRACT_ORDER',
        title: intl.get('sodr.workspace.view.tabPane.purchaseAgreement').d('引用采购协议'),
        customizeUnitCode: 'SODR.WORKSPACE_PURCHASEAGREEMENT.LIST',
        method: orderChangeContractToLine,
        dataSet: purchaseAgreementDs,
        dataPrimaryKey: 'holdPcLineId',
        paramKey: 'holdPcLineIds',
        Component: PurchaseAgreement,
      },
      {
        type: 'PURCHASE_ORDER',
        title: intl.get(`hzero.common.button.increase`).d('新增'),
      },
    ];
    return ['SRM', 'ERP', 'SHOP'].includes(poSourcePlatform)
      ? config.find((i) => i.type === sourceBillTypeCode)
      : {};
  }, [poSourcePlatform, sourceBillTypeCode]);

  const getBomQueryPara = (record) => {
    return remote.process(
      'transformBomQueryPara',
      {
        tenantId: getCurrentOrganizationId(),
        itemId: record.get('itemId'),
        needByDate: record.get('needByDate'),
        invOrganizationId: record.get('invOrganizationId')?.organizationId,
        invOrganizationName: record.get('invOrganizationId')?.organizationName,
        changeItemFlag: record.get('itemId') === record.getPristineValue('itemId') ? 0 : 1,
      },
      { basicInfoDs, record }
    );
  };

  const handleTranslate = async ({ dataSet, record }) => {
    const lineData = record.toData();
    const { displayLineNum, poItemBomList } = lineData;
    if (!poItemBomList) {
      const res = getResponse(
        await queryChangePoItemBOM({
          body: getBomQueryPara(record),
          query: {
            customizeUnitCode: 'SODR.WORKSPACE_CHANGE_DETAIL.BOM',
          },
        })
      );
      if (res) {
        lineData.poItemBomList = res;
      } else return;
    }
    const fieldsMap = Object.keys(record.toData());
    const data = omit(record.get([...fieldsMap]), ['displayLineNum', 'lineNum']);
    const dataList = {
      ...data,
      businessKey: uuid(),
      poLineId: null,
      // displayLineNum: null,
      poLineLocationId: null,
      splitFromLineNum: displayLineNum,
    };
    const newRecord = dataSet.create({}, record.index + 1);
    newRecord.init(dataList);
  };

  const openBom = useCallback(async (record, readOnly) => {
    if (!record.get('quantity') > 0) {
      notification.error({
        description: intl
          .get('sodr.workspace.view.message.orderLineQuantityByBom')
          .d('请输入>0的订单数量信息'),
      });
      return;
    }
    Modal.open({
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('sodr.workspace.view.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
      closable: true,
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
      children: (
        <Bom
          record={record}
          remote={remote}
          customizeTable={customizeTable}
          readOnly={readOnly}
          bomChangeFieldsList={bomChangeFieldsList}
          compatible={{
            queryPara: getBomQueryPara(record),
            createDefault: remote.process(
              'transformBomCreateDefault',
              {
                needByDate: record.get('needByDate'),
                invOrganizationId: record.get('invOrganizationId')?.organizationId,
                invOrganizationName: record.get('invOrganizationId')?.organizationName,
                poHeaderId: record.get('poHeaderId'),
                poLineId: record.get('poLineId'),
                poLineLocationId: record.get('poLineLocationId'),
              },
              { basicInfoDs, record }
            ),
          }}
          code="SODR.WORKSPACE_CHANGE_DETAIL.BOM"
        />
      ),
    });
  });

  const priceModalParams = (record) => {
    const line = record.toJSONData();
    const { poHeaderDetailDTO = {} } = getValues();
    return { poHeaderDetailDTO, poLineDetailDTOs: [line] };
  };

  const openC7nPriceModal = (record) => {
    const currentProps = {
      readOnly: false,
      customizeTable,
      summaryFlag,
      params: priceModalParams(record),
      code: 'SODR.WORKSPACE_CREATEDMANUALLY.REFERENCE_PRICE',
    };
    Modal.open({
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
      children: <C7nPriceModal {...currentProps} />,
      onOk: setPrice,
    });
  };

  const columns = useMemo(() => {
    const originColumns = [
      {
        name: 'translate',
        width: 100,
        hidden: isShop,
        renderer: ({ record, dataSet }) => {
          return (
            <a
              onClick={() => handleTranslate({ record, dataSet })}
              disabled={
                !record.get('poLineLocationId') ||
                record.get('cancelledFlag') ||
                record.get('closedFlag') ||
                isShop
              }
            >
              {intl.get('sodr.workspace.model.common.translate').d('拆分')}
            </a>
          );
        },
      },
      {
        name: 'displayStatusCode',
        width: 120,
        renderer: ({ record }) =>
          renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
      },
      {
        name: 'displayLineNum',
        width: 80,
        // renderer: ({ record, value }) => (isNewLine(record) ? null : value),
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 150,
        editor: (record) =>
          isNewLine(record) || !isDisabledFields({ dataSet: record.dataSet, record }, 'itemCode'),
      },
      {
        name: 'itemName',
        width: 150,
        editor: (record) =>
          isNewLine(record) ||
          !(
            isDisabledFields({ dataSet: record.dataSet, record }, 'itemName') ||
            record.get('itemId')
          ), // 保证非新增行编辑场景下不走个性化编辑配置
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        editor: true,
        renderer: useQuantityRender(null, 'secondaryUomPrecision'),
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 150,
        editor: true,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      {
        name: 'quantity',
        width: 150,
        editor: true,
        renderer: useQuantityRender(),
      },
      {
        name: 'uomId',
        width: 150,
        editor: true,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'needByDate',
        width: 150,
        editor: true,
      },
      {
        name: 'unitPrice',
        width: 150,
        editor: (record) => (
          <NumberField
            onFocus={() =>
              record.status === 'add' &&
              !record.get('splitFromLineNum') &&
              ['SRM', 'ERP', 'SHOP'].includes(poSourcePlatform) &&
              ['PURCHASE_REQUEST', 'PURCHASE_ORDER'].includes(sourceBillTypeCode)
                ? handleIncludedPriceFcous(record)
                : undefined
            }
          />
        ),
        renderer: usePriceRender(basicCurrent),
      },
      {
        name: 'lineAmount',
        width: 120,
        renderer: useAmountRender(basicCurrent),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        editor: (record) => (
          <NumberField
            onFocus={() =>
              record.status === 'add' &&
              !record.get('splitFromLineNum') &&
              ['SRM', 'ERP', 'SHOP'].includes(poSourcePlatform) &&
              ['PURCHASE_REQUEST', 'PURCHASE_ORDER'].includes(sourceBillTypeCode)
                ? handleIncludedPriceFcous(record)
                : undefined
            }
          />
        ),
        renderer: usePriceRender(basicCurrent),
      },
      {
        name: 'taxIncludedLineAmount',
        width: 120,
        renderer: useAmountRender(basicCurrent),
      },
      {
        name: 'taxId',
        width: 120,
        editor: true,
      },
      {
        name: 'unitPriceBatch',
        width: 80,
        editor: true,
      },
      {
        name: 'currencyCode',
        width: 150,
        editor: (record) => isNewLine(record),
      },
      ['PURCHASE_REQUEST', 'PURCHASE_ORDER'].includes(currentConfig.type) &&
        ['SRM', 'ERP', 'SHOP'].includes(poSourcePlatform) && {
          name: 'referPrice',
          width: 150,
          help: intl
            .get('sodr.workspace.view.help.changeReferPrice')
            .d('仅支持开启并可引用价格库，且单价字段允许变更的订单行'),
          renderer: ({ record, dataSet }) => {
            const benchmarkPriceType = record.get('benchmarkPriceType');
            return (
              <a
                onClick={() => openC7nPriceModal(record)}
                disabled={
                  !isNewLine(record) &&
                  isDisabledFields(
                    { dataSet, record },
                    benchmarkPriceType === 'NET_PRICE' ? 'unitPrice' : 'enteredTaxIncludedPrice'
                  )
                }
              >
                {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
              </a>
            );
          },
        },
      {
        name: 'promiseDeliveryDate',
        width: 150,
      },
      {
        name: 'categoryId',
        width: 150,
        editor: (record) => <CategoryLov data={{ record, ds }} />,
      },
      {
        name: 'invOrganizationId',
        width: 150,
        editor: true,
      },
      {
        name: 'invInventoryId',
        width: 150,
        editor: true,
      },
      {
        name: 'invLocationId',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
        editor: true,
      },
      {
        name: 'departmentName',
        width: 150,
        editor: (record) => isNewLine(record),
      },
      {
        name: 'costId',
        width: 150,
        editor: true,
      },
      {
        name: 'accountSubjectId',
        width: 150,
        editor: true,
      },
      {
        name: 'wbsCode',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveTelNum',
        width: 400,
        editor: true,
      },
      {
        name: 'projectCategory',
        width: 150,
        editor: true,
        help:
          changeFieldsList.includes('projectCategory') &&
          intl.get('sodr.workspace.view.help.changeBom').d('未入库可变更'),
        // renderer: ({ record }) => record.get('projectCategoryMeaning'),
      },
      {
        name: 'bom',
        width: 150,
        help: intl.get('sodr.workspace.view.help.changeBom').d('未入库可变更'),
        renderer: ({ record }) => {
          const { projectCategory, closedFlag, bomModifiedFlag, cancelledFlag } = record.get([
            'projectCategory',
            'closedFlag',
            'bomModifiedFlag',
            'cancelledFlag',
          ]);
          // 新增行非只读
          const readOnly =
            (bomModifiedFlag !== 1 || closedFlag || cancelledFlag) &&
            !(record.status === 'add' && !record.get('splitFromLineNum'));
          return (
            <a onClick={() => openBom(record, readOnly)} disabled={projectCategory?.value !== 'L'}>
              {readOnly
                ? intl.get('hzero.common.button.look').d('查看')
                : intl.get('hzero.common.button.maintain').d('维护')}
            </a>
          );
        },
      },
      // {
      //   name: 'freeFlag',
      //   width: 150,
      // },
      // {
      //   name: 'returnedFlag',
      //   width: 150,
      // },
      // {
      //   name: 'displayPrNumAndDisplayPrLineNum',
      //   width: 150,
      // },
      // {
      //   name: 'sourceNumAndLine',
      //   width: 150,
      //   renderer: ({ text, record }) =>
      //     text === '|' ? '' : record.get('sourceNumAndLine') || record.get('sourceCodeNum'),
      // },
      // {
      //   name: 'contractNum',
      //   width: 150,
      //   renderer: ({ text }) => (text === '|' ? '' : text),
      // },
      // {
      //   name: 'prRequestedName',
      //   width: 150,
      // },
      {
        name: 'remark',
        width: 150,
        editor: true,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: () => (
          <Attachment
            viewMode="popup"
            funcType="link"
            onAttachmentsChange={() => setChangeFlag()}
          />
        ),
      },
      // {
      //   name: 'lastPurchasePrice',
      //   width: 150,
      // }
      {
        name: 'domesticUnitPrice',
        width: 150,
        renderer: useLocalPriceRender(basicCurrent),
      },
      {
        name: 'domesticLineAmount',
        width: 150,
        renderer: useLocalAmountRender(basicCurrent),
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
        renderer: useLocalPriceRender(basicCurrent),
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
        renderer: useLocalAmountRender(basicCurrent),
      },
      {
        name: 'exchangeRate',
        width: 150,
      },
      {
        name: 'purchaseLineTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'docFlow',
        width: 100,
        hidden: displayDocAndDocFlow.displayDocFlow !== '1',
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
      {
        name: 'projectTaskId',
        width: 150,
        editor: (record) => <ProjectTaskLov data={{ record, ds }} />,
      },
      {
        name: 'specifications',
        width: 150,
        editor: true,
      },
      {
        name: 'model',
        width: 150,
        editor: true,
      },
      {
        name: 'subSupplierId',
        width: 150,
        editor: true,
      },
      {
        name: 'netReceivedQuantity',
        width: 150,
        editor: false,
      },
      {
        name: 'netDeliverQuantity',
        width: 150,
        editor: false,
      },
      {
        name: 'shippedQuantity',
        width: 150,
        editor: false,
      },
      {
        name: 'pcSubjectId',
        editor: (record) => {
          const pcHeaderIdLov = basicInfoDs.getField('pcHeaderIdLov');
          if (pcHeaderIdLov.get('visible')) return false;
          const { priceSource } = record.get(['priceSource']);
          return (
            isNewLine(record) &&
            priceSource !== 'CONTRACT' &&
            poSourcePlatform === 'SRM' &&
            ['PURCHASE_REQUEST', 'PURCHASE_ORDER'].includes(sourceBillTypeCode)
          );
        },
      },
      fundTermDimension === 'PO_LINE' && {
        name: 'fundLineTermId',
        width: 150,
        renderer: ({ record }) => record.get('fundLineTermName'),
      },
    ];
    return remote
      ? remote.process('transformColumns', originColumns, { basicInfoDs, handleIncludedPriceFcous })
      : originColumns;
  }, [
    poSourcePlatform,
    sourceBillTypeCode,
    doubleUnitEnabled,
    basicCurrent,
    changeFieldsList,
    modifyablePriceFlag,
    newPriceLibFlag,
    fundTermDimension,
    process,
    basicInfoDs,
  ]);
  const handleBatchMaintenance = () => {
    const { selected } = ds;
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      drawer: true,
      style: { width: 380 },
      bodyStyle: { overflowX: 'hidden' },
      title: intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
      children: (
        <Fragment>
          <Alert
            className={styles['order-top-title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />
                {!isEmpty(selected)
                  ? intl
                      .get(`sodr.workspace.view.alert.batchAllMaintainData`, {
                        num: selected.length,
                      })
                      .d(`已勾选{num}条数据进行批量编辑`)
                  : intl
                      .get('sodr.workspace.view.alert.batchAllMaintain')
                      .d('针对全部数据进行批量编辑')}
              </div>
            }
            closable
          />
          {customizeForm(
            { code: 'SODR.WORKSPACE_CHANGE_DETAIL.BATCHEDIT', lovIgnore: false },
            <Form dataSet={batchMaintenanceDs} columns={1} labelLayout="float">
              <TextField name="itemName" />
              <CategoryLov
                name="categoryId"
                data={{
                  source: 'batchEdit',
                  ds: batchMaintenanceDs,
                  record: batchMaintenanceDs?.current,
                }}
              />
              <Lov name="invOrganizationId" />
              <DatePicker name="needByDate" />
              <Lov name="taxId" />
              <Lov name="costId" />
              <Lov name="invInventoryId" />
              <NumberField name="enteredTaxIncludedPrice" />
              <NumberField name="unitPrice" />
              <Lov name="wbsCode" />
              <Select name="purchaseLineTypeId" />
              <Lov name="accountAssignTypeId" />
              <ProjectTaskLov
                name="projectTaskId"
                data={{
                  source: 'batchEdit',
                  ds: batchMaintenanceDs,
                  record: batchMaintenanceDs?.current,
                }}
              />
              <TextArea name="remark" />
            </Form>
          )}
        </Fragment>
      ),
      onOk: throttle(() => handleBatchOk(batchMaintenanceDs, ds, { getValues, remote, remoteCode: 'SODR.WORKSPACE_CHANGE_DETAIL_PROCESS_BATCH_EDIT' }), THROTTLE_TIME, {
        trailing: false,
      }),
    });
  };

  const handleCreateLine = async () => {
    const { customizeUnitCode, method, dataSet, type } = currentConfig;
    const { selected } = dataSet;
    const validateRes = await Promise.all(selected.map((i) => i.validate(true)));
    if (validateRes.findIndex((i) => !i) === -1) {
      const data = selected.map((i) => {
        const lineData = i.toJSONData();
        const {
          uomId,
          prLineUomId,
          uomCode,
          prLineUomCode,
          uomName,
          prLineUomName,
          uomCodeAndName,
          prLineUomCodeAndName,
        } = lineData;
        if (type === 'PURCHASE_REQUEST') {
          return {
            ...lineData,
            uomId: uomId || prLineUomId,
            uomCode: uomCode || prLineUomCode,
            uomName: uomName || prLineUomName,
            uomCodeAndName: uomCodeAndName || prLineUomCodeAndName,
          };
        }
        return lineData;
      });
      const beforRes = await remote.process('beforHandleCreateLine', { type, selected });
      if (!beforRes) return false;
      const res = getResponse(
        await method({
          poHeaderId,
          data,
          query: {
            customizeUnitCode,
            poWorkbenchFlag: 1,
          },
        })
      );
      if (res && isArray(res)) {
        basicInfoDs.query(undefined, undefined, true);
        res.forEach((i) => ds.create({ ...i, businessKey: uuid() }));
      }
      return !!res;
    }
    return false;
  };

  // 引用采购申请
  const handleOpenAddLineModal = () => {
    if (isShop) {
      notification.error({
        description: intl
          .get('sodr.workspace.view.message.shopAddLine')
          .d('来源平台=商城申请的订单不支持新增行，请检查'),
      });
      return;
    }
    const Footer = observer(({ dataSet, okBtn, cancelBtn }) => {
      const { selected } = dataSet;
      return (
        <Fragment>
          {cloneElement(okBtn, { disabled: isEmpty(selected) })}
          <Button
            wait={THROTTLE_TIME}
            disabled={isEmpty(selected)}
            type="c7n-pro"
            onClick={() => {
              selected.forEach((i) => {
                i.set({ orderSupplierLov: null });
              });
            }}
            permissionList={[
              {
                code: 'srm.po-admin.po.order-workspace.button.clearSupplier',
                meaning: '订单工作台-引用单据明细-采购申请-清空推荐供应商',
              },
            ]}
          >
            {intl.get('sodr.workspace.view.button.clearSupplier').d('清空推荐供应商')}
          </Button>
          {cancelBtn}
        </Fragment>
      );
    });
    const { dataSet, dataPrimaryKey, paramKey, title, Component } = currentConfig;
    const newRecords = ds.filter((i) => isNewLine(i));
    const keyList = String(newRecords.map((i) => i.get(dataPrimaryKey)));
    dataSet.setQueryParameter(paramKey, keyList);
    Modal.open({
      title,
      key: Modal.key(),
      drawer: true,
      destroyOnClose: true,
      style: { width: 1090 },
      children: (
        <Component
          ds={dataSet}
          customizeTable={customizeTable}
          cacheKey="order_change_detail"
          remote={remote}
        />
      ),
      okText: intl.get('hzero.common.button.creat').d('新建'),
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      afterClose: () => {
        dataSet.unSelectAll();
        dataSet.clearCachedSelected();
      },
      onOk: throttle(handleCreateLine, THROTTLE_TIME, { trailing: false }),
      footer: (okBtn, cancelBtn) => {
        return <Footer okBtn={okBtn} cancelBtn={cancelBtn} dataSet={dataSet} />;
      },
    });
  };

  const handleDeleteLine = () => {
    const { fundTermId } = basicInfoDs?.current?.get(['fundTermId']);
    Modal.confirm({
      title: intl.get(`sodr.common.model.common.deltetLists`).d('是否删除数据？'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        if (fundTermId) {
          const selectData = ds?.selected.map((i) => i.toData());
          const result = await addDelete({
            poHeaderDetailDTO: basicInfoDs?.current?.toData(),
            poLineDetailDTOs: selectData,
          });
          getResponse(result);
        }
        ds.remove(ds.selected);
      },
    });
  };

  /**
   * 手工新增行
   * @param {Object} initData 新增行初始化数据
   * @param {Boolean} isBatch 是否是批量新增行
   */
  const handleAddNewLinesManually = async (initData = {}) => {
    ds.create({
      businessKey: uuid(),
      poHeaderId: basicCurrent.get('poHeaderId'),
      invOrganizationId: ds.getState('defaultOrgId'),
      invOrganizationName: ds.getState('defaultOrgName'),
      currencyCode: basicCurrent.get('currencyCode'),
      defaultPrecision: basicCurrent.get('defaultPrecision'),
      projectCategory: ds.getState('defaultProjectCategory'),
      projectCategoryMeaning: ds.getState('defaultProjectCategoryMeaning'),
      ...initData,
    });
  };

  const buttons = () => {
    const Buttons = observer(({ dataSet }) => {
      const { selected } = dataSet;
      const hasCloseOrCancel = selected.some((i) => {
        return (
          isDisabledFields({ dataSet, record: i }, 'unitPrice') &&
          isDisabledFields({ dataSet, record: i }, 'enteredTaxIncludedPrice')
        );
      });
      // 各来源新增行按钮属性
      const btnConfig = [
        {
          type: 'PURCHASE_REQUEST',
          child: intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请'),
          icon: 'contact_mail-o',
          onClick: handleOpenAddLineModal,
        },
        {
          type: 'SOURCE',
          child: intl.get('sodr.workspace.view.tabPane.sourcingResults').d('引用寻源结果'),
          icon: 'find_in_page',
          onClick: handleOpenAddLineModal,
        },
        {
          type: 'CONTRACT_ORDER',
          child: intl.get('sodr.workspace.view.tabPane.purchaseAgreement').d('引用采购协议'),
          icon: 'content_paste',
          onClick: handleOpenAddLineModal,
        },
        {
          type: 'PURCHASE_ORDER',
          child: intl.get(`hzero.common.button.increase`).d('新增'),
          icon: 'playlist_add',
          onClick: () => handleAddNewLinesManually(),
        },
      ];
      const currentBtnConfig = btnConfig.find(
        (i) => i.type === (currentConfig.type || 'PURCHASE_ORDER')
      );
      const { child, icon, onClick } = currentBtnConfig;
      if (!basicInfoDs) return null;
      const btns = [
        {
          name: 'batchEdit',
          btnComp: TooltipButton,
          child: !isEmpty(selected)
            ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
            : intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
          childFor: 'buttonText',
          btnProps: {
            tipTitle: !isEmpty(selected)
              ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
              : intl.get('sodr.workspace.view.tooltip.batchAllMaintain').d('批量编辑全部数据'),
            btnProps: {
              funcType: 'flat',
              icon: 'mode_edit',
              color: 'primary',
              type: 'c7n-pro',
              disabled: !dataSet.totalCount,
              onClick: handleBatchMaintenance,
              loading: dataSet.status !== 'ready',
            },
          },
        },
        {
          name: 'addLine',
          btnType: 'c7n-pro',
          child,
          hidden: isShop,
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon,
            onClick,
            loading: dataSet.status !== 'ready',
            disabled: !currentConfig.type,
          },
        },
        ['PURCHASE_REQUEST', 'PURCHASE_ORDER'].includes(currentConfig.type) &&
          ['SRM', 'ERP', 'SHOP'].includes(poSourcePlatform) && {
            name: 'lastPrice',
            btnType: 'c7n-pro',
            btnComp: TooltipButton,
            childFor: 'buttonText',
            child: intl.get(`sodr.workspace.view.button.quoteTheLatestPrice`).d('引用最新价格'),
            btnProps: {
              tipTitle: intl
                .get('sodr.workspace.view.tooltip.lastPrice')
                .d('仅可引用启用价格库，且单价字段可编辑的订单行'),
              btnProps: {
                icon: 'root',
                funcType: 'flat',
                color: 'primary',
                type: 'c7n-pro',
                onClick: handleUpdatePrice,
                loading: loadings.priceUpdateList || dataSet.status !== 'ready',
                disabled: isEmpty(selected) || hasCloseOrCancel || !newPriceLibFlag,
              },
            },
          },
        {
          name: 'delete',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.enter').d('删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete',
            onClick: handleDeleteLine,
            disabled: ds.selected.find((i) => i.status !== 'add') || isEmpty(ds.selected),
            loading: dataSet.status !== 'ready',
          },
        },
        {
          name: 'batchSplit',
          childFor: 'buttonText',
          btnComp: TooltipButton,
          child: intl.get(`sodr.workspace.view.button.selectBatchSplit`).d('勾选批量拆分'),
          btnProps: {
            tipTitle: intl
              .get('sodr.workspace.view.help.changeSelectBatchSplit')
              .d('针对勾选的订单行，可批量拆分数量均为1的订单行'),
            btnProps: {
              funcType: 'flat',
              color: 'primary',
              icon: 'add_road-o',
              type: 'c7n-pro',
              disabled: !dataSet.selected.length,
              loading: dataSet.status !== 'ready',
              onClick: () => handleBatchSplit({ basicInfoDs, getValues, ds, source: 'change' }),
              wait: THROTTLE_TIME,
              permissionList: [
                {
                  code: 'srm.po-admin.po.order-workspace.button.change.batchSplit',
                  meaning: '订单工作台-变更明细行-批量拆分',
                },
              ],
            },
          },
        },
        {
          name: 'batchAdd',
          btnComp: Button,
          hidden: currentConfig.type !== 'PURCHASE_ORDER',
          child: intl.get('sodr.workspace.view.button.batchAdd').d('批量新增'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'playlist_add',
            type: 'c7n-pro',
            loading: dataSet.status !== 'ready',
            onClick: async () => {
              const { poHeaderDetailDTO } = getValues();
              const lineNum = getMaxPoLineNum(basicInfoDs, ds);
              const maxPoLineNum = lineNum || poHeaderDetailDTO.maxPoLineNum;
              await handleBatchAdd(
                { basicInfoDs, ds },
                {
                  poHeaderDetailDTO: {
                    ...poHeaderDetailDTO,
                    maxPoLineNum,
                  },
                  handleCreate: handleAddNewLinesManually,
                  customizeForm,
                  code: 'SODR.WORKSPACE_CHANGE_DETAIL.BATCHADDMODAL',
                }
              );
            },
            wait: THROTTLE_TIME,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.button.change.batchAdd',
                meaning: '订单工作台-订单变更-批量新增',
              },
            ],
          },
        },
      ];
      return customizeBtnGroup(
        { code: 'SODR.WORKSPACE_CHANGE_DETAIL.LINE_BUTTONS', pro: true },
        <DynamicButtons buttons={btns} />
      );
    });
    return [<Buttons dataSet={ds} />];
  };
  return customizeTable(
    { code: 'SODR.WORKSPACE_CHANGE_DETAIL.DETAILINFO', lovIgnore: false },
    <SearchBarTable
      virtual
      virtualCell
      searchCode="SODR.WORKSPACE_CHANGE_DETAIL.SEARCH"
      spin={{ spinning: loadings.handleIncludedPriceFcous }}
      dataSet={ds}
      columns={columns}
      buttons={buttons()}
      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
      style={{ maxHeight: `calc(100vh - 320px)` }}
      className={styles['order-change-line-filter']}
      searchBarConfig={{
        // autoQuery: false,
        closeFilterSelector: true,
        onQuery: ({ params }) => {
          ds.queryDataSet.loadData([{ ...params }]);
          ds.query();
        },
      }}
    />
  );
};

export default DetailInfo;
