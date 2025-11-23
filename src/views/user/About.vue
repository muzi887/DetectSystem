<!-- src/views/user/About.vue -->
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
                我们的愿景：青禾智匠
              </h2>
              <div class="vision-highlight">
                <h3>“AI守麦田，数据护粮仓 —— 坤灵智巡，让灾害预警'跑'在成灾前”</h3>
              </div>
              <p>
                我们是来自河北地质大学的
                <strong>坤灵智巡创工队</strong>
                。本项目“青禾智匠”是一款人工智能技术赋能下的作物灾害智慧监测预警系统。
              </p>
              <div class="vision-details">
                <ul>
                  <li>
                    <strong>技术维度：</strong>
                    从卫星遥感到田间传感器，构建毫米级灾害监测网，实现AI智能监测、大数据分析与实时预警。
                  </li>
                  <li>
                    <strong>社会价值：</strong>
                    旨在每年减少20%农作物损失，守护8亿亩耕地安全，保障粮食安全，助力农业可持续发展。
                  </li>
                  <li>
                    <strong>团队宣言：</strong>
                    一人的算法守护亿万人的饭碗。科技赋能农业，守护每一寸麦田，创新驱动未来。
                  </li>
                </ul>
              </div>
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
                  <img
                    v-if="tech.icon === 'img'"
                    :src="tech.src"
                    :alt="tech.name" />
                  <component
                    :is="tech.icon"
                    v-else
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
                坤灵智巡 · 核心团队
              </h2>
              <p class="team-intro">
                学科交融，优势互补。我们是一支集计算机、地信、测绘、土管、会计等多学科背景的复合型创新团队。
              </p>
              <div class="team-grid">
                <div
                  v-for="member in teamMembers"
                  :key="member.name"
                  class="team-member-card">
                  <a-avatar
                    :size="80"
                    :src="member.avatar"
                    class="team-avatar"
                    :style="{ backgroundColor: getAvatarColor(member.name) }">
                    {{ member.name.charAt(0) }}
                  </a-avatar>
                  <h4 class="member-name">{{ member.name }}</h4>
                  <div class="member-tags">
                    <span class="role-tag">{{ member.role }}</span>
                  </div>
                  <p class="member-major">{{ member.major }}</p>
                  <p class="member-desc">{{ member.desc }}</p>
                </div>
              </div>
            </section>

            <a-divider class="section-divider" />

            <!-- 4. 指导老师 (保持不变) -->
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
                  <h4 class="member-name">刘兴冉</h4>
                  <p class="member-role">[老师职称], [研究方向]</p>
                  <p class="member-quote">“寄语：脚踏实地，仰望星空。”</p>
                </div>
              </div>
            </section>

            <a-divider class="section-divider" />

            <!-- 5. 联系与支持 -->
            <section class="about-section">
              <h2 class="section-title">
                <MailOutlined />
                联系与支持
              </h2>
              <p>
                本项目为
                <strong>2025-2026年“挑战杯”大学生创业计划竞赛</strong>
                参赛作品。
                <br />
                参赛学校：河北地质大学 | 团队名称：坤灵智巡创工队
                <br />
                如果您对我们的项目感兴趣，欢迎联系：
                <a href="mailto:kunling-smart@hgu.edu.cn">kunling-smart@hgu.edu.cn</a>
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
  CloudServerOutlined,
  RobotOutlined,
  AreaChartOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue'

import vueIcon from '@/assets/icons/vue.svg'

// 为了让头像更有趣，随机分配背景色的辅助函数
const getAvatarColor = (name: string) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#52c41a']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// 技术栈数据 (保持不变或微调)
const techStack = ref([
  { name: 'Vue 3', icon: 'img', src: vueIcon, color: '#42b883' },
  {
    name: 'Ant Design Vue',
    icon: 'img',
    src: 'https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png',
    color: '#1890ff'
  },
  { name: 'AI深度学习', icon: RobotOutlined, color: '#ff6f00' },
  { name: '物联网/传感器', icon: CloudServerOutlined, color: '#000000' },
  { name: '大数据分析', icon: DatabaseOutlined, color: '#00758f' },
  { name: '数据可视化', icon: AreaChartOutlined, color: '#c23531' },
  {
    name: 'GIS/遥感技术',
    icon: 'img',
    src: 'https://leafletjs.com/docs/images/logo.png',
    color: '#8cc427'
  }
])

