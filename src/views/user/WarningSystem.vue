<!-- src/views/user/AboutUs.vue -->
<template>
  <AppLayout>
    <main class="main-content">
      <div class="content-wrapper">
        <a-card :bordered="false">
          <template #title>
            <div class="card-title">关于我们</div>
          </template>

          <div class="about-us-content">
            <!-- 1. 项目愿景 -->
            <section class="about-section">
              <h2 class="section-title">
                <AimOutlined />
                我们的愿景
              </h2>
              <p>
                我们是来自 **[你的大学名称] [你的学院或实验室]**
                的一支充满激情的学生团队。面对全球气候变化对农业生产带来的严峻挑战，我们致力于将前沿的人工智能技术与农业物联网（AIoT）相结合，打造一个智能化、精准化的作物灾害监测预警系统。我们的目标是为现代农业提供智慧“大脑”，有效降低自然灾害带来的损失，为保障国家粮食安全贡献青春力量。
              </p>
            </section>

            <a-divider class="section-divider" />

            <!-- 2. 技术栈 -->
            <section class="about-section">
              <h2 class="section-title">
                <CodeOutlined />
                技术栈
              </h2>
              <div class="tech-stack-grid">
                <div
                  v-for="tech in techStack"
                  :key="tech.name"
                  class="tech-item">
                  <component
                    :is="tech.icon"
                    class="tech-icon"
                    :style="{ color: tech.color }" />
                  <span>{{ tech.name }}</span>
                </div>
              </div>
            </section>

            <a-divider class="section-divider" />

            <!-- 3. 团队成员 -->
            <section class="about-section">
              <h2 class="section-title">
                <TeamOutlined />
                核心团队
              </h2>
              <div class="team-grid">
                <div
                  v-for="member in teamMembers"
                  :key="member.name"
                  class="team-member-card">
                  <a-avatar
                    :size="80"
                    :src="member.avatar"
                    class="team-avatar">
                    {{ member.name.charAt(0) }}
                  </a-avatar>
                  <h4 class="member-name">{{ member.name }}</h4>
                  <p class="member-role">{{ member.role }}</p>
                  <p class="member-quote">“{{ member.quote }}”</p>
                </div>
              </div>
            </section>

            <a-divider class="section-divider" />

            <!-- 4. 指导老师 -->
            <section class="about-section">
              <h2 class="section-title">
                <TrophyOutlined />
                指导老师
              </h2>
              <div class="team-grid advisor-grid">
                <div class="team-member-card">
                  <a-avatar
                    :size="80"
                    class="team-avatar">
                    师
                  </a-avatar>
                  <h4 class="member-name">[指导老师姓名]</h4>
                  <p class="member-role">[老师职称], [研究方向]</p>
                  <p class="member-quote">“寄语：脚踏实地，仰望星空。”</p>
                </div>
              </div>
            </section>

            <a-divider class="section-divider" />

            <!-- 5. 联系我们 -->
            <section class="about-section">
              <h2 class="section-title">
                <MailOutlined />
                联系与支持
              </h2>
              <p>
                本项目为第X届“挑战杯”大学生创业计划竞赛参赛作品，由 **[你的大学名称]** 提供支持。
                <br />
                如果您对我们的项目感兴趣或有任何建议，欢迎联系我们：
                <a href="mailto:project-email@your-school.edu">project-email@your-school.edu</a>
              </p>
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
  // 用于技术栈图标
  CloudServerOutlined,
  RobotOutlined,
  AreaChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'
// import vueIcon from '@/assets/icons/vue.svg' // 假设你有一个Vue的SVG图标
// import pythonIcon from '@/assets/icons/python.svg' // 假设你有一个Python的SVG图标

// --- 请在这里填充你的真实信息 ---

// 技术栈数据
const techStack = ref([
  { name: 'Vue 3', icon: 'img', src: vueIcon, color: '#42b883' },
  {
    name: 'Ant Design Vue',
    icon: 'img',
    src: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    color: '#1890ff'
  },
  { name: 'Python', icon: 'img', src: pythonIcon, color: '#3776ab' },
  { name: 'TensorFlow/PyTorch', icon: RobotOutlined, color: '#ff6f00' },
  { name: 'Flask/Django', icon: CloudServerOutlined, color: '#ffffff' },
  { name: 'MySQL/PostgreSQL', icon: DatabaseOutlined, color: '#00758f' },
  { name: 'ECharts/D3.js', icon: AreaChartOutlined, color: '#c23531' },
  {
    name: 'Leaflet.js',
    icon: 'img',
    src: 'https://leafletjs.com/docs/images/logo.png',
    color: '#8cc427'
  }
])

// 团队成员数据
const teamMembers = ref([
  {
    name: '[成员A姓名]',
    role: '项目负责人 / PM',
    quote: '用代码连接现实，用创新解决问题。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' // 替换为成员照片URL
  },
  {
    name: '[成员B姓名]',
    role: 'AI算法工程师',
    quote: '数据是新的土壤，模型是新的种子。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '[成员C姓名]',
    role: '前端开发工程师',
    quote: '追求极致的用户体验和像素级的完美。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '[成员D姓名]',
    role: '后端 & 数据库',
    quote: '构建稳定可靠的系统，是智慧的基石。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  }
])
</script>

<style scoped>
/* 沿用其他页面的布局，确保一致性 */
.main-content {
  display: flex;
  justify-content: center;
  width: 100%;
}

.content-wrapper {
  width: 100%;
  max-width: 900px;
}

/* 卡片和标题样式 */
.content-wrapper :deep(.ant-card) {
  background-color: var(--glass-bg, rgb(255 255 255 / 10%));
  border-radius: 12px;
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
}

.content-wrapper :deep(.ant-card-head) {
  border-bottom: 1px solid rgb(255 255 255 / 20%);
}

.card-title {
  color: var(--light-green, #eef1ea);
  font-size: 20px;
  font-weight: bold;
}

/* 关于我们页面独有内容样式 */
.about-us-content {
  padding: 16px;
  color: rgb(255 255 255 / 85%);
  line-height: 1.8;
}

.about-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--light-green, #eef1ea);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-divider {
  border-color: rgb(255 255 255 / 20%) !important;
  margin: 32px 0;
}

/* 技术栈网格 */
.tech-stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 20px;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 8px;
  padding: 20px 10px;
  text-align: center;
  transition: all 0.3s ease;
}

.tech-item:hover {
  transform: translateY(-5px);
  background-color: rgb(255 255 255 / 10%);
  border-color: rgb(255 255 255 / 30%);
}

.tech-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

/* 自定义图片图标 */
.tech-item img {
  height: 32px;
  margin-bottom: 12px;
}

/* 团队成员网格 */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.advisor-grid {
  grid-template-columns: minmax(220px, 1fr); /* 指导老师只占一列，但保持居中 */
  justify-content: center;
}

.team-member-card {
  background-color: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.team-member-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgb(0 0 0 / 20%);
  border-color: rgb(255 255 255 / 30%);
}

.team-avatar {
  margin-bottom: 16px;
  border: 2px solid var(--dark-green);
}

.member-name {
  font-size: 16px;
  color: white;
  font-weight: 600;
  margin-bottom: 4px;
}

.member-role {
  font-size: 13px;
  color: var(--light-green);
  margin-bottom: 12px;
}

.member-quote {
  font-size: 13px;
  color: rgb(255 255 255 / 70%);
  font-style: italic;
  margin-bottom: 0;
}

/* 链接样式 */
.about-us-content a {
  color: var(--primary-green);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s;
}

.about-us-content a:hover {
  color: var(--light-green);
}
</style>
