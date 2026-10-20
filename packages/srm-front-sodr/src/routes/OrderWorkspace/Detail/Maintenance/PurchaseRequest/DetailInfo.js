/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useMemo, cloneElement } from 'react';
import {
  Modal,
  NumberField,
  Form,
  DatePicker,
  Lov,
  TextField,
  Select,
  Icon,
  DataSet,
  CheckBox,
  TextArea,
  TelField,
  Tooltip,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { toJS, isObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { isEmpty, throttle, omit } from 'lodash';
import DocFlow from '_components/DocFlow';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Button } from 'components/Permission';
import SearchBarTable from '_components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import CommonImport from 'components/Import';
import { SRM_SPUC } from '_utils/config';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

import {
  useUomRender,
  usePriceRender,
  useDoubleUomRender,
  // useAmountRender,
  useQuantityRender,
  useLocalAmountRender,
  useLocalPriceRender,
} from '@/routes/OrderWorkspace/hooks';
import { handleBatchOk, handleBatchSplit, viewCostInformation } from '@/routes/components/utils';
import C7nPriceModal from '@/routes/components/C7nPriceModal';
import Bom from '@/routes/components/Bom';
import CategoryLov from '@/routes/components/CategoryLov';
import ProjectTaskLov from '@/routes/components/ProjectTaskLov';
import CustomSpecsModal from '@/routes/components/CustomSpecsModal';
import { clearPoItemBOM, priceUpdate, prToLine, addDelete } from '@/services/orderWorkspaceService';
import TooltipButton from '@/routes/components/TooltipButton';
import ChangeOuAlert from '@/routes/components/Alert/ChangeOuAlert';
import PurchaseRequest from '../../../ReferenceDocument/PurchaseRequest';
import { purchaseRequest } from '../../../ReferenceDocument/store/referenceDocumentDs';
import styles from '../../index.less';

const organizationId = getCurrentOrganizationId();

const DetailInfo = (props) => {
  const {
    ds,
    remote,
    history,
    setPrice,
    loadings,
    poHeaderId,
    customizeTable,
    priceUpdateList,
    getValues = (e) => e,
    handleIncludedPriceFcous = (e) => e,
    loading,
    batchMaintenanceDs,
    fetchDetailHeader = (e) => e,
    basicInfoDs,
    customizeForm,
    customizeBtnGroup,
    organizationInfoDs,
    displayDocAndDocFlow = {},
  } = props;
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
  const purchaseRequestDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SODR.WORKSPACE_MAINTENANCE_PURCHASEREQUEST_PROCESS_PURCHASE_DS',
              purchaseRequest({ remote }),
              { props }
            )
          : purchaseRequest({ remote })
      ),
    []
  );
  const basicCurrent = basicInfoDs?.current;
  const { sourceBillTypeCode, unSaveEnable, summaryFlag, displayPoNum } = basicCurrent.get([
    'sourceBillTypeCode',
    'unSaveEnable',
    'summaryFlag',
    'displayPoNum',
  ]);
  const isRequest = sourceBillTypeCode === 'PURCHASE_REQUEST'; // 引用采购申请
  const Modifiable = !(isRequest && [1, 2].includes(unSaveEnable));
  const priceModalParams = (record) => {
    const line = record.toJSONData();
    const { poHeaderDetailDTO = {} } = getValues();
    return { poHeaderDetailDTO, poLineDetailDTOs: [line] };
  };

  const handleDelete = async () => {
    const { selected = [], totalCount } = ds;
    const selectData = selected.map((i) => i.toData());
    const deleteFlag = selectData.some((i) => i.poLineLocationId);
    const beforRes = await remote.event.fireEvent('beforDeleteLine', { deleteFlag, basicInfoDs });
    if (!beforRes) return;
    const { fundTermId } = basicInfoDs?.current?.get(['fundTermId']);
    if (deleteFlag) {
      const validateFlag = remote
        ? remote.process(
            'SODR.WORKSPACE_MAINTENANCE_PURCHASEREQUEST_PROCESS_VALIDATE',
            selected.length >= totalCount
          )
        : selected.length >= totalCount;
      if (validateFlag) {
        notification.warning({
          message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
        });
        return;
      }
      const noSaveData = selectData.filter((i) => !i.poLineLocationId);
      const res = await ds.delete(selected, {
        title: intl.get('sodr.common.model.common.errorMessage').d('提示'),
        children: intl.get(`sodr.common.model.common.deltetLists`).d('是否删除数据？'),
      });
      if (res && res.success) {
        if (fundTermId) {
          const result = await addDelete({
            poHeaderDetailDTO: basicInfoDs?.current?.toData(),
            poLineDetailDTOs: noSaveData,
          });
          getResponse(result);
        }
        ds.remove(selected, true);
        await fetchDetailHeader(true);
      }
    } else if (fundTermId) {
      const res = await addDelete({
        poHeaderDetailDTO: basicInfoDs?.current?.toData(),
        poLineDetailDTOs: selectData,
      });
      if (getResponse(res)) {
        ds.remove(selected);
      }
    } else {
      ds.remove(selected);
    }
    remote.event.fireEvent('afterDeleteLine', { deleteFlag, basicInfoDs });
  };

  const handleBatchMaintenance = () => {
    const { benchmarkPriceType } = basicInfoDs.toJSONData()[0];
    const { selected } = ds;
    Modal.open({
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
            { code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BATCHEDIT', lovIgnore: false },
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
              <Lov name="invInventoryId" />
              <Lov name="invLocationId" />
              <DatePicker name="needByDate" />
              <Lov name="taxId" />
              <Lov name="costId" />
              <Lov name="departmentId" />
              <Lov
                name="projectCategory"
                placeholder={intl.get('sodr.workspace.model.common.projectCategory').d('项目类别')}
              />
              <NumberField name="unitPriceBatch" />
              <TextField name="shipToThirdPartyAddress" />
              <TextField name="shipToThirdPartyContact" />
              <NumberField
                name="enteredTaxIncludedPrice"
                disabled={benchmarkPriceType === 'NET_PRICE'}
              />
              <NumberField
                name="unitPrice"
                disabled={
                  benchmarkPriceType === 'TAX_INCLUDED_PRICE' || benchmarkPriceType === undefined
                }
              />
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
              <NumberField name="receiveToleranceQuantity" />
              <Select name="receiveToleranceQuantityType" />
              <TelField name="receiveTelNum" />
            </Form>
          )}
        </Fragment>
      ),
      onOk: throttle(
        () =>
          handleBatchOk(batchMaintenanceDs, ds, {
            hasPriceLibrary: true,
            getValues,
            remote,
            remoteCode: 'SODR.WORKSPACE_MAINTENANCE_PURCHASEREQUEST_PROCESS_BATCH_EDIT',
          }),
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const handleUpdatePrice = () => {
    loading({ updatePrice: true });
    priceUpdate({
      poHeaderId,
      query: {
        customizeUnitCode: `SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BASICINFO,SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.ORGANIZATIONINFO,SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO`,
      },
    }).then((res) => {
      loading({ updatePrice: false });
      if (getResponse(res)) {
        fetchDetailHeader();
      }
    });
  };

  const handleCreateLine = async () => {
    const { selected } = purchaseRequestDs;
    const validateRes = await Promise.all(selected.map((i) => i.validate(true)));
    if (validateRes.findIndex((i) => !i) === -1) {
      const data = selected.map((i) => i.toJSONData());
      const flag = remote
        ? remote.process('SODR.WORKSPACE_MAINTENANCE_PURCHASEREQUEST_PROCESS_CREATE_LINE', false, {
            props,
            history,
            purchaseRequestDs,
            fetchDetailHeader,
          })
        : false;
      if (flag) {
        return;
      }
      const res = getResponse(
        await prToLine({
          poHeaderId,
          data,
          query: {
            customizeUnitCode: 'SODR.WORKSPACE_PURCHASEREQUEST.LIST',
            poWorkbenchFlag: 1,
          },
        })
      );
      if (res) {
        fetchDetailHeader(true);
      }
      return !!res;
    }
    return false;
  };

  const addPurchaseRequisition = async () => {
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
    const result = await remote.process('handleBeforAdd', {
      detailPageDs: { basicInfoDs, organizationInfoDs, detailInfoDs: ds },
    });
    if (!result) return;
    Modal.open({
      title: intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请'),
      key: Modal.key(),
      drawer: true,
      destroyOnClose: true,
      style: { width: 1090 },
      children: (
        <PurchaseRequest
          remote={remote}
          detailPageDs={{ basicInfoDs, organizationInfoDs, detailInfoDs: ds }}
          ds={purchaseRequestDs}
          customizeTable={customizeTable}
          cacheKey="purchaseRequest_detail"
        />
      ),
      okText: intl.get('hzero.common.button.creat').d('新建'),
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      afterClose: () => {
        purchaseRequestDs.unSelectAll();
        purchaseRequestDs.clearCachedSelected();
      },
      onOk: throttle(handleCreateLine, THROTTLE_TIME, { trailing: false }),
      footer: (okBtn, cancelBtn) => {
        return <Footer okBtn={okBtn} cancelBtn={cancelBtn} dataSet={purchaseRequestDs} />;
      },
    });
  };

  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      const { selected } = dataSet;
      const buttons = [
        {
          name: 'updatePrice',
          child: intl.get(`sodr.workspace.view.button.quoteTheLatestPrice`).d('引用最新价格'),
          btnComp: Button,
          btnProps: {
            wait: THROTTLE_TIME,
            icon: 'root',
            funcType: 'flat',
            color: 'primary',
            type: 'c7n-pro',
            onClick: handleUpdatePrice,
            loading: loadings.updatePrice || dataSet.status !== 'ready',
            disabled: isEmpty(priceUpdateList),

            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.purrqsline.newprice',
                type: 'c7n-pro',
                meaning: '订单工作台-采购申请明细行-引用最新价格',
              },
            ],
          },
        },
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
              onClick: handleBatchMaintenance,
              loading: dataSet.status !== 'ready',
              permissionList: [
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.purrqsline.batchedit',
                  type: 'c7n-pro',
                  meaning: '订单工作台-采购申请明细行-批量编辑',
                },
              ],
            },
          },
        },
        {
          name: 'lineImport',
          btnComp: CommonImport,
          childFor: 'buttonText',
          child: intl.get(`hzero.common.button.batchImport`).d('批量导入'),
          btnProps: {
            businessObjectTemplateCode: 'SPUC.PR_PO_LINE_IMPORT',
            prefixPatch: SRM_SPUC,
            refreshButton: true,
            args: { tenantId: organizationId, poHeaderId },
            successCallBack: () => fetchDetailHeader(true), // 导入成功的回调
            buttonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              loading: dataSet.status !== 'ready',
            },
          },
        },
        {
          name: 'purchaseRequest',
          btnComp: Button,
          hidden: !Modifiable,
          child: intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'contact_mail-o',
            type: 'c7n-pro',
            loading: ds.status !== 'ready',
            onClick: addPurchaseRequisition,
          },
        },
        {
          name: 'delete',
          btnComp: Button,
          child: intl.get(`hzero.common.button.batchDelete`).d('批量删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete_sweep',
            type: 'c7n-pro',
            disabled: !dataSet.selected.length,
            loading: dataSet.status !== 'ready',
            onClick: handleDelete,
            wait: THROTTLE_TIME,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.purrqsline.delete',
                type: 'c7n-pro',
                meaning: '订单工作台-采购申请明细行-删除',
              },
            ],
          },
        },
        {
          name: 'batchSplit',
          btnComp: Button,
          child: dataSet.selected.length
            ? intl.get(`sodr.workspace.view.button.selectBatchSplit`).d('勾选批量拆分')
            : intl.get(`sodr.workspace.view.button.batchSplit`).d('批量拆分'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'add_road-o',
            type: 'c7n-pro',
            disabled: unSaveEnable !== 0,
            loading: dataSet.status !== 'ready',
            help: intl
              .get('sodr.workspace.view.help.selectBatchSplit')
              .d('点击后，可批量拆分数量均为1的订单行'),
            onClick: () =>
              handleBatchSplit({ basicInfoDs, getValues, callback: fetchDetailHeader, ds }),
            wait: THROTTLE_TIME,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.button.purchase_request.batchSplit',
                meaning: '订单工作台-采购申请明细行-批量拆分',
              },
            ],
          },
        },
      ];
      return customizeBtnGroup(
        { code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.LINE_BUTTONS', pro: true },
        <DynamicButtons buttons={remote.process('detailInfoGetButtons', buttons, { ds })} />
      );
    });
    return [<Buttons dataSet={ds} />];
  };

  const openC7nPriceModal = (record) => {
    const currentProps = {
      readOnly: false,
      customizeTable,
      summaryFlag,
      params: priceModalParams(record),
      code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.REFERENCE_PRICE',
    };
    Modal.open({
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
      children: (
        <C7nPriceModal
          {...remote.process('transformPriceModalProps', currentProps, { basicInfoDs, record })}
        />
      ),
      onOk: setPrice,
    });
  };

  const openBom = throttle(
    async (record) => {
      if (record.status === 'add') {
        Modal.info({
          children: intl
            .get('sodr.workspace.view.info.noSaveBomLine')
            .d('该订单行未保存，bom信息不能维护，请先保存！'),
        });
        return;
      }
      if (!record.get('quantity') > 0) {
        notification.error({
          description: intl
            .get('sodr.workspace.view.message.orderLineQuantityByBom')
            .d('请输入>0的订单数量信息'),
        });
        return;
      }
      if (record.get('saveBomItemId') !== record.get('itemId')?.itemId) {
        const res = await getResponse(clearPoItemBOM({ poLineId: record.get('poLineId') }));
        if (res) {
          record.set({ saveBomItemId: record.get('itemId')?.itemId });
        }
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
            compatible={{
              queryPara: remote.process(
                'transformBomQueryPara',
                {
                  itemId: record.get('itemId')?.itemId,
                },
                { basicInfoDs, record }
              ),
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
            code="SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BOM"
          />
        ),
      });
    },
    THROTTLE_TIME,
    { trailing: false }
  );
  const splitLine = (record) => {
    const originData = record.toData();
    ds.fields.forEach((i) => {
      if (i.type === 'object') {
        const value = i.getValue(record);
        if (isObservable(value)) {
          originData[i.name] = toJS(value);
        }
      }
    });
    const data = omit(originData, ['poLineId', 'poLineLocationId', 'lineNum', 'displayLineNum']);
    const newRecord = ds.create({});
    newRecord.init(data);
  };
  const columns = useMemo(() => {
    const lineColumns = [
      {
        name: 'translate',
        width: 70,
        renderer: ({ record }) => {
          return (
            <a disabled={!Modifiable || record.status === 'add'} onClick={() => splitLine(record)}>
              {intl.get(`sodr.workspace.view.button.split`).d('拆分')}
            </a>
          );
        },
      },
      {
        name: 'displayLineNum',
        width: 70,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      {
        name: 'itemId',
        width: 150,
        editor: true,
      },
      {
        name: 'itemName',
        width: 150,
        editor: true,
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
        renderer: useDoubleUomRender,
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
        renderer: useUomRender,
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
          <NumberField onFocus={() => handleIncludedPriceFcous(record, 'price')} />
        ),
        renderer: usePriceRender(basicCurrent),
        // renderer: ({ value, record }) => {
        //   return parseAumont(value, record.get('defaultPrecision'));
        // },
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        renderer: usePriceRender(basicCurrent),
        editor: (record) => (
          <NumberField onFocus={() => handleIncludedPriceFcous(record, 'price')} />
        ),
      },
      {
        name: 'taxId',
        width: 150,
        editor: true,
      },
      // {
      //   name: 'lastPurchasePrice',
      //   width: 150,
      //   renderer: ({ value }) => numberRender(value),
      // },
      {
        name: 'unitPriceBatch',
        width: 150,
        editor: true,
      },
      {
        name: 'currencyCode',
        width: 150,
        editor: true,
      },
      {
        name: 'referPrice',
        width: 150,
        renderer: ({ record }) => {
          // return (
          //   <C7nPriceModal
          //     readOnly={false}
          //     params={priceModalParams(record)}
          //     disabled={!saved}
          //     onOk={setPrice}
          //   />
          // );
          return (
            <a onClick={() => openC7nPriceModal(record)}>
              {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
            </a>
          );
        },
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
        name: 'departmentId',
        width: 150,
        editor: true,
      },
      {
        name: 'costId',
        width: 150,
        editor: true,
      },
      {
        name: 'projectCategory',
        width: 150,
        editor: true,
      },
      {
        name: 'bom',
        width: 150,
        renderer: ({ record }) => (
          // <Bom
          //   record={record}
          //   disabled={record.get('projectCategory') !== 'L' || !saved}
          //   customizeTable={customizeTable}
          //   code="SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.BOM"
          // />
          <a
            disabled={record.get('projectCategory')?.value !== 'L'}
            onClick={() => openBom(record)}
          >
            {intl.get('hzero.common.button.maintain').d('维护')}
          </a>
        ),
      },
      {
        name: 'freeFlag',
        align: 'left',
        width: 150,
        editor: true,
      },
      {
        name: 'returnedFlag',
        align: 'left',
        width: 150,
        editor: (record) => {
          return (
            <CheckBox
              checked={basicInfoDs.current.get('returnOrderFlag') || record.get('returnedFlag')}
              onChange={(e) => record.set({ returnedFlag: e })}
            />
          );
        },
      },
      {
        name: 'fixedAssetsFlag',
        align: 'left',
        width: 150,
        editor: (record) => {
          return (
            <CheckBox
              checked={basicCurrent.get('fixedAssetsFlag') || record.get('fixedAssetsFlag')}
              onChange={(e) => record.set({ fixedAssetsFlag: e })}
            />
          );
        },
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 150,
      },
      {
        name: 'contractLov',
        width: 150,
        // editor: true,
        renderer: ({ record }) => record.get('contractNum'),
      },
      {
        name: 'prRequestedName',
        width: 150,
        renderer: ({ record }) => record.get('purReqAppliedName'),
      },
      {
        name: 'remark',
        width: 150,
        editor: true,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: true,
      },
      // 默认隐藏字段
      {
        name: 'canHoldPrQuantity',
        width: 150,
      },
      {
        name: 'canHoldPcQuantity',
        width: 150,
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
        // editor: (record) => {
        //   return <TextField addonBefore={<Select record={record} name="internationalTelCode" />} />;
        // },
        // renderer: ({ record, text }) =>
        //   [record.get('internationalTelCode'), text].filter(Boolean).join('-'),
      },
      {
        name: 'skuType',
        width: 120,
      },
      {
        name: 'customUomName',
        width: 120,
      },
      {
        name: 'customQuantity',
        width: 120,
      },
      {
        name: 'packageQuantity',
        width: 120,
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'customSpecs',
        width: 150,
      },
      {
        name: 'commonName',
        width: 150,
      },
      {
        name: 'brand',
        width: 150,
        editor: true,
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
        name: 'accountAssignTypeId',
        width: 150,
        editor: true,
      },
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
        name: 'receiveToleranceQuantityType',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveToleranceQuantity',
        width: 150,
        editor: true,
      },
      {
        name: 'purchaseLineTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'priceSource',
        width: 150,
        renderer: ({ record }) => record.get('priceSourceMeaning'),
      },
      {
        name: 'priceSourceNum',
        width: 150,
      },
      {
        name: 'priceSourceLineNum',
        width: 150,
      },
      {
        name: 'docFlow',
        width: 100,
        className: styles['table-cell-height'],
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
      // {
      //   name: 'sourceNumAndLine',
      //   width: 150,
      //   renderer: ({ text, record }) =>
      //     text === '|' ? '' : record.get('sourceNumAndLine') || record.get('sourceCodeNum'),
      // },
      {
        name: 'subSupplierId',
        width: 150,
        editor: true,
      },
      {
        name: 'pcSubjectId',
        editor: (record) => {
          const pcHeaderIdLov = basicInfoDs.getField('pcHeaderIdLov');
          // 头上的关联采购协议不展示 && 行参考价格没有使用协议价
          return !pcHeaderIdLov.get('visible') && record.get('priceSource') !== 'CONTRACT';
        },
      },
      {
        name: 'costInformation',
        renderer: ({ record }) => {
          const isNewLine = record.status === 'add';
          return (
            <Tooltip
              title={
                isNewLine &&
                intl.get('sodr.workspace.model.costInformation.linkTooltip').d('请保存订单行')
              }
            >
              <Button
                type="c7n-pro"
                funcType="link"
                disabled={isNewLine}
                onClick={() =>
                  viewCostInformation({
                    record,
                    displayPoNum,
                    lineCode: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.COSTINFORMATION',
                  })
                }
              >
                {intl.get('sodr.workspace.model.costInformation.costInformation').d('费用信息')}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        name: 'fundLineTermId',
        width: 150,
        renderer: ({ record }) => record.get('fundLineTermName'),
      },
    ];
    return remote.process('processColumns', lineColumns, {
      handleIncludedPriceFcous,
      basicInfoDs,
      organizationInfoDs,
    });
  }, [doubleUnitEnabled, basicInfoDs, Modifiable, summaryFlag]);
  const otherAlert = useMemo(
    () =>
      !isEmpty(priceUpdateList) && (
        <Alert
          className={styles['order-top-title']}
          message={intl
            .get(`sodr.workspace.view.message.priceUpdate`)
            .d('价格库价格有更新，可点击下方左上角“引用最新价格”按钮获取最新价格')}
          type="info"
          showIcon
        />
      ),
    [priceUpdateList]
  );
  return (
    <Fragment>
      <ChangeOuAlert dataSet={ds.getState('organizationInfoDs')} otherAlert={otherAlert} />
      {remote.process('linePriceTip', { basicInfoDs, detailInfoDs: ds })}
      {customizeTable(
        {
          code: 'SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO',
          __force_record_to_update__: true,
          lovIgnore: false,
        },

        <SearchBarTable
          searchCode="SODR.WORKSPACE_PURCHASEREQUEST_DETAIL.DETAILINFO_FILTER"
          spin={{ spinning: loadings.handleIncludedPriceFcous }}
          dataSet={ds}
          columns={columns}
          buttons={getButtons()}
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          style={{ maxHeight: '450px' }}
          virtual
          virtualCell
          searchBarConfig={{
            // autoQuery: false,
            checkDataSetStatus: false,
            closeFilterSelector: true,
          }}
        />
      )}
    </Fragment>
  );
};

export default DetailInfo;
