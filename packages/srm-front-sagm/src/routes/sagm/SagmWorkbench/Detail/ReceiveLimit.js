import React, { memo, useEffect, useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';

const DelButton = observer(({ dataSet, onClick }) => {
  return (
    <Button
      disabled={dataSet.selected.length < 1}
      onClick={onClick}
      icon="delete_sweep"
      funcType="flat"
      color="primary"
    >
      {intl.get('sagm.common.button.batchDelete').d('批量删除')}
    </Button>
  );
});

export default memo(function ReceiveLimit(props) {
  const { dataSet, agreementHeaderId, readOnly, refresh } = props;

  useEffect(() => {
    if (agreementHeaderId) {
      dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
      dataSet
        .getField('saleAgreementSkuMappings')
        .setLovPara('agreementHeaderId', agreementHeaderId);
      dataSet.getField('saleAgreementSkuMappings').set('multiple', !readOnly);
      dataSet.query();
      dataSet.paging = true;
    }
  }, [refresh, readOnly, agreementHeaderId]);

  useEffect(() => {
    if (readOnly || !agreementHeaderId) {
      dataSet.selection = false;
    } else {
      dataSet.selection = 'multiple';
    }
  }, [readOnly, agreementHeaderId]);

  async function handleDelete() {
    const addRecords = dataSet.selected.filter((f) => f.status === 'add');
    const updateRecords = dataSet.selected.filter((f) => f.status !== 'add');
    if (updateRecords.length > 0) {
      dataSet.delete(updateRecords).then((res) => res && dataSet.remove(addRecords));
    } else {
      dataSet.remove(addRecords);
    }
  }

  const columns = useMemo(
    () =>
      [
        {
          name: 'saleAgreementSkuMappings',
          editor: !readOnly,
          renderer: !readOnly
            ? null
            : ({ text }) => {
                return typeof text === 'string' ? text?.split('/')?.join('、') || '-' : '';
              },
        },
        { name: 'cycleDimension', editor: !readOnly },
        {
          name: 'receiveQuantity',
          width: 200,
          editor: !readOnly,
        },
      ].filter((f) => f.show || !('show' in f)),
    [readOnly]
  );
  const buttons = useMemo(() => {
    if (readOnly || !agreementHeaderId) return [];
    return [
      <Button icon="playlist_add" onClick={() => dataSet.create({ status: 'add' }, 0)}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <DelButton dataSet={dataSet} onClick={handleDelete} />,
    ];
  }, [readOnly, agreementHeaderId]);

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: 450 }}
      customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.RECEIVE_LIMIT"
    />
  );
});
