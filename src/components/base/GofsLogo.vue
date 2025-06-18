<template>
  <div class="gofs-logo-wrapper" :class="wrapperClasses">
    <router-link 
      :to="to" 
      class="gofs-logo-link" 
      :class="{ 'no-decoration': !showDecoration }"
    >
      <div class="gofs-logo-container" :class="sizeClass">
        <img 
          :src="logoSrc" 
          alt="GOFS - Governable Onchain Finance System"
          class="gofs-logo-image"
          :class="imageClasses"
        />
        <div v-if="showText" class="gofs-logo-text" :class="textClasses">
          <span class="gofs-title">GOFS</span>
          <span v-if="showSubtitle" class="gofs-subtitle">
            Governable Onchain Finance System
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Size variants: 'xs', 'sm', 'md', 'lg', 'xl'
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  // Navigation link
  to: {
    type: String,
    default: '/overview'
  },
  // Show text alongside logo
  showText: {
    type: Boolean,
    default: true
  },
  // Show subtitle
  showSubtitle: {
    type: Boolean,
    default: false
  },
  // Disable link decoration
  showDecoration: {
    type: Boolean,
    default: false
  },
  // Theme variant: 'light', 'dark', 'auto'
  theme: {
    type: String,
    default: 'auto',
    validator: (value) => ['light', 'dark', 'auto'].includes(value)
  },
  // Alignment: 'left', 'center', 'right'
  align: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right'].includes(value)
  },
  // Custom margin
  margin: {
    type: String,
    default: null
  },
  // Responsive behavior
  responsive: {
    type: Boolean,
    default: true
  }
})

const logoSrc = computed(() => {
  // In production, this would be the actual logo path
  return '/src/assets/gofs-logo.png'
})

const sizeClass = computed(() => `gofs-logo--${props.size}`)

const wrapperClasses = computed(() => ({
  [`gofs-logo--align-${props.align}`]: true,
  'gofs-logo--responsive': props.responsive,
  'gofs-logo--theme-light': props.theme === 'light',
  'gofs-logo--theme-dark': props.theme === 'dark',
  'gofs-logo--with-margin': props.margin
}))

const imageClasses = computed(() => ({
  'gofs-logo--text-mode': props.showText
}))

const textClasses = computed(() => ({
  [`gofs-text--${props.size}`]: true
}))
</script>

<style scoped>
.gofs-logo-wrapper {
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.gofs-logo-wrapper.gofs-logo--align-center {
  justify-content: center;
}

.gofs-logo-wrapper.gofs-logo--align-right {
  justify-content: flex-end;
}

.gofs-logo-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.gofs-logo-link.no-decoration:hover {
  text-decoration: none;
}

.gofs-logo-link:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.gofs-logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gofs-logo-image {
  display: block;
  max-width: 100%;
  height: auto;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

/* Size variants */
.gofs-logo--xs .gofs-logo-image {
  max-height: 24px;
  width: auto;
}

.gofs-logo--sm .gofs-logo-image {
  max-height: 32px;
  width: auto;
}

.gofs-logo--md .gofs-logo-image {
  max-height: 40px;
  width: auto;
}

.gofs-logo--lg .gofs-logo-image {
  max-height: 56px;
  width: auto;
}

.gofs-logo--xl .gofs-logo-image {
  max-height: 72px;
  width: auto;
}

/* Text styling */
.gofs-logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.gofs-title {
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-primary, #1a1a1a);
  font-family: 'Inter', 'Roboto', sans-serif;
}

.gofs-subtitle {
  font-weight: 400;
  color: var(--text-secondary, #666);
  font-family: 'Inter', 'Roboto', sans-serif;
  margin-top: 2px;
}

/* Text size variants */
.gofs-text--xs .gofs-title {
  font-size: 14px;
}

.gofs-text--xs .gofs-subtitle {
  font-size: 10px;
}

.gofs-text--sm .gofs-title {
  font-size: 16px;
}

.gofs-text--sm .gofs-subtitle {
  font-size: 11px;
}

.gofs-text--md .gofs-title {
  font-size: 20px;
}

.gofs-text--md .gofs-subtitle {
  font-size: 12px;
}

.gofs-text--lg .gofs-title {
  font-size: 24px;
}

.gofs-text--lg .gofs-subtitle {
  font-size: 14px;
}

.gofs-text--xl .gofs-title {
  font-size: 28px;
}

.gofs-text--xl .gofs-subtitle {
  font-size: 16px;
}

/* Theme variants */
.gofs-logo--theme-light .gofs-title {
  color: #1a1a1a;
}

.gofs-logo--theme-light .gofs-subtitle {
  color: #666;
}

.gofs-logo--theme-dark .gofs-title {
  color: #ffffff;
}

.gofs-logo--theme-dark .gofs-subtitle {
  color: #cccccc;
}

/* Responsive behavior */
.gofs-logo--responsive {
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .gofs-logo--responsive .gofs-logo--lg .gofs-logo-image {
    max-height: 40px;
  }
  
  .gofs-logo--responsive .gofs-logo--xl .gofs-logo-image {
    max-height: 48px;
  }
  
  .gofs-logo--responsive .gofs-text--lg .gofs-title {
    font-size: 20px;
  }
  
  .gofs-logo--responsive .gofs-text--xl .gofs-title {
    font-size: 22px;
  }
}

@media (max-width: 600px) {
  .gofs-logo--responsive .gofs-logo-container {
    gap: 8px;
  }
  
  .gofs-logo--responsive .gofs-subtitle {
    display: none;
  }
  
  .gofs-logo--responsive .gofs-logo--lg .gofs-logo-image,
  .gofs-logo--responsive .gofs-logo--xl .gofs-logo-image {
    max-height: 32px;
  }
}

/* Custom margin support */
.gofs-logo--with-margin {
  margin: v-bind(margin);
}

/* Animation for logo appearance */
@keyframes logoFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gofs-logo-wrapper {
  animation: logoFadeIn 0.6s ease-out;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .gofs-logo--theme-auto .gofs-title {
    color: #ffffff;
  }
  
  .gofs-logo--theme-auto .gofs-subtitle {
    color: #cccccc;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2) {
  .gofs-logo-image {
    image-rendering: -webkit-optimize-contrast;
  }
}
</style> 