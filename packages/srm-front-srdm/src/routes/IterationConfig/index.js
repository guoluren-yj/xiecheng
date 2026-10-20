import React, { useMemo } from 'react';
import {
  Button,
  Table,
  DataSet,
  Modal,
  Form,
  TextField,
  TextArea,
  Select,
  DateTimePicker,
} from 'choerodon-ui/pro';
import moment from 'moment';
import { Header, Content } from 'components/Page';
import request from 'utils/request';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { HZERO_SRDM } from '@/common/config';
import { getIterationDS } from './iterationDS';

const IterationConfig = () => {
  const dataSet = useMemo(() => new DataSet(getIterationDS()), []);

  const saveCurrent = (record) => {
    request(`${HZERO_SRDM}/v1/iteration/set-current/${record.get('iterationId')}`).then((res) => {
      if (getResponse(res)) {
        dataSet.query();
      }
    });
  };

  const saveSealing = (record) => {
    request(`${HZERO_SRDM}/v1/iteration/sealing`, {
      method: 'POST',
      body: {
        iterationId: record.get('iterationId'),
        nextIterationId: record.get('nextIterationId'),
        sealingDesc: record.get('sealingDesc'),
        directSyncEndDate: record.get('directSyncEndDate').format('YYYY-MM-DD HH:mm:ss'),
      },
    }).then((res) => {
      if (getResponse(res)) {
        dataSet.query();
      }
    });
  };

  const savePublish = (record) => {
    request(`${HZERO_SRDM}/v1/iteration/publish/${record.get('iterationId')}`).then((res) => {
      notification[res.failed ? 'error' : 'success']({ message: res.message });
      if (!res.failed) {
        dataSet.query();
      }
    });
  };

  const saveRehearsal = (record) => {
    request(
      `${HZERO_SRDM}/v1/iteration/rehearsal/${record.get(
        'iterationId'
      )}?environmentCode=${record.get('environmentCode')}`
    ).then((res) => {
      if (getResponse(res)) {
        dataSet.query();
      }
    });
  };

  const getDefaultTime = () => {
    return moment().add(2, 'd').hours(0).minute(0).seconds(0);
  };

  const openEditModal = (title, data) => {
    const disabled = !!data;
    const record = data || dataSet.create({}, 0);
    if (data && !record.get('directSyncEndDate')) {
      record.set('directSyncEndDate', getDefaultTime());
    }
    Modal.open({
      title,
      drawer: true,
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="iterationNum" disabled={disabled} />
          <TextField name="iterationName" />
          <TextArea name="iterationDesc" />
          <Select name="iterationStatus" />
          <Select name="enabledFlag" disabled={record.get('iterationStatus') === 'CURRENT'} />
          <DateTimePicker name="directSyncEndDate" />
        </Form>
      ),
      onOk: async () => {
        const res = (await dataSet.submit()) || {};
        return !res.failed;
      },
      onCancel: () => {
        dataSet.reset();
      },
    });
  };

  const openSetCurrent = (record) => {
    Modal.open({
      title: intl.get('srdm.iteration.config.set.current').d('设为当前版本'),
      children: intl
        .get('srdm.iteration.modal.set.current.content')
        .d('确定将此版本设置为当前版本'),
      border: false,
      onOk: () => saveCurrent(record),
    });
  };

  const openSealingModal = (record) => {
    record.set('directSyncEndDate', getDefaultTime());
    Modal.open({
      title: intl.get('srdm.iteration.title.sealing').d('封板'),
      border: false,
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="iterationNum" disabled />
          <TextField name="iterationName" disabled />
          <TextArea name="iterationDesc" disabled />
          <Select name="nextIterationObject" noCache />
          <TextArea name="sealingDesc" />
          <DateTimePicker name="directSyncEndDate" />
        </Form>
      ),
      onOk: () => saveSealing(record),
    });
  };

  const openPublish = (record) => {
    Modal.open({
      title: intl.get('srdm.iteration.title.publish').d('发布'),
      border: false,
      children: intl
        .get('srdm.iteration.modal.publish.content')
        .d('点击确定开始后台发布，发布结果在"处理记录"中查看'),
      onOk: () => savePublish(record),
    });
  };
  const openRehearsal = (record) => {
    Modal.open({
      title: '选择一个环境预演',
      border: false,
      children: (
        <Form record={record} labelLayout="float">
          <TextField name="iterationNum" disabled />
          <TextField name="iterationName" disabled />
          <Select name="environmentCode" noCache />
        </Form>
      ),
      onOk: () => saveRehearsal(record),
    });
  };

  return (
    <>
      <Header title={intl.get('srdm.iteration.config.header.title').d('迭代管理')} />
      <Content>
        <Table
          queryFieldsLimit={2}
          buttons={[
            <Button
              color="primary"
              funcType="flat"
              icon="playlist_add"
              onClick={() => openEditModal(intl.get('hzero.common.button.add').d('新增'))}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>,
          ]}
          columns={[
            {
              tooltip: 'overflow',
              name: 'iterationNum',
              renderer: ({ value, record }) => {
                return (
                  <a
                    onClick={() =>
                      openEditModal(intl.get('hzero.common.button.edit').d('编辑'), record)
                    }
                  >
                    {value}
                  </a>
                );
              },
            },
            {
              tooltip: 'overflow',
              name: 'iterationName',
            },
            {
              tooltip: 'overflow',
              name: 'iterationDesc',
            },
            {
              tooltip: 'overflow',
              name: 'openDate',
            },
            {
              tooltip: 'overflow',
              name: 'sealingDate',
            },
            {
              tooltip: 'overflow',
              name: 'publishDate',
            },
            {
              tooltip: 'overflow',
              name: 'iterationStatus',
            },
            {
              tooltip: 'overflow',
              name: 'directSyncEndDate',
            },
            {
              header: intl.get('hzero.common.button.action').d('操作'),
              lock: 'right',
              width: 300,
              command: ({ record }) => {
                return [
                  <a onClick={() => openSetCurrent(record)}>
                    {intl.get('srdm.iteration.config.set.current').d('设为当前版本')}
                  </a>,
                  <a
                    onClick={() => openSealingModal(record)}
                    disabled={record.get('iterationStatus') !== 'CURRENT'}
                  >
                    {intl.get('srdm.iteration.button.sealing').d('封板')}
                  </a>,
                  <a onClick={() => openRehearsal(record)}>发布预演</a>,
                  <a onClick={() => openPublish(record)}>
                    {intl.get('hzero.common.btn.release').d('发布')}
                  </a>,
                ];
              },
            },
          ]}
          dataSet={dataSet}
        />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['srdm.iteration'],
})(React.memo(IterationConfig));
