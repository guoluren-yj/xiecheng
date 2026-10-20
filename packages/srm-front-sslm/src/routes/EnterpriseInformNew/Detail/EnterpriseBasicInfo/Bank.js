/*
 * Bank - 银行信息
 * @Date: 2023-08-29 20:54:40
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback, Fragment } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { isEmpty } from 'lodash';
import { Alert } from 'choerodon-ui';
import classnames from 'classnames';

import intl from 'utils/intl';

import { renderStatus } from '@/routes/components/utils';

import commonStyles from '@/routes/index.less';

import { getToolTipPrefix } from '../../utils';

import styles from '../../styles.less';

const Bank = ({
  dataSet,
  isEdit,
  remote,
  custLoading,
  customizeTable,
  tableMaxHeight,
  isAllPlatform,
  partnerTenantId,
  handleFieldRender = () => {},
  code = '',
  domesticForeignRelation,
  bankDefaultInfo,
  registerDS,
  partnerTenantNum,
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

  const handleAdd = () => {
    const currentRow = dataSet.current;
    let rowDefaultInfo = {};
    if (domesticForeignRelation === 1 && !isEmpty(bankDefaultInfo)) {
      rowDefaultInfo = {
        bankCountryId: {
          countryId: bankDefaultInfo.countryId,
          countryCode: bankDefaultInfo.countryCode,
          countryName: bankDefaultInfo.countryName,
        },
      };
    }
    if (registerDS) {
      const registerData = registerDS.current?.toData() || {};
      const { companyName } = registerData;
      rowDefaultInfo = {
        ...rowDefaultInfo,
        bankAccountName: companyName,
      };
    }
    if (!isAllPlatform) {
      rowDefaultInfo = {
        ...rowDefaultInfo,
        tenantId: partnerTenantId,
      };
    }
    if (currentRow) {
      currentRow.set({
        ...rowDefaultInfo,
      });
    }
  };

  let businessType = null;
  const businessDs = dataSet.getState('businessDs');
  if (businessDs) {
    businessType = businessDs.current && businessDs.current.get('businessType');
  }
  const showBankEnterpriseField =
    isAllPlatform && businessType && businessType.includes('purchase');

  const editColumns = [
    {
      name: 'bankCountryId',
      width: 150,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankCode',
      width: 150,
    },
    {
      name: 'bankName',
      width: 180,
    },
    {
      name: 'bankFirm',
      width: 200,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
      help: intl
        .get('sslm.common.view.bank.bankFirmHelp')
        .d(
          '若输入查询条件后检索不到对应分行，请尝试输入分行完整全称、准确的联行行号或其中连续的关键字进行检索。例如「中国工商银行股份有限公司上海市大木桥路支行」可输入「大木桥」，避免输入「大桥或工行大木桥」。'
        ),
    },
    {
      name: 'bankBranchName',
      width: 300,
    },
    {
      name: 'bankAccountName',
      width: 300,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankAccountNum',
      width: 250,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
      // editor: <SecretField readOnly={!isEdit} />,
    },
    {
      name: 'intlBankAccountNum',
      width: 200,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'accountNature',
      width: 160,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'accountPurpose',
      width: 120,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'currencyId',
      width: 140,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankIdentifyCodeType',
      width: 120,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'paymentType',
      width: 150,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
      hidden: isAllPlatform,
    },
    {
      name: 'bankDirectLinkOrgInfoCode',
      width: 220,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
      hidden: !showBankEnterpriseField,
    },
    {
      name: 'paymentConfirmPhone',
      width: 260,
      hidden: !showBankEnterpriseField,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'enabledFlag',
      width: 80,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'masterFlag',
      width: 100,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 200,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
  ];

  const viewColumns = [
    {
      name: 'objectFlag',
      ignore: true,
      renderer: renderStatus,
    },
    {
      name: 'bankCountryId',
      width: 150,
      displayField: 'countryName',
    },
    {
      name: 'bankCode',
      width: 150,
    },
    {
      name: 'bankName',
      width: 180,
    },
    {
      name: 'bankFirm',
      width: 200,
      displayField: 'bankFirm',
    },
    {
      name: 'bankBranchName',
      width: 300,
    },
    {
      name: 'bankAccountName',
      width: 300,
    },
    {
      name: 'bankAccountNum',
      width: 250,
    },
    {
      name: 'intlBankAccountNum',
      width: 200,
    },
    {
      name: 'accountNature',
      width: 160,
      type: 'SELECT',
    },
    {
      name: 'accountPurpose',
      width: 120,
      type: 'SELECT',
    },
    {
      name: 'currencyId',
      width: 140,
      displayField: 'currencyName',
    },
    {
      name: 'bankIdentifyCodeType',
      width: 120,
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
    },
    {
      name: 'paymentType',
      width: 150,
      hidden: isAllPlatform,
      displayField: 'typeName',
    },
    {
      name: 'bankDirectLinkOrgInfoCode',
      width: 220,
      hidden: !showBankEnterpriseField,
    },
    {
      name: 'paymentConfirmPhone',
      width: 260,
      hidden: !showBankEnterpriseField,
      renderer: ({ value, record }) => {
        if (record) {
          const {
            internationalTelCodeFlag,
            paymentConfirmPhoneFlag,
            objectFlag,
            paymentConfirmPhoneOld,
            internationalTelMeaningOld,
            internationalTelCode,
          } = record.get([
            'internationalTelCodeFlag',
            'paymentConfirmPhoneFlag',
            'objectFlag',
            'paymentConfirmPhoneOld',
            'internationalTelMeaningOld',
            'internationalTelCode',
          ]);
          const showTips =
            internationalTelCodeFlag === 'UPDATE' || paymentConfirmPhoneFlag === 'UPDATE';
          const redFlag = showTips || ['CREATE', 'DELETE'].includes(objectFlag);
          const deleteDataFlag = ['DELETE'].includes(objectFlag);

          let renderOldValue = '-';
          if (internationalTelMeaningOld && paymentConfirmPhoneOld) {
            renderOldValue = `${internationalTelMeaningOld} | ${paymentConfirmPhoneOld}`;
          } else if (internationalTelMeaningOld) {
            renderOldValue = internationalTelMeaningOld;
          } else if (paymentConfirmPhoneOld) {
            renderOldValue = paymentConfirmPhoneOld;
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
      name: 'enabledFlag',
      width: 80,
      type: 'CHECKBOX',
    },
    {
      name: 'masterFlag',
      width: 100,
      type: 'CHECKBOX',
    },
    {
      name: 'remark',
      width: 200,
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

  const showAlert = !!mustLineTabObj.BANK && isEdit;

  const buttons = remote
    ? remote.process(
        `SSLM_ENTERPRISE_INFO_NEW_DETAIL_BANK_TABLE_BUTTONS_${partnerTenantNum}`,
        getButtons(),
        {
          isEdit,
          dataSet,
          handleAdd,
          isAllPlatform,
        }
      )
    : getButtons();

  const columns = isEdit ? editColumns : viewColumns;
  const remoteColumns = remote
    ? remote.process(
        `SSLM_ENTERPRISE_INFO_NEW_DETAIL_BANK_TABLE_COLUMNS_${partnerTenantNum}`,
        columns,
        { isEdit, isAllPlatform }
      )
    : columns;

  return (
    <Fragment>
      {showAlert && (
        <Alert
          showIcon
          type="info"
          message={intl
            .get('sslm.common.view.tooltip.leastOneLine', {
              name: tabName,
              number: mustLineTabObj.BANK,
            })
            .d(`请至少填写${mustLineTabObj.BANK}条${tabName}`)}
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
          columns={remoteColumns}
          buttons={buttons}
          custLoading={custLoading}
          style={tableMaxHeight}
          selectionMode={isEdit ? 'rowbox' : 'none'}
        />
      )}
    </Fragment>
  );
};

export default Bank;
