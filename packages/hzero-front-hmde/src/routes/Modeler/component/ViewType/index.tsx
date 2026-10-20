import React, { useMemo } from 'react';
import { Select, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import styles from './index.less';

const { Option } = Select;
interface IIndex {
  viewType: string;
  onchange: (value: string) => void;
}
const Index = ({ onchange = () => {}, viewType = '' }: IIndex) => {
  const selectDs = useMemo(
    () =>
      new DataSet({
        data: [{ viewType }],
        fields: [
          {
            name: 'viewType',
            label: '视图分类',
            type: 'string' as FieldType,
            required: true,
          },
        ],
        events: {
          update: ({ value }) => {
            onchange(value);
          },
        },
      }),
    [viewType]
  );
  return (
    <Select
      className={styles['lowcode-select']}
      name="viewType"
      dataSet={selectDs}
      clearButton={false}
    >
      <Option key="labelView" value="labelView">
        标签视图
      </Option>
      <Option key="serviceView" value="serviceView">
        服务视图
      </Option>
    </Select>
  );
};

export default observer(Index);
