/* eslint-disable react/jsx-indent */
/* eslint-disable import/named */
import React, { useMemo, useCallback, useState } from 'react';
import { compose } from 'lodash';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Content, Header } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import querystring from 'querystring';
import { getCurrentOrganizationId } from 'utils/utils';

import { formatColumnCommand } from '@/routes/Components/ColumnBtnGroup';

import { invoiceRuleEnable, invoiceRuleCopy } from '@/services/taxServices';
import HistoryVersion from '../../components/HistoryRecord/VersionRecord';

import { mainTableDs } from './mainDs';
import Styles from '@/routes/common.less';
import { statusTagRender } from '../Components/StatusTag';

const InvoiceRule = (props) => {
  const [loading, setLoading] = useState(false);
  const { history, tableDs } = props;

  const getOperationCommand = useCallback(
    ({ record }) => {
      const { ruleStatus, enableFlag, ruleNum, ruleId, snapshotFlag, versionNumber, parentRuleId } =
        record.get([
          'ruleStatus',
          'enableFlag',
          'ruleNum',
          'ruleId',
          'snapshotFlag',
          'versionNumber',
          'parentRuleId',
        ]) || {};

      const btns = [
        {
          name: 'enable',
          text:
            enableFlag === 1
              ? intl.get('hzero.common.status.disabled').d('禁用')
              : intl.get(`hzero.common.enable`).d('启用'),
          onClick: () => handleEnable(record),
          wait: 1000,
          showFlag: ruleStatus === 'PUBLISH',
        },
        {
          name: 'update',
          text: intl.get('hzero.common.button.edit').d('编辑'),
          onClick: () => editInvoiceRule(record),
          wait: 1000,
          showFlag: Number(snapshotFlag) === 1,
        },
        {
          name: 'copy',
          text: intl.get(`hzero.common.button.copy`).d('复制'),
          onClick: () => copyInvoiceRule(record),
          wait: 1000,
          showFlag: isNil(parentRuleId) || parentRuleId === -1,
        },
        {
          name: 'historyRecord',
          group: true,
          text: intl.get('hzero.common.button.historyVerison').d('历史版本'),
          children: (
            <HistoryVersion
              primaryKey="ruleId"
              onClick={({ record }) => handleToDetail(record.get('ruleId', false))}
              readTransport={{
                url: `/ssta/v1/${getCurrentOrganizationId()}/direct-invoice-rules/history/page?ruleNum=${ruleNum}&ruleId=${ruleId}&page=0`,
                method: 'GET',
              }}
              fieldsConfig={{
                userName: { alias: 'updateUserName' },
                loginName: { alias: 'updateLoginName' },
                time: { alias: 'creationDate' },
              }}
            />
          ),
          showFlag: ruleStatus === 'PUBLISH' && versionNumber > 1,
        },
      ];

      return formatColumnCommand({ buttons: btns });
    },
    [editInvoiceRule, copyInvoiceRule, handleEnable, handleToDetail]
  );

  const columns = useMemo(() => {
    return [
      {
        name: 'displayStatus',
        width: 160,
        renderer: statusTagRender,
        headerStyle: { paddingLeft: 45 },
      },
      {
        name: 'operation',
        width: 210,
        align: 'left',
        command: getOperationCommand,
      },
      {
        name: 'ruleNum',
        renderer: ({ record }) => (
          <Button
            funcType="link"
            color="primary"
            style={{ userSelect: 'text' }}
            onClick={() => handleToDetail(record.get('ruleId'), true)}
          >
            {record.get('ruleNum')}
          </Button>
        ),
      },
      { name: 'ruleName' },
      { name: 'versionNumber', align: 'right' },
    ];
  }, [handleToDetail, getOperationCommand]);

  const handleToDetail = useCallback(
    (ruleId, editFlag) => {
      // edit 是否显示编辑按钮
      history.push({
        pathname: `/ssta/invoice-rule/detail/${ruleId}`,
        search: querystring.stringify({ operate: 'view', edit: editFlag ? 1 : 0 }),
      });
    },
    [history]
  );

  // 点击了启用或不启用
  const handleEnable = useCallback(
    async (record) => {
      const enableFlag = record.get('enableFlag');
      setLoading(true);
      const res = await invoiceRuleEnable({
        ...record.toData(),
        enableFlag: enableFlag === 1 ? 0 : 1,
      });
      if (res) {
        if (res.failed) {
          notification.error({
            message: res.message,
          });
        } else {
          notification.success();
        }
        tableDs.query();
      }
      setLoading(false);
    },
    [tableDs]
  );

  // 点击了复制
  const copyInvoiceRule = useCallback(
    async (record) => {
      const { ruleId } = record.get(['ruleId']);
      const feedback = await Modal.confirm({
        title: intl.get('ssta.common.view.title.tip').d('提示'),
        children: intl
          .get('ssta.invoiceRule.view.message.copyWarning')
          .d('复制规则无法删除，请确认是否复制？'),
      });

      if (feedback !== 'ok') return;
      const res = await invoiceRuleCopy({ ruleId });
      if (res) {
        if (res.failed) {
          notification.error({
            message: res.message,
          });
        } else {
          notification.success();
          tableDs.query();
        }
      }
    },
    [tableDs]
  );

  // 点击了编辑
  const editInvoiceRule = useCallback(
    async (record) => {
      const ruleId = record.get('ruleId');
      // cancel 是否显示取消按钮
      history.push({
        pathname: `/ssta/invoice-rule/detail/${ruleId}`,
        search: querystring.stringify({ operate: 'edit', cancel: 1 }),
      });
    },
    [history]
  );

  // 点击了新建
  const createRule = useCallback(() => {
    history.push({
      pathname: `/ssta/invoice-rule/detail/add`,
      search: querystring.stringify({ operate: 'edit' }),
    });
  }, [history]);

  const tableRender = () => {
    const { customizeTable } = props;
    return (
      <div style={{ height: 'calc(100vh - 185px)' }}>
        {customizeTable(
          {
            code: 'SDIM.INVOICE_RULE.GRID_NEW',
          },
          <SearchBarTable
            mode="tree"
            cacheState
            searchCode="SDIM.INVOICE_RULE.SEARCH_BAR_NEW"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            selectionMode="none"
            columns={columns}
            dataSet={tableDs}
            searchBarConfig={{
              editorProps: {
                ruleStatus: {
                  optionsFilter: (record) => !['INVALID', 'ARCHIVED'].includes(record.get('value')),
                },
              },
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Header title={intl.get('ssta.invoiceRule.view.title.invoiceRule').d('开票规则管理')}>
        <Button icon="add" color="primary" onClick={() => createRule()} loading={loading}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content className={Styles['ssta-list-content']}>{tableRender()}</Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['ssta.common', 'ssta.taxControl', 'ssta.costSheet', 'ssta.invoiceRule'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(mainTableDs());
      return { tableDs };
    },
    { cacheState: true }
  ),
  withCustomize({
    unitCode: ['SDIM.INVOICE_RULE.GRID_NEW', 'SDIM.INVOICE_RULE.SEARCH_BAR_NEW'],
  })
)(InvoiceRule);
