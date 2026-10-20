import React, { useContext, useMemo, useCallback } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { CreateStageCode } from '../../../utils/type';
import StageDetail from '../../../../FundPlanPrefabrication/Detail';
import styles from '../../../../../common.less';
import MultiTextFilter from '../../../../../components/MultiTextFilter';

const StageTable = () => {
  const { stageTableDs, customizeTable } = useContext(Store) as StoreValueType;

  const handleClickNum = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <StageDetail recordInfo={record} viewType='STAGE' />,
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
        name: 'documentNum',
        width: 140,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
        },
      },
      {
        name: 'currencyCode',
        width: 90,
      },
      {
        name: 'stageNum',
        width: 120,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickNum(record)}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'stageDesc',
        width: 150,
      },
      {
        name: 'stageAmount',
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
        name: 'prepEnablePayAmount',
        width: 120,
      },
      {
        name: 'prepEnableApplyAmount',
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
    ];
  }, [handleClickNum]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: CreateStageCode.List },
        <SearchBarTable
          virtual
          customizable
          dataSet={stageTableDs}
          columns={columns}
          searchCode={CreateStageCode.Search}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="documentNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.fundPlan.view.message.enterDocumentNumQuery')
                    .d('请输入条款来源单据编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(StageTable);
