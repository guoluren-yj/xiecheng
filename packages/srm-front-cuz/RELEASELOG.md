1.4.19:
- fix: 新版h0查询表单个性化form和dataSource随动
- feat: 必输类型的fx3Function在不必输且没有条件时返回undefined
- feat: getValue逻辑调整，适配moment
- fix: preAdapterInitialValue增加InputNumber类型的处理
- feat: 导出按钮适配H0
- fix: _DSs多余_
- feat: 按钮组Pro增加对hidden属性的处理
- feat: 按钮支持气泡提示
- feat: c7n个性化表格/表单/大数据表格支持拦截文本扩展字段的渲染
- feat: 标签页可以获取当前激活的key
- fix: 链接组件缺失参数问题修复&开设第四个按钮个性化的参数为当前行record
- feat: 表格头按钮支持helpMessage
- feat: h0折叠表单逻辑同c7n；折叠表单和标签页增加获取默认激活状态的钩子
- feat: 增加active/unactive两种条件状态，逻辑同notnull/isnull

1.4.18:
- feat: 移除hzero表单个性化的triggerOnBlur相关逻辑，替换为customizeWidgetHook
- feat: c7n个性化二维表格支持
- feat: c7n多行文本组件默认开启大小变更
- fix: 修复表格头按钮在渲染过程中丢失问题
- feat: flexlov改为class模式以适配rc-form,继承基础lov组件
- feat: 折叠表单个性化float模式下只读表单强制使用禁用输入框
- feat: autoSpread为false时报错
- fix: 去掉内部链接多余的?undefined
- fix: 修复表格头按钮标准字段名称缺失
- feat: 复选框和开关的扩展字段将会转换后端接口的值为0/1
- fix: 穿梭框横向滚动问题修复

1.4.15-alpha.x:
- feat: c7n-pro表单支持栅格模式
- feat: moment对象变更为从window对象上获取，个性化不再引入【重要变更】

1.4.13:
- feat: 链接组件新增按钮、附件类型
- feat: 支持单选框组件（c7n支持多选）
- feat: 所有扩展按钮回调增加第二参数ctxParams
- feat: 双tab增加角标数字显示控制
- feat: vTable默认传入customizedCode
- feat: 头部按钮组支持导出
- feat: c7nUpload替换为c7n-ui的Attachment
- perf: c7nLov回显逻辑优化
- feat: c7n按钮组个性化非pro版本扩展按钮更换为c7n-ui，另扩展按钮默认flat模式
- feat: c7nTab个性化支持嵌套分组

1.4.10
- feat: 公式默认值条件支持
- fix: c7nCustomize修复Form标准字段文本域组件属性无效
- perf: c7nCustomize重构


1.4.9
- fix: 修复c7n表单update事件内，relationMap取值错误
- fix: c7n个性化update事件isRelated逻辑调整
- fix: c7n表单添加主动更新逻辑，修复条件显示无效
- feat: 条件支持上下文和时间值
- fix: 修复旧版h0个性化ui接口出错无提示
- fix: 修复新版h0个性化表格默认值无效
- fix: 修复c7n值集多选保存后回显不正确
- fix: 链接组件帮助信息图标居中
- fix: 修复h0表格气泡显示异常
- fix: 修复条件选择时间值时页面崩溃
- fix: 兼容历史数据处理，sourceType不存在则等价于单元字段
- fix: 修复多选扩展值集字段选择单值时回显错误
- fix: 链接组件c7n字段类型调整为string
- feat: c7n个性化添加对值集ignore的控制项
- fix: 修复日期特殊值当月第一天取值错误
- feat: 对日期的条件判断增加截取左值的逻辑
- feat: 按钮组兼容函数子节点
- fix: c7n链接组件帮助信息受编辑属性影响的问题(prod.0)
- fix: h0下拉组件值集编码不存在时不查询值集数据(prod.1)
- fix: 修复新版h0表格个性化标准字段值集参数无效(prod.2)

