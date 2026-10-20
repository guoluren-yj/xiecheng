/*
 * Address - 地址信息
 * @Date: 2023-04-10 20:54:40
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import RegionCascade from '@/routes/components/RegionCascade';
import styles from '@/routes/index.less';
import { dsDeleteData } from '@/routes/components/utils/utils';

const Address = ({
  dataSet,
  isEdit,
  custLoading,
  setLoading,
  headerInfo,
  customizeTable,
  tableMaxHeight,
  supplierInformRemote,
}) => {
  const getButtons = useCallback(() => {
    const btns = isEdit
      ? [
          'add',
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet }),
            },
          ],
        ]
      : [];
    const buttons = supplierInformRemote
      ? supplierInformRemote.process('SSLM_SUPPLIER_INFORM_NEW_SUPPLIER_BASIC_ADDRESS_BTNS', btns, {
          isEdit,
          dataSet,
          headerInfo,
          setLoading,
        })
      : btns;
    return buttons;
  }, [isEdit, dataSet, headerInfo]);

  const columns = [
    {
      name: 'countryId',
      width: 150,
    },
    {
      name: 'regionPathName',
      width: 250,
      className: styles['region-td'],
      renderer: ({ record }) => {
        return (
          <RegionCascade record={record} editable={isEdit} disabled={!record.get('countryId')} />
        );
      },
    },
    {
      name: 'addressDetail',
    },
    {
      name: 'postCode',
      width: 130,
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'enabledFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ].map(column => ({ ...column, editor: column.name === 'regionPathName' ? false : isEdit }));

  return customizeTable(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ADDRESS',
    },
    <Table
      rowHeight={30}
      dataSet={dataSet}
      columns={columns}
      buttons={getButtons()}
      custLoading={custLoading}
      style={tableMaxHeight}
      selectionMode={isEdit ? 'rowbox' : 'none'}
    />
  );
};

export default Address;
