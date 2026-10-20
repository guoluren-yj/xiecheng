import React from 'react';
import { Tree } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';

import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import treeNavBody from '../../assets/icons/treeNavBody.svg';
import treeNavLine from '../../assets/icons/treeNavLine.svg';

import './treeshow.less';

const TreeShow = props => {
  const { handleOnSelect, treeNavDataDs } = props;

  return (
    <div className="treeNameStyle">
      <Tree
        showLine={{
          showLeafIcon: false,
        }}
        defaultExpandAll
        showIcon={false}
        dataSet={treeNavDataDs}
        onSelect={handleOnSelect}
        renderer={({ record }) => (
          <Tooltip placement="right" title={`【${record.get('fieldName')}】-【${record.get('fieldCode')}】`}>
            <div className="boxContent">
              <div style={{ color: 'black' }}>
                <img
                  src={record.get('sourceNode') ? treeNavLine : treeNavBody}
                  alt=""
                  style={{ marginRight: '4px' }}
                />
                <span className="boxContent-text">{record.get('fieldName')}</span>
              </div>
              <div className="boxContent-text" style={{ marginLeft: '20px' }}>{record.get('fieldCode')}</div>
            </div>
          </Tooltip>
        )}
      />
    </div>
  );
};

export default formatterCollections({
  code: ['scux.interfaceObjectDefinition', 'hzero.common'],
})(TreeShow);
