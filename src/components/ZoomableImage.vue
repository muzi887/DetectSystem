<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  MAX_SCALE,
  MIN_SCALE,
  SCALE_STEP,
  nextScaleFromWheel,
  panBy,
  resetView,
  zoomAt,
  type ZoomView
} from '@/utils/imageZoom'

const props = defineProps<{
  src: string
  alt?: string
}>()

const viewportRef = ref<HTMLElement | null>(null)
const view = ref<ZoomView>(resetView())
const dragging = ref(false)
const lastPointer = ref({ x: 0, y: 0 })
const lockedHeight = ref<number | null>(null)

watch(
  () => props.src,
  () => {
    view.value = resetView()
    lockedHeight.value = null
  }
)

const percent = computed(() => Math.round(view.value.scale * 100))
const canZoomOut = computed(() => view.value.scale > MIN_SCALE)
const canZoomIn = computed(() => view.value.scale < MAX_SCALE)

const viewportStyle = computed(() =>
  lockedHeight.value ? { height: `${lockedHeight.value}px` } : undefined
)

const imgStyle = computed(() => ({
  transform: `translate(${view.value.x}px, ${view.value.y}px) scale(${view.value.scale})`,
  cursor: view.value.scale > 1 ? (dragging.value ? 'grabbing' : 'grab') : 'zoom-in'
}))

function lockViewport(img: HTMLImageElement) {
  if (lockedHeight.value) return
  const height = img.clientHeight
  if (height > 0) lockedHeight.value = height
}

function onImgLoad(event: Event) {
  lockViewport(event.target as HTMLImageElement)
}

function originFromEvent(event: PointerEvent | WheelEvent | MouseEvent) {
  const box = viewportRef.value?.getBoundingClientRect()
  if (!box) return { x: 0, y: 0 }
  return { x: event.clientX - box.left, y: event.clientY - box.top }
}

function viewportCenter() {
  const box = viewportRef.value?.getBoundingClientRect()
  if (!box) return { x: 0, y: 0 }
  return { x: box.width / 2, y: box.height / 2 }
}

function applyScale(nextScale: number, origin: { x: number; y: number }) {
  view.value = zoomAt(view.value, nextScale, origin.x, origin.y)
}

function zoomIn() {
  applyScale(view.value.scale * SCALE_STEP, viewportCenter())
}

function zoomOut() {
  applyScale(view.value.scale / SCALE_STEP, viewportCenter())
}

function reset() {
  view.value = resetView()
}

function onWheel(event: WheelEvent) {
  const origin = originFromEvent(event)
  applyScale(nextScaleFromWheel(view.value.scale, event.deltaY), origin)
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  dragging.value = true
  lastPointer.value = { x: event.clientX, y: event.clientY }
  viewportRef.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  view.value = panBy(
    view.value,
    event.clientX - lastPointer.value.x,
    event.clientY - lastPointer.value.y
  )
  lastPointer.value = { x: event.clientX, y: event.clientY }
}

function onPointerUp(event: PointerEvent) {
  dragging.value = false
  if (viewportRef.value?.hasPointerCapture(event.pointerId)) {
    viewportRef.value.releasePointerCapture(event.pointerId)
  }
}

function onDblClick(event: MouseEvent) {
  if (view.value.scale > 1) {
    reset()
    return
  }
  applyScale(view.value.scale * SCALE_STEP * SCALE_STEP, originFromEvent(event))
}
</script>

<template>
  <div class="zoomable-image">
    <div class="zoomable-image-toolbar">
      <button
        type="button"
        class="zoom-btn"
        :disabled="!canZoomOut"
        @click="zoomOut">
        缩小
      </button>
      <span class="zoom-percent">{{ percent }}%</span>
      <button
        type="button"
        class="zoom-btn"
        :disabled="!canZoomIn"
        @click="zoomIn">
        放大
      </button>
      <button
        type="button"
        class="zoom-btn"
        :disabled="view.scale <= 1"
        @click="reset">
        复位
      </button>
      <span class="zoom-hint">滚轮放大，拖动查看局部；双击放大，再双击复位</span>
    </div>
    <div
      ref="viewportRef"
      class="zoomable-image-viewport"
      :style="viewportStyle"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @dblclick.prevent="onDblClick">
      <img
        class="zoomable-image-img"
        :src="src"
        :alt="alt"
        :style="imgStyle"
        draggable="false"
        @load="onImgLoad" />
    </div>
  </div>
</template>

<style scoped>
.zoomable-image {
  position: relative;
}

.zoomable-image-toolbar {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: calc(100% - 16px);
  padding: 6px 8px;
  border-radius: 8px;
  background: rgb(0 0 0 / 58%);
}

.zoom-btn {
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--glass-text-primary);
  background: var(--glass-bg-subtle);
  border: 1px solid var(--glass-border-strong);
  border-radius: 6px;
  cursor: pointer;
}

.zoom-btn:hover:not(:disabled) {
  background: var(--glass-bg-item-hover);
}

.zoom-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.zoom-percent {
  min-width: 3.2em;
  font-size: 13px;
  color: var(--glass-text-primary);
  text-align: center;
}

.zoom-hint {
  font-size: 12px;
  color: var(--glass-text-muted);
}

.zoomable-image-viewport {
  overflow: hidden;
  width: 100%;
  max-height: 80vh;
  background: var(--dark-green);
  touch-action: none;
  user-select: none;
}

.zoomable-image-img {
  display: block;
  width: 100%;
  max-height: 80vh;
  height: auto;
  object-fit: contain;
  transform-origin: 0 0;
  pointer-events: none;
  background: #fff;
}
</style>
