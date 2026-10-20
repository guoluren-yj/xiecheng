import React, { useEffect, useCallback } from 'react';
import { Tree } from 'choerodon-ui/pro';
// import axios from 'axios';
// import { SRM_MALL } from '_utils/config';
import { getResponse } from 'utils/utils';

import { fetchAddressList } from '@/services/ecAddressManageService';

function TreeList(props) {
  useEffect(() => {
    props.treeDS.loadData(props.allList);
  }, [props.allList, props.isLoad]);

  const handleSelect = (selectedKeys, e) => {
    const { record } = e.node;
    if (record.get('countryFlag')) {
      props.fetchList({ countryId: record.get('countryId') }, record);
    } else {
      props.fetchList({ regionCode: record.get('regionCode') }, record);
    }
  };

  const handleLoadData = useCallback(
    (record) => {
      const { key, children } = record;
      return new Promise(async (resolve) => {
        if (!children) {
          const res = getResponse(
            await fetchAddressList({ key, record, versionId: props.version })
          );
          const { content = [] } = res;
          content.forEach((i) => {
            if (i.regionLevel === 1) {
              // eslint-disable-next-line no-param-reassign
              i.parentRegionCode = i.countryId;
            }
          });
          props.treeDS.appendData(content, record);
          resolve();
          // axios
          //   .get(
          //     `${SRM_MALL}/v1/mall-regions/Subordinate?versionId=${props?.version}${
          //       record?.record.get('countryFlag') ? '' : `&regionCode=${key}`
          //     }`
          //   )
          //   .then((res) => {
          //     const { content = [] } = res;
          //     content.forEach((i) => {
          //       if (i.regionLevel === 1) {
          //         // eslint-disable-next-line no-param-reassign
          //         i.parentRegionCode = i.countryId;
          //       }
          //     });
          //     props.treeDS.appendData(content, record);
          //     resolve();
          //   })
          //   .catch(() => {
          //     resolve();
          //   });
        } else {
          resolve();
        }
      });
    },
    [props.version]
  );

  function nodeCover({ record }) {
    const nodeProps = {
      title: record.get('regionName'),
      key: record.get('regionCode'),
    };
    if (record.get('regionLevel') === 3) {
      nodeProps.isLeaf = true;
    }
    return nodeProps;
  }

  return (
    <Tree
      dataSet={props.treeDS}
      loadData={handleLoadData}
      treeNodeRenderer={nodeCover}
      showLine={{ showLeafIcon: false }}
      onSelect={handleSelect}
    />
  );
}

export default TreeList;
