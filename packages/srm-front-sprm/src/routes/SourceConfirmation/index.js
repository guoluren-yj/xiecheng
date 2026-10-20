import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Header, Content } from 'components/Page';
import { Card } from 'choerodon-ui';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import querystring from 'querystring';

const LineTable = observer(({ headerRecord }) => {
  const supplierList = headerRecord.get('supplierList') || [];

  const tableDs = useMemo(
    () =>
      new DataSet({
        autoQuery: false,
        pageSize: 20,
        selection: 'multiple',
        fields: [
          { name: 'supplierCompanyNum', type: 'string', label: '供应商公司编码' },
          { name: 'supplierCompanyName', type: 'string', label: '供应商公司名称' },
          { name: 'unitPrice', type: 'string', label: '不含税单价' },
          { name: 'currencyCode', type: 'string', label: '货币' },
          { name: 'taxRate', type: 'string', label: '税率' },
          { name: 'taxPrice', type: 'string', label: '含税单价' },
          { name: 'uomCodeName', type: 'string', label: '单位' },
        ],
        record: {
          dynamicProps: {
            selectable: (record) => {
              return tableDs.selected.length === 0 || record.isSelected;
            },
          },
        },
      }),
    []
  );

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyNum',
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'unitPrice',
      },
      {
        name: 'currencyCode',
      },
      {
        name: 'taxRate',
      },
      {
        name: 'taxPrice',
      },
      {
        name: 'uomCodeName',
      },
    ],
    []
  );

  useEffect(() => {
    tableDs.loadData(supplierList);
    headerRecord.set('tableDs', tableDs);
  }, [supplierList, tableDs]);

  return <Table columns={columns} dataSet={tableDs} />;
});

const SourceConfirmation = function(props) {
  const { location } = props;
  const { appSessionId, applicationUuid, sourceAppSessionId, sourceApplicationUuid } = querystring.parse(location.search.substr(1)) || {};

  const ds = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 20,
        transport: {
          read: {
            url: `/sprm/v1/${getCurrentOrganizationId()}/agent/pr-transfer/query/pending-supplier`,
            method: 'post',
          },
        },
        fields: [
          { name: 'displayPrNum', type: 'string', label: '申请单号' },
          { name: 'requestDate', type: 'string', label: '申请日期' },
          { name: 'prRequestedName', type: 'string', label: '申请人' },
          { name: 'itemCode', type: 'string', label: '物料编码' },
          { name: 'itemName', type: 'string', label: '物料名称' },
          { name: 'quantity', type: 'string', label: '需求数量' },
          { name: 'deliveryDate', type: 'string', label: '交货日期' },
          { name: 'status', type: 'string', label: '状态' },
          { name: 'supplierList', type: 'array', label: '供应商列表' },
        ],
      }),
    []
  );

  const handleConfirmSource = useCallback(async () => {
    const confirmReuslt = ds.map((record) => ({
      prLineId: record.get('prLineId'),
      confirmSupplier: record.get('tableDs')?.selected?.map((item) => item.toData())?.[0] || {},
    }));
    const params = {
      instruct: 'submit-form',
      content: {
        confirmReuslt,
      },
    };
    const res = await request(
      `/sprm/v1/${getCurrentOrganizationId()}/agent/pr-transfer/supplier-confirm`,
      {
        method: 'POST',
        body: confirmReuslt,
      }
    );
    if (res && res.allConfirmFlag === 1) {
      await fetch(
        `https://aigctestb.saas.hand-china.com/v1/open/flow/session/mock-send?applicationUuid=${applicationUuid}&appSessionId=${appSessionId}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: 'bearer d203889e2cc08-4377-830f-dbef3e211003',
          },
          body: JSON.stringify(params),
        }
      );
      await fetch(
        `https://aigctestb.saas.hand-china.com/v1/open/flow/session/mock-send?applicationUuid=${sourceApplicationUuid}&appSessionId=${sourceAppSessionId}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: 'bearer d203889e2cc08-4377-830f-dbef3e211003',
          },
          body: JSON.stringify(params),
        }
      );
    }
  }, [ds, appSessionId, applicationUuid, sourceAppSessionId, sourceApplicationUuid]);

  const isAllCardsSelected = ds.every((record) => {
    return record.get('tableDs') && record.get('tableDs')?.selected?.length > 0;
  });
  const disabled = !isAllCardsSelected;

  return (
    <>
      <Header title="货源确认">
        <Button color="primary" disabled={disabled} onClick={handleConfirmSource}>
          确认货源
        </Button>
      </Header>
      <Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ds.map((record) => (
            <Card key={record.get('displayPrNum')} style={{ width: '100%' }}>
              <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>申请单号：</span>
                  {record.get('displayPrNum')}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>申请日期：</span>
                  {record.get('requestDate')}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>申请人：</span>
                  {record.get('prRequestedName')}
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span
                    style={{
                      color: record.get('confirmStatus') === 'PENDING' ? 'red' : 'green',
                      fontWeight: 'bold',
                    }}
                  >
                    {record.get('confirmStatusMeaning')}
                  </span>
                </div>
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>物料编码：</span>
                  {record.get('itemCode')}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>物料名称：</span>
                  {record.get('itemName')}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>需求数量：</span>
                  {record.get('quantity')}
                </div>
              </div>
              <LineTable headerRecord={record} />
            </Card>
          ))}
        </div>
      </Content>
    </>
  );
};

export default observer(SourceConfirmation);
