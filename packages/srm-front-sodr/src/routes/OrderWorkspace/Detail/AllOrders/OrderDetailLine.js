/**
 * @Description:订单明细信息
 * @Date: 2021-09-16
 * @author: ljw <jiwei01.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import DocFlow from '_components/DocFlow';
import SearchBarTable from '_components/SearchBarTable';
import { useComputed } from 'mobx-react-lite';

import Bom from '@/routes/components/Bom';
import { renderStatus, viewCostInformation } from '@/routes/components/utils';
import CustomSpecsModal from '@/routes/components/CustomSpecsModal';
import {
  priceChangeTip,
  useAmountRender,
  useQuantityRender,
  useLocalAmountRender,
  useLocalPriceRender,
} from '@/routes/OrderWorkspace/hooks';
import AssociatedDocument from '../../AssociatedDocument';
// import remote from 'hzero-front/lib/utils/remote';

const DetailInfo = (props) => {
  const {
    ds,
    remote,
    basicInfoDs,
    customizeTable,
    bySourceCode,
    isDocFlowLink,
    displayDocAndDocFlow = {},
    fundTermDimension,
  } = props;
  const basicCurrent = basicInfoDs?.current;
  const displayPoNum = basicCurrent.get('displayPoNum');
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
  /**
   * 执行单据-关联订单状态
   * @param {*} record
   * @returns
   */
  const fetchLineDetail = useCallback(
    (record) => {
      const {
        poLineLocationId,
        // displayPoNum,
        displayLineNum,
        displayLineLocationNum,
        quantity,
      } = record.get([
        'poLineLocationId',
        // 'displayPoNum',
        'displayLineNum',
        'displayLineLocationNum',
        'quantity',
      ]);
      return Modal.open({
        key: Modal.key(),
        drawer: true,
        title: `${displayPoNum}-${displayLineNum}-${displayLineLocationNum}-${intl
          .get('sodr.workspace.model.common.quantity')
          .d('数量')}:${quantity}`,
        bodyStyle: { padding: 0 },
        children: (
          <AssociatedDocument
            displayPoNum={displayPoNum}
            poLineLocationId={poLineLocationId}
            record={record}
          />
        ),
        closable: true,
        movable: false,
        destroyOnClose: true,
        okText: intl.get('hzero.common.status.closed').d('关闭'),
        footer: (okBtn) => okBtn,
        style: { width: '1090px' },
      });
    },
    [displayPoNum]
  );
  // const columns = useMemo(
  //   () =>
  //     [
  //       {
  //         name: 'displayStatusCode',
  //         width: 120,
  //         renderer: ({ record }) =>
  //           renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
  //       },
  //       {
  //         name: 'displayLineNum',
  //         width: 80,
  //       },
  //       {
  //         name: 'displayLineLocationNum',
  //         width: 100,
  //       },
  //       {
  //         name: 'itemCode',
  //         width: 150,
  //       },
  //       {
  //         name: 'itemName',
  //         width: 150,
  //       },
  //       doubleUnitEnabled && {
  //         name: 'secondaryQuantity',
  //         width: 150,
  //         renderer: useQuantityRender(null, 'secondaryUomPrecision'),
  //       },
  //       doubleUnitEnabled && {
  //         name: 'secondaryUomCodeAndName',
  //         width: 150,
  //       },
  //       {
  //         name: 'quantity',
  //         width: 150,
  //         renderer: useQuantityRender(),
  //       },
  //       {
  //         name: 'uomCodeAndName',
  //         width: 150,
  //       },
  //       {
  //         name: 'needByDate',
  //         width: 150,
  //       },
  //       {
  //         name: 'unitPrice',
  //         width: 150,
  //         align: 'right',
  //         renderer: (data) => priceChangeTip(data, basicCurrent),
  //       },
  //       {
  //         name: 'lineAmount',
  //         width: 120,
  //         renderer: useAmountRender(basicCurrent, { bySourceCode }),
  //       },
  //       {
  //         name: 'enteredTaxIncludedPrice',
  //         width: 150,
  //         renderer: (data) => priceChangeTip(data, basicCurrent),
  //       },
  //       {
  //         name: 'taxIncludedLineAmount',
  //         width: 120,
  //         renderer: useAmountRender(basicCurrent, { bySourceCode }),
  //       },
  //       {
  //         name: 'taxRate',
  //         width: 80,
  //       },
  //       {
  //         name: 'unitPriceBatch',
  //         width: 80,
  //       },
  //       {
  //         name: 'currencyCode',
  //         width: 150,
  //       },
  //       {
  //         name: 'promiseDeliveryDate',
  //         width: 150,
  //       },
  //       {
  //         name: 'categoryName',
  //         width: 150,
  //       },
  //       {
  //         name: 'invOrganizationName',
  //         width: 150,
  //       },
  //       {
  //         name: 'inventoryName',
  //         width: 150,
  //       },
  //       {
  //         name: 'locationName',
  //         width: 150,
  //       },
  //       {
  //         name: 'consignedFlag',
  //         width: 150,
  //         renderer: ({ value }) => yesOrNoRender(value),
  //       },
  //       {
  //         name: 'returnedFlag',
  //         width: 150,
  //         renderer: ({ value }) => yesOrNoRender(value),
  //       },
  //       {
  //         name: 'freeFlag',
  //         width: 150,
  //         renderer: ({ value }) => yesOrNoRender(value),
  //       },
  //       {
  //         name: 'exemptInspectionFlag',
  //         width: 150,
  //         renderer: ({ value }) => yesOrNoRender(value),
  //       },
  //       {
  //         name: 'bom',
  //         width: 150,
  //         renderer: ({ record }) => (
  //           <a onClick={() => openBom(record)}>{intl.get('hzero.common.button.look').d('查看')}</a>
  //         ),
  //       },
  //       {
  //         name: 'displayPrNumAndDisplayPrLineNum',
  //         width: 150,
  //       },
  //       {
  //         name: 'sourceNumAndLine',
  //         width: 150,
  //         renderer: ({ value, record }) => value || record.get('sourceCodeNum'),
  //       },
  //       {
  //         name: 'contractNum',
  //         width: 150,
  //       },
  //       {
  //         name: 'prRequestedName',
  //         width: 150,
  //         renderer: ({ record }) => record.get('purReqAppliedName'),
  //       },
  //       {
  //         name: 'productNum',
  //         width: 150,
  //       },
  //       {
  //         name: 'productName',
  //         width: 150,
  //       },
  //       {
  //         name: 'catalogName',
  //         width: 150,
  //       },
  //       {
  //         name: 'shipToThirdPartyAddress',
  //         width: 150,
  //       },
  //       {
  //         name: 'shipToThirdPartyContact',
  //         width: 150,
  //       },
  //       {
  //         name: 'departmentName',
  //         width: 150,
  //       },
  //       {
  //         name: 'costName',
  //         width: 150,
  //       },
  //       {
  //         name: 'projectCategory',
  //         width: 150,
  //         renderer: ({ record }) => record.get('projectCategoryMeaning'),
  //       },
  //       {
  //         name: 'remark',
  //         width: 150,
  //       },
  //       {
  //         name: 'attachmentUuid',
  //         width: 150,
  //       },
  //       {
  //         name: 'accountSubjectName',
  //         width: 150,
  //       },
  //       {
  //         name: 'wbs',
  //         width: 150,
  //       },
  //       {
  //         name: 'domesticUnitPrice',
  //         width: 150,
  //         renderer: useLocalPriceRender(basicCurrent),
  //       },
  //       {
  //         name: 'domesticLineAmount',
  //         width: 150,
  //         renderer: useLocalAmountRender(basicCurrent, { bySourceCode }),
  //       },
  //       {
  //         name: 'domesticTaxIncludedPrice',
  //         width: 150,
  //         renderer: useLocalPriceRender(basicCurrent),
  //       },
  //       {
  //         name: 'domesticTaxIncludedLineAmount',
  //         width: 150,
  //         renderer: useLocalAmountRender(basicCurrent, { bySourceCode }),
  //       },
  //       {
  //         name: 'exchangeRate',
  //         width: 150,
  //       },
  //       {
  //         name: 'receiveTelNum',
  //         width: 150,
  //       },
  //       {
  //         name: 'brand',
  //         width: 150,
  //       },
  //       {
  //         name: 'specifications',
  //         width: 150,
  //       },
  //       {
  //         name: 'model',
  //         width: 150,
  //       },
  //       {
  //         name: 'skuType',
  //         width: 120,
  //       },
  //       {
  //         name: 'customUomName',
  //         width: 120,
  //       },
  //       {
  //         name: 'customQuantity',
  //         width: 120,
  //       },
  //       {
  //         name: 'packageQuantity',
  //         width: 120,
  //       },
  //       {
  //         name: 'customSpecsJson',
  //         width: 120,
  //         renderer: ({ value }) => (
  //           <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
  //         ),
  //       },
  //       {
  //         name: 'customSpecs',
  //         width: 150,
  //       },
  //       {
  //         name: 'productSpecs',
  //         width: 150,
  //       },
  //       {
  //         name: 'productSpecsJson',
  //         width: 120,
  //         renderer: ({ value }) => (
  //           <CustomSpecsModal type="productSpecs" data={value ? JSON.parse(value) : []} />
  //         ),
  //       },
  //       {
  //         name: 'productBrand',
  //         width: 150,
  //       },
  //       {
  //         name: 'productModel',
  //         width: 150,
  //       },
  //       {
  //         name: 'packingList',
  //         width: 150,
  //       },
  //       {
  //         name: 'priceSource',
  //         width: 150,
  //         renderer: ({ record }) => record.get('priceSourceMeaning'),
  //       },
  //       {
  //         name: 'priceSourceNum',
  //         width: 150,
  //       },
  //       {
  //         name: 'priceSourceLineNum',
  //         width: 150,
  //       },
  //       {
  //         name: 'accountAssignTypeCode',
  //         width: 150,
  //       },
  //       {
  //         name: 'receiveToleranceQuantity',
  //         width: 150,
  //       },
  //       {
  //         name: 'purchaseLineTypeId',
  //         width: 150,
  //         editor: true,
  //       },
  //       {
  //         name: 'budgetAccountName',
  //         width: 150,
  //       },
  //       {
  //         name: 'syncStatus',
  //         width: 120,
  //         renderer: ({ record }) => record.get('syncStatusMeaning'),
  //       },
  //       {
  //         name: 'checkContectDoc',
  //         width: 80,
  //         hidden: displayDocAndDocFlow.displayDoc !== '1',
  //         renderer: ({ record }) => {
  //           return (
  //             <a onClick={() => fetchLineDetail(record)}>
  //               {intl.get('sodr.workspace.modal.checkContectDoc').d('查看执行单据')}
  //             </a>
  //           );
  //         },
  //       },
  //       !isDocFlowLink && {
  //         name: 'docFlow',
  //         width: 100,
  //         hidden: displayDocAndDocFlow.displayDocFlow !== '1',
  //         renderer: ({ record }) => (
  //           <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
  //         ),
  //       },
  //       {
  //         name: 'deliveryStrategyId',
  //         width: 150,
  //       },
  //       {
  //         name: 'strategyHeaderId',
  //         width: 150,
  //       },
  //       {
  //         name: 'projectTaskId',
  //         width: 150,
  //         renderer: ({ record }) => record.get('projectTaskName'),
  //       },
  //       {
  //         name: 'costInformation',
  //         renderer: ({ record }) => {
  //           return (
  //             <Button
  //               funcType="link"
  //               onClick={() =>
  //                 viewCostInformation({
  //                   record,
  //                   displayPoNum,
  //                   lineCode: 'SODR.WORKSPACE_ALLORDERS_DETAIL.COSTINFORMATION',
  //                   viewOnly: true,
  //                 })
  //               }
  //             >
  //               {intl.get('sodr.workspace.model.costInformation.costInformation').d('费用信息')}
  //             </Button>
  //           );
  //         },
  //       },
  //       {
  //         name: 'originalPoLineId',
  //         width: 150,
  //         renderer: ({ record }) => record.get('displayOriginalPoAndLineNum'),
  //       },
  //     ].filter((i) => i),
  //   [doubleUnitEnabled, basicCurrent, isDocFlowLink, fetchLineDetail]
  // );

  const columns = useComputed(() => {
    const { cuxLineDetailAttrmentUuidChange } = remote?.props?.process || {};
    const column = [
      {
        name: 'displayStatusCode',
        width: 120,
        renderer: ({ record }) =>
          renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
      },
      {
        name: 'displayLineNum',
        width: 80,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
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
        renderer: useQuantityRender(null, 'secondaryUomPrecision'),
      },
      doubleUnitEnabled && {
        name: 'secondaryUomCodeAndName',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
        renderer: useQuantityRender(),
      },
      {
        name: 'uomCodeAndName',
        width: 150,
      },
      {
        name: 'needByDate',
        width: 150,
      },
      {
        name: 'unitPrice',
        width: 150,
        align: 'right',
        renderer: (data) => priceChangeTip(data, basicCurrent),
      },
      {
        name: 'lineAmount',
        width: 120,
        renderer: useAmountRender(basicCurrent, { bySourceCode }),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        renderer: (data) => priceChangeTip(data, basicCurrent),
      },
      {
        name: 'taxIncludedLineAmount',
        width: 120,
        renderer: useAmountRender(basicCurrent, { bySourceCode }),
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'unitPriceBatch',
        width: 80,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'promiseDeliveryDate',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'inventoryName',
        width: 150,
      },
      {
        name: 'locationName',
        width: 150,
      },
      {
        name: 'consignedFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'returnedFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'freeFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'exemptInspectionFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'bom',
        width: 150,
        renderer: ({ record }) => (
          <a onClick={() => openBom(record)}>{intl.get('hzero.common.button.look').d('查看')}</a>
        ),
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 150,
      },
      {
        name: 'sourceNumAndLine',
        width: 150,
        renderer: ({ value, record }) => value || record.get('sourceCodeNum'),
      },
      {
        name: 'contractNum',
        width: 150,
      },
      {
        name: 'prRequestedName',
        width: 150,
        renderer: ({ record }) => record.get('purReqAppliedName'),
      },
      {
        name: 'productNum',
        width: 150,
      },
      {
        name: 'productName',
        width: 150,
      },
      {
        name: 'catalogName',
        width: 150,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
      },
      {
        name: 'departmentName',
        width: 150,
      },
      {
        name: 'costName',
        width: 150,
      },
      {
        name: 'projectCategory',
        width: 150,
        renderer: ({ record }) => record.get('projectCategoryMeaning'),
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
      {
        name: 'accountSubjectName',
        width: 150,
      },
      {
        name: 'wbs',
        width: 150,
      },
      {
        name: 'domesticUnitPrice',
        width: 150,
        renderer: useLocalPriceRender(basicCurrent),
      },
      {
        name: 'domesticLineAmount',
        width: 150,
        renderer: useLocalAmountRender(basicCurrent, { bySourceCode }),
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
        renderer: useLocalPriceRender(basicCurrent),
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
        renderer: useLocalAmountRender(basicCurrent, { bySourceCode }),
      },
      {
        name: 'exchangeRate',
        width: 150,
      },
      {
        name: 'receiveTelNum',
        width: 150,
      },
      {
        name: 'brand',
        width: 150,
      },
      {
        name: 'specifications',
        width: 150,
      },
      {
        name: 'model',
        width: 150,
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
        name: 'productSpecs',
        width: 150,
      },
      {
        name: 'productSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="productSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'productBrand',
        width: 150,
      },
      {
        name: 'productModel',
        width: 150,
      },
      {
        name: 'packingList',
        width: 150,
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
        name: 'accountAssignTypeCode',
        width: 150,
      },
      {
        name: 'receiveToleranceQuantity',
        width: 150,
      },
      {
        name: 'purchaseLineTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'budgetAccountName',
        width: 150,
      },
      {
        name: 'syncStatus',
        width: 120,
        renderer: ({ record }) => record.get('syncStatusMeaning'),
      },
      {
        name: 'checkContectDoc',
        width: 80,
        hidden: displayDocAndDocFlow.displayDoc !== '1',
        renderer: ({ record }) => {
          return (
            <a onClick={() => fetchLineDetail(record)}>
              {intl.get('sodr.workspace.modal.checkContectDoc').d('查看执行单据')}
            </a>
          );
        },
      },
      !isDocFlowLink && {
        name: 'docFlow',
        width: 100,
        hidden: displayDocAndDocFlow.displayDocFlow !== '1',
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
      {
        name: 'deliveryStrategyId',
        width: 150,
      },
      {
        name: 'strategyHeaderId',
        width: 150,
      },
      {
        name: 'projectTaskId',
        width: 150,
        renderer: ({ record }) => record.get('projectTaskName'),
      },
      {
        name: 'costInformation',
        renderer: ({ record }) => {
          return (
            <Button
              funcType="link"
              onClick={() =>
                viewCostInformation({
                  record,
                  displayPoNum,
                  lineCode: 'SODR.WORKSPACE_ALLORDERS_DETAIL.COSTINFORMATION',
                  viewOnly: true,
                })
              }
            >
              {intl.get('sodr.workspace.model.costInformation.costInformation').d('费用信息')}
            </Button>
          );
        },
      },
      {
        name: 'originalPoLineId',
        width: 150,
        renderer: ({ record }) => record.get('displayOriginalPoAndLineNum'),
      },
      fundTermDimension === 'PO_LINE' && {
        name: 'fundLineTermId',
        width: 150,
        renderer: ({ record }) => record.get('fundLineTermName'),
      },
    ].filter((i) => i);
    return typeof cuxLineDetailAttrmentUuidChange === 'function'
      ? cuxLineDetailAttrmentUuidChange(column)
      : column;
  }, [doubleUnitEnabled, basicCurrent, isDocFlowLink, fetchLineDetail, fundTermDimension]);

  const openBom = (record) => {
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
          readOnly
          record={record}
          customizeTable={customizeTable}
          code="SODR.WORKSPACE_ALLORDERS_DETAIL.BOM"
        />
      ),
    });
  };
  return (
    <>
      {customizeTable(
        { code: 'SODR.WORKSPACE_ALLORDERS_DETAIL.DETAILINFO' },
        <SearchBarTable
          dataSet={ds}
          columns={columns}
          searchCode="SODR.WORKSPACE_ALLORDERS_DETAIL.DETAILINFO_FILTER"
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          style={{ maxHeight: '450px' }}
          virtual
          virtualCell
          searchBarConfig={{
            closeFilterSelector: true,
          }}
        />
      )}
    </>
  );
};

export default DetailInfo;
