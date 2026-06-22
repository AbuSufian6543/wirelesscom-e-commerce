import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Store Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  const categories = [
    {
      name: "Business Radios",
      slug: "business-radios",
      description: "Compact, simple, and reliable radios for customer-facing teams.",
    },
    {
      name: "Commercial Radios",
      slug: "commercial-radios",
      description: "Durable radios with extended range for demanding environments.",
    },
    {
      name: "Professional Radios",
      slug: "professional-radios",
      description: "Professional-grade MOTOTRBO radios with advanced features.",
    },
    {
      name: "Nationwide Radios",
      slug: "nationwide-radios",
      description: "PoC LTE + Wi-Fi radios with unlimited nationwide range.",
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Earpieces, microphones, holsters, and more.",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const industries = [
    { name: "Schools", slug: "schools", description: "Campus-wide communication for safety and logistics." },
    { name: "Security", slug: "security", description: "Instant PTT for patrols and incident response." },
    { name: "Retail Stores", slug: "retail", description: "Compact radios for floor coordination." },
    { name: "Construction", slug: "construction", description: "Rugged radios built for active job sites." },
    { name: "Hospitality", slug: "hospitality", description: "Discreet radios for hotels and restaurants." },
    { name: "Healthcare", slug: "healthcare", description: "Reliable communication for care teams." },
  ];

  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: industry,
      create: industry,
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );
  const industryMap = Object.fromEntries(
    (await prisma.industry.findMany()).map((i) => [i.slug, i.id]),
  );

  const products = [
    {
      name: "Motorola R7 Digital Two-Way Radio",
      slug: "motorola-r7-digital-radio",
      brand: "Motorola",
      description:
        "Professional-grade MOTOTRBO radio engineered for maximum audio clarity, resilience, and expandability. Ideal for security, manufacturing, and large campuses.",
      shortDescription: "Advanced digital radio with superior audio clarity.",
      images: ["/placeholder-product.svg"],
      status: "ACTIVE" as const,
      isNewArrival: true,
      isBestSeller: true,
      priceCadCents: 129900,
      priceUsdCents: 99900,
      saleCadCents: null,
      saleUsdCents: null,
      hasVariants: true,
      categories: ["professional-radios"],
      industries: ["security", "construction"],
      options: [{ name: "Display", values: ["Non-Display", "With Display"] }],
      variants: [
        { sku: "R7-ND", stock: 25, options: ["Non-Display"] },
        { sku: "R7-D", stock: 18, options: ["With Display"], priceCadCents: 139900, priceUsdCents: 107900 },
      ],
    },
    {
      name: "Motorola R5 Digital Two-Way Radio",
      slug: "motorola-r5-digital-radio",
      brand: "Motorola",
      description:
        "Reliable digital radio with excellent battery life and loud, clear audio for everyday business communication.",
      shortDescription: "Reliable digital radio for everyday business use.",
      images: ["/placeholder-product.svg"],
      status: "ACTIVE" as const,
      isNewArrival: true,
      isBestSeller: true,
      priceCadCents: 89900,
      priceUsdCents: 69900,
      hasVariants: false,
      categories: ["commercial-radios"],
      industries: ["retail", "hospitality"],
    },
    {
      name: "Motorola TLK110 Nationwide Radio",
      slug: "motorola-tlk110-radio",
      brand: "Motorola",
      description:
        "Nationwide PoC LTE radio with instant PTT, centralized management, and zero range anxiety. Perfect for distributed teams.",
      shortDescription: "Nationwide LTE PoC radio with unlimited range.",
      images: ["/placeholder-product.svg"],
      status: "ACTIVE" as const,
      isNewArrival: false,
      isBestSeller: true,
      priceCadCents: 54900,
      priceUsdCents: 40000,
      saleCadCents: 49900,
      saleUsdCents: 35000,
      hasVariants: false,
      categories: ["nationwide-radios"],
      industries: ["construction", "security"],
    },
    {
      name: "Motorola CLPe Business Radio",
      slug: "motorola-clpe-business-radio",
      brand: "Motorola",
      description:
        "Ultra-compact business radio designed for discreet, all-day communication in retail and hospitality environments.",
      shortDescription: "Ultra-compact radio for retail and hospitality.",
      images: ["/placeholder-product.svg"],
      status: "ACTIVE" as const,
      isNewArrival: false,
      isBestSeller: false,
      priceCadCents: 29590,
      priceUsdCents: 25200,
      hasVariants: false,
      categories: ["business-radios"],
      industries: ["retail", "hospitality"],
    },
    {
      name: "PMLN8077 Swivel Earpiece with PTT",
      slug: "pmln8077-swivel-earpiece",
      brand: "Motorola",
      description:
        "Comfortable swivel earpiece with inline push-to-talk button. Compatible with a wide range of Motorola radios.",
      shortDescription: "Swivel earpiece with inline PTT button.",
      images: ["/placeholder-product.svg"],
      status: "ACTIVE" as const,
      isNewArrival: false,
      isBestSeller: true,
      priceCadCents: 3970,
      priceUsdCents: 3000,
      saleCadCents: 3000,
      saleUsdCents: 2500,
      hasVariants: false,
      categories: ["accessories"],
      industries: ["security", "retail"],
    },
    {
      name: "HALO Smart Sensor 3C",
      slug: "halo-smart-sensor-3c",
      brand: "HALO",
      description:
        "Enhanced air quality, security, and environmental monitoring for modern spaces. Integrates with your communication workflows.",
      shortDescription: "Air quality and environmental monitoring sensor.",
      images: ["/placeholder-product.svg"],
      status: "ACTIVE" as const,
      isNewArrival: true,
      isBestSeller: false,
      priceCadCents: 129500,
      priceUsdCents: 119100,
      saleCadCents: 119100,
      saleUsdCents: 109500,
      hasVariants: false,
      categories: ["accessories"],
      industries: ["healthcare", "schools"],
    },
  ];

  for (const productData of products) {
    const { categories: catSlugs, industries: indSlugs, options, variants, ...productFields } =
      productData;

    const product = await prisma.product.upsert({
      where: { slug: productFields.slug },
      update: productFields,
      create: productFields,
    });

    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    await prisma.productIndustry.deleteMany({ where: { productId: product.id } });

    await prisma.productCategory.createMany({
      data: catSlugs.map((slug) => ({
        productId: product.id,
        categoryId: categoryMap[slug],
      })),
    });

    await prisma.productIndustry.createMany({
      data: indSlugs.map((slug) => ({
        productId: product.id,
        industryId: industryMap[slug],
      })),
    });

    if (options?.length) {
      await prisma.productOption.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });

      for (const option of options) {
        const createdOption = await prisma.productOption.create({
          data: {
            productId: product.id,
            name: option.name,
            values: {
              create: option.values.map((value, index) => ({ value, position: index })),
            },
          },
          include: { values: true },
        });

        if (variants?.length) {
          for (const variant of variants) {
            const optionValue = createdOption.values.find((v) =>
              variant.options.includes(v.value),
            );
            if (!optionValue) continue;

            await prisma.productVariant.create({
              data: {
                productId: product.id,
                sku: variant.sku,
                stock: variant.stock,
                priceCadCents: variant.priceCadCents ?? null,
                priceUsdCents: variant.priceUsdCents ?? null,
                options: {
                  create: [{ optionValueId: optionValue.id }],
                },
              },
            });
          }
        }
      }
    }
  }

  const reviews = [
    {
      author: "Jessica Chapman",
      content:
        "Great radios at a reasonable price, and they shipped quickly! The team helped me pick the right model for our warehouse.",
      rating: 5,
      featured: true,
    },
    {
      author: "Eric M.",
      content:
        "Amazing customer service! Great product and fast response. I'm a repeat customer time and time again.",
      rating: 5,
      featured: true,
    },
    {
      author: "Director of Operations",
      content:
        "We have been working with this team since 2017, and they always come through with great communication solutions.",
      rating: 5,
      featured: true,
    },
    {
      author: "Matt A.",
      content:
        "Bought these for my team across multiple locations. Nationwide coverage with no monthly fees is a game changer.",
      rating: 5,
      featured: true,
    },
  ];

  await prisma.review.deleteMany({ where: { featured: true } });
  await prisma.review.createMany({ data: reviews });

  console.log("Seed completed successfully.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
