import React, { useState, useEffect } from 'react';
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
// import { filterNullValueObject } from 'utils/utils';

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
  const {
    fields,
    ds,
    // autoQuery = false,
    queryFieldsLimit,
    onSearch = (e) => e,
    onRef = (e) => e,
  } = props;

  useEffect(() => {
    onRef(ds);
  }, [ds]);

  const unfoldMoreQueryFields = () => {
    setFold(!fold);
  };

  function reset() {
    ds.reset();
  }

  async function handleSearch() {
    onSearch(ds);
  }

  const normalFields = fields.slice(0, queryFieldsLimit);
  const _fields = fold ? normalFields : fields;

  return (
    <Form dataSet={ds} labelLayout="horizontal">
      <Row>
        <Col span={18}>
          <Row gutter={8}>
            {_fields.map((field) => {
              const { fieldType, name, ...editorProps } = field;

              const ResField = fieldMap[fieldType] || TextField;
              return (
                <Col span={8}>
                  <Form.Item>
                    <ResField name={name} {...editorProps} />
                  </Form.Item>
                </Col>
              );
            })}
          </Row>
        </Col>
        <Col span={6} className={style['search-btn-more']}>
          {fields.length > queryFieldsLimit ? (
            fold ? (
              <Button onClick={unfoldMoreQueryFields}>
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
            ) : (
              <Button onClick={unfoldMoreQueryFields}>
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
            )
          ) : null}
          <Button onClick={reset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
          <Button color="primary" onClick={handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
