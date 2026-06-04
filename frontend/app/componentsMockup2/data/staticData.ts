export const products = [
  {
    id: 'bio-trace',
    name: 'Bio Trace Mix',
    slug: 'bio-trace-mix',
    description: 'Bio trace minerals that make every drop of fertilizer work harder',
    long_description: 'Flora Bella Bio Trace Mix brings commercial grade trace minerals to home gardens. Most fertilizers only feed the plant. Flora Bella feeds the soil life first, so roots can absorb more of what you already give them. With over seventy naturally occurring trace minerals, this formula has supported commercial agriculture for decades and is now available for home gardeners.',
    price: 49.99,
    compare_at_price: null,
    image_url: '/20260110_145321(0).jpg',
    gallery_images: ['/20260105_163329.jpg', '/20260105_163742(0).jpg'],
    ingredients: [
      { name: 'Broad-spectrum trace minerals', amount: '70+', daily_value: '*' },
      { name: 'Humic compounds', amount: '500mg', daily_value: '*' },
      { name: 'Fulvic compounds', amount: '300mg', daily_value: '*' },
    ],
    benefits: [
      'Bigger, fuller blooms with more vibrant colors',
      'Deeper, more resilient root systems',
      'Better taste and aroma in food crops',
      'Enhanced nutrient uptake',
      'Supports soil biology',
      'Improves plant availability of existing nutrients',
    ],
    how_to_use: 'Mix 1-2 tablespoons per gallon of water. Apply during regular watering schedule. Safe for use in soil, coco, hydroponics, and compost systems. Within a few waterings you will notice thicker stems, deeper green leaves, and blooms that last longer.',
    mineral_composition: {
      trace_minerals: 70,
      humic_acid: 500,
      fulvic_acid: 300,
    },
    featured: true,
    in_stock: true,
    category: 'supplement',
    subscription_available: true,
    subscription_discount: 15,
  },
  {
    id: '1',
    name: 'Pure Magnesium Complex',
    slug: 'pure-magnesium-complex',
    description: 'Premium magnesium supplement for optimal health and vitality',
    long_description: 'Our Pure Magnesium Complex combines multiple forms of highly bioavailable magnesium to support over 300 biochemical reactions in your body. This advanced formula promotes relaxation, healthy sleep patterns, and muscle recovery while supporting cardiovascular and bone health.',
    price: 34.99,
    compare_at_price: 44.99,
    image_url: '/20260105_163329.jpg',
    gallery_images: ['/20260105_163742(0).jpg', '/20260110_145321(0).jpg'],
    ingredients: [
      { name: 'Magnesium Glycinate', amount: '200mg', daily_value: '50%' },
      { name: 'Magnesium Citrate', amount: '150mg', daily_value: '38%' },
      { name: 'Magnesium Malate', amount: '100mg', daily_value: '25%' },
    ],
    benefits: [
      'Supports healthy sleep and relaxation',
      'Promotes muscle recovery and function',
      'Maintains healthy heart rhythm',
      'Supports bone density and strength',
      'Aids in energy production',
      'Helps reduce occasional stress',
    ],
    how_to_use: 'Take 2 capsules daily with food, or as directed by your healthcare professional. For best results, take in the evening to support relaxation and restful sleep. Do not exceed recommended dose.',
    mineral_composition: {
      magnesium: 450,
      zinc: 15,
      calcium: 100,
    },
    featured: true,
    in_stock: true,
    category: 'supplement',
    subscription_available: true,
    subscription_discount: 15,
  },
  {
    id: '2',
    name: 'Essential Zinc Formula',
    slug: 'essential-zinc-formula',
    description: 'High-absorption zinc for immune support and cellular health',
    long_description: 'Our Essential Zinc Formula delivers highly bioavailable zinc to support your immune system, skin health, and cellular function. This premium formulation combines zinc with cofactors for maximum absorption and effectiveness.',
    price: 24.99,
    compare_at_price: 32.99,
    image_url: '/20260105_163742(0).jpg',
    gallery_images: ['/20260105_163329.jpg', '/20260110_145321(0).jpg'],
    ingredients: [
      { name: 'Zinc Picolinate', amount: '30mg', daily_value: '273%' },
      { name: 'Copper', amount: '2mg', daily_value: '222%' },
      { name: 'Vitamin B6', amount: '5mg', daily_value: '294%' },
    ],
    benefits: [
      'Supports immune system function',
      'Promotes healthy skin and wound healing',
      'Aids in DNA synthesis',
      'Supports reproductive health',
      'Helps maintain sense of taste and smell',
      'Supports protein synthesis',
    ],
    how_to_use: 'Take 1 capsule daily with a meal. Best taken with protein-rich foods for optimal absorption. Avoid taking with calcium supplements or dairy products as they may interfere with absorption.',
    mineral_composition: {
      zinc: 30,
      copper: 2,
    },
    featured: true,
    in_stock: true,
    category: 'supplement',
    subscription_available: true,
    subscription_discount: 15,
  },
  {
    id: '3',
    name: 'Complete Mineral Blend',
    slug: 'complete-mineral-blend',
    description: 'Comprehensive trace mineral formula for total body wellness',
    long_description: 'Our Complete Mineral Blend provides a full spectrum of essential trace minerals derived from ancient sea beds. This comprehensive formula supports energy production, enzyme function, and overall cellular health with minerals in their most bioavailable forms.',
    price: 39.99,
    compare_at_price: null,
    image_url: '/20260110_145321(0).jpg',
    gallery_images: ['/20260105_163329.jpg', '/20260105_163742(0).jpg'],
    ingredients: [
      { name: 'Ionic Sea Minerals', amount: '500mg', daily_value: '*' },
      { name: 'Magnesium', amount: '100mg', daily_value: '25%' },
      { name: 'Zinc', amount: '15mg', daily_value: '136%' },
      { name: 'Selenium', amount: '70mcg', daily_value: '127%' },
      { name: 'Chromium', amount: '120mcg', daily_value: '343%' },
    ],
    benefits: [
      'Supports energy and vitality',
      'Promotes healthy metabolism',
      'Aids in enzyme function',
      'Supports electrolyte balance',
      'Helps maintain pH balance',
      'Promotes overall wellness',
    ],
    how_to_use: 'Add 1 scoop to water or your favorite beverage once daily. Can be taken with or without food. For enhanced hydration, mix with electrolyte drinks.',
    mineral_composition: {
      magnesium: 100,
      zinc: 15,
      selenium: 0.07,
      chromium: 0.12,
    },
    featured: false,
    in_stock: true,
    category: 'supplement',
    subscription_available: true,
    subscription_discount: 10,
  },
];