1.4.9-alpha.x
- feat: fieldName支持fx(alpha.0)
- fix: 修复fieldNameFx缺失relationMap和othersMap(alpha.1)
- fix: 修复新版c7n表格标题fx无效(alpha.2)
- fix: 修复新版c7nLov带值无效(alpha.3)
- feat: c7n链接支持help(alpha.4)
- fix: 修复新版h0个性化表单、查询表单隐藏字段和校验逻辑冲突(alpha.5)
- feat: c7n表格loading时的逻辑前置(alpha.5)
- fix: 修复新版h0个性化表单、查询表单隐藏字段和校验逻辑冲突-移除hidden属性(alpha.6)
- fix: 修复链接和上传组件气泡配置无效(alpha.7)
- feat: h0表单个性化隐藏字段统一改为不清除值，扩展字段显示属性保留愿逻辑等价于配置为隐藏（非条件类的的隐藏）(alpha.8)
- fix: 新版c7n个性化隐藏字段逻辑调整(alpha.9)
- fix: 新版c7n个性化表单因加载顺序导致跨单元条件失效(alpha.10)
- fix: 新版c7n个性化computeRes使用mobx(alpha.10)
- fix: c7n个性化修复条件隐藏时，custIgnoreBak缺失问题(alpha.10)
- fix: 隐藏字段逻辑调整(alpha.11)
- fix: 修复c7n查询表单报错(alpha.12)
- fix: 修复多选lov扩展字段出现空项(alpha.13)
- fix: 修复查询类型单元设置不显示时报错(alpha.15)
- fix: 修复observable报错(alpha.18)
- fix: 修复新版h0表单隐藏字段时，依然清除字段值的问题(alpha.20)
- fix: 回退旧版本h0个性化隐藏字段的逻辑，回退新版h0查询表单个性化隐藏字段逻辑，不做支持(alpha.20)
- fix: 修复新版c7n表格个性化值集参数丢失问题(alpha.20)
- fix: 修复新c7n个性化transformResponse(alpha.20)
- fix: defaultValueCon变更为defaultValueConDTO；修复默认值公式上下文变量报错(alpha.21)
- fix: 移除新版h0查询表单个性化中的字段名称fx(alpha.21)
- fix: 修复label的dynamicProps错误混入defaultValue代码(alpha.21)
- fix: 修复新版h0个性化表格默认值公式无效(alpha.21)
- fix: 修复按钮组扩展按钮事件缓存key值错误(alpha.22)
- feat: clearProperties调整(alpha.22)

1.4.8
- release: 1.4.8
- fix: 修复按钮组隐藏无效(prod.0)
- fix: 修复链接组件条件禁用时页面不刷新(prod.1)
- fix: 重写新版c7n个性化update事件，以解决字段更新时无法刷新对应字段参数的问题(prod.2)
- fix: 修复新版c7nLov带值无效(prod.3)
- fix: 修复新版h0个性化表单、查询表单隐藏字段和校验逻辑冲突(prod.4)
- fix: 修复新版h0个性化表单、查询表单隐藏字段和校验逻辑冲突-移除hidden属性(prod.5)

