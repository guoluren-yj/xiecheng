
import { Modal, Form, TextArea, DataSet, TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import {
  centralizeCheck,
  centralizePublish,
  centralizeEnable,
  centralizeCancelService,
  centralizeDeleteService,
  centralizeCopyService,
} from './api';
import openCheckList from './openCheckList';

export async function handleCheck(templateId, callback = e => e) {
  const res = getResponse(await centralizeCheck({ templateId }));
  if (res) {
    if (res.length) {
      openCheckList({ checkList: res, callback });
    } else {
      await callback();
    }
  }
}

// 发布
export async function handlePublish(props) {
  const { dataSet, record } = props;
  const params = record.toJSONData();
  const callback = async list => {
    const res = getResponse(await centralizePublish(params.templateId, list));
    if (res) {
      notification.success();
      if (dataSet) {
        dataSet.query();
      }
    }
  };
  try {
    dataSet.status = 'loading';
    await handleCheck(params.templateId, callback);
  } finally {
    dataSet.status = 'ready';
  }
}

// 启用禁用
export async function handleEnable(props) {
  const { dataSet, record } = props;
  const params = {
    ...record.toJSONData(),
    enabledFlag: record.get('publishStatus') === 'DISABLED' ? 1 : 0,
  };
  try {
    dataSet.status = 'loading';
    const res = getResponse(await centralizeEnable(params));
    if (res) {
      notification.success();
      dataSet.query();
    }
  } finally {
    dataSet.status = 'ready';
  }
}

// 取消
export function handleCancel({
  record,
  callback = e => e,
}) {
  const ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'reason',
        required: true,
        label: intl.get('small.common.model.cancelReason').d('取消原因'),
      },
    ],
  });
  Modal.open({
    title: intl.get('small.centralize.view.cancel.title').d('取消拼单活动'),
    drawer: true,
    style: { width: 380 },
    children: (
      <Form dataSet={ds} columns={1} labelLayout="float">
        <TextArea name="reason" resize='vertical' />
      </Form>
    ),
    onOk: async () => {
      const flag = await ds.validate();
      if(!flag){
        return false;
      }
      const reason = ds.current.get('reason');
      const params = {
        ...record.toData(),
        reason,
      };
      const res = getResponse(await centralizeCancelService(params));
      if(res) {
        callback();
      }
    },
  });
}

// 删除
export async function handleDelete({
  record,
  callback = e => e,
}) {
  Modal.confirm({
    title: intl.get('small.common.view.tips').d('提示'),
    children: intl.get('small.centralize.view.deleteConfirm').d('确定要删除该拼单活动吗？'),
    onOk: async () => {
      const params = record.toData();
      const res = getResponse(await centralizeDeleteService(params));
      if(res) {
        callback();
      }
    },
  });
}

// 复制模板
export async function handleCopy({record, callback = e => e,}) {
  const res = getResponse(await centralizeCopyService(record.get('templateId')));
  if(res) {
    callback(res);
  }
}
