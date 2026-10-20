import React, { useRef, createContext, useState, useImperativeHandle, useMemo } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
// import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import SectionTitle from '@/businessComponents/SectionTitle';

import StrLeftDrawing from './StrLeftDrawing';
import RightFieldTable from './RightFieldTable';
import styles from './index.less';

const store = {
  // 存所有结构性组件下保存的数据对象
  dataMap: new Map(),
  getItem: key => store.dataMap.get(key),
  setItem: (key, value) => {
    store.dataMap.set(key, value);
  },
  delete: key => {
    store.dataMap.delete(key);
  },
};
export const Store = createContext({} as any);
const Index = ({
  businessObjectName,
  history,
  businessObjectCombineId,
  boCompositionDS,
  fieldInfoRef,
  allowEdit,
  // masterBusinessObjectId,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const leftObjectRef: any = useRef();
  const rightFieldsRef: any = useRef();

  const strLeftDrawingProps = {
    leftObjectRef,
    boCompositionDS,
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
    boCompositionDS,
    businessObjectCombineId,
    allowEdit,
  };

  useImperativeHandle(fieldInfoRef, () => ({
    rightFieldsRef,
  }));
  return (
    <div className={styles['field-info']}>
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
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common'],
})(Index);
