import React from 'react';
import { CheckBox, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import HotList from '../common/HotList';

const HotListTable = observer(({ds, mallType, hotType, customType }) => {
  return (
    +ds.current.get('hotZoneFlag') === 1 && (
      <div style={{ marginTop: 32 }}>
        <HotList
          dataSet={ds}
          groupAttribute={mallType === 'sigl' ? 1 : 0}
          headerType={hotType === 'banner' ? 1 : 2}
          headerId={ds.current.get('bannerId') || ds.current.get('customId')}
          customType={customType}
        />
      </div>
    )
  );
});

function HotConfig({
  dataSet,
  mallType,
  hotType,
  customType,
}) {
  return (
    <>
      <Form dataSet={dataSet} labelWidth="auto" labelLayout="float" style={{ marginTop: 16 }}>
        <CheckBox
          name="hotZoneFlag"
          help={intl
            .get('small.mallHomeConfig.view.isToSecond.hotWarning')
            .d('用户可在图片中新建多个热区,点击热区可跳转至相应配置的页面,此功能暂不支持移动端')}
          showHelp="tooltip"
        />
      </Form>
      <HotListTable ds={dataSet} mallType={mallType} hotType={hotType} customType={customType} />
    </>
  );
}

export default HotConfig;
