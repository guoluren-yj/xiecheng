import React, { useCallback, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Header, Content } from 'components/Page';
import { Card } from 'choerodon-ui';
import { DataSet, Button, Pagination } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

const OrderLine = observer(({ poHeaderId, isExpanded }) => {
  const lineDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 20,
        transport: {
          read: {
            url: `/spuc/v1/${getCurrentOrganizationId()}/po-line/${poHeaderId}/detail`,
            method: 'get',
            data: {
              asyncCountFlag: 'DEFAULT',
              customizeOrderField: 'lineNum:asc',
              camp: 2,
              sortType: 0,
            },
          },
        },
        fields: [
          { name: 'displayLineNum', type: 'string', label: '行编号' },
          { name: 'itemName', type: 'string', label: '物料名称' },
          { name: 'quantity', type: 'string', label: '需求数量' },
          { name: 'enteredTaxIncludedPrice', type: 'string', label: '含税单价' },
          { name: 'taxIncludedLineAmount', type: 'string', label: '含税金额' },
        ],
      }),
    []
  );

  return (isExpanded ? lineDs : lineDs.slice(0, 2)).map((record) => (
    <div style={{ marginBottom: '8px', color: '#666' }}>
      <span>行{record.get('displayLineNum')}</span>
      <span style={{ marginLeft: '16px' }}>{record.get('itemName')}</span>
      <span style={{ marginLeft: '16px' }}>{record.get('enteredTaxIncludedPrice')}</span>
      <span style={{ marginLeft: '16px' }}>{record.get('taxIncludedLineAmount')}</span>
    </div>
  ));
});

const OrderView = function() {
  const [expandedOrders, setExpandedOrders] = useState({});

  const ds = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        pageSize: 10,
        transport: {
          read: ({ data }) => ({
            url: `/spuc/v1/${getCurrentOrganizationId()}/po-header-signs`,
            method: 'get',
            data: {
              poWorkbenchFlag: 1,
              ...data,
            },
          }),
        },
        fields: [
          { name: 'displayPoNum', type: 'string', label: '订单编号' },
          { name: 'supplierName', type: 'string', label: '供应商' },
          { name: 'amount', type: 'string', label: '金额' },
          { name: 'lineList', type: 'array', label: '行列表' },
        ],
        queryFields: [{ name: 'displayPoNum', type: 'string', label: '订单编号', merge: true }],
      }),
    []
  );

  const toggleExpand = (poNum) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [poNum]: !prev[poNum],
    }));
  };

  const handlePageChange = useCallback(
    (page) => {
      ds.query(page);
    },
    [ds]
  );

  return (
    <>
      <Header title="查看生成订单" />
      <Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ds.map((record) => {
            const poNum = record.get('displayPoNum');
            const isExpanded = expandedOrders[poNum];

            return (
              <Card key={poNum} style={{ width: '100%' }}>
                <div
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 'bold' }}>订单单号：</span>
                    {poNum}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>供应商：</span>
                    {record.get('supplierName')}
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>金额：</span>
                    {record.get('amount')}
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <OrderLine poHeaderId={record.get('poHeaderId')} isExpanded={isExpanded} />
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Button color="primary" funcType="flat" onClick={() => toggleExpand(poNum)}>
                    {isExpanded ? '收起详情' : '查看详情...'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        <Pagination
          total={ds.totalCount}
          page={ds.currentPage}
          showSizeChanger={false}
          onChange={handlePageChange}
          style={{ marginTop: '16px' }}
        />
      </Content>
    </>
  );
};

export default observer(OrderView);
