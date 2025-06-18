<template>
  <div class="gofs-banner-wrapper" :class="wrapperClasses">
    <div class="gofs-banner-container" :class="containerClasses">
      <div class="gofs-banner-content" :class="contentClasses">
        <!-- Background Image -->
        <div class="gofs-banner-bg" :style="backgroundStyles">
          <div class="gofs-banner-overlay" :class="overlayClasses"></div>
        </div>
        
        <!-- Content Area -->
        <div class="gofs-banner-text-content" :class="textContentClasses">
          <div class="gofs-banner-text-wrapper">
            <h1 v-if="title" class="gofs-banner-title" :class="titleClasses">
              {{ title }}
            </h1>
            <h2 v-if="subtitle" class="gofs-banner-subtitle" :class="subtitleClasses">
              {{ subtitle }}
            </h2>
            <p v-if="description" class="gofs-banner-description" :class="descriptionClasses">
              {{ description }}
            </p>
            
            <!-- Action Buttons -->
            <div v-if="showActions" class="gofs-banner-actions" :class="actionsClasses">
              <slot name="actions">
                <v-btn 
                  v-if="primaryAction"
                  :to="primaryAction.to"
                  :href="primaryAction.href"
                  :color="primaryAction.color || 'primary'"
                  :variant="primaryAction.variant || 'elevated'"
                  :size="actionSize"
                  class="gofs-banner-btn gofs-banner-btn-primary"
                  @click="handleAction('primary', primaryAction)"
                >
                  {{ primaryAction.text }}
                </v-btn>
                
                <v-btn 
                  v-if="secondaryAction"
                  :to="secondaryAction.to"
                  :href="secondaryAction.href"
                  :color="secondaryAction.color || 'white'"
                  :variant="secondaryAction.variant || 'outlined'"
                  :size="actionSize"
                  class="gofs-banner-btn gofs-banner-btn-secondary"
                  @click="handleAction('secondary', secondaryAction)"
                >
                  {{ secondaryAction.text }}
                </v-btn>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Banner variant: 'hero', 'section', 'compact'
  variant: {
    type: String,
    default: 'hero',
    validator: (value) => ['hero', 'section', 'compact'].includes(value)
  },
  // Content
  title: {
    type: String,
    default: 'GOFS'
  },
  subtitle: {
    type: String,
    default: 'Governable Onchain Finance System'
  },
  description: {
    type: String,
    default: null
  },
  // Background image path
  backgroundImage: {
    type: String,
    default: '/src/assets/gofs-banner.png'
  },
  // Overlay settings
  overlay: {
    type: [Boolean, String],
    default: true
  },
  overlayOpacity: {
    type: Number,
    default: 0.3
  },
  // Height settings
  height: {
    type: String,
    default: null // Will use variant defaults
  },
  minHeight: {
    type: String,
    default: null
  },
  maxHeight: {
    type: String,
    default: null
  },
  // Content alignment: 'left', 'center', 'right'
  textAlign: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right'].includes(value)
  },
  // Actions
  showActions: {
    type: Boolean,
    default: false
  },
  primaryAction: {
    type: Object,
    default: null
  },
  secondaryAction: {
    type: Object,
    default: null
  },
  // Responsive settings
  responsive: {
    type: Boolean,
    default: true
  },
  // Padding
  padding: {
    type: String,
    default: null
  },
  // Custom classes
  customClass: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['action'])

const backgroundStyles = computed(() => ({
  backgroundImage: `url(${props.backgroundImage})`,
  height: props.height || getVariantHeight(),
  minHeight: props.minHeight,
  maxHeight: props.maxHeight
}))

const wrapperClasses = computed(() => ({
  [`gofs-banner--${props.variant}`]: true,
  'gofs-banner--responsive': props.responsive,
  [props.customClass]: props.customClass
}))

const containerClasses = computed(() => ({
  'gofs-banner--with-padding': props.padding
}))

const contentClasses = computed(() => ({
  [`gofs-banner--align-${props.textAlign}`]: true
}))

const overlayClasses = computed(() => ({
  'gofs-banner-overlay--dark': props.overlay === 'dark',
  'gofs-banner-overlay--light': props.overlay === 'light',
  'gofs-banner-overlay--gradient': props.overlay === 'gradient',
  'gofs-banner-overlay--none': !props.overlay
}))

const textContentClasses = computed(() => ({
  [`gofs-banner-content--${props.variant}`]: true
}))

const titleClasses = computed(() => ({
  [`gofs-banner-title--${props.variant}`]: true
}))

const subtitleClasses = computed(() => ({
  [`gofs-banner-subtitle--${props.variant}`]: true
}))

const descriptionClasses = computed(() => ({
  [`gofs-banner-description--${props.variant}`]: true
}))

