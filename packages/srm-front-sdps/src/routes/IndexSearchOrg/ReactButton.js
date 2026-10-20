/**
 * ReactButton: 响应按钮
 * @date: 2022-05-24
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

export const ReactButton = observer((props) => {
  return (
    <Button
      icon={props?.btnIcon ?? null}
      color="primary"
      disabled={(props?.dataSet?.current?.get('correctValue')?.length ?? 0) === 0 ?? true}
      onClick={props?.onClick}
      loading={props?.dataSet?.getState('isSubmit') ?? false}
    >
      {props?.btnText}
    </Button>
  );
});
