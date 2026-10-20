import React from 'react';
import { observer } from 'mobx-react-lite';
import { useDrag } from 'react-dnd';
import ImgIcon from '@/utils/ImgIcon';
import { DataSet } from 'choerodon-ui/pro/lib';

function getStyle(isDragging) {
  return isDragging
    ? {
        background: '#fff',
        boxShadow: '-1px 1px 4px 0 #c1d1f2',
      }
    : {};
}

interface IProps {
  currentNodeData: any; // drill查询字段属性
  treeSearch: string;
  dataSet: DataSet;
}
export default observer(({ currentNodeData, treeSearch, dataSet }: IProps) => {
  const [{ isDragging }, drag] = useDrag({
    item: {
      type: 'field',
      field: currentNodeData,
    },
    canDrag: () =>
      currentNodeData.drillFlag &&
      !dataSet.some(
        record =>
          record?.get('businessObjectFieldCode')?.split(':')?.[
            record?.get('businessObjectFieldCode')?.split(':').length - 1
          ] === `${currentNodeData.businessObjectFieldCode}` // FIXME: === `$\{${currentNodeData.businessObjectCode}.${currentNodeData.businessObjectFieldCode}}`
      ),
    end(item, monitor) {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        dropResult.callback(currentNodeData);
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragStyle = getStyle(isDragging);

  const index = currentNodeData.businessObjectFieldName.indexOf(treeSearch);
  const beforeStr = currentNodeData.businessObjectFieldName.substr(0, index);
  const afterStr = currentNodeData.businessObjectFieldName.substr(index + treeSearch.length);

  return (
    <div
      ref={drag}
      style={{
        userSelect: 'none',
        whiteSpace: 'nowrap',
        borderRadius: 2,
        padding: '0 4px',
        transition: 'all .3s',
        ...dragStyle,
      }}
    >
      <ImgIcon name="drag_indicator_black.svg" size={14} hidden={!currentNodeData.drillFlag} />
      {index > -1 ? (
        <>
          <span>{beforeStr}</span>
          <span style={{ color: '#f50' }}>{treeSearch}</span>
          <span>{afterStr}</span>
        </>
      ) : (
        <span>{currentNodeData.businessObjectFieldName}</span>
      )}
    </div>
  );
});
