# AI技术赋能下的作物灾害智慧监测预警系统
## 软件使用说明书
版本号： 1.0.4
终端类型： Web 浏览器访问（PC / 平板 / 手机）
开发单位： 河北地质大学 · 坤灵智巡创工队
线上地址： http://82.157.234.123:88
主要技术： Vue 3、TypeScript、Ant Design Vue、ECharts、Leaflet；业务数据由后端接口提供；图片分析由服务器端分析服务提供。
适用对象： 农业合作社管理人员、农技推广人员、项目评审、教学培训及系统维护人员。
# 第一章 系统简介
## 1.1 系统做什么
AI技术赋能下的作物灾害智慧监测预警系统用于作物灾害相关的监测、预警与辅助决策，在一张 Web 页面里完成以下工作：
1. 在地图上查看监测点位置与状态（状态机中文显示：正常 / 预警 / 严重 / 离线 / 维护中 / 未知）；
2. 查看传感器、无人机、气象、GIS 等分类农情数据；
3. 上传作物图片做病害/灾害分类，返回识别结果并写入预警列表；
4. 新建、处理、删除预警记录；
5. 针对待处理预警查看监测点信息与系统给出的处置建议。
系统面向作物灾害监测、农情数据展示和预警处置等业务场景，可用于农业合作社日常管理、农技推广辅助研判、教学培训及创新创业项目展示。
## 1.2 功能模块一览
| 导航菜单 | 路由 | 主要功能 |
|----------|------|----------|
| 首页 | /home | 监测点数量、待处理预警数、系统状态汇总、最新预警列表、快捷入口 |
| 相关数据 | /related-data | 分传感器、无人机、气象、GIS 四类农情 Tab；地图类支持 NDVI 期次对比与 GIS 点选查墒情；气象页按监测站查看九类读数；底部分析条随 Tab 与操作变化；简报按钮走演示流程 |
| 灾害实时监测 | /map | Leaflet 地图、监测点聚类、监测点详情、手动触发/标记解决 |
| 智能分析 | /analysis | 上传图片、选择作物与分类、调用分析接口并生成预警 |
| 灾害预警 | /warnings | 预警列表、新建/标记状态/删除 |
| 智慧决策 | /decision | 待处理预警列表、小地图定位、监测数据与建议文案 |
| 关于我们 | /about | 团队与产品说明、技术栈展示、联系邮箱 |
## 1.3 统一领域术语
为保证说明书表述统一，本文采用以下领域术语：

| 术语 | 含义 |
|------|------|
| 监测点 | 地图上的农田或果园监测位置，包含经纬度、温度、土壤湿度和状态信息 |
| 农情数据 | 传感器、无人机遥感、气象、GIS 等用于判断作物长势和灾害风险的数据 |
| 墒情 | 土壤湿度 / 土壤含水量，单位一般为 %；GIS 模块中热力图与查值结果均表示此含义 |
| NDVI | 归一化植被指数，用于反映作物长势；无人机 Tab 以热力图形式展示 |
| 预警记录 | 系统或用户创建的一条风险提示记录，通常关联到某个监测点 |
| 待处理预警 | 尚未完成处置的预警记录，需要继续跟踪或现场核查 |
| 已处理预警 | 已完成处置或确认闭环的预警记录 |
| 智能分析 | 上传作物图片后生成识别结果、风险等级和农技建议的过程 |
| 处置建议 | 系统根据预警级别、监测值和规则模板生成的辅助处理建议 |
| 农田小气候读数 | 气象 Tab 中按监测站展示的土壤与近地大气九类实时指标 |
下文提到具体菜单时保留界面原名，例如「相关数据」「灾害实时监测」「灾害预警」。
## 1.4 运行环境与部署说明
系统采用浏览器/服务器架构，用户通过 Web 浏览器访问前端页面，业务接口和图片分析服务由服务器端提供。

