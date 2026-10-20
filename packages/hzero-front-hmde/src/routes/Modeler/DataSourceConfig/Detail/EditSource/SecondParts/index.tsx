/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useContext,
  useRef,
} from 'react';
import { DataSet, Icon } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { runInAction, reaction } from 'mobx';
import { isEmpty } from 'lodash';
import uuid from 'uuid/v4';
import { observer } from 'mobx-react-lite';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import { treeToArr, toTree } from '@/utils/treeUtils';
import { mapToSecondData, resolveConflict } from '@/routes/Modeler/DataSourceConfig/utils/utils';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { querySourceFieldsService } from '@/services/modelDataSourceService';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';

import SecondPartsDS from './store/SecondPartsDS';
import SecondPartsTable from './SecondPartsTable';
import styles from './index.less';

interface IIndex {
  step?: number;
  dataList: model.data.BaseDataObject;
  setDataList: (data: any) => void;
}
const Index = observer(({ step, dataList, setDataList = () => {} }: IIndex) => {
  const {
    dataObject: {
      level,
      dataObjectDetailType,
      dataObjectDetail: { extendsParentName },
    },
    ref: { secondStepRef },
    setSecondLeftData,
    setSecondRightData,
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
  const leftCompleteData: any = useRef([]); // 穿梭框左侧搜索过滤前的完整数据
  const rightCompleteData: any = useRef([]); // 穿梭框右侧搜索过滤前的完整数据
  const leftParam: any = useRef(null); // 左侧搜索框的参数
  const rightParam: any = useRef(null); // 右侧搜索框的参数
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const leftSecondPartsDS: DataSet = useMemo(() => {
    const otherFiels: object[] = [];
    if (level === 'platform') {
      otherFiels.push({
        name: 'subCanAddFlag',
        type: 'boolean',
        defaultValue: false,
        trueValue: 1,
        falseValue: 0,
        label: '是否允许租户分配',
      });
    }
    return new DataSet(SecondPartsDS('left', 'multiple', leftCompleteData, otherFiels));
  }, []);
  const rightSecondPartsDS: DataSet = useMemo(
    () =>
      new DataSet(SecondPartsDS('right', 'multiple', rightCompleteData, [], level === 'tenant')),
    []
  );
  useImperativeHandle(secondStepRef, () => ({
    handleSaveSecond, // 保存当前数据
  }));
  // 提取数据
  const handleSaveSecond = async () => {
    if (tableLoading) return;
    const val = await rightSecondPartsDS.validate();
    const data = rightSecondPartsDS.toData();
    if (val) {
      const leftData = leftCompleteData.current;
      const rightData = rightCompleteData.current;
      setSecondLeftData(leftData as model.data.BaseDataObjectField[]);
      setSecondRightData(rightData as model.data.BaseDataObjectField[]);
      let [dataListArr, _dataList] = [[], []];
      if (!isEmpty(data)) {
        dataListArr = toTree(data, 'secCode', 'secParentCode', 'fields'); // 将字段转为树结构
        _dataList = toTree(dataListArr, 'treeModelKey', 'treeParentModelKey'); // 将模型转为树结构

        // 修改获取租户可自定义的字段，修改结构
        const { dataModelFieldControlList = [] } = dataList;
        const newDataModelFieldControlList = assembleDataModelFieldControlList(
          leftData,
          rightData,
          dataModelFieldControlList
        );

        // dataListArr = generateModelFieldControlList(leftData, rightData, dataListArr);
        // _dataList = generateModelFieldControlList(leftData, rightData, _dataList);

        setDataList({
          ...dataList,
          masterModel: _dataList[0],
          dataModelFieldControlList: newDataModelFieldControlList,
        }); // 设置显示模式的值（树形）
        // 存放缓存数据
      } else if (!dataList.masterModel) {
        // @ts-ignore
        setDataList({ ...dataList, masterModel: { ...dataList.masterModel, fields: [] } });
      }
      return _dataList[0]; // 返回树状主模型
    }
    return null;
  };

  const assembleDataModelFieldControlList = (leftData, rightData, dataModelFieldControlList) => {
    let fieldList = [] as any;

    if (!isEmpty(leftData)) {
      const leftItems = leftData.filter(
        (item: any) => !item.modelFields && item.subCanAddFlag === 1
      );
      fieldList = fieldList.concat(
        leftItems.map((ele) => {
          const logicModelCode = leftData.find((i) => i.secCode && i.secCode === ele.secParentCode)
            ?.logicModelCode;
          return { ...ele, logicModelCode, modelFieldCode: ele.modelFieldCode || ele.code };
        })
      );
    }
    if (!isEmpty(rightData)) {
      const rightItems = rightData.filter((item: any) => !item.fields && item.subCanAddFlag === 1);
      fieldList = fieldList.concat(
        rightItems.map((ele) => {
          const logicModelCode = rightData.find((i) => i.secCode && i.secCode === ele.secParentCode)
            ?.logicModelCode;
          return { ...ele, logicModelCode, modelFieldCode: ele.modelFieldCode || ele.code };
        })
      );
    }
    if (!isEmpty(fieldList)) {
      const originFieldList = isEmpty(dataModelFieldControlList) ? dataModelFieldControlList : [];
      return originFieldList.concat(fieldList);
    }
    return dataModelFieldControlList;
  };

  // 初始化数据
  const init = async () => {
    // 切换创建第二步数据时 需重置ds
    // 打平数据
    if (!dataList.masterModel) return;
    let leftData: any[] = []; // 这个方法中变量会复用赋值 字段属性较多 暂时fixme
    let rightData: any[] = [];
    // 处理主字段和关联字段和who字段
    let newLeftData: any[] = [];
    const _dataArr = [...treeToArr([dataList.masterModel])];
    // 获取字段
    const _res: model.data.DataObjectFieldVO[] = await querySourceFieldsService({
      body: _dataArr,
      query: {
        extendsParentDataObjectCode: dataList?.extendsParentCode,
      },
    });
    if (_res && (_res as any).failed) {
      // 错误
      notification.error({
        message: '警告',
        description: (_res as any).message,
      });
    } else {
      // 左边数据
      // 拿到字段
      leftData = mapToSecondData(_res, 'modelFields');
    }
    // 从最外层取值 修改字段名称 dataSourceModelFieldControlList => dataModelFieldControlList
    const { dataModelFieldControlList = [] } = dataList;

    // 处理右边数据
    rightData = mapToSecondData(_dataArr, 'fields');
    rightData = rightData.filter((item) => item.fieldType !== 'VIRTUAL_FIELD');

    const map = new Map();
    rightData.forEach((item) => {
      map.set(item.secCode, item.secCode);
    });
    // 过滤左边数据
    // leftData = leftData.filter((item) => {
    //   // 过滤掉不用的属性
    //   if (
    //     item.secParentCode &&
    //     !(rightData || []).some((rightItem) => {
    //       // 右边存在左边就删除
    //       if (
    //         rightItem.fieldName === item.fieldName &&
    //         rightItem.secParentCode === item.secParentCode
    //       ) {
    //         Object.assign(rightItem, { relationKey: item.relationKey }); // 左边新数据给右边做一个覆盖
    //         return true;
    //       }
    //       return false;
    //     })
    //   ) {
    //     // 字段
    //     Object.assign(item, { tenantId: undefined }); // 新增或移动到可用字段的模型字段 需要传tenantId为当前租户Id或不传
    //     return true;
    //   }
    //   return !item.secParentCode && item.modelFields.length > 0;
    // });
    leftData = leftData.filter((item) => {
      if (item.secParentCode && !(map.get(item.secCode) === item.secCode)) {
        Object.assign(item, { tenantId: undefined }); // 新增或移动到可用字段的模型字段 需要传tenantId为当前租户Id或不传
        return true;
      }
      const index = rightData.findIndex(({ secCode }) => secCode === item.secCode);
      if (index) rightData[index].relationKey = item.relationKey;
      return !item.secParentCode && item.modelFields.length > 0;
    });

    leftData.forEach((item) => {
      if (
        item.primaryFlag === 1 ||
        item.relationKey === 1 ||
        isPresetField(item.aliasName, ['others', ['OBJECT_VERSION_NUMBER']])
      ) {
        rightData.push({ ...item, _status: 'create', tenantId: undefined });
      } else {
        newLeftData.push({ ...item, _status: 'create' });
      }
    });

    const masterModel = rightData.find((item) => item.masterFlag);
    rightData.forEach((item) => {
      // 自动解决冲突
      // 模型对象、主模型字段不参与解决冲突
      if (!item.fields && !item.modelFields && item?.secParentCode !== masterModel?.secCode) {
        resolveConflict(rightData, item);
      }
    });

    // 删除左边没有儿子的模型
    newLeftData = newLeftData.filter((item) => {
      if (
        !item.secParentCode &&
        !newLeftData.some((_item) => _item.secParentCode === item.secCode)
      ) {
        // 模型 && 没有儿子
        return false;
      }
      return true;
    });

    // 创建数据
    runInAction(() => {
      const rightItems: any[] = [];
      const leftItems: any[] = [];
      rightData.forEach((item) => {
        let code = uuid();
        code = code.replace(/[-]/g, '');
        if (item.fields) {
          rightItems.push(item);
        } else {
          rightItems.push({
            ...item,
            fieldType: 'MODEL_FIELD',
            fieldCode: item.fieldCode || code,
            modelFieldCode: item.modelFieldCode || item.code,
          });
        }
      });
      const rightOldData = rightSecondPartsDS.toData();
      let rightLoadData = [...rightOldData, ...rightItems];
      rightLoadData = setFieldItemFlag(rightLoadData, dataModelFieldControlList, 'right');
      // if (level === 'tenant') {
      // rightLoadData = rightLoadData.filter((item) => item.subCanAddFlag !== 1);
      // }
      rightCompleteData.current = rightLoadData; // 放一份初始化后的右侧缓存数据
      rightSecondPartsDS.loadData(rightLoadData);
      newLeftData.forEach((item) => {
        leftItems.push(item);
      });
      const leftOldData = leftSecondPartsDS.toData();
      let leftLoadData = [...leftOldData, ...leftItems];
      leftLoadData = setFieldItemFlag(leftLoadData, dataModelFieldControlList, 'left');
      if (
        level === 'tenant' &&
        ((extendsParentName && dataObjectDetailType === 'edit') ||
          dataObjectDetailType === 'inherit')
      ) {
        const children: any[] = leftLoadData.filter((c) => c.subCanAddFlag === 1);
        let parents: any[] = [];
        if (!isEmpty(children)) {
          parents = leftLoadData.filter((p) => {
            if (!isEmpty(p.fields)) {
              return p.fields.some((field) => children.find((child) => field.code === child.code));
            } else if (!isEmpty(p.modelFields)) {
              return p.modelFields.some((field) =>
                children.find((child) => field.code === child.code)
              );
            }
            return false;
          });
        }
        leftLoadData = parents.concat(children);
      }
      leftCompleteData.current = leftLoadData; // 放一份初始化后的左侧缓存数据
      leftSecondPartsDS.loadData(leftLoadData);
    });
    setTableLoading(false);
  };

  const setFieldItemFlag = (data, list, select = 'left') => {
    const getJudgeField = select === 'left' ? 'modelFields' : 'fields';
    if (isEmpty(list)) {
      return data;
    }
    return data.map((item) => {
      if (!item[getJudgeField]) {
        const target = list.find(
          (l) => (l.modelFieldCode || l.code) === (item.modelFieldCode || item.code)
        );
        if (target) {
          return {
            ...item,
            subCanAddFlag: 1,
          };
        }
      }
      return item;
    });
  };

  // 初始化
  useEffect(() => {
    setTableLoading(true);
    init();
  }, []);

  const [leftFlag, setLeftFlag] = useState<boolean>(false);
  const [rightFlag, setRightFlag] = useState<boolean>(false);

  // 选择时改变按钮样式
  useEffect(() => {
    reaction(
      () => leftSecondPartsDS.selected.length,
      (val) => {
        if (val) {
          setLeftFlag(true);
        } else {
          setLeftFlag(false);
        }
      }
    );
  }, []);

  useEffect(() => {
    reaction(
      () => rightSecondPartsDS.selected.length,
      (val) => {
        if (val) {
          setRightFlag(true);
        } else {
          setRightFlag(false);
        }
      }
    );
  }, []);

  // 拿到孩子们（records）
  const getChildrenArr = (ds, parentRecord) =>
    ds.filter(
      (record) =>
        record.secParentCode === parentRecord.secCode &&
        record.primaryFlag !== 1 &&
        record.relationKey !== 1 &&
        record.aliasName.indexOf('objectVersionNumber') === -1
    );
  // 非主字段可以移动
  // 父级是否选中
  const isParentSelect = (selectDs, record) =>
    selectDs.some((selRecord) => record.secParentCode === selRecord.get('secCode'));

  /**
   * 左右移动
   * @param beforeDs
   * @param afterDs
   */
  const handleShuttle = (beforeDs: DataSet, afterDs: DataSet, type: string = 'left') => {
    const selectRecodes = beforeDs.selected;
    const beforeData = type === 'left' ? leftCompleteData.current : rightCompleteData.current;
    const afterData = type === 'left' ? rightCompleteData.current : leftCompleteData.current;
    // 非主字段可以移动
    if (selectRecodes.length && selectRecodes.length >= 0) {
      // 循环判断选中的
      let _newAfterDsRecord: any[] = [];
      let _removeAfterDsRecord: any[] = [];
      let _item: any = null;
      selectRecodes.forEach((item) => {
        // 整个模块添加
        _item = item.toData();
        if (!_item.secParentCode) {
          // / 模块
          const repeatRecord = afterData.find((record) => record.secCode === _item.secCode);
          const childrenRecords = getChildrenArr(beforeData, _item);
          _newAfterDsRecord = [..._newAfterDsRecord, ...childrenRecords];
          _removeAfterDsRecord = [..._removeAfterDsRecord, ...childrenRecords];
          if (!repeatRecord) _newAfterDsRecord.push(_item);
        } else {
          // / 字段
          // 判断父级是否选中
          if (isParentSelect(selectRecodes, _item)) {
            return;
          }
          // 子集字段
          const afterParentRecord = afterData.find(
            (record) => record.secCode === _item.secParentCode
          );
          const _newAfterIsParent = _newAfterDsRecord.some(
            (record) => record.secCode === _item.secParentCode
          );
          const beforeParentRecord = beforeData.find(
            (record) => record.secCode === _item.secParentCode
          );
          const _newFields =
            afterParentRecord || _newAfterIsParent ? [_item] : [beforeParentRecord, _item];
          _newAfterDsRecord.push(..._newFields);
          _removeAfterDsRecord.push(_item);
        }
      });

      // 数据移动（增删）
      runInAction(() => {
        _newAfterDsRecord.forEach((item) => {
          let _temp: any = item || {};
          // if (item && item.toData) {
          //   _temp = item.toData();
          // }
          // 自动解决冲突
          let valueArr: Record[] = [];
          let i = 1;
          const lookDuplicate = (newItem) => {
            // 判断是否存在重复 true:重复
            valueArr = afterData.filter(
              (ele) =>
                ele?.aliasName?.toLowerCase() === newItem?.aliasName?.toLowerCase() &&
                !Object.prototype.hasOwnProperty.call(ele, 'fields')
            );
            return valueArr.length > 0;
          };
          const dealDuplicate = () => {
            // 查找是否有重复 有则+1
            afterData.forEach((obj) => {
              if (obj?.aliasName?.toLowerCase() === _temp?.aliasName?.toLowerCase()) {
                Object.assign(_temp, { aliasName: `${_temp.aliasName}${i}` });
                i += 1;
              }
            });
          };
          while (lookDuplicate(_temp)) {
            // 循环解决冲突
            dealDuplicate();
          }
          if (type === 'right' && _temp.secParentCode) {
            // 还原aliasName
            _temp = {
              ..._temp,
              aliasName: _temp.fieldName || _temp.name || '',
            };
          } else if (type === 'left') {
            let code = uuid();
            code = code.replace(/[-]/g, '');
            // 处理字段类型 表字段 TABLE_FIELD 转 MODEL_FIELD
            _temp = {
              ..._temp,
              fieldType: 'MODEL_FIELD',
              fieldCode: item?.fieldCode || code,
              modelFieldCode: item?.modelFieldCode || item?.code,
              tenantId: undefined,
            };
          }
          afterDs.create(_temp);
          // 更新用于搜索的缓存数据
          if (type === 'left') {
            rightCompleteData.current.push(_temp);
          } else {
            leftCompleteData.current.push(_temp);
          }
        });
        let beforeDsData = beforeData;
        _removeAfterDsRecord.forEach((item) => {
          beforeDsData = beforeDsData.filter((i: any) => i.secCode !== item.secCode);
        });
        beforeDs.loadData(beforeDsData);
        // beforeDs.remove(_removeAfterDsRecord);
        // 更新用于搜索的缓存数据
        if (type === 'left') {
          leftCompleteData.current = beforeDsData;
        } else {
          rightCompleteData.current = beforeDsData;
        }
      });
    }
    // 删除没有子集的模型
    if (type === 'left') {
      const removeRecordArr: any[] = [];
      beforeData.forEach((item) => {
        if (!item.secParentCode) {
          // 模型
          const childrenRecords = getChildrenArr(beforeDs.toData(), item);
          if (childrenRecords.length === 0) {
            removeRecordArr.push(item);
          }
        }
      });
      let beforeDsData = beforeDs.toData();
      removeRecordArr.forEach((item) => {
        beforeDsData = beforeDsData.filter((i: any) => i.secCode !== item.secCode);
      });
      beforeDs.loadData(beforeDsData);
      // 更新用于搜索的缓存数据
      if (type === 'left') {
        leftCompleteData.current = beforeDsData;
      } else {
        rightCompleteData.current = beforeDsData;
      }
    }
    // 取消选择
    beforeDs.unSelectAll();
    // 移动完成后 重新搜索一下 把不符合搜索条件的移动选项过滤掉
    if (leftParam.current) {
      handleSearch(leftParam.current, 'left');
    }
    if (rightParam.current) {
      handleSearch(rightParam.current, 'right');
    }
  };

  // 搜索过滤
  const handleSearch = (value: string, type) => {
    if (!value) {
      if (type === 'left' && !isEmpty(leftCompleteData.current)) {
        leftParam.current = null; // 存搜索参数
        leftSecondPartsDS.loadData(leftCompleteData.current);
      } else if (type === 'right' && !isEmpty(rightCompleteData.current)) {
        rightParam.current = null; // 存搜索参数
        rightSecondPartsDS.loadData(rightCompleteData.current);
      }
    } else {
      // 存搜索参数
      if (type === 'left') {
        leftParam.current = value;
      } else {
        rightParam.current = value;
      }
      const dataSet = type === 'left' ? leftSecondPartsDS : rightSecondPartsDS;
      const dataSource = type === 'left' ? leftCompleteData.current : rightCompleteData.current;
      const fieldsList: any[] = [];
      let modelList: any[] = [];
      dataSource.forEach((item: any) => {
        if (
          (item.secParentCode &&
            item?.aliasName?.toUpperCase().indexOf(value?.toUpperCase()) > -1) ||
          item?.displayName?.toUpperCase().indexOf(value?.toUpperCase()) > -1
        ) {
          fieldsList.push(item);
        } else if (!item.secParentCode) {
          modelList.push({ ...item, expand: true });
        }
      });
      modelList = modelList.filter((item) =>
        fieldsList.some((field) => field?.secParentCode === item?.secCode)
      );
      dataSet.loadData([...fieldsList, ...modelList]);
    }
  };

  const leftTablePorps = {
    step,
    level,
    dataSet: leftSecondPartsDS,
    identification: 'left',
    loading: tableLoading,
    handleSearch,
  };
  const rightTablePorps = {
    step,
    level,
    dataSet: rightSecondPartsDS,
    identification: 'right',
    loading: tableLoading,
    handleSearch,
  };

  return (
    <div className={styles['second-parts']}>
      <div
        style={{
          marginTop: '0px',
          border: '1px solid #DFDFDF',
          padding: '15px',
          flex: 1,
          overflow: 'auto',
        }}
      >
        <p
          style={{
            marginBottom: '10px',
            fontSize: '12px',
            color: '#333333',
          }}
        >
          模型字段
        </p>
        <SecondPartsTable {...leftTablePorps} />
      </div>
      <div
        style={{
          width: '50px',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          <span
            className={styles['navigate-next']}
            style={{
              backgroundColor: leftFlag ? '#29bece' : '#f5f5f5',
              border: leftFlag ? 'none' : '1px solid #ABAFB8',
              color: leftFlag ? '#fff' : '#ABAFB8',
              transition: 'all 300ms',
              transform: leftFlag ? 'scale(1.2)' : 'scale(1)',
              boxShadow: leftFlag ? '0px 0px 10px #29bece' : 'none',
            }}
            onClick={() => handleShuttle(leftSecondPartsDS, rightSecondPartsDS, 'left')}
          >
            <Icon type="navigate_next" />
          </span>
        </div>
        <div>
          <span
            className={styles['navigate-before']}
            onClick={() => handleShuttle(rightSecondPartsDS, leftSecondPartsDS, 'right')}
            style={{
              backgroundColor: rightFlag ? '#fff' : '#f5f5f5',
              border: rightFlag ? '1px solid #5a6677' : '1px solid #ABAFB8',
              color: rightFlag ? '#5a6677' : '#ABAFB8',
              transition: 'all .3s',
              transform: rightFlag ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <Icon type="navigate_before" />
          </span>
        </div>
      </div>
      <div
        style={{
          marginTop: '0px',
          border: '1px solid #DFDFDF',
          padding: '15px',
          flex: 1,
          overflow: 'auto',
        }}
      >
        <p
          style={{
            marginBottom: '10px',
            fontSize: '12px',
            color: '#333333',
          }}
        >
          可用数据范围
        </p>
        <SecondPartsTable {...rightTablePorps} />
      </div>
    </div>
  );
});
export default forwardRef((props: any) => <Index {...props} />);
