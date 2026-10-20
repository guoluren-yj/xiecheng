/* eslint-disable no-param-reassign */
import React, { useMemo, useEffect } from 'react';
import { Table, DataSet, Select, CheckBox, Button, Radio } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const DelButton = observer(({ dataSet }) => {
  async function handleDelete(){
    const res = await dataSet.delete(dataSet.selected || []);
    if(res){
      dataSet.loadData(dataSet.toData());
    }
  }
  return (
    <Button
      disabled={!dataSet.selected.length}
      funcType="flat"
      color="primary"
      icon="delete_sweep"
      onClick={()=>{ handleDelete(); }}
    >
      {intl.get('small.common.model.batchDelete').d('批量删除')}
    </Button>
  );
});

export default function commonTable(props) {
  const { record: recordData, lookupCode, valueType, DSName, title, activeKey, customizedCode, readOnly } = props;
  const isEcFlag = activeKey === 'ec';
  const fields = [
    {
      name: 'orderSeq',
      label: intl.get('small.common.model.code').d('编号'),
    },
    {
      name: 'valueCode',
      lookupCode,
      required: true,
      // lovPara: { parentValue: recordData.ecPlatform },
      label: title,
    },
    {
      name: 'enabledFlag',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('defaultValue');
        },
      },
      label: readOnly ? intl.get('hzero.common.status').d('状态') : intl.get('small.common.model.isornoEnabledFlag').d('启用'),
    },
    {
      name: 'opreate',
      label: intl.get('small.common.model.operation').d('操作'),
    },
    {
      name: 'defaultValue',
      label: intl.get('small.common.model.defaultFlag').d('默认'),
    },
    {
      name: 'ecClientId',
      defaultValue: recordData.ecClientId,
    },
    {
      name: 'valueName',
    },
    {
      name: 'tenantId',
      defaultValue: getCurrentOrganizationId(),
    },
    {
      name: 'valueType',
      defaultValue: valueType,
    },
  ];
  const DS = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        fields,
        selection: readOnly ? false : 'multiple',
        transport: {
          read() {
            return {
              url: `${SRM_MALL}/v1/${getCurrentOrganizationId()}/${activeKey}-client-values/by-condition?ecClientId=${
                recordData.ecClientId
              }&valueType=${valueType}`,
              method: 'GET',
              transformResponse: (res) => {
                const data = JSON.parse(res);
                return data;
              },
            };
          },
          destroy() {
            return {
              url: `${SRM_MALL}/v1/${getCurrentOrganizationId()}/${activeKey}-client-values`,
              method: 'DELETE',
            };
          },
        },
        events: {
          update: ({ record, name, value }) => {
            if (name === 'valueCode') {
              const text = record.getField('valueCode').getText(value);
              record.set('valueName', text);
            }
          },
        },
      }),
    [readOnly]
  );
  useEffect(() => {
    props.onDSRef({ name: DSName, ref: DS });
  }, [readOnly]);

  const defaultReadOnly = (value)=>{
    const result = {};
    switch(value){
      case 1:
        result.bgColor = '#179454';
        result.text = intl.get('small.common.model.yes').d('是');
        break;
      default:
        result.bgColor = '#E64322';
        result.text = intl.get('small.common.model.no').d('否');
    }
    return (
      <span>
        <span style={{
          backgroundColor: result.bgColor,
          width: 6,
          height: 6,
          display: 'inline-block',
          borderRadius: '50%',
          margin: '0 8px 1px 0' }}
        />
        <span>{result.text}</span>
      </span>
    );
  };

  const columns = [
    {
      name: 'enabledFlag',
      width: isEcFlag ? 60 : 190,
      visible: !readOnly,
      renderer: ({ value })=>(
        value ? (
          <Tag color="green" border={false}>
            {intl.get('hzero.common.button.enable').d('启用')}
          </Tag>
          ) : (
            <Tag color="red" border={false}>
              {intl.get('hzero.common.button.disable').d('禁用')}
            </Tag>
          )
      ),
    },
    {
      name: 'orderSeq',
      visible: isEcFlag,
      width: 150,
      renderer: ({record}) => (record.index + 1),
    },
    {
      name: 'valueCode',
      width: isEcFlag ? null : 510,
      editor: (record) => readOnly ? null : (
        <Select
          onChange={(value, oldValue) => {
            if (DS.toData().filter((p) => p.valueCode === value).length > 1) {
              record.set('valueCode', oldValue);
            }
          }}
        />
      ),
    },
    {
      name: 'defaultValue',
      width: isEcFlag ? 90 : 190,
      renderer: ({ record, dataSet, value })=> (
        readOnly ? defaultReadOnly(value) : (
          <Radio
            name={valueType}
            disabled={!record.get('enabledFlag')}
            defaultChecked={record.get('defaultValue') === 1}
            onChange={()=>{
            dataSet.forEach((ds, i) => {
              ds.set('defaultValue', i === record.index ? 1 : 0);
            });
          }}
          />
)),
    },
    {
      name: 'enabledFlag',
      width: isEcFlag ? 60 : 190,
      visible: readOnly,
      editor: <CheckBox />,
    },
  ].filter(i=> !i.visible);

  return (
    <Table
      customizedCode={customizedCode}
      buttons={readOnly ? [] : ['add', <DelButton dataSet={DS} />]}
      dataSet={DS}
      columns={columns}
      pagination={false}
    />
  );
}
