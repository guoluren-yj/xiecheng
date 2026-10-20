import React, { Fragment, useCallback, useMemo } from 'react';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';
import { Collapse } from 'choerodon-ui';
import { Button, DataSet, Modal, Table, TextArea } from 'choerodon-ui/pro';
import type { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import StatusTag from '../../Components/StatusTag';
import EditorForm from '../../Components/EditorForm';
import { headerDS, paramLineDS } from '../stores/detailDS';
import commonStyles from '../../common.less';
import { saveInvoicePromptParams } from '../utils/api';
import Add from './Add';

const isTenant = isTenantRoleLevel();

const { Panel } = Collapse;

const InvoiceAiPromptDetail = observer((props: any) => {
  const { match } = props;
  const { operate, lang } = match?.params || {};
  const editFlag = operate === 'edit';
  const paramLineDs = useMemo(() => new DataSet(paramLineDS({ lang })), [lang]);
  const headerDs = useMemo(() => new DataSet({
    ...headerDS({ lang }),
    children: { promptParamList: paramLineDs },
  }), [lang, paramLineDs]);

  const handleSwitch = useCallback(async (record) => {
    const recordData = record.toJSONData();
    Object.assign(paramLineDs, { status: 'loading' });
    const res = await saveInvoicePromptParams([{ ...recordData, enabledFlag: recordData.enabledFlag === 1 ? 0 : 1 }]);
    Object.assign(paramLineDs, { status: 'ready' });
    if (!res) return;
    paramLineDs.query(undefined, undefined, true);
  }, [paramLineDs]);

  const handleSave = useCallback(() => {
    headerDs.submit();
  }, [headerDs]);

  const handleAddParam = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      destroyOnClose: true,
      className: commonStyles['ssta-large-modal'],
      title: intl.get('ssta.invoiceAiPrompt.view.title.addParam').d('新增参数'),
      children: (
        <Add lang={lang} onOk={() => paramLineDs.query(undefined, undefined, true)} />
      ),
    });
  }, [lang, paramLineDs]);

  const headerColumns = useMemo(() => [
    'lang',
    {
      name: 'unifyPrompt',
      editor: TextArea,
      disabled: isTenant,
      newLine: true,
      colSpan: 2,
      resize: 'both',
    },
  ], []);

  const columns = useMemo<ColumnProps[]>(() => [
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => isNil(value) ? null : (
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
    editFlag && {
      name: 'action',
      width: 100,
      align: ColumnAlign.left,
      command: ({ record }) => record.get('promptParamId') ? [
        <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleSwitch(record)}>
          {Number(record.get('enabledFlag')) === 1
            ? intl.get('hzero.common.status.disabled').d('禁用')
            : intl.get('hzero.common.status.enable').d('启用')}
        </Button>,
      ] : [],
    } as any,
    {
      name: 'paramObject',
      width: 120,
    },
    {
      name: 'paramName',
      width: 180,
    },
    {
      name: 'paramCode',
      width: 180,
    },
    {
      name: 'paramType',
      width: 120,
    },
    {
      name: 'fieldType',
      width: 120,
    },
    {
      name: 'standardPrompt',
      width: 300,
      editor: editFlag && !isTenant && <TextArea />,
    },
    isTenant && {
      name: 'tenantPrompt',
      width: 300,
      rowHeight: 'auto',
      editor: editFlag && <TextArea />,
    } as any,
  ], [editFlag, handleSwitch]);

  const title = useMemo(() => {
    if (editFlag) {
      return intl.get('ssta.invoiceAiPrompt.view.title.editInvoiceAiPrompt').d('编辑发票AI识别提示词');
    }
    return intl.get('ssta.invoiceAiPrompt.view.title.invoiceAiPromptDetail').d('发票AI识别提示词详情');
  }, [editFlag]);

  const buttons = useMemo<Buttons[]>(() => editFlag ? [[TableButtonType.add, { onClick: handleAddParam }]] : [], [editFlag, handleAddParam]);

  return (
    <Fragment>
      <Header
        title={title}
        backPath="/ssta/invoice-ai-prompt/list"
      >

        {editFlag && <Button color={ButtonColor.primary} icon="save" onClick={handleSave}>{intl.get('hzero.common.button.save').d('保存')}</Button>}
      </Header>
      <Content
        className={commonStyles[`collapse-content`]}
        wrapperClassName={commonStyles[`collapse-content-wrap`]}
      >
        <Collapse
          ghost
          trigger="icon"
          expandIconPosition="text-right"
          defaultActiveKey={['basic', 'param']}
        >
          <Panel forceRender showArrow={false} key="basic" header={intl.get('ssta.invoiceAiPrompt.view.title.basicInfo').d('基本信息')}>
            <EditorForm
              columns={3}
              dataSet={headerDs}
              editorFlag={editFlag}
              editorColumns={headerColumns}
            />
          </Panel>
          <Panel forceRender showArrow={false} key="param" header={intl.get('ssta.invoiceAiPrompt.view.title.paramInfo').d('参数信息')}>
            <Table
              rowHeight='auto'
              dataSet={paramLineDs}
              columns={columns}
              buttons={buttons}
              style={{ maxHeight: '800px' }}
            />
          </Panel>
        </Collapse>
      </Content>
    </Fragment>
  );
});

export default formatterCollections({
  code: ['ssta.common', 'hzero.common', 'ssta.invoiceAiPrompt'],
})(InvoiceAiPromptDetail);