| 项目 | 配置 |
|------|------|
| 推荐服务器 | 云服务器或本地局域网服务器 |
| CPU | 4 核 |
| 主频 | 2.50 GHz |
| 内存 | 16 GB |
| 硬盘 | 220 GB 云盘 |
| 运行内容 | 托管前端构建产物；提供业务接口、图片分析接口和静态资源访问 |
服务组成：
1. 前端页面服务： 提供登录、首页、数据展示、地图监测、智能分析、预警管理、智慧决策等页面。
2. 业务接口服务： 提供用户登录、监测点、预警记录、农情数据等业务数据接口。
3. 图片分析服务： 处理作物图片上传和识别请求，返回识别结果、风险等级和建议内容。
正式部署时可根据服务器环境配置域名、端口、反向代理和 HTTPS 证书。用户侧无需安装客户端软件，只需使用浏览器访问系统地址。
## 1.5 访问与登录
1. 使用 Chrome、Edge 等浏览器打开系统访问地址：http://82.157.234.123:88。
2. 在登录页输入手机号、验证码，选择登录角色，勾选用户协议后点击「进入系统」。
3. 测试账号： 手机号 `13800000000`，验证码 `2026`；备用密码兼容 `123456`。
登录成功后进入首页 `/home`；失败时页面会提示错误信息，请核对手机号、验证码、角色或备用密码是否填写正确。
# 第二章 登录与退出
## 2.1 登录
### 2.1.1 界面说明
登录页为左右分栏：左侧为作物主题图，右侧为「农情通行登录」表单（深色玻璃风格）。窄屏下自动改为上下布局。
![[attachments/2.1.1.png]]
### 2.1.2 操作步骤
1. 在「手机号」框输入测试手机号（见 1.5 节）。
2. 在「验证码」框输入 `2026`。
3. 在「登录角色」中选择管理员、农技员或合作社。默认角色为农技员。
4. 如需使用备用登录方式，可在「备用密码」中输入 `123456`。
5. 勾选「我已阅读并同意用户协议」。
6. 点击「进入系统」。
成功：提示「登录成功！」并跳转首页。失败：提示登录失败，请检查手机号、验证码、角色或备用密码是否填写正确。
### 2.1.3 角色说明
当前登录角色分为管理员、农技员、合作社。合作社角色偏查看首页和关于页，农技员可进入监测、分析、预警、决策等业务页面，管理员保留最高权限。登录后，Header 右侧显示当前用户名（极窄屏仅显示头像）。
### 2.1.4 注意
1. 需能访问系统部署地址及后端服务。
2. 会话状态保存在浏览器本地，关闭页面前建议主动退出。
## 2.2 退出
1. 点击页面右上角用户头像/用户名区域，打开下拉菜单。
2. 选择「退出登录」。
3. 在确认框中点击「确认」。
退出后清除本地登录状态并返回登录页。
![[attachments/2.2.png]]
# 第三章 主界面说明
## 3.1 布局结构
主界面由三部分组成：顶部 Header、导航区、主内容区。全站采用深绿色玻璃拟态（Glassmorphism）视觉风格，标题使用衬线字体，正文使用系统无衬线字体。
### 3.1.1 顶部 Header
1. 左侧： Logo + 系统名称。PC 端显示全称「AI技术赋能下的作物灾害智慧监测预警系统」，窄屏显示简称「AI作物灾害监测预警系统」。点击 Logo 回首页。
2. 中间（PC/平板）： 全局搜索框（按菜单、监测点、预警等关键词检索）。
3. 右侧： 用户菜单（个人中心、系统设置、退出登录等入口以界面为准）。
窄屏（宽度 ≤992px）： 左侧出现 ☰ 汉堡按钮，点击打开左侧抽屉导航；搜索框在 ≤576px 时隐藏以节省空间。
![[attachments/3.1.1.png]]
### 3.1.2 导航栏
1. PC 端（宽度 >992px）： 顶部水平导航栏，7 个菜单项；当前页高亮。
2. 平板/手机（宽度 ≤992px）： 水平导航栏隐藏，通过 Header 汉堡按钮打开 「功能导航」抽屉，点击菜单项后自动关闭并跳转。
路由对照见第一章表格。
![[attachments/3.1.2.png]]
### 3.1.3 首页内容
首页上方为欢迎区，配有「实时监测」「处理预警」「智能分析」三个快捷按钮；中部为核心指标区，展示监测点总数、待处理预警条数和系统状态（随待处理预警最高级别变化，如正常、需关注、高风险等）；下方为最新预警列表，列出最近若干条记录的监测点、内容与时间，无数据时显示统一空状态提示。
窄屏布局： 欢迎区、指标区、预警列表改为单列纵向排列；指标卡片在手机上为单列显示。
![[attachments/3.1.3.png]]
### 3.1.4 地图说明
「灾害实时监测」「相关数据（无人机/GIS）」「智慧决策」中使用 Leaflet 地图，底图由公共模块统一创建。监测页支持 marker 聚类并可操作弹窗；相关数据 · GIS 的监测点弹窗为只读；智慧决策用于单点定位。
状态颜色与中文含义：

