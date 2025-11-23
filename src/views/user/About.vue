<!-- src/views/user/About.vue -->
<template>
  <AppLayout>
    <main class="main-content">
      <div class="content-wrapper">
        <a-card
          :bordered="false"
          class="main-card">
          <template #title>
            <div class="card-header">
              <span class="header-title">关于我们</span>
              <span class="header-subtitle">青禾智匠 · 坤灵智巡</span>
            </div>
          </template>

          <div class="about-us-content">
            <!-- 1. 项目愿景 -->
            <section class="about-section">
              <div class="vision-banner">
                <h2 class="vision-slogan">AI守麦田，数据护粮仓</h2>
                <p class="vision-sub">—— 坤灵智巡，让灾害预警“跑”在成灾前</p>
              </div>

              <div class="intro-text">
                <p>
                  我们是来自河北地质大学的
                  <strong>坤灵智巡创工队</strong>
                  。面对全球气候变化挑战，我们打造了
                  <strong>“青禾智匠”</strong>
                  —— 人工智能技术赋能下的作物灾害智慧监测预警系统。
                </p>
              </div>

              <!-- 三大维度卡片 -->
              <div class="vision-grid">
                <div class="vision-item">
                  <div class="vision-icon tech"><RocketOutlined /></div>
                  <h3>技术维度</h3>
                  <p>从卫星遥感到田间传感器，构建毫米级灾害监测网。</p>
                </div>
                <div class="vision-item">
                  <div class="vision-icon social"><HeartOutlined /></div>
                  <h3>社会价值</h3>
                  <p>每年减少20%农作物损失，守护8亿亩耕地安全。</p>
                </div>
                <div class="vision-item">
                  <div class="vision-icon team"><BulbOutlined /></div>
                  <h3>团队宣言</h3>
                  <p>一人的算法守护亿万人的饭碗，创新驱动未来。</p>
                </div>
              </div>
            </section>

            <a-divider class="section-divider" />

            <!-- 2. 技术栈 -->
            <section class="about-section">
              <h2 class="section-title">
                <CodeOutlined class="icon-prefix" />
                技术栈
              </h2>
              <div class="tech-stack-wrapper">
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
            </section>

            <a-divider class="section-divider" />

            <!-- 3. 团队成员 -->
            <section class="about-section">
              <h2 class="section-title">
                <TeamOutlined class="icon-prefix" />
                核心团队
              </h2>
              <div class="team-intro-box">
                学科交融，优势互补。我们是一支集
                <strong>计算机、地信、测绘、土管、会计</strong>
                等多学科背景的复合型创新团队。
              </div>

              <div class="team-grid">
                <div
                  v-for="member in teamMembers"
                  :key="member.name"
                  class="team-card">
                  <div class="card-top">
                    <a-avatar
                      :size="72"
                      :src="member.avatar"
                      class="member-avatar">
                      {{ member.name.charAt(0) }}
                    </a-avatar>
                    <div class="member-header">
                      <h4 class="name">{{ member.name }}</h4>
                      <span class="role-badge">{{ member.role }}</span>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="major-info">
                      <BookOutlined />
                      {{ member.major }}
                    </div>
                    <p class="desc-text">{{ member.desc }}</p>
                  </div>
                </div>
              </div>
            </section>

            <a-divider class="section-divider" />

            <!-- 4. 指导老师 (保持不变) -->
            <section class="about-section">
              <h2 class="section-title">
                <TrophyOutlined class="icon-prefix" />
                指导老师
              </h2>
              <div class="advisor-wrapper">
                <div class="team-card advisor-card">
                  <div class="card-top">
                    <a-avatar
                      :size="72"
                      class="member-avatar advisor-avatar">
                      师
                    </a-avatar>
                    <div class="member-header">
                      <h4 class="name">刘兴冉</h4>
                      <span class="role-badge advisor-badge">指导教师</span>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="major-info">[老师职称] · [研究方向]</div>
                    <p class="desc-text center-text">“寄语：脚踏实地，仰望星空。”</p>
                  </div>
                </div>
              </div>
            </section>

            <a-divider class="section-divider" />

            <!-- 5. 联系我们 -->
            <section class="about-section footer-section">
              <h2 class="section-title">
                <MailOutlined class="icon-prefix" />
                联系与支持
              </h2>
              <div class="footer-content">
                <p>
                  本项目为
                  <strong>2025-2026年“挑战杯”大学生创业计划竞赛</strong>
                  参赛作品
                </p>
                <p>参赛学校：河北地质大学 | 团队：坤灵智巡创工队</p>
                <a-button
                  type="primary"
                  ghost
                  href="mailto:kunling-smart@hgu.edu.cn">
                  <template #icon><MailOutlined /></template>
                  联系我们
                </a-button>
              </div>
            </section>
          </div>
        </a-card>
      </div>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import {
  AimOutlined,
  CodeOutlined,
  TeamOutlined,
  TrophyOutlined,
  MailOutlined,
  RocketOutlined,
  HeartOutlined,
  BulbOutlined,
  BookOutlined,
  CloudServerOutlined,
  RobotOutlined,
  AreaChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'
import vueIcon from '@/assets/icons/vue.svg' // 确保你有这个路径，或者换成网络图

// 技术栈数据
const techStack = ref([
  { name: 'Vue 3', icon: 'img', src: vueIcon, color: '#42b883' },
  {
    name: 'Ant Design',
    icon: 'img',
    src: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    color: '#1890ff'
  },
  { name: 'AI深度学习', icon: RobotOutlined, color: '#ff6f00' },
  { name: '物联网IoT', icon: CloudServerOutlined, color: '#000000' },
  { name: '大数据', icon: DatabaseOutlined, color: '#00758f' },
  { name: 'ECharts', icon: AreaChartOutlined, color: '#c23531' },
  {
    name: 'GIS遥感',
    icon: 'img',
    src: 'https://leafletjs.com/docs/images/logo.png',
    color: '#8cc427'
  }
])

// 团队成员数据
const teamMembers = ref([
  {
    name: '王佳欢',
    role: '项目负责人',
    major: '荣誉资质', // PPT中此处为荣誉
    desc: '国家奖学金、国家励志奖学金获得者。多次获得国家级、省级荣誉，具有丰富的主持创新创业类赛事经验。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    // --- 您的位置：为您设计了符合计算机专业的“技术大拿”人设 ---
    name: '我', // 请替换为您的真实姓名
    role: '核心架构师',
    major: '计算机科学与技术专业',
    desc: '负责系统底层架构设计与核心算法攻坚。以扎实的计算机科学理论，融合AI与物联网技术，构建高可用、高并发的智慧农业云平台。',
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
/* 全局布局与背景 */
.main-content {
  padding: 24px;
  background: #f0f2f5; /* 浅灰底色衬托卡片 */
  min-height: calc(100vh - 64px);
}

.content-wrapper {
  max-width: 1100px;
  margin: 0 auto;
}

.main-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
}

/* 标题区域 */
.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.header-title {
  font-size: 28px;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 2px;
}

.header-subtitle {
  font-size: 14px;
  color: #137333; /* 青禾绿 */
  background: #e6f4ea;
  padding: 2px 12px;
  border-radius: 20px;
  margin-top: 8px;
  font-weight: 600;
}

/* 通用 Section 标题 */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #1890ff, #137333); /* 蓝绿渐变条 */
  border-radius: 2px;
}

.icon-prefix {
  margin-right: 10px;
  color: #555;
}

/* 1. 愿景部分 */
.vision-banner {
  text-align: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #e6f4ea 100%);
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.vision-slogan {
  margin: 0;
  font-size: 26px;
  font-weight: bold;
  color: #137333; /* 农业绿 */
  text-shadow: 0 1px 2px rgb(0 0 0 / 10%);
}

.vision-sub {
  margin-top: 10px;
  font-size: 16px;
  color: #1890ff; /* 科技蓝 */
  font-weight: 500;
}

.intro-text {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 30px;
  color: #555;
  line-height: 1.8;
  font-size: 15px;
}

.vision-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.vision-item {
  text-align: center;
  padding: 20px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.vision-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  border-color: #b7eb8f;
}

.vision-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.vision-icon.tech {
  color: #1890ff;
}

.vision-icon.social {
  color: #fa8c16;
}

.vision-icon.team {
  color: #52c41a;
}

.vision-item h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
}

.vision-item p {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

/* 2. 技术栈 Pill 风格 */
.tech-stack-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.tech-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 50px; /* 圆角胶囊状 */
  transition: all 0.3s;
  cursor: default;
}

.tech-pill:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgb(24 144 255 / 15%);
}

.tech-pill img,
.tech-icon-svg {
  width: 20px;
  height: 20px;
  font-size: 20px;
  object-fit: contain;
}

.tech-pill span {
  font-weight: 500;
  color: #333;
}

/* 3. 团队卡片 (重点优化) */
.team-intro-box {
  background: #f9f9f9;
  padding: 12px;
  text-align: center;
  border-radius: 6px;
  color: #666;
  margin-bottom: 24px;
  border-left: 4px solid #d9d9d9;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 响应式网格 */
  gap: 24px;
}

.team-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.team-card:hover {
  box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
  border-color: #e6f7ff;
  transform: translateY(-4px);
}

.card-top {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(to right, #fff, #fafafa);
  border-bottom: 1px solid #f0f0f0;
}

.member-avatar {
  background-color: #1890ff; /* 默认头像背景 */
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.member-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.member-header .name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #333;
}

.role-badge {
  background: #e6f7ff;
  color: #1890ff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.card-body {
  padding: 15px 20px;
  flex: 1; /* 让描述部分填满高度 */
}

.major-info {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.desc-text {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  text-align: justify; /* 两端对齐 */
  margin: 0;
}

/* 4. 指导老师特别样式 */
.advisor-wrapper {
  display: flex;
  justify-content: center;
}

.advisor-card {
  width: 100%;
  max-width: 350px;
}

.advisor-avatar {
  background-color: #faad14;
}

.advisor-badge {
  background: #fff7e6;
  color: #faad14;
}

.center-text {
  text-align: center;
  font-style: italic;
}

/* 5. 底部联系 */
.footer-section {
  text-align: center;
}

.footer-content {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 8px;
}

.footer-content p {
  margin-bottom: 10px;
  color: #666;
}

/* 响应式微调 */
@media (width <= 768px) {
  .vision-grid {
    grid-template-columns: 1fr;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }
}
</style>
