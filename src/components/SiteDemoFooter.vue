<template>
  <footer class="site-demo-footer">
    <p>{{ FOOTER_DISCLAIMER }}</p>
  </footer>
</template>

<script setup lang="ts">
import { FOOTER_DISCLAIMER } from '@/demo/copy'
</script>

<style scoped>
.site-demo-footer {
  padding: 12px 24px 20px;
  color: var(--glass-text-muted);
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}
</style>