| 显示 | 含义 | 颜色 |
|------|------|------|
| 正常 | 指标处于设定阈值范围内 | 绿色 |
| 预警 | 温度或土壤湿度进入关注区间 | 橙色 |
| 严重 | 达到高风险阈值，需优先处置 | 红色 |
| 离线 | 设备无有效数据或连接异常 | 灰色 |
| 维护中 | 人工维护状态 | 紫色 |
| 未知 | 状态字段缺失或未识别 | 蓝色 |
## 3.2 搜索与快捷入口
1. 首页三个按钮分别跳转 `/map`、`/warnings`、`/analysis`。
2. Header 搜索：输入关键词后回车或点击搜索（见 3.1.1）；平板可用，极窄屏隐藏。
![[attachments/3.1.1.png]]
# 第四章 功能操作说明
本章按系统导航和业务流程介绍各功能怎么用，会交代从哪进、页面上有什么、常见操作怎么点，供评审演示和日常操作参考。截图占位符导出 Word 时可换成实机界面图。
## 4.1 登录与身份选择
适用对象： 农技员、合作社管理人员、管理员。
进入方式： 使用浏览器打开系统访问地址，进入登录页面。
### 4.1.1 操作步骤
1. 在「手机号」中输入测试手机号 `13800000000`。
2. 在「验证码」中输入 `2026`。
3. 在「登录角色」中选择管理员、农技员或合作社。
4. 如需使用备用登录方式，可在「备用密码」中输入 `123456`。
5. 勾选用户协议后点击「进入系统」。
登录成功后进入首页，页面右上角显示当前用户信息；登录失败时，系统会给出错误提示。
![[attachments/2.1.1.png]]
### 4.1.2 角色权限说明
管理员可访问系统主要功能，用于综合管理和功能配置；农技员可进入监测、分析、预警和决策等业务页面；合作社主要用于查看首页概览和基础信息。合作社角色登录后（见图），导航栏仅显示「首页」「关于我们」两个菜单，无监测、分析、预警等业务入口，主内容区仍为首页概览与快捷按钮。
![[attachments/4.1.2.png]]
## 4.2 首页概览
登录后默认落在「首页」，也可随时点 Logo 或顶栏「首页」回来；评审人员和合作社管理人员常从这里看总体情况。
### 4.2.1 页面内容
首页用于展示系统总体运行情况，自上而下依次为欢迎区与系统简介文案、监测点总数与待处理预警数及系统状态等核心指标、最新预警记录列表，以及「实时监测」「处理预警」「智能分析」三个快捷入口。当没有预警记录时，系统显示统一空状态提示。
![[attachments/3.1.1.png]]
### 4.2.2 基本操作
想查地图就点「实时监测」，要处置预警点「处理预警」，上传识别走「智能分析」。需要找菜单、监测点或某条预警时，在 Header 搜索框输入关键词即可。
窄屏布局： 欢迎区、指标区、预警列表改为单列纵向排列；指标卡片在手机上为单列显示。
## 4.3 相关数据
顶栏点「相关数据」进入。本页把传感器、无人机遥感、气象和 GIS 几类农情放在一起，主要看长势、墒情和灾害风险。
无人机与 GIS 两个 Tab 使用可缩放、可拖拽的交互地图展示遥感热力图（卫星底图 + 影像叠加）；GIS Tab 上还标有监测站圆点，可与地面传感器读数对照。两个 Tab 的地图均可用滚轮或左上角按钮缩放、拖拽平移；切换地块或影像日期后，视野会自动适应当前图层范围。
### 4.3.1 切换农情数据源
PC 上在右侧点「传感器数据(地)」「无人机遥感(空)」「气象数据(天)」「GIS 数据(图)」之一；平板/手机则在主内容区下方以 2 列或全宽按钮切换。主区域会即时换成对应图表或地图，初次加载可能出现短暂遮罩。若从 GIS Tab 切走再回来，「最近一次地图查墒情」相关提示会清空。
### 4.3.2 传感器数据
切到「传感器数据(地)」后，页头显示「物联网传感器监控」，副标题为「最近 7 天环境参数趋势」。中间是一幅折线图，横轴为近 7 个自然日，纵轴为当日报警条数；鼠标移到某个日期上，可弹出 Tooltip 查看具体次数。页面底部的分析条会统计近期高风险预警数量，并引用最新一条未处理预警的摘要。
![[attachments/4.3.2.png]]
### 4.3.3 气象站实时数据
「气象数据(天)」Tab 用来查看单座监测站当下的土壤与近地大气状况。页头主标题固定为「气象站实时数据」；副标题会在监测站名称后接上「土壤墒情与局地小气候实时监测」，例如选中河间站时类似「监测站 · 河间市 · …」，换站后这行文字同步更换。
操作方面，在右侧点「气象数据(天)」，用主区右上角的监测站下拉框在河间、雄县、栾城三座演示站之间切换（初次进入默认河间）；阅读中间九宫格卡片上的九类读数，并留意底部分析条是否随站点变化。若刚从「无人机遥感」过来，且之前选过带监测站的地块，进入本 Tab 时会自动切到同一座站，便于对照空地两类信息。
每个站都显示完整九项。前三个偏地下：`土壤体积含水率`（%vol）、`10cm土壤温度`（℃）、`土壤EC电导率`（μS/cm）；后六个偏近地面大气：`空气温度`、`空气相对湿度`（%RH）、`瞬时风速`（m/s）、`风向`（如 185°偏南风）、`大气气压`（hPa）、`小时降雨量`（mm，无雨时常显示「0.0 mm（无降水）」）。
本 Tab 的数值由服务端演示数据提供，与地图上三个监测站圆点同名同站。雄县整体偏干、栾城偏湿，和 GIS 查墒情、监测点详情里的土壤湿度设定一致，用来演示「换一座站，整屏读数一起换」的效果，不等同于接入真实国家气象站网。
![[attachments/4.3.3.png]]
### 4.3.4 无人机遥感（NDVI 地图）
#### 界面组成
地图左上角提供地块、影像日期下拉及可选的对比历史控件；主区域为叠加在卫星底图上的 NDVI 植被指数热力图；左下角显示图层标题、数据来源和当前影像日期（开启对比时还显示对比日期与历史透明度）；右下角为 NDVI 五级色标（低→高）；页面底部为 AI 智能分析文案，开启历史对比时会描述两期影像变化。
#### 地块与影像日期
| 地块 | 可选影像期数 | 说明 |
|------|--------------|------|
| 1号地块（河间市） | 2 期（如 2026-05-20、2026-05-01） | 支持历史对比 |
| 2号地块（雄县） | 1 期 | 对比历史开关不可用 |
| 3号地块（栾城区） | 1 期 | 对比历史开关不可用 |
切换地块后，地图视野自动缩放到该地块范围；影像日期下拉仅显示当前地块可用日期。
#### 历史影像对比（仅多期地块可用）
适用于河间等拥有 2 期及以上 NDVI 影像的地块：
1. 选择地块与当前「影像日期」。
2. 打开 对比历史 开关。
3. 在 对比日期 中选择另一期（列表中不含当前影像日期）。
4. 拖动 历史透明度 滑块（约 20%～80%），观察两期 NDVI 叠图变化。
5. 关闭对比开关后恢复单层显示。
仅 1 期影像的地块，对比开关为灰色不可用，鼠标悬停提示「当前地块仅一期影像」。
![[attachments/4.3.5.png]]
![[attachments/4.3.4(2).png]]
### 4.3.5 GIS 数据（墒情地图）
GIS Tab 的主画面是一片贴在栾城附近的墒情热力图（演示数据），上面叠有 3 个监测站圆点。左下角有墒情说明、影像日期和操作提示；右下角是墒情（%）色标，从干旱到饱和由暖色过渡到冷色。墒情栅格只覆盖这一片演示区域，河间、雄县等地在图上以监测站圆点表示传感器位置，并不是每个县都有一张墒情图。
点监测站圆点可查看该站温度、土壤湿度和状态；有待处理预警时会显示红色提示。此处与「灾害实时监测」不同：弹窗里没有「手动触发」「标记解决」按钮，只能看，不能在这里直接处置。
查墒情可以这样试：先切到 GIS Tab，鼠标会变成十字形。在雄县附近轻轻点一下地图（不要按住拖很远再松手），点击处会弹出「墒情查询」，大约显示 12%，并标明参考站为「监测站 · 雄县」；地图会同时拉开视野，打开该站的详情弹窗，左下角也会出现「最近查值：12% · 监测站 · 雄县」，底部 AI 智能分析 会改成与这次查值相关的说法。点到栾城附近时，数值会接近 65%；河间附近大约 30%。查值弹窗和监测站弹窗可以同时留着，再点别处会更新结果；离开 GIS Tab 再回来，「最近查值」一行会清空。
说明：这是演示用法——系统按点击位置找最近的监测站，用该站土壤湿度当作这一带的墒情示数，用来对照「热力图上看趋势、站点上看实测」，不是专业栅格反演或空间插值产品。
![[attachments/4.3.5.png]]
### 4.3.6 AI 智能分析文案
相关数据页底部的 AI 智能分析文案会随当前 Tab 和用户操作更新，并非固定话术。传感器 Tab 下，分析条侧重近期预警情况及最新一条未处理预警摘要；气象 Tab 下，文案随所选监测站变化，涉及降雨、空气干湿、土壤含水率及是否需留意灌溉；无人机 Tab 在未开「对比历史」时侧重当前地块长势与施肥建议，河间等多期地块开启两期对比后则改为描述 NDVI 影像差异；GIS Tab 在未点击地图前给出栾城偏湿、河间—雄县段偏干等区域概况，点击查墒情后会写入查值结果、参考监测站及灌溉或排水提示，并标明已定位到对应传感器。
### 4.3.7 生成简报
停留在当前农情 Tab 后，点右上角「生成 XXX 简报」。窗口里会出现进度条，提示正在汇总近 30 天该类数据；走满后点「确定」会弹出「已下载 PDF」类成功提示。注意：目前只演示流程，浏览器不会在本地真正生成文件。
![[attachments/4.3.7.png]]
## 4.4 灾害实时监测
从导航栏进入「灾害实时监测」，主界面是一张可缩放的 Leaflet 地图。
### 4.4.1 查看地图与监测点
页面加载后自动标出全部监测点，拉近看单点、拉远看聚类。需要一眼看全时点「缩放至全部」；怀疑数据过期就点「刷新数据」重新拉取监测点与预警。颜色与中文状态对照见 3.1.4 节。
![[attachments/4.4.1.png]]
### 4.4.2 监测点弹窗操作
点地图标记弹出详情，能看到名称、温度、土壤湿度和中文状态；若该点有待处理预警，弹窗顶部会有红色提示。需要人工介入时点「手动触发」建一条中级别人工预警；现场处置完毕后用「标记解决」把关联待处理预警关掉。
![[attachments/4.4.2.png]]
### 4.4.3 状态判断口径
监测点状态统一使用 3.1.4 节中的状态机：正常、预警、严重、离线、维护中、未知。监测点状态表示监测对象当前状况，预警记录表示系统或用户创建的风险处置记录，两者在页面中联动展示。
## 4.5 智能分析
导航栏进入「智能分析」。在上传区选 JPG / PNG / WEBP 图片（建议 ≤ 2MB），下拉选作物（桃、苹果、小麦、水稻），右侧选分析类型（灾害识别、病虫害识别、气候灾害识别、其他），必要时填补充说明，再点「确定」或「识别」。提交后页面给出识别结果、置信度、风险等级和农技建议；有风险的结果可归档进预警列表。成功时会提示「分析完成！请查看下方结果卡片」，新纪录在「灾害预警」页可查。窄屏下上传区与结果区上下排列。
![[attachments/4.5.1.png]]
![[attachments/4.5.1(2).png]]
### 4.5.2 分析类型说明
| 按钮 | 适用场景（说明性） |
|------|-------------------|
| 灾害识别 | 一般性灾害/长势异常 |
| 病虫害识别 | 病斑、虫害相关 |
| 气候灾害识别 | 冻害、涝渍等 |
| 其他 | 以上未覆盖情况 |
识别结果会带置信度文案写入预警；非「健康」类结果可归档为较高预警级别，供后续处置和决策分析使用。
## 4.6 灾害预警
「灾害预警」页用来查、建、改、删预警记录，也是风险管理主入口。
### 4.6.1 新建预警
点「新建预警」，选好监测点和级别（低/中/高），填完预警信息并确定，列表里会出现一条「待处理」记录。
![[attachments/4.6.1.png]]
### 4.6.2 处理预警
待处理记录可「标记解决」变已处理；已处理的也能「标记未处理」便于重新跟踪。不需要的记录可删除，删除后页面无法恢复，操作前请确认。列表为空时显示与首页一致的空状态。
![[attachments/4.6.2.png]]
### 4.6.3 与其他模块联动
新建预警或智能分析产出的记录会同步到三处：本页列表、地图对应监测点弹窗（有待处理提示时）、「智慧决策」左侧待处理列表。
## 4.7 智慧决策
进「智慧决策」后，左侧是待处理预警列表，右侧看该点的监测数据和文字建议。
### 4.7.1 选择预警
点列表里的一条预警即可高亮选中，「区域概览」小地图会标出位置和经纬度。还没选时，右侧提示「请从左侧列表选择一个预警进行决策分析」。窄屏（≤992px）先显示列表、下方才是详情，监测数据卡片在手机上单列排布。
### 4.7.2 查看建议
选中预警后，上方卡片给出温度、土壤湿度、监测点状态等实时读数；「处置建议」区按级别和监测值生成多条文字提示。需要留档时点右上角「导出方案」（具体格式以实现为准）。
![[attachments/4.7.2.png]]
## 4.8 关于我们
导航栏点「关于我们」可查看团队与产品介绍。
### 4.8.1 页面内容
开篇是口号「AI守麦田，数据护粮仓」，并交代智慧农业监测与灾害预警的产品定位，以及河北地质大学坤灵智巡创工队自主开发、已上线部署等情况。
中部三张卡片分别写「系统实现」「应用场景」「团队分工」，概括 Web 监测、预警联动和跨专业协作；技术栈区用图标列出 Vue 3、Ant Design、深度学习、物联网、大数据、ECharts、GIS 遥感等方向，下方还有核心成员分工与指导老师寄语。
页脚注明「本平台由河北地质大学开发，面向智慧农业监测与灾害预警场景」，联系邮箱为 kunling-smart@hgu.edu.cn。
![[attachments/about.png]]
![[attachments/about2.png]]
## 4.9 移动端与用户菜单
系统支持 PC、平板和手机浏览器访问。不同屏幕宽度下，页面会自动调整布局。
1. 宽度 ≤992px 时，顶部水平导航隐藏，点击左上角汉堡按钮打开「功能导航」抽屉。
2. 地图、表格和图表会自动改为纵向或单列布局。
3. 智慧决策页在窄屏下先显示待处理预警列表，再显示决策详情。
4. 极窄屏会隐藏 Header 搜索框，以保证主操作区域可用。
用户下拉菜单提供个人中心、系统设置、退出登录等入口。退出登录操作见第二章。
# 第五章 使用注意事项
## 5.1 账号与登录
1. 用户应使用系统分配的手机号、验证码和角色登录。
2. 公共电脑使用完毕后，应通过右上角用户菜单退出登录。
3. 如登录失败，应确认手机号、验证码、角色和备用密码是否填写正确。
4. 不同角色可访问的页面范围不同，实际权限以系统配置为准。
## 5.2 数据查看
1. 首页统计、地图监测、预警列表和智慧决策页面之间存在数据联动关系。
2. 若页面数据未及时更新，可点击页面提供的「刷新数据」按钮，或重新进入当前页面查看。
3. 一个监测点可以关联多条预警记录，因此预警数量可能大于监测点数量。
4. 遥感热力图、气象站九类读数、传感器折线图等，均用于辅助判断，须结合田间实际情况解读；在气象 Tab 换站后，卡片数字与底部分析条会一起更新。
5. GIS「点击查墒情」为演示联动，数值取自最近监测站传感器，非专业空间插值产品。
6. 无人机「历史对比」仅在有多期影像的地块可用；单期地块开关不可用属正常设计。
7. 「生成简报」按钮目前只走演示流程，不会在用户电脑上生成真实 PDF 文件。
## 5.3 图片分析
1. 建议上传 JPG、PNG 或 WEBP 格式图片。
2. 上传图片应尽量清晰，避免主体过小、严重模糊或光照过暗。
3. 智能分析结果用于辅助识别和风险提示，不应直接替代实地农情判断。
4. 分析完成后，用户可根据结果进入「灾害预警」页查看关联预警记录。
## 5.4 预警处置
1. 新建预警时，应选择正确的监测点和预警级别。
2. 预警处置完成后，应及时点击「标记解决」，保证首页统计和智慧决策列表同步更新。
3. 删除预警记录后不可在页面中直接恢复，操作前应确认该记录不再需要。
4. 智慧决策页面提供的处置建议为辅助参考，实际生产处置仍需结合当地农技规范和现场复核结果。
## 5.5 运行环境
1. 推荐使用 Chrome 或 Edge 最新版浏览器访问系统。
2. 系统支持 PC、平板和手机浏览器访问；涉及地图、图表和表格操作时，建议使用 PC 或平板获得更完整的显示效果。
3. 如系统地址无法访问，应联系维护人员检查服务器、网络和后端服务状态。
# 附录
## A. 软件信息
| 项目 | 内容 |
|------|------|
| 软件全称 | AI技术赋能下的作物灾害智慧监测预警系统 |
| 软件简称 | AI作物灾害监测预警系统 |
| 版本 | 1.0.4 |
| 终端类型 | Web 浏览器访问 |
| 适用方向 | 作物灾害监测、农情数据展示、预警管理、辅助决策 |
| 开发单位 | 河北地质大学 · 坤灵智巡创工队 |
本说明书描述 V1.0.4 版本的功能与操作，与线上一致（http://82.157.234.123:88）。
### A.2 源程序规模
本系统源程序采用 Vue 3 + TypeScript + JavaScript + Python 开发，统计口径为生产代码目录（前端 `src/`、图像分析服务 `server/`、业务接口 `deploy/api_mock/`），不含第三方依赖包、构建产物与演示数据文件。

