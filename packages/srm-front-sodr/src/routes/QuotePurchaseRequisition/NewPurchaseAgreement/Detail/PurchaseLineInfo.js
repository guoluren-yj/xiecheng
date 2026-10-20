import React, { useCallback, useContext, useMemo, cloneElement, Fragment } from 'react';
// import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
  // Button,
  DatePicker,
  Form,
  Lov,
  Modal,
  // NumberField,
  // Select,
  Table,
  TextArea,
  Tooltip,
  Icon,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import DocFlow from '_components/DocFlow';
import { Button } from 'components/Permission';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { isEmpty, throttle } from 'lodash';
import CategoryLov from '@/routes/components/CategoryLov';
import { formatAumont, redirectToOther } from '@/routes/components/utils';
import { contractToLine } from '@/services/quotePurchaseRequisitionService';
import renderPhone from '../../components/NewPhoneRender';
import { handleBatchOk } from '@/routes/QuotePurchaseRequisition/utils';
import openCustomSpecModal from '../../components/newCustomSpecModal';
import PurchaseAgreement from './PurchaseAgreement';
import { openModal } from '@/routes/components/AgreementLadderPrice';
import { Store } from './stores';
import styles from './index.less';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
// const style = { width: 120 };

// const batchMap = {
//   needByDate: {
//     callback(header, value) {
//       header.set('batchMaintainDemandDate', value);
//     },
//   },
//   taxId: {
//     validateLine(line) {
//       return !line.get('priceLibraryId') || !line.get('taxRate') || !line.get('priceTaxId');
//     },
//     callback(header, value) {
//       header.set({
//         batchMaintainTaxRate: value.taxRate,
//         batchMaintainTaxId: value.taxId,
//       });
//     },
//   },
//   invInventoryId: {
//     validate({ lineDs, selected }) {
//       const selectArr = (selected.length ? selected : lineDs).map(i =>
//         i.get('invOrganizationId.organizationId')
//       );
//       if ([...new Set(selectArr)].length > 1) {
//         notification.error({
//           message: intl
//             .get(`sodr.quotePurchase.model.quotePurchase.invErrorMsg`)
//             .d('库存组织不一致，请检查'),
//         });
//         return false;
//       }
//     },
//     callback(header, value) {
//       header.set('batchMaintainInvInventoryId', value.inventoryId);
//     },
//   },
//   costId: {
//     callback(header, value) {
//       header.set({
//         batchMaintainCostId: value.costId,
//         batchMaintainCostCode: value.costName,
//       });
//     },
//   },
//   invOrganizationId: {
//     async validate({ lineDs, value }) {
//       const response = await checkInvOrganization({
//         list: lineDs.toData(),
//         invOrganizationId: value.organizationId,
//       });
//       try {
//         return getResponse(JSON.parse(response)) === 'SUCCESS';
//       } catch (e) {
//         return response === 'SUCCESS';
//       }
//     },
//   },
//   enteredTaxIncludedPrice: {
//     validateLine(line) {
//       return !line.get('priceLibraryId') || !line.get('priceTaxId');
//     },
//   },
//   unitPrice: {
//     validateLine(line) {
//       return !line.get('priceLibraryId') || !line.get('priceTaxId');
//     },
//   },
// };

