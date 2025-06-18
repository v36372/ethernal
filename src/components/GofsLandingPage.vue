<template>
  <div class="gofs-landing-page">
    <!-- Hero Banner Section -->
    <GofsBanner
      variant="hero"
      :title="heroConfig.title"
      :subtitle="heroConfig.subtitle" 
      :description="heroConfig.description"
      text-align="center"
      overlay="gradient"
      :overlay-opacity="0.4"
      :show-actions="true"
      :primary-action="heroConfig.primaryAction"
      :secondary-action="heroConfig.secondaryAction"
      @action="handleBannerAction"
    >
      <template #actions>
        <div class="hero-actions-wrapper">
          <v-btn
            to="/overview"
            color="primary"
            variant="elevated"
            size="large"
            class="hero-btn hero-btn-primary"
          >
            <v-icon left>mdi-rocket-launch</v-icon>
            Explore Platform
          </v-btn>
          
          <v-btn
            href="#features"
            color="white"
            variant="outlined"
            size="large"
            class="hero-btn hero-btn-secondary"
          >
            <v-icon left>mdi-information</v-icon>
            Learn More
          </v-btn>
        </div>
      </template>
    </GofsBanner>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <v-container class="py-16">
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-4">
            Powerful Blockchain Infrastructure
          </h2>
          <p class="text-h6 text-medium-emphasis mx-auto" style="max-width: 600px;">
            GOFS provides a comprehensive suite of tools for managing and exploring blockchain data
          </p>
        </div>

        <v-row>
          <v-col cols="12" md="4" v-for="feature in features" :key="feature.id">
            <v-card 
              class="feature-card h-100" 
              elevation="2"
              :ripple="false"
            >
              <v-card-text class="pa-6 text-center">
                <div class="feature-icon-wrapper mb-4">
                  <v-avatar size="80" color="primary" variant="tonal">
                    <v-icon size="40" :icon="feature.icon"></v-icon>
                  </v-avatar>
                </div>
                <h3 class="text-h5 font-weight-bold mb-3">
                  {{ feature.title }}
                </h3>
                <p class="text-body-1 text-medium-emphasis">
                  {{ feature.description }}
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Stats Section -->
    <section class="stats-section bg-surface-variant">
      <v-container class="py-16">
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-4">
            Platform Statistics
          </h2>
        </div>

        <v-row>
          <v-col cols="6" md="3" v-for="stat in stats" :key="stat.id">
            <div class="stat-item text-center">
              <div class="stat-number text-h3 font-weight-bold text-primary mb-2">
                {{ stat.value }}
              </div>
              <div class="stat-label text-body-1 text-medium-emphasis">
                {{ stat.label }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Call to Action Section -->
    <section class="cta-section">
      <v-container class="py-16">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card 
              class="cta-card text-center" 
              color="primary" 
              variant="elevated"
              elevation="8"
            >
              <v-card-text class="pa-8">
                <GofsLogo 
                  size="lg" 
                  :show-text="true" 
                  :show-subtitle="true"
                  theme="dark"
                  align="center"
                  class="mb-6"
                />
                
                <h3 class="text-h4 font-weight-bold text-white mb-4">
                  Ready to Get Started?
                </h3>
                <p class="text-h6 text-white mb-6" style="opacity: 0.9;">
                  Join the future of decentralized finance with GOFS
                </p>
                
                <div class="cta-actions">
                  <v-btn
                    to="/overview"
                    color="white"
                    variant="elevated"
                    size="large"
                    class="mr-4"
                  >
                    Start Exploring
                  </v-btn>
                  
                  <v-btn
                    href="#"
                    color="white"
                    variant="outlined"
                    size="large"
                  >
                    Documentation
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GofsBanner from './base/GofsBanner.vue'
import GofsLogo from './base/GofsLogo.vue'

// Hero section configuration
const heroConfig = ref({
  title: 'GOFS',
  subtitle: 'Governable Onchain Finance System',
  description: 'Experience the next generation of decentralized finance infrastructure with comprehensive blockchain analytics, smart contract management, and real-time transaction monitoring.',
  primaryAction: {
    text: 'Explore Platform',
    to: '/overview',
    color: 'primary'
  },
  secondaryAction: {
    text: 'Learn More',
    href: '#features',
    color: 'white',
    variant: 'outlined'
  }
})

// Features data
const features = ref([
  {
    id: 1,
    icon: 'mdi-chart-line',
    title: 'Real-time Analytics',
    description: 'Monitor blockchain activity with comprehensive analytics and real-time data visualization tools.'
  },
  {
    id: 2,
    icon: 'mdi-file-document-multiple',
    title: 'Smart Contracts',
    description: 'Deploy, verify, and interact with smart contracts through our intuitive interface.'
  },
  {
    id: 3,
    icon: 'mdi-swap-horizontal',
    title: 'Transaction Explorer',
    description: 'Explore transactions, blocks, and addresses with detailed information and trace capabilities.'
  },
  {
    id: 4,
    icon: 'mdi-shield-check',
    title: 'Secure & Reliable',
    description: 'Built with security-first principles and enterprise-grade reliability for mission-critical applications.'
  },
  {
    id: 5,
    icon: 'mdi-api',
    title: 'Developer APIs',
    description: 'Integrate with our comprehensive REST APIs and WebSocket connections for real-time data.'
  },
  {
    id: 6,
    icon: 'mdi-speedometer',
    title: 'High Performance',
    description: 'Optimized for speed and scalability to handle high-volume blockchain data processing.'
  }
])

// Statistics data
const stats = ref([
  {
    id: 1,
    value: '10M+',
    label: 'Transactions Processed'
  },
  {
    id: 2,
    value: '50K+',
    label: 'Smart Contracts'
  },
  {
    id: 3,
    value: '99.9%',
    label: 'Uptime'
  },
  {
    id: 4,
    value: '24/7',
    label: 'Support'
  }
])

// Event handlers
function handleBannerAction(event) {
  console.log('Banner action:', event)
  // Handle banner action events
}
</script>

<style scoped>
.gofs-landing-page {
  min-height: 100vh;
}

/* Hero section styling */
.hero-actions-wrapper {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 12px 32px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.hero-btn-primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #4ade80 100%);
}

.hero-btn-secondary {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Features section */
.features-section {
  background: var(--v-theme-background);
  position: relative;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--v-border-color), transparent);
}

.feature-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  background: var(--v-theme-surface);
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.feature-icon-wrapper {
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1);
}

/* Stats section */
.stats-section {
  position: relative;
}

.stat-item {
  padding: 24px 16px;
}

.stat-number {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), #4ade80);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: clamp(2rem, 4vw, 3rem) !important;
}

/* CTA section */
.cta-section {
  background: var(--v-theme-background);
  position: relative;
}

.cta-card {
  border-radius: 24px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #4ade80 100%);
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .hero-actions-wrapper {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .stat-item {
    padding: 16px 8px;
  }
}

@media (max-width: 600px) {
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-actions .v-btn {
    width: 100%;
    max-width: 280px;
  }
}

/* Animation for scroll-triggered elements */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card,
.stat-item,
.cta-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Dark mode enhancements */
.v-theme--dark .feature-card {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
}

.v-theme--dark .feature-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* High contrast support */
@media (prefers-contrast: high) {
  .feature-card {
    border: 2px solid var(--v-border-color);
  }
  
  .cta-card {
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .feature-card,
  .stat-item,
  .cta-card {
    animation: none;
  }
  
  .feature-card:hover,
  .hero-btn:hover {
    transform: none;
  }
}
</style> 