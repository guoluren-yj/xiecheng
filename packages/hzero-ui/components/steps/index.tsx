import type { FunctionComponent } from 'react';
import React from 'react';
import C7NSteps from 'choerodon-ui/lib/steps';
import type { StepProps, StepsProps } from 'choerodon-ui/lib/steps';

export type {
  StepsProps, StepProps,
};

const Steps: FunctionComponent<StepsProps> = function Steps(props) {
  return <C7NSteps prefixCls="ant-steps" iconPrefix="anticon" {...props} />;
};

Steps.displayName = 'Steps';

const { Step, StepGroup } = C7NSteps;

export { Step, StepGroup };

type StepsComponent = typeof Steps & {
  Step: typeof Step;
  StepGroup: typeof StepGroup;
}

(Steps as StepsComponent).Step = Step;
(Steps as StepsComponent).StepGroup = StepGroup;

export default Steps as StepsComponent;
