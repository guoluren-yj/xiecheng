import React from 'react';
import { SubContent } from '@/components/PageContent';
import styles from './index.less';

export default function WorkflowContent(props) {
  const { children, contentList = [] } = props;
  return (
    <div className={styles['workflow-content']}>
      {children ||
        contentList.map((m, ind) => {
          const { title, child } = m;
          return (
            <SubContent
              title={title}
              style={{ marginBottom: ind < contentList.length - 1 ? 2 : 0 }}
            >
              {child}
            </SubContent>
          );
        })}
    </div>
  );
}