// const BatchEditor = observer(function BatchEditor() {
//   const { maintainDs, lineDs, header } = useContext(Store);
//   const { current } = maintainDs;
//   const selectOptionKey = current.get('selectOptionKey');
//   const handleMaintain = useCallback(async () => {
//     const value = current.get(selectOptionKey);
//     if (value) {
//       const { selected } = lineDs;
//       const { validate, validateLine, callback } = batchMap[selectOptionKey] || {};
//       if (!validate || (await validate({ value, selected, lineDs })) !== false) {
//         runInAction(() => {
//           (selected.length ? selected : lineDs).forEach(line => {
//             if (!validateLine || validateLine(line)) {
//               line.set(selectOptionKey, value);
//             }
//           });
//           if (callback) {
//             callback(header, value);
//           }
//         });
//       }
//     }
//   }, [current, header, lineDs, selectOptionKey]);
//   const handleCancelLines = useCallback(() => {
//     const poSourcePlatform = header.get('poSourcePlatform');
//     const { selected } = lineDs;
//     if (
//       ['SRM', 'ERP', 'SHOP'].includes(poSourcePlatform) &&
//       (lineDs.length === 1 ||
//         selected.length >= lineDs.length ||
//         lineDs.every(n => {
//           return !n.get('displayLineNum') || selected.includes(n);
//         }))
//     ) {
//       notification.warning({
//         message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
//       });
//     } else {
//       lineDs.delete(selected, intl.get(`sodr.common.model.common.deltetList`).d('是否删除数据'));
//     }
//   }, [lineDs, header]);
//   const getMaintenanceCom = () => {
//     switch (selectOptionKey) {
//       case 'needByDate':
//         return <DatePicker name={selectOptionKey} />;
//       case 'taxId':
//       case 'invInventoryId':
//       case 'costId':
//       case 'invOrganizationId':
//         return <Lov name={selectOptionKey} />;
//       case 'enteredTaxIncludedPrice':
//       case 'unitPrice':
//         return <NumberField name={selectOptionKey} />;
//       default:
//         return <TextField name={selectOptionKey} />;
//     }
//   };
//   return (
//     <Form layout="none" dataSet={maintainDs} className={styles['sodr-purchase-batch-editor']}>
//       <Select name="selectOptionKey" style={style} clearButton={false} />
//       <span className="colon">:</span>
//       {getMaintenanceCom()}
//       <Button
//         data-code="search"
//         type="submit"
//         color="primary"
//         onClick={handleMaintain}
//         disabled={lineDs.length === 0}
//       >
//         {intl.get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`).d('批量维护')}
//       </Button>
//       <span className="split-border" />
//       <Button color="primary" onClick={handleCancelLines} disabled={!lineDs.selected.length}>
//         {intl.get(`hzero.common.button.delete`).d('删除')}
//       </Button>
//     </Form>
//   );
// });

