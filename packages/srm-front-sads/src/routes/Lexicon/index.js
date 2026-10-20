import React, { Fragment, useMemo } from 'react';
import { DataSet, Button, Form, Modal, TextField, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import { isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getLexiconDs } from './config';

const DeleteBtn = observer(({ dataSet, onClick }) => {
  return (
    <Button funcType="flat" icon="delete" onClick={onClick} disabled={dataSet.selected.length < 1}>
      {intl.get('sads.lexicon.button.batchDelete').d('批量删除')}
    </Button>
  );
});

function Lexicon() {
  const isTenant = useMemo(() => isTenantRoleLevel(), []);

  const searchCode = isTenant ? 'SADS.LEXICON.SEARCH_BAR' : 'SADS.SRM_LEXICON.SEARCH_BAR';

  const dataSet = useMemo(() => {
    const _dataSet = new DataSet(getLexiconDs());
    _dataSet.setQueryParameter('customizeUnitCode', searchCode);
    return _dataSet;
  }, []);

  const columns = [
    { name: 'orderSeq', width: 100, renderer: ({ record }) => record.index + 1 },
    {
      name: 'action',
      width: 100,
      header: intl.get('hzero.common.action').d('操作'),
      renderer: ({ record }) =>
        record.status !== 'add' && (
          <a
            disabled={isTenant && record.get('sourceFrom') === 0}
            onClick={() => handleDelete(record)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        ),
    },
    { name: 'content', minWidth: 200 },
    { name: 'type', width: 120 },
    { name: 'sourceFrom', width: 140 },
    { name: 'realName', width: 140 },
    { name: 'creationDate', width: 160 },
  ];

  const handleCreate = () => {
    const record = dataSet.create({});
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: intl.get('hzero.common.view.title.create').d('新建'),
      okText: intl.get('hzero.common.button.save').d('保存'),
      afterClose: () => {
        dataSet.reset();
      },
      onOk: async () => {
        const flag = await record.validate();
        if (!flag) return false;
        const res = await dataSet.submit();
        if (res) return true;
      },
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="content" />
          <Select name="type" />
          <Select name="sourceFrom" />
        </Form>
      ),
    });
  };

  const handleDelete = (record) => {
    const deleteRecords = record || dataSet.selected;
    const modalContent = record
      ? intl
          .get('sads.lexicon.view.message.deleteContent', { content: record.get('content') })
          .d(`是否确定删除搜索词【${record.get('content')}】`)
      : intl.get('sads.lexicon.view.message.batchDeleteContent').d('是否确定进行批量删除搜索词？');
    dataSet.delete(deleteRecords, {
      title: (
        <span style={{ fontSize: 18 }}>
          {intl.get('hzero.common.message.confirm.title').d('提示')}
        </span>
      ),
      children: <span style={{ fontSize: 14 }}>{modalContent}</span>,
    });
  };

  return (
    <Fragment>
      <Header title={intl.get('sads.lexicon.view.title.lexiconManage').d('搜索词库管理')}>
        <Button icon="add" color="primary" onClick={() => handleCreate()}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <DeleteBtn dataSet={dataSet} onClick={() => handleDelete()} />
      </Header>
      <Content>
        <SearchBarTable searchCode={searchCode} dataSet={dataSet} columns={columns} />
      </Content>
    </Fragment>
  );
}

export default formatterCollections({ code: ['sads.lexicon'] })(Lexicon);
