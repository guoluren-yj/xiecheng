import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { DataSet, Table, Row, Col, Form, Button, TextField, Spin, Select } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { ColumnAlign, TableMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { searchDS } from '../stores/FieldSelectDS';
import ImgIcon from '../../../components/utils/ImgIcon';
import { treeToArr } from '../../../components/utils/treeUtils';
import styles from './index.less';

const ComFieldSelectModal = (props) => {
  const { docObjectRelId, fieldTreeDS } = props;
  const TreeSearchDS = useMemo(() => new DataSet(searchDS()), []);
  const [objectList, setObjectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const completeDataRef = useRef([]);

  const init = async () => {
    fieldTreeDS.setQueryParameter('docObjectRelId', docObjectRelId);
    fieldTreeDS.setQueryParameter('tenantId', getCurrentOrganizationId());
    const res = await fieldTreeDS.query();
    let list = treeToArr([res], 'childList');
    list = list.map((field) => {
      return field?.businessObjectName;
    });
    list = [...new Set(list)];
    completeDataRef.current = [res];
    setObjectList(list);
  };

  useEffect(() => {
    init();
  }, [docObjectRelId]);

  const treeFilter = (tree, func) => {
    return tree
      .map((node) => ({ ...node }))
      .filter((node) => {
        if (node.childList) {
          // eslint-disable-next-line no-param-reassign
          node.childList = treeFilter(node?.childList || [], func);
        }
        return func(node) || node.childList?.length;
      });
  };

  const handleSearch = () => {
    setLoading(true);
    const params = TreeSearchDS.toData()?.[0] || {};
    // return init(query);
    if (isEmpty(completeDataRef.current)) {
      completeDataRef.current = fieldTreeDS.toData();
    }
    const fullData = completeDataRef.current;
    const newParams = {};
    ['businessObjectFieldName', 'businessObjectFieldCode', 'businessObjectName'].forEach((item) => {
      if (params[item]) {
        Object.assign(newParams, { [item]: params[item] });
      }
    });
    if (isEmpty(newParams)) {
      fieldTreeDS.loadData(fullData);
    } else {
      const data = treeFilter(
        fullData,
        (node) =>
          (newParams?.businessObjectFieldName?.toLowerCase()
            ? node?.businessObjectFieldName
                // ?.replace(/\s*/g, '')
                ?.toLowerCase()
                ?.indexOf?.(newParams?.businessObjectFieldName?.toLowerCase().replace(/\s*/g, '')) > -1
            : true) &&
          (newParams?.businessObjectFieldCode?.toLowerCase()
            ? node?.businessObjectFieldCode
                // ?.replace(/\s*/g, '')
                ?.toLowerCase()
                ?.indexOf?.(newParams?.businessObjectFieldCode?.toLowerCase().replace(/\s*/g, '')) > -1
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
              displayName = `${record?.get('businessObjectName')}(${record?.get('businessObjectCode')})`;
              break;
            case 'MASTER_SLAVE':
              iconName = 'bocZhuCong.svg';
              displayName = `${record?.get('businessObjectName')}(${record?.get('businessObjectCode')})`;
              break;
            case 'SLAVE_MASTER':
              iconName = 'bocCongZhu.svg';
              displayName = `${record?.get('businessObjectFieldName')}(${record?.get('businessObjectName')})`;
              break;
            case 'LINK':
              iconName = 'bocGuanLian.svg';
              displayName = `${record?.get('businessObjectFieldName')}(${record?.get('businessObjectName')})`;
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
      editor: (record) => !record?.get('businessObjectExportTemplateColumnId') && !record?.get('childList')?.length,
    },
  ];

  return (
    <React.Fragment>
      <Row gutter={10} className={styles['row-10']}>
        <Col span={18}>
          <Form
            dataSet={TreeSearchDS}
            columns={3}
            labelWidth={75}
            onKeyDown={(e) => {
              if (e.keyCode === 13) return handleSearch();
            }}
          >
            <TextField name="businessObjectFieldName" />
            <TextField name="businessObjectFieldCode" />
            <Select name="businessObjectName">
              {objectList.map((i) => (
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
        <Table
          selectionMode="treebox"
          dataSet={fieldTreeDS}
          columns={columns}
          mode={TableMode.tree}
          defaultRowExpanded
        />
      </Spin>
    </React.Fragment>
  );
};

export default memo(ComFieldSelectModal);