1.4.8-alpha.x
- feat: 优化新版c7n个性化性能(alpha.0)
- fix: 修复c7n表格取消固定配置无效(alpha.0)
- fix: 链接扩展字段兼容编辑配置(alpha.0)
- feat: 查询单元配置接口统一添加getResponse(alpha.1)
- fix: hzero表格非链接组件禁用无效(alpha.1)
- feat: c7n链接组件改版，支持禁用和条件禁用(alpha.1)
- perf: 全局使用cloneElement代替直接修改props(alpha.2)
- fix: 新版c7n个性化移除遗漏的setState(alpha.3)
- fix: 全局使用cloneElement代替直接修改props-问题修复(alpha.4)
- fix: 全局使用cloneElement代替直接修改props-问题修复(alpha.5)
- fix: Hooks组件在特殊的条件渲染场景下不兼容rc-form，故更换FlexSelect为class组件(alpha.5)
- fix: 修复h0个性化标准字段丢失属性的问题(alpha.6)
- feat: 默认值公式配置时间偏移函数重写(alpha.6)
- fix: h0个性化标准字段个性化配置无效(alpha.7)
- fix: 修复新版c7n个性化缺失更新触发器逻辑(alpha.8)
- feat: 新版c7n个性化支持按钮组单元(alpha.8)
- feat: 链接组件的弹窗功能增加不可移动属性(alpha.9)
- feat: c7n上传组件增加直显模式(alpha.10)
- feat: 新版h0个性化增加按钮组(alpha.11)
- feat: 支持helpMessage配置(alpha.11)
- fix: 修复默认值公式配置获取单元字段报错(alpha.11)
- fix: 修复enableHelp报错(alpha.12)
- fix: 新版c7n个性化调整初始化dataSet的时机(alpha.13)
- fix: 新版c7n个性化表单标准字段气泡无效(alpha.14)
- fix: h0个性化标准字段气泡无效(alpha.14)
- fix: 新版c7n表格内置查询表单去掉初始化dataSet时reload的逻辑(alpha.14)
- feat: h0个性化的上传组件改用srm-front-boot(alpha.15)
- fix: 新版h0个性化标准字段配置无效(alpha.15)
- feat: 按钮组事件编码默认等于字段编码(alpha.16)
- fix: 新版h0个性化标准字段覆盖值集编码无效(alpha.17)
- fix: 修改renderRule的判断规则(alpha.18)
- fix: 修复h0下拉框类组件无法正常渲染翻译的问题(alpha.18)
- fix: 个性化配置页面引用下拉组件报错bug(alpha.19)
- fix: 按钮组屏蔽对标准按钮的覆盖逻辑(alpha.20)
- fix: 修复hzero个性化标准字段部分列显示空白(alpha.21)
- fix: 因c7n升级后值集无法选中，render内的addField统一更换为field.set(alpha.22)
- fix: 旧版h0个性化在dataSourceKey改变时添加transformDataSource钩子(alpha.22)
- fix: h0个性化扩展附件字段不受viewOnly控制(alpha.23)
- fix: 新c7n个性化扩展值集开启多选后无法使用，及多选下拉框选单个值无法使用(alpha.23)
- fix: 新c7n个性化标准值集字段默认值适配1.0-不支持多选(alpha.23)
- fix: 新版h0个性化表单修复getValue取不到值(alpha.24)
- fix: 新c7n个性化defaultValueMeta改为defaultValueMetadata(alpha.25)
- fix: 修复h0表单标准字段识别时报错(alpha.26)
- fix: 按钮组个性化单元按钮的唯一标识切换为data-name(alpha.26)
- fix: 新c7n个性化值集默认值defaultValue失效(alpha.27)

1.4.7
- release: 1.4.7

1.4.7-alpha.x/beta.x
- feat: c7n上传组件适配(alpha.0)
- fix: 修复新版c7n个性化查询单元queryField字段名称错误(alpha.1)
- feat: 新版c7n个性化对涉及ds初始化的单元类型添加initDSCallback钩子(alpha.2)
- feat: 新版个性化链接组件功能优化，支持弹窗和页面内跳转(alpha.3)
- feat: 新版个性化链接组件功能调整(alpha.4)
- feat: 旧版个性化链接组件功能更新(alpha.5)
- fix: 链接组件和上传组件问题修复(alpha.6)
- feat: c7n上传组件可以通过修改字段名称以调整链接文字(alpha.8)
- feat: c7n上传组件支持校验文件数量(alpha.10)
- fix: 新版个性化c7n上传组件修复必输无效(alpha.11)
- fix: 旧版h0个性化自定义校验无效；移除useNewValid逻辑；h0个性化补充上传组件的必输校验；链接弹窗统一使用c7n-pro的Modal.open(alpha.12)
- fix: c7n个性化表单文本模式修复值集渲染乱码；新版c7n个性化lov本体字段添加ignore: always属性(alpha.13)
- fix: 新版c7n个性化尝试修复标准lov字段默认值的兼容性问题;h0个性化上传必传校验状态错误的问题(alpha.14)
- feat: c7n上传组件校验逻辑调整；修复c7n新版个性化头行关联参数未实时更新；修复旧版h0个性化扩展字段丢失rules(alpha.15)
- fix: c7n旧版个性化表格上传组件缺失record(alpha.16)
- feat: c7n折叠表单单元支持控制优先展示字段(alpha.16)
- fix: 修复c7n折叠表单单元报错(alpha.17)
- fix: 折叠表单预展示字段适配后端接口(alpha.18)
- fix: 修复旧版个性化折叠面板和标签页报错(alpha.20)
- fix: 修复旧版h0个性化表单条件累必输无效;新版c7n个性化限制标准字段值集编码不可更改(alpha.21)
- fix: 折叠表单预展示字段适配后端接口(alpha.22)
- fix: 修复新版c7n个性化扩展字段缺失name属性(alpha.23)
- fix: 修复旧版h0个性化标准字段参数无法从其他单元获取的问题(alpha.24)
- fix: 修复新版c7n个性化清除字段时跨单元参数不会清除的问题;链接弹窗增减closeModal属性(alpha.25)
- feat: 新版h0个性化表达式默认值支持(alpha.27)
- feat: c7n新版个性化表达式默认值支持，默认值支持函数，修复旧版h0个性化缺失自定义校验,修复新版c7n个性化条件显示会丢失动态required的问题(alpha.28)
- fix: 修复新版h0个性化扩展字段逻辑中缺失dataSource(alpha.29)
- feat: 个性化全面放开对值集编码的修改限制(alpha.35)
- feat: c7n个性化添加适配复选框和开关组件的渲染逻辑(alpha.35)
- fix: 新版c7n个性化修复连续变更相同字段不触发界面更新的问题(alpha.37)
- fix: 旧h0个性化表格校验无效(alpha.37)
- fix: 修复旧c7n大数据表格个性化展示对象数据时报错(alpha.38)
- fix: 添加对个性化单元配置是否存在的判断(alpha.39)
- feat: 旧h0个性化补充更换cache中dataSource的逻辑(alpha.41)

