import React, { useState } from 'react';
import {
  Form,
  TextField,
  NumberField,
  DatePicker,
  Select,
  Switch,
  Lov,
  Button,
  Row,
  Col,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';

import style from './index.less';

const fieldMap = {
  Lov,
  Select,
  Switch,
  TextField,
  DatePicker,
  NumberField,
};

export default function C7nFilterForm(props) {
  // 收起
  const [fold, setFold] = useState(true);
  const { fields, dataSet, queryFieldsLimit = 3, onSearch = (e) => e } = props;

  const normalFields = fields.slice(0, queryFieldsLimit);
  const _fields = fold ? normalFields : fields;

  return (
    <Row>
      <Col span={18}>
        <Form useColon dataSet={dataSet} labelLayout="horizontal" columns={queryFieldsLimit}>
          {_fields.map((field) => {
            const { name, fieldType, editorProps = {} } = field;
            const ResField = fieldMap[fieldType] || TextField;
            return <ResField name={name} {...editorProps} />;
          })}
        </Form>
      </Col>
      <Col span={6} className={style['search-btn-more']}>
        {fields.length > queryFieldsLimit && (
          <Button onClick={() => setFold(!fold)}>
            {fold
              ? intl.get('hzero.common.button.viewMore').d('更多查询')
              : intl.get('hzero.common.button.collected').d('收起查询')}
          </Button>
        )}
        <Button onClick={() => dataSet.reset()}>
          {intl.get('hzero.common.button.reset').d('重置')}
        </Button>
        <Button color="primary" onClick={onSearch}>
          {intl.get('hzero.common.button.search').d('查询')}
        </Button>
      </Col>
    </Row>
  );
}
