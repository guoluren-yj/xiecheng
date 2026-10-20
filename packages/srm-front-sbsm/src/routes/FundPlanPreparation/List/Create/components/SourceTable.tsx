import React, { useContext, useMemo, useCallback } from 'react';
import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { CreateSourceCode } from '../../../utils/type';
import Detail from '../../../../FundPlanPrefabrication/Detail';
import styles from '../../../../../common.less';
import MultiTextFilter from '../../../../../components/MultiTextFilter';


const SourceTable = () => {
  const { sourceTableDs, customizeTable } = useContext(Store) as StoreValueType;

  const handleClickExecute = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <Detail recordInfo={record} viewType='SOURCE_DOCUMENT' />,
      cancelButton: false,
    });
  }, []);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'companyName',
        width: 160,
      },
      {
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        name: 'prepSource',
        width: 140,
      },
      {
        name: 'documentNum',
        width: 150,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
        },
      },
      {
        name: 'operate',
        width: 140,
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickExecute(record)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </Button>
        ),
      },
      {
        name: 'currencyCode',
        width: 90,
      },
      {
        name: 'prepSourceAmount',
        width: 120,
      },
      {
        name: 'prefabPayAmount',
        width: 120,
      },
      {
        name: 'prefabApplyAmount',
        width: 120,
      },
      {
        name: 'prepOccupyPayAmount',
        width: 120,
      },
      {
        name: 'prepOccupyApplyAmount',
        width: 120,
      },
      {
        name: 'prepEnablePayAmount',
        width: 120,
      },
      {
        name: 'prepEnableApplyAmount',
        width: 120,
      },
      {
        name: 'prefabPaymentDate',
        width: 140,
      },
      {
        name: 'prefabPaymentDateLast',
        width: 140,
      },
    ];
  }, [handleClickExecute]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: CreateSourceCode.List },
        <SearchBarTable
          virtual
          customizable
          dataSet={sourceTableDs}
          columns={columns}
          searchCode={CreateSourceCode.Search}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="documentNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.fundPlan.view.message.enterSourceNumQuery')
                    .d('请输入编制来源单据编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(SourceTable);
