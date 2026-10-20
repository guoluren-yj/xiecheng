import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';

import { dateTimeRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import { fetchOperatorData } from '@/services/qualityInspectApprovalService';

const QualityRectificationRecord = (props) => {
  const { visible = false, hideModal, inspectionId } = props;
  const [operatorData, setOperatorData] = useState([]);
  // const [operatorPage, setOperatorPage] = useState([]);
  const [operatorLoading, setOperatorLoading] = useState(true);

  const operatorColumns = useMemo(
    () => [
      {
        title: intl.get(`hzero.common.components.operationAudit.operatedBy`).d('操作人'),
        dataIndex: 'processUserName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.components.operationAudit.operatedTime`).d('操作时间'),
        dataIndex: 'processedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.actions`).d('动作'),
        dataIndex: 'processTypeName',
        width: 100,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.operatedRemark`).d('操作备注'),
        dataIndex: 'processRemark',
        width: 150,
        render: (val) => (
          <Tooltip placement="topLeft" title={val}>
            {val}
          </Tooltip>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    handleInit();
  }, []);

  const handleInit = async () => {
    // 查询操作记录
    const resOperatorData = getResponse(
      await fetchOperatorData({
        inspectionId,
      })
    );

    setOperatorLoading(false);
    if (resOperatorData) setOperatorData(resOperatorData.content);
  };

  return (
    <Modal
      visible={visible}
      width={900}
      footer={null}
      onCancel={hideModal}
      bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
      title={intl.get(`hzero.common.button.operating`).d('操作记录')}
    >
      <Table
        bordered
        loading={operatorLoading}
        dataSource={operatorData}
        columns={operatorColumns}
      />
    </Modal>
  );
};

export default QualityRectificationRecord;
