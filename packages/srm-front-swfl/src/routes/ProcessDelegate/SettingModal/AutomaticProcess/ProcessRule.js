import React, { memo, useState, useEffect } from 'react';
import {
  Form,
  Select,
  Lov,
  Switch,
  TextArea,
  DateTimePicker,
  NumberField,
  Tooltip,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { queryActNodeList } from '@/services/automaticProcessService';
import { getResponse } from 'hzero-front/lib/utils/utils';

const ProcessRule = observer(({ dataSet, isEdit }) => {
  const [processCondition, setProcessCondition] = useState(
    dataSet.current.get('processCondition') || ''
  );
  const [processRule, setProcessRule] = useState(dataSet.current.get('processRule') || '');
  const [nodeList, setNodeList] = useState([]);
  const fetchActNodeList = async (processKey) => {
    queryActNodeList({
      processKey,
    }).then((res) => {
      if (getResponse(res) && res && Array.isArray(res)) {
        setNodeList(res);
      }
    });
  };

  useEffect(() => {
    if (isEdit) {
      const processKey = dataSet.current ? dataSet.current.get('processKey') : undefined;
      fetchActNodeList(processKey);
    }
  }, []);

  useEffect(() => {
    if (!isEdit) {
      const { key } = dataSet.current.get('processKeyLov') || {};
      if (!isNil(key)) {
        fetchActNodeList(key);
      }
    }
  }, [isEdit, dataSet.current.get('processKeyLov')]);

  return (
    <Form dataSet={dataSet} labelLayout="float">
      <Lov name="employeeLov" disabled={isEdit} />
      <Lov name="processKeyLov" disabled={isEdit} />
      <Select
        name="processCondition"
        onChange={(value) => {
          setProcessCondition(value);
          if (value === 'FIXED_PERIOD') {
            dataSet.current.set('timeoutValue', '');
            dataSet.current.set('timeoutUnit', '');
          } else if (value === 'TIME_OUT') {
            dataSet.current.set('processStartDate', '');
            dataSet.current.set('processEndDate', '');
          } else {
            dataSet.current.set('timeoutValue', '');
            dataSet.current.set('timeoutUnit', '');
            dataSet.current.set('processStartDate', '');
            dataSet.current.set('processEndDate', '');
          }
        }}
      />
      {processCondition === 'FIXED_PERIOD' ? (
        <>
          <DateTimePicker name="processStartDate" />
          <DateTimePicker name="processEndDate" />
        </>
      ) : processCondition === 'TIME_OUT' ? (
        <>
          <NumberField name="timeoutValue" />
          <Select name="timeoutUnit" />
        </>
      ) : null}
      <Select
        name="processRule"
        onChange={(value) => {
          setProcessRule(value);
          if (!dataSet.current) {
            return;
          }
          dataSet.current.set('delegateActId', []);
          if (value === 'AutoApprove') {
            dataSet.current.set('delegateLov', {});
          } else if (value === 'AutoDelegate') {
            dataSet.current.set('processRemark', '');
            dataSet.current.set('enabledFlag', false);
          } else {
            dataSet.current.set('delegateLov', {});
            dataSet.current.set('processRemark', '');
            dataSet.current.set('enabledFlag', false);
          }
        }}
      />
      {processRule === 'AutoApprove' ? (
        <>
          <TextArea name="processRemark" />
        </>
      ) : processRule === 'AutoDelegate' ? (
        <Lov name="delegateLov" />
      ) : null}
      {dataSet.current && dataSet.current.get('processRule') === 'AutoDelegate' && (
        <>
          <Select name="delegateActId" searchable clearButton>
            {nodeList.map((n) => (
              <Select.Option value={n.id}>{n.name}</Select.Option>
            ))}
          </Select>
          {dataSet.current.get('processRule') === 'AutoDelegate' && (
            <Switch
              name="hisDelegateFlag"
              label={
                <>
                  {intl.get('hwfp.common.delegate.documentAutoDelegate').d('未审批单据自动转交')}
                  <Tooltip
                    title={intl
                      .get('hwfp.common.delegate.documentAutoDelegate.help')
                      .d('开启未审批单据自动转交，则到达转交开始时间，未审批单据会自动转交转交人')}
                  >
                    <Icon type="help" />
                  </Tooltip>
                </>
              }
            />
          )}
        </>
      )}
      <Switch name="enabledFlag" />
    </Form>
  );
});

export default memo(ProcessRule);
