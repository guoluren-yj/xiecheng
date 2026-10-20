import React from 'react';
import { Collapse } from 'choerodon-ui';

interface ContentCartProps {
  title?: string;
  children?: React.ReactNode;
  extra?: React.ReactNode;
}

const { Panel } = Collapse;

const ContentCard: React.FC<ContentCartProps> = (props) => {
  const { title, children, extra } = props;

  return (
    <Collapse trigger="icon" defaultActiveKey={['1']}>
      <Panel header={title} key="1" extra={extra}>
        {children}
      </Panel>
    </Collapse>
  );
};

export default ContentCard;
