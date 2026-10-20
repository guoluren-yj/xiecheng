import React, { useEffect, useMemo, useState, useImperativeHandle } from 'react';
import {
  Form,
  Table,
  TextField,
  Select,
  useDataSet,
  Button,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
// import MappingModal from './mappingModal';
import { isEmpty } from 'choerodon-ui/dataset/utils';
import { headerInfoDs, attachmentListDS } from '../stores/nodeConfigDs';

import styles from '../index.less';
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Index = React.forwardRef(({ formData = {}, handleCuxCode }, ref) => {
  const [nodeId] = useState(formData.nodeId);

  const listDs = useDataSet(
    () =>
      attachmentListDS({
        nodeId,
        handleCuxCode,
      }),
    [nodeId]
  );

  const formDs = useDataSet(
    () =>
      headerInfoDs({
        nodeId,
      }),
    [nodeId]
  );

  const getDetailInfo = async () => {
    const formFlag = await formDs.validate();
    const listFlag = await listDs.validate();

    const listKey = 'itemAuthNodeAttachList';

    if (formFlag && listFlag) {
      return {
        ...formDs.current?.toData(),
        [listKey]: listDs.toData(),
      };
    } else {
      return false;
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'attachmentCode',
        editor: true,
        width: 150,
      },
      {
        name: 'attachmentName',
        editor: true,
        width: 150,
      },
      {
        name: 'attachmentTypeCode',
        editor: true,
        width: 150,
      },
      {
        name: 'attachmentUuid',
        editor: true,
        width: 150,
      },
      {
        name: 'requiredFlag',
        editor: true,
        width: 200,
      },
      {
        name: 'supplierRequiredFlag',
        editor: true,
        width: 200,
      },
      {
        name: 'attachDeleteFlag',
        editor: true,
        width: 200,
      },
      {
        name: 'supplierVisibleFlag',
        editor: true,
        width: 200,
      },
      {
        name: 'itemAuthNodeAttRoleList',
        editor: true,
        width: 150,
      },
      {
        name: 'itemAuthNodeAttUserList',
        editor: true,
        width: 150,
      },
      {
        name: 'itemAuthNodeAttCategoryList',
        editor: true,
        width: 150,
      },
    ];
  }, []);

  const DeleteBtn = observer(() => {
    const { selected } = listDs;
    return (
      <Button
        key="delete"
        funcType="flat"
        icon="delete_sweep"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          if (selected.every((record) => !record.get('nodeAttachmentId'))) {
            listDs.remove(selected);
          } else {
            listDs.delete(selected, {
              title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
              children: (
                <div>
                  {intl
                    .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                    .d('确认删除选中行？')}
                </div>
              ),
            });
          }
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>
    );
  });

  const buttons = useMemo(() => {
    return ['add', <DeleteBtn />];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listDs]);

  useEffect(() => {
    if (nodeId) {
      formDs.query();
      listDs.query();
    } else {
      formDs.loadData([]);
      formDs.create({});
    }
  }, [nodeId, formDs, listDs]);

  // 函数组件调用到子组件的函数
  useImperativeHandle(ref, () => ({
    getDetailInfo,
    ref: ref.current,
  }));

  return (
    <div className={styles['detail-content']}>
      <div className={styles['chunk-content']}>
        <div className={styles['content-two-title']}>
          <div className={styles['content-two-title-ink']} />
          {intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}
        </div>

        <Form dataSet={formDs} showLines={6} columns={3} labelLayout="float" useColon={false}>
          <TextField name="orderSeq" />
          <Select name="nodeCode" />
          <TextField name="createdByName" />

          {nodeId && <DateTimePicker name="lastUpdateDate" />}
        </Form>
      </div>

      <div className={styles['chunk-content']}>
        <div className={styles['content-two-title']}>
          <div className={styles['content-two-title-ink']} />
          {intl.get(`${commonPrompt}.attachmentDefined`).d('附件定义')}
        </div>

        <Table
          style={{ maxHeight: '450px' }}
          dataSet={listDs}
          columns={columns}
          buttons={buttons}
          customizable
          customizedCode="SMDM_CERTIFICATION_CONFIG.NODE_ATTACHMENT_LIST"
        />
      </div>
    </div>
  );
});

// export default Index;
export default Index;
