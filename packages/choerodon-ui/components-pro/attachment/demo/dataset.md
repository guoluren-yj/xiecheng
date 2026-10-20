---
order: 2
title:
  zh-CN: 绑定数据源
  en-US: DataSet Binding
---

## zh-CN

绑定数据源

## en-US

DataSet Binding

````jsx
import { Attachment, DataSet, Form, Button } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(() => new DataSet({
    fields: [{ name: 'attachment', type: 'attachment', label: '技术附件', min: 3, max: 9 }],
  }), []);
  const props = {
    accept: ['.deb', '.txt', '.pdf', 'image/*'],
    name: 'attachment',
    showValidation: 'tooltip',
    viewMode: 'popup',
    style: {
      maxWidth: 100,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    fileSize: 1000,
  };

  React.useEffect(() => {
    ds.loadData([{ attachment: '4c74a34a-fa37-4e92-be9d-5cf726fb1472' }]);
  }, []);

  return (
    <Form dataSet={ds} labelLayout="float">
      <Attachment {...props} />
      <Button type="submit">submit</Button>
    </Form>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
