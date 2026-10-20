import React, { useEffect, useState } from 'react';
import { Tag, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

interface IProps {
  data?: any;
}
const TagRender = (props: IProps) => {
  const { data = [] } = props;
  const [iconFlag, setIconFlag] = useState<boolean>(false);
  const [curData, setCurData] = useState<any>(data);
  const [list, setList] = useState<any>([]);
  const containWidth = document.getElementById('tagContain')?.clientWidth || 0;
  const childrenList: any = document.getElementById('tagContain')?.children || [];

  useEffect(() => {
    setCurData(data);
    setIconFlag(false);
    setList(childrenList);
  }, [data, containWidth, childrenList]);

  const renderTip = () => {
    const limitNumber = [...list]?.reduce((total, cur) => {
      return Number(total) + (Number(cur?.offsetWidth) + 8);
    }, 0);
    const wrapFlag = limitNumber >= containWidth;
    return !iconFlag && wrapFlag && <Tag>...</Tag>;
  };

  return (
    <div
      id="tagContain"
      style={{
        marginTop: 2,
        marginBottom: 16,
        paddingTop: 4,
        paddingBottom: 12,
        paddingLeft: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
      }}
    >
      <Icon
        type={iconFlag ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}
        style={{ fontSize: 28, marginRight: 10, cursor: 'pointer' }}
        onClick={() => {
          setIconFlag(!iconFlag);
        }}
      />
      {curData?.map((record, index) => {
        const ele = (
          <Tag key={index} style={{ marginTop: 8 }}>
            {record?.businessObjectName}
          </Tag>
        );
        if (iconFlag) {
          return ele;
        } else {
          const limitNumber = [...list]
            .filter((i, tag) => index + 1 >= tag)
            ?.reduce((total, cur) => {
              return Number(total) + (Number(cur?.offsetWidth) + 8);
            }, 0);
          const wrapFlag = limitNumber + 50 >= containWidth;
          if (wrapFlag) {
            return null;
          } else {
            return ele;
          }
        }
      })}
      {renderTip()}
    </div>
  );
};
export default observer(TagRender);