1.4.6
- fix: c7n新版个性化放开之前注释的逻辑，以解决当前单内参数关联无效的问题？
- fix: 修复table漏掉上述关联参数的修复代码bug(1.4.6-- fix.1)
- fix: 修复新版c7n个性化隐藏字段时ignore值不正确(1.4.6-- fix.2)
- fix: 修复ignore属性对已创建的record无效(1.4.6-- fix.3)
- fix: 多选lov的onChange添加meaningMap参数(1.4.6-- fix.3)
- fix: 新版h0个性化lov扩展字段参数key不正确(1.4.6-- fix.4)

1.4.6-alpha.x
- fix: 修复c7n个性化只读模式下，字段值为null会报错(alpha.0)
- fix: 修复hzero个性化只读模式下，文本不会换行的问题(alpha.1)
- feat: 新版c7n个性化支持自动生成lov的关联字段(alpha.2)
- feat: 新版c7n个性化支持是否使用Output作为只读模式渲染组件的控制(alpha.2)
- fix: h0个性化修复标准字段参数配置会丢失代码参数的问题(alpha.3)
- feat: c7n个性化将上传组件临时改为h0的上传组件(alpha.4)
- fix: 针对新版c7n个性化支持自动生成lov的关联字段特性做向下兼容(alpha.4)
- feat: c7n表单兼容verticval下Output显示形式(alpha.5)
- fix: 修复c7n表单vertical模式下偶发报错问题(alpha.6)
- fix: 修复新版c7n表单赋予seq时会出现NaN的问题(alpha.7)
- fix: 修复新版c7n表单个性化在float模式下配置label不生效的问题(alpha.7)
- fix: 修复折叠面板header为函数时不执行的问题(alpha.8)
- fix: h0个性化文本域组件行数配置无效(alpha.8)
- fix: c7n新版个性化currentData取值错误问题(alpha.8)
- fix: c7n新版个性化修复大数据表格load数据造成的缓存不匹配问题(alpha.8)
- fix: c7n个性化上传组件适配只读模式(alpha.10)
- feat: 新c7n表单个性化补充enableCreate控制(alpha.11)
- fix: c7n个性化上传组件属性viewOnly逻辑判断错误(alpha.11)
- fix: 修复新版c7n表格查询表单值集参数取不到的问题(alpha.12)
- fix: 修复新版c7n的lov配置方案中，默认值无效问题(alpha.12)
- feat: h0个性化标准字段增加对文本域行数的控制，并预计在1.4.7之后的版本进行普遍意义上的支持(alpha.13)
- feat: FlexSelect更换值集统一查询接口(alpha.14)
- feat: 新版c7n个性化LOV组件适配多选模式(alpha.14)
- feat: 新版c7n个性化默认值支持标准字段自控(alpha.15)
- fix: 新版c7n个性化值集在新配置方案下参数无效的问题(alpha.16)
- fix: c7n表格只读字段依旧可编辑(alpha.17)
- fix: h0只读扩展字段需要第二次渲染才显示值(alpha.17)
- fix: h0只读扩展字段与lov带值逻辑冲突(alpha.18)
- fix: 标签页与折叠面板不适配三元表达式返回null的场景(alpha.18)
- fix: c7n新版个性化lov带值逻辑无效的问题(alpha.18)
- fix: h0只读字段错误的对input组件赋予children属性(alpha.19)
- fix: c7n表格个性化的上传组件（临时方案）改为使用render渲染(alpha.19)
- fix: c7n新版个性化表单默认值fx临时解决？(alpha.20)
- fix: 多选lov修复勾选后先跨页再穿梭右侧列表无法显示问题(beta.0)
- fix: 多选lov修复先勾选n（n>1）个再删掉一个无法穿梭到右侧表格的问题(beta.0)

