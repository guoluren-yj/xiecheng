---
order: 10
title:
  zh-CN: 显示时区
  en-US: show time zone
iframe: 400
across: true
---

## zh-CN

显示时区。

## en-US

show time zone.

```jsx
import { configure } from 'choerodon-ui';
import { Form, TimePicker, DateTimePicker, Row, Col, SelectBox } from 'choerodon-ui/pro';
import moment from 'moment';

const { Option } = SelectBox;

const App = () => {
  const [value, setValue] = React.useState(() => moment());
  const [isGMT, setIsGMT] = React.useState(true);
  const timeZone = React.useMemo(() => {
  }, [isGMT]);
  React.useEffect(() => {
    configure({
      formatter: {
        timeZone: isGMT ?
          ' ([GTM]+8)' :
          (moment, { boundaryType }) => {
            if (boundaryType) {
              return moment.format('ZZ');
            }
            return <span key="timeZone" style={{ color: 'gray' }}> {moment.format('Z')}</span>;
          }
      }
    });
  }, [isGMT]);
  return (
    <Form>
      <SelectBox value={isGMT} onChange={setIsGMT}>
        <Option value>GMT</Option>
        <Option value={false}>UTC</Option>
      </SelectBox>
      <DateTimePicker value={value} min={new Date()} onChange={setValue} />
      <TimePicker value={value && value[0]} min={new Date()} onChange={v => setValue(v ? [v] : [])} timeZone="ZZ" />
    </Form>
  );
}

ReactDOM.render(<App />, mountNode);
```