export const bundles = [
  {
    id: 'bundle-1',
    name: 'Complete Wellness Bundle',
    slug: 'complete-wellness-bundle',
    description: 'Everything you need for optimal mineral nutrition',
    long_description: 'Get all three of our premium mineral supplements together and save. This complete bundle includes Pure Magnesium Complex for sleep and recovery, Essential Zinc Formula for immune support, and Complete Mineral Blend for total body wellness. Perfect for anyone serious about their mineral nutrition.',
    price: 79.99,
    compare_at_price: 99.97,
    image_url: '/20260105_163329.jpg',
    gallery_images: ['/20260105_163742(0).jpg', '/20260110_145321(0).jpg'],
    featured: true,
    savings_amount: 19.98,
    items: ['1', '2', '3'],
    benefits: [
      'Complete mineral nutrition coverage',
      'Save $19.98 versus buying individually',
      'Support for sleep, immunity, and energy',
      'Three months supply when taken as directed',
      'Convenient auto-delivery option available',
    ],
    in_stock: true,
  },
  {
    id: 'bundle-2',
    name: 'Sleep & Recovery Kit',
    slug: 'sleep-recovery-kit',
    description: 'Support restful sleep and muscle recovery',
    long_description: 'Our Sleep & Recovery Kit features Pure Magnesium Complex in a convenient two-month supply. This advanced magnesium formula combines three highly bioavailable forms to promote deep, restful sleep and support muscle recovery after exercise or daily activity.',
    price: 54.99,
    compare_at_price: 69.98,
    image_url: '/20260105_163742(0).jpg',
    gallery_images: ['/20260105_163329.jpg', '/20260110_145321(0).jpg'],
    featured: false,
    savings_amount: 14.99,
    items: ['1'],
    benefits: [
      'Two-month supply of Pure Magnesium Complex',
      'Save $14.99 versus buying monthly',
      'Supports healthy sleep patterns',
      'Aids muscle recovery and relaxation',
      'Easy auto-ship option for convenience',
    ],
    in_stock: true,
  },
];

