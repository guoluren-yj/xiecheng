import React, { useMemo } from 'react';
import { Alert } from 'choerodon-ui';
import { Table, Button, Lov, Form, DataSet, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import { openCatalog, openCategory } from '@/routes/pageTree';
import c7nModal from '@/utils/c7nModal';
import { commonField } from './ds';
import styles from './index.less';

const HotWorSet = observer(({ tabKey, dataSet, batchOk, type = 'step' }) => {
  const isCategory = tabKey === 'CATEGORY';
  function defaultBatchOk(batchData) {
    const isAll = dataSet.selected.length === 0;
    const fieldName = isCategory ? 'categoryLov' : 'catalogLov';
    if (isAll) {
      dataSet.forEach((r) => {
        r.set(fieldName, batchData);
      });
    } else {
      dataSet.selected.forEach((r) => {
        r.set(fieldName, batchData);
      });
    }
  }

  function handleBatchEdit() {
    const allFlag = dataSet.selected.length === 0;
    const ds = new DataSet({
      autoCreate: true,
      fields: commonField[tabKey](),
    });
    c7nModal({
      style: { width: 380 },
      drawer: true,
      // okText: intl.get('hzero.common.button.save').d('保存'),
      title: intl.get('smpc.hotWordMapping.view.batchEdit').d('批量编辑'),
      children: (
        <>
          <Alert
            className={styles['warning-help']}
            message={
              allFlag
                ? intl.get('smpc.hotWordMapping.view.allBatchEdit').d('针对全部数据进行批量编辑')
                : intl
                    .get('smpc.hotWordMapping.view.partBatchEdit', {
                      value: dataSet.selected.length,
                    })
                    .d(`已勾选${dataSet.selected.length}条数据进行批量编辑`)
            }
            type="info"
            showIcon
            closable
          />
          <Form dataSet={ds} columns={1} labelLayout="float">
            {tabKey === 'CATEGORY' && (
              <Lov
                clearButton={false}
                name="categoryLov"
                onClick={() => {
                  openCategory({
                    drawer: false,
                    name: 'categoryLov',
                    record: ds.current,
                  });
                }}
              />
            )}
            {tabKey === 'CATALOG' && (
              <Lov
                clearButton={false}
                name="catalogLov"
                onClick={() => {
                  openCatalog({
                    drawer: false,
                    name: 'catalogLov',
                    record: ds.current,
                  });
                }}
              />
            )}
          </Form>
        </>
      ),
      onOk: async () => {
        const flag = await ds.current.validate();
        if (!flag) return false;
        if (batchOk) {
          batchOk(ds.current.toJSONData());
          return true;
        }
        defaultBatchOk(ds.current.toJSONData());
      },
    });
  }

  const columns = useMemo(
    () =>
      [
        {
          name: 'hotWord',
          editor: (record) => (
            <TextField
              disabled={!record.get('creationType') || record.get('creationType') === 'quote'}
            />
          ),
        },
        {
          name: 'categoryLov',
          show: tabKey === 'CATEGORY',
          editor: (record, name) => (
            <Lov
              clearButton={false}
              name={name}
              onClick={() => {
                openCategory({
                  drawer: false,
                  name,
                  record,
                });
              }}
            />
          ),
        },
        {
          name: 'catalogLov',
          show: tabKey === 'CATALOG',
          editor: (record, name) => (
            <Lov
              clearButton={false}
              name={name}
              onClick={() => {
                openCatalog({
                  drawer: false,
                  name,
                  record,
                });
              }}
            />
          ),
        },
      ].filter((c) => c.show !== false),
    []
  );
  const offTableHeight = type === 'step' ? 232 : 192;
  return (
    <Table
      style={{ maxHeight: `calc(100vh - ${offTableHeight}px)` }}
      dataSet={dataSet}
      columns={columns}
      buttons={[
        <Button funcType="flat" onClick={handleBatchEdit} icon="mode_edit">
          {intl.get('smpc.hotWordMapping.view.batchEdit').d('批量编辑')}
        </Button>,
      ]}
      customizedCode="hot-word-set"
    />
  );
});

export default HotWorSet;
