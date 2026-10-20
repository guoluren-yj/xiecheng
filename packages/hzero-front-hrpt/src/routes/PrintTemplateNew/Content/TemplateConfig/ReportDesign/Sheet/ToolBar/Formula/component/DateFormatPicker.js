import React, { useEffect, useState, useMemo, useImperativeHandle } from 'react';
import { DataSet, Table, CheckBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const FORMAT = [
  { label: 'yyyy-mm-dd', value: 'yyyy-MM-dd', eq: '2024-03-15' },
  { label: 'yyyy-mm', value: 'yyyy-MM', eq: '2024-03' },
  { label: 'mm-dd', value: 'MM-dd', eq: '03-15' },
  { label: 'yyyy/mm/dd', value: 'yyyy/MM/dd', eq: '2024/03/15' },
  { label: 'dd-mm-yyyy', value: 'dd-MM-yyyy', eq: '15-03-2024' },
  { label: 'yyyy/mm', value: 'yyyy/MM', eq: '2024/03' },
  { label: 'mm/dd', value: 'MM/dd', eq: '03/15' },
  { label: 'yyyy年mm月dd日', value: 'yyyy年MM月dd日', eq: '2024年03月15日' },
  { label: 'yyyy年mm月', value: 'yyyy年MM月', eq: '2024年03月' },
  { label: 'mm月dd日', value: 'MM月dd日', eq: '03月15日' },
  { label: 'mm/dd/yyyy', value: 'MM/dd/yyyy', eq: '03/15/2014' },
  { label: 'yyyy-mm-dd hh:mm:ss', value: 'yyyy-MM-dd HH:mm:ss', eq: '2014-03-15 12:03:40' },
  { label: 'yyyy/mm/dd hh:mm:ss', value: 'yyyy/MM/dd HH:mm:ss', eq: '2014/03/15 12:03:40' },
  { label: 'yyyy/mm/dd hh:mm', value: 'yyyy/MM/dd HH:mm', eq: '2014/03/15 12:03' },
  { label: 'yyyy-mm-dd hh:mm', value: 'yyyy-MM-dd HH:mm', eq: '2014-03-15 12:03' },
  { label: 'hh:mm:ss', value: 'HH:mm:ss', eq: '12:03:40' },
  { label: 'hh:mm', value: 'HH:mm', eq: '12:03' },
  { label: 'yyyymmdd', value: 'yyyyMMdd', eq: '20240315' },
  { label: 'yyyyymm', value: 'yyyyMM', eq: '202403' },
  { label: 'mmdd', value: 'MMdd', eq: '0315' },
  { label: 'yyyymmdd hh:mm:ss', value: 'yyyyMMdd HH:mm:ss', eq: '20240315 12:03:40' },
  { label: 'dd-mm-yyyy hh:mm:ss', value: 'dd-MM-yyyy HH:mm:ss', eq: '15-03-2024 12:03:40' },
  { label: 'dd-mm-yyyy hh:mm', value: 'dd-MM-yyyy HH:mm', eq: '15-03-2024 12:03' },
  { label: 'dd/mm/yyyy', value: 'dd/MM/yyyy', eq: '15/03/2024' },
  { label: 'dd/mm/yyyy hh:mm:ss', value: 'dd/MM/yyyy HH:mm:ss', eq: '15/03/2024 12:03:40' },
  { label: 'dd/mm/yyyy hh:mm', value: 'dd/MM/yyyy HH:mm', eq: '15/03/2024 12:03' },
  { label: 'dd-mmm-yyyy', value: 'dd-MMM-yyyy', eq: '15-Mar-2024' },
  { label: 'dd-mmm-yyyy hh:mm:ss', value: 'dd-MMM-yyyy HH:mm:ss', eq: '15-Mar-2024 12:03:40' },
  { label: 'dd-mmm-yyyy hh:mm', value: 'dd-MMM-yyyy HH:mm', eq: '15-Mar-2024 12:03' },
  { label: 'dd/mmm/yyyy', value: 'dd/MMM/yyyy', eq: '15/Mar/2024' },
  { label: 'dd/mmm/yyyy hh:mm:ss', value: 'dd/MMM/yyyy HH:mm:ss', eq: '15/Mar/2024 12:03:40' },
  { label: 'dd/mmm/yyyy hh:mm', value: 'dd/MMM/yyyy HH:mm', eq: '15/Mar/2024 12:03' },
];

const NO_LEADING_ZERO_FORMAT = [
  { label: 'yyyy-m-d', value: 'yyyy-M-d', eq: '2024-3-15' },
  { label: 'yyyy-m', value: 'yyyy-M', eq: '2024-3' },
  { label: 'm-d', value: 'M-d', eq: '3-15' },
  { label: 'yyyy/m/d', value: 'yyyy/M/d', eq: '2024/3/15' },
  { label: 'd-m-yyyy', value: 'd-M-yyyy', eq: '15-3-2024' },
  { label: 'yyyy/m', value: 'yyyy/M', eq: '2024/3' },
  { label: 'm/d', value: 'M/d', eq: '3/15' },
  { label: 'yyyy年m月d日', value: 'yyyy年M月d日', eq: '2024年3月15日' },
  { label: 'yyyy年m月', value: 'yyyy年M月', eq: '2024年3月' },
  { label: 'm月d日', value: 'M月d日', eq: '3月15日' },
  { label: 'm/d/yyyy', value: 'M/d/yyyy', eq: '3/15/2014' },
  { label: 'yyyy-m-d h:m:s', value: 'yyyy-M-d H:m:s', eq: '2014-3-15 12:3:40' },
  { label: 'yyyy/m/d h:m:s', value: 'yyyy/M/d H:m:s', eq: '2014/3/15 12:3:40' },
  { label: 'yyyy/m/d h:m', value: 'yyyy/M/d H:m', eq: '2014/3/15 12:3' },
  { label: 'yyyy-m-d h:m', value: 'yyyy-M-d H:m', eq: '2014-3-15 12:3' },
  { label: 'h:m:s', value: 'H:m:s', eq: '12:3:40' },
  { label: 'h:m', value: 'H:m', eq: '12:3' },
  { label: 'yyyymd', value: 'yyyyMd', eq: '2024315' },
  { label: 'yyyym', value: 'yyyyM', eq: '20243' },
  { label: 'md', value: 'Md', eq: '315' },
  { label: 'yyyymd h:m:s', value: 'yyyyMd H:m:s', eq: '2024315 12:3:40' },
  { label: 'd-m-yyyy h:m:s', value: 'd-M-yyyy H:m:s', eq: '15-3-2024 12:3:40' },
  { label: 'dd-mm-yyyy hh:mm', value: 'd-M-yyyy H:m', eq: '15-3-2024 12:3' },
  { label: 'dd/mm/yyyy', value: 'd/M/yyyy', eq: '15/3/2024' },
  { label: 'dd/mm/yyyy hh:mm:ss', value: 'd/M/yyyy H:m:s', eq: '15/3/2024 12:3:40' },
  { label: 'dd/mm/yyyy hh:mm', value: 'd/M/yyyy H:m', eq: '15/3/2024 12:3' },
  { label: 'd-mmm-yyyy', value: 'd-MMM-yyyy', eq: '15-Mar-2024' },
  { label: 'd-mmm-yyyy hh:mm:ss', value: 'd-MMM-yyyy H:m:s', eq: '15-Mar-2024 12:3:40' },
  { label: 'd-mmm-yyyy hh:mm', value: 'd-MMM-yyyy H:m', eq: '15-Mar-2024 12:3' },
  { label: 'd/mmm/yyyy', value: 'd/MMM/yyyy', eq: '15/Mar/2024' },
  { label: 'd/mmm/yyyy hh:mm:ss', value: 'd/MMM/yyyy H:m:s', eq: '15/Mar/2024 12:3:40' },
  { label: 'd/mmm/yyyy hh:mm', value: 'd/MMM/yyyy H:m', eq: '15/Mar/2024 12:3' },
];

export default function DateFormatPicker(props) {
  const { modal, param, customeRenderRef, onSubmit } = props;
  const initValue = param && param.value && param.value.text;
  const [text, setText] = useState(initValue);
  const [noLeadingZero, setNoLeadingZero] = useState(!!initValue && NO_LEADING_ZERO_FORMAT.some(i => i.label === initValue));
  const tableDs = useMemo(() => {
    return new DataSet({
      paging: false,
      selection: 'single',
      fields: [
        { name: 'label', label: intl.get('hrpt.reportDesign.view.title.dateFormat').d('日期格式') },
        { name: 'eq', label: intl.get('hrpt.reportDesign.view.title.dateFormatEq').d('日期格式示例') },
      ],
    });
  }, []);
  
  const tableColumns = useMemo(() => [
    { name: 'label' },
    { name: 'eq' },
  ], []);

  useImperativeHandle(customeRenderRef, () => {
    return {
      submit,
    };
  });

  const submit = () => {
    const record = tableDs.selected && tableDs.selected[0];
    if (!record) {
      onSubmit();
    } else {
      onSubmit({
        text: record.get('label'),
        value: `'${record.get('value')}'`,
      });
    }
  };

  useEffect(() => {
    tableDs.loadData(noLeadingZero ? NO_LEADING_ZERO_FORMAT : FORMAT);
    tableDs.select(text ? tableDs.find(record => record.get('label') === text) : undefined);
  }, [tableDs, noLeadingZero, text]);

  const handleRow = ({ dataSet, record }) => {
    return {
      onDoubleClick: () => {
        dataSet.select(record);
        if (modal) {
          onSubmit({
            text: record.get('label'),
            value: `'${record.get('value')}'`,
          });
          modal.close();
        }
      },
    };
  };
  
  return (
    <div>
      <CheckBox checked={noLeadingZero} onChange={(value) => setNoLeadingZero(value)} style={{ marginBottom: '8px' }}>
        {intl.get('hrpt.reportDesign.view.button.clearLeagingZero').d('去除前置零')}
      </CheckBox>
      <Table dataSet={tableDs} columns={tableColumns} selectionMode='click' alwaysShowRowBox onRow={handleRow} />
    </div>
  );
}