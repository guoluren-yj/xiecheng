import React, { useMemo } from 'react';
import { yesOrNoRender } from 'utils/renderer';
import { observer } from 'mobx-react-lite';
import { Lov, Table, Button, Tooltip } from 'choerodon-ui/pro'; // Modal
import uuid from 'uuid/v4';
import { isFunction } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { PriceModal } from '@/routes/components/priceModal';
import { fetchAutoGetCompany } from '@/services/purchaseRequisitionCreationService';
import { renderAmount, colorRender } from './../hook.js';
import { ItemCustom } from '../components/ItemCustomC7N';
// import MobilePhone from '@/routes/components/MoblePhone';
import ReferencePrice from '../components/ReferencePrice';
import OutsourcingBom from '../components/OutsourcingBom';
import BatchAdd from '../components/BatchAddBtn';

const EditLineAdd = function EditLineAdd({
  addLineDs,
  headerDs,
  uomControl,
  customizeTable,
  basePriceFlag,
  handleChangeAddDefault,
  remote,
}) {
  // customizeTable
  const { current } = headerDs;
  const initLineData =
    current?.get([
      'purchaseAgentId',
      'purchaseAgentName',
      'requestedBy',
      'ouId',
      'prRequestedNum',
      'prRequestedName',
      'originalCurrency',
      'defaultPrecision',
      'prSourcePlatform',
      'financialPrecision',
      'localFinancialPrecision',
      'localDefaultPrecision',
    ]) || {};
  const { prRequestedNum, prRequestedName, originalCurrency } = initLineData || {};
  const baseCreateInfo = {
    ...initLineData,
    changeInsertFlag: 1,
    tenantId: getCurrentOrganizationId(),
    currencyCode: originalCurrency,
    prRequestedNumAndName: prRequestedNum
      ? `${prRequestedNum}-${prRequestedName}`
      : prRequestedName,
  };

  const allowEdit = (record) => {
    if (record && record.get('linePriceHiddenFlag') === 1) {
      return false;
    }
    return true;
  };

  const lineColumns = useMemo(() => {
    const allCols = [
      {
        name: 'displayLineNum',
        width: 100,
      },
      {
        name: 'prLineStatusCodeMeaning',
        width: 100,
        renderer: ({ value, record }) => {
          return colorRender(record.get('prLineStatusCode'), value);
        },
      },
      {
        name: 'invOrganizationIdLov',
        width: 100,
        editor: true,
      },
      {
        name: 'itemCodeLov',
        width: 100,
        editor: true,
      },
      {
        name: 'itemName',
        width: 100,
        editor: true,
      },
      {
        name: 'itemModel',
        width: 100,
        editor: true,
      },
      {
        name: 'itemSpecs',
        width: 100,
        editor: true,
      },
      {
        name: 'customMadeFlag',
        width: 100,
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
      },
      {
        name: 'customMadeFlag',
        width: 100,
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
      },
      {
        name: 'customAttributeList',
        width: 100,
        renderer: ({ record }) =>
          record.get('customMadeFlag') === 1 ? <ItemCustom record={record} /> : null,
      },
      {
        name: 'categoryLov',
        width: 100,
        // editor: true,
        editor: (record) => (
          <Lov
            editor
            dataSet={addLineDs}
            name="categoryLov"
            tableProps={{
              mode: 'tree',
              onRow: (row) => {
                const handleSelect = ({ dataSet, record: _record }) => {
                  if (dataSet && _record) {
                    dataSet.select(_record);
                  }
                };
                return {
                  onClick: () => handleSelect(row),
                  onDoubleClick: () => {
                    if (row?.record?.selectable) {
                      handleSelect(row);
                      record.set({
                        categoryLov: row?.record?.toData(),
                      });
                      // Modal.destroy();
                    }
                  },
                };
              },
              selectionMode: 'rowbox',
            }}
          />
        ),
      },
      {
        name: 'neededDate',
        width: 100,
        editor: true,
      },
      {
        name: 'quantity',
        width: 100,
        editor: () => uomControl !== 1,
        type: 'number',
      },
      {
        name: 'uomLov',
        width: 100,
        editor: true,
      },
      {
        name: 'secondaryUomId',
        width: 100,
        editor: true,
      },
      {
        name: 'secondaryQuantity',
        width: 100,
        editor: true,
      },
      {
        name: 'secondaryTaxInUnitPrice',
        width: 100,
        editor: allowEdit && basePriceFlag,
        renderer: renderAmount,
      },
      {
        name: 'taxLov',
        width: 100,
        editor: true,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'currencyLov',
        width: 100,
        editor: true,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 100,
        editor: allowEdit && basePriceFlag,
        renderer: renderAmount,
      },
      {
        name: 'lastPurPrice',
        width: 100,
        renderer: ({ record }) => (
          <PriceModal
            {...{
              item: record.get(['lastPurchasePrice', 'poLineId']),
            }}
          />
        ),
      },
      {
        name: 'unitPriceBatch',
        width: 100,
        editor: true,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 100,
        align: 'right',
        editor: allowEdit,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyNoTaxSum',
        editor: allowEdit,
        align: 'right',
        width: 100,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyNoTaxUnit',
        width: 100,
        align: 'right',
        editor: allowEdit,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyTaxSum',
        editor: allowEdit,
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyTaxUnit',
        editor: allowEdit,
        align: 'right',
        width: 100,
        renderer: renderAmount,
      },
      {
        name: 'supplierCompanyIdLov',
        width: 100,
        editor: true,
      },
      {
        name: 'outsourcingBomFlag',
        width: 150,
        editor: true,
      },
      {
        name: 'outsourcingBom',
        width: 150,
        renderer: ({ record }) =>
          record?.get('outsourcingBomFlag') ? (
            <OutsourcingBom
              record={record}
              headerDs={headerDs}
              type="change"
              customizeTable={customizeTable}
              custCode="SPRM.PURCHASE_PLAFORM_CANCEL.CHANGE_OUTSOURCINGBOM"
            />
          ) : null,
      },
      {
        name: 'supplierList',
        width: 100,
        editor: true,
      },
      {
        name: 'referencePriceDisplayFlag',
        width: 100,
        // renderer: ({ record }) => <ReferPrice currentRecord={record} fetchPrice={fetchPrice} />,
        renderer: ({ record }) => <ReferencePrice record={record} headerDs={headerDs} sourceForm='create' uomControl={uomControl} remote={remote} />,
      },
      {
        name: 'prRequestedLov',
        width: 100,
        editor: true,
      },
      {
        name: 'purchaseAgentLov',
        width: 100,
        editor: true,
      },
      {
        name: 'executorName',
        width: 100,
      },
      {
        name: 'accountSubjectLov',
        width: 100,
        editor: true,
      },
      {
        name: 'costLov',
        width: 100,
        editor: true,
      },
      {
        name: 'expBearDepLov',
        width: 100,
        editor: true,
      },
      {
        name: 'projectNum',
        width: 100,
        editor: true,
      },
      {
        name: 'projectName',
        width: 100,
        editor: true,
      },
      {
        name: 'projectCategoryLov',
        width: 100,
        editor: true,
      },
      {
        name: 'wbsLov',
        width: 100,
        editor: true,
      },
      {
        name: 'taxIncludedBudgetUnitPrice',
        width: 100,
        editor: true,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'budgetIoFlag',
        width: 100,
        editor: true,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'budgetAccountLov',
        width: 100,
        editor: true,
      },
      {
        name: 'pcNum',
        width: 100,
      },
      {
        name: 'receiveAddress',
        width: 100,
        editor: true,
      },
      {
        name: 'receiveContactName',
        width: 100,
        editor: true,
      },
      {
        name: 'receiveTelNum',
        width: 280,
        editor: true,
      },
      {
        name: 'lineFreight',
        width: 100,
        editor: true,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'remark',
        width: 100,
        editor: true,
      },
      {
        name: 'budgetOccupyFlag',
        width: 100,
      },
      {
        name: 'attachmentUuid',
        width: 100,
        editor: true,
      },
      {
        name: 'projectTaskId',
        width: 100,
        editor: (record) => (
          <Lov
            editor
            dataSet={addLineDs}
            name="projectTaskId"
            tableProps={{
              mode: 'tree',
              onRow: (row) => {
                const handleSelect = ({ dataSet, record: _record }) => {
                  if (dataSet && _record) {
                    dataSet.select(_record);
                  }
                };
                return {
                  onClick: () => handleSelect(row),
                  onDoubleClick: () => {
                    if (row?.record?.selectable) {
                      handleSelect(row);
                      record.set({
                        projectTaskId: row?.record?.toData(),
                      });
                    }
                  },
                };
              },
              selectionMode: 'rowbox',
            }}
          />
        ),
      },
    ];
    if (uomControl !== 1) {
      return allCols.filter(
        (ele) =>
          !['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'].includes(ele.name)
      );
    }
    return allCols;
  }, [headerDs, basePriceFlag]);

  // 行删除
  const deleteAddLine = () => {
    const { selected } = addLineDs;
    const updatedIds = [];
    const createSelected = [];
    selected.forEach((ele) => {
      if (ele.get('prLineId')) {
        ele.reset();
        updatedIds.push(ele.get('prLineId'));
      } else {
        ele.restore();
        createSelected.push(ele);
      }
    });
    // 删除数据缓存
    const shieldedLineIds = addLineDs.getState('shieldedLineIds');
    const queryIds = shieldedLineIds ? shieldedLineIds.concat(updatedIds) : updatedIds;
    addLineDs.setState('lastLineIds', queryIds);
    if (updatedIds.length > 0) {
      addLineDs.remove(selected, true);
      addLineDs.setQueryParameter('shieldedLineIds', queryIds.join(','));
      addLineDs.query({}, { shieldedLineIds: queryIds.join(',') }, true);
      current.set({ changeDeleteLineIds: queryIds });
    } else {
      addLineDs.remove(createSelected);
    }
  };

  const handleAdd = async () => {
    const res = getResponse(await fetchAutoGetCompany({ ouId: baseCreateInfo?.ouId }));
    const cuxChangAdd = isFunction(handleChangeAddDefault)
      ? await handleChangeAddDefault({ headerDs, baseCreateInfo })
      : {}; // 司顺pur-39372 埋点，哈啰pur-41436
    if (res) {
      const {
        organizationId: invOrganizationId,
        organizationName: invOrganizationName,
        address: receiveAddress,
      } = res || {};
      const addLineData = Object.assign(
        {
          receiveAddress,
          invOrganizationName,
          invOrganizationId,
        },
        baseCreateInfo
      );
      addLineDs.create(
        {
          ...addLineData,
          uuidKey: uuid(),
          ...cuxChangAdd,
        },
        0
      );
    } else {
      addLineDs.create(
        {
          ...baseCreateInfo,
          uuidKey: uuid(),
          ...cuxChangAdd,
        },
        0
      );
    }
  };

  const DeleteBtn = observer(() => {
    return (
      <Tooltip title={intl.get('sprm.common.model.detele.tagInfo').d('删除数据，提交后才能生效')}>
        <Button
          onClick={deleteAddLine}
          icon="delete_sweep"
          funcType="flat"
          type="c7n-pro"
          disabled={addLineDs.selected?.length === 0}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      </Tooltip>
    );
  });

  return customizeTable(
    {
      code: 'SPRM.PURCHASE_PLAFORM_CANCEL.ADDLINE',
    },

    <Table
      columns={lineColumns}
      dataSet={addLineDs}
      style={{ maxHeight: `calc(100vh - 250px)` }}
      buttons={[
        ['add', { name: 'add', onClick: () => handleAdd() }],
        <DeleteBtn />,
        <BatchAdd name="batchAdd" addType="changeAdd" />,
      ]}
    />
  );
};

export default EditLineAdd;
