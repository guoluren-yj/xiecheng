/*
 * EnterpriseInform - 企业信息变更新建弹窗
 * @date: 2022/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Form, Lov, Select } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

@withCustomize({
  unitCode: ['SSLM.ENTERPRISE_INFORM_CHANGE.CREATE_FORM'],
})
@observer
export default class CreateForm extends Component {
  render() {
    const { dataSet, customizeForm } = this.props;
    return customizeForm(
      {
        code: 'SSLM.ENTERPRISE_INFORM_CHANGE.CREATE_FORM',
      },
      <Form dataSet={dataSet} labelLayout="float">
        <Lov name="companyLov" />
        <Select name="changeContent" />
        <Select
          name="changeLevel"
          hidden={!(dataSet.current.get('changeContent') === 'purchaser')}
        />
        <Lov name="partnerCompanyLov" hidden={!dataSet.current.get('changeLevel')} />
      </Form>
    );
  }
}
