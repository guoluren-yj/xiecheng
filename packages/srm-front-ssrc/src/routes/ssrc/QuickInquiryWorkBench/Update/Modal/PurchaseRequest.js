import React, { useMemo, useState } from 'react';
import { useDataSet, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { noop } from 'lodash';
import { observer } from 'mobx-react-lite';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { savePurchaseRequestData } from '@/services/quickInquiryService';
import { tableDS } from '../store/purchaseRequestDS';
import styles from '../common.less';

export default observer(function PurchaseRequest(props) {
  const {
    modal,
    rfqHeaderId = '',
    itemLineDs,
    supplierTableDs,
    customizeTable = noop,
    doubleUnitFlag = false,
  } = props || {};

  const tableDs = useDataSet(() => tableDS(), []);

  const [displayPrNumOrDisplayLineNumValue, setDisplayPrNumOrDisplayLineNumValue] = useState(null);

  modal.handleOk(async () => {
    const selectedRows = tableDs?.selected || [];
    if (selectedRows.length > 0) {
      const params = {
        customizeUnitCode: 'SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_LINE',
        data: selectedRows.map((i) => ({ ...i?.toData(), rfqHeaderId })),
      };

      return savePurchaseRequestData(params).then((res) => {
        const result = getResponse(res);
        if (result) {
          // 物料查询 供应商查询
          // 缓存的变更记录
          itemLineDs.query(undefined, undefined, true);
          supplierTableDs.query(undefined, undefined, true);
          return result;
        } else {
          return false;
        }
      });
    } else {
      notification.warning({
        message: intl
          .get('ssrc.quickInquiry.view.message.pleaseSelectAtleastOneData')
          .d('请至少选择一条数据'),
      });
      return false;
    }
  });

  const leftInput = (ds) => {
    return (
      <TextField
        style={{ width: '260px' }}
        placeholder={
          <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
            {intl
              .get('ssrc.quickInquiry.model.quickInquiry.purchaseRequestQuestion')
              .d('请输入申请编号、申请编号-行号查询')}
          </span>
        }
        prefix={<Icon type="search" style={{ marginLeft: '5px' }} />}
        value={displayPrNumOrDisplayLineNumValue}
        // onEnterDown={this.searchBlur}
        dataSet={ds}
        name="multiSelectHeaderAndLineNums"
        valueChangeAction="blur"
        onChange={(val) => {
          const searchValue = val
            ? val
                .map((ele) => ele.trim().replace(/\s+/g, ','))
                .join(',')
                .split(',')
            : undefined;
          // eslint-disable-next-line no-unused-expressions
          ds?.current?.set({
            multiSelectHeaderAndLineNums: val
              ? val
                  .map((ele) => ele.trim().replace(/\s+/g, ','))
                  .join(',')
                  .split(',')
              : undefined,
          });
          setDisplayPrNumOrDisplayLineNumValue(val);
          ds.setQueryParameter('multiSelectHeaderAndLineNums', searchValue);
        }}
        multiple
        clearButton
      />
    );
  };

  const clearQueryParameter = () => {
    setDisplayPrNumOrDisplayLineNumValue('');
    tableDs.setQueryParameter('multiSelectHeaderAndLineNums', '');
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'displayPrNumOrDisplayLineNum',
        width: 200,
        renderer: ({ record }) => {
          return (
            <>
              {record.get('displayPrNum')}-{record.get('displayLineNum')}
              {record.get('urgentFlag') && Number(record.get('urgentFlag')) ? (
                <Icon type="flash_on" className={styles['row-agent-column-icon']} />
              ) : null}
            </>
          );
        },
      },
      {
        name: 'itemCode',
        width: 130,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'ouName',
        width: 180,
      },
      {
        name: 'invOrganizationName',
        width: 180,
      },
      {
        name: 'secondaryUomName',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'taxCode',
        width: 100,
      },
      {
        name: 'taxRate',
        width: 80,
        align: 'right',
      },
      {
        name: 'prRequestedName',
        width: 180,
      },
      {
        name: 'executorName',
        width: 180,
      },
      {
        name: 'purchaseOrgName',
        width: 150,
      },
      {
        name: 'purchaseAgentName',
        width: 130,
      },
      {
        name: 'requestDate',
        width: 150,
      },
      {
        name: 'remark',
        width: 180,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        name: 'projectCategoryMeaning',
        width: 100,
      },
      {
        name: 'prTypeName',
        width: 130,
      },
      {
        name: 'attachmentUuid',
        width: 120,
      },
      {
        name: 'headerRemark',
        width: 150,
      },
      {
        name: 'urgentFlag',
        width: 130,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
    ];
  }, [doubleUnitFlag]);

  return customizeTable(
    {
      code: 'SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_LINE',
    },
    <SearchBarTable
      virtual
      virtualCell
      searchCode="SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_FILTER"
      dataSet={tableDs}
      columns={columns}
      style={{
        maxHeight: 'calc(100vh - 200px)',
      }}
      searchBarConfig={{
        left: {
          render: (_, ds) => leftInput(ds),
        },
        onReset: clearQueryParameter,
        onClear: clearQueryParameter,
        closeFilterSelector: true,
        expandable: false,
      }}
    />
  );
});
