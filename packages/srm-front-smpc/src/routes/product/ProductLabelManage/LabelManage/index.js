import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { DraggableArea } from 'react-draggable-tags';

import intl from 'utils/intl';
import LabelPreview from '../LabelPreview';

import '../index.less';

export default function (props) {
  const { labelTableDs, labelSelectDs } = props;

  const columns = [
    {
      name: 'labelCode',
      width: 120,
    },
    {
      name: 'labelName',
    },
    {
      name: 'labelPreview',
      width: 110,
      renderer: ({ record }) => {
        const code = record.get('labelColorCode');
        const value = record.get('labelName');
        return <LabelPreview code={code} value={value} />;
      },
    },
  ];

  const getItemStyle = (draggableStyle) => ({
    display: 'inline-block',
    marginRight: '12px',
    cursor: 'auto',
    ...draggableStyle,
  });

  const DragDropComponent = observer(({ dataSet, tableDs }) => {
    // 商品标签按orderSeq序号排列
    const labelList = dataSet.records.sort((p, q) => {
      return p.get('orderSeq') > q.get('orderSeq') ? 1 : -1;
    });
    return (
      <>
        <p className="model-title">{intl.get('smpc.product.view.assignedLabel').d('已分配标签')}</p>
        <p className="model-title-tip">
          {intl
            .get('smpc.product.view.labelSortingTips')
            .d('下方标签支持使用拖拽方式进行排序，主站搜索结果页默认取前3个')}
        </p>
        <DraggableArea
          tags={labelList}
          render={({ tag, index }) => {
            const sources = tag.get('skuLabelSources') || [];
            return (
              <div style={getItemStyle()} key={index}>
                <LabelPreview
                  closable={sources.length < 1}
                  code={tag.get('labelColorCode')}
                  value={tag.get('labelName')}
                  onChange={() => {
                    const tableRecord = tableDs.selected.find(
                      (f) => f.get('labelId') === tag.get('labelId')
                    );
                    if (tableRecord) {
                      tableDs.unSelect(tableRecord);
                    } else {
                      const record = dataSet.records.find(
                        (f) => f.get('labelId') === tag.get('labelId')
                      );
                      record.status = 'add';
                      dataSet.remove([record]);
                    }
                  }}
                />
              </div>
            );
          }}
          onChange={(tags) => {
            (tags || []).forEach((record, index) => {
              record.set('orderSeq', index + 1);
            });
          }}
        />
      </>
    );
  });

  return (
    <div className="label-manage-modal">
      <p className="model-title">{intl.get('smpc.product.view.assignLabel').d('分配标签')}</p>
      <Table
        dataSet={labelTableDs}
        columns={columns}
        queryFieldsLimit={2}
        queryBar="normal"
        style={{ marginBottom: '20px' }}
      />
      <DragDropComponent dataSet={labelSelectDs} tableDs={labelTableDs} />
    </div>
  );
}
