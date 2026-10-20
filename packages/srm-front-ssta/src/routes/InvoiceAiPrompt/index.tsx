import React, { Fragment, useCallback, useMemo } from 'react';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { Button, DataSet, Modal, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import NewCommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/interface';

import { listDS } from './stores/listDS';
import StatusTag from '../Components/StatusTag';
import NewLanguageDrawer from './NewLanguageDrawer';
import {
  invoicePromptPrefix,
  invoicePromptExportTemplateCode,
  invoicePromptImportTemplateCode,
  saveInvoicePromptHeader,
} from './utils/api';
import { formatColumnCommand } from '../Components/ColumnBtnGroup';
import commonStyles from '../common.less';

const InvoiceAiPromptList = (props) => {
  const { tableDs, history } = props;

  const handleToDetail = useCallback((lang: string, operate: 'edit' | 'view') => {
    if (!lang) return;
    history.push({
      pathname: `/ssta/invoice-ai-prompt/${operate}/${lang}`,
    });
  }, [history]);

  const handleSwitch = useCallback(async (record) => {
    const data = record.toData();
    const enabledFlag = Number(record.get('enabledFlag')) === 1 ? 0 : 1;
    tableDs.status = 'loading';
    const res = getResponse(await saveInvoicePromptHeader({ ...data, enabledFlag }));
    tableDs.status = 'ready';
    if (!res) return;
    notification.success({});
    tableDs.query(tableDs.currentPage);
  }, [tableDs]);

  const handleCreate = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      destroyOnClose: true,
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.invoiceAiPrompt.view.title.selectLang').d('选择语言'),
      children: (
        <NewLanguageDrawer
          onOk={async (data) => {
            const res = getResponse(await saveInvoicePromptHeader(data));
            if (!res) return false;
            notification.success({});
            tableDs.query(tableDs.currentPage);
          }}
        />
      ),
    });
  }, [tableDs]);

  const getActionCommand = useCallback(({ record }) => {
    const { lang, enabledFlag } = record.get(['lang', 'enabledFlag']) || {};
    const enableFlag = Number(enabledFlag) === 1;
    return formatColumnCommand({
      buttons: [
        {
          name: 'edit',
          text: intl.get('hzero.common.button.edit').d('编辑'),
          onClick: () => handleToDetail(lang, 'edit'),
        },
        {
          name: enableFlag ? 'disable' : 'enable',
          text: enableFlag
            ? intl.get('hzero.common.status.disabled').d('禁用')
            : intl.get('hzero.common.status.enable').d('启用'),
          onClick: () => handleSwitch(record),
        },
      ],
    });
  }, [handleSwitch, handleToDetail]);

  const columns = useMemo<ColumnProps[]>(() => [
    {
      name: 'enabledFlag',
      width: 120,
      renderer: ({ value }) => (
        <StatusTag
          text={
            Number(value) === 1
              ? intl.get('hzero.common.status.enable').d('启用')
              : intl.get('hzero.common.status.disabled').d('禁用')
          }
          color={Number(value) === 1 ? 'green' : 'gray'}
        />
      ),
    },
    {
      name: 'action',
      width: 180,
      align: ColumnAlign.left,
      command: getActionCommand,
    },
    {
      name: 'lang',
      width: 220,
      renderer: ({ value, text }) => (
        <a onClick={() => handleToDetail(value, 'view')}>
          {text || value}
        </a>
      ),
    },
    {
      name: 'creationDate',
      width: 220,
    },
    {
      name: 'lastUpdateDate',
      width: 220,
    },
  ], [getActionCommand, handleToDetail]);

  return (
    <Fragment>
      <Header title={intl.get('ssta.invoiceAiPrompt.view.title.list').d('发票AI识别语言')}>
        <Button color={ButtonColor.primary} icon="add" onClick={handleCreate}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <NewCommonImport
          businessObjectTemplateCode={invoicePromptImportTemplateCode}
          prefixPatch="/ssta"
          buttonText={intl.get('hzero.common.button.import').d('导入')}
          successCallBack={() => tableDs.query(tableDs.currentPage)}
          args={{ templateCode: invoicePromptImportTemplateCode }}
          buttonProps={{
            type: 'c7n-pro',
            icon: 'archive',
            funcType: 'flat',
          }}
        />
        <ExcelExportPro
          templateCode={invoicePromptExportTemplateCode}
          method="POST"
          requestUrl={`${invoicePromptPrefix}/invoice-prompt/export`}
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
          }}
        />
      </Header>
      <Content>
        <Table
          dataSet={tableDs}
          columns={columns}
          style={{ maxHeight: 'calc(100vh - 190px)' }}
        />
      </Content>
    </Fragment>
  );
};

export default flow(
  observer,
  withProps(
    () => {
      const tableDs = new DataSet(listDS());
      return { tableDs };
    },
    { cacheState: true }
  ) as any,
  formatterCollections({
    code: ['ssta.common', 'hzero.common', 'ssta.invoiceAiPrompt'],
  })
)(InvoiceAiPromptList);