1.4.5
- fix: 新c7n个性化大数据表格修复扩展字段readOnly模式对下拉框、多选lov值为数组或对象的兼容问题

1.4.5-alpha.x
- fix: 旧c7n个性化表单、折叠表单、表格修复扩展字段readOnly模式对下拉框、多选lov的兼容问题(alpha.0)
- fix: 新c7n个性化表单、折叠表单、表格、大数据表格修复扩展字段readOnly模式对下拉框、多选lov的兼容问题(alpha.0)
- fix: 旧c7n个性化表单、折叠表单、表格修复扩展字段readOnly模式对下拉框、多选lov值为数组的兼容问题(alpha.1)

1.4.4
- fix: 新c7n个性化对多选下拉框的兼容bug
- feat: 加入自定参数逻辑
- fix: 修改所有ts和tsx文件中的utils/utils引用路径

1.4.4-beta.x
- feat: 新c7n个性化取消回退(beta.0)
- feat: 新c7n个性化修复bind与个性化参数兼容问题，表单增加自动创建record开关(beta.1)
- fix: hzero表单个性化强制覆盖gutter属性，支持配置(beta.2)
- fix: 新版h0个性化表格的dataSource改为从props中获取(beta.3)
- fix: 新c7n个性化修复：1.表格dataSource为空时报错bug；2.折叠表单渲染重复字段bug；3.字段变化时lov动态参数取值bug(beta.4)
- fix: 新个性化修复条件计算时括号误判为错误表达式的问题(beta.4)
- fix: 新c7n新增并默认开启全局更新机制(beta.5)
- fix: 所有标签页和折叠面板默认激活功能修复(beta.6)
- fix: hzero默认值无法通过setFieldsValue清除当前值bug修复(beta.6)
- fix: 新版hzero表格个性化修复多余label的bug(beta.6)
- fix: 新版c7n个性化在ds处理阶段过滤掉不显示字段(beta.7)

1.4.4-alpha.x
- fix: 修复hzero表格个性化缺失index参数(alpha.0)
- fix: 修复c7n查询表单个性化this指向错误(alpha.1)
- fix: 修复c7n表格个性化未配置部分字段顺序时位置错乱(alpha.2)
- fix: 修复c7n新个性化丢失代码中dynamicProps问题(alpha.3)
- fix: 修复c7n新个性化表单触发create和load事件时崩溃的问题(alpha.3)
- fix: 修复c7n新个性化字段隐藏失效bug(alpha.4)
- fix: 新旧c7n内置查询表单增加字段排序逻辑(alpha.5)
- feat: 新版h0个性化更新(alpha.6);
- fix: 旧版h0个性化修复变量名拼写错误(alpha.6)
- fix: 新版c7n个性化字段绑定逻辑错误问题(alpha.7)
- fix: 修复c7n个性化扩展字段缺失跨行跨列配置(alpha.8)
- feat: 新版hzero-ui个性化部分功能发布测试版(alpha.9)
- feat: 新版hzero-ui个性化及c7n与hzero-ui混合个性化发布(alpha.12)【-基于alpha.10与alpha.11新版c7n回退部分逻辑的基础上发布】

