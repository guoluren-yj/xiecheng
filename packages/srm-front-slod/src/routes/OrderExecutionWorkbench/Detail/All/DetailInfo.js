/**
 * @Description:订单明细信息
 * @Date: 2021-09-16
 * @author: ljw <jiwei01.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { useComputed } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';
import AssociatedDocument from '@/routes/OrderExecutionWorkbench/components/AssociatedDocument';

// import Switch from 'components/Switch';
import Bom from '../../components/Bom';
import { renderStatus } from '@/routes/OrderExecutionWorkbench/components/utils';
import CustomSpecsModal from '@/routes/OrderExecutionWorkbench/components/CustomSpecsModal';
import { useUomRender, usePrecisionRender } from '@/routes/OrderExecutionWorkbench/hooks';

const DetailInfo = (props) => {
  const { ds, basicInfoDs, customizeTable, bySourceCode, remote } = props;
  const displayPoNum = basicInfoDs?.current.get('displayPoNum');
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
  //   () => [
  //     {
  //       name: 'displayStatusCode',
  //       width: 120,
  //       renderer: ({ record }) =>
  //         renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
  //     },
  //     {
  //       name: 'displayLineNum',
  //       width: 80,
  //     },
  //     {
  //       name: 'displayLineLocationNum',
  //       width: 100,
  //     },
  //     {
  //       name: 'domesticUnitPrice',
  //       width: 120,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localPrice')({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'domesticTaxIncludedPrice',
  //       width: 150,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localPrice')({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'domesticLineAmount',
  //       width: 120,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localAmount', {
  //           bySourceCode,
  //         })({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'domesticTaxIncludedLineAmount',
  //       width: 150,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localAmount', {
  //           bySourceCode,
  //         })({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'itemCode',
  //       width: 150,
  //     },
  //     {
  //       name: 'itemName',
  //       width: 150,
  //     },
  //     doubleUnitEnabled && {
  //       name: 'secondaryQuantity',
  //       width: 150,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'secondaryQuantity')({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     doubleUnitEnabled && {
  //       name: 'secondaryUomCodeAndName',
  //       width: 150,
  //       renderer: ({ record }) => record?.get('secondaryUomCodeAndName'),
  //     },
  //     {
  //       name: 'quantity',
  //       width: 150,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'quantity')({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'uomCodeAndName',
  //       width: 150,
  //       renderer: useUomRender,
  //     },
  //     {
  //       name: 'needByDate',
  //       width: 150,
  //     },
  //     {
  //       name: 'promiseDeliveryDate',
  //       width: 150,
  //     },
  //     {
  //       name: 'unitPrice',
  //       width: 150,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'price')({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'lineAmount',
  //       width: 120,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'amount', {
  //           bySourceCode,
  //         })({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'enteredTaxIncludedPrice',
  //       width: 150,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'price')({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'taxIncludedLineAmount',
  //       width: 120,
  //       renderer: ({ record, value, dataSet }) =>
  //         usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'amount', {
  //           bySourceCode,
  //         })({
  //           record,
  //           value,
  //           dataSet,
  //         }),
  //     },
  //     {
  //       name: 'taxRate',
  //       width: 80,
  //     },
  //     {
  //       name: 'unitPriceBatch',
  //       width: 80,
  //     },
  //     {
  //       name: 'currencyCode',
  //       width: 150,
  //     },
  //     {
  //       name: 'categoryName',
  //       width: 150,
  //     },
  //     {
  //       name: 'invOrganizationName',
  //       width: 150,
  //     },
  //     {
  //       name: 'inventoryName',
  //       width: 150,
  //     },
  //     {
  //       name: 'locationName',
  //       width: 150,
  //     },
  //     {
  //       name: 'consignedFlag',
  //       width: 150,
  //       renderer: ({ value }) => yesOrNoRender(value),
  //     },
  //     {
  //       name: 'returnedFlag',
  //       width: 150,
  //       renderer: ({ value }) => yesOrNoRender(value),
  //     },
  //     {
  //       name: 'freeFlag',
  //       width: 150,
  //       renderer: ({ value }) => yesOrNoRender(value),
  //     },
  //     {
  //       name: 'bom',
  //       width: 150,
  //       renderer: ({ record }) => (
  //         <a onClick={() => openBom(record)}>{intl.get('hzero.common.button.look').d('查看')}</a>
  //       ),
  //     },
  //     {
  //       name: 'displayPrNumAndDisplayPrLineNum',
  //       width: 150,
  //     },
  //     {
  //       name: 'sourceNumAndLine',
  //       width: 150,
  //       renderer: ({ value, record }) => value || record.get('sourceCodeNum'),
  //     },
  //     {
  //       name: 'contractNum',
  //       width: 150,
  //     },
  //     {
  //       name: 'prRequestedName',
  //       width: 150,
  //     },
  //     {
  //       name: 'productNum',
  //       width: 150,
  //     },
  //     {
  //       name: 'productName',
  //       width: 150,
  //     },
  //     {
  //       name: 'catalogName',
  //       width: 150,
  //     },
  //     {
  //       name: 'shipToThirdPartyAddress',
  //       width: 150,
  //     },
  //     {
  //       name: 'shipToThirdPartyContact',
  //       width: 150,
  //     },
  //     {
  //       name: 'receiveTelNum',
  //       width: 150,
  //     },
  //     {
  //       name: 'departmentName',
  //       width: 150,
  //     },
  //     {
  //       name: 'costName',
  //       width: 150,
  //     },
  //     {
  //       name: 'projectCategory',
  //       width: 150,
  //       renderer: ({ record }) => record.get('projectCategoryMeaning'),
  //     },
  //     {
  //       name: 'remark',
  //       width: 150,
  //     },
  //     {
  //       name: 'attachmentUuid',
  //       width: 150,
  //     },
  //     // 隐藏字段
  //     {
  //       name: 'productBrand',
  //       width: 150,
  //     },
  //     {
  //       name: 'productModel',
  //       width: 150,
  //     },
  //     {
  //       name: 'packingList',
  //       width: 150,
  //     },
  //     {
  //       name: 'purchaseLineTypeId',
  //       width: 150,
  //       editor: true,
  //     },
  //     {
  //       name: 'skuType',
  //       width: 120,
  //     },
  //     {
  //       name: 'customUomName',
  //       width: 120,
  //     },
  //     {
  //       name: 'customQuantity',
  //       width: 120,
  //     },
  //     {
  //       name: 'packageQuantity',
  //       width: 120,
  //     },
  //     {
  //       name: 'customSpecsJson',
  //       width: 120,
  //       renderer: ({ value }) => (
  //         <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
  //       ),
  //     },
  //     {
  //       name: 'customSpecs',
  //       width: 150,
  //     },
  //     {
  //       name: 'productSpecsJson',
  //       width: 120,
  //       renderer: ({ value }) => (
  //         <CustomSpecsModal type="productSpecs" data={value ? JSON.parse(value) : []} />
  //       ),
  //     },
  //     {
  //       name: 'productSpecs',
  //       width: 150,
  //     },
  //     {
  //       name: 'checkContectDoc',
  //       width: 80,
  //       renderer: ({ record }) => {
  //         return (
  //           <a onClick={() => fetchLineDetail(record)}>
  //             {intl.get('sodr.workspace.modal.checkContectDoc').d('查看执行单据')}
  //           </a>
  //         );
  //       },
  //     },
  //   ],
  //   [doubleUnitEnabled, fetchLineDetail]
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
        name: 'domesticUnitPrice',
        width: 120,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localPrice')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localPrice')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'domesticLineAmount',
        width: 120,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localAmount', {
            bySourceCode,
          })({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'localAmount', {
            bySourceCode,
          })({
            record,
            value,
            dataSet,
          }),
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
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'secondaryQuantity')({
            record,
            value,
            dataSet,
          }),
      },
      doubleUnitEnabled && {
        name: 'secondaryUomCodeAndName',
        width: 150,
        renderer: ({ record }) => record?.get('secondaryUomCodeAndName'),
      },
      {
        name: 'quantity',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'quantity')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'uomCodeAndName',
        width: 150,
        renderer: useUomRender,
      },
      {
        name: 'needByDate',
        width: 150,
      },
      {
        name: 'promiseDeliveryDate',
        width: 150,
      },
      {
        name: 'unitPrice',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'price')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'lineAmount',
        width: 120,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'amount', {
            bySourceCode,
          })({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'price')({
            record,
            value,
            dataSet,
          }),
      },
      {
        name: 'taxIncludedLineAmount',
        width: 120,
        renderer: ({ record, value, dataSet }) =>
          usePrecisionRender(dataSet.getState('basicInfoDs')?.current, 'amount', {
            bySourceCode,
          })({
            record,
            value,
            dataSet,
          }),
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
        name: 'receiveTelNum',
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
      // 隐藏字段
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
        name: 'purchaseLineTypeId',
        width: 150,
        editor: true,
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
        name: 'productSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="productSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'productSpecs',
        width: 150,
      },
      {
        name: 'checkContectDoc',
        width: 80,
        renderer: ({ record }) => {
          return (
            <a onClick={() => fetchLineDetail(record)}>
              {intl.get('sodr.workspace.modal.checkContectDoc').d('查看执行单据')}
            </a>
          );
        },
      },
    ];
    return typeof cuxLineDetailAttrmentUuidChange === 'function'
      ? cuxLineDetailAttrmentUuidChange(column)
      : column;
  }, [doubleUnitEnabled, fetchLineDetail]);
  const openBom = (record) => {
    Modal.open({
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      cancelProps: { color: 'primary' },
      closable: true,
      drawer: true,
      style: { width: 742 },
      title: intl.get('slod.orderExecution.view.title.bom').d('外协BOM'),
      children: (
        <Bom
          readOnly
          record={record}
          sourcePage="all"
          customizeTable={customizeTable}
          code="SINV.ORDER_EXECUTION_ALL_DETAIL.BOM"
        />
      ),
    });
  };
  // const getButtons = () => {
  //   const Buttons = () => {
  //     return (
  //       <div style={{ height: '35px' }}>
  //         <span style={{ position: 'absolute', right: '35px', textAlign: 'right' }}>
  //           {intl.get(`sodr.common.model.common.hideCloseAndCancelLines`).d('隐藏取消/关闭行')}
  //           <Switch onChange={handleChangeLineDisplay} />
  //         </span>
  //       </div>
  //     );
  //   };
  //   return [<Buttons dataSet={ds} />];
  // };

  return customizeTable(
    { code: 'SINV.ORDER_EXECUTION_ALL_DETAIL.DETAILINFO' },
    <SearchBarTable
      dataSet={ds}
      columns={columns}
      searchCode="SINV.ORDER_EXECUTION_ALL_DETAIL.DETAILINFO_FILTER"
      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
      style={{ maxHeight: '450px' }}
      virtual
      virtualCell
      searchBarConfig={{
        // autoQuery: false,
        closeFilterSelector: true,
        checkDataSetStatus: false,
      }}
    />
  );
};

export default DetailInfo;
