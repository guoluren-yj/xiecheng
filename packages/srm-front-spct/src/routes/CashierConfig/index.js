import React, { useMemo, useCallback, useRef } from 'react';
import { Button, DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import { getResponse } from 'utils/utils';

import { updateData } from '@/services/paymentCashierService';
import { ds } from './ds';
import Editor from './Editor';
import style from './index.less';

function CashierConfig() {
  const fnRef = useRef(undefined);
  const initDs = useMemo(() => new DataSet(ds()), []);

  function handleRef(fn = (e) => e) {
    fnRef.current = fn;
  }

  const handleNewData = useCallback(() => {
    c7nModal({
      title: intl.get('spct.cashierConfig.view.newTemplate').d('新建模板'),
      style: { width: '742px' },
      bodyStyle: { padding: 20 },
      onOk: () => handleSave(),
      children: <Editor onRef={(fn) => handleRef(fn)} initDs={initDs} />,
    });
  }, []);

  function handleEdit(record) {
    c7nModal({
      title: intl.get('spct.cashierConfig.view.editTemplate').d('编辑模板'),
      style: { width: '742px' },
      bodyStyle: { padding: 20 },
      onOk: () => handleSave(),
      children: (
        <Editor
          onRef={(fn) => handleRef(fn)}
          cashierConfigId={record.get('cashierConfigId')}
          initDs={initDs}
        />
      ),
    });
  }

  function handleSave() {
    const result = fnRef.current();
    return result;
  }

  async function handleUse(record, flag) {
    const res = getResponse(await updateData({ ...record.toData(), cashierConfigEnabled: flag }));
    if (res) {
      initDs.query();
    }
  }

  function handlePreview(record) {
    const flag = window.location.pathname.includes('/app');
    window.open(
      `${flag ? '/app' : ''}/pub/spct/payment-cashier-preview?cashierConfigSource=${record.get(
        'cashierConfigSource'
      )}`,
      '_blank'
    );
  }

  async function handleDelete(record) {
    initDs.delete(record);
  }

  const columns = useMemo(
    () => [
      {
        name: 'cashierConfigEnabled',
        renderer: ({ value }) => (
          <Tag border={false} color={value === '1' ? 'green' : 'red'}>
            {value === '1'
              ? intl.get('spct.cashierConfig.view.startUse').d('启用')
              : intl.get('spct.cashierConfig.view.disabled').d('禁用')}
          </Tag>
        ),
      },
      {
        name: 'cashierConfigCode',
        renderer: ({ text, record }) => {
          return record.get('cashierConfigCode') === 'PREDEFINED' ? (
            <span>{text}</span>
          ) : (
            <a onClick={() => handleEdit(record)}>{text}</a>
          );
        },
      },
      { name: 'cashierConfigName' },
      { name: 'cashierConfigDescribe' },
      // { name: 'type' },
      { name: 'cashierConfigSourceMeaning' },
      { name: 'priorityLevel' },
      {
        name: 'operation',
        width: 160,
        renderer: ({ record }) => {
          return (
            <>
              {record.get('cashierConfigCode') === 'PREDEFINED' ? (
                <Button color="primary" funcType="link" onClick={() => handlePreview(record)}>
                  {intl.get('spct.cashierConfig.view.preview').d('预览')}
                </Button>
              ) : (
                <span className={style['action-link']}>
                  {record.get('cashierConfigEnabled') === '1' ? (
                    <Button
                      color="primary"
                      funcType="link"
                      wait={1000}
                      waitType="throttle"
                      onClick={() => handleUse(record, 0)}
                    >
                      {intl.get('spct.cashierConfig.view.disabled').d('禁用')}
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      funcType="link"
                      wait={1000}
                      waitType="throttle"
                      onClick={() => handleUse(record, 1)}
                    >
                      {intl.get('spct.cashierConfig.view.startUse').d('启用')}
                    </Button>
                  )}
                  {record.get('cashierConfigEnabled') === '1' && (
                    <Button color="primary" funcType="link" onClick={() => handlePreview(record)}>
                      {intl.get('spct.cashierConfig.view.preview').d('预览')}
                    </Button>
                  )}
                  {record.get('cashierConfigEnabled') !== '1' && (
                    <Button color="primary" funcType="link" onClick={() => handleDelete(record)}>
                      {intl.get('spct.cashierConfig.view.delete').d('删除')}
                    </Button>
                  )}
                </span>
              )}
            </>
          );
        },
      },
    ],
    []
  );
  return (
    <React.Fragment>
      <Header title={intl.get('spct.cashierConfig.view.cashierConfig').d('收银台配置')}>
        <Button icon="add" color="primary" primary onClick={handleNewData}>
          {intl.get('spct.cashierConfig.view.new').d('新建')}
        </Button>
      </Header>
      <Content style={{ paddingBottom: 0 }}>
        <div style={{ height: 'calc(100vh - 180px)' }}>
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 20px)` }}
            dataSet={initDs}
            columns={columns}
            searchCode="SPCT.CASHIER.CONFIG.SELECT"
            customizedCode="SPCT.CASHIER.CONFIG.SELECT"
          />
        </div>
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spct.cashierConfig', 'spct.paymentOrder'],
})(CashierConfig);
