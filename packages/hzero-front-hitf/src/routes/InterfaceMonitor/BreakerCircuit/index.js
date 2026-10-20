import React, { useEffect } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';

import { circuitDetailsData } from '@/stores/InterfaceMonitor/BreakerCircuit';
import InterfaceFlowControlDetails from './InterfaceFlowControlDetails';

// @ts-ignore
import styles from './index.less';

const prefix = 'sitf.interfaceMointoringWork';

const cicuitColumns = [
  {
    name: 'actionTypeMeaning',
  },
  {
    name: 'limitTypeMeaning',
  },
  {
    name: 'reason',
  },
  {
    name: 'triggerTime',
  },
  {
    name: 'lockingDuration',
  },
  {
    name: 'expiryDate',
  },
  {
    name: 'sourceFromMeaning',
  },
  {
    name: 'createdRealName',
  },
  {
    name: 'creationDate',
  },
  {
    name: 'lastUpdatedRealName',
  },
  {
    name: 'lastUpdateDate',
  },
];

const ExceptionQuery = ({ tableDs }) => {
  useEffect(() => {
    handleSearch();
  }, []);
  // 接口限流详情
  const handleOpenInterfaceDetails = (record) => {
    Modal.open({
      title: intl.get(`${prefix}.model.interfaceFlowControl.details`).d('接口限流详情'),
      drawer: true,
      footer: null,
      style: { width: 800 },
      children: (
        <InterfaceFlowControlDetails
          dataSource={record.toData()}
          dataSetSource={tableDs}
          rederOnly={!false}
          itfSrcPlatform={record.get('itfSrcPlatform')}
        />
      ),
    });
  };

  // 熔断详情
  const handleOpenCircuitDetails = (record) => {
    const circuitDetailsDataDs = new DataSet(circuitDetailsData());
    circuitDetailsDataDs.setQueryParameter('tenantId', record.get('tenantId'));
    circuitDetailsDataDs.setQueryParameter('itfSrcPlatform', record.get('itfSrcPlatform'));
    circuitDetailsDataDs.setQueryParameter('interfaceId', record.get('interfaceId'));
    circuitDetailsDataDs.query();
    Modal.open({
      title: intl.get(`${prefix}.model.interfaceFlowControl.circuit.details`).d('熔断详情'),
      closable: true,
      style: { width: 800 },
      drawer: true,
      footer: null,
      children: (
        <>
          <span>
            {intl.get(`${prefix}.model.number.circuit.breakers`).d('熔断次数')}{' '}
            {record.get('limitRecCount')} {intl.get(`${prefix}.model.number.order`).d('次')}
          </span>
          <Table dataSet={circuitDetailsDataDs} columns={cicuitColumns} />
        </>
      ),
    });
  };
  const breakerCircuitColumns = [
    {
      name: 'cnfStatusMeaning',
    },
    {
      name: 'interfaceCode',
    },
    {
      name: 'interfaceName',
    },
    {
      header: intl.get(`${prefix}.model.interfaceFlowControl.details`).d('接口限流详情'),
      renderer: ({ record }) => (
        <a onClick={() => handleOpenInterfaceDetails(record)}>
          {intl.get(`${prefix}.model.interfaceFlowControl.details`).d('接口限流详情')}
        </a>
      ),
    },
    {
      header: intl.get(`${prefix}.model.interfaceFlowControl.circuit.details`).d('熔断详情'),
      renderer: ({ record }) => (
        <a onClick={() => handleOpenCircuitDetails(record)}>
          {intl.get(`${prefix}.model.interfaceFlowControl.circuit.details`).d('熔断详情')}
        </a>
      ),
    },
    {
      name: 'limitRecCount',
    },
    {
      name: 'tenantName',
    },
    {
      name: 'createdRealName',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'lastUpdatedRealName',
    },
    {
      name: 'lastUpdateDate',
    },
  ];

  // 重置
  const handleReset = () => {
    tableDs.queryDataSet.reset();
  };

  // 查询
  const handleSearch = () => {
    tableDs.query();
  };

  const buttonRender = [
    <Button icon="undo" onClick={handleReset}>
      {intl.get(`${prefix}.view.button.reset`).d('重置')}
    </Button>,
    <Button icon="search" onClick={handleSearch}>
      {intl.get(`${prefix}.view.button.search`).d('查询')}
    </Button>,
  ];

  return (
    <div className={styles.content}>
      <div className={styles['content-rightList']}>
        <Table
          dataSet={tableDs}
          className={styles['hitf-table-bar']}
          columns={breakerCircuitColumns}
          queryBar="filterBar"
          queryFieldsLimit={11}
          buttons={buttonRender}
        />
      </div>
    </div>
  );
};

export default React.memo(
  formatterCollections({
    code: ['sitf.interfaceMointoringWork'],
  })(ExceptionQuery)
);
