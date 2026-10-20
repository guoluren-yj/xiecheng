import React, { useState } from 'react';
import { TextField, Icon, Tree, Typography } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import styles from './style.less';

const { Text } = Typography;

const TreeList = (props) => {
  const {
    dataSet,
    showSearch = true,
    searchFieldPlaceholder = intl.get('spc.formulaManage.view.fieldName').d('请输入字段名称查询'),
    onClick = noop,
  } = props;

  const [searchField, setSearchField] = useState(null);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState([]);

  const onExpand = (newExpandedKeys) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onEnterSearch = () => {
    dataSet.forEach((record) => {
      if (record.get('langStr').indexOf(searchField) > -1) {
        record.set('expand', true);
      } else {
        record.set('expand', false);
      }
    });
    setAutoExpandParent(true);
  };

  return (
    <>
      {showSearch && (
        <TextField
          style={{ width: '100%' }}
          name="fieldSearch"
          value={searchField}
          onChange={setSearchField}
          className={styles.fieldSearch}
          placeholder={searchFieldPlaceholder}
          prefix={<Icon onClick={onEnterSearch} type="search" />}
          onEnterDown={onEnterSearch}
        />
      )}

      <div className={styles.fieldList}>
        <Tree
          blockNode
          showLine={{
            showLeafIcon: false,
          }}
          defaultExpandAll
          dataSet={dataSet}
          showIcon={false}
          onExpand={onExpand}
          autoExpandParent={autoExpandParent}
          expandedKeys={expandedKeys}
          renderer={({ record }) => (
            <div style={{ width: '150px' }}>
              <Text
                style={{
                  width: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'noWrap',
                }}
                // className={record.get('expand') ? styles.fieldExpand : null}
                ellipsis={{ tooltip: record.get('tooltip') || record.get('langStr') }}
                onClick={() => onClick(record.toData())}
              >
                {record.get('langStr')}
              </Text>
              {/* {!record.get('expand') &&
                  (
                    <span className={styles.fieldType}>
                      {intl.get('spcm.common.msg.fieldName').d('数字')}
                    </span>
                  )
                } */}
            </div>
          )}
        />
      </div>
    </>
  );
};

export default observer(TreeList);
