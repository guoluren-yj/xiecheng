import React, { useState, useEffect } from 'react';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { Select } from 'choerodon-ui/pro';
import ERDiagram from './ERDiagram';
import { getCombinationBOList } from '@/services/businessObjectService';
import style from './index.less';

const { Option } = Select;

const ERFigure = props => {
  const { localRecord = null, refreshKey = '' } = props;
  const [loading, setLoading] = useState(false);
  const [dataObjArr, setDataObjArr] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 默认第0个
  const [selectValue, setSelectValue] = useState('');

  const getBOIdUrl = `${SRM_DATA_PROCESS}/v1/${getCurrentOrganizationId()}/meta-table/map-relation`;
  const getColumnUrl = `${SRM_DATA_PROCESS}/v1/${getCurrentOrganizationId()}/meta-table/columns`;

  useEffect(() => {
    // initRefresh(refreshMap);
    if (localRecord?.tableName) {
      setLoading(true);
      // 根据tableName调用接口获取businessObjectId
      getCombinationBOList({
        tableName: localRecord?.tableName,
        url: getBOIdUrl,
      })
        .then(res => {
          if (getResponse(res)) {
            // 每一个项都要调接口查询
            const promiseArr = [];
            for (let i = 0; i < res.length; i++) {
              queryColumns(res.length > 0 ? res[i] : {}, promiseArr);
            }
            Promise.all(promiseArr)
              .then(() => {
                // 得到结果后存储对应的关系数组
                setDataObjArr(res ?? []);
                setCurrentIndex(0);
                setSelectValue(res[0]?.businessObjectName ?? '');
              })
              .finally(() => {
                setLoading(false);
              });
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [localRecord?.tableName, refreshKey]);

  /**
   * queryColumns: 递归查阅列对象
   * @param {*} obj
   * @param {*} promiseArr
   * @returns
   */
  const queryColumns = (obj = {}, promiseArr = []) => {
    // 为本元素查询对应的列
    promiseArr.push(
      getCombinationBOList({
        tableName: obj?.dstTable ?? '',
        url: getColumnUrl,
      }).then(res => {
        if (getResponse(res)) {
          // 取得数据总数和内容数组
          const { totalElements = 0, content = [] } = res ?? {};
          // 构造relBusinessObjectPrimaryKeyCode数据
          const relBusinessObjectPrimaryKeyCode =
            content.find(item => {
              return (item?.primaryFlag ?? 0) === 1;
            })?.name ?? '';

          const contentWithoutPrimaryKey = content.filter(item => {
            return (item?.primaryFlag ?? 0) !== 1;
          });

          // 构造businessObjectRelationFieldList数组
          const businessObjectRelationFieldList = new Array(
            totalElements <= 0 ? 0 : totalElements - 1
          )
            .fill(0)
            .map((_, index) => {
              return {
                businessObjectFieldCode:
                  index >= contentWithoutPrimaryKey.length
                    ? 'default'
                    : contentWithoutPrimaryKey[index]?.name ?? '',
              };
            });

          Object.assign(obj, { businessObjectRelationFieldList, relBusinessObjectPrimaryKeyCode });
        }
      })
    );
    // 结束条件： 没有子列表对象
    if ((obj?.businessObjectRelationList?.length ?? 0) === 0) return;
    (obj?.businessObjectRelationList ?? []).forEach(subObj => {
      queryColumns(subObj, promiseArr);
    });
  };

  const erDiagramProps = {
    dataObj: dataObjArr[currentIndex] ?? {},
  };

  return (
    <Spin spinning={loading}>
      <ERDiagram {...erDiagramProps} {...props} />
      <Select
        value={selectValue}
        style={{ position: 'absolute', top: '16px', left: '16px' }}
        placeholder={
          dataObjArr?.length === 0 &&
          intl.get('sdps.dataSheet.view.placeholder.noResult').d('无匹配结果')
        }
        onChange={txt => {
          setCurrentIndex(dataObjArr?.findIndex(i => (i?.businessObjectName ?? '') === txt));
          setSelectValue(txt);
        }}
      >
        {(dataObjArr || [])?.map(item => {
          return (
            <Option value={item?.businessObjectName ?? ''} key={item?.businessObjectName ?? ''}>
              {item?.businessObjectName ?? ''}
            </Option>
          );
        })}
      </Select>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <div className={style['icon-box']}>
          <div className={style['icon-primary-key']} />
          {intl.get('sdps.dataSheet.view.erDiagram.primaryKey').d('主键')}
        </div>
        <div className={style['icon-box']}>
          <div className={style['icon-one-to-many']} />
          {intl.get('sdps.dataSheet.view.erDiagram.oneToMany').d('一对多')}
        </div>
      </div>
    </Spin>
  );
};
export default ERFigure;
