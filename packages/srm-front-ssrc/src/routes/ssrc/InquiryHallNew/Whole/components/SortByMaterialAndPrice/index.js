import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Select, Modal, useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import Style from './index.less';

const Index = observer((props) => {
  const { lineDS, detailFlag } = props;

  const data = [
    {
      sortByPrice: 'LOWEST_PRICE',
    },
  ];

  const selectDS = useDataSet(() => {
    return {
      data,
      fields: [
        {
          name: 'sortByPrice',
        },
      ],
    };
  }, []);

  useEffect(() => {
    lineDS.setQueryParameter('sortByPrice', data[0].sortByPrice);
  }, [data]);

  // 下拉框选项
  const options = [
    {
      value: 'LOWEST_PRICE',
      meaning: intl
        .get('ssrc.offlineResultEntry.model.offlineResultEntry.sortByLowestPrice')
        .d('按物料行号和最低价'),
    },
    {
      value: 'MAXIMUM_PRICE',
      meaning: intl
        .get('ssrc.offlineResultEntry.model.offlineResultEntry.sortByMaximumPrice')
        .d('按物料行号和最高价'),
    },
  ];

  // 选项变更成功操作
  const handleAfterOperate = (value) => {
    lineDS.setQueryParameter('sortByPrice', value);
    lineDS.query(lineDS.currentPage);
  };

  const handleChange = (value, oldValue) => {
    if (lineDS.dirty && !detailFlag) {
      // 表格行变更 & 不是明细页面
      // 如果数据有变更，则弹出确认框
      return Modal.confirm({
        title: intl.get('hzero.common.button.confirm').d('确认'),
        children: intl
          .get('ssrc.offlineResultEntry.model.offlineResultEntry.sortConfirmMessage')
          .d('选择排序后，未保存的信息将会被清除，是否保存？'),
        onOk: () => {
          const addData = lineDS.filter((newItem) => !newItem.get('offlineQuoLineId'));
          if (addData.length) {
            lineDS.remove(addData, 1);
          }
          handleAfterOperate(value);
        },
        onCancel: () => {
          // eslint-disable-next-line no-unused-expressions
          selectDS?.current?.set('sortByPrice', oldValue);
        },
      });
    } else {
      handleAfterOperate(value);
    }
  };

  return (
    <div className={Style['ssrc-whole-update-sort-form']}>
      <Select
        dataSet={selectDS}
        onChange={handleChange}
        clearButton={false}
        border={false}
        name="sortByPrice"
      >
        {options.map((o) => {
          return <Select.Option value={o.value}>{o.meaning}</Select.Option>;
        })}
      </Select>
    </div>
  );
});

export default Index;
