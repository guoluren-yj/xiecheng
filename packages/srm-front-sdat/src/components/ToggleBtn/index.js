import React, { useState, useEffect } from 'react';

import './index.less';

export default function ToggleBtn(props) {
  const { toggleList = [], onSelect = () => {}, defaultValue, ...rest } = props;
  const [isActive, setActive] = useState(toggleList.length ? toggleList[0].id : '');

  useEffect(() => {
    const key = toggleList.length ? toggleList[0].id : '';
    setActive(key);
    onSelect(key);
  }, [defaultValue]);

  const handleSelect = (key) => {
    setActive(key);
    onSelect(key);
  };

  return (
    <div className="btn-toogle-group" {...rest}>
      {toggleList.map((item) => {
        return (
          <div
            key={item.id}
            onClick={() => handleSelect(item.id)}
            className={`btn-common ${isActive === item.id ? 'btn-active' : ''}`}
          >
            {item.title}
          </div>
        );
      })}
    </div>
  );
}
