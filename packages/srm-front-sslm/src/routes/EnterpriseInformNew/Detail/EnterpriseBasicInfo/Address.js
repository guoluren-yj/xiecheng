/*
 * Address - 地址信息
 * @Date: 2023-08-29 20:54:40
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import RegionCascade from '@/routes/components/RegionCascade';
import styles from '@/routes/index.less';
import { renderStatus } from '@/routes/components/utils';

const Address = ({
  dataSet,
  isEdit,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleFieldRender = () => {},
  isAllPlatform,
  partnerTenantId,
  code = '',
  mustLineTabObj = {},
  tabName,
}) => {
  const getButtons = useCallback(() => {
    return isEdit
      ? [
          ['add', { afterClick: () => handleAdd() }],
          [
            'delete',
            {
              onClick: () => dataSet.delete(dataSet.selected, false),
            },
          ],
          [
            'save',
            {
              onClick: () => {
                dataSet.submit().then(res => {
                  if (res) {
                    dataSet.query();
                  }
                });
              },
            },
          ],
        ]
      : [];
  }, [isEdit, dataSet]);

  const handleAdd = useCallback(() => {
    const currentRow = dataSet.current;
    if (currentRow && !isAllPlatform) {
      currentRow.set({
        tenantId: partnerTenantId,
      });
    }
  }, [isAllPlatform, partnerTenantId]);

  const editColumns = [
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

  const viewColumns = [
    {
      name: 'objectFlag',
      ignore: true,
      renderer: renderStatus,
    },
    {
      name: 'countryId',
      width: 150,
      displayField: 'countryName',
    },
    {
      name: 'regionPathName',
      width: 250,
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
      type: 'CHECKBOX',
    },
  ].map(column => {
    const { type, displayField, ignore, ...others } = column;
    return ignore
      ? others
      : {
          renderer: ({ value, record, name }) =>
            handleFieldRender({ value, record, name, type, displayField }),
          ...others,
        };
  });

  const showAlert = !!mustLineTabObj.ADDRESS && isEdit;

  return (
    <Fragment>
      {showAlert && (
        <Alert
          showIcon
          type="info"
          message={intl
            .get('sslm.common.view.tooltip.leastOneLine', {
              name: tabName,
              number: mustLineTabObj.ADDRESS,
            })
            .d(`请至少填写${mustLineTabObj.ADDRESS}条${tabName}`)}
          style={{ marginBottom: 16, border: 0 }}
          className={styles['alert-styles']}
        />
      )}
      {customizeTable(
        {
          code,
          readOnly: !isEdit,
        },
        <Table
          rowHeight={30}
          dataSet={dataSet}
          columns={isEdit ? editColumns : viewColumns}
          buttons={getButtons()}
          custLoading={custLoading}
          style={tableMaxHeight}
          selectionMode={isEdit ? 'rowbox' : 'none'}
        />
      )}
    </Fragment>
  );
};

export default Address;
