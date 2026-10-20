## 标段组件 - SectionPanel


> import SectionPanel from '@/routes/components/SectionPanel';

### props
| props fields | default value | type  | remark | add |
| :-------- | :----: | :----:| :---- | :----: |
| parentPage | {} |  object | 父级页面标识信息，例如报价，参与页面，标识自定 | change |
| isSection | false | boolean | 是否是分标段 *分标段逻辑暂时不定，改天定* |
| headerId | rfxHeaderId | string | 父级单据的主键名称 |
| isBatchMaintainSection | false | boolean | 父级是否点击了批量勾选按钮 |
| beforeOpenSection | null | function | 切换标段前执行操作函数，例如校验保存，必须返回true/false 来做切换前的校验表示 |
| switchNotification | null | boolean | 上一个函数如果返回false,代表检验或者保存不存在，此属性作为提示的文字 |
| onRef | null | function | ref |
| afterOpenSection | null | function | 切换标段成功后执行的参数 |
| openedSectionTitle/closedSectionTitle | 标段 | string/ReactElement | 打开/关闭左侧面板顶部的标题 |
| queryMain | () => {} | function | 查询询价单基础信息 | add | 
| displayName | null | string | 行展示 `name`
| popoverName | null | string | 气泡展示 `name`
| renderDisplay | () => {} | function | 渲染item | add | 
| renderPopover | () => {} | function | 渲染气泡 | add | 

|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
