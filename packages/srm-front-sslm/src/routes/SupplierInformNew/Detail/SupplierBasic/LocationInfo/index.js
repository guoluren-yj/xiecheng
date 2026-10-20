/*
 * LocationInfo - 地点层信息
 * @Date: 2023-04-12 16:40:07
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table, Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { getOuDS } from '@/routes/SupplierInformNew/stores/getLocationInfoDS';
import { dsDeleteData } from '@/routes/components/utils/utils';
import OUInfo from './OUInfo';

const LocationInfo = ({
  isEdit,
  dataSet,
  headerInfo,
  custLoading,
  setLoading,
  customizeTable,
  supplierInformRemote,
}) => {
  const handleOuModal = useCallback(
    record => {
      const { supChangeAddId, changeReqId } = record.get(['supChangeAddId', 'changeReqId']);
      const ouDs = new DataSet(getOuDS({ supChangeAddId, changeReqId, listDs: dataSet }));
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: 1200 },
        cancelButton: isEdit,
        okText: isEdit
          ? intl.get('hzero.common.button.sure').d('确定')
          : intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('sslm.supplierInform.model.supplierInform.OUMessage').d('OU层信息'),
        children: (
          <OUInfo
            dataSet={ouDs}
            isEdit={isEdit}
            custLoading={custLoading}
            customizeTable={customizeTable}
          />
        ),
        onOk: () => {
          if (isEdit) {
            return ouDs.submit();
          }
        },
      });
    },
    [isEdit, custLoading]
  );

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
      ? supplierInformRemote.process(
          'SSLM_SUPPLIER_INFORM_NEW_SUPPLIER_BASIC_LOCATION_BTNS',
          btns,
          {
            isEdit,
            dataSet,
            headerInfo,
            setLoading,
          }
        )
      : btns;
    return buttons;
  }, [isEdit, dataSet, headerInfo]);

  const columns = [
    {
      name: 'countryId',
      width: 150,
    },
    {
      name: 'regionId',
      width: 150,
    },
    {
      name: 'cityId',
      width: 150,
    },
    {
      name: 'address',
      width: 200,
    },
    {
      name: 'supplierAddress',
      width: 140,
    },
    {
      name: 'name',
      width: 150,
    },
    {
      name: 'mobilephone',
      width: 140,
      editor: false,
    },
    {
      name: 'ouMessage',
      width: 100,
      editor: false,
      renderer: ({ record }) => {
        return (
          <a disabled={record.status === 'add'} onClick={() => handleOuModal(record)}>
            {intl.get(`sslm.supplierInform.model.supplierInform.OUMessage`).d('OU层信息')}
          </a>
        );
      },
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ].map(column => ({ editor: isEdit, ...column }));

  return customizeTable(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.LOCATION',
    },
    <Table
      columns={columns}
      dataSet={dataSet}
      buttons={getButtons()}
      custLoading={custLoading}
      selectionMode={isEdit ? 'rowbox' : 'none'}
      style={{ maxHeight: 'calc(100vh - 400px)' }}
    />
  );
};

export default LocationInfo;