// 团队成员数据 - 根据图片及您的要求更新
// 注意：请手动替换 avatar 字段为您团队成员的真实照片 URL
const teamMembers = ref([
  {
    name: '王佳欢',
    role: '项目负责人',
    major: '荣誉资质',
    desc: '国家奖学金、国家励志奖学金获得者。多次获得国家级、省级荣誉，具有丰富的主持创新创业类赛事经验。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    // --- 您的位置 ---
    name: '您（请替换姓名）',
    role: '核心架构 / 技术攻坚',
    major: '计算机科学与技术专业',
    desc: '负责系统底层架构设计与AI核心算法攻坚。以计算机科学之力驱动农业智能化转型，用代码编织智慧丰收的未来。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '王子雪',
    role: '技术总监',
    major: '地理信息科学专业',
    desc: '擅长系统开发，具有丰富的数据处理与应用能力。负责GIS空间分析与后端系统集成。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '刘金莎',
    role: '技术总监',
    major: '地理信息科学专业',
    desc: '擅长系统开发测试与制定营销战略。保障平台稳定性，优化用户交互体验。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '周艺恬',
    role: '技术总监',
    major: '测绘工程专业',
    desc: '具有较强专业技术能力，擅长软件开发与编程。专注测绘数据与数字孪生技术的融合。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '柴雨润',
    role: '行政总监',
    major: '土地资源管理专业',
    desc: '制定与执行公司行政战略，具有丰富的实践调研经验，统筹团队日常运营。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '鲍辰怡',
    role: '运营总监',
    major: '地理信息科学专业',
    desc: '负责渠道推广、活动策划与内容生产。致力于运营本公司品牌价值，提升市场影响力。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '杨紫蓉',
    role: '市场总监',
    major: '土地资源管理专业',
    desc: '具有丰富实践调研经验，负责系统的市场调研与拓展，精准定位用户需求。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  },
  {
    name: '王婧蕾',
    role: '财务总监',
    major: '会计学专业',
    desc: '分析经营活动情况，负责日常财务核算与资金动态分析，保障项目资金健康流转。',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  }
])
</script>

<style scoped>
/* 
   保持原有的 style，这里添加一些针对新结构的微调 
   你可以将这些 CSS 替换或合并到你现有的 <style> 标签中
*/
.main-content {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #1890ff;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.vision-highlight {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
  border-radius: 4px;
}

.vision-highlight h3 {
  margin: 0;
  color: #1890ff;
  font-weight: bold;
  font-size: 18px;
}

.vision-details ul {
  list-style-type: none;
  padding: 0;
}

.vision-details li {
  margin-bottom: 10px;
  font-size: 15px;
  color: #555;
  line-height: 1.6;
}

.team-intro {
  text-align: center;
  margin-bottom: 30px;
  color: #666;
  font-style: italic;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.team-member-card {
  text-align: center;
  padding: 24px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
  background: #fff;
}

.team-member-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  transform: translateY(-5px);
}

.team-avatar {
  margin-bottom: 16px;
  font-size: 32px;
}

.member-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.member-tags {
  margin-bottom: 8px;
}

.role-tag {
  display: inline-block;
  padding: 2px 10px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.member-major {
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
  font-weight: 500;
}

.member-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  text-align: left; /* 描述文字左对齐更易阅读 */
  background: #fafafa;
  padding: 10px;
  border-radius: 4px;
}

.member-quote {
  font-style: italic;
  color: #888;
  margin-top: 10px;
}

.tech-stack-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}

.tech-icon,
.tech-item img {
  font-size: 32px;
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  object-fit: contain;
}

.advisor-grid {
  justify-content: center;
}
</style>
