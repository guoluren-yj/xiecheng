import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';

import { NumberField, Button, Tooltip } from 'choerodon-ui/pro';
import { compose, noop } from 'lodash';

import intl from 'utils/intl';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';

import MutlTextFieldSearch from './MutlTextFieldSearch';

import { decimalPointAccuracy } from '@/routes/utils';

const ServiceChargeManage = observer((props) => {
  const { bidFlag = false, tableDs, modal, handleSave = noop, customizeTable } = props;

  const columns = useMemo(() => {
    return [
      {
        name: 'supplierCompanyNum',
        width: 120,
        renderer: ({ record }) =>
          record.get('supplierNum') || record.get('supplierCompanyNum') || '-',
      },
      {
        name: 'supplierCompanyName',
        width: 120,
        renderer: ({ record }) =>
          record.get('supplierName') || record.get('supplierCompanyName') || '-',
      },
      {
        name: 'suggestedQtnTaxAmount',
        width: 120,
      },
      {
        name: 'suggestedQtnNetAmount',
        width: 120,
      },
      {
        name: 'suggestedCurrencyCode',
        width: 120,
      },
      {
        name: 'syncExpenseStatusMeaning',
        width: 120,
      },
      {
        name: 'syncExpenseResponseMsg',
        width: 120,
      },
      {
        name: 'expenseCurrencyCode',
        width: 120,
        editor: (record) => record.get('syncExpenseStatus') !== 'SUCCESS',
        lock: 'right',
      },
      {
        name: 'expectAmount',
        width: 140,
        editor: (record) =>
          record.get('syncExpenseStatus') !== 'SUCCESS' ? (
            <NumberField
              name="expectAmount"
              record={record}
              precision={
                record.get('invoiceRule') === 'OFFLINE' ? record.get('financialPrecision') : 2
              }
            />
          ) : (
            false
          ),
        renderer: ({ value, record }) =>
          decimalPointAccuracy(
            value,
            record.get('invoiceRule') === 'OFFLINE' ? record.get('financialPrecision') : 2,
            {
              repair: true,
            }
          ),
        lock: 'right',
      },
      {
        name: 'invoiceRule',
        editor: (record) => record.get('syncExpenseStatus') !== 'SUCCESS',
        width: 120,
        lock: 'right',
      },
    ];
  }, []);

  useEffect(() => {
    tableDs.addEventListener('load', handleLoad);
    return () => {
      tableDs.removeEventListener('load', handleLoad);
    };
  }, []);

  // 表格加载事件
  const handleLoad = () => {
    if (tableDs.length && tableDs?.toData()?.every((ele) => ele.syncExpenseStatus === 'SUCCESS')) {
      modal.update({
        okProps: {
          disabled: true,
        },
        footer: (okBtn, cancelBtn) => {
          return (
            <>
              <Tooltip
                title={intl
                  .get(`ssrc.inquiryHall.view.message.syncTooltip`)
                  .d('当前所有行数据已同步费用工作台成功，无法点击。')}
              >
                {okBtn}
              </Tooltip>
              <Button disabled onClick={handleSave}>
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>
              {cancelBtn}
            </>
          );
        },
      });
    }
  };

  const handleChange = (ds, value) => {
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    tableDs.setQueryParameter('multiSupplierCompanyNames', searchValue);
  };

  // 筛选器左边渲染
  const leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="multiSupplierCompanyNames"
        placeholder={intl
          .get('ssrc.depositManage.model.depositManage.inputSupplierCompanyName')
          .d('请输入供应商名称查询')}
        onChange={handleChange}
      />
    );
  };

  // 筛选器清除事件
  const clearQueryParameter = () => {
    tableDs.setQueryParameter('multiSupplierCompanyNames', '');
  };

  return (
    <React.Fragment>
      {customizeTable(
        {
          code: `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.NEW_LIST.SERVICE_FEE_TABLE`,
        },
        <SearchBarTable
          searchCode={`SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.NEW_LIST.SERVICE_FEE_FILTER`}
          dataSet={tableDs}
          columns={columns}
          editMode={
            tableDs.length && tableDs?.toData()?.every((ele) => ele.syncExpenseStatus === 'SUCCESS')
              ? 'inline'
              : 'cell'
          }
          searchBarConfig={{
            closeFilterSelector: false,
            expandable: false,
            left: {
              render: (_, ds) => leftInput(ds),
            },
            onReset: clearQueryParameter,
            onClear: clearQueryParameter,
          }}
        />
      )}
    </React.Fragment>
  );
});

export default compose(
  WithCustomizeC7N({
    unitCode: [
      'SSRC.INQUIRY_HALL.NEW_LIST.SERVICE_FEE_TABLE',
      'SSRC.BID_HALL.NEW_LIST.SERVICE_FEE_TABLE',
    ],
  }),
  formatterCollections({
    code: ['ssrc.depositManage'],
  })
)(ServiceChargeManage);
