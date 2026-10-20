import React, { useMemo } from 'react';
import { flowRight } from 'lodash';
import { Tabs, Button, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import { tagRender, optionsRender } from './renderer';
import openRecords from './openRecords';
import { handlePublish, handleCancel, handleDelete, handleCopy } from './func';
import { getDataSetProps } from './getTabs';

// 路由跳转返回上次tabKey
// let initTabKey = 'ALL';

// // 路由跳转，缓存dataSet
// const getWithProps = withProps(() => ({ tabList: getTabs() }), {
//   cacheState: true,
//   keepOriginDataSet: true,
// });

function CentralizeManage(props) {
  const { customizeTable } = props;
  const tableDs = useMemo(() => new DataSet(getDataSetProps()), []);

  const columns = useMemo(() => {
    return [
      {
        name: 'publishStatus',
        width: 100,
        tooltip: 'none',
        renderer: tagRender,
      },
      {
        name: 'action',
        width: 200,
        header: intl.get('hzero.common.action').d('操作'),
        renderer: ({ record, dataSet }) => {
          const { publishStatus } = record.get(['publishStatus']);
          return optionsRender([
            {
              text: intl.get('small.common.button.handle.publish').d('发布'),
              show: publishStatus === 'NEW',
              onClick: () => handlePublish({ record, dataSet }),
            },
            {
              text: intl.get('hzero.common.button.edit').d('编辑'),
              onClick: () => handleViewDetail(record),
              show: publishStatus === 'NEW',
            },
            {
              text: intl.get('small.common.button.handle.change').d('变更'),
              onClick: () => handleViewDetail(record),
              show: publishStatus === 'PUBLISHED',
            },
            {
              text: intl.get('hzero.common.button.cancel').d('取消'),
              onClick: () =>
                handleCancel({ record, callback: () => dataSet.query(dataSet.currentPage) }),
              show: publishStatus === 'PUBLISHED',
            },
            {
              text: intl.get('hzero.common.button.delete').d('删除'),
              onClick: () =>
                handleDelete({ record, callback: () => dataSet.query(dataSet.currentPage) }),
              show: publishStatus === 'NEW',
            },
            {
              text: intl.get('hzero.common.button.copy').d('复制'),
              onClick: () =>
                handleCopy({
                  record,
                  callback: res => {
                    props.history.push(
                      `/small/centralize-manage/detail/edit?templateId=${res.templateId}`
                    );
                  },
                }),
              show: publishStatus === 'COMPLETED',
            },
            {
              text: intl.get('small.common.model.handle.record').d('操作记录'),
              onClick: () => openRecords(record),
            },
          ]);
        },
      },
      {
        name: 'templateCode',
        width: 180,
        renderer: ({ value, record }) => (
          <a onClick={() => handleViewDetail(record, true)}>{value}</a>
        ),
      },
      {
        name: 'templateName',
        minWidth: 200,
      },
      {
        name: 'templateDate',
        width: 180,
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'createdByName',
        width: 100,
      },
    ];
  }, []);

  // 新建
  const handleCreate = () => {
    props.history.push('/small/centralize-manage/detail/create');
  };

  // 编辑｜详情
  const handleViewDetail = (record, readOnly) => {
    const status = readOnly ? 'read' : 'edit';
    props.history.push(
      `/small/centralize-manage/detail/${status}?templateId=${record.get('templateId')}`
    );
  };

  return (
    <>
      <Header title={intl.get('small.centralize.view.title').d('拼单活动管理')}>
        <Button icon="add" color="primary" onClick={() => handleCreate()}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        {customizeTable(
          { code: 'SMALL.CENTRALIZE.STATUS_ALL.LIST' },
          <SearchBarTable
            cacheState
            dataSet={tableDs}
            columns={columns}
            searchCode='SMCT_CENTRALIZED_TEMPLATE.SEARCHBAR'
            style={{ maxHeight: 'calc(100vh - 190px)' }}
          />
        )}
      </Content>
    </>
  );
}

export default flowRight(
  withCustomize({ unitCode: ['SMALL.CENTRALIZE.STATUS_ALL.LIST'] }),
  formatterCollections({
    code: ['small.common', 'small.centralize'],
  }),
  // getWithProps
)(CentralizeManage);
