/*
 * LocationInfo - 地点层信息
 * @Date: 2023-04-12 16:40:07
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { renderStatus, handleExtTextRenderIntercept } from '@/routes/components/utils';
import OUInfo from './OUInfo';

const LocationInfo = ({
  dataSet,
  status,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleCompareRender,
  customizeUnitCode,
  showUpdateFlag,
}) => {
  const handleOuModal = useCallback(record => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1200 },
      cancelButton: false,
      bodyStyle: { padding: 0 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.supplierInform.model.supplierInform.OUMessage').d('OU层信息'),
      children: (
        <OUInfo
          record={record}
          custLoading={custLoading}
          customizeTable={customizeTable}
          handleCompareRender={handleCompareRender}
        />
      ),
    });
  }, []);

  const columns = [
    showUpdateFlag && {
      type: 'select',
      name: 'objectFlag',
      renderer: renderStatus,
    },
    {
      name: 'countryId',
      width: 150,
      displayField: 'countryName',
    },
    {
      name: 'regionId',
      width: 150,
      displayField: 'regionName',
    },
    {
      name: 'cityId',
      width: 150,
      displayField: 'regionName',
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
      displayField: 'contactName',
    },
    {
      name: 'mobilephone',
      width: 180,
      type: 'phone',
    },
    {
      name: 'ouMessage',
      width: 100,
      editor: false,
      renderer: ({ record }) => {
        return (
          <a disabled={status === 'history'} onClick={() => handleOuModal(record)}>
            {intl.get(`sslm.supplierInform.model.supplierInform.OUMessage`).d('OU层信息')}
          </a>
        );
      },
    },
    {
      name: 'enabledFlag',
      width: 100,
      type: 'boolean',
    },
  ]
    .filter(Boolean)
    .map(column => {
      const { type, displayField, ...others } = column;
      return {
        renderer: ({ value, record, name }) =>
          handleCompareRender({ value, record, name, type, displayField }),
        ...others,
      };
    });

  return customizeTable(
    {
      code: customizeUnitCode,
      readOnly: true,
      extTextRenderIntercept: handleExtTextRenderIntercept,
    },
    <Table
      columns={columns}
      dataSet={dataSet}
      style={tableMaxHeight}
      custLoading={custLoading}
      selectionMode="none"
    />
  );
};

export default LocationInfo;
