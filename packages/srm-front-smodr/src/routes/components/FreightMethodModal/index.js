import React from 'react';
import { Modal, Table } from 'hzero-ui';

import intl from 'utils/intl';

export default function FreightMethodModal(props) {
  const {
    key,
    loading,
    onCancel = (e) => e,
    onOk = (e) => e,
    dataSource,
    visible,
    title = intl.get('smodr.acceptOrder.model.freightRuleTypeMethod').d('运费计价方式'),
    columns = [
      {
        title: intl.get('smodr.acceptOrder.model.freightRuleTypeMethod').d('运费计价方式'),
        width: 100,
        dataIndex: 'freightPricingMethodMeaning',
      },
    ],
  } = props;
  return (
    <Modal destroyOnClose visible={visible} onCancel={onCancel} onOk={onOk} title={title}>
      <Table key={key} loading={loading} columns={columns} dataSource={dataSource} />
    </Modal>
  );
}
