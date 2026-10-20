import { createElement } from 'react';
import { Icon } from 'choerodon-ui';

import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { cuzQuery } from '@/services/scheduleSheetService';

// 处理聚合按钮
export function btnGroup(arr) {
  const showBtns = [];
  const foldBtns = [];
  arr
    .filter((item) => item)
    .forEach((btn, index) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;
      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary ' : 'default');
      const pushArr = index < 5 ? showBtns : foldBtns;
      if (!group && !btnComp) {
        pushArr.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, funcType: newFuncType, color: newColor, key: name },
        });
      } else {
        pushArr.push(btn);
      }
    });
  return foldBtns.length
    ? [
        ...showBtns,
        {
          name: 'more',
          group: true,
          children: foldBtns,
          child: createElement(Icon, { type: 'more_horiz' }),
        },
      ]
    : showBtns;
}

// 获取个性化标签默认值
export async function getCuzDefaultTab(params) {
  const code = params;
  const result = await cuzQuery([params]);
  // 获取有效显示且第一个默认激活tab信息进行初始化
  if (getResponse(result)) {
    const res = result[code];
    if (isEmpty(res)) return;
    const targetArr = (res.fields || []).filter((i) => i.visible);
    let target = (targetArr || []).find((i) => i.defaultActive === 1);
    if (targetArr?.length === 1) {
      // eslint-disable-next-line prefer-destructuring
      target = targetArr[0];
    }
    return target;
  }
}
