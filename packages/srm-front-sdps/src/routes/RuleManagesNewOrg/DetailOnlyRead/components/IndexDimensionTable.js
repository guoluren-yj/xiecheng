/**
 * 规则配置详情 - 指标维度弹窗的表格（租户级）（只读）
 * @date: 2021-12-23
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useState, useEffect } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const { Column } = Table;

let recordIndex = 0;

export default function IndexDimensionTable(props = {}) {
  const { tableDs, dataSet, defaultIndex, onPrev = () => {}, onNext = () => {} } = props;

  const [prevCanClick, setPrevCanClick] = useState(false);
  const [nextCanClick, setNextCanClick] = useState(false);

  useEffect(() => {
    recordIndex = defaultIndex || 0;

    if (!defaultIndex) {
      setPrevCanClick(true);
      setNextCanClick(true);
    }

    if (defaultIndex === 0) {
      setPrevCanClick(true);
    }

    if (dataSet && dataSet.length && defaultIndex === dataSet.length - 1) {
      setNextCanClick(true);
    }
  }, [defaultIndex]);

  useEffect(() => {
    return () => {
      recordIndex = 0;
    };
  }, []);

  const handleClose = () => {
    if (props && props.modal && props.modal.close) {
      props.modal.close();
    }
  };

  const handlePrev = () => {
    const indexNum = recordIndex <= 0 ? 0 : recordIndex - 1;
    const dataItem = dataSet.get(indexNum);

    dataSet.select(indexNum);
    onPrev(dataItem);
    recordIndex = dataItem.index || 0;

    setNextCanClick(false);
    if (indexNum <= 0) {
      setPrevCanClick(true);
    } else {
      setPrevCanClick(false);
    }
  };

  const handleNext = () => {
    const indexNum = recordIndex >= dataSet.length - 1 ? dataSet.length - 1 : recordIndex + 1;
    const dataItem = dataSet.get(indexNum);

    dataSet.select(indexNum);
    onNext(dataItem);
    recordIndex = dataItem.index || 0;

    setPrevCanClick(false);

    if (indexNum >= dataSet.length - 1) {
      setNextCanClick(true);
    } else {
      setNextCanClick(false);
    }
  };

  return (
    <>
      <Table dataSet={tableDs}>
        <Column name="parameterKey" width={150} />
        <Column name="parameterName" width={150} />
        <Column name="dataType" />
      </Table>
      <div style={{ position: 'fixed', bottom: '10px' }}>
        <Button color="primary" onClick={handleClose}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
        {dataSet ? (
          <>
            <Button disabled={prevCanClick} onClick={() => handlePrev(dataSet)}>
              {intl.get('sdps.ruleManagesDetail.view.button.prevPage').d('上一页')}
            </Button>
            <Button disabled={nextCanClick} onClick={() => handleNext(dataSet)}>
              {intl.get('sdps.ruleManagesDetail.view.button.nextPage').d('下一页')}
            </Button>
          </>
        ) : null}
      </div>
    </>
  );
}