export const articles = [
  {
    id: 'article-1',
    title: 'More Than NPK: Why Soil Systems Matter for the Future of Food',
    slug: 'more-than-npk-soil-systems',
    excerpt: 'Traditional fertilizers focus on NPK. Flora Bella focuses on the soil system that makes NPK work better—trace minerals, humic + fulvic acids, and biology from the ground up.',
    content: `## NPK is the standard — and it has limits

If you've spent any time around gardening or farming, you've heard the phrase "NPK." It's the shorthand most of the world uses to talk about plant nutrition—Nitrogen (N), Phosphorus (P), and Potassium (K).

And to be clear: NPK matters. It's essential. It's also measurable, easy to manufacture, and delivers fast visible results.

But here's what most people learn the hard way:

> NPK can feed a plant, but it doesn't necessarily rebuild the soil system that keeps plants thriving long-term.

NPK became the standard because it works well for industrial agriculture and lawns. It's a quick path to green growth and immediate response.

The limitation is that NPK alone doesn't address:

- Trace mineral availability
- Soil structure and water dynamics
- Nutrient retention and transport
- Biological activity in the root zone

That's not a critique of fertilizer. It's just the reality of how soil works.

Think of it like this: NPK is like protein powder. Useful — but not a complete diet.

## Soil isn't dirt. It's infrastructure.

When we talk about "soil health," we're not talking about something abstract or trendy. We're talking about the literal foundation of food production, landscaping, and long-term growing success.

Healthy soil behaves differently. It holds water differently. It supports roots differently. It delivers nutrients differently. It responds to stress differently.

That's why you can have two people using the same fertilizer program and still getting very different results.

Because the soil system underneath the program isn't the same.

## Why the Soil Food Web matters (Dr. Elaine's lens)

Dr. Elaine Ingham's Soil Food Web work helped bring a simple truth back into the mainstream:

> The soil is alive. Not metaphorically. Literally.

A functioning soil ecosystem includes bacteria, fungi, protozoa, nematodes, and a long list of microscopic partners that help regulate nutrient availability and root health.

When that biological system is supported, the soil becomes more resilient and efficient—meaning plants can access what they need with less stress and less volatility.

This is one of the biggest missing pieces in modern growing conversations: You can't "force" long-term plant performance without a stable soil ecosystem.

## The shift: from "feeding plants" to "supporting soil function"

Flora Bella was built around a systems-level idea:

Instead of focusing on a short list of macronutrients, we focus on supporting the soil conditions that influence how nutrients are absorbed and utilized.

That includes:

- Trace mineral diversity
- Soil structure and retention
- Nutrient transport
- Beneficial biology in the root zone

Because when soil functions well, plants don't need to be "pushed." They can do what they're designed to do.

## What Flora Bella is (plain English)

Flora Bella is a trace mineral–based soil system enhancer designed to support nutrient efficiency, soil stability, and long-term plant health.

It combines:

- 70+ trace minerals (nutritional depth beyond standard programs)
- Humic acid (soil structure + retention support)
- Fulvic acid (mineral transport support)
- Naturally occurring beneficial microbes (root zone support)

It's designed to work alongside fertilizer programs—not replace them.

## What to expect when you build soil first

Healthy soil isn't an overnight trick. It's a foundation.

Over time, soil systems supported with trace minerals, organic compounds, and biological activity often demonstrate:

- Improved nutrient availability
- Stronger root systems
- Greater stress tolerance
- More consistent growth and flowering
- Reduced nutrient loss over time

Results vary based on soil type, climate, and consistency—but the direction is the point.

## A simple place to start (without getting overwhelmed)

If you're new to thinking in "soil systems," start here:

- Stop chasing quick fixes.
- Support the foundation first.
- Build a routine you can repeat.

Because the best soil plan isn't the most complicated one. It's the one you can actually maintain.

If you want to learn more, we'll keep this simple and practical—no jargon, no hype, no overwhelm. Just better soil.`,
    featured_image: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Soil Education',
    tags: ['NPK', 'soil-health', 'trace-minerals', 'humic-acid', 'fulvic-acid', 'soil-biology', 'regenerative'],
    author_name: 'Flora Bella Team',
    author_image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    read_time: 7,
    featured: true,
    published: true,
    published_at: '2026-01-19T10:00:00Z',
    view_count: 0,
  },
  {
    id: 'article-2',
    title: 'Soil as a Resource Strategy: Building Resilience in a Resource-Constrained World',
    slug: 'soil-as-a-resource-strategy',
    excerpt: 'In a world of volatile inputs and strained resources, soil health is a resilience strategy. Learn how soil systems improve efficiency, stability, and long-term performance.',
    content: `## The quiet pressure: raw resources are becoming less predictable

Most people don't think about soil as a "resource strategy."

They think about it as a gardening topic. Or a farming topic. Or a niche sustainability conversation.

But the truth is bigger: Soil health is a stability issue. A resilience issue. A resource issue.

When soil function declines, dependency rises. And when dependency rises, costs and volatility follow.

Across industries, the world is feeling the pressure of resource constraints:

- Input costs fluctuate
- Supply chains are disrupted
- Quality becomes inconsistent
- Short-term fixes become long-term dependencies

Agriculture is not exempt from this. In many cases, it's at the center of it.

And while there are many moving parts, one factor keeps showing up as a leverage point: The condition of the soil system.

## Why soil health is a "resilience multiplier"

A resilient system is one that can absorb stress without collapsing.

In soil terms, that means:

- Better water dynamics
- Better nutrient retention
- Better biological activity in the root zone
- More consistent plant performance across variable conditions

When soil is depleted, everything becomes harder:

- You need more inputs to get the same response
- Nutrients leach faster
- Plants stress faster
- The margin for error disappears

So the question becomes: Are we building systems that require constant correction… or systems that improve over time?

## NPK is not the enemy — it's incomplete on its own

Traditional fertilizer programs focus on NPK because it's essential and measurable.

But NPK alone doesn't address:

- Micronutrient diversity
- Soil structure
- Nutrient transport
- Biological function in the root zone

And that's where the long-term opportunity lives.

Because soil function influences how efficiently plants can use whatever nutrients are already present.

> In a world where inputs are expensive and inconsistent, efficiency matters.

## The Soil Food Web perspective

Dr. Elaine's Soil Food Web framework is one of the most scalable ideas in agriculture because it isn't about hype.

It's about reality:

- Soil is an ecosystem
- Biology influences nutrient availability
- Root health depends on what's happening in the root zone

When biology is supported, soil becomes more stable. When soil becomes more stable, growing becomes less reactive.

That's not just "good farming." That's resource intelligence.

## The real sustainability question: can it scale?

A lot of sustainability messaging sounds good, but fails under pressure.

The standard isn't "does it sound ethical?" The standard is: Can it be sustained at scale without breaking people, budgets, or systems?

The best long-term strategies tend to share the same qualities:

- Reducing dependency
- Improving efficiency
- Building resilience
- Don't require constant emergency inputs

That's why soil system support matters. It's one of the few investments that can compound.

## Where Flora Bella fits

Flora Bella is designed as a soil system enhancer—built to support nutrient efficiency, soil stability, and long-term soil function.

It combines:

- 70+ trace minerals
- Humic + fulvic acids
- Naturally occurring beneficial microbes

It's designed to work alongside existing programs by supporting the soil conditions that influence nutrient absorption and utilization.

This is not about replacing everything you're doing. It's about strengthening what you're building on.

## Why this matters beyond gardens and farms

Soil health is not just a yield issue. It's connected to:

- Food stability
- Community resilience
- Sustainable land use
- Long-term affordability of growing
- Reduced nutrient loss and runoff over time

When soil works better, systems work better. And when systems work better, the future becomes less fragile.

## The simplest takeaway

If you're looking for the "big idea" behind regenerative and organic practices that actually scale, it's this:

> Support the soil system first.

Because when the foundation improves, everything above it becomes more stable.

That's not just good gardening. That's a resource strategy.`,
    featured_image: 'https://images.pexels.com/photos/4751285/pexels-photo-4751285.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Sustainability',
    tags: ['resilience', 'sustainability', 'regenerative-agriculture', 'soil-systems', 'supply-chain', 'soil-biology'],
    author_name: 'Flora Bella Team',
    author_image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    read_time: 8,
    featured: false,
    published: true,
    published_at: '2026-01-18T10:00:00Z',
    view_count: 0,
  },
  {
    id: 'article-3',
    title: 'What Is the Soil Food Web (and Why It Changes Everything)?',
    slug: 'what-is-the-soil-food-web',
    excerpt: 'The Soil Food Web is the living system beneath your plants. Learn how soil biology influences nutrient availability, root health, and long-term resilience.',
    content: `## What is the Soil Food Web?

If you've ever wondered why two gardens can get the same sunlight, the same fertilizer, and the same effort—yet produce completely different results…

You're not alone.

One of the most overlooked reasons is this: Soil is not just a place where plants sit. It's a living system that determines what plants can access.

That's where the Soil Food Web comes in.

The Soil Food Web is the biological ecosystem living in the soil—made up of organisms that interact with each other and with plant roots.

In simple terms: It's the network that helps convert nutrients into forms plants can use, supports root health, and influences resilience.

This concept is widely associated with Dr. Elaine Ingham, whose work helped bring soil biology back into the mainstream.

## The soil is alive (and that's good news)

A healthy soil system includes:

- Bacteria
- Fungi
- Protozoa
- Nematodes
- and many other organisms

These organisms don't exist "for fun." They exist because they perform functions.

They help:

- Cycle nutrients
- Improve soil structure
- Support root zone balance
- Reduce stress and disease pressure over time

When soil biology is functioning well, the soil becomes more efficient and stable.

## Why biology matters even if you're using fertilizer

This is the part many people miss.

Fertilizer can supply nutrients. But biology influences whether nutrients are:

- Retained in the root zone
- Transported efficiently
- Available at the right time
- Absorbed consistently

> That's why soil biology is not "extra." It's part of the operating system.

## "Feeding the plant" vs "building the soil system"

Most products in the market are designed to drive short-term response. They focus on macronutrients like NPK.

Flora Bella takes a different approach: We focus on supporting the soil system that makes nutrient programs work better.

Because when the soil system is weak, you can keep adding inputs—but performance stays inconsistent.

## What disrupts the Soil Food Web?

A few common disruptors include:

- Soil compaction and poor aeration
- Nutrient loss through leaching/runoff
- Depleted mineral diversity
- Harsh growing conditions without recovery time
- Programs that ignore the biology of the root zone

The result is often the same - plants become more dependent, soil becomes less resilient, and outcomes become harder to predict.

## How to support the Soil Food Web (practically)

Supporting soil biology doesn't have to be complicated.

The goal is to support the environment where biology thrives:

- Soil structure
- Water retention
- Mineral availability
- Organic compounds that help transport and retain nutrients
- Beneficial microbial habitat

This is why Flora Bella is built as a system:

- Humic acid supports soil structure and nutrient retention
- Fulvic acid supports mineral transport and uptake efficiency
- Beneficial microbes support root zone biology
- 70+ trace minerals provide nutritional depth beyond NPK

## The simplest way to think about it

If you want the cleanest mental model, here it is:

> Soil → Roots → Cells → Stems → Flowers
> Humic → Microbes → Fulvic → Minerals → Growth

A complete system that supports plants at every level—from soil structure to cellular uptake.

## Final takeaway

The Soil Food Web isn't a trend. It's a reminder.

Plants don't grow in isolation. They grow in relationship with the system beneath them.

If you want stronger plants, better resilience, and more consistent growth, the best place to start is not the leaves. It's the soil.

And if you want soil support that stays practical and grounded, that's exactly what we're building at Flora Bella.`,
    featured_image: 'https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Soil Education',
    tags: ['soil-food-web', 'dr-elaine-ingham', 'soil-biology', 'microbes', 'roots', 'rhizosphere'],
    author_name: 'Flora Bella Team',
    author_image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    read_time: 9,
    featured: false,
    published: true,
    published_at: '2026-01-17T10:00:00Z',
    view_count: 0,
  },
];

