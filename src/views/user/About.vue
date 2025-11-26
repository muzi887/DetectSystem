<!-- src/views/user/About.vue -->
<template>
  <AppLayout>
    <!-- 
      注意：由于 AppLayout 已经处理了背景图和 flex 布局，
      这里我们只需要关注内容区域的玻璃质感 
    -->
    <div class="about-container">
      <!-- 1. 顶部愿景卡片 -->
      <div class="glass-panel vision-panel">
        <div class="panel-header">
          <h1 class="main-title">关于我们</h1>
          <p class="sub-title">青禾智匠 · 坤灵智巡</p>
        </div>

        <div class="vision-content">
          <h2 class="slogan">
            <span class="quote-mark">“</span>
            AI守麦田，数据护粮仓
            <span class="quote-mark">”</span>
          </h2>
          <p class="slogan-sub">—— 坤灵智巡，让灾害预警“跑”在成灾前</p>

          <div class="vision-text">
            我们是来自河北地质大学的
            <strong>坤灵智巡创工队</strong>
            。 在人工智能与现代农业的交汇点，我们致力于打造智慧“大脑”，守护每一寸耕地。
          </div>

          <!-- 三个维度图标区 -->
          <div class="dimension-grid">
            <div class="dim-item">
              <RocketOutlined class="dim-icon" />
              <h3>技术维度</h3>
              <p>
                毫米级监测网
                <br />
                卫星遥感 + 地面传感
              </p>
            </div>
            <div class="dim-item">
              <HeartOutlined class="dim-icon" />
              <h3>社会价值</h3>
              <p>
                守护8亿亩耕地
                <br />
                助力国家粮食安全
              </p>
            </div>
            <div class="dim-item">
              <BulbOutlined class="dim-icon" />
              <h3>团队宣言</h3>
              <p>
                一人的算法
                <br />
                守护亿万人的饭碗
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 技术栈 (胶囊风格) -->
      <div class="glass-panel section-panel">
        <div class="section-header">
          <CodeOutlined />
          核心技术栈
        </div>
        <div class="tech-grid">
          <div
            v-for="tech in techStack"
            :key="tech.name"
            class="tech-pill">
            <img
              v-if="tech.icon === 'img'"
              :src="tech.src"
              :alt="tech.name" />
            <component
              :is="tech.icon"
              v-else
              class="tech-icon-svg"
              :style="{ color: tech.color }" />
            <span>{{ tech.name }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 核心团队 (重点：深色玻璃卡片) -->
      <div class="glass-panel section-panel">
        <div class="section-header">
          <TeamOutlined />
          核心团队
        </div>
        <p class="team-intro">
          学科交融，优势互补。集
          <strong>计算机、地信、测绘、土管、会计</strong>
          等多学科背景的复合型创新团队。
        </p>

        <div class="team-grid">
          <div
            v-for="member in teamMembers"
            :key="member.name"
            class="member-card">
            <!-- 头像区 -->
            <div class="avatar-wrapper">
              <a-avatar
                :size="80"
                :src="member.avatar"
                class="custom-avatar">
                {{ member.name.charAt(0) }}
              </a-avatar>
            </div>
            <!-- 信息区 -->
            <div class="info-wrapper">
              <div class="name-row">
                <span class="name">{{ member.name }}</span>
                <span class="role-tag">{{ member.role }}</span>
              </div>
              <div class="major-row">
                <BookOutlined class="icon-small" />
                {{ member.major }}
              </div>
              <div class="divider-line"></div>
              <p class="desc-text">{{ member.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 指导老师 -->
      <div class="glass-panel section-panel">
        <div class="section-header">
          <TrophyOutlined />
          指导老师
        </div>
        <div class="advisor-container">
          <div class="member-card advisor-card">
            <div class="avatar-wrapper">
              <a-avatar
                :size="80"
                class="custom-avatar advisor-avatar">
                师
              </a-avatar>
            </div>
            <div class="info-wrapper text-center">
              <div class="name-row center-row">
                <span class="name">刘兴冉</span>
              </div>
              <div class="major-row center-row">[老师职称] · [研究方向]</div>
              <div class="divider-line"></div>
              <p class="desc-text center-text">“寄语：脚踏实地，仰望星空。”</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 联系我们 -->
      <div class="glass-panel footer-panel">
        <div class="footer-inner">
          <p class="contest-info">
            本项目为
            <strong>2025-2026年“挑战杯”大学生创业计划竞赛</strong>
            参赛作品
          </p>
          <p class="school-info">参赛学校：河北地质大学 &nbsp;|&nbsp; 团队：坤灵智巡创工队</p>
          <div class="contact-action">
            <a
              href="mailto:kunling-smart@hgu.edu.cn"
              class="contact-btn">
              <MailOutlined />
              联系我们
            </a>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import {
  RocketOutlined,
  HeartOutlined,
  BulbOutlined,
  CodeOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  MailOutlined,
  // Tech Icons
  CloudServerOutlined,
  RobotOutlined,
  AreaChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'

import vueIcon from '@/assets/icons/vue.svg' // 确保路径存在，或者用网络图

// 1. 技术栈数据
const techStack = ref([
  { name: 'Vue 3', icon: 'img', src: vueIcon, color: '#42b883' },
  {
    name: 'Ant Design',
    icon: 'img',
    src: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    color: '#1890ff'
  },
  { name: 'Deep Learning', icon: RobotOutlined, color: '#ff9c6e' }, // 调亮一点颜色以适应深色背景
  { name: 'IoT 物联网', icon: CloudServerOutlined, color: '#ffffff' },
  { name: 'Big Data', icon: DatabaseOutlined, color: '#5cdbd3' },
  { name: 'ECharts', icon: AreaChartOutlined, color: '#ff7875' },
  {
    name: 'GIS 遥感',
    icon: 'img',
    src: 'https://leafletjs.com/docs/images/logo.png',
    color: '#bae637'
  }
])

// 2. 团队成员数据 (9人)
const teamMembers = ref([
  {
    name: '王佳欢',
    role: '项目负责人',
    major: '荣誉资质',
    desc: '国家奖学金、国家励志奖学金获得者。多次获得国家级、省级荣誉，具有丰富的主持创新创业类赛事经验。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '张晓琳',
    role: '核心架构师',
    major: '计算机科学与技术专业',
    desc: '负责系统底层架构设计与AI核心算法攻坚。以扎实的计算机科学理论，融合深度学习与边缘计算，构建智慧粮仓的数字基座。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '王子雪',
    role: '技术总监',
    major: '地理信息科学专业',
    desc: '擅长系统开发，具有丰富的数据处理、应用能力。精通GIS空间分析与地图可视化展示。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '刘金莎',
    role: '技术总监',
    major: '地理信息科学专业',
    desc: '擅长系统开发测试，制定营销战略。严谨把控软件质量，确保监测预警系统的精准运行。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '周艺恬',
    role: '技术总监',
    major: '测绘工程专业',
    desc: '具有较强专业技术能力，擅长软件开发、编程。专注于测绘数据与数字孪生技术的深度融合。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '柴雨润',
    role: '行政总监',
    major: '土地资源管理专业',
    desc: '制定与执行公司行政战略，具有丰富的实践调研经验，统筹团队建设与日常高效运营。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '鲍辰怡',
    role: '运营总监',
    major: '地理信息科学专业',
    desc: '负责渠道推广、活动策划、内容生产。致力于运营本公司品牌价值，讲好“科技助农”故事。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '杨紫蓉',
    role: '市场总监',
    major: '土地资源管理专业',
    desc: '具有丰富实践调研经验，负责系统的市场调研与分析，精准定位痛点，拓展商业渠道。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '王婧蕾',
    role: '财务总监',
    major: '会计学专业',
    desc: '分析经营活动情况，负责日常财务核算与分析资金动态，为项目可持续发展提供财务保障。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  }
])
</script>

<style scoped>
/* 引入字体，与 Layout 保持一致 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

/* 
   =========== 核心布局 =========== 
*/
.about-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px; /* 板块间距 */
  padding-bottom: 40px;
}

/* 
   =========== 通用玻璃面板样式 =========== 
   这是实现你 Layout 风格的关键 
*/
.glass-panel {
  /* 深绿色半透明背景 */
  background: rgb(30 50 30 / 60%);

  /* 磨砂效果 */
  backdrop-filter: blur(12px);

  /* 边框：细微的亮光边框 */
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 16px;

  /* 阴影 */
  box-shadow: 0 8px 32px rgb(0 0 0 / 30%);
  padding: 30px;
  color: #fff;
  transition: transform 0.3s ease;
}

/* 标题通用样式 */
.section-header {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #eef1ea; /* 浅绿白 */
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  padding-bottom: 10px;
}

/* 
   =========== 1. 愿景板块 =========== 
*/
.panel-header {
  text-align: center;
  margin-bottom: 20px;
}

.main-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 36px;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgb(0 0 0 / 50%);
}

.sub-title {
  font-size: 14px;
  color: rgb(255 255 255 / 70%);
  letter-spacing: 4px;
  margin-top: 5px;
  text-transform: uppercase;
}

.slogan {
  text-align: center;
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #b7eb8f; /* 嫩绿高亮 */
  margin-bottom: 5px;
}

.quote-mark {
  color: rgb(255 255 255 / 30%);
}

.slogan-sub {
  text-align: center;
  color: rgb(255 255 255 / 60%);
  font-style: italic;
  margin-bottom: 20px;
}

.vision-text {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 30px;
  line-height: 1.8;
  color: rgb(255 255 255 / 90%);
  font-size: 16px;
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.dim-item {
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}

.dim-item:hover {
  background: rgb(255 255 255 / 10%);
  transform: translateY(-5px);
}

.dim-icon {
  font-size: 32px;
  color: #b7eb8f;
  margin-bottom: 10px;
}

.dim-item h3 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 8px;
  font-family: 'Noto Serif SC', serif;
}

.dim-item p {
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

/* 
   =========== 2. 技术栈 =========== 
*/
.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.tech-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgb(0 0 0 / 30%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 50px;
  color: #fff;
  transition: all 0.3s;
}

.tech-pill:hover {
  background: rgb(255 255 255 / 15%);
  border-color: #b7eb8f;
  box-shadow: 0 0 10px rgb(183 235 143 / 30%);
}

.tech-pill img,
.tech-icon-svg {
  width: 20px;
  height: 20px;
  font-size: 20px;
}

/* 
   =========== 3. 团队卡片 (关键美化) =========== 
*/
.team-intro {
  text-align: center;
  color: rgb(255 255 255 / 70%);
  margin-bottom: 30px;
  font-style: italic;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* 卡片稍宽 */
  gap: 24px;
}

.member-card {
  background: rgb(0 0 0 / 25%); /* 比大背景更深一点 */
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.member-card:hover {
  background: rgb(0 0 0 / 40%);
  border-color: rgb(255 255 255 / 30%);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgb(0 0 0 / 40%);
}

/* 装饰线条 */
.member-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #344e31; /* 暗绿条 */
  transition: background 0.3s;
}

.member-card:hover::before {
  background: #b7eb8f; /* 亮绿条 */
}

.avatar-wrapper {
  margin-right: 18px;
  flex-shrink: 0;
}

.custom-avatar {
  background-color: #677662;
  border: 2px solid rgb(255 255 255 / 20%);
  box-shadow: 0 4px 10px rgb(0 0 0 / 30%);
}

.info-wrapper {
  flex: 1;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.name {
  font-size: 18px;
  font-weight: bold;
  font-family: 'Noto Serif SC', serif;
  color: #fff;
}

.role-tag {
  font-size: 12px;
  padding: 2px 8px;
  background: rgb(183 235 143 / 15%);
  color: #b7eb8f;
  border-radius: 4px;
  border: 1px solid rgb(183 235 143 / 20%);
}

.major-row {
  font-size: 13px;
  color: rgb(255 255 255 / 50%);
  margin-bottom: 8px;
}

.icon-small {
  margin-right: 4px;
}

.divider-line {
  height: 1px;
  background: rgb(255 255 255 / 10%);
  margin: 8px 0;
}

.desc-text {
  font-size: 13px;
  color: rgb(255 255 255 / 75%);
  line-height: 1.5;
  text-align: justify;
}

/* 
   =========== 4. 指导老师特殊样式 =========== 
*/
.advisor-container {
  display: flex;
  justify-content: center;
}

.advisor-card {
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: 30px;
}

.advisor-card .avatar-wrapper {
  margin-right: 0;
  margin-bottom: 15px;
}

.advisor-avatar {
  background-color: #d4b106; /* 金色 */
  color: #fff;
}

.text-center {
  text-align: center;
  width: 100%;
}

.center-row {
  justify-content: center;
}

.center-text {
  text-align: center;
}

/* 
   =========== 5. 底部 =========== 
*/
.footer-panel {
  text-align: center;
  padding: 40px;
}

.contest-info {
  font-size: 16px;
  color: #fff;
  margin-bottom: 10px;
}

.school-info {
  color: rgb(255 255 255 / 60%);
  margin-bottom: 20px;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 30px;
  background: rgb(183 235 143 / 20%);
  border: 1px solid #b7eb8f;
  color: #b7eb8f;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s;
}

.contact-btn:hover {
  background: #b7eb8f;
  color: #344e31;
}

/* 响应式 */
@media (width <= 768px) {
  .dimension-grid {
    grid-template-columns: 1fr;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }

  .member-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .member-card::before {
    width: 100%;
    height: 4px;
  }

  .avatar-wrapper {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .name-row {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
