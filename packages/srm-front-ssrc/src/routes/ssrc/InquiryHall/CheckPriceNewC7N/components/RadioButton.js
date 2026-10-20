import React, { useEffect, useState } from 'react';
import { Tag } from 'choerodon-ui';
import OverflowContainer from '@/routes/ssrc/components/TooltipContainer/index.js';
import style from './index.less';

const { CheckableTag } = Tag;

const RadioButtonCom = (props) => {
  const { defaultActive, stdConfig = [], custConfig = [], onChange } = props;
  const [configList, setConfigList] = useState([]);
  const [activeValue, setActiveValue] = useState(defaultActive);

  const handleChange = (value) => {
    if (activeValue === value) {
      return;
    }
    setActiveValue(value);
    if (typeof onChange === 'function') {
      onChange(value);
    }
  };

  useEffect(() => {
    const stdList = [];
    if (custConfig) {
      // 个性化配置
      custConfig.forEach((item) => {
        // 标准配置
        stdConfig.forEach((element) => {
          if (element.name === item.fieldCode) {
            // 若两者都显示
            if (item.visible !== 0) {
              stdList.push(element);
            }
          }
        });
      });
    }
    setConfigList(stdList);
  }, []);

  return (
    <div className={style.tagGroup}>
      {configList.map((item) => (
        <OverflowContainer title={item.meaning}>
          <CheckableTag
            className={item.value === activeValue ? style.checkedTag : style.unCheckedTag}
            onChange={() => handleChange(item.value)}
          >
            <OverflowContainer title={item.meaning}>
              {item.icon}
              <span style={{ marginLeft: '4px' }}>{item.meaning}</span>
            </OverflowContainer>
          </CheckableTag>
        </OverflowContainer>
      ))}
    </div>
  );
};

export default RadioButtonCom;
