/**
 * 映射关系Tab页
 */
import React, { useEffect, useState } from 'react';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_PROCESS } from '_utils/config';
import intl from 'utils/intl';
import MappingRelationsTree from '@/components/MappingRelationsTree';

let initRefresh = null;

const MappingRelations = (props) => {
  const { localRecord = null, refreshFlag = 0 } = props;
  const [tableName, setName] = useState(null);

  useEffect(() => {
    if (initRefresh) {
      initRefresh();
    }
  }, [refreshFlag]);

  useEffect(() => {
    if (localRecord && localRecord.tableName) {
      setName(tableName);
    }
    return () => {
      initRefresh = null;
    };
  }, [localRecord]);

  return (
    <>
      {localRecord && localRecord.tableName ? (
        <MappingRelationsTree
          initRefresh={(fun) => {
            initRefresh = fun;
          }}
          pageType="org"
          tableName={localRecord?.tableName ?? ''}
          fetchUrl={`${SRM_DATA_PROCESS}/v1/${getCurrentOrganizationId()}/meta-table/map-relation`}
        />
      ) : (
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
        </div>
      )}
    </>
  );
};

export default MappingRelations;
