---
order: 11
title:
  zh-CN: destroyAll
  en-US: Basic usage
---

## zh-CN

destroyAll 销毁所有弹出的Modal框。

## en-US

destroyAll Destroy all pop-up Modal boxes.

```jsx
import { Modal, Button } from 'choerodon-ui/pro';

function destroyAll() {
  Modal.destroyAll()
}

function destroyConfirm(index) {
  for (let i = 0; i < 4; i ++) {
    setTimeout(() => {
      Modal.confirm({
        title: 'Confirm',
        ignoreDestroyAll: i === index,
        children: (
          <Button onClick={destroyAll}>
            {index === undefined ? 'Click to destroy all' : 'Click to destroy all except ignore Modal'}
          </Button>
        ),
      })
    }, i*600);
  }
}

ReactDOM.render((<div>
  <Button onClick={destroyConfirm}>Open</Button>
  <Button onClick={() => destroyConfirm(0)}>Ignore modal</Button>
</div>), mountNode);
```
