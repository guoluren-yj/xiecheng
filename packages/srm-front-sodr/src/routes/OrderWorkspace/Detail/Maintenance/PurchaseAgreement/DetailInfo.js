/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useMemo, cloneElement } from 'react';
import { isEmpty, throttle, omit } from 'lodash';
import { observer } from 'mobx-react-lite';
import {
  Modal,
  Form,
  DatePicker,
  Lov,
  TextField,
  Select,
  NumberField,
  DataSet,
  CheckBox,
  TextArea,
  TelField,
  Tooltip,
} from 'choerodon-ui/pro';
import { Alert, Icon } from 'choerodon-ui';
import DocFlow from '_components/DocFlow';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { Button } from 'components/Permission';
import SearchBarTable from '_components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import {
  useUomRender,
  useQuantityRender,
  useDoubleUomRender,
  useLocalAmountRender,
} from '@/routes/OrderWorkspace/hooks';
import Bom from '@/routes/components/Bom';
import CategoryLov from '@/routes/components/CategoryLov';
import ProjectTaskLov from '@/routes/components/ProjectTaskLov';
import TooltipButton from '@/routes/components/TooltipButton';
import { clearPoItemBOM, contractToLine, addDelete } from '@/services/orderWorkspaceService';
import { handleBatchOk, handleBatchSplit, viewCostInformation } from '@/routes/components/utils';
import { openModal } from '@/routes/components/AgreementLadderPrice';
import PurchaseAgreement from '../../../ReferenceDocument/PurchaseAgreement';
import { purchaseAgreement } from '../../../ReferenceDocument/store/referenceDocumentDs';
import styles from '../../index.less';

