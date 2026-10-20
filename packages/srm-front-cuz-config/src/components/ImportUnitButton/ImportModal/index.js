import React, { useState, useCallback, useMemo, useEffect } from 'react';
import classnames from 'classnames';
import { Icon } from 'choerodon-ui';

import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse } from 'hzero-front/lib/utils/utils';
import styles from '../index.less';
import ImportHistory from './ImportHistory';
import ImportFieldDetail from './ImportFieldDetail';

const ImportModal = ({ groupCode, unitCode, isSearchBarUnit }) => {
  const [fieldList, setFieldList] = useState([]);
  const [filterLogList, setFilterLogList] = useState([]);
  const [custTypeObj, setCustTypeObj] = useState({});
  useEffect(()=>{
    queryMapIdpValue({
      custType: 'HPFM.CUST.FIELD_CUST_TYPE',
    }).then(res => {
      if(getResponse(res)){
        const _custTypeObj = {};
        res.custType.forEach(i => {
          _custTypeObj[i.value] = i.meaning;
        });
        setCustTypeObj(_custTypeObj);
      }
    });
  }, []);
  const [headerId, setHeaderId] = useState(null);
  const [collpaseLeft, setCollpaseLeft] = useState(false);
  const containerLeftCls = useMemo(
    () =>
      classnames(styles['container-left'], { [styles['container-left-collpase']]: collpaseLeft }),
    [collpaseLeft]
  );

  const setLinesData = useCallback(lineData => {
    if (lineData.id) {
      // 第一次先清空headerId保证右侧区域重新渲染
      setTimeout(() => setHeaderId(null));
      setTimeout(() => setHeaderId(lineData.id));
    }
    if (lineData && lineData.logLineList && lineData.logLineList.content) {
      setFieldList(lineData.logLineList.content[0].cnfLogList || []);
      setFilterLogList(lineData.logLineList.content[0].filterLogList || []);
    }
  }, []);

  const handleCollpaseLeft = () => setCollpaseLeft(!collpaseLeft);
  return (
    <div className={styles.container}>
      <div className={containerLeftCls}>
        {/* {!collpaseLeft && (
          <div className={styles['collapse-icon']}>
            <Icon type="baseline-arrow_left" onClick={handleCollpaseLeft} />
          </div>
        )} */}
        <ImportHistory groupCode={groupCode} unitCode={unitCode} setLinesData={setLinesData} />
      </div>
      <div className={styles['container-right']}>
        {collpaseLeft && (
          <div className={styles['collapse-icon']}>
            <Icon type="baseline-arrow_right" onClick={handleCollpaseLeft} />
          </div>
        )}
        {headerId && (
          <ImportFieldDetail
            fieldList={fieldList}
            filterLogList={filterLogList}
            custTypeObj={custTypeObj}
            isSearchBarUnit={isSearchBarUnit}
          />
        )}
      </div>
    </div>
  );
};

export default ImportModal;
