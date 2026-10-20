import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer.js';
import { ReferTableDS } from './indexDs';
import { c7nModal } from '../../../components/C7nCustomModal';
import Detail from '../../Detail/index';

const Index = () => {
  const ReferTableDs = useMemo(() => new DataSet(ReferTableDS()), []);
  const OpenNodeDetail = (nodeStrategyId) => {
    c7nModal({
      title: intl.get('sinv.receiptManage.model.receipt.detailMainShow').d('详情预览'),
      style: { width: '742px' },
      children: <Detail nodeStrategyId={nodeStrategyId} />,
      okText: intl.get(`hzero.common.view.message.close`).d('关闭'),
      cancelButton: false,
    });
  };

  const referColumns = [
    {
      name: 'strategyCode',
      type: 'string',
    },
    {
      name: 'strategyName',
      type: 'intl',
    },
    {
      name: 'sourceOrderTypeMeaning',
      type: 'string',
    },
    {
      name: 'enabledFlag',
      type: 'string',
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'detailMaintain',
      type: 'string',
      align: 'left',
      width: 150,
      renderer: ({ record }) => {
        return [
          <div>
            <a
              style={{ marginRight: '8px' }}
              onClick={() => OpenNodeDetail(record.get('nodeStrategyId'), 'strategy')}
            >
              {' '}
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          </div>,
        ];
      },
    },
  ];
  return <Table columns={referColumns} dataSet={ReferTableDs} />;
};

export default Index;
