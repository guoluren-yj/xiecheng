import React, { useEffect, useCallback, useMemo } from 'react';
import { Tree } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";

const TplTree = ({ treeDs, onCheck, filterStr }) => {

  useEffect(() => {
    fetchData();
  }, []);
  const cacheSearchParent = useMemo(() => {
    const cache = {};
    if (!filterStr) return cache;
    const filterReg = new RegExp(filterStr);
    treeDs.records.forEach(record => {
      const path = record.path.slice(0, record.path.length - 1);
      const match = filterReg.test(record.get("nodeName")) || filterReg.test(record.get("nodeKey")) || filterReg.test(record.get("templateCode"));
      if (match) {
        cache[record.id] = 2;
        path.forEach(r => {
          if ((cache[r.id] || 0) < 2) cache[r.id] = 1;
        });
      }
    });
    return cache;
  }, [filterStr]);
  const filter = useCallback((record) => {
    if (!filterStr) return true;
    const path = record.path.slice(0, record.path.length - 1);
    if ((cacheSearchParent[record.id] || 0) > 0) return true;
    if (path.length > 0 && path.some(r => cacheSearchParent[r.id] === 2)) {
      return true;
    }
    return false;
  }, [filterStr]);

  const fetchData = () => {
    // eslint-disable-next-line no-param-reassign
    treeDs.status = 'loading';
    axios.post(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/doc-templates/docs-all`).then(res => {
      if (getResponse(res)) {
        const data = res.map(r=>({
          nodeKey: r.docCode,
          nodeName: r.docName,
          type: 'doc',
          children: (r.docTemplateList || []).map(t=>({
            nodeKey: t.templateId,
            nodeName: t.templateName,
            templateCode: t.templateCode,
            templateVersion: t.templateVersion,
            type: 'tpl',
          })),
        }));
        // eslint-disable-next-line no-param-reassign
        treeDs.status = 'ready';
        treeDs.loadData(data);
      }
    });
  };

  const nodeRenderer = useCallback(
    ({ record }) => (
      <div>
        <div className="tree-unit-name">{record.get('nodeName')}</div>
        {record.get('type') === 'tpl' && <div className="tree-unit-code">{record.get('templateCode')}</div>}
      </div>
    ),
    []
  );

  return (
    <Tree
      showLine={{ showLeafIcon: false }}
      checkable
      dataSet={treeDs}
      renderer={nodeRenderer}
      onCheck={onCheck}
      filter={filter}
    />
  );
};

export default TplTree;
