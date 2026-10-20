import React, { useContext, useMemo, useCallback, useEffect } from 'react';
import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { isEmpty } from 'lodash';
import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { CreateSourceCode, CreateStageCode } from '../../utils/type';
import { stageTableDS, sourceTableDS } from '../../List/Create/stores/indexDS';
import StageDetail from '../../../FundPlanPrefabrication/Detail';
import styles from '../../../../common.less';
import MultiTextFilter from '../../../../components/MultiTextFilter';


const AddLine = (props) => {
  const { modal } = props;

  const { customizeTable, headerDs, prepResultDs } = useContext(Store) as StoreValueType;
  const { prepViewType, prepHeaderId, companyId } = headerDs.current?.get(['prepViewType', 'prepHeaderId', 'companyId']) || {};

  const stageTableDs = useMemo(() => new DataSet(stageTableDS()), []);
  const sourceTableDs = useMemo(() => new DataSet(sourceTableDS()), []);

  const tableDs = prepViewType === 'STAGE' ? stageTableDs : sourceTableDs;
  const customCode = prepViewType === 'STAGE' ? CreateStageCode : CreateSourceCode;
  const { selected } = tableDs;

  useEffect(() => {
    tableDs.setQueryParameter('companyId', companyId);
  }, [companyId, tableDs]);

  const handleOk = useCallback(async() => {
    const res = await tableDs.setState('prepHeaderId', prepHeaderId).setState('submitType', 'createLine').submit();
    if (res) {
      modal.close();
      headerDs.query(undefined, undefined, true);
      prepResultDs.query();
    }
  }, [modal, tableDs, prepHeaderId, headerDs, prepResultDs]);

  useEffect(() => {
    modal.handleOk(handleOk);
      modal.update({
        okProps: { disabled: isEmpty(selected) },
      });
  }, [modal, selected, handleOk]);

  const handleClickNum = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <StageDetail recordInfo={record} viewType={prepViewType} />,
      cancelButton: false,
    });
  }, [prepViewType]);

  const columns: any = useMemo(() => {
    if (prepViewType === 'STAGE') {
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
    } else {
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
              onClick={() => handleClickNum(record)}
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
    }
  }, [prepViewType, handleClickNum]);

  return (
    <div style={{ height: 'calc(100vh - 160px)' }}>
      {customizeTable(
        { code: customCode.List },
        <SearchBarTable
          virtual
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={customCode.Search}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="documentNums"
                  dataSet={customizeDs}
                  placeholder={prepViewType === 'STAGE' ? intl.get('sbsm.fundPlan.view.message.enterDocumentNumQuery').d('请输入条款来源单据编号查询') :
                    intl.get('sbsm.fundPlan.view.message.enterSourceNumQuery').d('请输入编制来源单据编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(AddLine);
