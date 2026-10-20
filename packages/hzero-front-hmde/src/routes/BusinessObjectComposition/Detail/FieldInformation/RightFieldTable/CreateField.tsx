import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Table, Form, Button, TextField, DataSet, Spin, Select } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { TableMode } from 'choerodon-ui/pro/lib/table/enum';
import { getResponse } from 'hzero-front/lib/utils/utils';
// import { Observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl';
import { isEmpty, cloneDeep, isNil } from 'lodash';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { getCreateFieldInfo } from '@/services/businessObjectService';

import { getFieldsEnums } from '@/businessComponents/icon-picker/enums';
import { searchDS } from './store/FieldInformationDS';
import { valueList } from '../enums';
import { dealCreateIdAndParentId, getParentObjList } from '../utils';
import styles from './index.less';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

const { MASTER } = valueList;
const CreateField = ({
  _store,
  createColumns,
  // masterBusinessObjectId,
  handleExpendIcon,
  createFieldInformationDs,
  businessObjectCombineId,
}) => {
  const completeDataRef: any = useRef([]); // 搜索缓存的完整数据
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  const searchDs = useMemo(() => new DataSet(searchDS()), []);

  const init = (_query = {}) => {
    const parentObjList = _store?.getItem('parentObjList') || [];
    const record = _store?.getItem('record') || {};
    const {
      relateType,
      relBusinessObjectId,
      parentBusinessObjectFieldCode,
      relateBusinessObjectFieldCode,
      businessObjectAssociateCode, // 高级关系code
    } = record;
    if (!isNil(relBusinessObjectId) && !isNil(relateType)) {
      const query = {
        // relateType: MASTER,
        // businessObjectId: masterBusinessObjectId,
        ..._query,
      };
      if (relateType) {
        Object.assign(query, {
          relateType,
          businessObjectId: relBusinessObjectId,
          businessObjectFieldCode:
            parentBusinessObjectFieldCode ||
            relateBusinessObjectFieldCode ||
            businessObjectAssociateCode,
        });
      }
      const body = parentObjList;
      setLoading(true);
      getCreateFieldInfo({ _businessObjectId: businessObjectCombineId, query, body }).then(res => {
        setLoading(false);
        if (getResponse(res)) {
          let _res = {
            ...res,
            businessObjectRelationFieldList: [], // 字段清空
            businessObjectRelationList: [], // 关系清空
          };
          _res = dealCreateIdAndParentId([_res]);
          createFieldInformationDs.loadData(_res);
          completeDataRef.current = createFieldInformationDs.toData();
        }
      });
    }
  };

  // 点击展开节点异步加载
  const handleLoadData = ({ record, dataSet }) => {
    record.set('reverseLinkFlagDisabled', true); // 展开后无法更改是否反向关联
    const id = record.get('id');
    const parentId = record.get('parentId');
    const reverseLinkFlag = record.get('reverseLinkFlag');
    const relateType = record.get('relateType');
    const relBusinessObjectId = record.get('relBusinessObjectId');
    const parentBusinessObjectFieldCode = record.get('parentBusinessObjectFieldCode');
    const relateBusinessObjectFieldCode = record.get('relateBusinessObjectFieldCode');
    const businessObjectAssociateCode = record.get('businessObjectAssociateCode');
    const data = dataSet.toData();
    return new Promise(resolve => {
      const isLoaded = data.some(i => i.parentId === id); // 找到子集则不需要重复掉接口查询
      if (!isLoaded && !isNil(relBusinessObjectId) && !isNil(relateType)) {
        const query = {
          relateType,
          reverseLinkFlag,
          businessObjectId: relBusinessObjectId,
          businessObjectFieldCode:
            parentBusinessObjectFieldCode ||
            relateBusinessObjectFieldCode ||
            businessObjectAssociateCode,
        };
        const element = _store.getItem('record');
        let _parentObjList = _store.getItem('parentObjList');
        if (element?.relateType !== MASTER) {
          // 选中的是关联对象 则拼接
          _parentObjList = _parentObjList.map(item => ({
            ...item,
            businessObjectRelationId: undefined,
          }));
        } else {
          _parentObjList = [];
        }
        // 寻找所有父对象
        let parentObjList = parentId ? getParentObjList(data, parentId) : [];
        parentObjList = parentObjList.map(i => ({ ...i, id: undefined, parentId: undefined }));
        const body = [..._parentObjList, ...parentObjList];
        getCreateFieldInfo({
          _businessObjectId: businessObjectCombineId,
          query,
          body,
        })
          .then(async res => {
            Object.assign(res, { id, parentId });
            const _res = dealCreateIdAndParentId([res], true) || [];
            completeDataRef.current = [...data, ..._res]; // 缓存完整数据用于搜索
            resolve();
            setTimeout(() => {
              dataSet.appendData(_res);
            }, 0);
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  // 根据字段名称/编码/类型过滤
  const filterTable = params => {
    const fullData = cloneDeep(completeDataRef.current);
    const fieldsData = fullData?.filter?.(
      i =>
        !i?.relateType &&
        (params?.businessObjectFieldName?.toLowerCase()
          ? i?.businessObjectFieldName
            ?.replace(/\s*/g, '')
            ?.toLowerCase()
            ?.indexOf?.(params?.businessObjectFieldName?.toLowerCase().replace(/\s*/g, '')) > -1
          : true) &&
        (params?.businessObjectFieldCode?.toLowerCase()
          ? i?.businessObjectFieldCode
            ?.replace(/\s*/g, '')
            ?.toLowerCase()
            ?.indexOf?.(params?.businessObjectFieldCode?.toLowerCase().replace(/\s*/g, '')) > -1
          : true) &&
        (params?.componentType?.toLowerCase()
          ? i?.componentType
            ?.replace(/\s*/g, '')
            ?.toLowerCase()
            ?.indexOf?.(params?.componentType?.toLowerCase().replace(/\s*/g, '')) > -1
          : true)
    );
    if (isEmpty(fieldsData)) {
      createFieldInformationDs.loadData([]);
      return;
    }
    const objectData = fullData.filter(i => i?.relateType && i?.expand);
    createFieldInformationDs.loadData([...objectData, ...fieldsData]);
  };

  const handleSearch = () => {
    setLoading(true);
    const params = searchDs.toData()?.[0] || {};
    const newParams = {};
    ['businessObjectFieldName', 'businessObjectFieldCode', 'componentType'].forEach(item => {
      if (params[item]) {
        Object.assign(newParams, { [item]: params[item] });
      }
    });
    if (isEmpty(newParams)) {
      createFieldInformationDs.loadData(completeDataRef.current);
    } else {
      filterTable.bind(null, newParams)();
    }
    setTimeout(() => {
      setLoading(false);
    }, 0);
  };

  return (
    <div style={{ maxHeight: '65vh' }}>
      <Row gutter={10} className={styles['row-10']} style={{ marginBottom: '16px' }}>
        <Col span={18}>
          <Form
            dataSet={searchDs}
            labelLayout={LabelLayout.float}
            columns={3}
            labelWidth={70}
            onKeyDown={e => {
              if (e.keyCode === 13) return handleSearch();
            }}
          >
            <TextField name="businessObjectFieldName" />
            <TextField name="businessObjectFieldCode" />
            <Select name="componentType">
              {getFieldsEnums().map(i => (
                <Select.Option key={i?.value} value={i.value}>
                  {i?.title}
                </Select.Option>
              ))}
            </Select>
          </Form>
        </Col>
        <Col span={6}>
          <Button onClick={() => searchDs.reset()}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button color={ButtonColor.primary} onClick={handleSearch}>
            {intl.get('hzero.common.button.query').d('查询')}
          </Button>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <Table
          className={styles['create-table']}
          mode={TableMode.tree}
          treeAsync
          // selectionMode={'treebox' as any}
          dataSet={createFieldInformationDs}
          columns={createColumns}
          treeLoadData={handleLoadData}
          expandIcon={args => handleExpendIcon(args, 'create')} // 高性能tree暂时不用这个，缩进有问题
        // defaultRowExpanded
        />
      </Spin>
    </div>
  );
};
export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common'],
})(CreateField);
