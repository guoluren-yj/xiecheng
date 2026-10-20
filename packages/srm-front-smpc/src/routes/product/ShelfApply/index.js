import React, { useMemo } from 'react';
import { flowRight } from 'lodash';
import { Button, DataSet, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';

import StatusTag from '@/routes/components/StatusTag';
import { fetchCancelApply } from '@/services/product/shelfApply';
import tableDs from './tableDs';

const searchCode = 'SMPC.SHELF_APPLY.HEADER.SEARCH_BAR';

function ShelfApply(props) {
  const {
    history: { push },
  } = props;
  const ds = useMemo(() => new DataSet(tableDs(searchCode)), []);

  function handleEdit({ applyHeaderId }) {
    push(`/smpc/shelf-apply/detail/edit?applyHeaderId=${applyHeaderId}`);
  }

  async function handleDelete(record) {
    const modalProps = {
      title: (
        <span style={{ fontSize: 18 }}>
          {intl
            .get('smpc.ShelfApply.view.modal.delTitle', { value: record.get('applyCode') })
            .d(`删除供应商下架申请${record.get('applyCode')}`)}
        </span>
      ),
      children: (
        <span style={{ fontSize: 14 }}>
          {intl.get('smpc.ShelfApply.view.modal.confirmDel').d('确定删除供应商下架申请?')}
        </span>
      ),
    };
    ds.delete(record, modalProps);
  }

  // 取消申请·
  async function handleCancelApply(record) {
    const res = getResponse(await fetchCancelApply(record.toJSONData()));
    if (res) {
      notification.success();
      ds.query(ds.currentPage);
    }
  }

  function handleNewCreate() {
    push('/smpc/shelf-apply/detail/create');
  }

  function viewDetail({ applyHeaderId }) {
    push(`/smpc/shelf-apply/detail/read?applyHeaderId=${applyHeaderId}`);
  }

  const columns = [
    {
      name: 'applyStatusMeaning',
      width: 100,
      tooltip: 'none',
      renderer: ({ text, record }) => {
        const { applyStatus: status, rejectMessage } = record.get(['applyStatus', 'rejectMessage']);
        // const rejectRemark = record.get('rejectRemark');
        // const submitErrorMessageMeaning = record.get('submitErrorMessageMeaning');
        const type = ['NEW', 'APPROVING'].includes(status)
          ? 'waitting'
          : ['APPROVED'].includes(status)
          ? 'success'
          : ['REJECT'].includes(status)
          ? 'error'
          : 'failed';
        return <StatusTag text={text} type={type} message={rejectMessage} />;
      },
    },
    {
      name: 'operation',
      width: 150,
      renderer: ({ record }) => {
        const applyStatus = record.get('applyStatus');
        return applyStatus === 'NEW' ? (
          <span>
            <Button funcType="link" color="primary" onClick={() => handleEdit(record.toData())}>
              {intl.get('hzero.commo.button.edit').d('编辑')}
            </Button>
            <Button funcType="link" color="primary" onClick={() => handleDelete(record)}>
              {intl.get('hzero.commo.button.toDelete').d('删除')}
            </Button>
          </span>
        ) : applyStatus === 'APPROVING' ? (
          <Button funcType="link" color="primary" onClick={() => handleCancelApply(record)}>
            {intl.get('smpc.ShelfApply.view.btn.cancelApply').d('取消申请')}
          </Button>
        ) : (
          '-'
        );
      },
    },
    {
      name: 'applyCode',
      width: 200,
      renderer: ({ value, record }) => <a onClick={() => viewDetail(record.toData())}>{value}</a>,
    },
    {
      name: 'applyTypeMeaning',
      width: 150,
    },
    {
      name: 'applyUserName',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 200,
    },
    {
      name: 'supplierCompanyName',
      minWidth: 200,
    },
    {
      name: 'attachmentUuid',
      width: 120,
      // align: 'center',
      lock: 'right',
      renderer: ({ value }) => {
        const attachmentProps = {
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'smpc-shelf-file',
          viewMode: 'popup',
          readOnly: true,
          value,
        };
        return <Attachment {...attachmentProps} />;
      },
    },
  ];
  return (
    <>
      <Header
        title={intl.get('smpc.ShelfApply.view.title.productShelfApply').d('商品上下架申请管理')}
      >
        <Button icon="add" color="primary" onClick={handleNewCreate}>
          {intl.get('smpc.ShelfApply.view.title.newApply').d('新建申请')}
        </Button>
      </Header>
      <Content>
        <SearchBarTable
          dataSet={ds}
          columns={columns}
          searchCode={searchCode}
          cacheState
          searchBarConfig={{
            fieldProps: {
              supplierCompanyId: {
                lovPara: {
                  tenantId: getCurrentOrganizationId(),
                  supplierTenantId: getUserOrganizationId(),
                },
              },
            },
          }}
        />
      </Content>
    </>
  );
}

export default flowRight(
  formatterCollections({
    code: ['hzero.common', 'smpc.ShelfApply', 'hzero.commo'],
  })
)(ShelfApply);