| 项目 | 数值 |
|------|------|
| 源程序文件数 | 44 个 |
| 有效代码行数（非空行） | 约 6,538 行 |
| 前端有效代码 | 约 6,146 行 |
| 后端有效代码 | 约 392 行（含农业业务规则与图像分析服务） |
按开发语言分布（有效代码行）：

| 语言/类型 | 文件数 | 有效代码行 | 主要用途 |
|-----------|--------|------------|----------|
| Vue 单文件组件 | 16 | 约 4,592 行 | 登录、首页、相关数据、地图监测、智能分析、预警、决策等业务页面 |
| TypeScript | 22 | 约 1,292 行 | 状态管理、路由、地图组合逻辑、监测状态机、接口封装 |
| JavaScript | 2 | 约 272 行 | 农业领域业务规则与接口服务 |
| Python | 1 | 约 120 行 | 作物图像预处理、特征提取与分类建议 |
| 样式表（CSS） | 3 | 约 262 行 | 玻璃拟态主题、地图与页面公共样式 |
按功能模块分布（有效代码行）：

| 功能模块 | 有效代码行 | 说明 |
|----------|------------|------|
| 业务页面 | 约 3,500 行 | 七大导航模块对应的用户界面与交互 |
| 布局与公共组件 | 约 1,090 行 | 顶栏导航、全局搜索、遥感地图、空状态展示 |
| 状态与业务逻辑 | 约 1,072 行 | 监测点/预警/气象/遥感数据管理、状态机、检索 |
| 后端服务 | 约 392 行 | 登录校验、灾害规则评估、查墒情、图像分析 |
源程序核心业务逻辑见附录 D；完整源码见小挑/Intro/AI技术赋能下的作物灾害智慧监测预警系统V1.0.4-源程序.md（12 个文件、约 3,095 行）。全系统业务页面与领域规则代码合计约 6,500 行。
## B. 运行环境建议
| 项目 | 建议 |
|------|------|
| 客户端 | Chrome、Edge 等现代浏览器 |
| 屏幕设备 | PC、平板、手机浏览器均可访问 |
| 服务器 | 支持前端静态资源、业务接口和图片分析服务的服务器环境 |
| 网络 | 客户端可访问系统部署地址，服务器端服务保持正常运行 |
## C. 技术支持
问题反馈可通过「关于我们」页脚邮箱 kunling-smart@hgu.edu.cn 联系团队。
## D. 源程序代码附录
完整源程序见小挑/Intro/AI技术赋能下的作物灾害智慧监测预警系统V1.0.4-源程序.md（含附录 D 所列 8 个核心模块及 4 个主要业务页面，约 3,095 行有效代码）；本附录摘录系统核心业务逻辑源程序，与第四章各节操作说明相对应。所列代码均为 V1.0.4 实际运行版本中的自研部分，不含第三方框架模板。
### D.1 节选说明
| 原则 | 说明 |
|------|------|
| 只收录业务代码 | 监测状态机、遥感对比、GIS 查墒情、灾害规则评估、图像分析流水线等农业监测预警逻辑 |
| 不收录通用脚手架 | 不含 Vite 配置、Axios 基础封装、标准路由守卫、Ant Design 表单样板等 |
| 与正文功能对应 | 下列各段代码分别对应第四章「相关数据」「灾害实时监测」「智能分析」「灾害预警」「智慧决策」 |
| 术语与正文一致 | 监测点状态机、九类农田小气候读数、NDVI 期次对比、最近站查墒情等表述与正文统一 |
### D.2 代码模块与功能对照
| 序号 | 源文件路径 | 对应说明书功能 | 核心职责 |
|------|------------|----------------|----------|
| 1 | `src/utils/monitorStatus.ts` | 3.1.4、4.4 | 监测点六态状态机与阈值推导 |
| 2 | `src/stores/data.ts` | 4.2、4.6 | 监测点/预警/气象读数聚合与落库 |
| 3 | `src/composables/useGlobalSearch.ts` | 3.2、4.2.2 | 菜单、监测点、预警全局检索 |
| 4 | `src/composables/useMonitorPointLayer.ts` | 4.3.5、4.4 | 地图聚类、弹窗处置、GIS 查值联动高亮 |
| 5 | `src/stores/remoteSensing.ts` | 4.3.4 | NDVI 地块切换与两期影像对比状态 |
| 6 | `deploy/api_mock/agriMockCore.cjs` | 4.3、4.7 | 农情登录、NDVI 摘要、墒情趋势、灾害规则、最近站查墒情 |
| 7 | `src/mock/server.ts` | 1.4、4.3 | 农业领域 REST 路由注册 |
| 8 | `server/app.py` | 4.5 | 作物图像预处理—特征—分类—建议流水线 |
### D.3 监测点状态机（`src/utils/monitorStatus.ts`）
依据温度、土壤湿度推导「正常 / 预警 / 严重 / 离线 / 维护中 / 未知」，并定义状态转移与地图配色。
```typescript
export const MONITOR_STATUS_META: Record<MonitorStatus, MonitorStatusMeta> = {
  normal:   { label: '正常',   color: '#52c41a', priority: 1, /* ... */ next: ['warning', 'offline', 'maintenance'] },
  warning:  { label: '预警',   color: '#fa8c16', priority: 2, /* ... */ next: ['normal', 'critical', 'offline', 'maintenance'] },
  critical: { label: '严重',   color: '#cf1322', priority: 3, /* ... */ next: ['warning', 'normal', 'offline', 'maintenance'] },
  offline:  { label: '离线',   color: '#8c8c8c', priority: 4, /* ... */ next: ['normal', 'warning', 'maintenance'] },
  maintenance: { label: '维护中', color: '#722ed1', priority: 0, /* ... */ next: ['normal', 'offline'] },
  unknown:  { label: '未知',   color: '#1890ff', priority: -1, /* ... */ next: ['normal', 'warning', 'offline'] }
}
export function deriveMonitorStatus(input: MonitorStatusInput): MonitorStatus {
  if (input.maintenance) return 'maintenance'
  if (input.online === false) return 'offline'
  const temp = Number(input.temp)
  const soilMoisture = Number(input.soilMoisture)
  if (!Number.isFinite(temp) || !Number.isFinite(soilMoisture) || temp < -50 || temp > 100) {
    return 'offline'
  }
  if (temp >= 38 || soilMoisture <= 10) return 'critical'
  if (temp >= 32 || soilMoisture <= 20 || soilMoisture >= 80) return 'warning'
  const current = normalizeMonitorStatus(input.status)
  return current === 'unknown' || current === 'offline' ? 'normal' : current
}
```
### D.4 农情数据 Store（`src/stores/data.ts`）
拉取监测点后调用状态机校准，并维护预警列表与气象九类读数。
```typescript
async function fetchMonitorPoints() {
  const res = await http.get('/monitorPoints')
  monitorPoints.value = (res.data || [])
    .filter((item: any) => item.id && item.status)
    .map((item: any) => {
      const fixedTemp = parseFloat(item.temp)
      const fixedMoisture = parseFloat(item.soilMoisture)
      const status = deriveMonitorStatus({
        status: item.status,
        temp: fixedTemp,
        soilMoisture: fixedMoisture,
        online: item.online,
        maintenance: item.maintenance
      })
      return {
        ...item,
        status,
        temp: Number.isFinite(fixedTemp) ? fixedTemp.toFixed(1) : '0.0',
        soilMoisture: fixedMoisture.toFixed(1)
      }
    })
}
export interface WeatherReading {
  pointId: number
  soilVwc: number; soilTemp10cm: number; soilEc: number
  airTemp: number; airRh: number; windSpeed: number
  windDirection: number; windDirectionText: string
  pressure: number; hourlyRain: number
}
```
### D.5 全局农情检索（`src/composables/useGlobalSearch.ts`）
按关键词同时检索导航菜单、监测点名称、预警摘要，并跳转至对应业务页。
```typescript
const results = computed<SearchResult[]>(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return []
  const list: SearchResult[] = []
  for (const item of MENU_ITEMS) {
    const match = item.title.toLowerCase().includes(k)
      || item.keywords.some((kw) => kw.toLowerCase().includes(k))
    if (match) list.push({ type: 'menu', id: `menu-${item.path}`, title: item.title, path: item.path })
  }
  for (const p of dataStore.monitorPoints || []) {
    if ((p.name || '').toLowerCase().includes(k)) {
      list.push({
        type: 'monitor', id: `monitor-${p.id}`, title: p.name,
        subtitle: `状态: ${getMonitorStatusLabel(p.status)}`,
        path: '/map', query: { highlight: p.id }
      })
    }
  }
  for (const a of dataStore.alerts || []) {
    const msg = (a.message || '').toString()
    if (msg.toLowerCase().includes(k)) {
      list.push({ type: 'alert', id: `alert-${a.id}`, title: msg.slice(0, 40), path: '/warnings' })
    }
  }
  return list
})
```
### D.6 地图监测点图层与 GIS 联动（`src/composables/useMonitorPointLayer.ts`）
支持聚类渲染、弹窗内手动触发/标记解决；GIS 查墒情时以 `fitBounds` 同时框住点击处与最近监测站。
```typescript
function highlightPoint(pointId: number, options: HighlightPointOptions = {}) {
  const marker = markersById.get(pointId)
  if (!marker) return
  const markerLatLng = marker.getLatLng()
  cluster.zoomToShowLayer(marker, () => {
    if (options.queryLatLng) {
      const bounds = L.latLngBounds(options.queryLatLng, markerLatLng)
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: options.maxZoom ?? 14, animate: true })
    } else {
      map.flyTo(markerLatLng, options.maxZoom ?? 14, { duration: 0.8 })
    }
    map.once('moveend', () => openMarkerPopupLayer(marker))
  })
}
```
### D.7 遥感 NDVI 两期对比（`src/stores/remoteSensing.ts`）
管理地块、影像期次与历史对比开关；单期地块自动禁用对比功能。
```typescript
const canCompareNdvi = computed(() => compareDatesForField.value.length > 0)
function setCompareEnabled(enabled: boolean) {
  if (enabled && !canCompareNdvi.value) return
  compareEnabled.value = enabled
  if (!enabled) { compareNdviDate.value = ''; return }
  syncCompareDateForField()
}
function syncCompareDateForField() {
  const options = compareDatesForField.value
  if (options.length === 0) { resetCompare(); return }
  if (!options.includes(compareNdviDate.value)) {
    compareNdviDate.value = latestDate(options)
  }
}
```
### D.8 农业业务规则引擎（`deploy/api_mock/agriMockCore.cjs`）
封装登录校验、NDVI 摘要、墒情趋势、灾害阈值规则评估与最近监测站查墒情（Haversine 距离）。
```javascript
function queryMoistureByNearestPoint(db, lat, lng) {
  const latNum = Number(lat), lngNum = Number(lng)
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return { ok: false, status: 400, body: { message: '请提供有效的 lat、lng 查询参数' } }
  }
  let nearest = points[0], minDistKm = Infinity
  for (const point of points) {
    const distKm = haversineKm(latNum, lngNum, Number(point.lat), Number(point.lng))
    if (distKm < minDistKm) { minDistKm = distKm; nearest = point }
  }
  return {
    ok: true, status: 200,
    body: {
      moisture: Number(nearest.soilMoisture),
      source: 'nearest-point',
      nearestPointId: nearest.id,
      pointName: nearest.name,
      distanceKm: Number(minDistKm.toFixed(1))
    }
  }
}
function evaluateDisasterRules(db, body = {}) {
  const temp = Number(body.temp ?? point?.temp ?? 0)
  const soilMoisture = Number(body.soilMoisture ?? point?.soilMoisture ?? 0)
  const rules = []
  if (temp >= 38) rules.push({ rule: 'high_temperature', level: 'critical', reason: '温度达到高温危险阈值' })
  else if (temp >= 32) rules.push({ rule: 'heat_attention', level: 'warning', reason: '温度进入持续关注区间' })
  if (soilMoisture <= 10) rules.push({ rule: 'drought_risk', level: 'critical', reason: '土壤湿度低于重旱阈值' })
  else if (soilMoisture <= 20) rules.push({ rule: 'water_stress', level: 'warning', reason: '土壤湿度低于警戒线' })
  if (soilMoisture >= 80) rules.push({ rule: 'waterlogging_risk', level: 'warning', reason: '土壤湿度偏高，需关注涝渍' })
  const level = rules.some((r) => r.level === 'critical') ? 'critical' : rules.length ? 'warning' : 'normal'
  return { code: 200, message: '灾害规则评估完成', data: { pointId, pointName, level, rules, advice: /* ... */ } }
}
```
### D.9 农业领域接口路由（`src/mock/server.ts`）
在 json-server 之上注册农情专用接口，与前端 `/api` 代理及说明书 1.4 节服务组成一致。
```typescript
server.post('/login', (req, res) => {
  const result = agriMockCore.handleFarmLogin(readDb(res), req.body)
  return res.status(result.status).jsonp(result.body)
})
server.get('/ndvi/summary', (_req, res) => res.jsonp(agriMockCore.buildNdviSummary(readDb(res))))
server.get('/soilMoisture/trend', (_req, res) => res.jsonp(agriMockCore.buildSoilMoistureTrend(readDb(res))))
server.post('/disasterRules/evaluate', (req, res) => res.jsonp(agriMockCore.evaluateDisasterRules(readDb(res), req.body)))
server.get('/moisture/value', (req, res) => {
  const result = agriMockCore.queryMoistureByNearestPoint(readDb(res), req.query.lat, req.query.lng)
  return res.status(result.status).jsonp(result.body)
})
```
### D.10 作物图像分析流水线（`server/app.py`）
智能分析模块采用「预处理 → 特征提取 → 分类 → 农技建议」四段式结构，按作物类型与图像摘要生成识别结果。
```python
CROP_DISEASE_LABELS = {
    "peach": ["桃疮痂病", "桃褐腐病", "桃缩叶病", "健康"],
    "apple": ["苹果腐烂病", "苹果轮纹病", "健康"],
    "wheat": ["小麦锈病", "小麦赤霉病", "健康"],
    "rice": ["稻瘟病", "纹枯病", "健康"]
}
def extract_agri_features(sample):
    digest_value = int(sample.digest[:8], 16)
    spot_score = (digest_value % 100) / 100
    texture_score = ((digest_value // 100) % 100) / 100
    moisture_hint = "偏湿" if texture_score > 0.66 else "偏干" if texture_score < 0.33 else "适中"
    return {"spotScore": round(spot_score, 2), "textureScore": round(texture_score, 2), "moistureHint": moisture_hint}
def classify_crop_disaster(sample, features):
    labels = CROP_DISEASE_LABELS.get(sample.crop_type, ["未知病害"])
    result = labels[int(sample.digest[-4:], 16) % len(labels)]
    confidence = round(0.78 + features["spotScore"] * 0.18, 2)
    level = "low" if result == "健康" else "high" if confidence >= 0.9 else "medium"
    return {"result": result, "confidence": min(confidence, 0.98), "level": level}
def run_ai_model_prediction(image_file, crop_type, category=""):
    sample = preprocess_image_sample(image_file, crop_type, category)
    features = extract_agri_features(sample)
    classification = classify_crop_disaster(sample, features)
    advice = build_agri_advice(sample, classification, features)
    return sample, features, classification, advice
```
