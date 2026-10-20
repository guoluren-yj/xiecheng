/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useContext, useEffect, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { Row, Col } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import notification from 'utils/notification';
import { querySourceDetailService } from '@/services/modelDataSourceService';
import StrRightFrom from './StrRightFrom';
import StrLeftDrawing from '../EditSource/FirstStep/StrLeftDrawing';
import { mapTree } from '@/utils/treeUtils';

import styles from '../index.less';

export default observer(() => {
  const {
    ref: { seeSourceRef },
    setDataObject,
    setDataObjectTreeData,
    dataObject: { dataObjectDetail },
    dataObjectTreeDataToJs,
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store; // fixme
  const [loading, setLoading] = useState<boolean>(false);
  const [rightFormData, setRightFormData] = useState<model.data.DataObjectModel>(
    dataObjectTreeDataToJs.masterModel
  );
  // store.getJSONData;
  const handleClickItem = (data: model.data.DataObjectModel) => {
    setRightFormData(data);
  };
  // 数据查询
  useEffect(() => {
    if (dataObjectDetail.dataObjectId) {
      seeSourceQuery(dataObjectDetail.dataObjectId, dataObjectDetail.isPublished);
    }
  }, [dataObjectDetail.dataObjectId]);

  useImperativeHandle(seeSourceRef, () => ({
    seeSourceQuery,
  }));

  // 查询数据对象
  interface ISeeSourceQueryParams {
    (dataObjectId: number | string, publishFlag: boolean): void;
  }
  const seeSourceQuery: ISeeSourceQueryParams = async (dataObjectId) => {
    setLoading(true);
    if (dataObjectId) {
      const res: model.data.DataObject = await querySourceDetailService({
        query: { dataObjectId },
      });
      if (res && (res as any).failed) {
        // 错误
        notification.error({
          message: '警告',
          description: (res as any).message,
        });
        return false;
      }
      if (isEmpty(res)) {
        return;
      }
      const masterModel = mapTree([res.masterModel], (item) => ({
        ...item,
        treeModelKey: item.dataModelId,
        treeParentModelKey: item.parentId,
      }));
      setDataObject('refDataSourceType', res ? res?.masterModel?.referenceDataSourceType : ''); // 编辑时设置数据库类型
      setRightFormData(masterModel[0]);
      setDataObjectTreeData({ ...res, masterModel: masterModel[0] });
    }
    setLoading(false);
  };

  const dataListProps = {
    dataList: dataObjectTreeDataToJs,
    setDataList: () => {},
    handleClickItem,
    setRightFormData,
  };

  return (
    <Spin spinning={loading}>
      <article
        style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '0 16px' }}
      >
        {dataObjectTreeDataToJs.masterModel && (
          <>
            <Row className={styles['see-source-content']}>
              <Col span={8}>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                  }}
                >
                  模型关系启用图
                </h3>
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    marginLeft: '-10px',
                    marginTop: '-10px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
                <StrLeftDrawing {...dataListProps} />
              </Col>
              <Col span={16}>
                <div className={styles['see-source-right']}>
                  <h3>可用数据范围</h3>
                  <StrRightFrom dataList={dataObjectTreeDataToJs} rightFormData={rightFormData} />
                </div>
              </Col>
            </Row>
          </>
        )}
      </article>
    </Spin>
  );
});
