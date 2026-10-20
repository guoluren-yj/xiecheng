/**
 * 参数服务
 * @date: 2020-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useContext } from 'react';
import { Form, TextField, TextArea } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import intl from 'utils/intl';
import Context from '../../components/Context';
import ConfigTable from '../../components/ConfigTable';

function ParamService() {
  const { paramServiceDs, paramTableDs, returnValueDs } = useContext(Context);

  const columns = [
    {
      name: 'name',
      width: 120,
    },
    {
      name: 'type',
      width: 120,
    },
    {
      name: 'label',
      width: 90,
    },
    {
      name: 'lovCode',
      width: 120,
    },
    {
      name: 'lookupCode',
      width: 120,
    },
    {
      name: 'textField',
      width: 120,
    },
    {
      name: 'valueField',
      width: 120,
    },
  ];
  return (
    <React.Fragment>
      <Form dataSet={paramServiceDs} columns={2}>
        <TextField name="fullPathCode" />
        <TextField name="defaultRetMeaning" />
        <TextField name="modelObject" colSpan={2} />
        <TextArea name="description" colSpan={2} rowSpan={2} />
      </Form>
      <Card
        key="returnValue-header"
        bordered={false}
        title={
          <h3>{intl.get('spfm.rulesDefinition.view.card.paramTable').d('允许使用的特性值配置')}</h3>
        }
      >
        <ConfigTable columns={columns} dataSet={paramTableDs} />
      </Card>
      <Card
        key="param-header"
        bordered={false}
        title={
          <h3>
            {intl.get('spfm.rulesDefinition.view.card.returnValue').d('允许使用的执行规则配置')}
          </h3>
        }
      >
        <ConfigTable columns={columns} dataSet={returnValueDs} />
      </Card>
    </React.Fragment>
  );
}

export default ParamService;