const actionsClasses = computed(() => ({
  [`gofs-banner-actions--${props.variant}`]: true,
  [`gofs-banner-actions--${props.textAlign}`]: true
}))

const actionSize = computed(() => {
  switch (props.variant) {
    case 'hero': return 'large'
    case 'compact': return 'default'
    default: return 'large'
  }
})

function getVariantHeight() {
  switch (props.variant) {
    case 'hero': return '100vh'
    case 'section': return '400px'
    case 'compact': return '200px'
    default: return '400px'
  }
}

function handleAction(type, action) {
  if (action.onClick) {
    action.onClick()
  }
  emit('action', { type, action })
}
</script>

<style scoped>
.gofs-banner-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.gofs-banner-container {
  position: relative;
  width: 100%;
}

.gofs-banner-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.gofs-banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.gofs-banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.gofs-banner-overlay--dark {
  background: rgba(0, 0, 0, v-bind(overlayOpacity));
}

.gofs-banner-overlay--light {
  background: rgba(255, 255, 255, v-bind(overlayOpacity));
}

.gofs-banner-overlay--gradient {
  background: linear-gradient(
    135deg,
    rgba(26, 35, 56, 0.8) 0%,
    rgba(74, 222, 128, 0.2) 100%
  );
}

.gofs-banner-overlay--none {
  display: none;
}

.gofs-banner-text-content {
  position: relative;
  z-index: 3;
  width: 100%;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.gofs-banner-text-wrapper {
  max-width: 600px;
}

/* Alignment */
.gofs-banner-content--align-center {
  justify-content: center;
  text-align: center;
}

.gofs-banner-content--align-center .gofs-banner-text-wrapper {
  margin: 0 auto;
}

.gofs-banner-content--align-right {
  justify-content: flex-end;
  text-align: right;
}

.gofs-banner-content--align-right .gofs-banner-text-wrapper {
  margin-left: auto;
}

/* Typography */
.gofs-banner-title {
  margin: 0 0 16px 0;
  font-weight: 800;
  line-height: 1.2;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', 'Roboto', sans-serif;
}

.gofs-banner-subtitle {
  margin: 0 0 20px 0;
  font-weight: 500;
  line-height: 1.4;
  color: #e0e0e0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', 'Roboto', sans-serif;
}

.gofs-banner-description {
  margin: 0 0 32px 0;
  line-height: 1.6;
  color: #f0f0f0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', 'Roboto', sans-serif;
}

/* Variant-specific typography */
.gofs-banner-title--hero {
  font-size: clamp(2.5rem, 5vw, 4rem);
}

.gofs-banner-subtitle--hero {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
}

.gofs-banner-description--hero {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
}

.gofs-banner-title--section {
  font-size: clamp(2rem, 4vw, 3rem);
}

.gofs-banner-subtitle--section {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
}

.gofs-banner-description--section {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
}

.gofs-banner-title--compact {
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: 8px;
}

.gofs-banner-subtitle--compact {
  font-size: clamp(1rem, 1.75vw, 1.25rem);
  margin-bottom: 12px;
}

.gofs-banner-description--compact {
  font-size: clamp(0.875rem, 1vw, 1rem);
  margin-bottom: 16px;
}

/* Actions */
.gofs-banner-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.gofs-banner-actions--center {
  justify-content: center;
}

.gofs-banner-actions--right {
  justify-content: flex-end;
}

.gofs-banner-btn {
  text-transform: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.gofs-banner-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
.gofs-banner--responsive {
  /* Default responsive behavior */
}

@media (max-width: 960px) {
  .gofs-banner--hero .gofs-banner-bg {
    height: 70vh;
  }
  
  .gofs-banner-text-content {
    padding: 0 20px;
  }
  
  .gofs-banner-text-wrapper {
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .gofs-banner--hero .gofs-banner-bg {
    height: 60vh;
  }
  
  .gofs-banner-text-content {
    padding: 0 16px;
  }
  
  .gofs-banner-actions {
    gap: 12px;
    flex-direction: column;
    align-items: stretch;
  }
  
  .gofs-banner-actions--center {
    align-items: center;
  }
  
  .gofs-banner-actions--right {
    align-items: flex-end;
  }
  
  .gofs-banner-btn {
    width: 100%;
    max-width: 300px;
  }
}

/* Animation */
@keyframes bannerFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gofs-banner-text-wrapper {
  animation: bannerFadeIn 1s ease-out;
}

/* Custom padding support */
.gofs-banner--with-padding {
  padding: v-bind(padding);
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .gofs-banner-overlay--dark {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .gofs-banner-title,
  .gofs-banner-subtitle,
  .gofs-banner-description {
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .gofs-banner-text-wrapper {
    animation: none;
  }
  
  .gofs-banner-btn {
    transition: none;
  }
  
  .gofs-banner-btn:hover {
    transform: none;
  }
}
</style> 