const PurchaseLineInfo = function PurchaseLineInfo() {
  const {
    customizeForm,
    customizeTable,
    lineDs,
    header,
    maintainDs,
    purchaseAgreementDs,
    poHeaderId,
    headerDs,
    cuxRemote,
  } = useContext(Store);
  const doubleUnitEnabled = lineDs.getState('doubleUnitEnabled');
  const handleTranslate = useCallback((record) => {
    const newRecord = lineDs.create({}, record.index + 1);
    const fieldsMap = Object.keys(record.toData());
    const data = record.get([...fieldsMap]);
    newRecord.init({
      ...data,
      poLineId: null,
      displayLineNum: null,
      poLineLocationId: null,
    });
  }, []);

  const handleBatchMaintenance = () => {
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
      children: (
        <Fragment>
          <Alert
            className={styles['order-top-title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />
                {!isEmpty(lineDs.selected)
                  ? intl
                      .get(`sodr.workspace.view.alert.batchAllMaintainData`, {
                        num: lineDs.selected.length,
                      })
                      .d(`已勾选${lineDs.selected.length}条数据进行批量编辑`)
                  : intl
                      .get('sodr.workspace.view.alert.currentPagebatchAllMaintain')
                      .d('针对当前页全部数据进行批量编辑')}
              </div>
            }
            closable
          />
          {customizeForm(
            {
              code: 'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
            },
            <Form dataSet={maintainDs} columns={1} labelLayout="float">
              <Lov name="invOrganizationId" />
              <Lov
                name="invInventoryId"
                disabled={!maintainDs?.current?.get('invOrganizationId.organizationId')}
              />
              <DatePicker name="needByDate" />
              <Lov name="taxId" />
              <Lov name="costId" />
            </Form>
          )}
        </Fragment>
      ),
      onOk: throttle(
        () =>
          handleBatchOk({
            ds: lineDs,
            batchMaintenanceDs: maintainDs,
            headerInfoDs: headerDs,
            remote: cuxRemote,
            remoteCode: 'SODR_PURCHASE_AGREEMENT_C7N',
          }),
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const handleCreateLine = async () => {
    const { selected } = purchaseAgreementDs;
    const validateRes = await Promise.all(selected.map((i) => i.validate()));
    if (validateRes.findIndex((i) => !i) === -1) {
      const data = selected.map((i) => i.toJSONData());
      const res = getResponse(
        await contractToLine({
          poHeaderId,
          data,
          query: { customizeUnitCode: 'SODR.REFERENCE_PURCHASE_AGREEMENT.LINE' },
        })
      );
      if (res) {
        headerDs.query(undefined, undefined, true);
        lineDs.query();
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
          dataSet={purchaseAgreementDs}
          history={history}
          customizeTable={customizeTable}
        />
      ),
      okText: intl.get('hzero.common.button.creat').d('新建'),
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      okProps: {
        icon: 'add',
      },
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

  const handleDelete = useCallback(() => {
    const poSourcePlatform = header.get('poSourcePlatform');
    const { selected } = lineDs;
    if (
      ['SRM', 'ERP', 'SHOP'].includes(poSourcePlatform) &&
      (lineDs.length === 1 ||
        selected.length >= lineDs.length ||
        lineDs.every((n) => {
          return !n.get('displayLineNum') || selected.includes(n);
        }))
    ) {
      notification.warning({
        message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
      });
    } else {
      lineDs
        .delete(selected, intl.get(`sodr.common.model.common.deltetList`).d('是否删除数据'))
        .then((res) => {
          if (res && res.success) {
            headerDs.query(undefined, undefined, true);
            // lineDs.query(undefined, undefined, true);
          }
        });
    }
  }, [lineDs, header]);

  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      return (
        <>
          <Button
            funcType="flat"
            icon="mode_edit"
            color="primary"
            type="c7n-pro"
            onClick={handleBatchMaintenance}
            disabled={!lineDs.length}
          >
            {dataSet.selected.length > 0 ? (
              <Tooltip
                title={intl
                  .get('sodr.quotePurchase.view.nStripTickaBtchEdit', {
                    n: dataSet.selected.length,
                  })
                  .d(`已勾选${dataSet.selected.length}条数据进行批量编辑`)}
              >
                {intl.get(`sodr.quotePurchase.view.button.tickaBtchEdit`).d('勾选批量编辑')}
              </Tooltip>
            ) : (
              <Tooltip
                title={intl
                  .get('sodr.quotePurchase.view.allBatchMaintain')
                  .d('批量编辑当前页全部数据')}
              >
                {intl.get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`).d('批量编辑')}
              </Tooltip>
            )}
          </Button>
          <Button
            funcType="flat"
            icon="content_paste"
            color="primary"
            type="c7n-pro"
            onClick={addPurchaseAgreement}
            permissionList={[
              {
                code: `srm.po-admin.po.po-change.ps.detail.purchaseagreement.quote`,
                type: 'button',
                meaning: '订单维护-引用采购协议明细-引用采购协议',
              },
            ]}
          >
            {intl.get('sodr.workspace.view.tabPane.purchaseAgreement').d('引用采购协议')}
          </Button>
          <Button
            wait={THROTTLE_TIME}
            funcType="flat"
            color="primary"
            icon="delete"
            type="c7n-pro"
            // loading={loadings.deleteLine}
            disabled={!dataSet.selected.length}
            onClick={handleDelete}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
        </>
      );
    });
    return [<Buttons dataSet={lineDs} />];
  };

  const rendererLadderPrice = ({ record }) => {
    const { holdPcLineId, ladderQuotationFlag } = record.get([
      'holdPcLineId',
      'ladderQuotationFlag',
    ]);
    const title = intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格');
    return (
      ladderQuotationFlag === 1 &&
      holdPcLineId && (
        <a onClick={() => openModal({ pcSubjectId: holdPcLineId }, { title })}>{title}</a>
      )
    );
  };

  const columns = useMemo(
    () => [
      {
        name: 'translate',
        width: 60,
        renderer: ({ record }) => (
          <a disabled={!record.get('displayLineNum')} onClick={() => handleTranslate(record)}>
            {intl.get(`sodr.common.model.common.translate`).d('拆分')}
          </a>
        ),
      },
      {
        name: 'displayLineNum',
        width: 80,
      },
      {
        name: 'displayLineLocationNum',
        width: 90,
      },
      {
        name: 'invOrganizationId',
        width: 200,
        editor: true,
      },
      {
        width: 150,
        name: 'itemId',
        editor: true,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        width: 130,
        name: 'categoryId',
        editor: (record) => <CategoryLov data={{ record, ds: lineDs }} />,
      },
      {
        width: 150,
        name: 'skuType',
      },
      {
        width: 150,
        name: 'customUomName',
      },
      {
        width: 150,
        name: 'customQuantity',
      },
      {
        width: 150,
        name: 'packageQuantity',
      },
      {
        width: 150,
        name: 'customSpecsJson',
        renderer: ({ value }) => (
          <a
            onClick={() => {
              openCustomSpecModal({
                dataSource: value ? JSON.parse(value) : [],
              });
            }}
          >
            {intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性')}
          </a>
        ),
      },
      {
        width: 150,
        name: 'customSpecs',
        editor: <TextArea resize="vertical" rows={1} />,
      },
      {
        width: 120,
        name: 'commonName',
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 120,
        editor: true,
      },
      doubleUnitEnabled && {
        width: 140,
        name: 'secondaryUomId',
        editor: () => doubleUnitEnabled === 2,
      },
      {
        name: 'quantity',
        width: 120,
        editor: true,
      },
      {
        width: 140,
        name: 'uomId',
        editor: true,
      },
      {
        width: 120,
        name: 'currencyCode',
      },
      {
        width: 120,
        name: 'ladderPrice',
        renderer: rendererLadderPrice,
      },
      {
        width: 120,
        name: 'taxId',
        editor: true,
      },
      {
        width: 150,
        name: 'unitPrice',
        editor: true,
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 140,
        editor: true,
      },
      {
        name: 'unitPriceBatch',
        width: 140,
        editor: true,
      },
      {
        name: 'invInventoryId',
        width: 200,
        editor: true,
      },
      {
        name: 'invLocationName',
        width: 200,
        editor: true,
      },
      {
        width: 150,
        name: 'needByDate',
        editor: true,
      },
      {
        name: 'shipToThirdPartyName',
        width: 120,
        editor: true,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 200,
        editor: true,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 200,
        editor: true,
      },
      {
        width: 120,
        name: 'costId',
        editor: true,
      },
      {
        width: 120,
        name: 'accountSubjectId',
        editor: true,
      },
      {
        width: 165,
        name: 'wbsCode',
        editor: true,
      },
      {
        name: 'returnedFlag',
        width: 100,
        editor: true,
      },
      {
        name: 'brand',
        width: 120,
        editor: true,
      },
      {
        name: 'specifications',
        width: 120,
        editor: true,
      },
      {
        name: 'model',
        width: 120,
        editor: true,
      },
      {
        width: 150,
        name: 'displayPrNumAndDisplayPrLineNum',
      },
      {
        width: 150,
        name: 'contractNum',
        renderer: ({ value, record }) => (
          <a onClick={() => redirectToOther('contract', record.toData())}>
            {value === '|' ? '-' : value}
          </a>
        ),
      },
      {
        width: 150,
        name: 'sourceNumAndLine',
        renderer: ({ value, record }) =>
          value === '|' ? '-' : value || record.get('sourceCodeNum'),
      },
      {
        width: 120,
        name: 'prRequestedName',
        renderer: ({ record }) => record.get('purReqAppliedName'),
      },
      {
        width: 150,
        name: 'accountAssignTypeId',
        editor: true,
      },
      {
        name: 'remark',
        width: 120,
        editor: true,
      },
      {
        name: 'attachmentUuid',
        width: 100,
        editor: true,
      },
      {
        width: 120,
        name: 'domesticTaxIncludedPrice',
      },
      {
        width: 120,
        name: 'domesticUnitPrice',
      },
      {
        width: 120,
        name: 'domesticTaxIncludedLineAmount',
        renderer: ({ value, record }) =>
          formatAumont(value, record.get('domesticFinancialPrecision'), true),
      },
      {
        width: 120,
        name: 'domesticLineAmount',
        renderer: ({ value, record }) =>
          formatAumont(value, record.get('domesticFinancialPrecision'), true),
      },
      {
        width: 300,
        name: 'receiveTelNum',
        editor: (record) =>
          renderPhone({
            record,
            internationalTelName: 'internationalTelCode',
          }),
        renderer: ({ record, text }) =>
          [record.get('internationalTelCode'), text].filter(Boolean).join('-'),
      },
      {
        width: 180,
        name: 'budgetAccountId',
        editor: true,
      },
      {
        width: 150,
        name: 'receiveToleranceQuantityType',
        editor: true,
      },
      {
        width: 150,
        name: 'receiveToleranceQuantity',
        editor: true,
      },
      {
        width: 180,
        name: 'subSupplierId',
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
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
    ],
    [doubleUnitEnabled]
  );
  return (
    <>
      {/* <BatchEditor /> */}

      {customizeTable(
        {
          code: 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
          __force_record_to_update__: true,
        },
        <Table columns={columns} dataSet={lineDs} buttons={getButtons()} />
      )}
    </>
  );
};

export default observer(PurchaseLineInfo);
