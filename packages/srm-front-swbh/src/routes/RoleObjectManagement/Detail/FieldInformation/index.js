/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-01 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useRef, createContext, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SectionTitle from '../../../components/SectionTitle';
import StrLeftDrawing from './StrLeftDrawing';
import RightFieldTable from './RightFieldTable';
import styles from './index.less';

const store = {
  // 存所有结构性组件下保存的数据对象
  dataMap: new Map(),
  getItem: (key) => store.dataMap.get(key),
  setItem: (key, value) => {
    store.dataMap.set(key, value);
  },
  delete: (key) => {
    store.dataMap.delete(key);
  },
};
export const Store = createContext({});
const Index = ({ combineName, history, combineId, tableDs }) => {
  const [loading, setLoading] = useState(false);
  const leftObjectRef = useRef();
  const rightFieldsRef = useRef();
  const strLeftDrawingProps = {
    leftObjectRef,
  };

  const rightFieldTable = {
    rightFieldsRef,
  };

  const value = {
    store,
    history,
    setLoading,
    leftObjectRef,
    rightFieldsRef,
    tableDs,
    combineId,
  };

  return (
    <div className={styles['field-info']}>
      <SectionTitle title={combineName} />
      <Store.Provider value={value}>
        <Spin spinning={loading}>
          <Row className={styles['c7n-row']} gutter={10}>
            <Col className={styles['col-8']} span={8}>
              <StrLeftDrawing {...strLeftDrawingProps} />
            </Col>
            <Col className={styles['col-16']} span={16}>
              <RightFieldTable {...rightFieldTable} />
            </Col>
          </Row>
        </Spin>
      </Store.Provider>
    </div>
  );
};
export default formatterCollections({
  code: ['swbh.roManagement', 'swbh.common', 'hzero.common'],
})(Index);
