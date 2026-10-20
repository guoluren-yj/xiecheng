import React, { useMemo, useState } from 'react';
import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';

import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import AwaitOperationHistory from '../components/AwaitOperationHistory';

// 设置smdm国际化前缀 - common - model
const Index = function Index({ dataSet, customizeTable }) {
  const [init, setInit] = useState(false);

  const openEditRecordModal = (record) => {
    // productListDs.loadData(value ? JSON.parse(value) : []);

    Modal.open({
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      style: {
        width: 800,
      },
      closable: true,
      drawer: true,
      children: <AwaitOperationHistory awaitAuthenticateId={record.get('awaitAuthenticateId')} />,
      cancelButton: false,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'authenticateNum',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 200,
      },
      {
        name: 'authenticateStatusCode',
        width: 200,
        renderer: ({ record, value }) => {
          if (value === 'AWAIT_AUTHENTICATE') {
            return (
              <Tag color="yellow" style={{ border: 'none' }}>
                {record.get('authenticateStatusCodeMeaning')}
              </Tag>
            );
          } else if (value === 'AUTHENTICATEING') {
            return (
              <Tag color="green" style={{ border: 'none' }}>
                {record.get('authenticateStatusCodeMeaning')}
              </Tag>
            );
          } else {
            return (
              <Tag color="gray" style={{ border: 'none' }}>
                {record.get('authenticateStatusCodeMeaning')}
              </Tag>
            );
          }
        },
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 200,
      },
      {
        name: 'uomName',
        width: 200,
      },
      {
        name: 'companyName',
        width: 200,
      },
      {
        name: 'supplierCode',
        width: 150,
        renderer: ({ record, value }) => value || record.get('supplierCompanyCode'),
      },
      {
        name: 'supplierName',
        width: 200,
        renderer: ({ record }) => record.get('displaySupplierName'),
      },
      {
        name: 'neededDate',
        width: 200,
      },
      {
        name: 'sourcePlatform',
        width: 150,
      },
      {
        name: 'sourceDocumentsNumAndLineNum',
        width: 250,
        renderer: ({ record }) =>
          `${record.get('sourceDocumentsNum') || ''}-${record.get('sourceDocumentsLineNum') || ''}`,
      },
      {
        name: 'syncDate',
        width: 200,
      },
      {
        name: 'unitName',
        width: 200,
      },
      {
        name: 'prTypeName',
        width: 200,
      },
      {
        name: 'formalItemCode',
        width: 150,
      },
      {
        name: 'formalItemName',
        width: 200,
      },
      {
        name: 'executorName',
        width: 250,
      },
      {
        name: 'operation',
        renderer: ({ record }) => {
          return String(record?.get('existsAction')) === '1' ? (
            <a onClick={() => openEditRecordModal(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          ) : (
            '-'
          );
        },
      },
    ];
  }, []);

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = dataSet.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['authenticateOrSourceDocumentsNumQueryList'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet.current
      ? dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : dataSet.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);

    if (_back === -1 && !init) {
      dataSet.query(dataSet.currentPage);
    } else {
      dataSet.query();
    }

    setInit(true);
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  };

  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      {customizeTable(
        {
          code: 'SMDM.ITEM_AWAIT_AUTH.LIST',
        },
        <SearchBarTable
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchCode="SMDM.ITEM_AWAIT_AUTH.SEARCH"
          dataSet={dataSet}
          columns={columns}
          data={[]}
          key="await"
          queryFieldsLimit={3}
          cacheState
          searchBarConfig={{
            fieldProps: {
              supplierCompanyId: { lovPara: { enabledFlag: 1 } },
            },
            left: {
              render: () => (
                <MutlTextFieldSearch
                  name="authenticateOrSourceDocumentsNumQueryList"
                  dataSet={dataSet}
                  placeholder={intl
                    .get('sprm.common.modal.enterSourceDocumentsNum')
                    .d('请输入来源单号')}
                />
              ),
            },
            onClear: resetQueryDs,
            onReset: resetQueryDs,
            onQuery: handleQuery,
          }}
        />
      )}
    </div>
  );
};

export default Index;
