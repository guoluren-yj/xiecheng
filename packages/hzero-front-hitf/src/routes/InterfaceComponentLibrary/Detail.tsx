import React, { useMemo, useEffect, useCallback } from 'react';
import { Row, Col } from 'choerodon-ui';
import { DataSet, Form, Table, TextField, TextArea, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';

import { getResponse } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';

import { getFormDetail } from '@/services/interfaceComponentLibraryService';

import styles from './index.less';

const { Option } = Select;
interface selectListProps {
  statusList: [],
  moduleTypeList: [],
  convertMethodList: [],
  fieldList: [],
}
interface DetailProps {
  headerId: String,
  selectList: selectListProps;
  detailFormDs: DataSet,
  inputDs: DataSet;
  outputDs: DataSet;
}

const Detail: React.FC<DetailProps> = ({ headerId, selectList, detailFormDs: formDs, inputDs, outputDs }) => {
  useEffect(() => {
    if (headerId) {
      getFormDetail(headerId).then(res => {
        const result = getResponse(res);
        formDs.loadData([result]);
      });
    }
  }, []);

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'fieldCode',
        editor: <TextField restrict="A-Za-z0-9" />,
      },
      {
        name: 'fieldDesc',
        editor: true,
      },
      {
        name: 'fieldType',
        editor: (
          <Select>
            {
              selectList.fieldList.map((item: any) => (
                <Option value={item.value} key={item.value}>
                  {item.meaning}
                </Option>
              ))
            }
          </Select>
        ),
      },
    ],
    []
  );

  // 输入小写转大写
  const changeModuleCode = (value) => {
    const record: any = formDs.current;
    record.set('moduleCode', value.toUpperCase());
  };

  const formRender = useMemo(() => {
    return (
      <Form dataSet={formDs} labelLayout={LabelLayout.float}>
        <Row>
          <Col span={10} className={styles['form-col']}>
            <TextField
              name="moduleCode"
              style={{ width: '100%' }}
              restrict="A-Za-z0-9._"
              disabled={headerId !== null}
              onChange={changeModuleCode}
            />
          </Col>
          <Col span={10} className={styles['form-col']}>
            <TextField name="moduleName" style={{ width: '100%' }} />
          </Col>
        </Row>
        <Row>
          <Col span={10} className={styles['form-col']}>
            <Select name="enableFlag" style={{ width: '100%' }} />
          </Col>
          <Col span={10} className={styles['form-col']}>
            <Select name="moduleType" style={{ width: '100%' }} />
          </Col>
        </Row>
        <Row>
          <Col span={10} className={styles['form-col']}>
            <Select name="convertMethod" style={{ width: '100%' }} />
          </Col>
          <Col span={10} className={styles['form-col']}>
            <TextField name="methodPath" style={{ width: '100%' }} restrict="A-Za-z." />
          </Col>
        </Row>
        <Row>
          <Col span={20} className={styles['form-col']}>
            <TextArea name="moduleDesc" style={{ width: '100%' }} />
          </Col>
        </Row>
      </Form>
    );
  }, [formDs]);

  const handleDelete = useCallback((flag) => {
    const tableDs = flag ? inputDs : outputDs;
    tableDs.delete(tableDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  }, [inputDs, outputDs]);

  return (
    <div className={styles['interface-component-content']}>
      <div className={styles['basic-content']}>
        <div className={styles['content-header']}>
          {intl.get('hzero.common.view.title.baseInfo').d('基本信息')}
        </div>
        {formRender}
      </div>
      <div>
        <div className={styles['content-header']}>
          {intl.get('hitf.common.configuration.transform').d('配置转换')}
        </div>
        <div>
          <div className={styles['content-second-header']}>
            <span className={styles['content-second-header-border']} />
            <span>{intl.get('hitf.common.rule.enter').d('入参')}</span>
          </div>
          <Table
            dataSet={inputDs}
            columns={columns}
            buttons={[TableButtonType.add, [TableButtonType.delete, { onClick: () => handleDelete(true) }]]}
          />
          <div className={styles['content-second-header']}>
            <span className={styles['content-second-header-border']} />
            <span>{intl.get('hitf.common.rule.out').d('出参')}</span>
          </div>
          <Table
            dataSet={outputDs}
            columns={columns}
            buttons={[TableButtonType.add, [TableButtonType.delete, { onClick: () => handleDelete(false) }]]}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(Detail));
