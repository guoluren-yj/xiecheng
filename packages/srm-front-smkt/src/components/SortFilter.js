import React, { useEffect, useState, useRef } from 'react';
// import { Icon } from 'choerodon-ui';
import iconShang from '@/assets/icon-ascending.svg';
import iconXia from '@/assets/icon-descending.svg';

export default function SortFilter(props) {
  const {
    text,
    dataSet,
    name,
    filterSuffix = '',
    otherName = '',
    onRef = (e) => e,
    style = {},
  } = props;
  // 默认升序
  const [ascending, setAscending] = useState(true);
  const flag = useRef(null);

  useEffect(() => {
    onRef({ handleClear });
  }, []);

  useEffect(() => {
    if (!flag.current) {
      flag.current = true;
      return;
    }
    const direction = ascending ? 'ASC' : 'DESC';
    const prefix = filterSuffix ? `${filterSuffix}.${name}` : `${name}`;
    const final = otherName ? `${prefix},${otherName}` : `${prefix}`;
    dataSet.setQueryParameter('sort', `${final},${direction}`);
    dataSet.query();
  }, [ascending]);

  const handleClear = () => {
    setAscending(true);
    dataSet.setQueryParameter('sort', null);
  };
  // paixu-shang   paixu-xia
  return (
    <span style={style}>
      {text}
      <img
        src={ascending ? iconShang : iconXia}
        onClick={() => setAscending((pre) => !pre)}
        alt="排序"
        style={{
          width: 16,
          height: 16,
          marginLeft: 2,
        }}
      />
    </span>
  );
}
