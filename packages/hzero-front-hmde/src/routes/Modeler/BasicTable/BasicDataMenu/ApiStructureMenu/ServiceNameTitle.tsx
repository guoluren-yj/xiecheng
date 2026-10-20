import React, { useRef } from 'react';
import { Tooltip } from 'choerodon-ui';

interface IServiceNameTitle {
  item: { serviceCode?: string };
}
const ServiceNameTitle = ({ item }: IServiceNameTitle) => {
  const nameRef: any = useRef();
  const isTooltip = nameRef.current?.offsetWidth > 175;
  if (isTooltip) {
    return (
      <Tooltip title={item.serviceCode}>
        <span ref={nameRef}>{item.serviceCode}</span>
      </Tooltip>
    );
  }
  return <span ref={nameRef}>{item.serviceCode}</span>;
};

export default ServiceNameTitle;
