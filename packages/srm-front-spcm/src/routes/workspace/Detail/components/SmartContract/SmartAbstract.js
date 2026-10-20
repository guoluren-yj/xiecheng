/**
 * SmartAbstract.js - 智能摘要-只读
 * @date: 2022-03-22
 * @author: CDJ
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { useEffect } from 'react';
import classnames from 'classnames';

import { useDataSet } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import intl from 'utils/intl';

import ContractModal from './ContractModal';
import { getIndexDs } from './stores/indexDS';

import styles from './index.less';

const { Panel } = Collapse;

const SmartAbstract = ({
  showFlag = false,
  c7nStyleFlag = false,
  h0StyleFlag = false,
  pcHeaderId = '',
  isEdit = false,
} = {}) => {
  const indexDs = useDataSet(() => getIndexDs({ pcHeaderId, isEdit }), [pcHeaderId, isEdit]);

  useEffect(() => {
    if (pcHeaderId && showFlag) {
      indexDs.query();
    }
  }, [pcHeaderId]);

  return showFlag ? (
    <div>
      <Collapse
        bordered={false}
        defaultActiveKey={['smartAbstract']}
        expandIconPosition="text-right"
        trigger="text-icon"
        className={classnames(styles['spcm-smart-abstract-collapse'], {
          [styles['spcm-smart-abstract-c7n-style']]: c7nStyleFlag,
          [styles['spcm-smart-abstract-h0-style']]: h0StyleFlag,
        })}
      >
        <Panel
          header={intl.get('spcm.common.view.title.smartContract').d('智能摘要')}
          key="smartAbstract"
          forceRender
        >
          <ContractModal dataSet={indexDs} isEdit={isEdit} />
        </Panel>
      </Collapse>
    </div>
  ) : null;
};

export default SmartAbstract;
