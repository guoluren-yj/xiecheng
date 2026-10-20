import React, {useMemo, forwardRef, useImperativeHandle} from 'react';
import { DataSet, Form, Select, TextField, IntlField, Lov } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import {nodeCreateDS} from './indexDS';

interface PropsParams{
  workFlag?: boolean,
  tabType?:string,
  }

const CustCreate = forwardRef((props: PropsParams, ref): any =>{
  const { workFlag, tabType } = props;
  const nodeCreateDs = useMemo(()=>new DataSet(nodeCreateDS(workFlag, tabType)), []);

  useImperativeHandle(ref, () => (
    {
      ref,
      nodeCreateDs,
    }
  ));

  return (
    <Form labelLayout={LabelLayout.float} dataSet={nodeCreateDs} columns={1}>
      {tabType === 'node' && (<TextField name='nodeConfigCode' />)}
      {tabType ==='node' &&(<IntlField name='nodeConfigName' />)}
      {tabType === 'node' && !workFlag && (<Select name='nodeOrderType' />)}
      {tabType === 'node' && (<Lov name='nodeCodeRuleLov' />)}
      {tabType ==='node' &&(<Lov name='refRcvTypeCodeLov' />)}
      {tabType === 'node' && (<TextField name='rcvTypeName' />)}
      {tabType ==='node' && (<Select name='nodeConfigIndexAbc' />)}
      {tabType ==='strategy' &&(<TextField name='strategyCode' />)}
      {tabType ==='strategy' &&(<IntlField name='strategyName' />)}
      {tabType ==='strategy' &&(<Select name='sourceOrderType' />)}
      {tabType ==='strategy' && (<Select name='enabledFlag' />)}
      {tabType ==='strategy' && !workFlag &&(<Select name='scheduledDeliveryFlag' />)}
    </Form>
  );
});

export default CustCreate;