1.4.3
- fix: 修复c7n表单个性化条件渲染触发报错

1.4.3-alpha.x
- fix: 个性化重构--部分
- fix: c7n个性化文本域组件行数配置无效(alpha.2)
- fix: 重构后的个性化体系完善(alpha.2)
- fix: hzero-ui个性化修改只读字段的lov带值逻辑-测试版(alpha.2)
- feat: 新增clearProperties函数用于清除this上的数据(alpha.2)
- fix: 修复clearProperties未绑定this(alpha.3)
- fix: 补充重构个性化缺失的工具函数(alpha.5)
- fix: 修复新版c7n个性化表格内置查询表单报错(alpha.6)
- fix: 回退hzero-ui个性化lov带值逻辑，回退扩展只读字段取值滞后修改(alpha.6)
- fix: 修复hzero-ui个性化表单引入的补偿逻辑报错(alpha.7)
- fix: 修复c7n旧版个性化只读文本无法翻译(alpha.8)
- fix: c7n新版个性化调整条件类配置的dynamicProps实现及显示配置逻辑优化(alpha.9)

1.4.2-alpha.x
- fix: hzero-ui个性化默认值修复会覆盖后端真实数据的问题(alpha.1)
- fix: c7n个性化表单和表格变量取错修复(alpha.2)
- fix: 大数据表格表头不随render重新渲染(alpha.2)
- fix: hzero-ui表单增加对创建页面的兼容性选项(alpha.2)
- fix: c7n个性化自定义校验方案调整(alpha.3)
- fix: c7n个性化大数据表格只读模式优先展示meaning字段(alpha.5)
- fix: hzero-ui个性化取消精度默认给0的设定(alpha.6)
- fix: hzero-ui个性化修复扩展只读字段取值滞后问题(alpha.7)
- fix: hzero-ui个性化useNewValid修复字段未注册问题(alpha.8)
- fix: hzero-ui个性化修复表格默认值设置不进去的问题(alpha.8)
- fix: c7n表单和折叠表单补充缺失的跨行配置(alpha.9)

1.4.1
- feat: 通过useNewValid控制是否使用自定义校验相关修改的个性化逻辑

1.4.1-alpha.x
- fix: 修复大数据表格个性化隐藏失效
- fix: 修复折叠面板和标签页配置数量大于代码中存在的数量时报错
- perf: 优化c7n表格内置的查询表单个性化
- perf: c7n个性化代码优化
- fix: 修改c7n-pro复选框类组件选中/未选中值为1/0
- fix: 修复c7n折叠面板报错
- fix: 修复c7n数字组件step为NaN的问题
- fix: c7n折叠表单完善占位字段支持
- fix: c7n普通表单完善占位字段支持
- fix: c7n折叠表单修复隐藏字段label不消失的问题
- fix: c7n大数据表格无法固定
- fix: c7n表格/大数据表格取消固定无用的问题
- fix: 修复隐藏必输字段界面上有*的问题
- feat: c7n表单和折叠表单取消占位设定，改为以配置虚拟字段的方式添加占位组件
- fix: 调整c7n字段原有配置与个性化配置的合并逻辑
- fix: hzero-ui个性化默认值移除配置的默认值与代码默认值不等的判断
- fix: 调整c7n表单和表格隐藏字段逻辑
- fix: c7n对默认值按照组件类型进行格式转换
- fix: hzero-ui个性化普通表单和表格重做自定义校验逻辑
- fix: 修复折叠面板和标签页报错
- fix: 修复hzero-ui个性化自定义校验初始状态不校验的问题(alpha.11)
- fix: 修复hzero-ui个性化表格自定义校验导致setFieldsValue失效的问题(alpha.12)
- fix: 修复hzero-ui个性化表格扩展字段多出校验错误红框的问题(alpha.12)
- perf: c7n表格个性化优化(alpha.12)--alpha.19已回退
- fix: 修复hzero-ui个性化表格扩展字段表单无值问题(alpha.13)
- fix: 修复hzero-ui个性化页面刷新后旧数据未清除问题(alpha.14)
- fix: 修复hzero-ui表格个性化触发因字段格式触发页面崩溃(alpha.15)
- fix: 修复hzero-ui个性化旧数据未清除问题(alpha.16)
- fix: hzero-ui表单和表格个性化在initialValue变更时，将字段值设置为initialValue--自定义校验问题修复(alpha.19)
- fix: hzero-ui个性化修复自定义校验与默认值的兼容问题--默认值处理逻辑变更，解决数据来自于后端时默认值无效的问题(alpha.20)
- fix: 修复c7n个性化数字组件精度校验bug(beta.0)
- fix: hzero-ui表格个性化对扩展字段增加$form是否存在的检验(beta.0)
- fix: hzero-ui表单和表格个性化移除默认的清除缓存逻辑(beta.0)
- fix: hzero-ui个性化默认值生效判断调整(beta.1)
- fix: hzero-ui个性化表单跨列增加特殊类标记(beta.1)
- feat: hzero-ui表单和表格个性化新增对cacheKey的控制(beta.2)
- feat: hzero-ui表格个性化修复新增行时触发上一行数据清空的问题(beta.3)
- fix: hzero-ui表格个性化报错(beta.4)
- fix: hzero-ui表单和表格个性化移除clearCache回调参数，默认取当前dataSource(beta.5)
- fix: c7n-ui修复折叠表单showLineds直接覆盖嗲吗逻辑(beta.5)