export const guides = [
  {
    id: 'guide-1',
    title: 'Getting Started with Minerals',
    slug: 'getting-started-minerals',
    description: 'A beginner-friendly guide to understanding and optimizing your mineral intake',
    estimated_time: '15 min',
    difficulty_level: 'beginner',
    published: true,
    order_index: 1,
  },
  {
    id: 'guide-2',
    title: 'Optimizing Mineral Absorption',
    slug: 'optimizing-mineral-absorption',
    description: 'Learn the best practices for maximizing mineral bioavailability',
    estimated_time: '20 min',
    difficulty_level: 'intermediate',
    published: true,
    order_index: 2,
  },
  {
    id: 'guide-3',
    title: 'Advanced Mineral Protocols',
    slug: 'advanced-mineral-protocols',
    description: 'Advanced strategies for experienced users looking to fine-tune their supplementation',
    estimated_time: '30 min',
    difficulty_level: 'advanced',
    published: true,
    order_index: 3,
  },
];

export const reviews = [
  {
    id: 'review-bio-1',
    product_id: 'bio-trace',
    author_name: 'Tom S.',
    rating: 5,
    title: 'My tomatoes have never looked better!',
    content: "I've been gardening for 20 years and this is hands down the best supplement I've used. My tomatoes are twice the size and the flavor is incredible. The plants look so healthy and vibrant!",
    verified_purchase: true,
    helpful_count: 45,
    approved: true,
    created_at: '2026-01-15T14:30:00Z',
  },
  {
    id: 'review-bio-2',
    product_id: 'bio-trace',
    author_name: 'Lisa M.',
    rating: 5,
    title: 'Transformed my raised beds',
    content: "My raised beds were getting tired after years of use. After using Bio Trace Mix for just one season, the soil is alive again! Plants are greener, yields are up 30%, and everything just looks healthier.",
    verified_purchase: true,
    helpful_count: 38,
    approved: true,
    created_at: '2026-01-12T09:20:00Z',
  },
  {
    id: 'review-bio-3',
    product_id: 'bio-trace',
    author_name: 'Robert K.',
    rating: 5,
    title: 'Professional quality for home gardens',
    content: "As a former commercial grower, I recognize quality when I see it. This is the same grade of trace minerals we used on the farm. My home garden has never produced like this!",
    verified_purchase: true,
    helpful_count: 52,
    approved: true,
    created_at: '2026-01-10T16:45:00Z',
  },
  {
    id: 'review-bio-4',
    product_id: 'bio-trace',
    author_name: 'Jennifer H.',
    rating: 5,
    title: 'Roses are stunning this year',
    content: "My roses have more blooms than ever and the colors are so much more vibrant. The stems are thicker too. I'll never garden without this again!",
    verified_purchase: true,
    helpful_count: 29,
    approved: true,
    created_at: '2026-01-08T11:15:00Z',
  },
  {
    id: 'review-1',
    product_id: '1',
    author_name: 'Jennifer M.',
    rating: 5,
    title: 'Life-changing supplement!',
    content: "I've struggled with sleep issues for years. After just two weeks of taking Pure Magnesium Complex, I'm sleeping through the night and waking up refreshed. The difference is remarkable!",
    verified_purchase: true,
    helpful_count: 24,
    approved: true,
    created_at: '2026-01-10T15:30:00Z',
  },
  {
    id: 'review-2',
    product_id: '1',
    author_name: 'Michael R.',
    rating: 5,
    title: 'Great quality',
    content: "I've tried many magnesium supplements and this is by far the best. No digestive issues and I can really feel the difference in my energy levels and muscle recovery.",
    verified_purchase: true,
    helpful_count: 18,
    approved: true,
    created_at: '2026-01-08T10:20:00Z',
  },
  {
    id: 'review-3',
    product_id: '2',
    author_name: 'Sarah K.',
    rating: 5,
    title: 'Immune system boost',
    content: "Since starting the Essential Zinc Formula, I haven't gotten sick once this season. My skin also looks clearer and healthier. Highly recommend!",
    verified_purchase: true,
    helpful_count: 31,
    approved: true,
    created_at: '2026-01-14T09:45:00Z',
  },
  {
    id: 'review-4',
    product_id: '2',
    author_name: 'David L.',
    rating: 4,
    title: 'Very effective',
    content: "Excellent zinc supplement. I take it daily and have noticed improvements in my overall health. Only wish it came in a larger bottle!",
    verified_purchase: true,
    helpful_count: 12,
    approved: true,
    created_at: '2026-01-12T14:15:00Z',
  },
];

