import { renderStatus } from './methods';

/**
 * tab页面参数
 * @menuMarkId 是否为数据池数据
 * @_key 各个tab的页面
 * * */
export const indexColumns = () => {
  return [
    {
      name: 'poLineLocationStatusMeaning',
      width: 110,
      // renderer: ({ value, record }) => colorRender(value, record, 'poLineLocationStatus'),
      renderer: ({ value, record }) => renderStatus(record.get('poLineLocationStatus'), value),
    },
    {
      name: 'fromDisplayPoNum',
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'fromDisplayPoLocationNum',
      width: 60,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
      renderer: ({ record }) => record?.get('supplierName'),
    },
    {
      width: 120,
      name: 'itemCode',
    },
    {
      name: 'itemName',
      width: 120,
    },
    {
      name: 'displayUom',
      width: 80,
    },
    {
      name: 'poQuantity',
      width: 80,
    },
  ];
};
