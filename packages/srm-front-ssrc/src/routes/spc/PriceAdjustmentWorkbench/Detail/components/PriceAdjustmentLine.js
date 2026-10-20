import React from 'react';
import intl from 'utils/intl';
import { Button } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import { commonDelete } from '@/routes/spc/BomDimConfig/Detail/modal/utils';
import notification from 'utils/notification';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import CommonImport from 'components/Import';
import BatchMaintain from './BatchMaintain';

import { showLadderQuote, showApplicationScope } from '../../utils';

const PriceAdjustmentLine = (props = {}) => {
  const {
    isEdit,
    dataSet,
    basicInfoDs,
    customizeBtnGroup,
    customizeTable,
    customizeForm,
    custConfig,
    ruleDefinition,
    gotoCalcDetail,
    refreshData,
    priceRemote,
    cusUnitCode,
  } = props;

  const getColumns = () => {
    const editor = (record) => record.get('sourceFrom') !== 'QUICK_SEARCH_SOURCE' && isEdit;
    let columns = [
      {
        name: 'priceAdjustmentLineID',
        width: 150,
        editor,
      },
      {
        name: 'priceAdjustmentLineNum',
        width: 150,
        editor,
      },
      {
        name: 'sourceFromNum',
        width: 150,
      },
      {
        name: 'sourceFromLineNum',
        width: 150,
      },
      {
        name: 'itemCategoryId',
        width: 140,
        editor,
      },
      {
        name: 'supplierCompanyId',
        width: 150,
        editor,
      },
      {
        name: 'validDateFrom',
        width: 150,
        editor,
      },
      {
        name: 'validDateTo',
        width: 150,
        editor,
      },
      {
        name: 'ouId',
        width: 150,
        editor,
      },
      {
        name: 'invOrganizationId',
        width: 150,
        editor,
      },
      {
        name: 'purOrganizationId',
        width: 150,
        editor,
      },
      {
        name: 'purchaseAgentId',
        width: 150,
        editor,
      },
      {
        name: 'uomId',
        width: 150,
        editor,
      },
      {
        name: 'sourceFrom',
        width: 150,
        editor,
      },
      {
        name: 'benchmarkPriceType',
        width: 150,
      },
      {
        name: 'taxIncludedPrice',
        width: 150,
        editor: (record) => {
          return (
            editor(record) && (
              <C7nPrecisionInputNumber
                name="taxIncludedPrice"
                record={record}
                currency="currencyCode"
              />
            )
          );
        },
      },
      {
        name: 'netPrice',
        width: 150,
        editor: (record) => {
          return (
            editor(record) && (
              <C7nPrecisionInputNumber name="netPrice" record={record} currency="currencyCode" />
            )
          );
        },
      },
      {
        name: 'ladderQuotation',
        width: 150,
        renderer: ({ record }) => (
          <a
            onClick={() => {
              showLadderQuote({
                ruleDefinition,
                isEdit: editor(record),
                parentRecord: record,
              });
            }}
          >
            {intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格')}
          </a>
        ),
      },
      {
        name: 'applicationScope',
        width: 150,
        renderer: ({ record }) => (
          <a
            disabled={!record.get('priceAdjustmentLineId')}
            onClick={() =>
              showApplicationScope(editor(record), {
                appScopeType: 'ORDER',
                priceAdjustmentLineId: record.get('priceAdjustmentLineId'),
              })
            }
          >
            {intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围')}
          </a>
        ),
      },
      {
        name: 'itemId',
        width: 140,
        editor,
      },
      {
        name: 'itemName',
        width: 140,
      },
      {
        name: 'companyId',
        width: 150,
        editor,
      },
      {
        name: 'currencyCode',
        width: 150,
        editor,
      },
      {
        name: 'taxId',
        width: 150,
        align: 'right',
        editor,
      },
      {
        name: 'exchangeRate',
        width: 150,
        editor,
      },
      {
        name: 'exchangeRateType',
        width: 150,
        editor,
      },
      {
        name: 'exchangeRateDate',
        width: 150,
        editor,
      },
      {
        name: 'supplierTenantId',
        width: 150,
        editor,
      },
      {
        name: 'creationDate',
        width: 150,
        editor,
      },
      {
        name: 'calcDetil',
        width: 150,
        title: intl.get(`spc.advancedPricingRecord.view.title.calcDetail`).d('计算明细'),
        renderer: ({ record }) => {
          const recordLineId = record.get('recordLineId');
          return (
            recordLineId && (
              <a onClick={() => gotoCalcDetail(recordLineId)}>
                {intl.get(`spc.advancedPricingRecord.view.title.calcDetail`).d('计算明细')}
              </a>
            )
          );
        },
      },
      {
        name: 'priceBatchQuantity',
        width: 150,
        editor,
      },
      {
        name: 'supplierId',
        width: 150,
        editor,
      },
    ];
    if (!isEdit) {
      columns = columns.concat([
        {
          name: 'batchNum',
        },
        {
          name: 'batchSyncStatusMeaning',
        },
        {
          name: 'syncPriceErrorMsg',
        },
        {
          name: 'processDate',
          width: 180,
        },
        {
          name: 'processUserName',
          width: 140,
        },
      ]);
    }
    return columns;
  };

  const TableButtons = observer(() => {
    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };
    const { priceAdjustmentHeaderId, sourceFrom } = basicInfoDs?.current?.get([
      'priceAdjustmentHeaderId',
      'sourceFrom',
    ]);

    const buttons = [
      <Button
        data-name="add"
        icon="playlist_add"
        onClick={() => {
          dataSet.create({ sourceFrom: 'MANUAL' }, 0);
        }}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Button>,
      <Button
        data-name="delete"
        icon="delete_sweep"
        disabled={isEmpty(dataSet.selected)}
        onClick={() => {
          const canDeleteFlag = !dataSet.selected.find(
            (record) => record.get('sourceFrom') !== 'MANUAL'
          );
          if (!canDeleteFlag) {
            return notification.warning({
              message: intl
                .get(`ssrc.priceAdjustmentWorkBench.view.message.notDelete`)
                .d('仅支持删除手工来源的数据行，请检查！'),
            });
          }
          commonDelete(dataSet);
        }}
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
      priceAdjustmentHeaderId && (
        <CommonImport
          data-name="newtImport"
          businessObjectTemplateCode="SRM_C_SSRC_PRICE_ADJUSTMENT_LINE_IMPORT"
          args={{ priceAdjustmentHeaderId }}
          prefixPatch="/spc"
          buttonProps={{
            // permissionList: [
            //   {
            //     code: 'srm.pc-admin.pc-purchaser.workspace2.button.batch.import.subject.new',
            //     type: 'button',
            //     meaning: '新版导入标的',
            //   },
            // ],
            disabled: sourceFrom !== 'MANUAL',
            style: {
              marginTop: '1px',
            },
            ...buttonCommonProps,
          }}
          successCallBack={() => {
            refreshData('list');
          }}
        />
      ),
      <BatchMaintain
        data-name="batchMaintain"
        custConfig={custConfig}
        remote={priceRemote}
        customizeForm={customizeForm}
        dataSet={dataSet}
      />,
    ].filter(Boolean);

    const newButtons = priceRemote
      ? priceRemote.process('SSRC_PRICE_ADJUSTMENT_WORKBENCH_DETAIL_LINE_BUTTONS', buttons, {
          currentProps: props,
        })
      : buttons;

    return customizeBtnGroup(
      {
        code: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_BUTTONS',
      },
      newButtons
    );
  });

  return customizeTable(
    {
      code:
        cusUnitCode?.lineCode ||
        (isEdit
          ? 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_EDIT_TABLE'
          : 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_TABLE_READONLY'),
    },
    <SearchBarTable
      key={cusUnitCode?.lineCode}
      searchBarConfig={{
        autoQuery: false,
        closeFilterSelector: true,
        expandable: false,
      }}
      style={{ maxHeight: 500 }}
      searchCode={cusUnitCode?.searchCode || 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH'}
      dataSet={dataSet}
      buttons={isEdit && [<TableButtons />]}
      columns={getColumns()}
    />
  );
};

export default PriceAdjustmentLine;