export const faqs = [
  {
    id: 'faq-bio-1',
    product_id: 'bio-trace',
    question: 'Can I use Bio Trace Mix with my existing fertilizers?',
    answer: 'Absolutely! Bio Trace Mix is designed to enhance your current fertilizer program, not replace it. The trace minerals help unlock nutrients already in your soil and make your fertilizers more effective.',
    order_index: 1,
  },
  {
    id: 'faq-bio-2',
    product_id: 'bio-trace',
    question: 'Is this safe for edible plants?',
    answer: 'Yes! Bio Trace Mix is completely safe for all edible plants including vegetables, herbs, and fruits. It actually improves the flavor and nutritional content of food crops.',
    order_index: 2,
  },
  {
    id: 'faq-bio-3',
    product_id: 'bio-trace',
    question: 'How often should I apply it?',
    answer: 'For best results, add Bio Trace Mix to your regular watering schedule. Most gardeners apply it once per week during the growing season. You can adjust frequency based on your plants needs.',
    order_index: 3,
  },
  {
    id: 'faq-bio-4',
    product_id: 'bio-trace',
    question: 'Will this work in containers and raised beds?',
    answer: 'Yes! Bio Trace Mix works excellently in containers, raised beds, in-ground gardens, and even hydroponics. It is especially beneficial in containers where soil can become depleted more quickly.',
    order_index: 4,
  },
  // {
  //   id: 'faq-1',
  //   product_id: '1',
  //   question: 'When is the best time to take this magnesium supplement?',
  //   answer: 'We recommend taking Pure Magnesium Complex in the evening with dinner or before bed. Magnesium promotes relaxation and can support better sleep quality, making evening the ideal time for most people.',
  //   order_index: 1,
  // },
  // {
  //   id: 'faq-2',
  //   product_id: '1',
  //   question: 'Is this supplement vegan-friendly?',
  //   answer: 'Yes! Pure Magnesium Complex is 100% vegan. Our capsules are made from plant-based cellulose and contain no animal-derived ingredients.',
  //   order_index: 2,
  // },
  // {
  //   id: 'faq-3',
  //   product_id: '1',
  //   question: 'Can I take this with other supplements?',
  //   answer: "Magnesium generally combines well with most supplements. However, for optimal absorption, we recommend taking it at least 2 hours apart from calcium supplements or high-calcium foods. If you're on any medications, please consult your healthcare provider.",
  //   order_index: 3,
  // },
  // {
  //   id: 'faq-4',
  //   product_id: '2',
  //   question: 'Why does this formula include copper?',
  //   answer: 'Zinc and copper work together in the body and need to be balanced. Taking zinc alone can deplete copper levels over time. We include the optimal ratio of copper to prevent this and ensure both minerals work synergistically.',
  //   order_index: 1,
  // },
];
