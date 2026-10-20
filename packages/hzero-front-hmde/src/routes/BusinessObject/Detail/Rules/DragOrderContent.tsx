import React, { useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Field from './Filed';

export default ({ selectFields, formDS, tenantReadOnly }) => {
  const handleDelete = (id) => {
    const findSelectIndex = selectFields.findIndex((ele) => ele.businessObjectFieldCode === id);
    selectFields.splice(findSelectIndex, 1);
    // eslint-disable-next-line no-unused-expressions
    formDS.current?.set('validRuleFields', [
      ...selectFields.map((ele, idx) => ({ ...ele, orderSeq: idx })),
    ]);
  };

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragCard = selectFields[dragIndex];
      const resultCard = [...selectFields];
      resultCard.splice(dragIndex, 1);
      resultCard.splice(hoverIndex, 0, dragCard);
      // ! 需要重新设置一遍 orderSeq 的值， 否则单单数组引用地址改变是不会触发 ds将 record的状态设置成 update的，会重新设置成 sync 从而导致 点击保存时不会调用 submit 接口
      // eslint-disable-next-line no-unused-expressions
      formDS.current?.set(
        'validRuleFields',
        resultCard.map((ele, idx) => ({ ...ele, orderSeq: idx }))
      );
    },
    [selectFields, formDS]
  );

  const renderItem = (item, index) => {
    return (
      <Field
        key={item.businessObjectFieldCode}
        index={index}
        id={item.businessObjectFieldCode}
        text={item.businessObjectFieldName}
        moveCard={moveCard}
        handleDelete={handleDelete}
        tenantReadOnly={tenantReadOnly}
      />
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ width: 342, background: '#F9F9F9', padding: 16 }}>
        {selectFields.map((item, i) => renderItem(item, i))}
      </div>
    </DndProvider>
  );
};
