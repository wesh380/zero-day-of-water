import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wesh360.ir'
  const lastModified = new Date()

  const dashboardUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/dashboards/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const electricityUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/electricity/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/electricity/quality.html`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/electricity/peak.html`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
  ]

  const gasUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/gas/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gas/energy.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/gas/fuel-carbon.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
  ]

  const waterUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/water/hub/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/water/cld/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.78,
    },
    {
      url: `${baseUrl}/water/cost-calculator.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const calculatorUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/calculators/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/calculators/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const docUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/docs/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/docs/electricity/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.58,
    },
    {
      url: `${baseUrl}/docs/electricity/quality.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.56,
    },
    {
      url: `${baseUrl}/docs/electricity/peak.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.56,
    },
    {
      url: `${baseUrl}/docs/electricity/power-tariff.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/docs/gas/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.58,
    },
    {
      url: `${baseUrl}/docs/gas/energy.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/docs/gas/fuel-carbon.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/docs/water/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.58,
    },
    {
      url: `${baseUrl}/docs/water/hub.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.56,
    },
    {
      url: `${baseUrl}/docs/water/insights.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.56,
    },
    {
      url: `${baseUrl}/docs/water/cld/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.56,
    },
    {
      url: `${baseUrl}/docs/water/cost-calculator.html`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/docs/research/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/docs/security/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.48,
    },
    {
      url: `${baseUrl}/docs/security-policy/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.48,
    },
    {
      url: `${baseUrl}/docs/responsible-disclosure/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.48,
    },
  ]

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...dashboardUrls,
    ...waterUrls,
    ...electricityUrls,
    ...gasUrls,
    ...calculatorUrls,
    {
      url: `${baseUrl}/research/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/amaayesh/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...docUrls,
  ]
}
