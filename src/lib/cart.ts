import { cookies } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";

export const GUEST_CART_COOKIE = "guest_cart_id";

export async function getOrCreateCart() {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user?.id) {
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
            variant: {
              include: {
                options: {
                  include: { optionValue: { include: { option: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;
      if (guestId) {
        const guestCart = await prisma.cart.findUnique({
          where: { guestId },
          include: { items: true },
        });

        if (guestCart) {
          cart = await prisma.cart.update({
            where: { id: guestCart.id },
            data: { userId: session.user.id, guestId: null },
            include: {
              items: {
                include: {
                  product: true,
                  variant: {
                    include: {
                      options: {
                        include: { optionValue: { include: { option: true } } },
                      },
                    },
                  },
                },
              },
            },
          });
          cookieStore.delete(GUEST_CART_COOKIE);
        }
      }

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: session.user.id },
          include: {
            items: {
              include: {
                product: true,
                variant: {
                  include: {
                    options: {
                      include: { optionValue: { include: { option: true } } },
                    },
                  },
                },
              },
            },
          },
        });
      }
    }

    return cart;
  }

  let guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (!guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set(GUEST_CART_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  let cart = await prisma.cart.findUnique({
    where: { guestId },
    include: {
      items: {
        include: {
          product: true,
          variant: {
            include: {
              options: {
                include: { optionValue: { include: { option: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { guestId },
      include: {
        items: {
          include: {
            product: true,
            variant: {
              include: {
                options: {
                  include: { optionValue: { include: { option: true } } },
                },
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

export function getVariantLabel(
  variant: {
    options: Array<{
      optionValue: { value: string; option: { name: string } };
    }>;
  } | null,
) {
  if (!variant?.options.length) return null;
  return variant.options
    .map((o) => `${o.optionValue.option.name}: ${o.optionValue.value}`)
    .join(" / ");
}
