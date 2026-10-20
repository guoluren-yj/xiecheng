import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table, DataSet, Row, Col, Form, Button, TextField, Spin } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { ColumnAlign, TableMode } from 'choerodon-ui/pro/lib/table/enum';
// import { getBusinessObjectImportTree } from '@/services/businessObjectService';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
// import { uuid } from '@/utils/common';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
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

const ImportSelectModal = (props: IProps) => {
  const { fieldTreeDS, businessObjectId, id, templateColListDS } = props;
  const TreeSearchDS = useMemo(() => new DataSet(searchDS()), []);
  const [loading, setLoading] = useState<boolean>(false);
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
      completeDataRef.current = [res];
    }
  };
  useEffect(() => {
    init();
  }, [id]);

  const treeFilter = (tree, func) => {
    return tree
      .map(node => ({ ...node }))
      .filter(node => {
        // eslint-disable-next-line no-param-reassign
        node.childList = treeFilter(node?.childList || [], func);
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
      const data = treeFilter(
        fullData,
        node =>
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
        <Table dataSet={fieldTreeDS} columns={columns} mode={TableMode.tree} defaultRowExpanded />
      </Spin>
    </React.Fragment>
  );
};

export default formatterCollections({ code: ['hmde.common'] })(ImportSelectModal);
