/*
 * Contact - 联系人信息
 * @Date: 2023-04-10 19:45:18
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Table, SecretField, Tooltip } from 'choerodon-ui/pro';
import { renderStatus, handleExtTextRenderIntercept } from '@/routes/components/utils';
import {
  getToolTipPrefix,
  getInsertTip,
} from '@/routes/SupplierInformNew/Compare/SupplierBasic/utils';
import styles from '../styles.less';

const Contact = ({
  dataSet,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleCompareRender,
  customizeUnitCode,
  showUpdateFlag,
}) => {
  const columns = [
    showUpdateFlag && {
      type: 'select',
      name: 'objectFlag',
      renderer: renderStatus,
    },
    {
      name: 'name',
      width: 150,
      renderer: ({ record, name }) => {
        if (record) {
          const { nameFlag, nameOld, objectFlag } = record.get([
            'nameFlag',
            'nameOld',
            'objectFlag',
          ]);
          const showTips = nameFlag === 'UPDATE' || objectFlag === 'CREATE';
          const toolTips =
            objectFlag === 'CREATE' ? `${getInsertTip()}` : `${getToolTipPrefix()}${nameOld}`;
          const toolTipText = showUpdateFlag && showTips ? toolTips : '';
          return (
            <Tooltip placement="top" title={toolTipText}>
              <SecretField
                className={showTips ? styles['secret-red'] : {}}
                readOnly
                displayOutput
                record={record}
                name={name}
              />
            </Tooltip>
          );
        }
      },
    },
    {
      name: 'mail',
      width: 180,
      renderer: ({ record, name }) => {
        if (record) {
          const { mailFlag, mailOld, objectFlag } = record.get([
            'mailFlag',
            'mailOld',
            'objectFlag',
          ]);
          const showTips = mailFlag === 'UPDATE' || objectFlag === 'CREATE';
          const toolTips =
            objectFlag === 'CREATE' ? `${getInsertTip()}` : `${getToolTipPrefix()}${mailOld}`;
          const toolTipText = showUpdateFlag && showTips ? toolTips : '';
          return (
            <Tooltip placement="top" title={toolTipText}>
              <SecretField
                className={showTips ? styles['secret-red'] : {}}
                readOnly
                displayOutput
                record={record}
                name={name}
              />
            </Tooltip>
          );
        }
      },
    },
    {
      name: 'mobilephone',
      width: 150,
      type: 'phone',
      renderer: ({ record, name }) => {
        if (record) {
          const { mobilephoneFlag, mobilephoneOld, objectFlag } = record.get([
            'mobilephoneFlag',
            'mobilephoneOld',
            'objectFlag',
          ]);
          const showTips = mobilephoneFlag === 'UPDATE' || objectFlag === 'CREATE';
          const toolTips =
            objectFlag === 'CREATE'
              ? `${getInsertTip()}`
              : `${getToolTipPrefix()}${mobilephoneOld}`;
          const toolTipText = showUpdateFlag && showTips ? toolTips : '';
          return (
            <Tooltip placement="top" title={toolTipText}>
              <span style={{ color: showTips && 'red' }}>
                <SecretField displayOutput record={record} name={name} tooltip="none" />
              </span>
            </Tooltip>
          );
        }
      },
    },
    {
      name: 'contactType',
      type: 'select',
      width: 120,
    },
    {
      name: 'department',
      width: 150,
    },
    {
      name: 'position',
      width: 150,
    },
    {
      name: 'telephone',
      width: 150,
    },
    {
      name: 'description',
      width: 150,
    },
    {
      name: 'defaultFlag',
      width: 100,
      type: 'boolean',
    },
    {
      name: 'enabledFlag',
      width: 80,
      type: 'boolean',
    },
  ]
    .filter(Boolean)
    .map(column => {
      const { type, ...others } = column;
      return {
        renderer: ({ value, record, name }) => handleCompareRender({ value, record, name, type }),
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
      dataSet={dataSet}
      columns={columns}
      selectionMode="none"
      style={tableMaxHeight}
      custLoading={custLoading}
    />
  );
};

export default Contact;
