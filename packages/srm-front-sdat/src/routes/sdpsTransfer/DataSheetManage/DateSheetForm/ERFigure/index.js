import React, { useRef, useState, useEffect } from 'react';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { Select } from 'choerodon-ui/pro';
import { SRM_DATA_SDAT } from '@/utils/config';
import {
  getCombinationBOList,
  fetchPlatformBatchColumns,
} from '@/services/sdpsTransfer/businessObjectService';

import ERDiagram from './ERDiagram';
import style from './index.less';

const { Option } = Select;

const ERFigure = (props) => {
  const { localRecord = null, refreshKey = '' } = props;
  const [loading, setLoading] = useState(false);
  const [erDiagramProps, setErDiagramProps] = useState({});
  const [selectList, setSelectList] = useState([]); // 选择列表
  const [selectValue, setSelectValue] = useState('');
  const cacheRef = useRef({
    dataObjMap: {},
  });

  const getBOIdUrl = `${SRM_DATA_SDAT}/v1/meta-table/map-relation`;

  const clear = () => {
    setLoading(false);
    setSelectValue('');
    setSelectList([]);
    setErDiagramProps({});
  };

  /**
   * 处理请求数据 组装结构
   * @param {*} tables 表列表
   * @param {*} columns 表对应的所有字段列表
   */
  const getDataObj = (combineCode) => {
    const { dataObjMap } = cacheRef.current;
    if (dataObjMap[combineCode]) {
      return Promise.resolve();
    }
    setLoading(true);
    return getCombinationBOList({
      tableName: localRecord?.tableName,
      url: getBOIdUrl,
      combineCode,
    })
      .then((res) => {
        if (getResponse(res) && res && res.length) {
          const tables = getAllTables(res);
          return fetchPlatformBatchColumns(tables)
            .then((columns) => {
              if (getResponse(columns) && columns.length) {
                // 所有字段列表
                formatColumns(res, columns);
              } else {
                setLoading(false);
              }
            })
            .catch(() => {
              setLoading(false);
            });
        } else {
          clear();
        }
      })
      .catch(() => {
        clear();
      });
  };

  /**
   * 获取所有的表名
   */
  const getAllTables = (data = []) => {
    const tableNames = [];

    const loop = (arr) => {
      if (arr.length) {
        arr.forEach((item) => {
          if (item?.dstTable) {
            tableNames.push(item.dstTable);
          }
          if (item?.businessObjectRelationList?.length) {
            loop(item?.businessObjectRelationList);
          }
        });
      }
    };

    loop(data);

    return tableNames;
  };

  /**
   * 处理请求数据 组装结构
   * @param {*} tables 表列表
   * @param {*} columns 表对应的所有字段列表
   */
  const formatColumns = (tables = [], columns = []) => {
    const { dataObjMap } = cacheRef.current;
    const allTables = [...tables];

    const getTableColumns = (tableName) => {
      const filterList = columns.length
        ? columns.filter((item) => item?.tableName === tableName)
        : [];
      return tableName && filterList && filterList.length ? filterList[0] : {};
    };

    const loop = (arr = []) => {
      if (arr.length) {
        arr.forEach((record) => {
          const { filedList = [], fieldTotal = 0 } = getTableColumns(record?.dstTable);

          const relBusinessObjectPrimaryKeyCode =
            filedList.find((item) => {
              return item.primaryKey;
            })?.columnName ?? '';

          const contentWithoutPrimaryKey = filedList.filter((item) => {
            return !item.primaryKey;
          });

          const businessObjectRelationFieldList = new Array(fieldTotal <= 0 ? 0 : fieldTotal - 1)
            .fill(0)
            .map((_, index) => {
              return {
                businessObjectFieldCode:
                  index >= contentWithoutPrimaryKey.length
                    ? 'default'
                    : contentWithoutPrimaryKey[index]?.columnName ?? '',
              };
            });

          Object.assign(record, {
            businessObjectRelationFieldList,
            relBusinessObjectPrimaryKeyCode,
          });

          if (record.businessObjectRelationList && record.businessObjectRelationList.length) {
            loop(record.businessObjectRelationList);
          }
        });
      }
    };
    loop(allTables);
    allTables.forEach((table) => {
      dataObjMap[table.businessObjectCode] = table;
    });
    setLoading(false);
  };

  const onSelectChange = (txt, _selectList) => {
    setSelectValue(txt);
    if (!txt) return setErDiagramProps({});
    const { dataObjMap } = cacheRef.current;
    const list = _selectList || selectList;
    const selectItem = list?.find((item) => item?.businessObjectName === txt) || {};
    getDataObj(selectItem.businessObjectCode).then(() => {
      setErDiagramProps(dataObjMap[selectItem.businessObjectCode] || {});
    });
  };

  useEffect(() => {
    // initRefresh(refreshMap);
    if (localRecord?.tableName && refreshKey === '5') {
      setLoading(true);
      cacheRef.current.dataObjMap = {};
      // 根据tableName调用接口获取businessObjectId
      getCombinationBOList({
        tableName: localRecord?.tableName,
        url: getBOIdUrl,
        onlyCombineListFlag: true,
      })
        .then((res) => {
          if (getResponse(res) && res && res.length) {
            setSelectList(res);
            onSelectChange(res[0].businessObjectName, res);
          } else {
            clear();
          }
        })
        .catch(() => {
          clear();
        });
    }
  }, [localRecord?.tableName, refreshKey]);

  return (
    <Spin spinning={loading}>
      <ERDiagram dataObj={erDiagramProps} {...props} />
      <Select
        value={selectValue}
        style={{ position: 'absolute', top: '16px', left: '16px' }}
        placeholder={
          selectList?.length === 0 &&
          intl.get('sdps.dataSheet.view.placeholder.noResult').d('无匹配结果')
        }
        onChange={(txt) => {
          onSelectChange(txt);
        }}
      >
        {(selectList || [])?.map((item) => {
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
