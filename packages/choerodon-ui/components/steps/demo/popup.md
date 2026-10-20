---
order: 12
title:
  zh-CN: 气泡显示
  en-US: Popup
---

## zh-CN

气泡显示

## en-US

Popup

```jsx
import { Steps } from 'choerodon-ui';

const Step = Steps.Step;

ReactDOM.render(
  <div>
    <Steps type="popup" headerText="POPUP MODE" status="process">
      <Step status="close" title="Login" />
      <Step status="finish" title="Verification" />
      <Step status="process" title="Pay" />
      <Step status="wait" title="Wait1" />
      <Step status="wait" title="Wait2" />
    </Steps>
    <Steps type="popup" headerText="WITH DESCRIPTION" status="error">
      <Step status="finish" title="Login" description="This is a description." />
      <Step status="error" title="Verification" description="This is a description." />
      <Step status="close" title="Pay" description="This is a description." />
    </Steps>
    <Steps type="popup" headerText="WITH EXTRA" status="finish">
      <Step status="finish" title="Accept" extra="40" />
      <Step status="finish" title="Quality" extra="10" />
      <Step status="finish" title="Storage" extra="20" />
    </Steps>
  </div>,
  mountNode,
);
```
