/**
 * @Description:订单明细信息
 * @Date: 2021-09-16
 * @author: ljw <jiwei01.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo } from 'react';
import { Modal, Tooltip, Button } from 'choerodon-ui/pro';
import moment from 'moment';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import DocFlow from '_components/DocFlow';
import { isEqual } from 'lodash';
import BigNumber from 'bignumber.js';
import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react-lite';
import DynamicButtons from '_components/DynamicButtons';

import { renderStatus, viewCostInformation } from '@/routes/components/utils';
import Bom from '@/routes/components/Bom';
import CustomSpecsModal from '@/routes/components/CustomSpecsModal';

import {
  usePriceRender,
  useAmountRender,
  useQuantityRender,
  useLocalAmountRender,
  useLocalPriceRender,
} from '@/routes/OrderWorkspace/hooks';

const DetailInfo = (props) => {
  const {
    ds,
    basicInfoDs,
    customizeTable,
    bySourceCode,
    displayDocAndDocFlow = {},
    fundTermDimension,
    remote,
  } = props;
  const basicCurrent = basicInfoDs?.current;
  const { collByLineFlag, displayPoNum } =
    basicCurrent?.get(['collByLineFlag', 'displayPoNum']) || {};
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
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
  const columns = useMemo(() => {
    const lineColumns = [
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
      {
        name: 'originalQuantity',
        width: 100,
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        renderer: ({ record, value }) =>
          !isEqual(
            new BigNumber(record.get('secondaryQuantity')),
            new BigNumber(record.get('originalQuantity'))
          ) ? (
            <Tooltip
              title={intl
                .get('sodr.workspace.view.tooltip.newDiffQuantity')
                .d('反馈数量与订单原始数量不一致')}
            >
              <span style={{ color: 'rgb(245, 102, 73)' }}>
                {useQuantityRender(record, 'secondaryQuantity')({ record, value })}
              </span>
            </Tooltip>
          ) : (
            useQuantityRender(record, 'secondaryUomPrecision')({ record, value })
          ),
      },
      doubleUnitEnabled && {
        name: 'secondaryUomCodeAndName',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
        renderer: ({ record, value }) =>
          !doubleUnitEnabled &&
          !isEqual(
            new BigNumber(record.get('quantity')),
            new BigNumber(record.get('originalQuantity'))
          ) ? (
            <Tooltip
              title={intl
                .get('sodr.workspace.view.tooltip.newDiffQuantity')
                .d('反馈数量与订单原始数量不一致')}
            >
              <span style={{ color: 'rgb(245, 102, 73)' }}>
                {useQuantityRender(record)({ record, value })}
              </span>
            </Tooltip>
          ) : (
            useQuantityRender(record)({ record, value })
          ),
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
        name: 'promiseDeliveryDate',
        width: 150,
        renderer: ({ text, value, record }) =>
          moment(record.get('needByDate')).diff(value) ? (
            <Tooltip
              title={intl
                .get('sodr.workspace.view.tooltip.newDiffPromiseDeliveryDate')
                .d('承诺交货日期与需求日期不一致')}
            >
              <span style={{ color: 'rgb(245, 102, 73)' }}>{text}</span>
            </Tooltip>
          ) : (
            text
          ),
      },
      {
        name: 'unitPrice',
        width: 150,
        renderer: usePriceRender(basicCurrent),
      },
      {
        name: 'lineAmount',
        width: 120,
        renderer: useAmountRender(basicCurrent, { bySourceCode }),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        renderer: usePriceRender(basicCurrent),
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
                  lineCode: 'SODR.WORKSPACE_FEEDBACK_DETAIL.COSTINFORMATION',
                  viewOnly: true,
                })
              }
            >
              {intl.get('sodr.workspace.model.costInformation.costInformation').d('费用信息')}
            </Button>
          );
        },
      },
      fundTermDimension === 'PO_LINE' && {
        name: 'fundLineTermId',
        width: 150,
        renderer: ({ record }) => record.get('fundLineTermName'),
      },
    ];
    return remote.process('processColumns', lineColumns);
  }, [doubleUnitEnabled, basicCurrent, displayPoNum, fundTermDimension]);

  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      return (
        <DynamicButtons
          buttons={remote.process('processDetailLineButton', [], { lineDs: dataSet })}
        />
      );
    });
    return [<Buttons dataSet={ds} />];
  };

  return (
    <>
      {customizeTable(
        { code: 'SODR.WORKSPACE_FEEDBACK_DETAIL.DETAILINFO' },
        <SearchBarTable
          searchCode="SODR.WORKSPACE_FEEDBACK_DETAIL.DETAILINFO_FILTER"
          dataSet={ds}
          columns={columns}
          buttons={getButtons()}
          selectionMode={
            remote.process('processDetailSelectMode', collByLineFlag, { lineDs: ds })
              ? 'rowbox'
              : 'none'
          }
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
