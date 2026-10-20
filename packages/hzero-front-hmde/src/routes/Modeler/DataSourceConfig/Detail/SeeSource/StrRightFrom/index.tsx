/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';

import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import { treeToArr } from '@/utils/treeUtils';
// import { EFieldType } from '@/globalData/modelManager';
import { mapToSecondData } from '@/routes/Modeler/DataSourceConfig/utils/utils';

import Conditions from './conditions';
import SecondPartsDS from '../../EditSource/SecondParts/store/SecondPartsDS';
import SecondPartsTable from '../../EditSource/SecondParts/SecondPartsTable';

const { Panel } = Collapse;

interface IIndexProps {
  dataList: model.data.BaseDataObject;
  rightFormData: model.data.DataObjectModel;
}
export default ({ dataList, rightFormData }: IIndexProps) => {
  // 如果包含fieldType = "VIRTUAL_FIELD"
  // 读取出来
  const leftSecondPartsDS = useMemo(() => new DataSet(SecondPartsDS('', '', null)), [dataList]);
  useMemo(() => {
    // 打平数据
    let _dataArr: model.data.DataObjectModel[] = treeToArr([dataList.masterModel]);
    let code: string = uuid();
    code = code.replace(/[-]/g, '');
    const virtualFields: model.data.DataVirtualField[] = dataList.virtualFieldList?.map((i) => ({
      ...i,
      code: i.fieldCode,
      secParentCode: code,
    }));
    const virtualObj: object = {
      aliasName: '数据对象虚拟字段',
      fields: virtualFields,
      code,
      expand: true,
      isVirtualFields: true, // IconRender 渲染主模型Icon
    };

    // 全部展开
    _dataArr = _dataArr.map((item: any) => ({
      ...item,
      aliasName: item?.aliasName || item?.logicModelName,
      expand: true,
    }));
    if (!isEmpty(virtualFields)) {
      _dataArr.push(virtualObj as any);
    }
    _dataArr = mapToSecondData(_dataArr, 'fields');

    // 请求数据
    leftSecondPartsDS.loadData(_dataArr);
  }, [dataList]);

  const leftTableProps = {
    dataSet: leftSecondPartsDS,
    identification: 'left',
    loading: false,
    sourceDetailType: 'see',
  };
  return (
    <Collapse
      defaultActiveKey={['2']}
      bordered={false}
      expandIcon={({ isActive }) => (
        <Icon
          type={`expand_${isActive ? 'less' : 'more'}`}
          style={{ fontSize: 24, fontWeight: 'normal', verticalAlign: 'text-top', marginLeft: -6 }}
        />
      )}
    >
      <Panel header="筛选逻辑" key="1">
        <Conditions rightFormData={rightFormData} />
      </Panel>
      <Panel header="字段信息" key="2">
        <SecondPartsTable {...leftTableProps} />
      </Panel>
    </Collapse>
  );
};
