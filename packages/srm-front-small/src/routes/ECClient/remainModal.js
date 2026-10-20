import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Button, Output, Table, Tooltip } from 'choerodon-ui/pro';

import HeadLine from '@/components/HeadLine';
import intl from 'utils/intl';
// import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import c7nModal from '@/utils/c7nModal';
import RemainDetailModal from './RemainDetailModal';

import { remainDs, remainTableDs } from './listDs';

function RemainModal(props) {
  const formDS = useMemo(() => new DataSet(remainDs()), []);
  const tableDS = useMemo(() => new DataSet(remainTableDs(props.recordData)), []);
  const handleOpenRemainDetailModal = (recordData)=>{
    c7nModal({
      title: intl.get('small.ecClient.view.tip.remainDetail').d('查看预充值余额明细'),
      style: { width: '1090px' },
      children: <RemainDetailModal recordData={recordData} />,
      okText: intl.get('small.common.model.close').d('关闭'),
      cancelButton: false,
      maskClosable: 'click',
    });
  };
  const columns = useMemo(() => [
    { name: 'pin' },
    { name: 'mapping' },
    { name: 'preChargeRemainLimit', align: 'right',
      renderer: ({value})=>{
        return (
          <Tooltip title={intl.get('small.ecClient.view.tip.remainDetail').d('查看预充值余额明细')}>
            <Button funcType="link" color="primary" onClick={() => handleOpenRemainDetailModal(props.recordData)}>{value}</Button>
          </Tooltip>
        );
      },
    },
    { name: 'accountingPeriodRemainLimit', align: 'right' },
  ], []);
  useEffect(() => {
    const { recordData = {} } = props;
    const ecPlatformCodeName = `${recordData.ecPlatform}-${recordData.ecPlatformName}`;
    formDS.loadData([{ ...recordData, ecPlatform: ecPlatformCodeName }] || []);
  }, []);
  const btns = [
    // <ExcelExportPro
    //   exportAsync
    //   templateCode="SMAL.RECEIVE_ADDRESS_EXPORT"
    //   requestUrl={`/smal/v1/${getCurrentOrganizationId()}/addresss/receiver/export`}
    //   otherButtonProps={{
    //     type: 'c7n-pro',
    //     funcType: 'flat',
    //     icon: 'unarchive',
    //   }}
    // />,
    <Button icon='autorenew' onClick={() => tableDS.query()}>{intl.get('small.ecClient.view.option.accountInfo').d('刷新')}</Button>,
  ];
  return (
    <>
      <HeadLine title={intl.get('small.ecClient.view.option.accountInformation').d('账户信息')} />
      <Form
        dataSet={formDS}
        columns={2}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
      >
        <Output name='ecPlatform' />
        <Output name='dataType' />
        <Output name='ecCompanyName' />
        <Output name='userName' />
      </Form>
      <HeadLine style={{ marginTop: '32px' }} title={intl.get('small.ecClient.view.option.remainInfo').d('余额信息')} />
      <Table
        dataSet={tableDS}
        columns={columns}
        buttons={btns}
        style={{ maxHeight: 'calc(100vh - 440px)' }}
        pagination={{ pageSizeOptions: ['20'] }}
        customizedCode="SMAL.EC_CLIENT.REMAIN"
      />
    </>
  );
}

export default RemainModal;