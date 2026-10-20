/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback, Fragment } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';
import { round } from 'lodash';
import classnames from 'classnames';

import { renderStatus } from '@/routes/components/utils';
import commonStyles from '@/routes/index.less';

import { getToolTipPrefix } from '../../utils';

import styles from '../../styles.less';

const language = getCurrentLanguage();

const PurchaseFinance = ({
  isEdit,
  custLoading,
  tableMaxHeight,
  customizeTable,
  dataSet,
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
  }, [isEdit]);

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
      name: 'year',
      width: 120,
      editor: isEdit,
    },
    {
      name: 'currencyId',
      width: 140,
      editor: isEdit,
    },
    {
      name: 'totalAssets',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'totalLiabilities',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'currentAssets',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'currentLiabilities',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'revenue',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'netProfit',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'assetLiabilityRatio',
      width: 180,
    },
    {
      name: 'currentRatio',
      width: 180,
    },
    {
      name: 'totalAssetsEarningsRatio',
      width: 180,
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
  ];

  const viewColumns = [
    {
      name: 'objectFlag',
      renderer: renderStatus,
    },
    {
      name: 'year',
      width: 120,
    },
    {
      name: 'currencyId',
      width: 140,
      displayField: 'currencyName',
    },
    {
      name: 'totalAssets',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const { totalAssetsFlag, totalAssetsOld, objectFlag } = record.get([
            'totalAssetsFlag',
            'totalAssetsOld',
            'objectFlag',
          ]);
          const showTips = totalAssetsFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (totalAssetsOld) {
            renderOldValue =
              language === 'en_US'
                ? totalAssetsOld
                  ? round(totalAssetsOld / 100, 4)
                  : totalAssetsOld
                : totalAssetsOld;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'totalLiabilities',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const { totalLiabilitiesFlag, totalLiabilitiesOld, objectFlag } = record.get([
            'totalLiabilitiesFlag',
            'totalLiabilitiesOld',
            'objectFlag',
          ]);
          const showTips = totalLiabilitiesFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (totalLiabilitiesOld) {
            renderOldValue =
              language === 'en_US'
                ? totalLiabilitiesOld
                  ? round(totalLiabilitiesOld / 100, 4)
                  : totalLiabilitiesOld
                : totalLiabilitiesOld;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'currentAssets',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const { currentAssetsFlag, currentAssetsOld, objectFlag } = record.get([
            'currentAssetsFlag',
            'currentAssetsOld',
            'objectFlag',
          ]);
          const showTips = currentAssetsFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (currentAssetsOld) {
            renderOldValue =
              language === 'en_US'
                ? currentAssetsOld
                  ? round(currentAssetsOld / 100, 4)
                  : currentAssetsOld
                : currentAssetsOld;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'currentLiabilities',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const { currentLiabilitiesFlag, currentLiabilitiesOld, objectFlag } = record.get([
            'currentLiabilitiesFlag',
            'currentLiabilitiesOld',
            'objectFlag',
          ]);
          const showTips = currentLiabilitiesFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (currentLiabilitiesOld) {
            renderOldValue =
              language === 'en_US'
                ? currentLiabilitiesOld
                  ? round(currentLiabilitiesOld / 100, 4)
                  : currentLiabilitiesOld
                : currentLiabilitiesOld;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'revenue',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const { revenueFlag, revenueOld, objectFlag } = record.get([
            'revenueFlag',
            'revenueOld',
            'objectFlag',
          ]);
          const showTips = revenueFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (revenueOld) {
            renderOldValue =
              language === 'en_US'
                ? revenueOld
                  ? round(revenueOld / 100, 4)
                  : revenueOld
                : revenueOld;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'netProfit',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const { netProfitFlag, netProfitOld, objectFlag } = record.get([
            'netProfitFlag',
            'netProfitOld',
            'objectFlag',
          ]);
          const showTips = netProfitFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (netProfitOld) {
            renderOldValue =
              language === 'en_US'
                ? netProfitOld
                  ? round(netProfitOld / 100, 4)
                  : netProfitOld
                : netProfitOld;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'assetLiabilityRatio',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const { assetLiabilityRatioFlag, assetLiabilityRatioOld, objectFlag } = record.get([
            'assetLiabilityRatioFlag',
            'assetLiabilityRatioOld',
            'objectFlag',
          ]);
          const showTips = assetLiabilityRatioFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (assetLiabilityRatioOld) {
            renderOldValue = `${(assetLiabilityRatioOld * 100).toFixed(2)}%`;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'currentRatio',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const { currentRatioFlag, currentRatioOld, objectFlag } = record.get([
            'currentRatioFlag',
            'currentRatioOld',
            'objectFlag',
          ]);
          const showTips = currentRatioFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (currentRatioOld) {
            renderOldValue = `${(currentRatioOld * 100).toFixed(2)}%`;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'totalAssetsEarningsRatio',
      width: 180,
      renderer: ({ value, record }) => {
        if (record) {
          const {
            totalAssetsEarningsRatioFlag,
            totalAssetsEarningsRatioOld,
            objectFlag,
          } = record.get([
            'objectFlag',
            'totalAssetsEarningsRatioFlag',
            'totalAssetsEarningsRatioOld',
          ]);
          const showTips = totalAssetsEarningsRatioFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          let renderValue = '-';
          if (totalAssetsEarningsRatioOld) {
            renderOldValue = `${(totalAssetsEarningsRatioOld * 100).toFixed(2)}%`;
          }
          if (value) {
            renderValue = value;
          }
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
      name: 'remark',
      width: 200,
    },
  ].map(column => {
    const { displayField, ...others } = column;
    return {
      renderer: ({ value, record, name }) =>
        handleFieldRender({ value, record, name, displayField }),
      ...others,
    };
  });

  const showAlert = !!mustLineTabObj.FIN && isEdit;

  return (
    <Fragment>
      {showAlert && (
        <Alert
          showIcon
          type="info"
          message={intl
            .get('sslm.common.view.tooltip.leastOneLine', {
              name: tabName,
              number: mustLineTabObj.FIN,
            })
            .d(`请至少填写${mustLineTabObj.FIN}条${tabName}`)}
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

export default PurchaseFinance;