1.4.0
- feat: 默认值fx逻辑完善
- feat: 折叠面板和标签页新增默认激活配置
- feat: 新增c7n折叠表单类型个性化工具
- fix: 修复上传组建在只读模式下缺失uuid
- fix: 扩展文本字段注册到表单内
- feat: 增加获取单元配置的方式
- fix: 修复添加扩展字段并设置默认值时c7n个性化崩溃问题
- fix: 修复c7n表格load报错
- fix: 修复折叠表单字段无法完全隐藏
- fix: 适配大数据表格个性化

1.3.8-alpha.0
- fix: 修复c7n大数据表格个性化报错
- fix: 修复c7n表格个性化性能问题

1.3.7-alpha.6
- fix: 链接组件无刷新跳转功能回退至修改前

1.3.7-alpha.5
- fix: 链接组件无法跳转(修复引号))

1.3.7-alpha.4
- fix: hzero个性化扩展字段取值逻辑调整，修复部分情况下初次渲染无值的问题

1.3.7-alpha.3
- fix: 链接组件无法跳转

1.3.7-alpha.2
- fix: 修复多选lov全选查询少查一页的问题
- perf: 调整链接组件页面内跳转不进行整体刷新

1.3.7-alpha.1
- feat: 适配c7n大数据表格，个性化函数名 `customizeVTable`
- fix: 修复c7n表格扩展字段渲染逻辑潜在问题（editor和renderer优先级问题）

1.3.7
- fix: 日期格式配置支持文本/只读模式
- fix: hzero-ui个性化修复标准字段placeholder无效

1.3.6-10
- feat: c7n表格和表单支持readOnly属性

1.3.6-9
- fix: 修复hzero表格标准字段无法渲染数字0

1.3.6-7
- fix: 修复表格扩展字段不受readOnly属性控制

1.3.6-6
- fix: 修复hzero个性化表单最大列配置失效
- fix: 修复c7n表格扩展字段visible为-1时依旧显示的问题

1.3.6-5
- feat: 条件计算增加日期不等判断

1.3.6-4
- feat: 条件计算增加日期判等

1.3.6-3
- fix: 修复c7n表单扩展字段报错

1.3.6-2
- fix: 修复下拉组件出现一直loading的情况

1.3.6-1
- fix: 修复lov多选组件左侧列表切换分页大小时显示异常

1.3.6
- feat: hzero-ui表格类型的单元增加可排序标识处理
- feat: 表单增加跨列配置
- feat: 组件配置增加placeholder, c7n表格editor为true时不支持placeholder

1.3.5-6
- fix: 修复hzero个性化下拉框组件部分情况下触发页面崩溃

1.3.5-5
- fix: 修复c7n个性化表单字段因别名配置错误触发页面崩溃

1.3.5-4
- fix: 修复组件类型配置不存在时，c7n用string类型覆盖原有type的问题
- feat: （c7n扩展字段）日期组件会根据选择的日期格式控制是否启用时间选择，时间选择固定24小时制
- fix: c7n链接组件支持配置变量
- fix: 修复表格字段配置必输时，缺少相应的样式
- fix: 修复hzero个性化下拉框组件多次查询值集的问题
- fix: 修复c7n表单个性化部分字段未配置位置导致字段乱序

