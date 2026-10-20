import React, { useEffect, useMemo, useState, useImperativeHandle } from 'react';
import {
  Form,
  Table,
  TextField,
  Select,
  IntlField,
  Lov,
  useDataSet,
  Output,
  Button,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
// import MappingModal from './mappingModal';
import { isEmpty } from 'choerodon-ui/dataset/utils';
import { baseInfoDS, mappingLineDS } from './store/indexDs';

import styles from './index.less';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = React.forwardRef(({ formData = {}, isTenant, disabled = false }, ref) => {
  const formDs = useDataSet(() => baseInfoDS({ isTenant, disabled }), [isTenant, disabled]);

  const [headrId] = useState(formData.budgetItemId);

  const listDs = useDataSet(() => mappingLineDS({ isTenant, headrId, disabled }), [
    isTenant,
    disabled,
    headrId,
  ]);

  const colorRenderStatus = (value, text) => {
    if (value === '1') {
      return (
        <Tag color="green" style={{ border: 'none' }}>
          {text}
        </Tag>
      );
    } else {
      return (
        <Tag color="yellow" style={{ border: 'none' }}>
          {text}
        </Tag>
      );
    }
  };

  const colorSourceRender = (value, text) => {
    if (value === '1') {
      return (
        <Tag color="green" style={{ border: 'none' }}>
          {intl.get(`hzero.common.predefined`).d('预定义')}
        </Tag>
      );
    } else {
      return (
        <Tag color="yellow" style={{ border: 'none' }}>
          {intl.get(`hzero.common.custom`).d('自定义')}
        </Tag>
      );
    }
  };

  const getDetailInfo = async () => {
    const formFlag = await formDs.validate();
    const listFlag = await listDs.validate();

    const listKey = 'itemMappingList';

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
        name: 'documentType',
        // width: 200,
        editor: !disabled,
      },
      {
        name: 'fieldName',
        // width: 200,
        editor: !disabled,
      },
      {
        name: 'fieldNameDesc',
        // width: 250,
        editor: !disabled,
      },
      {
        name: 'translateScene',
        // width: 250,
        // renderer: ({ record, name }) => (
        //   <MappingModal record={record} name={name} disabled={disabled} />
        // ),
        editor: !disabled,
      },
    ];
  }, []);

  const DeleteBtn = observer(() => {
    const { selected } = listDs;
    return (
      <Button
        key="delete"
        funcType="flat"
        icon="delete"
        color="primary"
        type="c7n-pro"
        onClick={() =>
          listDs.delete(selected, {
            title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
            children: (
              <div>
                {intl
                  .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                  .d('确认删除选中行？')}
              </div>
            ),
          })
        }
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  });

  const RenderForm = observer(() => {
    return disabled ? (
      <Form
        dataSet={formDs}
        showLines={6}
        columns={3}
        useColon={false}
        labelLayout="vertical"
        labelAlign="left"
        className="c7n-pro-vertical-form-display"
      >
        <Output name="budgetItemCode" />
        <Output name="budgetItemName" />
        <Output name="enabledFlag" renderer={({ value, text }) => colorRenderStatus(value, text)} />

        {isTenant && (
          <Output name="predefinedFlag" renderer={({ value }) => colorSourceRender(value)} />
        )}
        <Output name="componentType" />
        {formDs?.current?.get('componentType') !== 'TEXT' && <Output name="lovCode" />}
        <Output name="importTranslateScene" />
      </Form>
    ) : (
      <Form dataSet={formDs} showLines={6} columns={3} labelLayout="float" useColon={false}>
        <TextField name="budgetItemCode" />
        <IntlField name="budgetItemName" />
        <Select name="enabledFlag" />

        {isTenant && <Select name="predefinedFlag" />}
        <Select name="componentType" />
        {formDs?.current?.get('componentType') !== 'TEXT' && <Lov name="lovCode" />}
        <Lov name="importTranslateScene" />
      </Form>
    );
  });

  const buttons = useMemo(() => {
    // if (disabled) {
    //   return [];
    // } else {
    return ['add', <DeleteBtn />];
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTenant, listDs]);

  useEffect(() => {
    formDs.loadData([
      {
        ...formData,
      },
    ]);

    if (headrId) {
      listDs.query();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headrId]);

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
          {intl.get(`${commonPrompt}.baseInfo`).d('基础信息')}
        </div>
        <RenderForm />
      </div>

      <div className={styles['chunk-content']}>
        <div className={styles['content-two-title']}>
          <div className={styles['content-two-title-ink']} />
          {intl.get(`${commonPrompt}.mappingRelation`).d('映射关系')}
        </div>

        <Table
          style={{ maxHeight: '450px' }}
          virtual
          virtualCell
          customizable
          customizedCode={'SBUD_BUDGETITEM_MAPPING'}
          dataSet={listDs}
          columns={columns}
          buttons={disabled ? [] : buttons}
        />
      </div>
    </div>
  );
});

export default Index;
