const featureFlags = {
  payments: Boolean(process.env.FEATURE_PAYMENTS_ENABLED),
  paidTrial: Boolean(process.env.FEATURE_PAID_TRIAL_ENABLED),
  aiProjectBuilder: Boolean(process.env.FEATURE_AI_PROJECT_BUILDER_ENABLED),
  aiProposalAssistant: Boolean(process.env.FEATURE_AI_PROPOSAL_ASSISTANT_ENABLED),
  teamMode: Boolean(process.env.FEATURE_TEAM_MODE_ENABLED),
  messaging: Boolean(process.env.FEATURE_MESSAGING_ENABLED),
  githubIntegration: Boolean(process.env.FEATURE_GITHUB_INTEGRATION_ENABLED),
  darkMode: true,
} as const;

export type FeatureFlags = typeof featureFlags;

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}

export default featureFlags;
