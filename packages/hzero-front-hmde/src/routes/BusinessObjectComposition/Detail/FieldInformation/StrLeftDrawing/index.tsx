/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import React, { useState, useImperativeHandle, useEffect, useContext, useRef } from 'react';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { Spin } from 'choerodon-ui';
import { Switch } from 'choerodon-ui/pro';
import { omit } from 'lodash';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';

import ImgIcon from '@/utils/ImgIcon';
import { getCombinationBOList } from '@/services/businessObjectService';

import { Store } from '../index';
import TreeShow from './TreeShow';
import styles from './index.less';

const Index = ({ leftObjectRef }) => {
  const treeShowRef: any = useRef();
  const { businessObjectCombineId, store } = useContext(Store);
  const [dataSource, setDataSource] = useState<boModel.combine.IBusinessObject[]>([] as any);
  const [loading, setLoading] = useState<boolean>(false);
  const [ignoreRelateFlag, setIgnoreRelateFlag] = useState<boolean>(true);

  useImperativeHandle(leftObjectRef, () => ({
    init,
  }));

  // 初始化
  const init = (params = { ignoreRelateFlag }, initSelected = true) => {
    const query = { ...params, includeFieldFlag: true };
    setLoading(true);
    getCombinationBOList({ businessObjectId: businessObjectCombineId, query }).then(res => {
      if (getResponse(res)) {
        const treeData = filterBusinessObject(res);
        setDataSource([treeData]);
        setLoading(false);
        store.setItem('leftNoFieldsTree', filterBusinessObjectWithNoField(treeData)); // 设置选中模型父对象列表
        if (initSelected) {
          treeShowRef.current?.handleSelectSource({ element: res, init: true });
        } else {
          treeShowRef.current?.handleSelectSource({
            element: {
              businessObjectRelationId: store.getItem('record')?.businessObjectRelationId,
            },
            init: true,
            findElement: true,
          });
        }
        // treeShowRef.current?.setActiveCell(`${res?.relBusinessObjectId}`);
        // store.setItem('selectedBusinessObject', res); // 设置选中模型对象
      } else {
        setLoading(true);
      }
    });
  };

  // 无子节点且无字段的业务对象过滤掉，不展示
  const filterBusinessObject = (businessObject: boModel.combine.IBusinessObject) => {
    if (!businessObject) {
      return {} as boModel.combine.IBusinessObject;
    }
    const _filterFunc = list => {
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
          .map(item => _filterFunc(item))
          .filter(Boolean);
      }
      return list;
    };
    // eslint-disable-next-line no-param-reassign
    businessObject = _filterFunc(businessObject);

    return businessObject;
  };

  // 过滤掉接口返回的businessObjectRelationFieldList
  const filterBusinessObjectWithNoField = businessObject => {
    if (!businessObject) {
      return {};
    }
    const _filterFunc = bo => {
      if (!bo) {
        return {};
      }
      const newBo = omit(bo, ['businessObjectRelationFieldList']);
      if (bo.businessObjectRelationList && bo.businessObjectRelationList.length > 0) {
        newBo.businessObjectRelationList = newBo.businessObjectRelationList.map(item =>
          _filterFunc(item)
        );
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

  const handelSwitchChange = value => {
    setIgnoreRelateFlag(!value);
    return init({ ignoreRelateFlag: !value });
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['left-wrapper']}>
        <div className={styles['left-tips']}>
          <span className={styles['relation-ship']}>
            <span>
              {intl.get('hmde.boComposition.fieldInfo.view.message.showRelation').d('显示关联关系')}
            </span>
            <Switch checked={!ignoreRelateFlag} onChange={handelSwitchChange} />
          </span>
          <div className={styles['tips-wrapper']}>
            <div className={styles['tips-1-1']}>
              <ImgIcon
                name="onetoone.svg"
                size={27}
                style={{ width: 27, height: 11, marginRight: 6 }}
              />
              <span>1 - 1</span>
            </div>
            <span style={{ color: '#D8D8D8' }}>|</span>
            <div className={styles['tips-1-n']}>
              <ImgIcon
                name="oneton.svg"
                size={27}
                style={{ width: 27, height: 11, marginRight: 6 }}
              />
              <span>1 - N</span>
            </div>
          </div>
        </div>
        <div className={styles['tip-text']}>
          {intl
            .get('hmde.boComposition.fieldInfo.view.message.showRelation.help')
            .d('如需査看单个业务对象详情信息，可点击卡片跳转。')}
        </div>
        <TreeShow {...treeShowProps} />
      </div>
    </Spin>
  );
};
export default formatterCollections({ code: ['hmde.boComposition'] })(Index);
