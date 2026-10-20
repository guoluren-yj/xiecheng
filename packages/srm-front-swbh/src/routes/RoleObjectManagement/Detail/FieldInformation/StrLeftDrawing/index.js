/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-01 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useState, useImperativeHandle, useEffect, useContext, useRef } from 'react';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { Spin } from 'choerodon-ui';
import { Switch } from 'choerodon-ui/pro';
import { omit } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';

import { getRoleBOList } from '@/services/roleObjectService';
import ImgIcon from '../../../../components/utils/ImgIcon';

import { Store } from '../index';
import TreeShow from './TreeShow';
import styles from './index.less';

const Index = ({ leftObjectRef }) => {
  const treeShowRef = useRef();
  const { combineId, store } = useContext(Store);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  useImperativeHandle(leftObjectRef, () => ({
    init,
  }));

  // 初始化
  const init = () => {
    setLoading(true);
    getRoleBOList({ combineId }).then((res) => {
      if (getResponse(res)) {
        const treeData = filterRoleObject(res);
        setDataSource([treeData]);
        setLoading(false);
        store.setItem('leftNoFieldsTree', filterRoleObjectWithNoField(treeData)); // 设置选中模型父对象列表
        /* eslint-disable no-unused-expressions */
        treeShowRef.current?.handleSelectSource({ element: res, init: true });
      } else {
        setLoading(true);
      }
    });
  };

  // 无子节点且无字段的业务对象过滤掉，不展示
  const filterRoleObject = (businessObject) => {
    if (!businessObject) {
      return {};
    }
    const _filterFunc = (list) => {
      // 无子节点且无字段的业务对象
      if (
        list.relateType !== 'MASTER' &&
        !list.businessObjectRelationList &&
        (!list.businessObjectRelationFieldList || list.businessObjectRelationFieldList.length === 0)
      ) {
        return null;
      } else if (list.businessObjectRelationList) {
        // eslint-disable-next-line no-param-reassign
        list.businessObjectRelationList = list.businessObjectRelationList
          .map((item) => _filterFunc(item))
          .filter(Boolean);
      }
      return list;
    };
    // eslint-disable-next-line no-param-reassign
    businessObject = _filterFunc(businessObject);

    return businessObject;
  };

  // 过滤掉接口返回的businessObjectRelationFieldList
  const filterRoleObjectWithNoField = (businessObject) => {
    if (!businessObject) {
      return {};
    }
    const _filterFunc = (bo) => {
      if (!bo) {
        return {};
      }
      const newBo = omit(bo, ['businessObjectRelationFieldList']);
      if (bo.businessObjectRelationList && bo.businessObjectRelationList.length > 0) {
        newBo.businessObjectRelationList = newBo.businessObjectRelationList.map((item) => _filterFunc(item));
      }
      return newBo;
    };
    // eslint-disable-next-line no-param-reassign
    businessObject = _filterFunc(businessObject);

    return businessObject;
  };

  useEffect(() => {
    init();
  }, []);

  const treeShowProps = {
    dataSource,
    models: {
      label: 'businessObjectCombineName',
      value: 'businessObjectId',
      label2: 'referenceTableName',
    },
    treeShowRef,
  };

  const handelSwitchChange = (value) => {
    // setIgnoreRelateFlag(!value);
    return init(!value);
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['left-wrapper']}>
        <div className={styles['left-tips']}>
          <span className={styles['relation-ship']}>
            <span>{intl.get('swbh.roManagement.fieldInfo.view.message.showRelation').d('显示关联关系')}</span>
            <Switch onChange={handelSwitchChange} />
          </span>
          <div className={styles['tips-wrapper']}>
            <div className={styles['tips-1-1']}>
              <ImgIcon name="onetoone.svg" size={27} style={{ width: 27, height: 11, marginRight: 6 }} />
              <span>1 - 1</span>
            </div>
            <span style={{ color: '#D8D8D8' }}>|</span>
            <div className={styles['tips-1-n']}>
              <ImgIcon name="oneton.svg" size={27} style={{ width: 27, height: 11, marginRight: 6 }} />
              <span>1 - N</span>
            </div>
          </div>
        </div>
        <div className={styles['tip-text']}>
          {intl.get('swbh.roManagement.fieldInfo.view.message.showRelation.help').d('査看单据对象详情信息。')}
        </div>
        <TreeShow {...treeShowProps} />
      </div>
    </Spin>
  );
};
export default Index;
