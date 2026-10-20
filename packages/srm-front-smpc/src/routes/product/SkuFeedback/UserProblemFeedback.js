import React, { useMemo, useState } from 'react';
import { Tag } from 'choerodon-ui';
import { DataSet, Modal, Button, Table, CheckBox, Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { RecordTimeLine, RecordApproval } from '@/components/Record';
import useQuerySearchBarProps from './useQuerySearchBarProps';
import { getUserSameSkuDataSetProps, getUserRecordDataSetProps } from './ds';
import { skuInfoRenderer, operateRenderer } from './renderer';

const SameSkuTable = ({ record }) => {
  const dataSet = useMemo(
    () => new DataSet(getUserSameSkuDataSetProps(record.get('manageId'))),
    []
  );
  const columns = useMemo(
    () => [
      { name: 'skuCode', width: 120 },
      { name: 'skuName', minWidth: 120 },
      { name: 'skuPrice', align: 'right', width: 120 },
      { name: 'supplierCompanyName', minWidth: 120 },
      { name: 'blacklistFlag', width: 100, tooltip: 'none', editor: <CheckBox /> },
    ],
    []
  );
  return <Table dataSet={dataSet} columns={columns} style={{ maxHeight: 'calc(100% - 48px)' }} />;
};

const RecordTabs = ({ manageId, businessKey }) => {
  const [tabKey, setTabKey] = useState('operate');
  const dataSet = useMemo(() => new DataSet(getUserRecordDataSetProps(manageId)), [manageId]);
  return (
    <Tabs activeKey={tabKey} onChange={(key) => setTabKey(key)}>
      <Tabs.TabPane key="operate" tab={intl.get('hzero.common.button.operation').d('操作记录')}>
        <div style={{ marginTop: 8 }}>
          <RecordTimeLine
            dataSet={dataSet}
            renderer={(arg) => operateRenderer(arg, () => setTabKey('approve'))}
          />
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane
        key="approve"
        tab={intl.get('hzero.common.button.approveHistory').d('审批记录')}
      >
        <RecordApproval businessKey={businessKey} />
      </Tabs.TabPane>
    </Tabs>
  );
};

export default function UserProblemFeedback(props) {
  const { dataSet, searchCode, customizedCode } = props;
  const searchBarProps = useQuerySearchBarProps(dataSet);

  const columns = useMemo(() => {
    return [
      {
        name: 'manageStatusMeaning',
        width: 100,
        tooltip: 'none',
        renderer: ({ record, value }) => {
          const colorMap = {
            NEW: 'yellow',
            SUBMIT: 'green',
            PROCESSED: 'green',
            APPROVED: 'green',
            REJECTED: 'red',
            __default: 'yellow',
          };
          const manageStatus = record.get('manageStatus');
          const tagColor = colorMap[manageStatus] || colorMap.__default;
          return (
            <Tag color={tagColor} style={{ border: 'none' }}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'realName',
        width: 140,
        renderer: ({ record, value }) => `${value}(${record.get('loginName')})`,
      },
      { name: 'feedbackTime', width: 140 },
      { name: 'manageTypeMeaning', width: 140 },
      { name: 'remark', minWidth: 120 },
      { name: 'mainSkuCode', width: 120 },
      { name: 'skuInfo', minWidth: 200, tooltip: 'none', renderer: skuInfoRenderer },
      { name: 'mainSkuPrice', align: 'right', width: 100 },
      { name: 'mainSupplierName', minWidth: 140 },
      {
        name: 'action',
        lock: 'right',
        align: 'left',
        width: 160,
        tooltip: 'none',
        command: ({ record }) => {
          const lineNums = record.get('lineNums') || 0;
          return [
            <Button funcType="link" onClick={() => handleOpenSameSkuModal(record)}>
              {intl.get('smpc.product.view.sameSku').d('同款商品')}({lineNums})
            </Button>,
            <Button funcType="link" onClick={() => handleOpenOperateRecord(record)}>
              {intl.get('hzero.common.button.record').d('操作记录')}
            </Button>,
          ];
        },
      },
    ];
  }, []);

  function handleOpenSameSkuModal(record) {
    Modal.open({
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 742 },
      title: intl.get('smpc.product.view.sameSku').d('同款商品'),
      children: <SameSkuTable record={record} />,
    });
  }

  function handleOpenOperateRecord(record) {
    const manageId = record.get('manageId');
    const businessKey = `SMPC.SAME_SKU_MANAGE:${manageId}`;
    Modal.open({
      drawer: true,
      okCancel: false,
      title: intl.get('smpc.product.view.operateRecord').d('操作记录'),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 742 },
      children: <RecordTabs manageId={manageId} businessKey={businessKey} />,
    });
  }

  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      <SearchBarTable
        searchCode={searchCode}
        dataSet={dataSet}
        columns={columns}
        rowHeight={44}
        customizedCode={customizedCode}
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchBarConfig={searchBarProps}
      />
    </div>
  );
}
