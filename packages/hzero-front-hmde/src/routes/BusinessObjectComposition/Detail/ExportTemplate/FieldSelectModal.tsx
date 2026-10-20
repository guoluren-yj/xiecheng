import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet, Table, Row, Col, Form, Button, TextField, Spin, Select } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, TableMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { searchDS } from '@/stores/BusinessObject/FieldSelectDS';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import ImgIcon from '@/utils/ImgIcon';
import styles from './index.less';

interface IProps {
  fieldTreeDS: DataSet;
  businessObjectId: string;
  businessObjectExportTemplateId: string;
  tenantId: string;
  [x: string]: any;
}

const ComFieldSelectModal = (props: IProps) => {
  const { businessObjectExportTemplateId, fieldTreeDS } = props;
  const TreeSearchDS = useMemo(() => new DataSet(searchDS()), []);
  const [objectList, setObjectList] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const completeDataRef: any = useRef([]);

  const init = async () => {
    fieldTreeDS.setQueryParameter('businessObjectExportTemplateId', businessObjectExportTemplateId);
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
  };

  useEffect(() => {
    init();
  }, [businessObjectExportTemplateId]);

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
      fieldTreeDS.loadData(fullData);
      // fieldTreeDS.forEach(
      //   (record) =>
      //     (record.get('businessObjectExportTemplateColumnId') ||
      //       record?.get('childList')?.length) &&
      //     Object.assign(record, { selectable: false })
      // );
    } else {
      // filterTable.bind(null, newParams)();
      const data = treeFilter(fullData, node =>
          (newParams?.businessObjectFieldName?.toLowerCase()
            ? node?.businessObjectFieldName
              // ?.replace(/\s*/g, '')
              ?.toLowerCase()
              ?.indexOf?.(newParams?.businessObjectFieldName?.toLowerCase().replace(/\s*/g, '')) >
            -1
            : true) &&
          (newParams?.businessObjectFieldCode?.toLowerCase()
            ? node?.businessObjectFieldCode
              // ?.replace(/\s*/g, '')
              ?.toLowerCase()
              ?.indexOf?.(newParams?.businessObjectFieldCode?.toLowerCase().replace(/\s*/g, '')) >
            -1
            : true) &&
          (newParams?.businessObjectName?.toLowerCase()
            ? node?.businessObjectName
              // ?.replace(/\s*/g, '')
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
      width: 200,
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
    {
      name: 'defaultExportFlag',
      align: ColumnAlign.left,
      editor: record =>
        !record?.get('businessObjectExportTemplateColumnId') && !record?.get('childList')?.length,
    },
  ] as ColumnProps[];

  return (
    <React.Fragment>
      <Row gutter={10} className={styles['row-10']}>
        <Col span={18}>
          <Form
            dataSet={TreeSearchDS}
            columns={3}
            labelWidth={75}
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
            }}
          >
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button color={ButtonColor.primary} onClick={handleSearch}>
            {intl.get('hzero.common.button.query').d('查询')}
          </Button>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <div style={{ height: '500px' }}>
          <Table
            selectionMode={'treebox' as any}
            dataSet={fieldTreeDS}
            columns={columns}
            virtual
            virtualCell
            mode={TableMode.tree}
            defaultRowExpanded
            autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 24 }}
          />
        </div>
      </Spin>
    </React.Fragment>
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hzero.common', 'hmde.common', 'hiam.tenants'],
})(ComFieldSelectModal);
