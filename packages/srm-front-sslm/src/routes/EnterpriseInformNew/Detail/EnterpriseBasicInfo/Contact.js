/*
 * Contact - 联系人信息
 * @Date: 2023-08-29 20:54:40
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback, Fragment } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import classnames from 'classnames';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';

import { renderStatus } from '@/routes/components/utils';
import commonStyles from '@/routes/index.less';

import { getToolTipPrefix } from '../../utils';

import styles from '../../styles.less';

const Contact = ({
  dataSet,
  isEdit,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleFieldRender = () => {},
  isAllPlatform = true,
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
      name: 'name',
      width: 150,
    },
    {
      name: 'gender',
      width: 120,
      hidden: isAllPlatform,
    },
    {
      name: 'mail',
      width: 150,
    },
    {
      name: 'mobilephone',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'idType',
      width: 120,
      hidden: isAllPlatform,
    },
    {
      name: 'idNum',
      width: 150,
      hidden: isAllPlatform,
    },
    {
      name: 'contactType',
      width: 150,
      hidden: isAllPlatform,
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
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'enabledFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ].map(column => ({ editor: isEdit, ...column }));

  const viewColumns = [
    {
      name: 'objectFlag',
      ignore: true,
      renderer: renderStatus,
    },
    {
      name: 'name',
      width: 150,
    },
    {
      name: 'gender',
      width: 120,
      type: 'SELECT',
      hidden: isAllPlatform,
    },
    {
      name: 'mail',
      width: 150,
    },
    {
      name: 'mobilephone',
      width: 140,
      type: 'phone',
      renderer: ({ value, record }) => {
        if (record) {
          const {
            internationalTelCodeFlag,
            mobilephoneFlag,
            objectFlag,
            mobilephoneOld,
            internationalTelMeaningOld,
            internationalTelCode,
          } = record.get([
            'internationalTelCodeFlag',
            'mobilephoneFlag',
            'objectFlag',
            'mobilephoneOld',
            'internationalTelMeaningOld',
            'internationalTelCode',
          ]);
          const showTips = internationalTelCodeFlag === 'UPDATE' || mobilephoneFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          if (internationalTelMeaningOld && mobilephoneOld) {
            renderOldValue = `${internationalTelMeaningOld} | ${mobilephoneOld}`;
          } else if (internationalTelMeaningOld) {
            renderOldValue = internationalTelMeaningOld;
          } else if (mobilephoneOld) {
            renderOldValue = mobilephoneOld;
          }
          const renderValue = value ? `${internationalTelCode || ''} ${value}` : '-';
          const toolTipText = showTips ? `${getToolTipPrefix()}${renderOldValue}` : '';
          return (
            <Tooltip placement="top" title={toolTipText}>
              <span
                style={{ color: redFlag && 'red' }}
                className={classnames({
                  [styles['enterprise-info-field-delete']]: deleteDataFlag,
                })}
              >
                {renderValue}
              </span>
            </Tooltip>
          );
        }
      },
    },
    {
      name: 'idType',
      width: 120,
      hidden: isAllPlatform,
      type: 'SELECT',
    },
    {
      name: 'idNum',
      width: 150,
      hidden: isAllPlatform,
    },
    {
      name: 'contactType',
      width: 150,
      type: 'SELECT',
      hidden: isAllPlatform,
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
      type: 'CHECKBOX',
    },
    {
      name: 'enabledFlag',
      width: 80,
      type: 'CHECKBOX',
    },
  ].map(column => {
    const { type, ignore, ...others } = column;
    return ignore
      ? others
      : {
          renderer: ({ value, record, name }) => handleFieldRender({ value, record, name, type }),
          ...others,
        };
  });

  const showAlert = !!mustLineTabObj.CONTACT && isEdit;

  return (
    <Fragment>
      {showAlert && (
        <Alert
          showIcon
          type="info"
          message={intl
            .get('sslm.common.view.tooltip.leastOneLine', {
              name: tabName,
              number: mustLineTabObj.CONTACT,
            })
            .d(`请至少填写${mustLineTabObj.CONTACT}条${tabName}`)}
          style={{ marginBottom: 16, border: 0 }}
          className={commonStyles['alert-styles']}
        />
      )}
      {customizeTable(
        {
          code,
          readOnly: !isEdit,
        },
        <Table
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

export default Contact;
