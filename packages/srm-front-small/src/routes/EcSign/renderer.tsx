import React from 'react';
import { Tag } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import { EcSignStatus } from './enum';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';

export const TagRenderer: React.FC<{status: String, ecSignStatusMeaning: String}> = ({status, ecSignStatusMeaning}) => {
  let color = '';
    switch (status) {
      case EcSignStatus.UNSIGNED:
      case EcSignStatus.TERMINATED:
        color = 'gray';
        break;
      case EcSignStatus.SIGNING:
        color = 'yellow';
        break;
      case EcSignStatus.SIGNED:
      case EcSignStatus.ACTIVATED:
        color = 'green';
        break;
      case EcSignStatus.REJECTED:
        color = 'red';
        break;
      default:
        color = 'gray';
        break;
    }
  return (
    <Tag className="ec-card-status text-overflow" color={color}>
      {ecSignStatusMeaning}
    </Tag>
  );
}

interface IButtonRenderProp extends ButtonProps {
  text: string,
  onClick: () => void,
  [x: string]: any,
};

export const ButtonRender: React.FC<{buttons: Array<IButtonRenderProp>}> = ({buttons}) => {
  return (
    <>
      {buttons.map(btn => (
        <Button
          icon={btn.icon}
          funcType={btn.funcType}
          color={btn.color}
          onClick={() => btn.onClick()}
        >
          {btn.text}
        </Button>
      ))}
    </>
  );
}
