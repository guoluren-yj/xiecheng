import React from 'react';
import IconPicker from '../IconPicker';
import { dataSource } from '../enums';

const Index = () => {
  const onChange = (item) => {
    console.log('item', item);
  };
  const onItemEnter = () => {
    console.log('鼠标移入事件');
  };
  const onItemLeave = () => {
    console.log('鼠标移出事件');
  };
  return (
    <IconPicker
      onItemEnter={onItemEnter}
      onItemLeave={onItemLeave}
      dataSource={dataSource}
      onChange={onChange}
    />
  );
};

export default Index;