1.3.5-3
- perf: c7n个性化事件监听添加方式调整
- feat: hzero-ui个性化适配标准代码一个字段对应多个组件的场景
- feat: hzero-ui个性化优化下拉组件多次查询值集编码

1.3.5-2
- fix: c7n-ui隐藏字段时必输校验仍生效的问题
- fix: c7n-ui修复表格个性化load时必输配置不生效

1.3.5、1.3.5-1
- fix: hzero-ui个性化修复标准字段自定义校验无限制添加问题
- fix: hzero-ui个性化扩展字段componentProps缺失dataSource问题
- fix: 修复hzero-ui和c7n-ui自定义校验后端返回null值时页面崩溃
- fix: c7n-ui隐藏字段时必输校验仍生效的问题（实际未解决）

1.3.4-6
- fix: 修复用户个性化多语言缺失
- perf: hzero-ui个性化使用ts改写
- feat: hzero-ui个性化配置查询时加入字段排序

1.3.4-5
- fix: 修复hzero-ui表单个性化标准字段lov默认值不展示
- fix: 修复hzero-ui表单个性化标准字段lov默认值翻译为空时不展示默认值
- fix: 修复标准字段多选lov组件默认值翻译无效
- fix: 修复默认值某些情况下会覆盖接口数据的问题


1.3.4-4
- fix: c7n查询表单标准字段被错误处理为扩展字段
- feat: c7n查询表单组件配置取个性化配置和代码配置的并集，同名且非空的属性个性化配置优先级高于代码配置
- fix: hzero-ui时间传输格式调整，统一为YYYY-MM-DD 00:00:00(或HH:mm:ss)
- fix: hzero-ui个性化parseContentProps函数缺失部分字段配置；

1.3.4-3
- fix: 修复表格扩展字段缺失值集映射配置；优化扩展字段配置处理逻辑
- fix: 修复表单隐藏字段引起字段取值错误；修复初始值错误的将undefined转换为0；修复链接组件变量替换造成的无效表单注册；连接组件标题支持变量配置
- fix: 修复标准字段lov默认值缺失meaning
- fix: 修复hzero表格个性化工具参数错位
- feat: 多选lov全选改为追加方式；个性化工具函数增加readOnly控制；表格和表单扩展字段增加特定className
- feat: hzero个性化链接组件强制使用组件渲染；个性化移除自动生成filterForm功能
- fix: 修复lov多选左侧重置点击无效
- fix: hzero个性化修复强制组件渲染时，value取值错误
- feat: hzero-ui个性化精度控制支持文本模式
- feat: 个性化日期传输格式调整
- feat: 单元配置查询支持手动方式
- feat: 参数配置支持url类型
- fix: hzero个性化修复缓存取值问题
- feat: ui接口支持query参数
- feat: 修复校验功能拿不到当前单元数据
- feat: 更新依赖；hzero个性化日期组件统一数据格式
- fix: 修复表格lov多选拿不到参数
- fix: 修复表格只读字段无值问题；修复表单扩展字段缺失wrapper；修复c7n表格扩展字段编辑异常问题
- fix: 修复c7nlabel显示异常
- fix: 修复lov多选不受isEdit控制
- fix: 修复c7n查询表单label缺失；修复hzero合并代码字段配置时触发页面崩溃
- fix: 调整只读的实现方式；修复lov多选弹框有INT查询字段时崩溃；修复上下文参数取值逻辑错误
- fix: 修复多选弹框宽度错误；全选数据时更改为依据左侧查询全选
- fix: 修复扩展字段错误显示为编辑组件；修复lov多选分页大小错误
- feat: 多选lov切换实现方案；修复条件计算触发页面崩溃；上传组件和多选lov始终使用组件渲染
- fix: 条件类控制以当前form为准，仅显示字段取form和dataSource的并集
- fix: 修复链接组件缺失form、dataSource
- fix: 修复多选组件在文本状态的翻译
- fix: 下拉多选修复清除操作会存空字符串问题
- fix: 补充缺失的依赖
