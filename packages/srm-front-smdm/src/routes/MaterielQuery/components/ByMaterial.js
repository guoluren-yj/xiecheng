import React from 'react';
import { Table, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { enableRender, dateTimeRender } from 'utils/renderer';

const ByMaterial = ({
  loading,
  dataSource,
  pagination,
  rowSelection,
  onChange,
  customizeTable,
  handleGoDetail,
  cuxCloumns,
}) => {
  const columns = [
    {
      title: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
      dataIndex: 'itemCode',
      width: 200,
      render: (text, record) => <a onClick={() => handleGoDetail(record.itemId)}>{text}</a>,
    },
    {
      title: intl.get('smdm.materiel.model.materiel.originItemCode').d('原始物料编码'),
      dataIndex: 'originItemCode',
      width: 200,
    },
    {
      title: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
      dataIndex: 'itemName',
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
      width: 350,
    },
    {
      title: intl.get(`smdm.materiel.model.materiel.version`).d('版本'),
      width: 150,
      dataIndex: 'versionNumber',
    },
    {
      title: intl.get('smdm.materiel.model.materiel.specifications').d('规格'),
      dataIndex: 'specifications',
      width: 100,
    },
    {
      title: intl.get('smdm.materiel.model.materiel.model').d('型号'),
      dataIndex: 'model',
      width: 100,
    },
    {
      title: intl.get(`smdm.materiel.model.materiel.itemNumber`).d('云平台物料编码'),
      width: 150,
      dataIndex: 'itemNumber',
    },
    {
      title: intl.get(`smdm.materiel.model.materiel.commonName`).d('通用名'),
      width: 200,
      dataIndex: 'commonName',
    },
    {
      title: intl.get(`smdm.materiel.model.materiel.categoryNameType`).d('平台分类'),
      width: 100,
      dataIndex: 'categoryName',
    },
    {
      title: intl.get(`smdm.materiel.model.materiel.primaryUomName`).d('基本计量单位'),
      width: 150,
      dataIndex: 'uomName',
    },
    {
      title: intl.get(`smdm.materiel.model.materiel.lastUpdatedName`).d('最后更新人'),
      width: 100,
      dataIndex: 'lastUpdatedName',
    },
    {
      title: intl.get(`smdm.materiel.model.materiel.lastUpdateDate`).d('最后更新时间'),
      width: 150,
      dataIndex: 'lastUpdateDate',
      render: (val) => dateTimeRender(val),
    },
    {
      title: intl.get('smdm.materiel.model.common.externalSystemCode').d('外部来源系统编码'),
      width: 100,
      align: 'center',
      dataIndex: 'externalSystemCode',
    },
    {
      title: intl.get('hzero.common.status').d('状态'),
      width: 75,
      align: 'center',
      dataIndex: 'enabledFlag',
      render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
    },
  ];

  const newColumns = typeof cuxCloumns === 'function' ? cuxCloumns({ columns }) : columns;

  return (
    customizeTable(
      {
        code: 'SMDM_MATERIELQUERY_LIST.GRID',
      },
      <Table
        bordered
        rowKey="itemId"
        loading={loading}
        dataSource={dataSource}
        columns={newColumns}
        pagination={pagination}
        rowSelection={rowSelection}
        onChange={onChange}
      />
    )
  );
};

export default ByMaterial;
