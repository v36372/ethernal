const { Workspace, Explorer, StripeSubscription, StripePlan } = require('../models');

async function checkWorkspaceConfig() {
  try {
    console.log('=== Checking Workspace Configuration ===');
    
    const workspace = await Workspace.findOne({
      where: { id: 1 },
      include: [
        {
          model: Explorer,
          as: 'explorer',
          include: [
            {
              model: StripeSubscription,
              as: 'stripeSubscription',
              include: [
                {
                  model: StripePlan,
                  as: 'stripePlan'
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!workspace) {
      console.log('❌ Workspace not found');
      return;
    }
    
    console.log(`✅ Workspace found: ${workspace.name}`);
    console.log(`   ID: ${workspace.id}`);
    console.log(`   Public: ${workspace.public}`);
    console.log(`   RPC Server: ${workspace.rpcServer}`);
    
    if (!workspace.explorer) {
      console.log('❌ No explorer found');
      return;
    }
    
    console.log(`✅ Explorer found: ID ${workspace.explorer.id}`);
    console.log(`   Should Sync: ${workspace.explorer.shouldSync}`);
    
    if (!workspace.explorer.stripeSubscription) {
      console.log('❌ No stripe subscription found');
      
      // Check if there are any stripe subscriptions in the system
      const allSubscriptions = await StripeSubscription.findAll({
        include: [
          {
            model: Explorer,
            as: 'explorer',
            include: [
              {
                model: Workspace,
                as: 'workspace'
              }
            ]
          }
        ]
      });
      
      console.log(`\nTotal stripe subscriptions in system: ${allSubscriptions.length}`);
      for (const sub of allSubscriptions) {
        console.log(`  Subscription ${sub.id}: Status ${sub.status}, Explorer ${sub.explorer?.id}, Workspace ${sub.explorer?.workspace?.name}`);
      }
      
    } else {
      console.log(`✅ Stripe subscription found: ID ${workspace.explorer.stripeSubscription.id}`);
      console.log(`   Status: ${workspace.explorer.stripeSubscription.status}`);
      console.log(`   Stripe ID: ${workspace.explorer.stripeSubscription.stripeId}`);
      
      if (workspace.explorer.stripeSubscription.stripePlan) {
        console.log(`   Plan: ${workspace.explorer.stripeSubscription.stripePlan.name}`);
        console.log(`   Slug: ${workspace.explorer.stripeSubscription.stripePlan.slug}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

checkWorkspaceConfig(); 