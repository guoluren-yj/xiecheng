import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

function LegendCard() {
  const nodeTypeList = [
    {
      title: intl.get('hwfp.common.model.monitor.title.node.current').d('当前节点'),
      color: '#ff8a2b',
    },
    {
      title: intl.get('hwfp.common.model.monitor.title.node.predict').d('预测节点'),
      color: '#40a9ff',
    },
    {
      title: intl.get('hwfp.common.model.monitor.title.node.done').d('已审批节点'),
      color: '#47b881',
    },
    {
      title: intl.get('hwfp.common.model.monitor.title.node.pass').d('跳过节点'),
      color: '#d9d9d9',
    },
  ];

  return (
    <div className={styles['pic-example']}>
      <div className="pic-example-head">
        {intl.get('hwfp.common.model.monitor.title.legend').d('图例')}
      </div>
      <div className="pic-example-body">
        {nodeTypeList.map((item) => (
          <div className="pic-example-body-div" style={{ color: item.color }}>
            <Tooltip placement="top" title={item.title} theme="light">
              <span className="pic-example-body-div-span">{item.title}</span>
            </Tooltip>
            <div className="pic-example-body-div-line" style={{ borderTopColor: item.color }} />
            {/* <div className='pic-example-body-div-triangular' style={{borderLeftColor: item.color}} /> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default formatterCollections({
  code: ['hwfp.common'],
})(LegendCard);
