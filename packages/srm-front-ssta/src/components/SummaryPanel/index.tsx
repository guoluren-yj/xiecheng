import React, { memo, useState, useMemo } from 'react';
import { isNil } from 'lodash';
import classnames from 'classnames';
import { Collapse } from 'choerodon-ui';
import type { PanelProps } from 'choerodon-ui/lib/collapse';

import PanelExtra from './PanelExtra';
import styles from './index.less';

interface SummaryPanelProps extends PanelProps {
  key: string,
  header?: React.ReactNode,
  children?: React.ReactNode
  showExtra?: boolean,
}

const SummaryPanel = memo(
  (props: SummaryPanelProps) => {
    const {
      key,
      header,
      children,
      showExtra,
      ...otherProps
    } = props;

    const [stickyFlag, setStickyFlag] = useState(false);

    const panelClassName = useMemo(() => {
      return classnames({
        [styles['sticky-panel']]: stickyFlag,
        [styles['header-hidden-panel']]: isNil(header),
      });
    }, [header, stickyFlag]);

    return (
      <Collapse.Panel
        key={key}
        header={header}
        className={panelClassName}
        extra={(
          <PanelExtra
            showExtra={showExtra}
            stickyFlag={stickyFlag}
            setStickyFlag={setStickyFlag}
          />
        )}
        {...otherProps}
      >
        {children}
      </Collapse.Panel>
    );
  }
);

export default SummaryPanel;