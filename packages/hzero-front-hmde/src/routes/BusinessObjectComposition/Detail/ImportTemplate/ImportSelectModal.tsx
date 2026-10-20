import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table, DataSet, Row, Col, Form, Button, TextField, Spin, Select } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { ColumnAlign, TableMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
// import { getBusinessObjectImportTree } from '@/services/businessObjectService';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
// import { uuid } from '@/utils/common';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { searchDS } from '@/stores/BusinessObject/FieldSelectDS';
import ImgIcon from '@/utils/ImgIcon';
import styles from './index.less';

interface IProps {
  businessObjectId: string;
  currentImportId?: string;
  templateColListDS: DataSet;
  fieldTreeDS: DataSet;
  tenantId: any;
  id: string;
  [x: string]: any;
}

// const dealIdAndParentId = (data, parentId) => {
//   let result: any = {};
//   const _uuid = uuid();
//   result = { ...data, id: _uuid, parentId };
//   let childList = [];
//   if (result?.childList) {
//     childList = result?.childList.map((child) => {
//       return dealIdAndParentId(child, result?.id);
//     });
//   }
//   return { ...result, childList };
// };

const ImportSelectModal = (props: IProps) => {
  const { fieldTreeDS, businessObjectId, id, templateColListDS } = props;
  const TreeSearchDS = useMemo(() => new DataSet(searchDS()), []);
  const [loading, setLoading] = useState<boolean>(false);
  const [objectList, setObjectList] = useState([]);
  const completeDataRef: any = useRef([]);

  const init = async () => {
    if (id) {
      const fieldCodeList = templateColListDS.map(field => {
        return field.get('businessObjectFieldCode');
      });
      fieldTreeDS.setState('fieldCodeList', fieldCodeList);
      fieldTreeDS.setQueryParameter('businessObjectImportTemplateSheetId', id);
      fieldTreeDS.setQueryParameter('businessObjectId', businessObjectId);
      fieldTreeDS.setQueryParameter('tenantId', getCurrentOrganizationId());
      const res = await fieldTreeDS.query();
      if (res && res.childList) {
        const list = res.childList;
        completeDataRef.current = list;
        let businessObjectNameList = list.map(field => {
          return field?.businessObjectName;
        });
        businessObjectNameList = [...new Set(businessObjectNameList)];
        setObjectList(businessObjectNameList);
      }
    }
  };

  useEffect(() => {
    init();
  }, [id]);

  const treeFilter = (data, func) => {
    const parentIdSet = new Set();
    const result = data.filter(node => func(node));
    if (result.length) {
      const findParent = child => {
        if (!isNil(child.parentColumnId) && !parentIdSet.has(child.parentColumnId)) {
          parentIdSet.add(child.parentColumnId);
          const parentNode = data.find(parent => parent.columnId === child.parentColumnId);
          if (parentNode) {
            result.push(parentNode);
            findParent(parentNode);
          }
        }
      };
      result.forEach(node => {
        findParent(node);
      });
    }
    return result;
  };

  const handleSearch = () => {
    setLoading(true);
    const params = TreeSearchDS.toData()?.[0] || {};
    // return init(query);
    if (isEmpty(completeDataRef.current)) {
      completeDataRef.current = fieldTreeDS.toData();
    }
    const fullData = completeDataRef.current;
    const newParams: any = {};
    ['businessObjectFieldName', 'businessObjectFieldCode', 'businessObjectName'].forEach(item => {
      if (params[item]) {
        Object.assign(newParams, { [item]: params[item] });
      }
    });
    if (isEmpty(newParams)) {
      fieldTreeDS.loadData(completeDataRef.current);
    } else {
      // filterTable.bind(null, newParams)();
      const data = treeFilter(fullData, node =>
          (newParams?.businessObjectFieldName?.toLowerCase()
            ? node?.businessObjectFieldName
                ?.toLowerCase()
                ?.indexOf?.(newParams?.businessObjectFieldName?.toLowerCase().replace(/\s*/g, '')) >
              -1
            : true) &&
          (newParams?.businessObjectFieldCode?.toLowerCase()
            ? node?.businessObjectFieldCode
                ?.toLowerCase()
                ?.indexOf?.(newParams?.businessObjectFieldCode?.toLowerCase().replace(/\s*/g, '')) >
              -1
            : true) &&
          (newParams?.businessObjectName?.toLowerCase()
            ? node?.businessObjectName
                ?.toLowerCase()
                ?.indexOf?.(newParams?.businessObjectName?.toLowerCase().replace(/\s*/g, '')) > -1
            : true)
      );
      fieldTreeDS.loadData(data);
    }
    setTimeout(() => {
      setLoading(false);
    }, 0);
  };

  const columns = [
    {
      name: 'businessObjectFieldName',
      align: ColumnAlign.left,
      renderer: ({ record }) => {
        const { relateType } = record?.toData();
        let displayName = record?.get('businessObjectFieldName');
        let iconName = '';
        if (record?.get('relateType')) {
          switch (relateType) {
            case 'MASTER':
              iconName = 'bocZhu.svg';
              displayName = `${record?.get('businessObjectName')}(${record?.get(
                'businessObjectCode'
              )})`;
              break;
            case 'MASTER_SLAVE':
              iconName = 'bocZhuCong.svg';
              displayName = `${record?.get('businessObjectName')}(${record?.get(
                'businessObjectCode'
              )})`;
              break;
            case 'SLAVE_MASTER':
              iconName = 'bocCongZhu.svg';
              displayName = `${record?.get('businessObjectFieldName')}(${record?.get(
                'businessObjectName'
              )})`;
              break;
            case 'LINK':
              iconName = 'bocGuanLian.svg';
              displayName = `${record?.get('businessObjectFieldName')}(${record?.get(
                'businessObjectName'
              )})`;
              break;
            default:
              iconName = '';
              displayName = record?.get('businessObjectFieldName');
              break;
          }
        }
        return (
          <div>
            <ImgIcon name={iconName} size={16} style={{ marginRight: 4 }} />
            <span>{displayName}</span>
          </div>
        );
      },
    },
    {
      name: 'businessObjectFieldCode',
      align: ColumnAlign.left,
    },
    {
      name: 'businessObjectName',
      align: ColumnAlign.left,
    },
  ] as ColumnProps[];

  return (
    <React.Fragment>
      <Row gutter={10} className={styles['row-10']} style={{ marginBottom: '16px' }}>
        <Col span={18}>
          <Form
            dataSet={TreeSearchDS}
            columns={3}
            labelWidth={75}
            labelLayout={LabelLayout.float}
            onKeyDown={e => {
              if (e.keyCode === 13) return handleSearch();
            }}
          >
            <TextField name="businessObjectFieldName" />
            <TextField name="businessObjectFieldCode" />
            <Select name="businessObjectName">
              {objectList.map(i => (
                <Select.Option key={i} value={i}>
                  {i}
                </Select.Option>
              ))}
            </Select>
          </Form>
        </Col>
        <Col span={6}>
          <Button
            onClick={() => {
              TreeSearchDS.reset();
              fieldTreeDS.loadData(completeDataRef.current);
              // const fieldCodeList = templateColListDS.map((field) => {
              //   return field.get('businessObjectFieldCode');
              // });
              // fieldTreeDS.forEach(
              //   (record) =>
              //     (record.get('businessObjectImportTemplateColId') ||
              //       fieldCodeList.includes(record.get('businessObjectFieldCode')) ||
              //       record?.get('childList')?.length) &&
              //     Object.assign(record, { selectable: false })
              // );
            }}
          >
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button color={ButtonColor.primary} onClick={handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <div style={{ height: '500px' }}>
          <Table
            dataSet={fieldTreeDS}
            columns={columns}
            mode={TableMode.tree}
            defaultRowExpanded
            virtual
            virtualCell
            autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 24 }}
          />
        </div>
      </Spin>
    </React.Fragment>
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common'],
})(ImportSelectModal);
