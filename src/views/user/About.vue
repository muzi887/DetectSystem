<template>
  <AppLayout>
    <div class="about-container">
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
            我们是河北地质大学
            <strong>坤灵智巡创工队</strong>
            ，专注智慧农业监测与灾害预警服务。本 Web 监测系统由
            <strong>张晓琳</strong>
            完成开发与线上部署；团队在地信、测绘、运营等方面协同完成。
          </div>

          <img
            :src="agriMonitoringIllustration"
            alt="智慧农业监测示意：传感器、数据大屏与无人机协同"
            class="vision-illustration"
            loading="lazy"
            decoding="async" />


          <div class="dimension-grid">
            <div class="dim-item">
              <RocketOutlined class="dim-icon" />
              <h3>系统实现</h3>
              <p>
                Vue 3 前端
                <br />
                地图 / 图表 / 预警联动
              </p>
            </div>
            <div class="dim-item">
              <HeartOutlined class="dim-icon" />
              <h3>应用场景</h3>
              <p>
                农情监测演示
                <br />
                灾害预警与辅助决策
              </p>
            </div>
            <div class="dim-item">
              <BulbOutlined class="dim-icon" />
              <h3>团队分工</h3>
              <p>
                地信 / 测绘 / 土管
                <br />
                与计算机方向协同
              </p>
            </div>
          </div>
        </div>
      </div>

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

      <div class="glass-panel section-panel">
        <div class="section-header">
          <TeamOutlined />
          核心团队
        </div>
        <p class="team-intro">以下为成员分工介绍。</p>

        <div class="team-grid">
          <div
            v-for="member in teamMembers"
            :key="member.name"
            class="member-card">
            <div class="avatar-wrapper">
              <a-avatar
                :size="80"
                :src="member.avatar"
                class="custom-avatar">
                {{ member.name.charAt(0) }}
              </a-avatar>
            </div>
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
                :src="advisorDefaultAvatar"
                class="custom-avatar advisor-avatar">
                师
              </a-avatar>
            </div>
            <div class="info-wrapper text-center">
              <div class="name-row center-row">
                <span class="name">{{ advisor.name }}</span>
              </div>
              <div class="major-row center-row">{{ advisor.title }} · {{ advisor.college }}</div>
              <div class="divider-line"></div>
              <p class="desc-text center-text">{{ advisor.message }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-panel footer-panel">
        <div class="footer-inner">
          <p class="contest-info">
            本平台由
            <strong>坤灵智巡创工队</strong>
            开发，面向智慧农业监测与灾害预警场景
          </p>
          <p class="school-info">河北地质大学 &nbsp;|&nbsp; 坤灵智巡创工队</p>
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
  CloudServerOutlined,
  RobotOutlined,
  AreaChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'

import vueIcon from '@/assets/icons/vue.svg'
import teamDefaultAvatar from '@/assets/avatars/team-default.svg'
import advisorDefaultAvatar from '@/assets/avatars/advisor-default.svg'
import agriMonitoringIllustration from '@/assets/illustrations/agri-monitoring-line.svg'

const TEAM_AVATAR = teamDefaultAvatar

const techStack = ref([
  { name: 'Vue 3', icon: 'img', src: vueIcon, color: '#42b883' },
  {
    name: 'Ant Design',
    icon: 'img',
    src: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    color: '#1890ff'
  },
  { name: 'Deep Learning', icon: RobotOutlined, color: '#ff9c6e' },
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

const advisor = {
  name: '刘兴冉',
  title: '讲师',
  college: '土地科学与空间规划学院',
  message:
    '寄语：把地信所学落到田间，用可落地的系统守护粮安。愿坤灵智巡行稳致远，让预警更早一步。'
}

const teamMembers = ref([
  {
    name: '王佳欢',
    role: '项目负责人',
    major: '地理信息科学专业',
    desc: '国家奖学金、国家励志奖学金获得者；多次获得国家级、省级荣誉；主持过多项创新创业类赛事。',
    avatar: TEAM_AVATAR
  },
  {
    name: '张晓琳',
    role: '技术总监',
    major: '计算机科学与技术专业',
    desc: '专业成绩扎实，熟悉 C++，C# 与 Vue 开发流程，对 Web 与人工智能应用有浓厚兴趣。',
    avatar: TEAM_AVATAR
  },
  {
    name: '王子雪',
    role: '技术总监',
    major: '地理信息科学专业',
    desc: '擅长系统开发，具有丰富的数据处理与应用能力。',
    avatar: TEAM_AVATAR
  },
  {
    name: '鲍辰怡',
    role: '运营总监',
    major: '地理信息科学专业',
    desc: '负责渠道推广、活动策划与内容生产，运营项目品牌价值。',
    avatar: TEAM_AVATAR
  },
  {
    name: '周艺恬',
    role: '技术总监',
    major: '测绘工程专业',
    desc: '具有较强专业技术能力，擅长软件开发与编程。',
    avatar: TEAM_AVATAR
  },
  {
    name: '柴雨润',
    role: '行政总监',
    major: '土地资源管理专业',
    desc: '具有丰富的实践调研经验，制定与执行团队行政与日常运营安排。',
    avatar: TEAM_AVATAR
  },
  {
    name: '刘金莎',
    role: '技术总监',
    major: '地理信息科学专业',
    desc: '擅长系统开发与测试，参与营销与推广策略制定。',
    avatar: TEAM_AVATAR
  },
  {
    name: '杨紫蓉',
    role: '市场总监',
    major: '土地资源管理专业',
    desc: '具有丰富的实践调研经验，开展市场调研与渠道拓展。',
    avatar: TEAM_AVATAR
  },
  {
    name: '王婧蕾',
    role: '财务总监',
    major: '会计学专业',
    desc: '分析经营活动情况，负责日常财务核算与资金动态分析。',
    avatar: TEAM_AVATAR
  }
])
</script>

<style scoped>
.about-container {
  width: 100%;
  max-width: var(--page-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-bottom: 40px;
}

.glass-panel {
  padding: 30px;
  transition: transform 0.3s ease;
}

.section-header {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #eef1ea;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  padding-bottom: 10px;
}

.panel-header {
  text-align: center;
  margin-bottom: 20px;
}

.main-title {
  font-family: var(--font-serif);
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
  font-family: var(--font-serif);
  font-size: 28px;
  color: #b7eb8f;
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

.vision-illustration {
  display: block;
  width: 100%;
  max-width: 560px;
  margin: 0 auto 28px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
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
  font-family: var(--font-serif);
}

.dim-item p {
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

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

.team-intro {
  text-align: center;
  color: rgb(255 255 255 / 70%);
  margin-bottom: 30px;
  font-style: italic;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.member-card {
  background: rgb(0 0 0 / 25%);
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

.member-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #344e31;
  transition: background 0.3s;
}

.member-card:hover::before {
  background: #b7eb8f;
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
  font-family: var(--font-serif);
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
  background-color: #d4b106;
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
