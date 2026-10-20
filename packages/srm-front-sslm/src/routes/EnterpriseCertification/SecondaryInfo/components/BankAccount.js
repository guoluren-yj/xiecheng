/**
 * BankAccount - 银行账户
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect, useCallback } from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import styles from '../../index.less';

const BankAccount = ({
  dataSet,
  isEdit,
  changeReqId,
  defaultCountryInfo = {},
  allInfo = {},
  bankInfo = {},
  showAllTab = true,
  isTenantLevel,
  remoteHiddenTips = false,
}) => {
  const { remark, atLeastFlag: atLeast = 1, enableFieldList = [] } = bankInfo;
  const { basicInfo = {} } = allInfo;
  const queryFlag = !isEmpty(basicInfo);
  const showTips = isEdit && !showAllTab && !!atLeast && !remoteHiddenTips;

  useEffect(() => {
    if (changeReqId) {
      dataSet.setQueryParameter('changeReqId', changeReqId);
      dataSet.query();
    }
  }, [changeReqId]);

  const handleAdd = useCallback(() => {
    const { domesticForeignRelation, companyName } = basicInfo;
    const { countryId, countryName } = defaultCountryInfo;
    const currentRow = dataSet.current || {};
    if (domesticForeignRelation === 1) {
      currentRow.set({
        bankCountryObj: {
          countryId,
          countryName,
        },
        bankAccountName: companyName,
      });
    }
  }, [queryFlag]);

  const columns = [
    {
      name: 'bankCountryObj',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'bankCode',
      width: 200,
    },
    {
      name: 'bankName',
      width: 200,
    },
    {
      name: 'bankFirmObj',
      width: 200,
      editor: isEdit,
      help: intl
        .get('sslm.common.view.bank.bankFirmHelp')
        .d(
          '若输入查询条件后检索不到对应分行，请尝试输入分行完整全称、准确的联行行号或其中连续的关键字进行检索。例如「中国工商银行股份有限公司上海市大木桥路支行」可输入「大木桥」，避免输入「大桥或工行大木桥」。'
        ),
      showHelp: isEdit ? 'tooltip' : 'none',
    },
    {
      name: 'bankBranchName',
      width: 200,
    },
    {
      name: 'bankAccountName',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'bankAccountNum',
      width: 200,
      editor: <SecretField readOnly={!isEdit} displayOutput={!isEdit} />,
    },
    {
      name: 'intlBankAccountNum',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'accountNature',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'accountPurpose',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'currencyLov',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'bankIdentifyCodeType',
      width: 120,
      editor: isEdit,
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'paymentTypeLov',
      width: 200,
      editor: isEdit,
      hidden: !isTenantLevel,
    },
    {
      name: 'enabledFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'masterFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
  ].filter(item => {
    return enableFieldList.includes(item.name);
  });
  const buttons = isEdit
    ? [
        ['add', { afterClick: handleAdd }],
        [
          'delete',
          {
            onClick: () =>
              dataSet.delete(dataSet.selected, {
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('spfm.supplierRegister.view.message.deleteConfirm')
                  .d('确认删除选中行？'),
              }),
          },
        ],
      ]
    : [];
  return (
    <Content>
      <div className={styles['certification-title']} id="spfm_company_bank_account">
        {intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息')}
        {showTips && (
          <span className={styles['certification-title-tips']}>
            {intl
              .get('spfm.enterpriseCertification.view.register.bankAtLast', {
                atLeast,
              })
              .d(`请至少填写${atLeast}条银行信息`)}
          </span>
        )}
      </div>
      {remark && <Alert showIcon type="info" message={remark} style={{ marginBottom: 8 }} />}
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={buttons}
        selectionMode={isEdit ? 'rowbox' : 'click'}
      />
    </Content>
  );
};

export default BankAccount;
