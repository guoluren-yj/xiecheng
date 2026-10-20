/**
 * 比较模式
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import DiffViewer from 'react-diff-viewer';
import { isEmpty } from 'lodash';
import { contractCompare } from '@/services/workspaceService';
import { getResponse } from 'utils/utils';
import styles from '../index.less';

export default function CompareMode(props) {
  const { isEditMode, compareInfo } = props;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  useEffect(() => {
    if (compareInfo) {
      fetchContractComparison();
    }
  }, [compareInfo]);

  // 获取对比信息
  const fetchContractComparison = useCallback(() => {
    setLoading(true);
    contractCompare(compareInfo)
      .then((response) => {
        const res = getResponse(response);
        if (res) {
          setList([...res]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [compareInfo]);

  const handleGetContent = (position) => {
    if (!isEmpty(list)) {
      return position === 'left' ? list[0].content : list[1].content;
    }
  };

  const diffViewerProps = {
    oldValue: handleGetContent('left'),
    newValue: handleGetContent('right'),
    showDiffOnly: false,
  };

  return (
    // <Spin spinning={loading}>
    <Row
      className={styles.compareMode}
      style={{
        //  minHeight: 'calc(100% - 130px)',
        display: !isEditMode ? 'block' : 'none',
      }}
    >
      <Spin spinning={loading}>
        <Col style={{ height: 'calc(100vh - 265px)', overflowY: 'scroll' }}>
          <DiffViewer {...diffViewerProps} />
        </Col>
      </Spin>
    </Row>
    // </Spin>
  );
}
