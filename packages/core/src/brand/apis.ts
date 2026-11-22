/**
 * The APIs people hold keys for, by their slug in the brand catalogue
 * (catalog.ts): the hosts each key goes to, how a request carries it, the
 * variable a command reads it from, what its keys start with, and the page of
 * the service's own where a key is replaced. Like the catalogue, it names
 * services only to identify them; trademarks belong to their owners.
 */
export interface ApiService {
  /** Its slug in the brand catalogue. */
  slug: string;
  hosts: string[];
  /** How its API takes a key; `bearer` where this says nothing. */
  sendAs?: string;
  env: string;
  /** What its keys, or their ids, start with: a key pasted with one names the service. */
  prefixes?: string[];
  /** The page of its own where a key is replaced. Opened only when its owner clicks. */
  replace?: string;
}

/**
 * Prefixes are each service's own, as it documents them; a bare `sk-` or
 * `sk_` is several services' and names none. A prefix that names an id (AWS's
 * AKIA) is matched against the key's id as well as the key.
 */
export const API_SERVICES: readonly ApiService[] = [
  { slug: 'stripe', hosts: ['api.stripe.com'], env: 'STRIPE_API_KEY', prefixes: ['sk_live_', 'sk_test_', 'rk_live_', 'rk_test_', 'pk_live_', 'pk_test_', 'whsec_'], replace: 'https://dashboard.stripe.com/apikeys' },
  { slug: 'github', hosts: ['api.github.com'], env: 'GITHUB_TOKEN', prefixes: ['github_pat_', 'ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_'], replace: 'https://github.com/settings/tokens' },
  { slug: 'gitlab', hosts: ['gitlab.com'], sendAs: 'header:PRIVATE-TOKEN', env: 'GITLAB_TOKEN', prefixes: ['glpat-', 'gldt-', 'glrt-', 'glptt-', 'glft-'], replace: 'https://gitlab.com/-/user_settings/personal_access_tokens' },
  { slug: 'openai', hosts: ['api.openai.com'], env: 'OPENAI_API_KEY', prefixes: ['sk-proj-', 'sk-svcacct-', 'sk-admin-'], replace: 'https://platform.openai.com/api-keys' },
  { slug: 'anthropic', hosts: ['api.anthropic.com'], sendAs: 'header:x-api-key', env: 'ANTHROPIC_API_KEY', prefixes: ['sk-ant-'], replace: 'https://console.anthropic.com/settings/keys' },
  { slug: 'aws', hosts: ['*.amazonaws.com'], env: 'AWS_SECRET_ACCESS_KEY', prefixes: ['AKIA', 'ASIA'], replace: 'https://console.aws.amazon.com/iam/home#/security_credentials' },
  { slug: 'google', hosts: ['*.googleapis.com'], sendAs: 'header:x-goog-api-key', env: 'GOOGLE_API_KEY', prefixes: ['AIza', 'GOCSPX-'], replace: 'https://console.cloud.google.com/apis/credentials' },
  { slug: 'slack', hosts: ['slack.com'], env: 'SLACK_TOKEN', prefixes: ['xoxb-', 'xoxp-', 'xoxa-', 'xapp-'], replace: 'https://api.slack.com/apps' },
  { slug: 'sendgrid', hosts: ['api.sendgrid.com'], env: 'SENDGRID_API_KEY', prefixes: ['SG.'], replace: 'https://app.sendgrid.com/settings/api_keys' },
  { slug: 'cloudflare', hosts: ['api.cloudflare.com'], env: 'CLOUDFLARE_API_TOKEN', replace: 'https://dash.cloudflare.com/profile/api-tokens' },
  { slug: 'digitalocean', hosts: ['api.digitalocean.com'], env: 'DIGITALOCEAN_TOKEN', prefixes: ['dop_v1_', 'doo_v1_', 'dor_v1_'], replace: 'https://cloud.digitalocean.com/account/api/tokens' },
  { slug: 'vercel', hosts: ['api.vercel.com'], env: 'VERCEL_TOKEN', replace: 'https://vercel.com/account/tokens' },
  { slug: 'netlify', hosts: ['api.netlify.com'], env: 'NETLIFY_AUTH_TOKEN', prefixes: ['nfp_'], replace: 'https://app.netlify.com/user/applications' },
  { slug: 'heroku', hosts: ['api.heroku.com'], env: 'HEROKU_API_KEY', prefixes: ['HRKU-'], replace: 'https://dashboard.heroku.com/account/applications' },
  { slug: 'npm', hosts: ['registry.npmjs.org'], env: 'NPM_TOKEN', prefixes: ['npm_'] },
  { slug: 'docker', hosts: ['hub.docker.com', 'registry-1.docker.io'], sendAs: 'basic', env: 'DOCKER_TOKEN', prefixes: ['dckr_pat_', 'dckr_oat_'], replace: 'https://app.docker.com/settings/personal-access-tokens' },
  { slug: 'mailgun', hosts: ['api.mailgun.net', 'api.eu.mailgun.net'], sendAs: 'basic', env: 'MAILGUN_API_KEY' },
  { slug: 'shopify', hosts: ['*.myshopify.com'], sendAs: 'header:X-Shopify-Access-Token', env: 'SHOPIFY_ACCESS_TOKEN', prefixes: ['shpat_', 'shpca_', 'shppa_', 'shpss_'] },
  { slug: 'huggingface', hosts: ['huggingface.co', '*.huggingface.co'], env: 'HF_TOKEN', prefixes: ['hf_'], replace: 'https://huggingface.co/settings/tokens' },
  { slug: 'linear', hosts: ['api.linear.app'], sendAs: 'header:Authorization', env: 'LINEAR_API_KEY', prefixes: ['lin_api_'], replace: 'https://linear.app/settings/account/security' },
  { slug: 'notion', hosts: ['api.notion.com'], env: 'NOTION_TOKEN', prefixes: ['ntn_'], replace: 'https://www.notion.so/profile/integrations' },
  { slug: 'airtable', hosts: ['api.airtable.com'], env: 'AIRTABLE_API_KEY', replace: 'https://airtable.com/create/tokens' },
  { slug: 'datadog', hosts: ['*.datadoghq.com', '*.datadoghq.eu'], sendAs: 'header:DD-API-KEY', env: 'DD_API_KEY' },
  { slug: 'sentry', hosts: ['sentry.io', '*.sentry.io'], env: 'SENTRY_AUTH_TOKEN', prefixes: ['sntrys_', 'sntryu_'], replace: 'https://sentry.io/settings/account/api/auth-tokens/' },
  { slug: 'supabase', hosts: ['api.supabase.com', '*.supabase.co'], env: 'SUPABASE_ACCESS_TOKEN', prefixes: ['sbp_', 'sb_secret_', 'sb_publishable_'], replace: 'https://supabase.com/dashboard/account/tokens' },
  { slug: 'resend', hosts: ['api.resend.com'], env: 'RESEND_API_KEY', prefixes: ['re_'], replace: 'https://resend.com/api-keys' },
  { slug: 'pypi', hosts: ['upload.pypi.org'], sendAs: 'basic', env: 'PYPI_API_TOKEN', prefixes: ['pypi-'], replace: 'https://pypi.org/manage/account/token/' },
  { slug: 'replicate', hosts: ['api.replicate.com'], env: 'REPLICATE_API_TOKEN', prefixes: ['r8_'], replace: 'https://replicate.com/account/api-tokens' },
  { slug: 'mistralai', hosts: ['api.mistral.ai'], env: 'MISTRAL_API_KEY', replace: 'https://console.mistral.ai/api-keys' },
  { slug: 'groq', hosts: ['api.groq.com'], env: 'GROQ_API_KEY', prefixes: ['gsk_'], replace: 'https://console.groq.com/keys' },
  { slug: 'cohere', hosts: ['api.cohere.com', 'api.cohere.ai'], env: 'CO_API_KEY', replace: 'https://dashboard.cohere.com/api-keys' },
  { slug: 'openrouter', hosts: ['openrouter.ai'], env: 'OPENROUTER_API_KEY', prefixes: ['sk-or-'], replace: 'https://openrouter.ai/settings/keys' },
  { slug: 'deepseek', hosts: ['api.deepseek.com'], env: 'DEEPSEEK_API_KEY', replace: 'https://platform.deepseek.com/api_keys' },
  { slug: 'perplexity', hosts: ['api.perplexity.ai'], env: 'PERPLEXITY_API_KEY', prefixes: ['pplx-'] },
  { slug: 'elevenlabs', hosts: ['api.elevenlabs.io'], sendAs: 'header:xi-api-key', env: 'ELEVENLABS_API_KEY', replace: 'https://elevenlabs.io/app/settings/api-keys' },
  { slug: 'square', hosts: ['connect.squareup.com'], env: 'SQUARE_ACCESS_TOKEN', prefixes: ['EAAA', 'sq0atp-', 'sq0csp-'] },
  { slug: 'paypal', hosts: ['api-m.paypal.com'], sendAs: 'basic', env: 'PAYPAL_CLIENT_SECRET' },
  { slug: 'mailchimp', hosts: ['*.api.mailchimp.com'], sendAs: 'basic', env: 'MAILCHIMP_API_KEY' },
  { slug: 'atlassian', hosts: ['*.atlassian.net', 'api.atlassian.com'], sendAs: 'basic', env: 'ATLASSIAN_API_TOKEN', prefixes: ['ATATT'], replace: 'https://id.atlassian.com/manage-profile/security/api-tokens' },
  { slug: 'bitbucket', hosts: ['api.bitbucket.org'], sendAs: 'basic', env: 'BITBUCKET_TOKEN', prefixes: ['ATBB'] },
  { slug: 'newrelic', hosts: ['api.newrelic.com'], sendAs: 'header:Api-Key', env: 'NEW_RELIC_API_KEY', prefixes: ['NRAK-'] },
  { slug: 'circleci', hosts: ['circleci.com'], sendAs: 'header:Circle-Token', env: 'CIRCLE_TOKEN', prefixes: ['CCIPAT_'], replace: 'https://app.circleci.com/settings/user/tokens' },
  { slug: 'dropbox', hosts: ['api.dropboxapi.com', 'content.dropboxapi.com'], env: 'DROPBOX_TOKEN', prefixes: ['sl.'] },
  { slug: 'figma', hosts: ['api.figma.com'], sendAs: 'header:X-Figma-Token', env: 'FIGMA_TOKEN', prefixes: ['figd_'] },
  { slug: 'render', hosts: ['api.render.com'], env: 'RENDER_API_KEY', prefixes: ['rnd_'] },
  { slug: 'railway', hosts: ['backboard.railway.app'], env: 'RAILWAY_TOKEN' },
  { slug: 'neon', hosts: ['console.neon.tech'], env: 'NEON_API_KEY', prefixes: ['napi_'], replace: 'https://console.neon.tech/app/settings/api-keys' },
  { slug: 'upstash', hosts: ['api.upstash.com'], sendAs: 'basic', env: 'UPSTASH_API_KEY' },
  { slug: 'algolia', hosts: ['*.algolia.net', '*.algolianet.com'], sendAs: 'header:X-Algolia-API-Key', env: 'ALGOLIA_API_KEY' },
];
