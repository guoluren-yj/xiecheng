import React, { useMemo, useCallback } from 'react';
import { DataSet, Button, Modal, Form, TextField, Lov, DateTimePicker, Table, Output } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import classnames from 'classnames';
import { omit } from 'lodash';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBarTable from '_components/FilterBarTable';
import { TopSection, SecondSection } from '_components/Section';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { createAutoDoc, updateAutoDoc, queryAutoDocDetail, updateAutoDocStatus, tenantAutoDeliverEnable } from '@/services/docTransferService';
import { autoTransferDs, baseInfoDs, receiptDs, addLovDs } from './dataSet';

import styles from '../index.less';

const modalKey = Modal.key();

function AutoTransfer(props) {
  const queryParams = qs.parse(props.location.search.substr(1));
  const { tableDs } = useMemo(() => ({
    tableDs: new DataSet(autoTransferDs(queryParams)),
  }), [queryParams]);

  const onDeleteConfirm = useCallback((callback) => {
    Modal.confirm({
      title: intl.get('spfm.docTransfer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        if (callback) {
          callback();
        }
      },
    });
  }, []);

  const saveAutoReceipt = useCallback(async ({ formDs, autoReceiptDs, deleteLineData }) => {
    if (!deleteLineData) {
      if (!formDs.current.dirty && !autoReceiptDs.dirty) {
        return true;
      }
      const flag = await formDs.current.validate();
      if (!flag) {
        return false;
      }
    }
    if ((deleteLineData && autoReceiptDs.length == 1) || !autoReceiptDs.length) {
      notification.error({
        message: intl.get('spfm.docTransfer.view.message.selectAtLeastOne').d('至少维护一条单据明细。'),
      });
      return false;
    } 
    const isEdit = !!formDs.current.get('ruleId');
    const lines = deleteLineData ? [deleteLineData] : autoReceiptDs.toJSONData();
    const data = {
      ...(isEdit ? undefined : {
        deliverFromId: queryParams.deliverFromId,
        deliverType: queryParams.deliverType,
      }),
      ...formDs.current.toJSONData(),
      lines: lines.length ? lines : undefined,
    };
    const apiFunc = isEdit ? updateAutoDoc : createAutoDoc;
    const res = getResponse(await apiFunc(data));
    if (!res) {
      return false;
    }
    if (deleteLineData) {
      formDs.loadData([omit(res, ['lines'])]);
      autoReceiptDs.loadData(res.lines);
      return false;
    }
    tableDs.query();
    return true;
  }, []);
  const showAutoReceiptModal = useCallback(async (record, readOnly = false) => {
    const formDs = new DataSet(baseInfoDs(queryParams));
    const autoReceiptDs = new DataSet(receiptDs());
    if (!record) {
      formDs.create();
    }
    const getDisabledIds = () =>
      autoReceiptDs.records
        .map((item) => item.get('docHeaderId'));
    const lovDs = new DataSet(addLovDs(queryParams, getDisabledIds));
    let title = intl.get('spfm.docTransfer.view.header.createAutoTransfer').d('新建自动转交单');
    if (readOnly) {
      title = intl.get('spfm.docTransfer.view.header.viewAutoTransfer').d('查看自动转交单');
    } else if (record) {
      title = intl.get('spfm.docTransfer.view.header.editAutoTransfer').d('编辑自动转交单')
    }
    Modal.open({
      key: modalKey,
      title,
      children: (
        <TopSection className={styles['auto-transfer-modal']}>
          <SecondSection title={intl.get('hzero.common.view.title.baseInfo').d('基础信息')}>
            <Form dataSet={formDs} columns={2} labelLayout="float" style={{ marginBottom: 32 }}>
              {
                readOnly ? (
                  <>
                    <Output name="description" />
                    <Output name="receiveUserInfo" />
                    <Output name="runDateRange" colSpan={2} />
                  </>
                ) : (
                  <>
                    <TextField name="description" />
                    <Lov name="receiveUserInfo" />
                    <DateTimePicker name="runDateRange" colSpan={2} /></>
                )
              }
            </Form>
          </SecondSection>
          <SecondSection title={intl.get('spfm.docTransfer.view.title.receiptDetail').d('单据明细')}>
            <Table
              dataSet={autoReceiptDs}
              columns={[{
                name: 'docHeaderCode'
              },
              { name: 'docHeaderName' },
              {
                name: 'option',
                title: intl.get('hzero.common.button.action').d('操作'),
                hidden: readOnly,
                renderer: ({ record }) => {
                  return (
                    <Button funcType="link" onClick={() => {
                      if (record.status === 'add') {
                        autoReceiptDs.remove(record);
                      } else {
                        onDeleteConfirm(() => saveAutoReceipt({ formDs, autoReceiptDs, deleteLineData: { ...record.toData(), _status: 'delete' } }));
                      }
                    }}>
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </Button>
                  );
                }
              }
              ]}
              buttons={readOnly ? [] : [
                <Lov
                  mode="button"
                  name='deliverDocs'
                  dataSet={lovDs}
                  noCache
                  destroyOnClose
                  clearButton={false}
                  onClick={() => {
                    lovDs.reset();
                  }}
                  onBeforeSelect={(records) => {
                    const selectedRecords = Array.isArray(records) ? records : [records];
                    if (!selectedRecords.length) {
                      notification.warning({
                        message: intl.get('spfm.docTransfer.view.message.noRecordsSelected').d('至少选择一条记录。'),
                      });
                      return false;
                    }
                    selectedRecords.forEach((r) => {
                      autoReceiptDs.create({
                        docHeaderName: r.get('docName'),
                        docHeaderCode: r.get('docCode'),
                        docHeaderId: r.get('docHeaderId'),
                      });
                    });
                    return true;
                  }}
                >
                  <Button icon="add" funcType='link'>{intl.get('hzero.common.button.batchAdd').d('批量新增')}</Button>
                </Lov>,
              ]}
            />
          </SecondSection>
        </TopSection >
      ),
      onOk: () => saveAutoReceipt({ formDs, autoReceiptDs }),
      okText: intl.get('hzero.common.model.save').d('保存'),
      okProps: {
        hidden: readOnly,
      },
      cancelProps: { color: readOnly ? 'primary' : 'default' },
      cancelText: intl.get('hzero.common.button.shutDown').d('关闭'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 460 },
    });
    if (record) {
      const res = await getResponse(queryAutoDocDetail(record.get('ruleId')));
      if (res) {
        const { lines, ...formInfo } = res;
        formDs.loadData([formInfo]);
        autoReceiptDs.loadData(lines);
      }
    }
  }, []);
  const submitOrTerminateAutoReceipt = useCallback(async (record, status) => {
    const res = await getResponse(updateAutoDocStatus(record.get('ruleId'), status));
    if (res) {
      tableDs.query();
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'status',
        width: 120,
      },
      {
        name: 'description',
      },
      {
        name: 'deliverToName',
      },
      {
        name: 'createdByName',
      },
      {
        name: 'runDateRange',
        width: 180,
        renderer: ({ record }) => `${record.get('startTime') || '-'}~${record.get('endTime') || '-'}`,
      },
      {
        name: 'action',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        renderer: ({ record }) => (
          <span className={classnames("action-link", styles['btn-action'])}>
            <Button
              funcType="link"
              onClick={() => showAutoReceiptModal(record)}
              hidden={record.get('status') !== 'NEW'}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            <Button
              funcType="link"
              onClick={() => showAutoReceiptModal(record, true)}
              hidden={record.get('status') === 'NEW'}
            >
              {intl.get('hzero.common.button.look').d('查看')}
            </Button>
            <Button funcType="link" hidden={record.get('status') !== 'NEW'} onClick={() => submitOrTerminateAutoReceipt(record)}>
              {intl.get('hzero.common.button.sumbit').d('提交')}
            </Button>
            <Button funcType="link" hidden={!['PENDING', 'ACTIVE'].includes(record.get('status'))} onClick={() => submitOrTerminateAutoReceipt(record, 'ENDED')}>
              {intl.get('hzero.common.button.terminate').d('终止')}
            </Button>
            <Button funcType="link" onClick={() => onDeleteConfirm(() => tableDs.delete(record))} hidden={record.get('status') !== 'TERMINATED'}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </span>
        ),
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <Header
        title={intl.get('spfm.docTransfer.view.header.autoTransfer').d('自动转交单')}
        backPath="/spfm/doc-transfer/list"
      >
        <Button
          color="primary"
          icon="add"
          onClick={() => {
            showAutoReceiptModal();
          }}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <FilterBarTable
          dataSet={tableDs}
          columns={columns}
          customizable
          customizedCode="SPFM.DOC_TRANSFER.AUTO_TRANSFER.TABLE"
        />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.docTransfer', 'hzero.common'],
})(AutoTransfer);
