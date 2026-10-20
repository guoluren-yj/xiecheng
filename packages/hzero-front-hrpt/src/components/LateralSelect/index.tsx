import type { ReactNode } from 'react';
import React from 'react';
import { observer } from 'mobx-react';
import type { Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import type { DataSet } from 'choerodon-ui/pro';
import { Output } from 'choerodon-ui/pro';
import styles from './index.less';

interface Iprops {
  name: string;
  label?: string | ReactNode;
  dataSet?: DataSet;
  options: { meaning: string; value: string | number; }[];
}

const opacityArr = [0.35, 0.65, 1];

function LateralSelect({ name, label, dataSet, options }: Iprops) {
  const handleClick = (value) => {
    if (dataSet && dataSet.current) {
      dataSet.current.set(name, value);
    }
  };

  const renderOptions = ({ value }) => {
    return (
      <div className={styles['lateral-select-options']}>
        {options.map((option, index) => (
          <div
            key={option.value}
            style={{ flex: `1 ${options.length}` }}
            className={styles['lateral-select-option']}
          >
            <div
              onClick={() => handleClick(option.value)}
              className={styles['lateral-select-option-bar']}
              style={{
                borderLeft: index !== 0 ? '1px solid #dadfe6' : 'none',
                borderRadius: index === 0 ? '8px 0px 0px 8px' : index === options.length -1 ? '0px 8px 8px 0px' : 0,
                backgroundColor: value === option.value ? '#179454' : '#F2F3F5',
                opacity: value === option.value ? opacityArr[index] || 1 : 1,
              }}
            />
            <div className={styles['lateral-select-option-content']} >{option.meaning}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Output
      dataSet={dataSet}
      name={name} 
      label={label}
      renderer={renderOptions as Renderer}
    />
  )
}

export default observer(LateralSelect);