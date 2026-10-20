/**
 * ProcessFormModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, TextField, Switch } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const { ItemGroup } = Form;
export default function ProcessFormModal(props = {}) {
  const { record } = props;
  // const [cuszStageFlag, handleCuszStageFlag] = useState(record.get('checkValue') === 'cuszStage');

  // const changeCheckValue = useCallback((value) => {
  //   handleCuszStageFlag(value === 'cuszStage');
  // }, []);

  return (
    <Form record={record} labelLayout="float">
      {/* <SelectBox name="checkValue" onChange={changeCheckValue}>
        <SelectBox.Option value="customize">
          {intl.get('hwfp.common.model.common.customize').d('自定义')}
        </SelectBox.Option>
        <SelectBox.Option value="cuszStage">
          {intl.get('hwfp.common.model.common.cuszStage').d('表单样式配置')}
        </SelectBox.Option>
      </SelectBox> */}
      <ItemGroup label={intl.get('hwfp.common.model.common.formCode').d('表单编码')} compact>
        <TextField name="formCodePrefix" style={{ width: '50%' }} />
        <TextField name="formCode" style={{ width: '50%' }} />
      </ItemGroup>
      <TextField name="description" />
      {/* {cuszStageFlag && <Lov name="cuszStage" />} */}
      <ItemGroup label={intl.get('hwfp.common.model.common.pcFormUrl').d('PC端表单URL')} compact>
        <TextField name="formUrlProtocol" style={{ width: '24%' }} />
        <TextField name="formUrl" style={{ width: '76%' }} />
      </ItemGroup>
      <TextField name="mobileFormUrl" />
      <Switch name="batchFlag" />
      <Switch name="enabledFlag" />
    </Form>
  );
}