const DetailInfo = (props) => {
  const {
    ds,
    remote,
    basicInfoDs,
    loading = false,
    fetchDetailHeader,
    batchMaintenanceDs,
    customizeTable,
    customizeForm,
    poHeaderId,
    customizeBtnGroup,
    displayDocAndDocFlow = {},
    getValues = (e) => e,
  } = props;

  const basicCurrent = basicInfoDs?.current;
  const { displayPoNum, returnOrderFlag, fixedAssetsFlag } =
    basicCurrent?.get(['displayPoNum', 'returnOrderFlag', 'fixedAssetsFlag']) || {};
  const purchaseAgreementDs = useMemo(() => new DataSet(purchaseAgreement()), []);
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
  const handleCreateLine = async () => {
    const { selected } = purchaseAgreementDs;
    const validateRes = await Promise.all(selected.map((i) => i.validate(true)));
    if (validateRes.findIndex((i) => !i) === -1) {
      const data = selected.map((i) => i.toJSONData());
      const res = getResponse(
        await contractToLine({
          poHeaderId,
          data,
          query: {
            customizeUnitCode: 'SODR.WORKSPACE_PURCHASEAGREEMENT.LIST',
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

  const addPurchaseAgreement = () => {
    const Footer = observer(({ dataSet, okBtn, cancelBtn }) => {
      const { selected } = dataSet;
      return (
        <Fragment>
          {cloneElement(okBtn, { disabled: isEmpty(selected) })}
          {cancelBtn}
        </Fragment>
      );
    });
    Modal.open({
      title: intl.get('sodr.workspace.view.tabPane.purchaseAgreement').d('引用采购协议'),
      key: Modal.key(),
      drawer: true,
      destroyOnClose: true,
      style: { width: 1090 },
      children: (
        <PurchaseAgreement
          remote={remote}
          ds={purchaseAgreementDs}
          customizeTable={customizeTable}
          cacheKey="purchaseAgreement_detail"
        />
      ),
      okText: intl.get('hzero.common.button.creat').d('新建'),
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      afterClose: () => {
        purchaseAgreementDs.unSelectAll();
        purchaseAgreementDs.clearCachedSelected();
      },
      onOk: throttle(handleCreateLine, THROTTLE_TIME, { trailing: false }),
      footer: (okBtn, cancelBtn) => {
        return <Footer okBtn={okBtn} cancelBtn={cancelBtn} dataSet={purchaseAgreementDs} />;
      },
    });
  };

  const handleBatchMaintenance = () => {
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
            { code: 'SODR.WORKSPACE_PURCHASEAGREEMENT_DETAIL.BATCHEDIT', lovIgnore: false },
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
            getValues,
            remote,
            remoteCode: 'SODR.WORKSPACE_MAINTENANCE_PURCHASEAGREEMENT_PROCESS_BATCH_EDIT',
          }),
        THROTTLE_TIME,
        {
          trailing: false,
        }
      ),
    });
  };

  const handleDelete = async () => {
    const { selected = [], totalCount } = ds;
    const selectData = selected.map((i) => i.toData());
    const deleteFlag = selectData.some((i) => i.poLineLocationId);
    const { fundTermId } = basicInfoDs?.current?.get(['fundTermId']);
    if (deleteFlag) {
      if (selected.length >= totalCount) {
        notification.warning({
          message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
        });
        return;
      }
      const noSaveData = selectData.filter((i) => !i.poLineLocationId);
      ds.delete(selected, {
        title: intl.get('sodr.common.model.common.errorMessage').d('提示'),
        children: intl.get(`sodr.common.model.common.deltetLists`).d('是否删除数据？'),
      }).then(async (res) => {
        if (res && res.success) {
          if (fundTermId) {
            const result = await addDelete({
              poHeaderDetailDTO: basicInfoDs?.current?.toData(),
              poLineDetailDTOs: noSaveData,
            });
            getResponse(result);
          }
          ds.remove(selected, true);
          fetchDetailHeader(true);
        }
      });
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
            code="SODR.WORKSPACE_PURCHASEAGREEMENT_DETAIL.BOM"
          />
        ),
      });
    },
    THROTTLE_TIME,
    { trailing: false }
  );

  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      const { selected } = dataSet;
      const preButtons = [
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
                  code: 'srm.po-admin.po.order-workspace.ps.button.purchaseagreeline.batchedit',
                  type: 'c7n-pro',
                  meaning: '订单工作台-采购协议明细行-批量编辑',
                },
              ],
            },
          },
        },
        {
          name: 'purchaseAgreement',
          btnComp: Button,
          child: intl.get('sodr.workspace.view.tabPane.purchaseAgreement').d('引用采购协议'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'content_paste',
            type: 'c7n-pro',
            loading: ds.status !== 'ready',
            onClick: addPurchaseAgreement,
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
            wait: THROTTLE_TIME,
            disabled: !dataSet.selected.length,
            onClick: handleDelete,
            loading: dataSet.status !== 'ready',
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.purchaseagreeline.delete',
                type: 'c7n-pro',
                meaning: '订单工作台-采购协议明细行-删除',
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
            // disabled: !dataSet.selected.length,
            loading: dataSet.status !== 'ready',
            help: intl
              .get('sodr.workspace.view.help.selectBatchSplit')
              .d('点击后，可批量拆分数量均为1的订单行'),
            onClick: () =>
              handleBatchSplit({ basicInfoDs, getValues, callback: fetchDetailHeader, ds }),
            wait: THROTTLE_TIME,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.button.purchase_agreement.batchSplit',
                meaning: '订单工作台-采购协议明细行-批量拆分',
              },
            ],
          },
        },
      ];
      const buttons = remote
        ? remote.process('detailInfoGetButtons', preButtons, { dataSet, basicInfoDs })
        : preButtons;
      return customizeBtnGroup(
        { code: 'SODR.WORKSPACE_PURCHASEAGREEMENT_DETAIL.LINE_BUTTONS', pro: true },
        <DynamicButtons buttons={buttons} />
      );
    });
    return [<Buttons dataSet={ds} />];
  };
  const splitLine = (record) => {
    const fieldsMap = Object.keys(record.toData());
    const data = omit(record.get([...fieldsMap]), ['displayLineNum', 'lineNum']);
    const dataList = {
      ...data,
      poLineId: null,
      // displayLineNum: null,
      poLineLocationId: null,
    };
    const newRecord = ds.create({});
    newRecord.init(dataList);
  };

  const rendererLadderPrice = ({ record }) => {
    const { holdPcLineId, ladderQuotationFlag } = record.get([
      'holdPcLineId',
      'ladderQuotationFlag',
    ]);
    return ladderQuotationFlag === 1 && holdPcLineId ? (
      <a onClick={() => openModal({ pcSubjectId: holdPcLineId })}>
        {intl.get('sodr.workspace.model.common.ladderInquiry').d('阶梯价格')}
      </a>
    ) : null;
  };

  const columns = () => {
    const lineColumns = [
      {
        name: 'translate',
        width: 70,
        renderer: ({ record }) => {
          return (
            <a disabled={record.status === 'add'} onClick={() => splitLine(record)}>
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
        editor: () => doubleUnitEnabled === 2,
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
        editor: true,
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        editor: true,
      },
      {
        name: 'taxId',
        width: 150,
        editor: true,
      },
      {
        name: 'unitPriceBatch',
        width: 150,
        editor: true,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'ladderPrice',
        width: 100,
        renderer: rendererLadderPrice,
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
        // renderer: ({ record }) => (
        //   <Bom
        //     record={record}
        //     disabled={record.get('projectCategory') !== 'L'}
        //     customizeTable={customizeTable}
        //     code="SODR.WORKSPACE_PURCHASEAGREEMENT_DETAIL.BOM"
        //   />
        // ),
        renderer: ({ record }) => (
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
              checked={returnOrderFlag || record.get('returnedFlag')}
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
              checked={fixedAssetsFlag || record.get('fixedAssetsFlag')}
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
        name: 'sourceNumAndLine',
        width: 150,
        renderer: ({ text, record }) =>
          text === '|' ? '' : record.get('sourceNumAndLine') || record.get('sourceCodeNum'),
      },
      {
        name: 'contractLov',
        width: 150,
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
      },
      {
        name: 'domesticLineAmount',
        width: 150,
        renderer: useLocalAmountRender(basicCurrent),
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
        renderer: useLocalAmountRender(basicCurrent),
      },
      {
        name: 'budgetAccountId',
        width: 150,
        editor: true,
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
      {
        name: 'subSupplierId',
        width: 150,
        editor: true,
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
                    lineCode: 'SODR.WORKSPACE_PURCHASEAGREEMENT_DETAIL.COSTINFORMATION',
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
    return remote?.process('processColumns', lineColumns);
  };
  return (
    <>
      {remote.process('linePriceTip', { basicInfoDs, detailInfoDs: ds })}
      {customizeTable(
        {
          code: 'SODR.WORKSPACE_PURCHASEAGREEMENT_DETAIL.DETAILINFO',
          __force_record_to_update__: true,
          lovIgnore: false,
        },
        <SearchBarTable
          searchCode="SODR.WORKSPACE_PURCHASEAGREEMENT_DETAIL.DETAILINFO_FILTER"
          spin={{ spinning: loading }}
          dataSet={ds}
          columns={columns()}
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
    </>
  );
};

export default DetailInfo;
