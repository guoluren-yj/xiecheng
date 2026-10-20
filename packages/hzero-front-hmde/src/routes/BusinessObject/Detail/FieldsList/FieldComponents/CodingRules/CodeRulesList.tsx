import React from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, TextField, Output } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { TableColumnTooltip } from 'choerodon-ui/pro/lib/table/enum';

import DrillComponent from '@/components/DrillComponent';

import styles from './index.less';

const { Column } = Table;
interface IProps {
  ruleListDs: DataSet;
  // operateHeaderFlag: boolean;
  disabled: boolean;
  businessObjectCode: string;
  curFieldCode: string;
}
const [
  SEQUENCE, // 流水号
  // CONSTANT, // 固定字符
  VARIABLE, // 变量
  // UUID, // 随机变量uuid
  // DATE, // 日期
] = [
    'SEQUENCE',
    //  'CONSTANT',
    'VARIABLE',
    //  'UUID',
    //  'DATE',
  ];
const Index = ({ ruleListDs, disabled, businessObjectCode, curFieldCode }: IProps) => {
  const handleOk = (params, record) => {
    record.set('secondInput', params?.value);
  };
  /**
   * 获取drill数据，回写到editor
   * @param dataSet drill的dataSet
   */
  const drillRenderer = record => {
    const res = record.get('firstInput');
    const _businessObjectCode = res === 'CONTEXT' ? businessObjectCode : 'SYS_USER';
    return (
      <DrillComponent
        onOk={params => handleOk(params, record)}
        name="secondInput"
        businessObjectCode={_businessObjectCode}
        isWriteBack
        initValue={record?.get('secondInput')}
        curFieldCode={curFieldCode}
        onClear={() => {
          record.set('fieldValue', undefined);
          record.set('secondInput', undefined);
        }}
      />
    );
  };
  return (
    <Table
      dataSet={ruleListDs}
      dragColumnAlign={'left' as any}
      rowDraggable={!disabled}
      pagination={false}
      highLightRow={false}
      filter={record => !record.isRemoved}
      // className={styles['row-custom-table']}
    >
      <Column name="ruleName" width={100} tooltip={TableColumnTooltip.overflow} />
      <Column
        name="firstInputTitle"
        renderer={({ record }) => (
          <TextField
            style={{ width: 75, background: '#fff' }}
            disabled
            value={record?.get('firstInputTitle')}
          />
        )}
      />
      <Column name="firstInput" editor={!disabled} />
      <Column
        name="secondInputTitle"
        renderer={({ record }) => {
          if ([VARIABLE, SEQUENCE].includes(record?.get('fieldType'))) {
            return (
              <TextField
                style={{ width: 75, background: '#fff' }}
                disabled
                value={record?.get('secondInputTitle')}
              />
            );
          }
        }}
      />
      <Column
        name="secondInput"
        editor={record => !disabled && [SEQUENCE].includes(record?.get('fieldType'))}
        renderer={({ record }) => {
          if (!disabled && record?.get('fieldType') === VARIABLE) {
            return <Output name="valueValue" renderer={drillRenderer.bind(null, record)} />;
          }
          return record?.get('secondInput');
        }}
      />
      <Column
        name="thirdInputTitle"
        tooltip={TableColumnTooltip.overflow}
        renderer={({ record }) => {
          if (record?.get('fieldType') === SEQUENCE) {
            return (
              <TextField
                style={{ width: 75, background: '#fff' }}
                disabled
                value={intl.get('hmde.bo.field.codingRule.resetFrequency').d('重置频率')}
              />
            );
          }
          return <></>;
        }}
      />
      <Column
        name="thirdInput"
        tooltip={TableColumnTooltip.overflow}
        editor={record => !disabled && record?.get('fieldType') === SEQUENCE}
      />
      <Column
        align={'center' as any}
        // lock={'right' as any}
        width={50}
        renderer={({ record, dataSet }) => (
          <a
            disabled={disabled}
            // style={{ border: 'none' }}
            onClick={() => {
              if (dataSet && record) {
                dataSet.remove(record);
              }
            }}
          >
            <Icon className={styles['delete-icon']} type="delete_black-o" />
          </a>
        )}
      />
    </Table>
  );
};
export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(Index)
);
